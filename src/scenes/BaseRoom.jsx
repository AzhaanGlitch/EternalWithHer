// src/scenes/BaseRoom.jsx
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { COLORS } from '../core/constants.jsx';
import soundManager from '../core/SoundManager.jsx';

export default class BaseRoom {
    constructor(manager, config = {}) {
        this.manager = manager;
        this.config = config;
        this.container = new PIXI.Container();
        this.elements = {};
        this.isInteractive = true;
    }

    init() {
        this.createBackground();
        this.createBackButton();
        this.createRoomTitle();
    }

    createBackground() {
        const { width, height } = this.getScreenSize();
        const bgColor = this.config.backgroundColor || 0x1a1a2e;
        const gradientTop = this.config.gradientTop || bgColor;
        const gradientBottom = this.config.gradientBottom || bgColor;

        // Create gradient background using multiple strips
        this.elements.background = new PIXI.Container();

        const strips = 20;
        for (let i = 0; i < strips; i++) {
            const strip = new PIXI.Graphics();
            const ratio = i / strips;
            const stripHeight = height / strips + 1;

            // Interpolate colors
            const color = this.lerpColor(gradientTop, gradientBottom, ratio);

            strip.rect(0, i * stripHeight, width, stripHeight);
            strip.fill(color);
            this.elements.background.addChild(strip);
        }

        this.container.addChild(this.elements.background);
    }

    lerpColor(color1, color2, ratio) {
        const r1 = (color1 >> 16) & 0xff;
        const g1 = (color1 >> 8) & 0xff;
        const b1 = color1 & 0xff;
        const r2 = (color2 >> 16) & 0xff;
        const g2 = (color2 >> 8) & 0xff;
        const b2 = color2 & 0xff;

        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);

        return (r << 16) | (g << 8) | b;
    }

    createBackButton() {
        const button = new PIXI.Container();

        // Button background
        const bg = new PIXI.Graphics();
        bg.roundRect(0, 0, 120, 45, 10);
        bg.fill({ color: COLORS.GOLD, alpha: 0.2 });
        bg.stroke({ width: 2, color: COLORS.GOLD, alpha: 0.8 });

        // Arrow icon
        const arrow = new PIXI.Graphics();
        arrow.moveTo(35, 22.5);
        arrow.lineTo(20, 22.5);
        arrow.lineTo(28, 15);
        arrow.moveTo(20, 22.5);
        arrow.lineTo(28, 30);
        arrow.stroke({ width: 3, color: COLORS.GOLD });

        // Text
        const text = new PIXI.Text({
            text: 'Back',
            style: {
                fontFamily: 'Inter, Arial',
                fontSize: 16,
                fill: COLORS.GOLD,
                fontWeight: '600',
            }
        });
        text.anchor.set(0, 0.5);
        text.position.set(45, 22.5);

        button.addChild(bg, arrow, text);
        button.position.set(30, 30);

        // Interactivity
        button.eventMode = 'static';
        button.cursor = 'pointer';

        button.on('pointerover', () => {
            gsap.to(bg, { alpha: 1, duration: 0.2 });
            gsap.to(button.scale, { x: 1.05, y: 1.05, duration: 0.2 });
        });

        button.on('pointerout', () => {
            gsap.to(bg, { alpha: 0.2, duration: 0.2 });
            gsap.to(button.scale, { x: 1, y: 1, duration: 0.2 });
        });

        button.on('pointertap', () => {
            if (this.isInteractive) {
                soundManager.play('click');
                this.manager.goBack();
            }
        });

        this.elements.backButton = button;
        this.container.addChild(button);
    }

    createRoomTitle() {
        if (!this.config.title) return;

        const title = new PIXI.Text({
            text: this.config.title,
            style: {
                fontFamily: 'Playfair Display, serif',
                fontSize: 48,
                fill: COLORS.GOLD,
                fontWeight: '700',
                dropShadow: {
                    color: 0x000000,
                    blur: 4,
                    distance: 2,
                    angle: Math.PI / 4,
                    alpha: 0.5,
                },
            }
        });

        title.anchor.set(0.5, 0);
        title.position.set(window.innerWidth / 2, 40);
        title.alpha = 0;

        this.elements.title = title;
        this.container.addChild(title);
    }

    enter() {
        // Animate title in
        if (this.elements.title) {
            gsap.fromTo(this.elements.title,
                { y: 20, alpha: 0 },
                { y: 40, alpha: 1, duration: 0.8, ease: 'power2.out', delay: 0.3 }
            );
        }
    }

    update(delta) {
        // Override in subclass for per-frame updates
    }

    exit() {
        this.isInteractive = false;
        soundManager.stopAmbient();
    }

    resize() {
        const { width, height } = this.getScreenSize();

        // Update background
        if (this.elements.background) {
            this.elements.background.children.forEach((strip, i) => {
                const stripHeight = height / 20 + 1;
                strip.clear();
                strip.rect(0, i * stripHeight, width, stripHeight);
                const ratio = i / 20;
                const color = this.lerpColor(
                    this.config.gradientTop || this.config.backgroundColor || 0x1a1a2e,
                    this.config.gradientBottom || this.config.backgroundColor || 0x1a1a2e,
                    ratio
                );
                strip.fill(color);
            });
        }

        // Update title position
        if (this.elements.title) {
            this.elements.title.position.set(width / 2, 40);
        }
    }

    getScreenSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }

    destroy() {
        this.container.destroy({ children: true, texture: true });
        this.elements = {};
    }
}
