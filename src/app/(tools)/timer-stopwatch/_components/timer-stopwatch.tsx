
'use client';

import { useState, useEffect, useRef, useCallback, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Timer, Clock, Play, Pause, RotateCcw, Flag, Volume2, VolumeX, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

// --- Helper Functions ---

const formatStopwatch = (time: number) => {
  const milliseconds = `0${Math.floor((time % 1000) / 10)}`.slice(-2);
  const seconds = `0${Math.floor(time / 1000) % 60}`.slice(-2);
  const minutes = `0${Math.floor(time / 60000) % 60}`.slice(-2);
  const hours = `0${Math.floor(time / 3600000)}`.slice(-2);
  return { hours, minutes, seconds, milliseconds };
};

const formatTimer = (timeInSeconds: number) => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;
  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  };
}

// --- Stopwatch Component ---

function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLapTime = laps.reduce((acc, lap) => acc + lap, 0);
  const currentLapTime = time - lastLapTime;

  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now() - time;
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTime);
      }, 10);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, time]);

  const handleStartPause = () => setIsRunning(prev => !prev);

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (!isRunning) return;
    const lastTotal = laps.reduce((acc, lap) => acc + lap, 0);
    const newLap = time - lastTotal;
    setLaps(prev => [...prev, newLap]);
  };

  const { hours, minutes, seconds, milliseconds } = formatStopwatch(time);
  const { hours: cH, minutes: cM, seconds: cS, milliseconds: cMs } = formatStopwatch(currentLapTime);

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 space-y-8 min-h-[450px]">
      <div className="font-mono text-center relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 288 288">
          <circle
            cx="144"
            cy="144"
            r="124"
            strokeWidth="20"
            className="stroke-gray-700/50"
            fill="transparent"
          />
        </svg>
        <div className="relative">
          <div className="text-3xl md:text-4xl font-bold tracking-tighter">
            <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
          </div>
          <div className="text-base md:text-lg text-cyan-400">.{milliseconds}</div>
        </div>
      </div>

      {laps.length > 0 && (
        <div className="text-lg md:text-xl text-muted-foreground font-mono">
          Lap {laps.length + 1}: {cH}:{cM}:{cS}.{cMs}
        </div>
      )}

      <div className="flex justify-center items-center gap-4 w-full">
        <Button onClick={handleReset} variant="ghost" size="icon" className="w-16 h-16 rounded-full bg-black/30 hover:bg-black/50 text-muted-foreground">
          <RotateCcw />
        </Button>
        <Button onClick={handleStartPause} size="lg" className="w-40 h-16 rounded-full bg-cyan-500/90 hover:bg-cyan-500 text-cyan-950 text-xl font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-300">
          {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={handleLap} variant="ghost" size="icon" disabled={!isRunning} className="w-16 h-16 rounded-full bg-black/30 hover:bg-black/50 text-muted-foreground disabled:opacity-50">
          <Flag />
        </Button>
      </div>

      {laps.length > 0 && (
        <ScrollArea className="h-32 w-full max-w-sm">
          <ul className="p-2 space-y-1">
            {[...laps].reverse().map((lap, index) => {
              const { hours, minutes, seconds, milliseconds } = formatStopwatch(lap);
              return (
                <li key={laps.length - index} className="flex justify-between p-2 rounded-md even:bg-white/5 text-sm font-mono">
                  <span>Lap {laps.length - index}</span>
                  <span>{hours}:{minutes}:{seconds}.{milliseconds}</span>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
}

// --- Timer Component ---

function CountdownTimer() {
  const [totalSeconds, setTotalSeconds] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isEditing, setIsEditing] = useState<null | 'h' | 'm' | 's'>(null);
  const [hasFinished, setHasFinished] = useState(false);

  const alarmAudioRef = useRef<HTMLAudioElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const stopSound = useCallback(() => {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }
  }, []);

  const playAlarm = useCallback(() => {
    if (isMuted || !alarmAudioRef.current) return;
    alarmAudioRef.current.currentTime = 0;
    alarmAudioRef.current.play().catch(error => {
      console.error("Audio playback failed:", error);
      toast({
        title: "Could not play sound",
        description: "Your browser may be blocking audio playback.",
        variant: "destructive"
      });
    });
  }, [isMuted, toast]);

  const setTimerDuration = (seconds: number) => {
    setIsRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const clampedSeconds = Math.min(seconds, 359999); // 99:59:59
    setTotalSeconds(clampedSeconds);
    setTimeLeft(clampedSeconds);
    stopSound();
    setHasFinished(false);
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && isRunning) {
      setIsRunning(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      toast({ title: "Timer Finished!", description: "Your countdown is complete." });
      playAlarm();
      setTimeLeft(0);
      setHasFinished(true);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRunning, timeLeft, toast, playAlarm]);

  const handleStartPause = () => {
    // If the timer is currently running, we pause it.
    if (isRunning) {
      setIsRunning(false);
      // The useEffect hook will handle clearing the interval.
      return;
    }

    // If the timer is not running and there's time left, we start it.
    if (timeLeft > 0) {
      // This "start" action is a user gesture. We can use it to unlock the browser's audio context.
      // We attempt to play the audio. If it succeeds, we pause it immediately.
      // This makes the browser trust us to play audio programmatically later.
      if (alarmAudioRef.current?.paused) {
        const playPromise = alarmAudioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            alarmAudioRef.current?.pause();
          }).catch(error => {
            // This is expected if browser policies are strict.
            // The user will see the toast if the final alarm fails.
            console.warn("Audio context unlock failed. Alarm may be blocked.", error);
          });
        }
      }
      setHasFinished(false);
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalSeconds);
    stopSound();
    setHasFinished(false);
  };

  const handleTimeInputChange = (e: ChangeEvent<HTMLInputElement>, unit: 'h' | 'm' | 's') => {
    const value = Math.max(0, parseInt(e.target.value, 10) || 0);

    const { hours, minutes, seconds } = formatTimer(timeLeft);

    let newHours = parseInt(hours);
    let newMinutes = parseInt(minutes);
    let newSeconds = parseInt(seconds);

    if (unit === 'h') newHours = value;
    if (unit === 'm') newMinutes = value;
    if (unit === 's') newSeconds = value;

    const newTotalSeconds = newHours * 3600 + newMinutes * 60 + newSeconds;
    setTimerDuration(newTotalSeconds);
  }

  const handleEditBlur = () => {
    setIsEditing(null);
  }

  const presets = [
    { label: '1m', seconds: 60 },
    { label: '5m', seconds: 300 },
    { label: '10m', seconds: 600 },
    { label: '25m', seconds: 1500 },
  ];

  const { hours, minutes, seconds } = formatTimer(timeLeft);
  const progress = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;
  const circumference = 2 * Math.PI * 124; // r=124
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const isFinished = hasFinished && !isRunning;

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 space-y-6 md:space-y-8 min-h-[450px]">
      <audio ref={alarmAudioRef} src="/audio/musical-chiptune-alarm-clock-112869.mp3" preload="none" loop />
      <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 288 288">
          <circle
            cx="144"
            cy="144"
            r="124"
            strokeWidth="20"
            className="stroke-gray-700/50"
            fill="transparent"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <circle
            cx="144"
            cy="144"
            r="124"
            strokeWidth="20"
            strokeLinecap="round"
            stroke="url(#progressGradient)"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-linear opacity-70"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="font-mono text-3xl md:text-4xl font-bold tracking-tighter flex items-center justify-center">
            {isEditing === 'h' ? (
              <Input type="number" min="0" max="99" value={hours} onChange={(e) => handleTimeInputChange(e, 'h')} onBlur={handleEditBlur} autoFocus className="w-10 h-10 md:w-12 md:h-12 text-center bg-transparent border-0 text-3xl md:text-4xl shadow-none focus-visible:ring-0 p-0" />
            ) : <span onClick={() => setIsEditing('h')} className="w-10 md:w-12 cursor-pointer">{hours}</span>}
            :
            {isEditing === 'm' ? (
              <Input type="number" min="0" max="59" value={minutes} onChange={(e) => handleTimeInputChange(e, 'm')} onBlur={handleEditBlur} autoFocus className="w-10 h-10 md:w-12 md:h-12 text-center bg-transparent border-0 text-3xl md:text-4xl shadow-none focus-visible:ring-0 p-0" />
            ) : <span onClick={() => setIsEditing('m')} className="w-10 md:w-12 cursor-pointer">{minutes}</span>}
            :
            {isEditing === 's' ? (
              <Input type="number" min="0" max="59" value={seconds} onChange={(e) => handleTimeInputChange(e, 's')} onBlur={handleEditBlur} autoFocus className="w-10 h-10 md:w-12 md:h-12 text-center bg-transparent border-0 text-3xl md:text-4xl shadow-none focus-visible:ring-0 p-0" />
            ) : <span onClick={() => setIsEditing('s')} className="w-10 md:w-12 cursor-pointer">{seconds}</span>}
          </div>
          <div className="flex justify-center gap-2 text-xs text-muted-foreground mt-1">
            <span className="w-10 md:w-12 text-center">Hours</span>
            <span className="w-10 md:w-12 text-center">Minutes</span>
            <span className="w-10 md:w-12 text-center">Seconds</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {presets.map(preset => (
          <Button key={preset.label} onClick={() => setTimerDuration(preset.seconds)} variant="ghost" className={cn("rounded-full bg-black/20 hover:bg-black/40 text-muted-foreground", totalSeconds === preset.seconds && !isRunning && "bg-cyan-500/20 text-cyan-300")}>
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="flex justify-center items-center gap-4 w-full">
        <Button onClick={handleReset} variant="ghost" size="icon" className="w-16 h-16 rounded-full bg-black/30 hover:bg-black/50 text-muted-foreground">
          <RotateCcw />
        </Button>
        <Button
          onClick={isFinished ? handleReset : handleStartPause}
          size="lg"
          className={cn(
            "w-40 h-16 rounded-full text-xl font-bold shadow-lg transition-all duration-300",
            isFinished
              ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20 hover:shadow-red-500/30"
              : "bg-cyan-500/90 hover:bg-cyan-500 text-cyan-950 shadow-cyan-500/20 hover:shadow-cyan-500/30"
          )}
        >
          {isFinished ? (
            <><BellOff className="mr-2" /> Stop</>
          ) : isRunning ? (
            <><Pause className="mr-2" /> Pause</>
          ) : (
            <><Play className="mr-2" /> Start</>
          )}
        </Button>
        <Button onClick={() => setIsMuted(p => !p)} variant="ghost" size="icon" className="w-16 h-16 rounded-full bg-black/30 hover:bg-black/50 text-muted-foreground">
          {isMuted ? <VolumeX /> : <Volume2 />}
        </Button>
      </div>
    </div>
  );
}


export default function TimerStopwatch() {
  return (
    <div className="w-full">
      <Card className="w-full bg-card/30 backdrop-blur-lg border-border/20 shadow-xl shadow-cyan-500/5 rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl md:text-2xl"><Timer /> Timer &amp; Stopwatch</CardTitle>
          <CardDescription>A simple and modern tool for tracking time, with laps and a visual countdown.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <Tabs defaultValue="timer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-full">
              <TabsTrigger value="stopwatch" className="rounded-full flex gap-2"><Clock className="w-4 h-4" />Stopwatch</TabsTrigger>
              <TabsTrigger value="timer" className="rounded-full flex gap-2"><Timer className="w-4 h-4" />Timer</TabsTrigger>
            </TabsList>
            <TabsContent value="stopwatch">
              <Stopwatch />
            </TabsContent>
            <TabsContent value="timer">
              <CountdownTimer />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
