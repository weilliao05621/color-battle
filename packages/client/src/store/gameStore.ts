import { create } from 'zustand';
import type { HSLColor, PlayerInfo, PlayerRoundResult, FinalScore, RoomState } from '@color-battle/shared';

export type Phase = 'lobby' | 'game' | 'results';
export type GameSubPhase = 'countdown' | 'playing' | 'revealing';

interface GameStore {
  phase: Phase;
  gameSubPhase: GameSubPhase;

  // Player
  playerId: string | null;
  playerName: string;

  // Room
  room: RoomState | null;

  // Game state
  currentRound: number;
  totalRounds: number;
  timeRemaining: number;
  countdownSeconds: number;
  imagePath: string | null;
  characterName: string | null;
  targetPart: string | null;
  questionId: string | null;

  // Answer
  submittedColor: HSLColor | null;
  hasSubmitted: boolean;

  // Results
  roundResults: PlayerRoundResult[] | null;
  correctColor: HSLColor | null;
  correctColorHex: string | null;
  finalScores: FinalScore[] | null;

  // Actions
  setPlayerInfo: (id: string, name: string) => void;
  setRoom: (room: RoomState | null) => void;
  addPlayer: (player: PlayerInfo) => void;
  removePlayer: (playerId: string) => void;
  startCountdown: (totalRounds: number, startsIn: number) => void;
  startRound: (roundIndex: number, questionId: string, imagePath: string, characterName: string, targetPart: string, timeLimit: number) => void;
  tick: (remainingMs: number) => void;
  submitAnswer: (color: HSLColor) => void;
  showRoundEnd: (correctColor: HSLColor, correctColorHex: string, results: PlayerRoundResult[]) => void;
  showGameEnd: (finalScores: FinalScore[]) => void;
  reset: () => void;
}

const initialState = {
  phase: 'lobby' as Phase,
  gameSubPhase: 'countdown' as GameSubPhase,
  playerId: null,
  playerName: '',
  room: null,
  currentRound: 0,
  totalRounds: 20,
  timeRemaining: 0,
  countdownSeconds: 0,
  imagePath: null,
  characterName: null,
  targetPart: null,
  questionId: null,
  submittedColor: null,
  hasSubmitted: false,
  roundResults: null,
  correctColor: null,
  correctColorHex: null,
  finalScores: null,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setPlayerInfo: (id, name) => set({ playerId: id, playerName: name }),

  setRoom: (room) => set({ room }),

  addPlayer: (player) =>
    set((state) => ({
      room: state.room ? { ...state.room, players: [...state.room.players, player] } : null,
    })),

  removePlayer: (playerId) =>
    set((state) => ({
      room: state.room
        ? { ...state.room, players: state.room.players.filter((p) => p.id !== playerId) }
        : null,
    })),

  startCountdown: (totalRounds, startsIn) =>
    set({ phase: 'game', gameSubPhase: 'countdown', totalRounds, countdownSeconds: startsIn }),

  startRound: (roundIndex, questionId, imagePath, characterName, targetPart, timeLimit) =>
    set({
      gameSubPhase: 'playing',
      currentRound: roundIndex,
      questionId,
      imagePath,
      characterName,
      targetPart,
      timeRemaining: timeLimit,
      submittedColor: null,
      hasSubmitted: false,
      roundResults: null,
      correctColor: null,
      correctColorHex: null,
    }),

  tick: (remainingMs) => set({ timeRemaining: remainingMs }),

  submitAnswer: (color) => set({ submittedColor: color, hasSubmitted: true }),

  showRoundEnd: (correctColor, correctColorHex, results) =>
    set({
      gameSubPhase: 'revealing',
      correctColor,
      correctColorHex,
      roundResults: results,
    }),

  showGameEnd: (finalScores) => set({ phase: 'results', finalScores }),

  reset: () => set(initialState),
}));
