// src/scenes/rooms/Balcony.jsx
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import BaseRoom from '../BaseRoom.jsx';
import { ROOM_CONFIGS } from '../../core/constants.jsx';
import soundManager from '../../core/SoundManager.jsx';
import balconyImg from '../../assets/images/BedRoom/balcony.png';
import aptechImg from '../../assets/images/Balcony/aptech.jpeg';
import citicenterImg from '../../assets/images/Balcony/citicenter.jpeg';
import cafecomixImg from '../../assets/images/Balcony/cafecomix.jpeg';

// --- CONFIGURATION ---
const CLICK_AREAS_CONFIG = [
    {
        id: 'aptech',
        image: aptechImg,
        points: [
            1, 245,
            600, 245,
            600, 530,
            300, 560,
            1, 580
        ]
    },
    {
        id: 'cafecomix',
        image: cafecomixImg,
        points: [
            600, 245,
            1200, 245,
            1200, 485,
            950, 505,
            600, 530
        ]
    },
    {
        id: 'citicenter',
        image: citicenterImg,
        points: [
            1200, 245,
            1670, 245,
            1670, 490,
            1320, 478,
            1200, 485
        ]
    },
];

export default class Balcony extends BaseRoom {
    constructor(manager) {
        console.log("Balcony scene constructor called");
        super(manager, {
            title: ROOM_CONFIGS.BALCONY.title,
            subtitle: ROOM_CONFIGS.BALCONY.subtitle,
            backgroundImage: balconyImg,
            backgroundColor: ROOM_CONFIGS.BALCONY.color,
            gradientTop: ROOM_CONFIGS.BALCONY.gradientTop,
            gradientBottom: ROOM_CONFIGS.BALCONY.gradientBottom,
        });

        this.loadedTextures = {};
        this.isOverlayOpen = false;
        this.shimmerTweens = [];
    }

    async init() {
        console.log("Balcony init starting");
        try {
            await super.init();

            // Load all overlay textures
            await this.loadOverlayTextures();

            // Create the click areas
            this.createClickAreas();

            // Create the shared overlay container
            this.createOverlay();

            console.log("Balcony init completed successfully");
        } catch (err) {
            console.error("Balcony init failed critical error:", err);
            this.createFallbackBackground();
        }
    }

    async loadOverlayTextures() {
        // Preload textures for smooth opening
        for (const area of CLICK_AREAS_CONFIG) {
            try {
                const texture = await PIXI.Assets.load(area.image);
                this.loadedTextures[area.id] = texture;
            } catch (e) {
                console.error(`Failed to load texture for ${area.id}:`, e);
            }
        }
    }

    createClickAreas() {
        this.elements.clickAreas = [];

        CLICK_AREAS_CONFIG.forEach(config => {
            const container = new PIXI.Container();

            // 1. Define polygon path
            const path = config.points;

            // 2. Base invisible interactive area
            const glass = new PIXI.Graphics();
            glass.poly(path);
            glass.fill({ color: 0xffffff, alpha: 0.001 }); // Almost invisible but interactive

            // 3. Shimmer Effect
            // Shimmer mask (same polygon)
            const mask = new PIXI.Graphics();
            mask.poly(path);
            mask.fill(0xffffff);

            container.mask = mask;
            container.addChild(mask); // Add mask to container so it applies to children

            // Shimmer gradient bar
            const xCoords = path.filter((_, i) => i % 2 === 0);
            const yCoords = path.filter((_, i) => i % 2 === 1);
            const minX = Math.min(...xCoords);
            const maxX = Math.max(...xCoords);
            const minY = Math.min(...yCoords);
            const maxY = Math.max(...yCoords);
            const height = maxY - minY;
            const width = maxX - minX;

            const shimmer = new PIXI.Graphics();
            // Draw a slanted transparent white bar
            shimmer.poly([
                0, 0,
                100, 0,
                200, height + 400, // Make it tall enough
                100, height + 400
            ]);
            shimmer.fill({ color: 0xffffff, alpha: 0.3 });
            shimmer.x = minX - 300; // Start off-left
            shimmer.y = minY - 100;

            container.addChild(glass);
            container.addChild(shimmer);

            // 4. Interactivity
            container.eventMode = 'static';
            container.cursor = 'pointer';

            container.on('pointerover', () => {
                if (this.isOverlayOpen) return;
                gsap.to(glass, { alpha: 0.3, duration: 0.3 });
            });

            container.on('pointerout', () => {
                gsap.to(glass, { alpha: 0.1, duration: 0.3 });
            });

            container.on('pointertap', () => {
                this.openOverlay(config.id);
            });

            // 5. Animate Shimmer
            const tween = gsap.to(shimmer, {
                x: maxX + 100, // Move past the right edge
                duration: 2.5 + Math.random(), // Slight random duration
                repeat: -1,
                ease: "none",
                delay: Math.random() * 2 // Random start delay
            });
            this.shimmerTweens.push(tween);

            this.elements.clickAreas.push(container);
            this.container.addChild(container);
        });
    }

