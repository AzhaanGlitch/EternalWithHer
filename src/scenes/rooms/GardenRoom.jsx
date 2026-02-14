// src/scenes/rooms/GardenRoom.jsx
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import BaseRoom from '../BaseRoom.jsx';
import { ROOM_CONFIGS, COLORS, SCENES } from '../../core/constants.jsx';
import soundManager from '../../core/SoundManager.jsx';
import gardenImg from '../../assets/images/Garden/garden.jpeg';
import treeImg from '../../assets/images/Garden/tree.png';
import worldMapImg from '../../assets/images/Garden/world_map.png';
import stonePathImg from '../../assets/images/Garden/stone_path.png';

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
    }

    async init() {
        await super.init();

        this.createInvisibleTrigger();

        this.createGlassyBackButton();

        await this.createTreeOverlay();
        await this.createStonePathOverlay();
        await this.createWorldMapView();
    }
    createBackButton() {
    }

    // Helper: draw quad polygon
    drawQuad(g, tl, tr, br, bl) {
        g.moveTo(tl.x, tl.y);
        g.lineTo(tr.x, tr.y);
        g.lineTo(br.x, br.y);
        g.lineTo(bl.x, bl.y);
        g.closePath();
    }

    // Helper: draw arbitrary polygon
    drawPoly(g, points) {
        if (points.length < 3) return;
        g.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            g.lineTo(points[i].x, points[i].y);
        }
        g.closePath();
    }

    // ── INVISIBLE TRIGGER ──
    // ── INVISIBLE TRIGGER ──
    createInvisibleTrigger() {
        const config = {
            x: 1300, y: 600,
            p1: { x: -260, y: -100 },
            p2: { x: 90, y: -100 },
            p3: { x: 290, y: -60 },
            p4: { x: 290, y: 50 },
            p5: { x: -95, y: 110 },
            p6: { x: -260, y: -5 },
        };

        const container = new PIXI.Container();
        container.position.set(config.x, config.y);

        // 1. Glow Border for Shine Effect (Initially transparent)
        const glowBorder = new PIXI.Graphics();
        this.drawPoly(glowBorder, [config.p1, config.p2, config.p3, config.p4, config.p5, config.p6]);
        glowBorder.stroke({ width: 4, color: 0xFFFDD0, alpha: 0.8 }); // Warm white
        glowBorder.alpha = 0;

        // Add minimal blur for "shine" feel
        const blurFilter = new PIXI.BlurFilter();
        blurFilter.blur = 4;
        glowBorder.filters = [blurFilter];

        container.addChild(glowBorder);

        // 2. Invisible Hit Area
        const trigger = new PIXI.Graphics();
        this.drawPoly(trigger, [config.p1, config.p2, config.p3, config.p4, config.p5, config.p6]);
        trigger.fill({ color: 0xff0000, alpha: 0.001 });

        trigger.eventMode = 'static';
        trigger.cursor = 'pointer';

        trigger.on('pointerover', () => {
            gsap.to(glowBorder, { alpha: 1, duration: 0.3 });
        });

        trigger.on('pointerout', () => {
            gsap.to(glowBorder, { alpha: 0, duration: 0.3 });
        });

        trigger.on('pointertap', () => {
            if (!this.isInteractive) return;
            soundManager.playSFX('click');
            this.manager.change(SCENES.GARDEN_SITTING, { transition: 'fade' });
        });

        container.addChild(trigger);
        this.container.addChild(container);
        this.elements.trigger = container;
    }

    // ── GLASSY SHIMMER CLICK AREA ──
    createGlassyBackButton() {
        const config = {
            x: 360, y: 420,
            tl: { x: -103, y: -170 },
            tr: { x: 185, y: -45 },
            br: { x: 185, y: 140 },
            bl: { x: -103, y: 220 },
        };

        const glassBtn = new PIXI.Container();
        glassBtn.position.set(config.x, config.y);

        // 1. Glass Panel
        const glassPanel = new PIXI.Graphics();
        this.drawQuad(glassPanel, config.tl, config.tr, config.br, config.bl);
        glassPanel.fill({ color: 0xffffff, alpha: 0.05 });
        glassPanel.stroke({ width: 1, color: 0xffeedd, alpha: 0.2 });
        glassBtn.addChild(glassPanel);

        // 2. Shimmer Effect
        const shimmerContainer = new PIXI.Container();
        const shimmerMask = new PIXI.Graphics();
        this.drawQuad(shimmerMask, config.tl, config.tr, config.br, config.bl);
        shimmerMask.fill(0xffffff);
        shimmerContainer.addChild(shimmerMask);

        // Calculate approx width/height for shimmer sizing
        const width = Math.max(config.tr.x - config.tl.x, config.br.x - config.bl.x);
        const height = Math.max(config.bl.y - config.tl.y, config.br.y - config.tr.y);

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
            // Navigate back to Interior Scene
            this.manager.change(SCENES.INTERIOR, { transition: 'fade' });
        });

        this.container.addChild(glassBtn);
        this.elements.glassyBack = glassBtn;
    }

    async createStonePathOverlay() {
        const w = window.innerWidth, h = window.innerHeight;
        try {
            const texture = await PIXI.Assets.load(stonePathImg);

            // Container for the path elements
            const container = new PIXI.Container();
            const posX = w * 0.20;
            const posY = h * 0.82;
            container.position.set(posX, posY);

            // 1. Glow Sprite (Behind)
            const glow = new PIXI.Sprite(texture);
            glow.anchor.set(0.5);
            glow.tint = 0xFFFDD0; // Warm white
            glow.alpha = 0;

            // Add blur filter for glow effect
            const blurFilter = new PIXI.BlurFilter();
            blurFilter.blur = 15;
            glow.filters = [blurFilter];

            // Scale glow slightly larger
            glow.scale.set(1.05);

            container.addChild(glow);

            // 2. Main Sprite
            const path = new PIXI.Sprite(texture);
            path.anchor.set(0.5);

            // Adjust scale
            const maxW = w * 0.70;
            const maxH = h * 0.4;
            const scale = Math.min(maxW / texture.width, maxH / texture.height);

            path.scale.set(scale);
            glow.scale.set(scale);

            container.addChild(path);

            // Interactive
            container.eventMode = 'static';
            container.cursor = 'pointer';

            container.on('pointerover', () => {
                gsap.to(glow, { alpha: 0.8, duration: 0.3 });
                gsap.to(glow.scale, { x: scale * 1.1, y: scale * 1.1, duration: 0.3 });
                gsap.to(path.scale, { x: scale * 1.05, y: scale * 1.05, duration: 0.3 });
            });

            container.on('pointerout', () => {
                gsap.to(glow, { alpha: 0, duration: 0.3 });
                gsap.to(glow.scale, { x: scale, y: scale, duration: 0.3 });
                gsap.to(path.scale, { x: scale, y: scale, duration: 0.3 });
            });

            container.on('pointertap', () => {
                if (!this.isInteractive) return;
                soundManager.playSFX('click');
                this.manager.change(SCENES.GARDEN_PATH, { transition: 'fade' });
            });

            this.container.addChild(container);
            this.elements.stonePath = container;
        } catch (e) {
            console.warn('Failed to load stone path overlay', e);
        }
    }

    async createTreeOverlay() {
        const w = window.innerWidth, h = window.innerHeight;
        try {
            const treeTex = await PIXI.Assets.load(treeImg);
            const tree = new PIXI.Sprite(treeTex);

            const maxW = w * 0.40;
            const maxH = h * 0.9;
            const scale = Math.min(maxW / treeTex.width, maxH / treeTex.height);

            tree.scale.set(scale);
            tree.anchor.set(0.5, 1.0);

            // Position for the tree
            const treeX = 835;
            const treeY = 550;
            tree.position.set(treeX, treeY);

            // Interactive: Hover to enlarge and rotate
            tree.eventMode = 'static';
            tree.cursor = 'pointer';

            tree.on('pointerover', () => {
                const hoverScale = scale * 1.1;
                gsap.to(tree.scale, { x: hoverScale, y: hoverScale, duration: 0.3, ease: 'back.out(1.7)' });
                gsap.to(tree, { rotation: 5 * (Math.PI / 180), duration: 0.3, ease: 'back.out(1.7)' });
            });

            tree.on('pointerout', () => {
                gsap.to(tree.scale, { x: scale, y: scale, duration: 0.3, ease: 'power2.out' });
                gsap.to(tree, { rotation: 0, duration: 0.3, ease: 'power2.out' });
            });

            tree.on('pointertap', () => {
                if (!this.isInteractive) return;
                this.openWorldMapView();
            });

            this.container.addChild(tree);
            this.elements.tree = tree;
        } catch (e) {
            console.warn('Failed to load tree overlay', e);
        }
    }

    async createWorldMapView() {
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
        dimmer.on('pointertap', () => this.closeWorldMapView());
        overlay.addChild(dimmer);

        // 2. World Map Image
        try {
            const tex = await PIXI.Assets.load(worldMapImg);
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
            this.elements.worldMapImg = img;
        } catch (e) {
            console.warn('Failed to load world map image', e);
        }

        this.container.addChild(overlay);
        this.elements.worldMapOverlay = overlay;
    }

    openWorldMapView() {
        soundManager.playSFX('click');
        this.elements.worldMapOverlay.visible = true;

        // Blur background elements using PIXI.BlurFilter
        const blurFilter = new PIXI.BlurFilter();
        blurFilter.blur = 0;

        // Apply filter to background and other elements
        if (this.elements.background) this.elements.background.filters = [blurFilter];
        if (this.elements.tree) this.elements.tree.filters = [blurFilter];
        if (this.elements.trigger) this.elements.trigger.filters = [blurFilter];
        if (this.elements.glassyBack) this.elements.glassyBack.filters = [blurFilter];

        // Animate in
        const tl = gsap.timeline();
        tl.to(this.elements.worldMapOverlay, { alpha: 1, duration: 0.5 });
        tl.to(blurFilter, { blur: 8, duration: 0.5 }, '<');

        // Pop/Zoom animation for the map image
        if (this.elements.worldMapImg) {
            // Reset state
            const targetScale = this.elements.worldMapImg.targetScale || this.elements.worldMapImg.scale.x;

            if (!this.elements.worldMapImg.targetScale) {
                this.elements.worldMapImg.targetScale = targetScale;
            }

            this.elements.worldMapImg.scale.set(targetScale * 0.6);
            this.elements.worldMapImg.alpha = 0;
            this.elements.worldMapImg.rotation = -0.05;

            tl.to(this.elements.worldMapImg, {
                alpha: 1,
                scale: targetScale,
                rotation: 0,
                duration: 0.6,
                ease: 'back.out(1.5)'
            }, '<0.1');
        }

        this.currentBlurFilter = blurFilter;
    }

    closeWorldMapView() {
        soundManager.playSFX('click');

        const tl = gsap.timeline({
            onComplete: () => {
                this.elements.worldMapOverlay.visible = false;
                if (this.elements.background) this.elements.background.filters = null;
                if (this.elements.tree) this.elements.tree.filters = null;
                if (this.elements.trigger) this.elements.trigger.filters = null;
                if (this.elements.glassyBack) this.elements.glassyBack.filters = null;

                this.currentBlurFilter = null;
            }
        });

        tl.to(this.elements.worldMapOverlay, { alpha: 0, duration: 0.4 });

        // Scale down animation for exit
        if (this.elements.worldMapImg) {
            const targetScale = this.elements.worldMapImg.targetScale || this.elements.worldMapImg.scale.x;
            tl.to(this.elements.worldMapImg, {
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

    update(delta) {
        // ...
    }
}
