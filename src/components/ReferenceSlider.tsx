'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeftRight } from 'lucide-react';

export default function ReferenceSlider({ before, after }: { before: string, after: string }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  useEffect(() => {
    const handleUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchend', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, handleMouseMove, handleTouchMove]);

  return (
    <div 
      className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl cursor-ew-resize select-none border-2 border-white/10"
      ref={containerRef}
      onMouseDown={(e) => { setIsDragging(true); handleMove(e.clientX); }}
      onTouchStart={(e) => { setIsDragging(true); handleMove(e.touches[0].clientX); }}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${after})` }}
      />
      
      <div 
        className="absolute inset-0 bg-cover bg-center overflow-hidden"
        style={{ 
          backgroundImage: `url(${before})`,
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
        }}
      />

      <div 
        className="absolute top-0 bottom-0 w-1 bg-white flex items-center justify-center pointer-events-none"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-12 h-12 bg-primary rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center text-neutral-dark ring-4 ring-white/20">
          <ArrowLeftRight className="w-6 h-6" />
        </div>
      </div>

      <div className="absolute bottom-6 left-6 bg-neutral-dark/50 backdrop-blur-md text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest pointer-events-none">
        Před sanací
      </div>
      <div className="absolute bottom-6 right-6 bg-primary/80 backdrop-blur-md text-neutral-dark px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest pointer-events-none text-right">
        Po sanaci
      </div>
    </div>
  );
}