    createOverlay() {
        this.overlayContainer = new PIXI.Container();
        this.overlayContainer.visible = false;
        this.overlayContainer.alpha = 0;
        this.overlayContainer.zIndex = 1000; // Ensure it's on top of everything

        const { width, height } = this.getScreenSize();

        // 1. Background Dimmer
        const bgDim = new PIXI.Graphics();
        bgDim.rect(0, 0, width, height);
        bgDim.fill({ color: 0x000000, alpha: 1.0 }); // Full black background
        bgDim.eventMode = 'static';
        bgDim.cursor = 'default';
        bgDim.on('pointertap', (e) => e.stopPropagation());

        this.overlayContainer.addChild(bgDim);
        this.elements.overlayBg = bgDim;

        // 2. Image Sprite holder
        const imageSprite = new PIXI.Sprite();
        imageSprite.anchor.set(0.5);
        imageSprite.x = width / 2;
        imageSprite.y = height / 2;
        this.overlayContainer.addChild(imageSprite);
        this.elements.overlayImage = imageSprite;

        // 3. Back Button - Simple Text (Matching BaseRoom)
        const backBtn = new PIXI.Text({
            text: '← Back',
            style: {
                fontFamily: 'Inter, Arial',
                fontSize: 18,
                fill: 0xffffff,
                fontWeight: '500',
            }
        });
        backBtn.anchor.set(0, 0);
        backBtn.position.set(30, 30);
        backBtn.eventMode = 'static';
        backBtn.cursor = 'pointer';

        backBtn.on('pointerover', () => {
            gsap.to(backBtn, { alpha: 0.7, duration: 0.2 });
            gsap.to(backBtn.scale, { x: 1.05, y: 1.05, duration: 0.2 });
        });
        backBtn.on('pointerout', () => {
            gsap.to(backBtn, { alpha: 1, duration: 0.2 });
            gsap.to(backBtn.scale, { x: 1, y: 1, duration: 0.2 });
        });

        backBtn.on('pointertap', () => {
            this.closeOverlay();
        });

        this.elements.overlayBackBtn = backBtn;
        this.overlayContainer.addChild(backBtn);

        this.container.addChild(this.overlayContainer);
    }

    openOverlay(id) {
        if (this.isOverlayOpen) return;

        const texture = this.loadedTextures[id];
        if (!texture) {
            console.error("Texture not loaded for:", id);
            return;
        }

        soundManager.playSFX('click');
        this.isOverlayOpen = true;

        // Set texture
        this.elements.overlayImage.texture = texture;

        const { width, height } = this.getScreenSize();

        // FULL SCREEN SCALING (COVER)
        const imgAspect = texture.width / texture.height;
        const screenAspect = width / height;
        let scale;

        if (screenAspect > imgAspect) {
            // Screen is wider than image: match width
            scale = width / texture.width;
        } else {
            // Screen is taller than image: match height
            scale = height / texture.height;
        }

        // Alternatively use Math.max for Cover
        // scale = Math.max(width / texture.width, height / texture.height);

        this.elements.overlayImage.scale.set(scale);

        this.overlayContainer.visible = true;

        // Blur background scene
        const blur = new PIXI.BlurFilter(8);
        if (this.elements.background) this.elements.background.filters = [blur];
        if (this.elements.clickAreas) {
            this.elements.clickAreas.forEach(area => area.filters = [blur]);
        }

        // Animate In
        gsap.to(this.overlayContainer, { alpha: 1, duration: 0.4 });
        gsap.from(this.elements.overlayImage.scale, {
            x: scale * 0.9,
            y: scale * 0.9,
            duration: 0.4,
            ease: 'back.out(1.2)'
        });
    }

    closeOverlay() {
        if (!this.isOverlayOpen) return;

        soundManager.playSFX('click');

        // Remove filters
        if (this.elements.background) this.elements.background.filters = [];
        if (this.elements.clickAreas) {
            this.elements.clickAreas.forEach(area => area.filters = []);
        }

        // Animate Out
        gsap.to(this.overlayContainer, {
            alpha: 0,
            duration: 0.3,
            onComplete: () => {
                this.overlayContainer.visible = false;
                this.isOverlayOpen = false;
                this.elements.overlayImage.texture = null; // Clear texture
            }
        });
    }

    createFallbackBackground() {
        const { width, height } = this.getScreenSize();
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, width, height);
        bg.fill(0x333333);
        this.container.addChildAt(bg, 0);
        console.log("Balcony fallback background created.");
    }

    exit() {
        super.exit();
        // Kill animations
        this.shimmerTweens.forEach(t => t.kill());
        this.shimmerTweens = [];
        gsap.killTweensOf(this.overlayContainer);
        if (this.overlayContainer && this.overlayContainer.children) {
            gsap.killTweensOf(this.overlayContainer.children);
        }
    }

    resize() {
        super.resize();
        const { width, height } = this.getScreenSize();

        if (this.elements.overlayBg) {
            this.elements.overlayBg.clear();
            this.elements.overlayBg.rect(0, 0, width, height);
            this.elements.overlayBg.fill({ color: 0x000000, alpha: 1.0 });
        }

        if (this.elements.overlayImage && this.isOverlayOpen && this.elements.overlayImage.texture) {
            this.elements.overlayImage.x = width / 2;
            this.elements.overlayImage.y = height / 2;

            const tex = this.elements.overlayImage.texture;
            const imgAspect = tex.width / tex.height;
            const screenAspect = width / height;
            let scale;

            if (screenAspect > imgAspect) {
                scale = width / tex.width;
            } else {
                scale = height / tex.height;
            }
            this.elements.overlayImage.scale.set(scale);
        }
    }
}
