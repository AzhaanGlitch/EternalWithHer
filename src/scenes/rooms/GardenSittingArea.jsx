// src/scenes/rooms/GardenSittingArea.jsx
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import BaseRoom from '../BaseRoom.jsx';
import { ROOM_CONFIGS, SCENES } from '../../core/constants.jsx';
import soundManager from '../../core/SoundManager.jsx';
import sittingAreaImg from '../../assets/images/Garden/SittingArea.jpeg';
import lettersImg from '../../assets/images/Garden/letters.png';
import openLetterImg from '../../assets/images/Garden/open_letter.png';

export default class GardenSittingArea extends BaseRoom {
    constructor(manager) {
        super(manager, {
            title: ROOM_CONFIGS.GARDEN_SITTING.title,
            subtitle: ROOM_CONFIGS.GARDEN_SITTING.subtitle,
            backgroundImage: sittingAreaImg,
            backgroundColor: ROOM_CONFIGS.GARDEN_SITTING.color,
            gradientTop: ROOM_CONFIGS.GARDEN_SITTING.gradientTop,
            gradientBottom: ROOM_CONFIGS.GARDEN_SITTING.gradientBottom,
        });
    }

    async init() {
        await super.init();
        await this.createLettersOverlay();
        await this.createOpenLetterView();
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

    async createLettersOverlay() {
        const w = window.innerWidth, h = window.innerHeight;
        try {
            const letterTex = await PIXI.Assets.load(lettersImg);
            const letter = new PIXI.Sprite(letterTex);

            // Scale to fit reasonably within screen
            const maxW = w * 0.1;
            const maxH = h * 0.1;
            const scale = Math.min(maxW / letterTex.width, maxH / letterTex.height);

            letter.scale.set(scale);
            letter.anchor.set(0.5);
            const letterX = 990;
            const letterY = 800;
            letter.position.set(letterX, letterY);

            // Interactive: Hover to enlarge and rotate
            letter.eventMode = 'static';
            letter.cursor = 'pointer';

            letter.on('pointerover', () => {
                const hoverScale = scale * 1.2;
                gsap.to(letter.scale, { x: hoverScale, y: hoverScale, duration: 0.3, ease: 'back.out(1.7)' });
                gsap.to(letter, { rotation: 10 * (Math.PI / 180), duration: 0.3, ease: 'back.out(1.7)' });
            });

            letter.on('pointerout', () => {
                gsap.to(letter.scale, { x: scale, y: scale, duration: 0.3, ease: 'power2.out' });
                gsap.to(letter, { rotation: 0, duration: 0.3, ease: 'power2.out' });
            });

            letter.on('pointertap', () => {
                if (!this.isInteractive) return;
                this.openLetterView();
            });

            this.container.addChild(letter);
            this.elements.letter = letter;
        } catch (e) {
            console.warn('Failed to load letters overlay', e);
        }
    }

    async createOpenLetterView() {
        const w = window.innerWidth, h = window.innerHeight;

        const overlay = new PIXI.Container();
        overlay.visible = false;
        overlay.alpha = 0;

        // 1. Dimmer / Blur Backdrop (Click to close)
        const dimmer = new PIXI.Graphics();
        dimmer.rect(0, 0, w, h);
        dimmer.fill({ color: 0x000000, alpha: 0.6 });
        dimmer.eventMode = 'static';
        dimmer.cursor = 'pointer';
        dimmer.on('pointertap', () => this.closeLetterView());
        overlay.addChild(dimmer);

        // 2. Open Letter Image
        try {
            const tex = await PIXI.Assets.load(openLetterImg);
            const img = new PIXI.Sprite(tex);

            // Scale to fit screen (e.g. 85% of height)
            const maxH = h * 0.85;
            const maxW = w * 0.9;
            const scale = Math.min(maxW / tex.width, maxH / tex.height);

            img.scale.set(scale);
            img.anchor.set(0.5);
            img.position.set(w / 2, h / 2);

            // Prevent clicks on the image from closing the view
            img.eventMode = 'static';
            img.on('pointertap', (e) => {
                e.stopPropagation();
            });

            overlay.addChild(img);
            this.elements.openLetterImg = img;
        } catch (e) {
            console.warn('Failed to load open letter image', e);
        }

        this.container.addChild(overlay);
        this.elements.overlay = overlay;
    }

    openLetterView() {
        soundManager.playSFX('click');
        this.elements.overlay.visible = true;

        // Blur background elements using PIXI.BlurFilter
        const blurFilter = new PIXI.BlurFilter();
        blurFilter.blur = 0;

        // Apply filter to background and small letter
        if (this.elements.background) this.elements.background.filters = [blurFilter];
        if (this.elements.letter) this.elements.letter.filters = [blurFilter];
        if (this.elements.backButton) this.elements.backButton.visible = false; // Hide back button

        // Animate in
        const tl = gsap.timeline();
        tl.to(this.elements.overlay, { alpha: 1, duration: 0.5 });
        tl.to(blurFilter, { blur: 8, duration: 0.5 }, '<');

        // Pop/Zoom animation for the letter image
        if (this.elements.openLetterImg) {
            // Reset state
            const targetScale = this.elements.openLetterImg.targetScale || this.elements.openLetterImg.scale.x;
          
            if (!this.elements.openLetterImg.targetScale) {
                this.elements.openLetterImg.targetScale = targetScale;
            }

            this.elements.openLetterImg.scale.set(targetScale * 0.6);
            this.elements.openLetterImg.alpha = 0;
            this.elements.openLetterImg.rotation = -0.1; 

            tl.to(this.elements.openLetterImg, {
                alpha: 1,
                scale: targetScale,
                rotation: 0,
                duration: 0.6,
                ease: 'back.out(1.5)'
            }, '<0.1');
        }

        this.currentBlurFilter = blurFilter;
    }

    closeLetterView() {
        soundManager.playSFX('click');

        const tl = gsap.timeline({
            onComplete: () => {
                this.elements.overlay.visible = false;
                if (this.elements.background) this.elements.background.filters = null;
                if (this.elements.letter) this.elements.letter.filters = null;
                if (this.elements.backButton) this.elements.backButton.visible = true;
                this.currentBlurFilter = null;
            }
        });

        tl.to(this.elements.overlay, { alpha: 0, duration: 0.4 });

        // Scale down animation for exit
        if (this.elements.openLetterImg) {
            const targetScale = this.elements.openLetterImg.targetScale || this.elements.openLetterImg.scale.x;
            tl.to(this.elements.openLetterImg, {
                scale: targetScale * 0.8,
                alpha: 0,
                duration: 0.3,
                ease: 'power2.in'
            }, '<');
        }

        if (this.currentBlurFilter) {
            tl.to(this.currentBlurFilter, { blur: 0, duration: 0.4 }, '<');
        }
    }
}
