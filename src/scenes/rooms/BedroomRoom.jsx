// src/scenes/rooms/BedroomRoom.jsx
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import BaseRoom from '../BaseRoom.jsx';
import { ROOM_CONFIGS } from '../../core/constants.jsx';
import soundManager from '../../core/SoundManager.jsx';
import bedroomImg from '../../assets/images/BedRoom/bedroom.png';
import wallCollageImg from '../../assets/images/BedRoom/WallCollage.png';
import openWallCollageImg from '../../assets/images/BedRoom/OpenWallCollage.png';

// --- CONFIGURATION ---
const COLLAGE_POS = {
    x: 450,
    y: 320,
    angle: 2
};
const COLLAGE_SCALE = 0.08;

export default class BedroomRoom extends BaseRoom {
    constructor(manager) {
        super(manager, {
            title: ROOM_CONFIGS.BEDROOM.title,
            subtitle: ROOM_CONFIGS.BEDROOM.subtitle,
            backgroundImage: bedroomImg,
            backgroundColor: ROOM_CONFIGS.BEDROOM.color,
            gradientTop: ROOM_CONFIGS.BEDROOM.gradientTop,
            gradientBottom: ROOM_CONFIGS.BEDROOM.gradientBottom,
        });
        this.isCollageOpen = false;
    }

    async init() {
        await super.init();
        await this.createCollageInteraction();
    }

    async createCollageInteraction() {
        // 1. Load Textures
        const wallTexture = await PIXI.Assets.load(wallCollageImg);
        const openTexture = await PIXI.Assets.load(openWallCollageImg);

        // 2. Create Wall Collage (Thumbnail)
        const wallCollage = new PIXI.Sprite(wallTexture);
        wallCollage.anchor.set(0.5);
        wallCollage.position.set(COLLAGE_POS.x, COLLAGE_POS.y);
        wallCollage.scale.set(COLLAGE_SCALE);
        wallCollage.angle = COLLAGE_POS.angle; // Apply initial rotation

        // Interactive Setup
        wallCollage.eventMode = 'static';
        wallCollage.cursor = 'pointer';

        // Hover: Rotate 10 degrees clockwise from base angle
        wallCollage.on('pointerover', () => {
            if (this.isCollageOpen) return;
            gsap.to(wallCollage, { angle: COLLAGE_POS.angle + 10, duration: 0.3, ease: 'back.out(1.5)' });
        });

        wallCollage.on('pointerout', () => {
            if (this.isCollageOpen) return;
            gsap.to(wallCollage, { angle: COLLAGE_POS.angle, duration: 0.3 });
        });

        // Click: Open Overlay
        wallCollage.on('pointertap', () => {
            this.openCollage();
        });

        this.elements.wallCollage = wallCollage;
        this.container.addChild(wallCollage);

        // 3. Create Open Collage (Overlay)
        this.overlayContainer = new PIXI.Container();
        this.overlayContainer.visible = false;
        this.overlayContainer.alpha = 0;

        // Background Dimmer/Click Catcher
        const { width, height } = this.getScreenSize();
        const bgDim = new PIXI.Graphics();
        bgDim.rect(0, 0, width, height);
        bgDim.fill({ color: 0x000000, alpha: 0.3 }); // Semi-transparent black
        bgDim.eventMode = 'static';
        bgDim.cursor = 'default';

        // Click elsewhere to close
        bgDim.on('pointertap', () => {
            this.closeCollage();
        });

        this.elements.overlayBg = bgDim;
        this.overlayContainer.addChild(bgDim);

        // Actual Image
        const openCollage = new PIXI.Sprite(openTexture);
        openCollage.anchor.set(0.5);
        openCollage.x = width / 2;
        openCollage.y = height / 2;

        // Ensure it fits the screen
        const scale = this.calculateOpenScale(openTexture.width, openTexture.height);
        openCollage.scale.set(scale);

        // Consume clicks on the image (so it doesn't trigger close)
        openCollage.eventMode = 'static';
        openCollage.on('pointertap', (e) => e.stopPropagation());

        this.elements.openCollage = openCollage;
        this.overlayContainer.addChild(openCollage);

        this.container.addChild(this.overlayContainer);
    }

    openCollage() {
        if (this.isCollageOpen) return;
        this.isCollageOpen = true;

        soundManager.playSFX('click');

        // Blur everything else
        const blur = new PIXI.BlurFilter(8);
        if (this.elements.background) this.elements.background.filters = [blur];
        if (this.elements.wallCollage) this.elements.wallCollage.filters = [blur];
        if (this.elements.backButton) this.elements.backButton.filters = [blur];

        this.overlayContainer.visible = true;

        // Animate In
        gsap.to(this.overlayContainer, { alpha: 1, duration: 0.4 });
        gsap.fromTo(this.elements.openCollage.scale,
            { x: 0.1, y: 0.1 },
            {
                x: this.calculateOpenScale(this.elements.openCollage.texture.width, this.elements.openCollage.texture.height),
                y: this.calculateOpenScale(this.elements.openCollage.texture.width, this.elements.openCollage.texture.height),
                duration: 0.5,
                ease: 'back.out(1.2)'
            }
        );
    }

    closeCollage() {
        if (!this.isCollageOpen) return;

        soundManager.playSFX('click');

        // Prepare to remove filters
        if (this.elements.background) this.elements.background.filters = [];
        if (this.elements.wallCollage) this.elements.wallCollage.filters = [];
        if (this.elements.backButton) this.elements.backButton.filters = [];

        // Animate Out
        gsap.to(this.overlayContainer, {
            alpha: 0,
            duration: 0.3,
            onComplete: () => {
                this.overlayContainer.visible = false;
                this.isCollageOpen = false;
            }
        });
    }

    calculateOpenScale(texWidth, texHeight) {
        const { width, height } = this.getScreenSize();
        const margin = 0.85; // Use 85% of screen
        return Math.min(
            (width * margin) / texWidth,
            (height * margin) / texHeight
        );
    }

    resize() {
        super.resize();

        const { width, height } = this.getScreenSize();

        // Update Wall Collage Position if needed (relative or fixed)
        // Keeping it fixed for now as requested
        if (this.elements.wallCollage) {
            // Optional: Make it responsive
            // this.elements.wallCollage.x = width * 0.7;
            // this.elements.wallCollage.y = height * 0.5;
        }

        // Update Overlay
        if (this.elements.overlayBg) {
            this.elements.overlayBg.clear();
            this.elements.overlayBg.rect(0, 0, width, height);
            this.elements.overlayBg.fill({ color: 0x000000, alpha: 0.3 });
        }

        if (this.elements.openCollage) {
            this.elements.openCollage.x = width / 2;
            this.elements.openCollage.y = height / 2;
            const scale = this.calculateOpenScale(this.elements.openCollage.texture.width, this.elements.openCollage.texture.height);
            this.elements.openCollage.scale.set(scale);
        }
    }
}
