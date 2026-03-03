# Hit Bridge (Native macOS Accelerometer Helper)

This is a local bridge application for Apple Silicon Macs to detect hits/knocks on the lapto/device utilizing the accelerometer and broadcast them via WebSocket.

## Prerequisites
- macOS on Apple Silicon (M1/M2/M3)
- Go 1.21+ installed

## Setup & Build
1. Navigate to this directory in your terminal:
   ```bash
   cd hit-bridge
   ```
2. Initialize and download dependencies:
   ```bash
   go mod tidy
   ```
3. Build the binary:
   ```bash
   go build -o hit-bridge .
   ```

## Running the Helper
The Apple Silicon accelerometer requires low-level IOKit sensor access, which means the helper needs to be run with `sudo`:

```bash
sudo ./hit-bridge --autocalibrate
```

### Options
- `--port` (default: 8787): Port to run the WebSocket server on.
- `--min-amplitude`: Minimum amplitude to trigger a hit (overrides autocalibration).
- `--cooldown-ms` (default: 750): Cooldown in milliseconds between hits to avoid double-triggering.
- `--token`: Override the automatically generated security token.
- `--autocalibrate` (default: true): Enable auto-calibration for the first 8 seconds to measure baseline noise noise.
- `--debug`: Enable raw event info logging.

## Security
For security, a random token is generated and saved to `~/.hit-bridge-token` on first run. The bridge only listens on `127.0.0.1`. The token must be provided via the `?token=` parameter when establishing a WebSocket connection from the browser.

## Troubleshooting
- **No hits detected?**: Ensure you are running with `sudo`. The IOKit API will silently fail or return zeros without `sudo` access in some contexts.
- **Triggering too easily?**: Try disabling autocalibrate and setting a manual threshold: `sudo ./hit-bridge --autocalibrate=false --min-amplitude=0.5`
- **Compiler errors?**: Ensure you have a recent version of Go installed. Ensure you are building on a Mac (darwin/arm64).
