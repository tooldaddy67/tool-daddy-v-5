'use client';

import { useState, useEffect } from 'react';
import { useAuthUserRole } from '@/hooks/use-auth-role';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tv2 } from 'lucide-react';
import { FUN_FACTS_AND_JOKES } from '@/lib/fun-facts';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdFinish: () => void;
  title: string;
  duration?: number;
}

export default function AdModal({ isOpen, onClose, onAdFinish, title, duration = 10 }: AdModalProps) {
  const [adProgress, setAdProgress] = useState(0);
  const [countdown, setCountdown] = useState(duration);
  const [funFact, setFunFact] = useState('');
  const userRole = useAuthUserRole();
  if (userRole === 'unstablegng') return null;

  useEffect(() => {
    if (!isOpen) {
      setAdProgress(0); // Reset progress when closed
      return;
    }

    setFunFact(FUN_FACTS_AND_JOKES[Math.floor(Math.random() * FUN_FACTS_AND_JOKES.length)]);
    setCountdown(duration);

    // Reset progress to 0, then schedule the animation to start.
    // This ensures the "empty" state is rendered before the animation begins.
    setAdProgress(0);
    const animationTimer = setTimeout(() => {
      setAdProgress(100);
    }, 50);

    const countdownTimer = setInterval(() => {
      setCountdown(prev => Math.max(prev - 1, 0));
    }, 1000);

    const finishTimer = setTimeout(() => {
      onAdFinish();
    }, duration * 1000);

    return () => {
      clearInterval(countdownTimer);
      clearTimeout(finishTimer);
      clearTimeout(animationTimer);
    };
  }, [isOpen, onAdFinish, duration]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent hideCloseButton className="sm:max-w-2xl flex flex-col gap-0 p-0 overflow-hidden border-0" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="p-4 sm:p-6 space-y-2">
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="italic text-sm sm:text-base text-center text-orange-400">{funFact}</DialogDescription>
        </DialogHeader>
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 text-center">
          <div className="w-full bg-muted rounded-full h-2.5">
            <Progress value={adProgress} className="h-2.5" transitionDuration={duration} />
          </div>
          <p className="text-xs text-muted-foreground">Ad will finish in {countdown} seconds</p>
        </div>
        <div className="bg-muted/50 aspect-video w-full flex items-center justify-center">
          <div className="text-center text-muted-foreground p-4">
            <Tv2 className="w-8 h-8 sm:w-12 sm:h-12 mx-auto" />
            <p className="font-semibold mt-2 text-sm sm:text-base">Your Ad Here</p>
            <p className="text-xs">This is a placeholder for a video ad.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
