// src/scenes/rooms/GardenRoom.jsx
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import BaseRoom from '../BaseRoom.jsx';
import { ROOM_CONFIGS, COLORS, SCENES } from '../../core/constants.jsx';
import soundManager from '../../core/SoundManager.jsx';
import gardenImg from '../../assets/images/Garden/garden.jpeg';

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

        const trigger = new PIXI.Graphics();
        trigger.position.set(config.x, config.y);

        this.drawPoly(trigger, [config.p1, config.p2, config.p3, config.p4, config.p5, config.p6]);
        trigger.fill({ color: 0xff0000, alpha: 0.001 });

        trigger.eventMode = 'static';
        trigger.cursor = 'pointer';

        trigger.on('pointertap', () => {
            if (!this.isInteractive) return;
            soundManager.playSFX('click');
            this.manager.change(SCENES.GARDEN_SITTING, { transition: 'fade' });
        });

        this.container.addChild(trigger);
        this.elements.trigger = trigger;
    }

    // ── GLASSY SHIMMER CLICK AREA ──
    createGlassyBackButton() {
        const config = {
            x: 360, y: 400,
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

    update(delta) {
        // ...
    }
}
