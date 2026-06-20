import React, { useState, useRef } from 'react';

interface MobileJoystickProps {
  onMove: (x: number, y: number, active: boolean) => void;
}

export default function MobileJoystick({ onMove }: MobileJoystickProps) {
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const pointerIdRef = useRef<number | null>(null);

  const MAX_RADIUS = 50; // Max movement distance of the knob in pixels

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Capture the pointer to track movements outside the joystick base container
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;
    
    setIsActive(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    onMove(0, 0, true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isActive || pointerIdRef.current !== e.pointerId) return;
    
    e.stopPropagation();
    e.preventDefault();

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const distance = Math.hypot(dx, dy);

    let clampedX = dx;
    let clampedY = dy;

    if (distance > MAX_RADIUS) {
      clampedX = (dx / distance) * MAX_RADIUS;
      clampedY = (dy / distance) * MAX_RADIUS;
    }

    setKnobOffset({ x: clampedX, y: clampedY });
    
    // Normalize coordinates to [-1, 1] range
    const normX = clampedX / MAX_RADIUS;
    const normY = clampedY / MAX_RADIUS;
    onMove(normX, normY, true);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    
    e.stopPropagation();
    e.preventDefault();

    setIsActive(false);
    setKnobOffset({ x: 0, y: 0 });
    pointerIdRef.current = null;
    onMove(0, 0, false);
  };

  return (
    <div
      className="fixed bottom-8 left-8 z-50 select-none touch-none flex items-center justify-center pointer-events-auto"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ width: '120px', height: '120px' }}
    >
      {/* Joystick Base Ring */}
      <div 
        className="w-full h-full rounded-full bg-slate-950/40 border border-white/10 backdrop-blur-sm relative flex items-center justify-center shadow-lg"
        style={{
          boxShadow: isActive ? '0 0 20px rgba(99, 102, 241, 0.25)' : 'none',
          borderColor: isActive ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.1)',
          transition: 'border-color 0.2s, box-shadow 0.2s'
        }}
      >
        {/* Outer subtle ticks */}
        <div className="absolute inset-2 rounded-full border border-dashed border-white/5 pointer-events-none" />

        {/* Joystick Knob */}
        <div
          className="w-12 h-12 rounded-full bg-indigo-500/60 border border-indigo-400/80 shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center justify-center transition-transform duration-75 active:scale-95 touch-none"
          style={{
            transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
            backgroundColor: isActive ? 'rgba(99, 102, 241, 0.8)' : 'rgba(99, 102, 241, 0.5)',
          }}
        >
          {/* Inner details for futuristic tech vibe */}
          <div className="w-4 h-4 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
}
