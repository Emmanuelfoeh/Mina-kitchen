'use client';

import { useCallback, useRef, useState } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
}

interface UseTouchGesturesOptions {
  onSwipe?: (gesture: SwipeGesture) => void;
  onTap?: (position: TouchPosition) => void;
  onLongPress?: (position: TouchPosition) => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  velocityThreshold?: number;
}

export function useTouchGestures({
  onSwipe,
  onTap,
  onLongPress,
  swipeThreshold = 50,
  longPressDelay = 500,
  velocityThreshold = 0.3,
}: UseTouchGesturesOptions = {}) {
  const touchStartRef = useRef<TouchPosition | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsLongPressing(false);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const position = { x: touch.clientX, y: touch.clientY };

      touchStartRef.current = position;
      touchStartTimeRef.current = Date.now();
      setIsLongPressing(false);

      // Start long press timer
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          setIsLongPressing(true);
          onLongPress(position);
        }, longPressDelay);
      }
    },
    [onLongPress, longPressDelay]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      // Clear long press timer on move
      clearLongPressTimer();

      // Prevent default to avoid scrolling during swipe
      if (touchStartRef.current) {
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
        const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

        // If horizontal movement is greater than vertical, prevent vertical scroll
        if (deltaX > deltaY && deltaX > 10) {
          e.preventDefault();
        }
      }
    },
    [clearLongPressTimer]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      clearLongPressTimer();

      if (!touchStartRef.current || isLongPressing) {
        return;
      }

      const touch = e.changedTouches[0];
      const endPosition = { x: touch.clientX, y: touch.clientY };
      const deltaX = endPosition.x - touchStartRef.current.x;
      const deltaY = endPosition.y - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const duration = Date.now() - touchStartTimeRef.current;
      const velocity = distance / duration;

      // Check for swipe gesture
      if (
        distance > swipeThreshold &&
        velocity > velocityThreshold &&
        onSwipe
      ) {
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        let direction: SwipeGesture['direction'];
        if (absDeltaX > absDeltaY) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        onSwipe({
          direction,
          distance,
          velocity,
        });
      } else if (distance < 10 && duration < 300 && onTap) {
        // Tap gesture (small movement, quick duration)
        onTap(endPosition);
      }

      // Reset
      touchStartRef.current = null;
      touchStartTimeRef.current = 0;
    },
    [
      clearLongPressTimer,
      isLongPressing,
      onSwipe,
      onTap,
      swipeThreshold,
      velocityThreshold,
    ]
  );

  const handleTouchCancel = useCallback(() => {
    clearLongPressTimer();
    touchStartRef.current = null;
    touchStartTimeRef.current = 0;
  }, [clearLongPressTimer]);

  return {
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
    isLongPressing,
  };
}
