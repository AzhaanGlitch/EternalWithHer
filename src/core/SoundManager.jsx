// src/core/SoundManager.js
import { Howl, Howler } from 'howler';

class SoundManager {
    constructor() {
        this.sounds = {};
        this.ambientSound = null;
        this.currentSFX = null;       // currently playing SFX name
        this.currentSFXId = null;     // Howl play-id of that SFX
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

    // Stop a specific sound (immediately)
    stop(name) {
        const sound = this.sounds[name];
        if (sound) {
            sound.stop();
        }
    }

    // Stop a specific sound with a fade-out effect
    stopWithFade(name, fadeDuration = 500) {
        const sound = this.sounds[name];
        if (!sound) return;

        // Get the current volume before fading
        const currentVol = sound.volume();
        sound.fade(currentVol, 0, fadeDuration);
        setTimeout(() => {
            sound.stop();
            sound.volume(currentVol); // restore original volume for next play
        }, fadeDuration);
    }

    /**
     * Play a one-shot SFX with automatic crossfade management.
     * If another SFX is currently playing, it fades out before the new one starts.
     * @param {string} name - Registered sound name
     * @param {object} options - { volume, rate, fadeDuration }
     */
    playSFX(name, options = {}) {
        if (this.isMuted) return null;

        const fadeDuration = options.fadeDuration || 400;

        // Fade out previous SFX if one is playing
        if (this.currentSFX && this.currentSFX !== name) {
            this.stopWithFade(this.currentSFX, fadeDuration);
        }

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

        this.currentSFX = name;
        this.currentSFXId = id;

        // When the SFX ends naturally, clear the tracker
        sound.once('end', () => {
            if (this.currentSFX === name) {
                this.currentSFX = null;
                this.currentSFXId = null;
            }
        }, id);

        return id;
    }

    // Stop the current SFX with fade out
    stopSFX(fadeDuration = 400) {
        if (this.currentSFX) {
            this.stopWithFade(this.currentSFX, fadeDuration);
            this.currentSFX = null;
            this.currentSFXId = null;
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
