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
          <span className="text-8xl font-bold text-primary">{countdownSeconds}</span>
        </div>
      </div>
    );
  }

  if (gameSubPhase === 'revealing' && roundResults && correctColor && correctColorHex) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center gap-4">
        <div className="text-center">
          <span className="text-sm text-white/60">Round {currentRound + 1} / {totalRounds}</span>
        </div>
        <QuestionImage
          imagePath={imagePath}
          liveColor={correctColor}
          characterName={characterName}
          targetPart={targetPart}
        />
        <RoundResult
          results={roundResults}
          correctColor={correctColor}
          correctColorHex={correctColorHex}
          playerId={playerId}
        />
        <Scoreboard results={roundResults} playerId={playerId} />
      </div>
    );
  }

  const displayColor = submittedColor ?? pickerColor;

  return (
    <div className="min-h-screen p-4 flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-md">
        <span className="text-sm text-white/60">
          Round {currentRound + 1} / {totalRounds}
        </span>
        <Timer remainingMs={timeRemaining} />
      </div>
      <QuestionImage
        imagePath={imagePath}
        liveColor={displayColor}
        characterName={characterName}
        targetPart={targetPart}
      />
      <ColorPicker onSubmit={handleSubmit} onChange={handleColorChange} />
    </div>
  );
}
