package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"os"
	"os/user"
	"path/filepath"
	"sort"
	"sync"
	"time"

	"github.com/taigrr/apple-silicon-accelerometer/detector"
	"github.com/taigrr/apple-silicon-accelerometer/sensor"
	"github.com/taigrr/apple-silicon-accelerometer/shm"
	"nhooyr.io/websocket"
)

var (
	port             = flag.Int("port", 8787, "Port to run the WebSocket server on")
	minAmpFlag       = flag.Float64("min-amplitude", 0, "Minimum amplitude to trigger a hit")
	cooldownMs       = flag.Int("cooldown-ms", 750, "Cooldown in milliseconds between hits")
	tokenFlag        = flag.String("token", "", "Token for WebSocket connection")
	autocalibrateFlag = flag.Bool("autocalibrate", true, "Enable autocalibration")
	debug            = flag.Bool("debug", false, "Enable verbose logging")

	clients   = make(map[*websocket.Conn]bool)
	clientsMu sync.Mutex
	token     string

	minAmplitude = 0.35 // Default threshold if not auto-calibrated
)

type HitEvent struct {
	Type        string  `json:"type"`
	TimeUnixMs  int64   `json:"time_unix_ms"`
	Amplitude   float64 `json:"amplitude"`
	Severity    string  `json:"severity"`
	Source      string  `json:"source"`
}

func main() {
	flag.Parse()

	// 1. Handle Token
	initToken()

	// 2. Setup WebSocket server
	mux := http.NewServeMux()
	mux.HandleFunc("/ws", handleWebSocket)

	serverAddr := fmt.Sprintf("127.0.0.1:%d", *port)
	go func() {
		log.Printf("Listening on ws://%s/ws?token=%s", serverAddr, token)
		if err := http.ListenAndServe(serverAddr, mux); err != nil {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	// 3. Accelerometer reading setup
	det := detector.New()
	accelRing := shm.CreateRing(shm.NameAccel)
	go func() {
		if err := sensor.Run(sensor.Config{AccelRing: accelRing, Restarts: 0}); err != nil {
			log.Printf("Sensor worker exited: %v", err)
		}
	}()

	// 4. Hit detection Loop
	log.Println("Starting accelerometer detection loop...")
	var lastTotal uint64
	var lastHitTime time.Time

	// Auto-calibration state
	calibrationEndTime := time.Now().Add(8 * time.Second)
	var noiseSamples []float64

	if *minAmpFlag > 0 {
		minAmplitude = *minAmpFlag
		*autocalibrateFlag = false
		log.Printf("Using manual min-amplitude: %.4f", minAmplitude)
	}

	for {
		samples, newTotal := accelRing.ReadNew(lastTotal, shm.AccelScale)
		lastTotal = newTotal

		for _, s := range samples {
			det.Process(s.X, s.Y, s.Z, s.T)
		}

		if len(det.Events) > 0 {
			event := det.Events[len(det.Events)-1]
			amp := event.Amplitude
			det.Events = nil // Clear events after taking the latest

			if *autocalibrateFlag && time.Now().Before(calibrationEndTime) {
				noiseSamples = append(noiseSamples, amp)
				if *debug && len(noiseSamples)%100 == 0 {
					log.Printf("Calibrating... collected %d samples", len(noiseSamples))
				}
				continue
			} else if *autocalibrateFlag && len(noiseSamples) > 0 {
				log.Println("Calibration complete. Processing baseline...")
				minAmplitude = calculateThreshold(noiseSamples)
				noiseSamples = nil
				log.Printf("Auto-calibrated threshold: %.4f", minAmplitude)
			}

			// Cooldown check
			if time.Since(lastHitTime).Milliseconds() < int64(*cooldownMs) {
				continue
			}

			if amp >= minAmplitude {
				lastHitTime = time.Now()

				severity := event.Severity.String()
				if severity == "" || severity == "Unknown" {
					if amp < 0.35 {
						severity = "light"
					} else if amp < 0.7 {
						severity = "medium"
					} else {
						severity = "heavy"
					}
				} else {
					// Map native severity to our string
					if event.Severity == detector.Light {
						severity = "light"
					} else if event.Severity == detector.Medium {
						severity = "medium"
					} else {
						severity = "heavy"
					}
				}

				hit := HitEvent{
					Type:       "hit",
					TimeUnixMs: time.Now().UnixNano() / 1e6,
					Amplitude:  amp,
					Severity:   severity,
					Source:     "mac-accelerometer",
				}

				if *debug {
					log.Printf("HIT! Amp: %.4f, Sev: %s", hit.Amplitude, hit.Severity)
				}

				broadcast(hit)
			}
		}

		time.Sleep(10 * time.Millisecond)
	}
}

func initToken() {
	if *tokenFlag != "" {
		token = *tokenFlag
		return
	}

	usr, err := user.Current()
	if err != nil {
		log.Fatalf("Could not get current user: %v", err)
	}

	tokenPath := filepath.Join(usr.HomeDir, ".hit-bridge-token")
	data, err := ioutil.ReadFile(tokenPath)
	if err == nil && len(data) > 0 {
		token = string(data)
	} else {
		bytes := make([]byte, 16)
		if _, err := rand.Read(bytes); err != nil {
			log.Fatalf("Failed to generate token: %v", err)
		}
		token = hex.EncodeToString(bytes)
		if err := ioutil.WriteFile(tokenPath, []byte(token), 0600); err != nil {
			log.Fatalf("Failed to write token file: %v", err)
		}
	}
	fmt.Printf("==================================================\n")
	fmt.Printf("HIT BRIDGE TOKEN: %s\n", token)
	fmt.Printf("Instructions: Open your site and paste this token if requested.\n")
	fmt.Printf("==================================================\n")
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	queryToken := r.URL.Query().Get("token")
	if queryToken != token {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	c, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: true,
		OriginPatterns: []string{"localhost:*", "127.0.0.1:*"},
	})
	if err != nil {
		log.Printf("WS accept error: %v", err)
		return
	}
	defer c.Close(websocket.StatusInternalError, "internal error")

	clientsMu.Lock()
	clients[c] = true
	clientsMu.Unlock()

	log.Printf("Client connected")

	// Keep alive loop
	for {
		_, _, err := c.Read(r.Context())
		if err != nil {
			clientsMu.Lock()
			delete(clients, c)
			clientsMu.Unlock()
			log.Printf("Client disconnected: %v", err)
			break
		}
	}
}

func broadcast(event HitEvent) {
	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("Marshal error: %v", err)
		return
	}

	clientsMu.Lock()
	defer clientsMu.Unlock()

	for c := range clients {
		err := c.Write(context.Background(), websocket.MessageText, data)
		if err != nil {
			log.Printf("Write error: %v", err)
			c.Close(websocket.StatusInternalError, "write error")
			delete(clients, c)
		}
	}
}

func calculateThreshold(samples []float64) float64 {
	if len(samples) == 0 {
		return 0.35
	}
	sort.Float64s(samples)
	median := samples[len(samples)/2]

	var deviations []float64
	for _, s := range samples {
		deviations = append(deviations, math.Abs(s-median))
	}
	sort.Float64s(deviations)
	mad := deviations[len(deviations)/2]

	threshold := median + 6*mad
	if threshold < 0.15 {
		threshold = 0.15 // Absolute minimum floor
	}
	return threshold
}
