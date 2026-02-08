// src/scenes/rooms/BedroomRoom.js
// Love Letters & Journal - Flip-book style letters on a bedside table
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import BaseRoom from '../BaseRoom';
import { COLORS, ROOM_CONFIGS } from '../../core/constants';
import soundManager from '../../core/SoundManager';

export default class BedroomRoom extends BaseRoom {
    constructor(manager) {
        super(manager, {
            title: ROOM_CONFIGS.BEDROOM.title,
            subtitle: ROOM_CONFIGS.BEDROOM.subtitle,
            backgroundColor: ROOM_CONFIGS.BEDROOM.color,
            gradientTop: ROOM_CONFIGS.BEDROOM.gradientTop,
            gradientBottom: ROOM_CONFIGS.BEDROOM.gradientBottom,
        });

        this.letters = [];
        this.currentLetterIndex = 0;
        this.journalOpen = false;
    }

    init() {
        super.init();
        this.createBed();
        this.createBedsideTable();
        this.createJournal();
        this.createDecor();
        this.createLetterModal();
    }

    createBed() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        const bed = new PIXI.Container();

        // Headboard
        const headboard = new PIXI.Graphics();
        headboard.roundRect(-180, -120, 360, 130, 10);
        headboard.fill(0x4a3030);
        headboard.stroke({ width: 4, color: COLORS.GOLD, alpha: 0.5 });
        bed.addChild(headboard);

        // Headboard design
        const design = new PIXI.Graphics();
        design.roundRect(-160, -100, 320, 90, 8);
        design.fill({ color: 0x5a3a3a, alpha: 0.5 });
        bed.addChild(design);

        // Mattress
        const mattress = new PIXI.Graphics();
        mattress.roundRect(-200, 0, 400, 120, 8);
        mattress.fill(0xfff5ee);
        bed.addChild(mattress);

        // Blanket
        const blanket = new PIXI.Graphics();
        blanket.roundRect(-190, 30, 380, 80, 5);
        blanket.fill(0xdda0dd);
        bed.addChild(blanket);

        // Blanket fold
        const fold = new PIXI.Graphics();
        fold.roundRect(-190, 25, 380, 15, 3);
        fold.fill(0xf5f5f5);
        bed.addChild(fold);

        // Pillows
        const pillow1 = new PIXI.Graphics();
        pillow1.roundRect(-150, -10, 130, 50, 20);
        pillow1.fill(0xfff8f8);
        bed.addChild(pillow1);

        const pillow2 = new PIXI.Graphics();
        pillow2.roundRect(20, -10, 130, 50, 20);
        pillow2.fill(0xfff8f8);
        bed.addChild(pillow2);

