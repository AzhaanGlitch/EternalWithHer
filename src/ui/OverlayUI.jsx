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

  const sceneInfo = SCENE_INFO[currentScene] || { label: currentScene, icon: Heart, color: '#D4AF37' };
  const IconComponent = sceneInfo.icon;

  return (
    <div className="overlay-ui">
      {/* Top Bar */}
      <div className="top-bar">
        {/* Logo/Brand */}
        <div className="brand">
          <Heart className="brand-icon" size={20} />
          <span className="brand-text">Eternal With Her</span>
        </div>

        {/* Scene Indicator */}
        <div className="scene-indicator" style={{ '--accent-color': sceneInfo.color }}>
          <IconComponent className="scene-icon" size={18} />
          <span className="scene-label">{sceneInfo.label}</span>
        </div>
      </div>

      {/* Bottom Controls */}
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

        {/* Center - Scene subtitle */}
        <div className="scene-subtitle">
          {currentScene && SCENE_INFO[currentScene]?.label && (
            <Sparkles className="subtitle-icon" size={14} />
          )}
        </div>

        {/* Right side - Mute button */}
        <div className="controls-right">
          <button
            className={`control-btn mute-btn ${isMuted ? 'muted' : ''}`}
            onClick={onMuteToggle}
            onMouseEnter={() => setShowTooltip('mute')}
            onMouseLeave={() => setShowTooltip(null)}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            {showTooltip === 'mute' && (
              <span className="tooltip">{isMuted ? 'Unmute' : 'Mute'}</span>
            )}
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="corner-flourish top-left">
        <svg viewBox="0 0 60 60" fill="none">
          <path d="M0 60 Q0 0 60 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="55" cy="5" r="2" fill="currentColor" />
        </svg>
      </div>
      <div className="corner-flourish top-right">
        <svg viewBox="0 0 60 60" fill="none">
          <path d="M60 60 Q60 0 0 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="5" cy="5" r="2" fill="currentColor" />
        </svg>
      </div>
      <div className="corner-flourish bottom-left">
        <svg viewBox="0 0 60 60" fill="none">
          <path d="M0 0 Q0 60 60 60" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="55" cy="55" r="2" fill="currentColor" />
        </svg>
      </div>
      <div className="corner-flourish bottom-right">
        <svg viewBox="0 0 60 60" fill="none">
          <path d="M60 0 Q60 60 0 60" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="5" cy="55" r="2" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
