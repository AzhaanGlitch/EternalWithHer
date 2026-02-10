// src/scenes/rooms/LivingRoom.jsx
// The Milestone Timeline - Frames on the wall with memories
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import BaseRoom from '../BaseRoom.jsx';
import { COLORS, ROOM_CONFIGS } from '../../core/constants.jsx';
import soundManager from '../../core/SoundManager.jsx';

export default class LivingRoom extends BaseRoom {
    constructor(manager) {
        super(manager, {
            title: ROOM_CONFIGS.LIVING.title,
            subtitle: ROOM_CONFIGS.LIVING.subtitle,
            backgroundColor: ROOM_CONFIGS.LIVING.color,
            gradientTop: ROOM_CONFIGS.LIVING.gradientTop,
            gradientBottom: ROOM_CONFIGS.LIVING.gradientBottom,
        });

        this.frames = [];
        this.selectedFrame = null;
        this.modalOpen = false;
    }

    init() {
        super.init();
        this.createWallDecor();
        this.createPhotoFrames();
        this.createFurniture();
        this.createModal();
    }

    createWallDecor() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Wallpaper pattern
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 10; col++) {
                const pattern = new PIXI.Graphics();
                const px = col * (w / 8) + (row % 2) * (w / 16);
                const py = 120 + row * 60;

                pattern.moveTo(px, py - 8);
                pattern.lineTo(px + 6, py);
                pattern.lineTo(px, py + 8);
                pattern.lineTo(px - 6, py);
                pattern.closePath();
                pattern.fill({ color: COLORS.GOLD, alpha: 0.03 });
                this.container.addChild(pattern);
            }
        }

        // Picture rail
        const rail = new PIXI.Graphics();
        rail.rect(0, 110, w, 6);
        rail.fill(0x3a2a1a);
        this.container.addChild(rail);
    }

    createPhotoFrames() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Sample memories/milestones
        const memories = [
            { date: 'First Meeting', description: 'The day our story began...', color: 0xffb6c1 },
            { date: 'First Date', description: 'Coffee and endless conversations', color: 0xffd700 },
            { date: 'First Trip', description: 'Adventures together', color: 0x87ceeb },
            { date: 'Anniversary', description: 'One year of love', color: 0xff69b4 },
            { date: 'Special Day', description: 'A moment to remember', color: 0xdda0dd },
        ];

        const frameWidth = 120;
        const frameHeight = 150;
        const startX = (w - (memories.length * (frameWidth + 40))) / 2 + frameWidth / 2;
        const frameY = 220;

        memories.forEach((memory, index) => {
            const frame = this.createFrame(
                startX + index * (frameWidth + 40),
                frameY,
                frameWidth,
                frameHeight,
                memory,
                index
            );
            this.frames.push(frame);
            this.container.addChild(frame);
        });

        // Instruction text
        const instruction = new PIXI.Text({
            text: 'Click a photo frame to view the memory',
            style: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fill: COLORS.GOLD,
                alpha: 0.7,
            }
        });
        instruction.anchor.set(0.5);
        instruction.position.set(w / 2, frameY + frameHeight + 50);
        this.container.addChild(instruction);

        gsap.to(instruction, { alpha: 0.5, duration: 1.5, yoyo: true, repeat: -1 });
    }

    createFrame(x, y, width, height, memory, index) {
        const frame = new PIXI.Container();
        frame.position.set(x, y);

        // Frame wire
        const wire = new PIXI.Graphics();
        wire.moveTo(0, -40);
        wire.lineTo(-20, 0);
        wire.moveTo(0, -40);
        wire.lineTo(20, 0);
        wire.stroke({ width: 2, color: 0x4a3a2a });
        frame.addChild(wire);

        // Frame shadow
        const shadow = new PIXI.Graphics();
        shadow.roundRect(-width / 2 + 5, 5, width, height, 4);
        shadow.fill({ color: 0x000000, alpha: 0.3 });
        frame.addChild(shadow);

        // Frame border (ornate)
        const border = new PIXI.Graphics();
        border.roundRect(-width / 2 - 8, -8, width + 16, height + 16, 5);
        border.fill(COLORS.GOLD);
        frame.addChild(border);

        // Inner frame
        const innerBorder = new PIXI.Graphics();
        innerBorder.roundRect(-width / 2 - 4, -4, width + 8, height + 8, 3);
        innerBorder.fill(0x3a2a1a);
        frame.addChild(innerBorder);

        // Photo area (placeholder with gradient)
        const photo = new PIXI.Graphics();
        photo.roundRect(-width / 2, 0, width, height, 2);
        photo.fill(memory.color);
        frame.addChild(photo);

        // Photo overlay gradient
        const photoOverlay = new PIXI.Graphics();
        photoOverlay.roundRect(-width / 2, 0, width, height, 2);
        photoOverlay.fill({ color: 0x000000, alpha: 0.2 });
        frame.addChild(photoOverlay);

        // Date label
        const dateLabel = new PIXI.Text({
            text: memory.date,
            style: {
                fontFamily: 'Playfair Display, serif',
                fontSize: 14,
                fill: 0xffffff,
                fontWeight: '600',
                dropShadow: {
                    color: 0x000000,
                    blur: 4,
                    distance: 1,
                },
            }
        });
        dateLabel.anchor.set(0.5);
        dateLabel.position.set(0, height / 2);
        frame.addChild(dateLabel);

        // Heart icon in corner
        const heart = new PIXI.Graphics();
        heart.moveTo(width / 2 - 20, 15);
        heart.bezierCurveTo(width / 2 - 20, 10, width / 2 - 12, 10, width / 2 - 12, 15);
        heart.bezierCurveTo(width / 2 - 12, 20, width / 2 - 20, 25, width / 2 - 20, 25);
        heart.bezierCurveTo(width / 2 - 20, 25, width / 2 - 28, 20, width / 2 - 28, 15);
        heart.bezierCurveTo(width / 2 - 28, 10, width / 2 - 20, 10, width / 2 - 20, 15);
        heart.fill({ color: 0xff0000, alpha: 0.8 });
        frame.addChild(heart);

        // Glow effect
        const glow = new PIXI.Graphics();
        glow.roundRect(-width / 2 - 15, -15, width + 30, height + 30, 8);
        glow.fill({ color: memory.color, alpha: 0 });
        glow.name = 'glow';
        frame.addChildAt(glow, 0);

        // Interactive
        frame.eventMode = 'static';
        frame.cursor = 'pointer';
        frame.hitArea = new PIXI.Rectangle(-width / 2 - 10, -10, width + 20, height + 20);
        frame.memory = memory;
        frame.index = index;

        frame.on('pointerover', () => {
            if (this.modalOpen) return;
            gsap.to(glow, { alpha: 0.3, duration: 0.3 });
            gsap.to(frame.scale, { x: 1.08, y: 1.08, duration: 0.3, ease: 'back.out' });
            gsap.to(frame, { rotation: 0.02, duration: 0.2 });
        });

        frame.on('pointerout', () => {
            if (this.modalOpen) return;
            gsap.to(glow, { alpha: 0, duration: 0.3 });
            gsap.to(frame.scale, { x: 1, y: 1, duration: 0.3 });
            gsap.to(frame, { rotation: 0, duration: 0.2 });
        });

        frame.on('pointertap', () => {
            if (this.modalOpen) return;
            this.openMemory(frame);
        });

        return frame;
    }

    createFurniture() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Sofa
        const sofa = new PIXI.Container();

        const sofaBack = new PIXI.Graphics();
        sofaBack.roundRect(-150, -60, 300, 70, 15);
        sofaBack.fill(0x8b4513);
        sofa.addChild(sofaBack);

        const sofaSeat = new PIXI.Graphics();
        sofaSeat.roundRect(-160, 0, 320, 50, 10);
        sofaSeat.fill(0xa0522d);
        sofa.addChild(sofaSeat);

        // Cushions
        for (let i = 0; i < 3; i++) {
            const cushion = new PIXI.Graphics();
            cushion.roundRect(-130 + i * 95, -50, 80, 55, 8);
            cushion.fill(0xdeb887);
            sofa.addChild(cushion);
        }

        // Armrests
        const leftArm = new PIXI.Graphics();
        leftArm.roundRect(-170, -30, 25, 80, 8);
        leftArm.fill(0x8b4513);
        sofa.addChild(leftArm);

        const rightArm = new PIXI.Graphics();
        rightArm.roundRect(145, -30, 25, 80, 8);
        rightArm.fill(0x8b4513);
        sofa.addChild(rightArm);

        sofa.position.set(w / 2, h * 0.8);
        this.elements.sofa = sofa;
        this.container.addChild(sofa);

        // Coffee table
        const table = new PIXI.Graphics();
        table.roundRect(-60, 0, 120, 30, 5);
        table.fill(0x2a1a0a);
        table.position.set(w / 2, h * 0.88);
        this.container.addChild(table);

        // Lamp
        this.createLamp(w * 0.15, h * 0.65);
        this.createLamp(w * 0.85, h * 0.65);

        // Rug
        const rug = new PIXI.Graphics();
        rug.ellipse(0, 0, 200, 60);
        rug.fill(0x5a2a2a);
        rug.stroke({ width: 4, color: COLORS.GOLD, alpha: 0.5 });
        rug.position.set(w / 2, h * 0.9);
        this.container.addChild(rug);
    }

    createLamp(x, y) {
        const lamp = new PIXI.Container();

        // Base
        const base = new PIXI.Graphics();
        base.roundRect(-15, 70, 30, 15, 5);
        base.fill(COLORS.GOLD);
        lamp.addChild(base);

        // Pole
        const pole = new PIXI.Graphics();
        pole.rect(-3, 0, 6, 75);
        pole.fill(COLORS.GOLD);
        lamp.addChild(pole);

        // Shade
        const shade = new PIXI.Graphics();
        shade.moveTo(-30, 0);
        shade.lineTo(-20, -50);
        shade.lineTo(20, -50);
        shade.lineTo(30, 0);
        shade.closePath();
        shade.fill(0xfaf0e6);
        shade.stroke({ width: 2, color: COLORS.GOLD });
        lamp.addChild(shade);

        // Light glow
        const glow = new PIXI.Graphics();
        glow.circle(0, -20, 50);
        glow.fill({ color: 0xffee88, alpha: 0.15 });
        lamp.addChildAt(glow, 0);

        lamp.position.set(x, y);
        this.container.addChild(lamp);
    }

    createModal() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Modal container (hidden initially)
        this.modal = new PIXI.Container();
        this.modal.visible = false;

        // Backdrop
        const backdrop = new PIXI.Graphics();
        backdrop.rect(0, 0, w, h);
        backdrop.fill({ color: 0x000000, alpha: 0.8 });
        backdrop.eventMode = 'static';
        backdrop.on('pointertap', () => this.closeMemory());
        this.modal.addChild(backdrop);

        // Modal card
        this.modalCard = new PIXI.Container();

        const cardBg = new PIXI.Graphics();
        cardBg.roundRect(-200, -150, 400, 300, 15);
        cardBg.fill(0x1a1a1a);
        cardBg.stroke({ width: 3, color: COLORS.GOLD });
        this.modalCard.addChild(cardBg);

        // Close button
        const closeBtn = new PIXI.Container();
        const closeBg = new PIXI.Graphics();
        closeBg.circle(0, 0, 20);
        closeBg.fill({ color: 0x000000, alpha: 0.5 });
        closeBg.stroke({ width: 2, color: COLORS.GOLD });
        closeBtn.addChild(closeBg);

        const closeX = new PIXI.Graphics();
        closeX.moveTo(-8, -8);
        closeX.lineTo(8, 8);
        closeX.moveTo(8, -8);
        closeX.lineTo(-8, 8);
        closeX.stroke({ width: 2, color: COLORS.GOLD });
        closeBtn.addChild(closeX);

        closeBtn.position.set(180, -130);
        closeBtn.eventMode = 'static';
        closeBtn.cursor = 'pointer';
        closeBtn.on('pointertap', () => this.closeMemory());
        this.modalCard.addChild(closeBtn);

        // Content placeholders
        this.modalTitle = new PIXI.Text({
            text: '',
            style: {
                fontFamily: 'Playfair Display, serif',
                fontSize: 28,
                fill: COLORS.GOLD,
                fontWeight: '600',
            }
        });
        this.modalTitle.anchor.set(0.5);
        this.modalTitle.position.set(0, -100);
        this.modalCard.addChild(this.modalTitle);

        this.modalDesc = new PIXI.Text({
            text: '',
            style: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                fill: 0xffffff,
                wordWrap: true,
                wordWrapWidth: 350,
                align: 'center',
            }
        });
        this.modalDesc.anchor.set(0.5);
        this.modalDesc.position.set(0, 20);
        this.modalCard.addChild(this.modalDesc);

        // Photo placeholder in modal
        this.modalPhoto = new PIXI.Graphics();
        this.modalCard.addChild(this.modalPhoto);

        this.modalCard.position.set(w / 2, h / 2);
        this.modal.addChild(this.modalCard);

        this.container.addChild(this.modal);
    }

    openMemory(frame) {
        this.modalOpen = true;
        this.selectedFrame = frame;

        const memory = frame.memory;

        // Update modal content
        this.modalTitle.text = memory.date;
        this.modalDesc.text = memory.description;

        // Draw photo placeholder
        this.modalPhoto.clear();
        this.modalPhoto.roundRect(-150, -60, 300, 100, 8);
        this.modalPhoto.fill(memory.color);
        this.modalPhoto.position.set(0, -20);

        // Show modal with animation
        this.modal.visible = true;
        this.modalCard.alpha = 0;
        this.modalCard.scale.set(0.8);

        gsap.to(this.modalCard, { alpha: 1, duration: 0.3 });
        gsap.to(this.modalCard.scale, { x: 1, y: 1, duration: 0.4, ease: 'back.out' });
    }

    closeMemory() {
        gsap.to(this.modalCard, { alpha: 0, duration: 0.2 });
        gsap.to(this.modalCard.scale, {
            x: 0.8, y: 0.8, duration: 0.2, onComplete: () => {
                this.modal.visible = false;
                this.modalOpen = false;
                this.selectedFrame = null;
            }
        });
    }

    enter() {
        super.enter();

        // Animate frames appearing
        this.frames.forEach((frame, index) => {
            frame.alpha = 0;
            frame.y -= 30;
            gsap.to(frame, {
                alpha: 1,
                y: frame.y + 30,
                duration: 0.6,
                delay: 0.5 + index * 0.1,
                ease: 'back.out'
            });
        });
    }

    update(delta) {
        // Subtle swaying animation for frames could go here
    }

    destroy() {
        this.frames.forEach(frame => {
            gsap.killTweensOf(frame);
            gsap.killTweensOf(frame.scale);
        });
        gsap.killTweensOf(this.modalCard);
        gsap.killTweensOf(this.modalCard.scale);
        super.destroy();
    }
}
