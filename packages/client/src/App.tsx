import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { Lobby } from './components/Lobby/Lobby';
import { GameBoard } from './components/Game/GameBoard';
import { FinalResults } from './components/Game/FinalResults';
import { connect } from './lib/websocket';

export default function App() {
  const phase = useGameStore((s) => s.phase);

  useEffect(() => {
    connect();
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      {phase === 'lobby' && <Lobby />}
      {phase === 'game' && <GameBoard />}
      {phase === 'results' && <FinalResults />}
    </div>
  );
}
