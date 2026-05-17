import { motion } from 'framer-motion';
import type { PlayerRoundResult, HSLColor } from '@color-battle/shared';

interface RoundResultProps {
  results: PlayerRoundResult[];
  correctColor: HSLColor;
  correctColorHex: string;
  playerId: string | null;
}

function hslToCss(color: HSLColor): string {
  return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
}

export function RoundResult({ results, correctColor, correctColorHex, playerId }: RoundResultProps) {
  const sorted = [...results].sort((a, b) => a.deltaE - b.deltaE);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-lg border-2 border-white/20 mx-auto"
            style={{ backgroundColor: correctColorHex }}
          />
          <span className="text-xs text-white/60 mt-1 block">Correct</span>
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((result, index) => (
          <motion.div
            key={result.playerId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              result.playerId === playerId ? 'bg-primary/20 border border-primary/40' : 'bg-surface-light'
            }`}
          >
            <span className="text-lg font-bold text-white/60 w-6">#{index + 1}</span>
            {result.submittedColor && (
              <div
                className="w-8 h-8 rounded border border-white/20"
                style={{ backgroundColor: hslToCss(result.submittedColor) }}
              />
            )}
            <span className="flex-1 font-medium truncate">{result.playerName}</span>
            <span className="text-sm text-white/60">ΔE {result.deltaE.toFixed(1)}</span>
            <span className="font-bold text-primary">+{result.roundScore}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
