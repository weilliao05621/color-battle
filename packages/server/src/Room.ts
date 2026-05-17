import type { WebSocket } from 'ws';
import type { ServerEvent, HSLColor, RoomState, RoomSummary, PlayerRoundResult, FinalScore } from '@color-battle/shared';
import { ROUND_TIME_MS, REVEAL_TIME_MS, COUNTDOWN_SECONDS, TOTAL_ROUNDS, TICK_INTERVAL_MS, DEFAULT_MAX_PLAYERS, ROOM_CODE_LENGTH } from '@color-battle/shared';
import { calculateColorDistance, calculateRoundScore } from '@color-battle/shared';
import { loadQuestions, type QuestionData } from './questions.js';

export interface ConnectedPlayer {
  id: string;
  name: string;
  ws: WebSocket;
  roomId: string | null;
  isHost: boolean;
  totalScore: number;
}

export const rooms = new Map<string, Room>();
const playerMap = new Map<string, ConnectedPlayer>();

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  if (Array.from(rooms.values()).some((r) => r.roomCode === code)) {
    return generateRoomCode();
  }
  return code;
}

export function getPlayer(id: string): ConnectedPlayer | undefined {
  return playerMap.get(id);
}

export function createRoom(ws: WebSocket, playerName: string, maxPlayers?: number) {
  const player: ConnectedPlayer = {
    id: generateId(),
    name: playerName,
    ws,
    roomId: null,
    isHost: true,
    totalScore: 0,
  };
  playerMap.set(player.id, player);

  const room = new Room(maxPlayers ?? DEFAULT_MAX_PLAYERS);
  room.addPlayer(player);
  rooms.set(room.roomId, room);

  return { player, roomState: room.getState() };
}

export function joinRoom(ws: WebSocket, roomCode: string, playerName: string) {
  const room = Array.from(rooms.values()).find((r) => r.roomCode === roomCode && r.status === 'waiting');
  if (!room || room.players.length >= room.maxPlayers) return null;

  const player: ConnectedPlayer = {
    id: generateId(),
    name: playerName,
    ws,
    roomId: null,
    isHost: false,
    totalScore: 0,
  };
  playerMap.set(player.id, player);
  room.addPlayer(player);

  return {
    player,
    roomState: room.getState(),
    broadcast: (event: ServerEvent, excludeId?: string) => room.broadcast(event, excludeId),
  };
}

export function leaveRoom(player: ConnectedPlayer) {
  if (!player.roomId) return;
  const room = rooms.get(player.roomId);
  if (room) {
    room.removePlayer(player.id);
    if (room.players.length === 0) {
      room.cleanup();
      rooms.delete(room.roomId);
    } else {
      room.broadcast({ type: 'PLAYER_LEFT', payload: { playerId: player.id } });
    }
  }
  playerMap.delete(player.id);
}

class Room {
  roomId: string;
  roomCode: string;
  players: ConnectedPlayer[] = [];
  status: 'waiting' | 'playing' = 'waiting';
  maxPlayers: number;

  private currentRound = 0;
  private questions: QuestionData[] = [];
  private roundAnswers = new Map<string, HSLColor>();
  private roundTimer: ReturnType<typeof setTimeout> | null = null;
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private roundStartTime = 0;

  constructor(maxPlayers: number) {
    this.roomId = generateId();
    this.roomCode = generateRoomCode();
    this.maxPlayers = maxPlayers;
  }

  addPlayer(player: ConnectedPlayer) {
    player.roomId = this.roomId;
    this.players.push(player);
  }

  removePlayer(playerId: string) {
    this.players = this.players.filter((p) => p.id !== playerId);
    const player = playerMap.get(playerId);
    if (player) player.roomId = null;
  }

  broadcast(event: ServerEvent, excludeId?: string) {
    const msg = JSON.stringify(event);
    for (const p of this.players) {
      if (p.id !== excludeId && p.ws.readyState === p.ws.OPEN) {
        p.ws.send(msg);
      }
    }
  }

