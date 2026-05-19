import { useState, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { send } from '../../lib/websocket';
import { ColorPicker } from './ColorPicker';
import { Timer } from './Timer';
import { QuestionImage } from './QuestionImage';
import { RoundResult } from './RoundResult';
import { Scoreboard } from './Scoreboard';
import type { HSLColor } from '@color-battle/shared';

export function GameBoard() {
  const {
    gameSubPhase,
    currentRound,
    totalRounds,
    timeRemaining,
    countdownSeconds,
    room,
    playerName,
    imagePath,
    characterName,
    targetPart,
    playerId,
    roundResults,
    correctColor,
    correctColorHex,
    submittedColor,
    submitAnswer,
  } = useGameStore();

  const [pickerColor, setPickerColor] = useState<HSLColor>({ h: 180, s: 50, l: 50 });

  const handleColorChange = useCallback((color: HSLColor) => {
    setPickerColor(color);
  }, []);

  const handleSubmit = (color: HSLColor) => {
    submitAnswer(color);
    send({ type: 'SUBMIT_ANSWER', payload: { roundIndex: currentRound, color } });
  };

  if (gameSubPhase === 'countdown') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Get Ready!</h1>
        </div>
      </div>
    );
  }

  if (gameSubPhase === 'revealing' && roundResults && correctColor && correctColorHex) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 lg:p-6">
        <div className="mx-auto grid w-full max-w-[800px] max-w-7xl grid-cols-1 items-center gap-4 lg:grid-cols-[minmax(220px,280px)_minmax(320px,480px)_minmax(280px,1fr)] lg:gap-6">
          <aside className="w-full">
            <Scoreboard results={roundResults} playerId={playerId} />
          </aside>
          <main className="flex w-full flex-col items-center gap-3">
            <span className="text-sm text-white/60">
              Round {currentRound + 1} / {totalRounds}
            </span>
            <QuestionImage
              imagePath={imagePath}
              liveColor={correctColor}
              characterName={characterName}
              targetPart={targetPart}
            />
          </main>
          <section className="w-full">
            <RoundResult
              results={roundResults}
              correctColor={correctColor}
              correctColorHex={correctColorHex}
              playerId={playerId}
            />
          </section>
        </div>
      </div>
    );
  }

  const displayColor = submittedColor ?? pickerColor;

  return (
    <div className="flex min-h-screen items-center justify-center p-4 lg:p-6">
      <div className="grid w-full max-w-[800px] grid-cols-1 items-center gap-4 lg:grid-cols-[minmax(180px,220px)_minmax(280px,360px)_minmax(240px,1fr)] lg:gap-6">
        <RankPanel
          players={room?.players ?? []}
          playerId={playerId}
          playerName={playerName}
          currentRound={currentRound}
          totalRounds={totalRounds}
        />
        <main className="flex w-full flex-col items-center">
          <QuestionImage
            imagePath={imagePath}
            liveColor={displayColor}
            characterName={characterName}
            targetPart={targetPart}
          />
        </main>
        <section className="flex w-full flex-col items-center justify-center gap-4 lg:-ml-6">
          <Timer remainingMs={timeRemaining} />
          <ColorPicker onSubmit={handleSubmit} onChange={handleColorChange} />
        </section>
      </div>
    </div>
  );
}

interface RankPanelProps {
  players: Array<{ id: string; name: string }>;
  playerId: string | null;
  playerName: string;
  currentRound: number;
  totalRounds: number;
}

function RankPanel({
  players,
  playerId,
  playerName,
  currentRound,
  totalRounds,
}: RankPanelProps) {
  const visiblePlayers =
    players.length > 0
      ? players
      : playerId
        ? [{ id: playerId, name: playerName || 'You' }]
        : [];

  return (
    <aside className="flex max-h-[min(60vh,28rem)] w-[220px] max-w-full shrink-0 flex-col rounded-xl bg-surface-light p-4">
      <div className="mb-4 shrink-0">
        <h3 className="text-sm font-semibold uppercase text-white/60">Rank</h3>
        <span className="text-xs text-white/40">
          Round {currentRound + 1} / {totalRounds}
        </span>
      </div>

      <div className="min-h-0 space-y-1 overflow-y-auto">
        {visiblePlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center gap-2 rounded p-2 ${
              player.id === playerId ? 'bg-primary/10' : ''
            }`}
          >
            <span className="w-5 text-sm text-white/40">{index + 1}.</span>
            <span className="min-w-0 flex-1 truncate text-sm">{player.name}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
