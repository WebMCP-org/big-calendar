"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseAICountdownOptions {
  isAI: boolean;
  duration?: number;
  onComplete: () => void;
  onCancel: () => void;
}

export function useAICountdown({ isAI, duration = 5000, onComplete, onCancel }: UseAICountdownOptions) {
  const [progress, setProgress] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onCancelRef = useRef(onCancel);

  // Keep refs in sync without triggering effects
  onCompleteRef.current = onComplete;
  onCancelRef.current = onCancel;

  const cancel = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startTimeRef.current = null;
    setProgress(100);
    setIsRunning(false);
    onCancelRef.current();
  }, []);

  const pause = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startTimeRef.current = null;
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!isAI) return;

    setIsRunning(true);
    setProgress(100);
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      if (!startTimeRef.current) return;

      const elapsed = now - startTimeRef.current;
      const remaining = Math.max(100 - (elapsed / duration) * 100, 0);

      setProgress(remaining);

      if (remaining <= 0) {
        setIsRunning(false);
        rafRef.current = null;
        onCompleteRef.current();
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isAI, duration]);

  return { progress, isRunning, pause, cancel };
}
