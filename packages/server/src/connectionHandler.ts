import type { WebSocket } from 'ws';
import type { ClientEvent, ServerEvent } from '@color-battle/shared';
import { rooms, createRoom, joinRoom, leaveRoom, getPlayer, type ConnectedPlayer } from './Room.js';

export function handleConnection(ws: WebSocket) {
  let player: ConnectedPlayer | null = null;

  ws.on('message', (data) => {
    try {
      const event: ClientEvent = JSON.parse(data.toString());
      handleEvent(event);
    } catch {
      sendError('PARSE_ERROR', 'Invalid message format');
    }
  });

  ws.on('close', () => {
    if (player) {
      leaveRoom(player);
      player = null;
    }
  });

  function handleEvent(event: ClientEvent) {
    switch (event.type) {
      case 'CREATE_ROOM': {
        const result = createRoom(ws, event.payload.playerName, event.payload.maxPlayers);
        player = result.player;
        send({ type: 'ROOM_JOINED', payload: { room: result.roomState, playerId: player.id } });
        break;
      }
      case 'JOIN_ROOM': {
        const result = joinRoom(ws, event.payload.roomCode, event.payload.playerName);
        if (!result) {
          sendError('ROOM_NOT_FOUND', 'Room not found or full');
          return;
        }
        player = result.player;
        send({ type: 'ROOM_JOINED', payload: { room: result.roomState, playerId: player.id } });
        result.broadcast({ type: 'PLAYER_JOINED', payload: { player: { id: player.id, name: player.name, isHost: false } } }, player.id);
        break;
      }
      case 'LEAVE_ROOM': {
        if (player) {
          leaveRoom(player);
          player = null;
        }
        break;
      }
      case 'START_GAME': {
        if (!player) return;
        const room = rooms.get(player.roomId!);
        if (!room || !player.isHost) return;
        room.startGame();
        break;
      }
      case 'SUBMIT_ANSWER': {
        if (!player) return;
        const room = rooms.get(player.roomId!);
        if (!room) return;
        room.submitAnswer(player.id, event.payload.roundIndex, event.payload.color);
        break;
      }
      case 'REQUEST_ROOMS': {
        const roomsList = Array.from(rooms.values())
          .filter((r) => r.status === 'waiting')
          .map((r) => r.getSummary());
        send({ type: 'ROOMS_LIST', payload: { rooms: roomsList } });
        break;
      }
    }
  }

  function send(event: ServerEvent) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(event));
    }
  }

  function sendError(code: string, message: string) {
    send({ type: 'ERROR', payload: { code, message } });
  }
}
