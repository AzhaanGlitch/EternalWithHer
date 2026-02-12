// src/core/SoundManager.js
import { Howl, Howler } from 'howler';

class SoundManager {
    constructor() {
        this.sounds = {};
        this.ambientSound = null;
        this.isMuted = false;
        this.masterVolume = 0.7;

        // Set global volume
        Howler.volume(this.masterVolume);
    }

    // Resume AudioContext (call on user interaction)
    resumeContext() {
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume();
        }
    }

    // Register a sound effect
    register(name, src, options = {}) {
        const defaultOptions = {
            loop: false,
            volume: 1.0,
            preload: true,
        };

        this.sounds[name] = new Howl({
            src: [src],
            ...defaultOptions,
            ...options,
        });

        return this.sounds[name];
    }

    // Play a registered sound
    play(name, options = {}) {
        if (this.isMuted) return null;

        const sound = this.sounds[name];
        if (!sound) {
            console.warn(`Sound "${name}" not found`);
            return null;
        }

        const id = sound.play();

        if (options.volume !== undefined) {
            sound.volume(options.volume, id);
        }

        if (options.rate !== undefined) {
            sound.rate(options.rate, id);
        }

        return id;
    }

    // Stop a specific sound
    stop(name) {
        const sound = this.sounds[name];
        if (sound) {
            sound.stop();
        }
    }

    // Set ambient/background music for a scene
    setAmbient(src, options = {}) {
        // Fade out current ambient if exists
        if (this.ambientSound) {
            const oldAmbient = this.ambientSound;
            this.ambientSound.fade(this.ambientSound.volume(), 0, 500);
            setTimeout(() => {
                oldAmbient.unload();
            }, 500);
        }

        if (!src) {
            this.ambientSound = null;
            return;
        }

        const defaultOptions = {
            loop: true,
            volume: 0.3,
            preload: true,
        };

        this.ambientSound = new Howl({
            src: [src],
            ...defaultOptions,
            ...options,
        });

        if (!this.isMuted) {
            this.ambientSound.play();
            this.ambientSound.fade(0, options.volume || 0.3, 1000);
        }
    }

    // Stop ambient sound
    stopAmbient() {
        if (this.ambientSound) {
            this.ambientSound.fade(this.ambientSound.volume(), 0, 500);
            setTimeout(() => {
                if (this.ambientSound) {
                    this.ambientSound.unload();
                    this.ambientSound = null;
                }
            }, 500);
        }
    }

    // Toggle mute
    toggleMute() {
        this.isMuted = !this.isMuted;
        Howler.mute(this.isMuted);

        // Emit event for UI updates
        window.dispatchEvent(new CustomEvent('muteChange', {
            detail: { muted: this.isMuted }
        }));

        return this.isMuted;
    }

    // Set master volume
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        Howler.volume(this.masterVolume);
    }

    // Cleanup
    destroy() {
        Object.values(this.sounds).forEach(sound => sound.unload());
        this.sounds = {};

        if (this.ambientSound) {
            this.ambientSound.unload();
            this.ambientSound = null;
        }
    }
}

// Singleton instance
export const soundManager = new SoundManager();
export default soundManager;
