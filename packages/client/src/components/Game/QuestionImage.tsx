import type { HSLColor } from '@color-battle/shared';

interface QuestionImageProps {
  imagePath: string | null;
  liveColor: HSLColor | null;
  characterName?: string | null;
  targetPart?: string | null;
}

export function QuestionImage({ imagePath, liveColor, characterName, targetPart }: QuestionImageProps) {
  if (!imagePath) {
    return (
      <div className="w-full aspect-square max-w-[400px] bg-surface-light rounded-xl flex items-center justify-center">
        <span className="text-white/40 text-lg">Loading...</span>
      </div>
    );
  }

  const bgColor = liveColor
    ? `hsl(${liveColor.h}, ${liveColor.s}%, ${liveColor.l}%)`
    : '#ffffff';

  return (
    <div className="w-full max-w-[400px]">
      <div className="relative rounded-xl overflow-hidden border-2 border-white/10">
        <div
          className="color-layer absolute inset-0 transition-colors duration-150"
          style={{ backgroundColor: bgColor }}
        />
        <img
          src={imagePath}
          alt={characterName ?? 'Character'}
          className="relative z-10 w-full h-auto block"
          draggable={false}
        />
      </div>
      {characterName && targetPart && (
        <p className="text-center text-white/50 text-sm mt-2">
          {characterName} — <span className="text-white/70 font-medium">{targetPart}</span>
        </p>
      )}
    </div>
  );
}
