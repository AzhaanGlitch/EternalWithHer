import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import BaseRoom from '../BaseRoom.jsx';
import { ROOM_CONFIGS, SCENES } from '../../core/constants.jsx';
import soundManager from '../../core/SoundManager.jsx';
import stonePathTopPovImg from '../../assets/images/Garden/stone_path_top_pov.jpeg';

export default class GardenPath extends BaseRoom {
    constructor(manager) {
        super(manager, {
            title: ROOM_CONFIGS.GARDEN_PATH.title,
            subtitle: ROOM_CONFIGS.GARDEN_PATH.subtitle,
            backgroundImage: stonePathTopPovImg,
            backgroundColor: ROOM_CONFIGS.GARDEN_PATH.color,
            gradientTop: ROOM_CONFIGS.GARDEN_PATH.gradientTop,
            gradientBottom: ROOM_CONFIGS.GARDEN_PATH.gradientBottom,
        });
    }

    async init() {
        await super.init();
        this.createSoundAreas();
    }

    createSoundAreas() {
        // Define 7 areas with initial positions (spread out over the path/screen)
        const areas = [
            { id: 'area1', x: 430, y: 70, radius: 60, sound: 'garden_1' },
            { id: 'area2', x: 600, y: 100, radius: 50, sound: 'garden_2' },
            { id: 'area3', x: 600, y: 220, radius: 50, sound: 'garden_3' },
            { id: 'area4', x: 600, y: 380, radius: 70, sound: 'garden_4' },
            { id: 'area5', x: 510, y: 570, radius: 60, sound: 'garden_5' },
            { id: 'area6', x: 540, y: 720, radius: 65, sound: 'garden_6' },
            { id: 'area7', x: 540, y: 930, radius: 110, sound: 'garden_7' },
        ];

        areas.forEach((areaConfig) => {
            const area = new PIXI.Graphics();
            area.circle(0, 0, areaConfig.radius);
            area.fill({ color: 0xffffff, alpha: 0.05 });

            // Minute shimmer effect: blur and subtle alpha pulse
            const blurFilter = new PIXI.BlurFilter();
            blurFilter.blur = 10;
            area.filters = [blurFilter];

            area.position.set(areaConfig.x, areaConfig.y);
            area.eventMode = 'static';
            area.cursor = 'pointer';

            // Shimmer animation
            const shimmerTween = gsap.to(area, {
                alpha: 0.15,
                duration: 2,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });

            // Register Sound
            // Use numeric ID from areaConfig.id (e.g. 'area1' -> '1') for the file name
            const idNum = areaConfig.id.replace('area', '');
            const soundPath = `/assets/sounds/Garden/${idNum}.mpeg`;

            // Register with existing 'garden_1' naming key, but use new path
            soundManager.register(areaConfig.sound, soundPath, { loop: true, volume: 0.6 });

            area.on('pointerover', () => {
                shimmerTween.pause();
                gsap.to(area, { alpha: 0.3, duration: 0.3 }); // Enhance visibility on hover
                // Play sound (previous sound will automatically stop handled by soundManager.playSFX)
                soundManager.playSFX(areaConfig.sound, { fadeDuration: 200 });
            });

            area.on('pointerout', () => {
                gsap.to(area, {
                    alpha: 0.05,
                    duration: 0.3,
                    onComplete: () => shimmerTween.resume()
                });
                // Stop sound when leaving the area
                soundManager.stopSFX(200);
            });

            this.container.addChild(area);
        });
    }

    // Override createBackButton to navigate to GARDEN instead of history back
    createBackButton() {
        const text = new PIXI.Text({
            text: '← Back',
            style: {
                fontFamily: 'Inter, Arial',
                fontSize: 18,
                fill: 0xffffff,
                fontWeight: '500',
            }
        });
        text.anchor.set(0, 0);
        text.position.set(30, 30);

        text.eventMode = 'static';
        text.cursor = 'pointer';

        text.on('pointerover', () => {
            gsap.to(text, { alpha: 0.7, duration: 0.2 });
            gsap.to(text.scale, { x: 1.05, y: 1.05, duration: 0.2 });
        });
        text.on('pointerout', () => {
            gsap.to(text, { alpha: 1, duration: 0.2 });
            gsap.to(text.scale, { x: 1, y: 1, duration: 0.2 });
        });
        text.on('pointertap', () => {
            if (this.isInteractive) {
                soundManager.playSFX('click');
                // Navigate specifically to GARDEN scene
                this.manager.change(SCENES.GARDEN, { transition: 'fade' });
            }
        });

        this.elements.backButton = text;
        this.container.addChild(text);
    }
}
