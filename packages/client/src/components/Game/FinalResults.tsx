import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

export function FinalResults() {
  const finalScores = useGameStore((s) => s.finalScores);
  const playerId = useGameStore((s) => s.playerId);
  const reset = useGameStore((s) => s.reset);

  if (!finalScores) return null;

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center">
      <motion.h1
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-4xl font-bold mb-8 text-center"
      >
        Game Over!
      </motion.h1>

      <div className="w-full max-w-md space-y-3">
        {finalScores.map((score, index) => (
          <motion.div
            key={score.playerId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className={`flex items-center gap-4 p-4 rounded-xl ${
              score.playerId === playerId
                ? 'bg-primary/20 border-2 border-primary'
                : 'bg-surface-light'
            }`}
          >
            <span className={`text-3xl font-bold ${
              index === 0 ? 'text-yellow-400' :
              index === 1 ? 'text-gray-300' :
              index === 2 ? 'text-amber-600' : 'text-white/40'
            }`}>
              #{score.rank}
            </span>
            <span className="flex-1 text-lg font-medium truncate">{score.playerName}</span>
            <span className="text-2xl font-bold">{score.totalScore}</span>
          </motion.div>
        ))}
      </div>

      <button
        onClick={reset}
        className="mt-8 py-3 px-8 bg-primary hover:bg-primary/80 rounded-lg font-bold text-lg transition-all active:scale-95"
      >
        Back to Lobby
      </button>
    </div>
  );
}
