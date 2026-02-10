import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Heart,
  Sparkles,
  Home,
  Music,
  Gamepad2,
  UtensilsCrossed,
  Bed,
  Sofa,
  BookOpen,
  Flower2,
  X
} from 'lucide-react';
import './OverlayUI.css';

// Map scenes to their icons and labels
const SCENE_INFO = {
  CURTAIN: { label: 'Grand Entrance', icon: Sparkles, color: '#D4AF37' },
  HOUSE: { label: 'The House', icon: Home, color: '#D4AF37' },
  INTERIOR: { label: 'Hallway', icon: Heart, color: '#D4AF37' },
  LIVING: { label: 'Living Room', icon: Sofa, color: '#8b7355' },
  BEDROOM: { label: 'Bedroom', icon: Bed, color: '#dda0dd' },
  KITCHEN: { label: 'Kitchen', icon: UtensilsCrossed, color: '#faf0e6' },
  GAMING: { label: 'Gaming Room', icon: Gamepad2, color: '#00ffff' },
  DANCE: { label: 'Dance Room', icon: Music, color: '#ff69b4' },
  STUDY: { label: 'Study Room', icon: BookOpen, color: '#4ade80' },
  GARDEN: { label: 'Garden', icon: Flower2, color: '#22c55e' },
};

export default function OverlayUI({
  currentScene,
  canGoBack,
  isMuted,
  onBack,
  onMuteToggle
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="overlay-ui">
      {/* Bottom Controls - Only mute button and back button when available */}
      <div className="bottom-bar">
        {/* Left side - Back button */}
        <div className="controls-left">
          {canGoBack && (
            <button
              className="control-btn back-btn"
              onClick={onBack}
              onMouseEnter={() => setShowTooltip('back')}
              onMouseLeave={() => setShowTooltip(null)}
              aria-label="Go Back"
            >
              <ArrowLeft size={20} />
              <span className="btn-text">Back</span>
              {showTooltip === 'back' && (
                <span className="tooltip">Return to previous room</span>
              )}
            </button>
          )}
        </div>

        {/* Right side - Minimal mute button (icon only, no circle) */}
        <div className="controls-right">
          <button
            className={`mute-btn-minimal ${isMuted ? 'muted' : ''}`}
            onClick={onMuteToggle}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>
        </div>
      </div>
    </div>
  );
}
