import React, { useEffect, useRef, useState, useCallback } from "react";

const SCREEN_WIDTH = typeof window !== 'undefined' ? window.innerWidth : 1000;
const SCREEN_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 1000;
const Platform = { OS: 'web' };

const CONFETTI_COUNT = 120;
const CONFETTI_DURATION = 1200;
const CONFETTI_COLORS = [
  "#FF6B35",
  "#4ECB71",
  "#FFD700",
  "#FF69B4",
  "#00CED1",
  "#9B59B6",
  "#3498DB",
];

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  color: string;
  size: number;
  shape: "square" | "rectangle" | "circle";
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
}

interface CelebrationProps {
  visible: boolean;
  onComplete?: () => void;
}

export default function Celebration({ visible, onComplete }: CelebrationProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [reduceMotion, setReduceMotion] = useState(false);
  const hasTriggeredRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const triggerHaptic = useCallback(() => {
    if (Platform.OS === "web") return;
    // Haptic feedback not available on web
  }, []);

  const createConfetti = useCallback((): ConfettiPiece[] => {
    const pieces: ConfettiPiece[] = [];
    
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const startX = SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 100;
      const startY = -20;
      
      pieces.push({
        id: i,
        x: startX,
        y: startY,
        rotation: 0,
        scale: 1,
        opacity: 1,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 6,
        shape: ["square", "rectangle", "circle"][Math.floor(Math.random() * 3)] as "square" | "rectangle" | "circle",
        velocityX: (Math.random() - 0.5) * 3,
        velocityY: 2 + Math.random() * 2,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }
    
    return pieces;
  }, []);

  const animateConfetti = useCallback((pieces: ConfettiPiece[]) => {
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / CONFETTI_DURATION, 1);

      if (progress >= 1) {
        setConfetti([]);
        onComplete?.();
        return;
      }

      const updatedPieces = pieces.map(piece => {
        const newY = piece.y + piece.velocityY * 2;
        const newX = piece.x + piece.velocityX * 2;
        const newRotation = piece.rotation + piece.rotationSpeed;
        const newOpacity = Math.max(0, 1 - progress);

        return {
          ...piece,
          x: newX,
          y: newY,
          rotation: newRotation,
          opacity: newOpacity,
        };
      });

      setConfetti(updatedPieces);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [onComplete]);

  useEffect(() => {
    if (visible && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      
      triggerHaptic();
      
      if (!reduceMotion) {
        const pieces = createConfetti();
        setConfetti(pieces);
        animateConfetti(pieces);
      } else {
        setTimeout(() => {
          onComplete?.();
        }, 100);
      }
    }
    
    if (!visible) {
      hasTriggeredRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [visible, reduceMotion, triggerHaptic, createConfetti, animateConfetti, onComplete]);

  if (!visible || confetti.length === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 9999,
    }}>
      {confetti.map((piece) => {
        const shapeStyle: React.CSSProperties = 
          piece.shape === "circle"
            ? { borderRadius: '50%' }
            : piece.shape === "rectangle"
            ? { width: piece.size, height: piece.size * 2 }
            : { width: piece.size, height: piece.size };

        return (
          <div
            key={piece.id}
            style={{
              position: 'absolute',
              left: piece.x,
              top: piece.y,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg) scale(${piece.scale})`,
              opacity: piece.opacity,
              ...shapeStyle,
            }}
          />
        );
      })}
    </div>
  );
}
