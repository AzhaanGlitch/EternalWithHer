import { useEffect, useRef, useState } from 'react';
import Game from "./core/Game";
import OverlayUI from './ui/OverlayUI';

function App() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [currentScene, setCurrentScene] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create game instance
    gameRef.current = new Game(containerRef.current);

    // Listen for scene changes
    const handleSceneChange = (e) => {
      setCurrentScene(e.detail.scene);
      if (gameRef.current?.sceneManager) {
        setCanGoBack(gameRef.current.sceneManager.canGoBack());
      }
    };

    // Listen for mute changes
    const handleMuteChange = (e) => {
      setIsMuted(e.detail.muted);
    };

    window.addEventListener('sceneChange', handleSceneChange);
    window.addEventListener('muteChange', handleMuteChange);

    // Hide loading after short delay
    setTimeout(() => setIsLoading(false), 1500);

    return () => {
      window.removeEventListener('sceneChange', handleSceneChange);
      window.removeEventListener('muteChange', handleMuteChange);

      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, []);

  const handleBack = () => {
    if (gameRef.current?.sceneManager) {
      gameRef.current.sceneManager.goBack();
    }
  };

  const handleMuteToggle = () => {
    // Import dynamically to avoid circular dependency
    import('./core/SoundManager').then(({ soundManager }) => {
      soundManager.toggleMute();
    });
  };

  return (
    <>
      {/* Loading Screen */}
      {isLoading && (
        <div className="loading-screen">
          <div className="loading-content">
            <h1 className="loading-title shimmer-text">Eternal With Her</h1>
            <div className="loading-spinner"></div>
            <p className="loading-text">Preparing your experience...</p>
          </div>
        </div>
      )}

      {/* Game Canvas Container */}
      <div
        ref={containerRef}
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
        }}
      />

      {/* React Overlay UI */}
      <OverlayUI
        currentScene={currentScene}
        canGoBack={canGoBack}
        isMuted={isMuted}
        onBack={handleBack}
        onMuteToggle={handleMuteToggle}
      />
    </>
  );
}

export default App;
