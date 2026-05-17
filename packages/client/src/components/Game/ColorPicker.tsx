import { useState, useCallback } from 'react';
import { HslColorPicker } from 'react-colorful';
import type { HSLColor } from '@color-battle/shared';
import { useGameStore } from '../../store/gameStore';

interface ColorPickerProps {
  onSubmit: (color: HSLColor) => void;
  onChange: (color: HSLColor) => void;
}

export function ColorPicker({ onSubmit, onChange }: ColorPickerProps) {
  const hasSubmitted = useGameStore((s) => s.hasSubmitted);
  const [color, setColor] = useState({ h: 180, s: 50, l: 50 });

  const handleChange = useCallback((newColor: { h: number; s: number; l: number }) => {
    setColor(newColor);
    onChange(newColor);
  }, [onChange]);

  const handleLockIn = () => {
    if (!hasSubmitted) {
      onSubmit(color);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`w-full max-w-[280px] ${hasSubmitted ? 'opacity-50 pointer-events-none' : ''}`}>
        <HslColorPicker color={color} onChange={handleChange} />
      </div>
      <div className="flex items-center gap-3 w-full max-w-[280px]">
        <div
          className="w-12 h-12 rounded-lg border-2 border-white/20 shrink-0"
          style={{ backgroundColor: `hsl(${color.h}, ${color.s}%, ${color.l}%)` }}
        />
        <button
          onClick={handleLockIn}
          disabled={hasSubmitted}
          className={`flex-1 py-3 px-6 rounded-lg font-bold text-lg transition-all ${
            hasSubmitted
              ? 'bg-green-600 text-white cursor-not-allowed'
              : 'bg-primary hover:bg-primary/80 text-white active:scale-95'
          }`}
        >
          {hasSubmitted ? 'Locked In!' : 'Lock In'}
        </button>
      </div>
    </div>
  );
}
