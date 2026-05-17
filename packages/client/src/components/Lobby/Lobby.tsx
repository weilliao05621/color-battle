import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { send } from '../../lib/websocket';

export function Lobby() {
  const room = useGameStore((s) => s.room);
  const playerId = useGameStore((s) => s.playerId);
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');

  const handleCreate = () => {
    if (!name.trim()) return;
    useGameStore.getState().setPlayerInfo('', name.trim());
    send({ type: 'CREATE_ROOM', payload: { playerName: name.trim() } });
  };

  const handleJoin = () => {
    if (!name.trim() || !roomCode.trim()) return;
    useGameStore.getState().setPlayerInfo('', name.trim());
    send({ type: 'JOIN_ROOM', payload: { roomCode: roomCode.trim().toUpperCase(), playerName: name.trim() } });
  };

  const handleStart = () => {
    send({ type: 'START_GAME' });
  };

  if (room) {
    const isHost = room.players.find((p) => p.id === playerId)?.isHost;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-surface-light rounded-xl p-6 w-full max-w-sm">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Room Code</h2>
            <span className="text-4xl font-mono font-bold text-primary tracking-wider">
              {room.roomCode}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-sm text-white/60 uppercase mb-2">
              Players ({room.players.length}/{room.maxPlayers})
            </h3>
            <div className="space-y-2">
              {room.players.map((p) => (
                <div
                  key={p.id}
                  className={`p-2 rounded-lg flex items-center gap-2 ${
                    p.id === playerId ? 'bg-primary/10 border border-primary/30' : 'bg-surface'
                  }`}
                >
                  <span className="flex-1">{p.name}</span>
                  {p.isHost && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Host</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isHost && (
            <button
              onClick={handleStart}
              disabled={room.players.length < 2}
              className="w-full py-3 bg-primary hover:bg-primary/80 disabled:bg-white/10 disabled:text-white/30 rounded-lg font-bold text-lg transition-all"
            >
              {room.players.length < 2 ? 'Need 2+ players' : 'Start Game'}
            </button>
          )}
          {!isHost && (
            <p className="text-center text-white/40 text-sm">Waiting for host to start...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold mb-2 text-center">
        <span className="text-primary">Color</span> Battle
      </h1>
      <p className="text-white/40 mb-8 text-center">Guess the missing color!</p>

      {mode === 'menu' && (
        <div className="space-y-3 w-full max-w-xs">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={20}
            className="w-full p-3 bg-surface-light border border-white/10 rounded-lg text-center text-white placeholder-white/30 focus:outline-none focus:border-primary"
          />
          <button
            onClick={() => { if (name.trim()) setMode('create'); }}
            className="w-full py-3 bg-primary hover:bg-primary/80 rounded-lg font-bold text-lg transition-all"
          >
            Create Room
          </button>
          <button
            onClick={() => { if (name.trim()) setMode('join'); }}
            className="w-full py-3 bg-surface-light hover:bg-white/10 border border-white/10 rounded-lg font-bold text-lg transition-all"
          >
            Join Room
          </button>
        </div>
      )}

      {mode === 'create' && (
        <div className="space-y-3 w-full max-w-xs">
          <p className="text-white/60 text-center">Playing as: <strong>{name}</strong></p>
          <button
            onClick={handleCreate}
            className="w-full py-3 bg-primary hover:bg-primary/80 rounded-lg font-bold text-lg transition-all"
          >
            Create Room
          </button>
          <button
            onClick={() => setMode('menu')}
            className="w-full py-2 text-white/40 hover:text-white text-sm"
          >
            Back
          </button>
        </div>
      )}

      {mode === 'join' && (
        <div className="space-y-3 w-full max-w-xs">
          <p className="text-white/60 text-center">Playing as: <strong>{name}</strong></p>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Room code (e.g. ABCD)"
            maxLength={4}
            className="w-full p-3 bg-surface-light border border-white/10 rounded-lg text-center text-white font-mono text-2xl tracking-wider placeholder-white/30 focus:outline-none focus:border-primary uppercase"
          />
          <button
            onClick={handleJoin}
            disabled={roomCode.length !== 4}
            className="w-full py-3 bg-primary hover:bg-primary/80 disabled:bg-white/10 disabled:text-white/30 rounded-lg font-bold text-lg transition-all"
          >
            Join
          </button>
          <button
            onClick={() => setMode('menu')}
            className="w-full py-2 text-white/40 hover:text-white text-sm"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
