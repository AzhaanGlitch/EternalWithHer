import { useState, useEffect, useRef } from 'react';
import { WaveAnimation } from "./components/ui/wave-animation";
import Game from './core/Game';

export default function App() {
  const [curtainDone, setCurtainDone] = useState(false);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Game scene — always rendered BEHIND the curtain */}
      <div className="absolute inset-0 z-0">
        <GameContainer />
      </div>

      {/* Curtain overlay — sits on top, removed after fully opened */}
      {!curtainDone && (
        <div className="absolute inset-0 z-10">
          <WaveAnimation
            waveSpeed={1.5}
            waveIntensity={45}
            curtainColor="#7e1515"
            gridDistance={5}
            className="absolute inset-0"
            onCurtainOpen={() => setCurtainDone(true)}
          />
        </div>
      )}
    </div>
  );
}

function GameContainer() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      const gameInstance = new Game(containerRef.current);
      gameRef.current = gameInstance;

      return () => {
        if (gameInstance) {
          gameInstance.destroy();
        }
      };
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen bg-black"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    />
  );
}