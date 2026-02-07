import { createContext, useContext, useEffect, useRef } from 'react';
import { Howl } from 'howler';

const SoundContext = createContext();

export const SoundProvider = ({ children, view }) => {
    const currentSound = useRef(null);

    useEffect(() => {
        // Stop current sound
        if (currentSound.current) {
            currentSound.current.fade(0.5, 0, 1000); // Fade out over 1s
            setTimeout(() => {
                currentSound.current.stop();
            }, 1000);
        }

        // Determine new sound based on view
        let soundSrc = null;
        let loop = true;

        switch (view) {
            case 'ENTRANCE':
                // soundSrc = '/sounds/wind_chimes.mp3'; 
                break;
            case 'HALLWAY':
                // soundSrc = '/sounds/hallway_ambience.mp3';
                break;
            case 'DANCE_ROOM':
                // soundSrc = '/sounds/upbeat_dance.mp3';
                break;
            case 'BEDROOM':
                // soundSrc = '/sounds/lofi_chill.mp3';
                break;
            case 'GARDEN':
                // soundSrc = '/sounds/birds_nature.mp3';
                break;
            default:
                break;
        }

        if (soundSrc) {
            const sound = new Howl({
                src: [soundSrc],
                loop: loop,
                volume: 0
            });

            sound.play();
            sound.fade(0, 0.5, 1000); // Fade in
            currentSound.current = sound;
        }

    }, [view]);

    return (
        <SoundContext.Provider value={{}}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => useContext(SoundContext);
