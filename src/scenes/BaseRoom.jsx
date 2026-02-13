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

    async init() {
        await this.createBackground();
        this.createBackButton();
    }

    async createBackground() {
        const { width, height } = this.getScreenSize();

        // If a background image URL is provided, use it
        if (this.config.backgroundImage) {
            try {
                const bgTexture = await PIXI.Assets.load(this.config.backgroundImage);
                const bg = new PIXI.Sprite(bgTexture);

                // Cover-style scaling
                const imgAspect = bgTexture.width / bgTexture.height;
                const screenAspect = width / height;

                if (screenAspect > imgAspect) {
                    bg.width = width;
                    bg.height = width / imgAspect;
                } else {
                    bg.height = height;
                    bg.width = height * imgAspect;
                }

                bg.x = (width - bg.width) / 2;
                bg.y = (height - bg.height) / 2;

                this.elements.background = bg;
                this.container.addChild(bg);
                return;
            } catch (err) {
                console.warn('Failed to load room background image:', err);
                // Fall through to gradient background
            }
        }

        // Fallback: gradient background
        const bgColor = this.config.backgroundColor || 0x1a1a2e;
        const gradientTop = this.config.gradientTop || bgColor;
        const gradientBottom = this.config.gradientBottom || bgColor;

        this.elements.background = new PIXI.Container();

        const strips = 20;
        for (let i = 0; i < strips; i++) {
            const strip = new PIXI.Graphics();
            const ratio = i / strips;
            const stripHeight = height / strips + 1;

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

        // Interactivity
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
                soundManager.playSFX('click', { volume: 0.6 });
                this.manager.goBack();
            }
        });

        this.elements.backButton = text;
        this.container.addChild(text);
    }



    enter() {
        // Register click sound for back button
        soundManager.register('click', '/assets/sounds/Click_SoundEffect.mp3', { loop: false, volume: 0.6 });
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
            // If background is a Sprite (image), re-cover
            if (this.elements.background instanceof PIXI.Sprite) {
                const texture = this.elements.background.texture;
                const imgAspect = texture.width / texture.height;
                const screenAspect = width / height;

                if (screenAspect > imgAspect) {
                    this.elements.background.width = width;
                    this.elements.background.height = width / imgAspect;
                } else {
                    this.elements.background.height = height;
                    this.elements.background.width = height * imgAspect;
                }

                this.elements.background.x = (width - this.elements.background.width) / 2;
                this.elements.background.y = (height - this.elements.background.height) / 2;
            } else {
                // Gradient strips
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
        }


    }

    getScreenSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }

    destroy() {
        this.container.destroy({ children: true, texture: false });
        this.elements = {};
    }
}