        bed.position.set(w / 2, h * 0.65);
        this.elements.bed = bed;
        this.container.addChild(bed);
    }

    createBedsideTable() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Left bedside table
        const table = new PIXI.Container();

        const tableTop = new PIXI.Graphics();
        tableTop.roundRect(-50, 0, 100, 10, 3);
        tableTop.fill(0x3a2520);
        table.addChild(tableTop);

        const tableBody = new PIXI.Graphics();
        tableBody.roundRect(-45, 10, 90, 80, 3);
        tableBody.fill(0x2a1a15);
        table.addChild(tableBody);

        // Drawer
        const drawer = new PIXI.Graphics();
        drawer.roundRect(-40, 30, 80, 30, 2);
        drawer.fill(0x3a2520);
        drawer.stroke({ width: 1, color: COLORS.GOLD, alpha: 0.3 });
        table.addChild(drawer);

        // Drawer knob
        const knob = new PIXI.Graphics();
        knob.circle(0, 45, 5);
        knob.fill(COLORS.GOLD);
        table.addChild(knob);

        // Lamp on table
        this.createBedLamp(0, -40, table);

        table.position.set(w / 2 - 280, h * 0.7);
        this.container.addChild(table);

        // Right bedside table with journal
        const rightTable = new PIXI.Container();

        const rightTop = new PIXI.Graphics();
        rightTop.roundRect(-50, 0, 100, 10, 3);
        rightTop.fill(0x3a2520);
        rightTable.addChild(rightTop);

        const rightBody = new PIXI.Graphics();
        rightBody.roundRect(-45, 10, 90, 80, 3);
        rightBody.fill(0x2a1a15);
        rightTable.addChild(rightBody);

        rightTable.position.set(w / 2 + 280, h * 0.7);
        this.elements.rightTable = rightTable;
        this.container.addChild(rightTable);
    }

    createBedLamp(x, y, parent) {
        const lamp = new PIXI.Container();

        // Base
        const base = new PIXI.Graphics();
        base.circle(0, 40, 15);
        base.fill(COLORS.GOLD);
        lamp.addChild(base);

        // Stem
        const stem = new PIXI.Graphics();
        stem.rect(-3, -10, 6, 55);
        stem.fill(COLORS.GOLD);
        lamp.addChild(stem);

        // Shade
        const shade = new PIXI.Graphics();
        shade.moveTo(-25, 0);
        shade.lineTo(-18, -35);
        shade.lineTo(18, -35);
        shade.lineTo(25, 0);
        shade.closePath();
        shade.fill(0xffeedd);
        shade.stroke({ width: 2, color: COLORS.GOLD, alpha: 0.5 });
        lamp.addChild(shade);

        // Glow
        const glow = new PIXI.Graphics();
        glow.circle(0, -15, 40);
        glow.fill({ color: 0xffee88, alpha: 0.12 });
        lamp.addChildAt(glow, 0);

        lamp.position.set(x, y);
        parent.addChild(lamp);
    }

    createJournal() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Journal on the right table
        const journal = new PIXI.Container();

        // Book cover
        const cover = new PIXI.Graphics();
        cover.roundRect(-40, -50, 80, 70, 5);
        cover.fill(0x8b0000);
        cover.stroke({ width: 2, color: COLORS.GOLD });
        journal.addChild(cover);

        // Book spine detail
        const spine = new PIXI.Graphics();
        spine.rect(-40, -50, 8, 70);
        spine.fill({ color: 0x000000, alpha: 0.3 });
        journal.addChild(spine);

        // Heart emblem
        const heart = new PIXI.Graphics();
        heart.moveTo(0, -25);
        heart.bezierCurveTo(-15, -40, -25, -20, 0, 0);
        heart.bezierCurveTo(25, -20, 15, -40, 0, -25);
        heart.fill(COLORS.GOLD);
        journal.addChild(heart);

        // Label
        const label = new PIXI.Text({
            text: 'Our Letters',
            style: {
                fontFamily: 'Dancing Script, cursive',
                fontSize: 12,
                fill: COLORS.GOLD,
            }
        });
        label.anchor.set(0.5);
        label.position.set(5, 10);
        journal.addChild(label);

        // Glow effect for interactivity
        const glow = new PIXI.Graphics();
        glow.roundRect(-50, -60, 100, 90, 10);
        glow.fill({ color: 0xff69b4, alpha: 0 });
        glow.name = 'glow';
        journal.addChildAt(glow, 0);

        // Interactive
        journal.eventMode = 'static';
        journal.cursor = 'pointer';

        journal.on('pointerover', () => {
            gsap.to(glow, { alpha: 0.3, duration: 0.3 });
            gsap.to(journal.scale, { x: 1.1, y: 1.1, duration: 0.3, ease: 'back.out' });
        });

        journal.on('pointerout', () => {
            gsap.to(glow, { alpha: 0, duration: 0.3 });
            gsap.to(journal.scale, { x: 1, y: 1, duration: 0.3 });
        });

        journal.on('pointertap', () => {
            this.openJournal();
        });

        journal.position.set(w / 2 + 280, h * 0.7 - 40);
        journal.rotation = 0.1;
        this.elements.journal = journal;
        this.container.addChild(journal);

        // Instruction
        const hint = new PIXI.Text({
            text: 'Click the journal to read love letters',
            style: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                fill: COLORS.GOLD,
            }
        });
        hint.anchor.set(0.5);
        hint.position.set(w / 2 + 280, h * 0.7 + 60);
        hint.alpha = 0.7;
        this.container.addChild(hint);

        gsap.to(hint, { alpha: 0.4, duration: 1.5, yoyo: true, repeat: -1 });
    }

    createDecor() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Window with moonlight
        const windowFrame = new PIXI.Graphics();
        windowFrame.roundRect(-80, -100, 160, 200, 8);
        windowFrame.fill(0x1a1a3a);
        windowFrame.stroke({ width: 8, color: 0x4a3a3a });
        windowFrame.position.set(w * 0.15, h * 0.4);
        this.container.addChild(windowFrame);

        // Window cross
        const cross = new PIXI.Graphics();
        cross.rect(-2, -100, 4, 200);
        cross.fill(0x4a3a3a);
        cross.rect(-80, -2, 160, 4);
        cross.fill(0x4a3a3a);
        cross.position.set(w * 0.15, h * 0.4);
        this.container.addChild(cross);

        // Moon glow through window
        const moonGlow = new PIXI.Graphics();
        moonGlow.circle(40, -40, 30);
        moonGlow.fill(0xffffd0);
        moonGlow.position.set(w * 0.15, h * 0.4);
        this.container.addChild(moonGlow);

        // Stars outside
        for (let i = 0; i < 10; i++) {
            const star = new PIXI.Graphics();
            star.circle(0, 0, 1 + Math.random() * 2);
            star.fill(0xffffff);
            star.position.set(
                w * 0.15 - 70 + Math.random() * 140,
                h * 0.4 - 90 + Math.random() * 180
            );
            this.container.addChild(star);

            gsap.to(star, {
                alpha: 0.3 + Math.random() * 0.4,
                duration: 1 + Math.random() * 2,
                yoyo: true,
                repeat: -1,
            });
        }

        // Curtains
        const leftCurtain = new PIXI.Graphics();
        leftCurtain.rect(-100, -110, 30, 220);
        leftCurtain.fill(0xdda0dd);
        leftCurtain.position.set(w * 0.15, h * 0.4);
        this.container.addChild(leftCurtain);

        const rightCurtain = new PIXI.Graphics();
        rightCurtain.rect(70, -110, 30, 220);
        rightCurtain.fill(0xdda0dd);
        rightCurtain.position.set(w * 0.15, h * 0.4);
        this.container.addChild(rightCurtain);

        // Rug
        const rug = new PIXI.Graphics();
        rug.ellipse(0, 0, 180, 50);
        rug.fill(0x8b4a6b);
        rug.stroke({ width: 4, color: COLORS.GOLD, alpha: 0.4 });
        rug.position.set(w / 2, h * 0.92);
        this.container.addChild(rug);
    }

    createLetterModal() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Sample love letters
        this.letters = [
            {
                title: 'My Dearest',
                content: 'Every moment with you feels like a beautiful dream I never want to wake up from. Your smile lights up my entire world...',
                date: 'Forever Yours'
            },
            {
                title: 'To My Love',
                content: 'I still remember the first time I saw you. In that moment, I knew my life was about to change in the most wonderful way...',
                date: 'With All My Heart'
            },
            {
                title: 'My Everything',
                content: 'You are my best friend, my soulmate, my everything. Thank you for choosing to walk this journey of life with me...',
                date: 'Always & Forever'
            },
        ];

        // Modal container
        this.letterModal = new PIXI.Container();
        this.letterModal.visible = false;

        // Backdrop
        const backdrop = new PIXI.Graphics();
        backdrop.rect(0, 0, w, h);
        backdrop.fill({ color: 0x000000, alpha: 0.85 });
        backdrop.eventMode = 'static';
        this.letterModal.addChild(backdrop);

        // Letter paper
        this.letterPaper = new PIXI.Container();

        const paper = new PIXI.Graphics();
        paper.roundRect(-250, -200, 500, 400, 5);
        paper.fill(0xfff8dc);
        paper.stroke({ width: 2, color: 0xdeb887 });
        this.letterPaper.addChild(paper);

        // Paper lines
        for (let i = 0; i < 12; i++) {
            const line = new PIXI.Graphics();
            line.rect(-220, -150 + i * 28, 440, 1);
            line.fill({ color: 0xdeb887, alpha: 0.4 });
            this.letterPaper.addChild(line);
        }

        // Close button
        const closeBtn = new PIXI.Container();
        const closeBg = new PIXI.Graphics();
        closeBg.circle(0, 0, 20);
        closeBg.fill({ color: 0x8b0000, alpha: 0.8 });
        closeBg.stroke({ width: 2, color: 0xffffff });
        closeBtn.addChild(closeBg);

        const closeX = new PIXI.Graphics();
        closeX.moveTo(-8, -8);
        closeX.lineTo(8, 8);
        closeX.moveTo(8, -8);
        closeX.lineTo(-8, 8);
        closeX.stroke({ width: 2, color: 0xffffff });
        closeBtn.addChild(closeX);

        closeBtn.position.set(230, -180);
        closeBtn.eventMode = 'static';
        closeBtn.cursor = 'pointer';
        closeBtn.on('pointertap', () => this.closeJournal());
        this.letterPaper.addChild(closeBtn);

        // Navigation arrows
        const prevBtn = this.createNavButton(-280, 0, '<');
        prevBtn.on('pointertap', () => this.prevLetter());
        this.letterPaper.addChild(prevBtn);

        const nextBtn = this.createNavButton(280, 0, '>');
        nextBtn.on('pointertap', () => this.nextLetter());
        this.letterPaper.addChild(nextBtn);

        // Letter content
        this.letterTitle = new PIXI.Text({
            text: '',
            style: {
                fontFamily: 'Dancing Script, cursive',
                fontSize: 32,
                fill: 0x8b0000,
            }
        });
        this.letterTitle.anchor.set(0.5, 0);
        this.letterTitle.position.set(0, -170);
        this.letterPaper.addChild(this.letterTitle);

        this.letterContent = new PIXI.Text({
            text: '',
            style: {
                fontFamily: 'Dancing Script, cursive',
                fontSize: 20,
                fill: 0x2a1a1a,
                wordWrap: true,
                wordWrapWidth: 420,
                lineHeight: 28,
            }
        });
        this.letterContent.anchor.set(0.5, 0);
        this.letterContent.position.set(0, -100);
        this.letterPaper.addChild(this.letterContent);

        this.letterDate = new PIXI.Text({
            text: '',
            style: {
                fontFamily: 'Dancing Script, cursive',
                fontSize: 18,
                fill: 0x8b0000,
                fontStyle: 'italic',
            }
        });
        this.letterDate.anchor.set(1, 0);
        this.letterDate.position.set(200, 140);
        this.letterPaper.addChild(this.letterDate);

        // Page indicator
        this.pageIndicator = new PIXI.Text({
            text: '',
            style: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                fill: 0x8b4513,
            }
        });
        this.pageIndicator.anchor.set(0.5);
        this.pageIndicator.position.set(0, 180);
        this.letterPaper.addChild(this.pageIndicator);

        this.letterPaper.position.set(w / 2, h / 2);
        this.letterModal.addChild(this.letterPaper);

        this.container.addChild(this.letterModal);
    }

    createNavButton(x, y, symbol) {
        const btn = new PIXI.Container();

        const bg = new PIXI.Graphics();
        bg.circle(0, 0, 25);
        bg.fill({ color: 0x8b0000, alpha: 0.8 });
        bg.stroke({ width: 2, color: COLORS.GOLD });
        btn.addChild(bg);

        const text = new PIXI.Text({
            text: symbol,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: COLORS.GOLD,
                fontWeight: 'bold',
            }
        });
        text.anchor.set(0.5);
        btn.addChild(text);

        btn.position.set(x, y);
        btn.eventMode = 'static';
        btn.cursor = 'pointer';

        btn.on('pointerover', () => {
            gsap.to(btn.scale, { x: 1.1, y: 1.1, duration: 0.2 });
        });

        btn.on('pointerout', () => {
            gsap.to(btn.scale, { x: 1, y: 1, duration: 0.2 });
        });

        return btn;
    }

    openJournal() {
        this.journalOpen = true;
        this.currentLetterIndex = 0;
        this.updateLetter();

        this.letterModal.visible = true;
        this.letterPaper.alpha = 0;
        this.letterPaper.scale.set(0.8);
        this.letterPaper.rotation = -0.1;

        gsap.to(this.letterPaper, { alpha: 1, rotation: 0, duration: 0.4 });
        gsap.to(this.letterPaper.scale, { x: 1, y: 1, duration: 0.5, ease: 'back.out' });
    }

    closeJournal() {
        gsap.to(this.letterPaper, { alpha: 0, rotation: 0.1, duration: 0.3 });
        gsap.to(this.letterPaper.scale, {
            x: 0.8, y: 0.8, duration: 0.3, onComplete: () => {
                this.letterModal.visible = false;
                this.journalOpen = false;
            }
        });
    }

    updateLetter() {
        const letter = this.letters[this.currentLetterIndex];
        this.letterTitle.text = letter.title;
        this.letterContent.text = letter.content;
        this.letterDate.text = letter.date;
        this.pageIndicator.text = `${this.currentLetterIndex + 1} / ${this.letters.length}`;
    }

    prevLetter() {
        if (this.currentLetterIndex > 0) {
            this.currentLetterIndex--;
            this.animatePageTurn(-1);
        }
    }

    nextLetter() {
        if (this.currentLetterIndex < this.letters.length - 1) {
            this.currentLetterIndex++;
            this.animatePageTurn(1);
        }
    }

    animatePageTurn(direction) {
        gsap.to(this.letterPaper, {
            x: this.letterPaper.x + direction * 50,
            alpha: 0,
            duration: 0.15,
            onComplete: () => {
                this.updateLetter();
                this.letterPaper.x = window.innerWidth / 2 - direction * 50;
                gsap.to(this.letterPaper, {
                    x: window.innerWidth / 2,
                    alpha: 1,
                    duration: 0.15
                });
            }
        });
    }

    enter() {
        super.enter();
    }

    destroy() {
        gsap.killTweensOf(this.letterPaper);
        gsap.killTweensOf(this.letterPaper.scale);
        super.destroy();
    }
}
