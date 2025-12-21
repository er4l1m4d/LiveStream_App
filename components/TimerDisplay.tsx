import React, { useEffect, useState } from 'react';

interface Props {
  endTime: number | null;
  onExpire?: () => void;
  compact?: boolean;
  isPaused?: boolean;
  pausedRemaining?: number | null;
}

export const TimerDisplay: React.FC<Props> = ({ endTime, onExpire, compact, isPaused, pausedRemaining }) => {
  const [timeLeft, setTimeLeft] = useState<string>('--:--');
  const [isCritical, setIsCritical] = useState(false);

  const formatTime = (ms: number) => {
    if (ms <= 0) return '00:00';
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const seconds = Math.floor((ms / 1000) % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Handle Paused State
    if (isPaused && pausedRemaining !== null && pausedRemaining !== undefined) {
      setTimeLeft(formatTime(pausedRemaining));
      setIsCritical(pausedRemaining < 5 * 60 * 1000);
      return;
    }

    // Handle Active State
    if (!endTime) {
      setTimeLeft('--:--');
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft('00:00');
        setIsCritical(true);
        if (onExpire) onExpire();
        // Vibrate if on mobile when time is up
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        clearInterval(interval);
      } else {
        setTimeLeft(formatTime(diff));
        // Critical if less than 5 minutes
        setIsCritical(diff < 5 * 60 * 1000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onExpire, isPaused, pausedRemaining]);

  return (
    <div className={`font-mono font-bold ${
      isPaused ? 'text-orange-400' :
      isCritical ? 'text-red-500 animate-pulse' : 
      'text-church-main'
    } ${compact ? 'text-xl' : 'text-3xl'}`}>
      {isPaused ? `PAUSED (${timeLeft})` : timeLeft}
    </div>
  );
};