// src/scenes/rooms/GardenRoom.jsx
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import BaseRoom from '../BaseRoom.jsx';
import { ROOM_CONFIGS, COLORS, SCENES } from '../../core/constants.jsx';
import soundManager from '../../core/SoundManager.jsx';
import gardenImg from '../../assets/images/Garden/garden.jpeg';
import sittingAreaImg from '../../assets/images/Garden/SittingArea.jpeg';
import lettersImg from '../../assets/images/Garden/letters.png';

export default class GardenRoom extends BaseRoom {
    constructor(manager) {
        super(manager, {
            title: ROOM_CONFIGS.GARDEN.title,
            subtitle: ROOM_CONFIGS.GARDEN.subtitle,
            backgroundImage: gardenImg,
            backgroundColor: ROOM_CONFIGS.GARDEN.color,
            gradientTop: ROOM_CONFIGS.GARDEN.gradientTop,
            gradientBottom: ROOM_CONFIGS.GARDEN.gradientBottom,
        });

        this.tweens = [];
        this.sitiingViewOpen = false;
    }

    async init() {
        // Base init creates the background
        await super.init();

        // Create the special "Sitting Area" view (initially hidden)
        await this.createSittingView();

        // Create the invisible trigger to open Sitting Area
        this.createInvisibleTrigger();

        // Create the custom glassy back button (replacing the default one)
        this.createGlassyBackButton();
    }

    // Override the default back button to do nothing (effectively removing it)
    createBackButton() {
        // Do nothing
    }

    // ── INVISIBLE TRIGGER (Opens Sitting Area) ──
    createInvisibleTrigger() {
        const w = window.innerWidth, h = window.innerHeight;

        // Define a hit area (e.g., center-right/bottom area)
        const trigger = new PIXI.Graphics();
        trigger.rect(0, 0, 300, 300); // 300x300 clickable zone
        trigger.fill({ color: 0xff0000, alpha: 0.001 }); // Invisible

        // Position roughly in the "garden path" area (adjust as needed)
        trigger.x = w * 0.6;
        trigger.y = h * 0.5;
        trigger.rotation = 0.2;

        trigger.eventMode = 'static';
        trigger.cursor = 'pointer';

        trigger.on('pointertap', () => {
            if (this.sitiingViewOpen) return;
            this.openSittingView();
        });

        this.container.addChild(trigger);
        this.elements.trigger = trigger;
    }

    // ── GLASSY SHIMMER CLICK AREA (Navigates to Interior) ──
    createGlassyBackButton() {
        // Position of the shimmer area
        const x = 200;
        const y = 100;
        const width = 200;
        const height = 120;

        const glassBtn = new PIXI.Container();
        glassBtn.position.set(x, y);

        // Rectangle definition
        const tl = { x: -width / 2, y: -height / 2 };
        const tr = { x: width / 2, y: -height / 2 };
        const br = { x: width / 2, y: height / 2 };
        const bl = { x: -width / 2, y: height / 2 };

        // -- Helpers from InteriorScene (simplified) --
        const drawQuad = (g, tl, tr, br, bl) => {
            g.moveTo(tl.x, tl.y);
            g.lineTo(tr.x, tr.y);
            g.lineTo(br.x, br.y);
            g.lineTo(bl.x, bl.y);
            g.closePath();
        };

        // 1. Glass Panel
        const glassPanel = new PIXI.Graphics();
        drawQuad(glassPanel, tl, tr, br, bl);
        glassPanel.fill({ color: 0xffffff, alpha: 0.05 }); // Very subtle
        glassPanel.stroke({ width: 1, color: 0xffeedd, alpha: 0.2 });
        glassBtn.addChild(glassPanel);

        // 2. Shimmer Effect
        const shimmerContainer = new PIXI.Container();
        const shimmerMask = new PIXI.Graphics();
        drawQuad(shimmerMask, tl, tr, br, bl);
        shimmerMask.fill(0xffffff);
        shimmerContainer.addChild(shimmerMask);

        const shimmer = new PIXI.Graphics();
        const stripeW = width * 0.4;
        shimmer.rect(-stripeW, -height, stripeW, height * 2);
        shimmer.fill({ color: 0xffffff, alpha: 0.15 });
        shimmer.rotation = 0.5;
        shimmer.mask = shimmerMask;
        shimmerContainer.addChild(shimmer);
        glassBtn.addChild(shimmerContainer);

        gsap.to(shimmer, {
            x: width * 1.5,
            duration: 2,
            ease: 'power1.inOut',
            repeat: -1,
            repeatDelay: 2.5
        });

        // Interactivity
        glassBtn.eventMode = 'static';
        glassBtn.cursor = 'pointer';

        glassBtn.on('pointerover', () => {
            gsap.to(glassPanel, { alpha: 0.15, duration: 0.3 });
        });
        glassBtn.on('pointerout', () => {
            gsap.to(glassPanel, { alpha: 0.05, duration: 0.3 });
        });
        glassBtn.on('pointertap', () => {
            if (!this.isInteractive) return;
            soundManager.playSFX('click');
            this.manager.goBack(); // Back to Interior
        });

        this.container.addChild(glassBtn);
        this.elements.glassyBack = glassBtn;
    }

