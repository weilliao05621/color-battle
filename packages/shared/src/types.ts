export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface PlayerInfo {
  id: string;
  name: string;
  isHost: boolean;
}

export interface RoomSummary {
  roomId: string;
  roomCode: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  status: 'waiting' | 'playing';
}

export interface RoomState {
  roomId: string;
  roomCode: string;
  players: PlayerInfo[];
  status: 'waiting' | 'playing';
  maxPlayers: number;
}

export interface PlayerRoundResult {
  playerId: string;
  playerName: string;
  submittedColor: HSLColor | null;
  deltaE: number;
  roundScore: number;
  totalScore: number;
}

export interface FinalScore {
  playerId: string;
  playerName: string;
  totalScore: number;
  rank: number;
}

export interface Question {
  id: string;
  characterName: string;
  showSource: string;
  targetPart: string;
  trueHexCode: string;
  imagePath: string;
  correctColor: HSLColor;
}

// Client → Server events
export type ClientEvent =
  | { type: 'CREATE_ROOM'; payload: { playerName: string; maxPlayers?: number } }
  | { type: 'JOIN_ROOM'; payload: { roomCode: string; playerName: string } }
  | { type: 'LEAVE_ROOM' }
  | { type: 'START_GAME' }
  | { type: 'SUBMIT_ANSWER'; payload: { roundIndex: number; color: HSLColor } }
  | { type: 'REQUEST_ROOMS' };

// Server → Client events
export type ServerEvent =
  | { type: 'ROOM_CREATED'; payload: { roomId: string; roomCode: string } }
  | { type: 'ROOM_JOINED'; payload: { room: RoomState; playerId: string } }
  | { type: 'PLAYER_JOINED'; payload: { player: PlayerInfo } }
  | { type: 'PLAYER_LEFT'; payload: { playerId: string } }
  | { type: 'ROOMS_LIST'; payload: { rooms: RoomSummary[] } }
  | { type: 'GAME_STARTING'; payload: { totalRounds: number; startsIn: number } }
  | { type: 'ROUND_START'; payload: { roundIndex: number; questionId: string; imagePath: string; characterName: string; targetPart: string; timeLimit: number } }
  | { type: 'TICK'; payload: { remainingMs: number } }
  | { type: 'ROUND_END'; payload: { roundIndex: number; correctColor: HSLColor; correctColorHex: string; results: PlayerRoundResult[] } }
  | { type: 'GAME_END'; payload: { finalScores: FinalScore[] } }
  | { type: 'ERROR'; payload: { code: string; message: string } };
