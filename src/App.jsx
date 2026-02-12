import { useState, useEffect, useRef } from 'react';
import { WaveAnimation } from "./components/ui/wave-animation";
import Game from './core/Game';
import soundManager from './core/SoundManager.jsx';

export default function App() {
  const [curtainDone, setCurtainDone] = useState(false);

  const handleCurtainOpen = () => {
    setCurtainDone(true);
    // Notify HouseScene that curtain is done — so it can start its ambient music
    window.dispatchEvent(new Event('curtainDone'));
  };

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
            onCurtainOpen={handleCurtainOpen}
          />
        </div>
      )}

      {/* Speaker toggle button */}
      <SpeakerToggle />
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

function SpeakerToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const handleMuteChange = (e) => {
      setMuted(e.detail.muted);
    };
    window.addEventListener('muteChange', handleMuteChange);
    return () => window.removeEventListener('muteChange', handleMuteChange);
  }, []);

  const toggleMute = () => {
    soundManager.toggleMute();
  };

  return (
    <button
      onClick={toggleMute}
      aria-label={muted ? 'Unmute' : 'Mute'}
      title={muted ? 'Unmute' : 'Mute'}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        color: '#ffffff',
        opacity: 0.8,
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.transform = 'scale(1.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0.8';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {muted ? (
        /* Speaker Off — speaker with X */
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        /* Speaker On — speaker with sound waves */
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </button>
  );
}