    // ── SITTING AREA VIEW (Sub-scene) ──
    async createSittingView() {
        const w = window.innerWidth, h = window.innerHeight;

        // Container for the entire view
        const view = new PIXI.Container();
        view.alpha = 0;
        view.visible = false;

        // 1. Background Image (Sitting Area)
        try {
            const texture = await PIXI.Assets.load(sittingAreaImg);
            const bg = new PIXI.Sprite(texture);

            // Cover scaling
            const imgAspect = texture.width / texture.height;
            const screenAspect = w / h;
            if (screenAspect > imgAspect) {
                bg.width = w;
                bg.height = w / imgAspect;
            } else {
                bg.height = h;
                bg.width = h * imgAspect;
            }
            bg.x = (w - bg.width) / 2;
            bg.y = (h - bg.height) / 2;

            view.addChild(bg);
        } catch (e) {
            console.warn('Failed to load sitting area bg', e);
        }

        // 2. Overlay Image (Letters)
        try {
            const letterTex = await PIXI.Assets.load(lettersImg);
            const letter = new PIXI.Sprite(letterTex);

            // Scale to fit reasonably within screen (e.g., 80% height or width)
            const maxW = w * 0.8;
            const maxH = h * 0.8;
            const scale = Math.min(maxW / letterTex.width, maxH / letterTex.height);

            letter.scale.set(scale);
            letter.anchor.set(0.5);
            letter.position.set(w / 2, h / 2);

            // Add subtle floating animation
            gsap.to(letter, {
                y: h / 2 - 10,
                duration: 2.5,
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut'
            });

            view.addChild(letter);
        } catch (e) {
            console.warn('Failed to load letters overlay', e);
        }

        // 3. Minimal White Back Button
        const backText = new PIXI.Text({
            text: '← Back',
            style: {
                fontFamily: 'Inter, Arial',
                fontSize: 18,
                fill: 0xffffff,
                fontWeight: '500',
            }
        });
        backText.anchor.set(0, 0);
        backText.position.set(30, 30);

        backText.eventMode = 'static';
        backText.cursor = 'pointer';

        backText.on('pointerover', () => {
            gsap.to(backText, { alpha: 0.7, duration: 0.2 });
            gsap.to(backText.scale, { x: 1.05, y: 1.05, duration: 0.2 });
        });
        backText.on('pointerout', () => {
            gsap.to(backText, { alpha: 0.8, duration: 0.2 });
            gsap.to(backText.scale, { x: 1, y: 1, duration: 0.2 });
        });
        backText.on('pointertap', () => {
            this.closeSittingView();
        });

        view.addChild(backText);

        this.container.addChild(view);
        this.elements.sittingView = view;
    }

    openSittingView() {
        this.sitiingViewOpen = true;
        this.elements.sittingView.visible = true;
        soundManager.playSFX('click');

        // Fade in siting view
        gsap.to(this.elements.sittingView, { alpha: 1, duration: 0.8 });

        // Hide/Fade Main Elements? 
        // We can just overlay it.
    }

    closeSittingView() {
        soundManager.playSFX('click');
        gsap.to(this.elements.sittingView, {
            alpha: 0,
            duration: 0.6,
            onComplete: () => {
                this.elements.sittingView.visible = false;
                this.sitiingViewOpen = false;
            }
        });
    }

    update(delta) {
        // ...
    }
}
