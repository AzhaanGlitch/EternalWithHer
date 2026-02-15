// src/scenes/rooms/Balcony.jsx
import BaseRoom from '../BaseRoom.jsx';
import { ROOM_CONFIGS } from '../../core/constants.jsx';
import balconyImg from '../../assets/images/BedRoom/balcony.png';

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
    }

    async init() {
        console.log("Balcony init starting with image path:", balconyImg);
        try {
            await super.init();

            // Log details about the loaded texture
            if (this.elements.background && this.elements.background.texture) {
                const tex = this.elements.background.texture;
                console.log(`Balcony background loaded: ${tex.width}x${tex.height}`);

                if (tex.width > 8192 || tex.height > 8192) {
                    console.warn("WARNING: Image resolution is very high, may not display on all devices.");
                }
            } else {
                console.warn("Balcony background element or texture missing after init.");
            }

            console.log("Balcony init completed successfully");
        } catch (err) {
            console.error("Balcony init failed critical error:", err);
            // Fallback: create a basic color background if loading fails
            this.createFallbackBackground();
        }
    }

    createFallbackBackground() {
        const { width, height } = this.getScreenSize();
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, width, height);
        bg.fill(0x333333);
        this.container.addChildAt(bg, 0);
        console.log("Balcony fallback background created.");
    }
}
