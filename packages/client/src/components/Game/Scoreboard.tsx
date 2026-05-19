import type { PlayerRoundResult } from '@color-battle/shared';

interface ScoreboardProps {
  results: PlayerRoundResult[];
  playerId: string | null;
}

export function Scoreboard({ results, playerId }: ScoreboardProps) {
  const sorted = [...results].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="mx-auto w-[220px] max-w-full shrink-0 rounded-xl bg-surface-light p-4">
      <h3 className="text-sm font-semibold text-white/60 uppercase mb-2">Scoreboard</h3>
      <div className="space-y-1">
        {sorted.map((player, index) => (
          <div
            key={player.playerId}
            className={`flex items-center gap-2 p-2 rounded ${
              player.playerId === playerId ? 'bg-primary/10' : ''
            }`}
          >
            <span className="text-sm text-white/40 w-5">{index + 1}.</span>
            <span className="flex-1 text-sm truncate">{player.playerName}</span>
            <span className="text-sm font-bold">{player.totalScore}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