  getState(): RoomState {
    return {
      roomId: this.roomId,
      roomCode: this.roomCode,
      players: this.players.map((p) => ({ id: p.id, name: p.name, isHost: p.isHost })),
      status: this.status,
      maxPlayers: this.maxPlayers,
    };
  }

  getSummary(): RoomSummary {
    const host = this.players.find((p) => p.isHost);
    return {
      roomId: this.roomId,
      roomCode: this.roomCode,
      hostName: host?.name ?? 'Unknown',
      playerCount: this.players.length,
      maxPlayers: this.maxPlayers,
      status: this.status,
    };
  }

  startGame() {
    if (this.status !== 'waiting' || this.players.length < 2) return;

    this.status = 'playing';
    this.currentRound = 0;
    this.questions = loadQuestions();

    for (const p of this.players) {
      p.totalScore = 0;
    }

    this.broadcast({
      type: 'GAME_STARTING',
      payload: { totalRounds: Math.min(TOTAL_ROUNDS, this.questions.length), startsIn: COUNTDOWN_SECONDS },
    });

    setTimeout(() => this.startRound(), COUNTDOWN_SECONDS * 1000);
  }

  private startRound() {
    if (this.currentRound >= Math.min(TOTAL_ROUNDS, this.questions.length)) {
      this.endGame();
      return;
    }

    this.roundAnswers.clear();
    const question = this.questions[this.currentRound];

    this.broadcast({
      type: 'ROUND_START',
      payload: {
        roundIndex: this.currentRound,
        questionId: question.id,
        imagePath: question.imagePath,
        characterName: question.characterName,
        targetPart: question.targetPart,
        timeLimit: ROUND_TIME_MS,
      },
    });

    this.roundStartTime = Date.now();

    this.tickTimer = setInterval(() => {
      const elapsed = Date.now() - this.roundStartTime;
      const remaining = Math.max(0, ROUND_TIME_MS - elapsed);
      this.broadcast({ type: 'TICK', payload: { remainingMs: remaining } });
    }, TICK_INTERVAL_MS);

    this.roundTimer = setTimeout(() => this.endRound(), ROUND_TIME_MS);
  }

  submitAnswer(playerId: string, roundIndex: number, color: HSLColor) {
    if (roundIndex !== this.currentRound) return;
    if (this.roundAnswers.has(playerId)) return;
    this.roundAnswers.set(playerId, color);
  }

  private endRound() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    if (this.roundTimer) {
      clearTimeout(this.roundTimer);
      this.roundTimer = null;
    }

    const question = this.questions[this.currentRound];
    const results: PlayerRoundResult[] = this.players.map((p) => {
      const answer = this.roundAnswers.get(p.id);
      const deltaE = answer ? calculateColorDistance(answer, question.correctColor) : 50;
      const roundScore = calculateRoundScore(deltaE);
      p.totalScore += roundScore;

      return {
        playerId: p.id,
        playerName: p.name,
        submittedColor: answer ?? null,
        deltaE,
        roundScore,
        totalScore: p.totalScore,
      };
    });

    this.broadcast({
      type: 'ROUND_END',
      payload: {
        roundIndex: this.currentRound,
        correctColor: question.correctColor,
        correctColorHex: question.trueHexCode,
        results,
      },
    });

    this.currentRound++;

    setTimeout(() => this.startRound(), REVEAL_TIME_MS);
  }

  private endGame() {
    const finalScores: FinalScore[] = this.players
      .map((p) => ({ playerId: p.id, playerName: p.name, totalScore: p.totalScore, rank: 0 }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((s, i) => ({ ...s, rank: i + 1 }));

    this.broadcast({ type: 'GAME_END', payload: { finalScores } });
    this.status = 'waiting';
  }

  cleanup() {
    if (this.tickTimer) clearInterval(this.tickTimer);
    if (this.roundTimer) clearTimeout(this.roundTimer);
  }
}
