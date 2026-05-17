import type { ClientEvent, ServerEvent } from '@color-battle/shared';
import { useGameStore } from '../store/gameStore';

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_URL = `${protocol}//${window.location.host}`;

let ws: WebSocket | null = null;
let connectPromise: Promise<void> | null = null;

function handleServerEvent(event: ServerEvent) {
  const state = useGameStore.getState();
  switch (event.type) {
    case 'ROOM_JOINED':
      state.setPlayerInfo(event.payload.playerId, state.playerName);
      state.setRoom(event.payload.room);
      break;
    case 'PLAYER_JOINED':
      state.addPlayer(event.payload.player);
      break;
    case 'PLAYER_LEFT':
      state.removePlayer(event.payload.playerId);
      break;
    case 'GAME_STARTING':
      state.startCountdown(event.payload.totalRounds, event.payload.startsIn);
      break;
    case 'ROUND_START':
      state.startRound(
        event.payload.roundIndex,
        event.payload.questionId,
        event.payload.imagePath,
        event.payload.characterName,
        event.payload.targetPart,
        event.payload.timeLimit,
      );
      break;
    case 'TICK':
      state.tick(event.payload.remainingMs);
      break;
    case 'ROUND_END':
      state.showRoundEnd(
        event.payload.correctColor,
        event.payload.correctColorHex,
        event.payload.results,
      );
      break;
    case 'GAME_END':
      state.showGameEnd(event.payload.finalScores);
      break;
  }
}

export function connect(): Promise<void> {
  if (ws?.readyState === WebSocket.OPEN) return Promise.resolve();
  if (connectPromise) return connectPromise;

  connectPromise = new Promise<void>((resolve) => {
    ws = new WebSocket(WS_URL);
    ws.onopen = () => {
      connectPromise = null;
      resolve();
    };
    ws.onmessage = (event) => {
      const msg: ServerEvent = JSON.parse(event.data);
      handleServerEvent(msg);
    };
    ws.onclose = () => {
      ws = null;
      connectPromise = null;
    };
    ws.onerror = () => {
      connectPromise = null;
      resolve();
    };
  });

  return connectPromise;
}

export function send(event: ClientEvent) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }
}

export function isConnected(): boolean {
  return ws?.readyState === WebSocket.OPEN;
}
