// src/scenes/rooms/StudyRoom.js
// Our Story in Code - A cozy study/coding room
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import BaseRoom from '../BaseRoom';
import { COLORS, ROOM_CONFIGS } from '../../core/constants';
import soundManager from '../../core/SoundManager';

export default class StudyRoom extends BaseRoom {
    constructor(manager) {
        super(manager, {
            title: ROOM_CONFIGS.STUDY.title,
            subtitle: ROOM_CONFIGS.STUDY.subtitle,
            backgroundColor: ROOM_CONFIGS.STUDY.color,
            gradientTop: ROOM_CONFIGS.STUDY.gradientTop,
            gradientBottom: ROOM_CONFIGS.STUDY.gradientBottom,
        });

        this.codeLines = [];
        this.typingIndex = 0;
    }

    init() {
        super.init();
        this.createRoomElements();
        this.createDesk();
        this.createComputer();
        this.createBookshelf();
        this.createPlants();
    }

    createRoomElements() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Wooden floor
        const floor = new PIXI.Graphics();
        floor.rect(0, h * 0.7, w, h * 0.3);
        floor.fill(0x2a1a10);
        this.container.addChild(floor);

        // Floor planks
        for (let i = 0; i < 12; i++) {
            const plank = new PIXI.Graphics();
            plank.rect(i * (w / 10), h * 0.7, w / 10 - 3, h * 0.3);
            plank.fill({ color: 0x3a2a1a, alpha: 0.4 });
            this.container.addChild(plank);
        }

        // Wall art - motivational quote
        const quote = new PIXI.Container();

        const quoteBg = new PIXI.Graphics();
        quoteBg.roundRect(-150, -50, 300, 100, 5);
        quoteBg.fill(0x0f1f15);
        quoteBg.stroke({ width: 2, color: COLORS.GOLD, alpha: 0.5 });
        quote.addChild(quoteBg);

        const quoteText = new PIXI.Text({
            text: '"Every great love story\nis written one day at a time"',
            style: {
                fontFamily: 'Dancing Script, cursive',
                fontSize: 18,
                fill: COLORS.GOLD,
                align: 'center',
                lineHeight: 26,
            }
        });
        quoteText.anchor.set(0.5);
        quote.addChild(quoteText);

        quote.position.set(w * 0.7, h * 0.2);
        this.container.addChild(quote);
    }

    createDesk() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Large desk
        const desk = new PIXI.Container();

        // Desk surface
        const surface = new PIXI.Graphics();
        surface.rect(-250, 0, 500, 20);
        surface.fill(0x4a3020);
        surface.stroke({ width: 2, color: 0x5a4030 });
        desk.addChild(surface);

        // Desk legs
        const leg1 = new PIXI.Graphics();
        leg1.rect(-240, 20, 20, 100);
        leg1.fill(0x3a2015);
        desk.addChild(leg1);

        const leg2 = new PIXI.Graphics();
        leg2.rect(220, 20, 20, 100);
        leg2.fill(0x3a2015);
        desk.addChild(leg2);

        // Drawer unit
        const drawer = new PIXI.Graphics();
        drawer.roundRect(-230, 30, 100, 80, 3);
        drawer.fill(0x3a2015);
        drawer.stroke({ width: 1, color: 0x4a3025 });
        desk.addChild(drawer);

        // Drawer handles
        for (let i = 0; i < 2; i++) {
            const handle = new PIXI.Graphics();
            handle.roundRect(-190, 45 + i * 35, 30, 6, 2);
            handle.fill(COLORS.GOLD);
            desk.addChild(handle);
        }

        desk.position.set(w / 2, h * 0.65);
        this.elements.desk = desk;
        this.container.addChild(desk);

        // Desk items
        this.createDeskItems(desk);
    }

    createDeskItems(desk) {
        // Coffee mug
        const mug = new PIXI.Container();

        const mugBody = new PIXI.Graphics();
        mugBody.roundRect(-15, -25, 30, 30, 3);
        mugBody.fill(0xf5f5f5);
        mug.addChild(mugBody);

        const handle = new PIXI.Graphics();
        handle.arc(15, -10, 10, -Math.PI / 2, Math.PI / 2);
        handle.stroke({ width: 4, color: 0xf5f5f5 });
        mug.addChild(handle);

        // Heart on mug
        const heart = new PIXI.Text({
            text: '❤',
            style: { fontSize: 12 }
        });
        heart.anchor.set(0.5);
        heart.position.set(0, -10);
        mug.addChild(heart);

        // Steam
        for (let i = 0; i < 3; i++) {
            const steam = new PIXI.Graphics();
            steam.moveTo(-5 + i * 5, -25);
            steam.quadraticCurveTo(-2 + i * 5, -35, -5 + i * 5, -45);
            steam.stroke({ width: 1.5, color: 0xffffff, alpha: 0.3 });
            mug.addChild(steam);

            gsap.to(steam, {
                y: -5,
                alpha: 0,
                duration: 2,
                repeat: -1,
                ease: 'power1.out',
                delay: i * 0.3,
            });
        }

        mug.position.set(180, -20);
        desk.addChild(mug);

        // Notepad
        const notepad = new PIXI.Graphics();
        notepad.roundRect(-30, -40, 60, 80, 2);
        notepad.fill(0xfffacd);
        notepad.stroke({ width: 1, color: 0xe0d8a0 });
        notepad.position.set(200, -25);
        notepad.rotation = 0.1;
        desk.addChild(notepad);

        // Notepad lines
        for (let i = 0; i < 6; i++) {
            const line = new PIXI.Graphics();
            line.rect(-25, -30 + i * 12, 50, 1);
            line.fill({ color: 0x87ceeb, alpha: 0.4 });
            line.position.set(200, -25);
            line.rotation = 0.1;
            desk.addChild(line);
        }

        // Small heart doodle on notepad
        const doodle = new PIXI.Text({
            text: '♥',
            style: { fontSize: 10, fill: 0xff69b4 }
        });
        doodle.position.set(190, -40);
        doodle.rotation = 0.1;
        desk.addChild(doodle);

        // Pen holder
        const penHolder = new PIXI.Graphics();
        penHolder.rect(-15, -40, 30, 45);
        penHolder.fill(0x2a2a2a);
        penHolder.position.set(-180, -25);
        desk.addChild(penHolder);

        // Pens
        const penColors = [0xff0000, 0x0000ff, 0x00aa00];
        penColors.forEach((color, i) => {
            const pen = new PIXI.Graphics();
            pen.rect(-2, -50, 4, 35);
            pen.fill(color);
            pen.position.set(-185 + i * 8, -25);
            pen.rotation = (i - 1) * 0.1;
            desk.addChild(pen);
        });

        // Photo frame
        const frame = new PIXI.Container();

        const frameBorder = new PIXI.Graphics();
        frameBorder.roundRect(-25, -35, 50, 60, 3);
        frameBorder.fill(COLORS.GOLD);
        frame.addChild(frameBorder);

        const photo = new PIXI.Graphics();
        photo.roundRect(-20, -30, 40, 45, 2);
        photo.fill(0xff69b4);
        frame.addChild(photo);

        const photoHeart = new PIXI.Text({
            text: '💑',
            style: { fontSize: 20 }
        });
        photoHeart.anchor.set(0.5);
        photoHeart.position.set(0, -8);
        frame.addChild(photoHeart);

        // Stand
        const stand = new PIXI.Graphics();
        stand.moveTo(0, 25);
        stand.lineTo(-15, 40);
        stand.lineTo(15, 40);
        stand.closePath();
        stand.fill(COLORS.GOLD);
        frame.addChild(stand);

        frame.position.set(-120, -50);
        desk.addChild(frame);
    }

    createComputer() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        const computer = new PIXI.Container();

        // Monitor
        const monitor = new PIXI.Container();

        // Monitor frame
        const frame = new PIXI.Graphics();
        frame.roundRect(-140, -100, 280, 180, 8);
        frame.fill(0x1a1a1a);
        frame.stroke({ width: 3, color: 0x2a2a2a });
        monitor.addChild(frame);

        // Screen
        const screen = new PIXI.Graphics();
        screen.roundRect(-130, -90, 260, 160, 5);
        screen.fill(0x0a0a15);
        monitor.addChild(screen);

        // Code editor content
        this.createCodeContent(monitor);

        // Monitor stand
        const standNeck = new PIXI.Graphics();
        standNeck.rect(-15, 80, 30, 40);
        standNeck.fill(0x2a2a2a);
        monitor.addChild(standNeck);

        const standBase = new PIXI.Graphics();
        standBase.ellipse(0, 120, 60, 15);
        standBase.fill(0x2a2a2a);
        monitor.addChild(standBase);

        computer.addChild(monitor);

        // Keyboard
        const keyboard = new PIXI.Graphics();
        keyboard.roundRect(-100, 140, 200, 50, 5);
        keyboard.fill(0x2a2a2a);
        keyboard.stroke({ width: 1, color: 0x3a3a3a });
        computer.addChild(keyboard);

        // Keyboard keys with glow
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 14; col++) {
                const key = new PIXI.Graphics();
                key.roundRect(-90 + col * 14, 148 + row * 11, 10, 8, 1);
                key.fill(0x3a3a3a);
                computer.addChild(key);

                // Random key glow
                if (Math.random() > 0.7) {
                    gsap.to(key, {
                        tint: 0x4ade80,
                        duration: 0.2,
                        yoyo: true,
                        repeat: -1,
                        delay: Math.random() * 3,
                        repeatDelay: 2 + Math.random() * 3,
                    });
                }
            }
        }

        // Mouse
        const mouse = new PIXI.Graphics();
        mouse.roundRect(0, 0, 25, 40, 10);
        mouse.fill(0x2a2a2a);
        mouse.position.set(120, 150);
        computer.addChild(mouse);

        computer.position.set(w / 2, h * 0.45);
        this.elements.computer = computer;
        this.container.addChild(computer);
    }

    createCodeContent(monitor) {
        // Create a love letter in code style
        const codeText = [
            '<span style="color: #ff79c6">class</span> <span style="color: #8be9fd">OurLove</span> {',
            '  <span style="color: #ff79c6">constructor</span>() {',
            '    <span style="color: #f8f8f2">this</span>.started = <span style="color: #bd93f9">"First Meeting"</span>;',
            '    <span style="color: #f8f8f2">this</span>.strength = <span style="color: #bd93f9">Infinity</span>;',
            '  }',
            '',
            '  <span style="color: #50fa7b">grow</span>() {',
            '    <span style="color: #ff79c6">return</span> <span style="color: #bd93f9">"Forever"</span>;',
            '  }',
            '}',
        ];

        // Simplified code display (no HTML parsing in PIXI)
        const simplifiedCode = [
            'class OurLove {',
            '  constructor() {',
            '    this.started = "First Meeting";',
            '    this.strength = Infinity;',
            '  }',
            '',
            '  grow() {',
            '    return "Forever";',
            '  }',
            '}',
        ];

        // Line numbers
        const lineNumbers = new PIXI.Container();
        for (let i = 0; i < simplifiedCode.length; i++) {
            const num = new PIXI.Text({
                text: String(i + 1),
                style: {
                    fontFamily: 'Courier New, monospace',
                    fontSize: 10,
                    fill: 0x6272a4,
                }
            });
            num.position.set(-120, -80 + i * 14);
            lineNumbers.addChild(num);
        }
        monitor.addChild(lineNumbers);

        // Code lines
        simplifiedCode.forEach((line, i) => {
            const code = new PIXI.Text({
                text: line,
                style: {
                    fontFamily: 'Courier New, monospace',
                    fontSize: 10,
                    fill: 0xf8f8f2,
                }
            });
            code.position.set(-100, -80 + i * 14);

            // Syntax highlighting
            if (line.includes('class') || line.includes('return')) {
                code.style.fill = 0xff79c6;
            } else if (line.includes('this.')) {
                code.style.fill = 0x8be9fd;
            } else if (line.includes('"')) {
                code.style.fill = 0xf1fa8c;
            }

            monitor.addChild(code);
        });

        // Cursor blink
        const cursor = new PIXI.Graphics();
        cursor.rect(0, 0, 6, 12);
        cursor.fill(0x4ade80);
        cursor.position.set(32, -80 + 9 * 14);
        monitor.addChild(cursor);

        gsap.to(cursor, {
            alpha: 0,
            duration: 0.5,
            yoyo: true,
            repeat: -1,
        });

        // Terminal-like status bar at bottom
        const statusBar = new PIXI.Graphics();
        statusBar.rect(-130, 55, 260, 15);
        statusBar.fill(0x1a1a2a);
        monitor.addChild(statusBar);

        const statusText = new PIXI.Text({
            text: '💚 love.js | UTF-8 | Line 10, Col 1',
            style: {
                fontFamily: 'Courier New, monospace',
                fontSize: 8,
                fill: 0x6272a4,
            }
        });
        statusText.position.set(-125, 58);
        monitor.addChild(statusText);
    }

    createBookshelf() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        const shelf = new PIXI.Container();

        // Shelf boards
        for (let i = 0; i < 3; i++) {
            const board = new PIXI.Graphics();
            board.rect(-80, i * 80, 160, 10);
            board.fill(0x4a3020);
            shelf.addChild(board);

            // Books on each shelf
            this.createBooks(shelf, -75, i * 80 - 60, 5 - i);
        }

        // Side supports
        const leftSupport = new PIXI.Graphics();
        leftSupport.rect(-85, 0, 8, 240);
        leftSupport.fill(0x3a2015);
        shelf.addChild(leftSupport);

        const rightSupport = new PIXI.Graphics();
        rightSupport.rect(77, 0, 8, 240);
        rightSupport.fill(0x3a2015);
        shelf.addChild(rightSupport);

        shelf.position.set(w * 0.12, h * 0.35);
        this.container.addChild(shelf);
    }

    createBooks(parent, startX, y, count) {
        const bookColors = [0x8b0000, 0x00008b, 0x006400, 0x4b0082, 0x8b4513, 0xdc143c];

        for (let i = 0; i < count; i++) {
            const book = new PIXI.Graphics();
            const width = 15 + Math.random() * 10;
            const height = 50 + Math.random() * 15;

            book.roundRect(0, 0, width, height, 2);
            book.fill(bookColors[i % bookColors.length]);
            book.position.set(startX + i * 28, y + (65 - height));

            // Book spine decoration
            const spine = new PIXI.Graphics();
            spine.rect(width / 2 - 1, 5, 2, height - 10);
            spine.fill({ color: COLORS.GOLD, alpha: 0.5 });
            spine.position.set(startX + i * 28, y + (65 - height));

            parent.addChild(book);
            parent.addChild(spine);
        }
    }

    createPlants() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Desk plant
        const plant = new PIXI.Container();

        // Pot
        const pot = new PIXI.Graphics();
        pot.moveTo(-20, 0);
        pot.lineTo(-25, -40);
        pot.lineTo(25, -40);
        pot.lineTo(20, 0);
        pot.closePath();
        pot.fill(0x8b4513);
        plant.addChild(pot);

        // Pot rim
        const rim = new PIXI.Graphics();
        rim.rect(-28, -45, 56, 8);
        rim.fill(0x9b5523);
        plant.addChild(rim);

        // Leaves
        for (let i = 0; i < 7; i++) {
            const leaf = new PIXI.Graphics();
            const angle = (i / 7) * Math.PI * 2;
            const length = 25 + Math.random() * 20;

            leaf.moveTo(0, -45);
            leaf.quadraticCurveTo(
                Math.cos(angle) * length * 0.5,
                -45 - length * 0.7,
                Math.cos(angle) * length,
                -45 - length
            );
            leaf.quadraticCurveTo(
                Math.cos(angle) * length * 0.3,
                -45 - length * 0.5,
                0,
                -45
            );
            leaf.fill(0x228b22);
            plant.addChild(leaf);

            // Subtle sway
            gsap.to(leaf, {
                rotation: 0.05,
                duration: 2 + Math.random(),
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut',
            });
        }

        plant.position.set(w / 2 - 200, h * 0.62);
        this.container.addChild(plant);

        // Floor plant
        const floorPlant = new PIXI.Container();

        const bigPot = new PIXI.Graphics();
        bigPot.moveTo(-35, 0);
        bigPot.lineTo(-40, -80);
        bigPot.lineTo(40, -80);
        bigPot.lineTo(35, 0);
        bigPot.closePath();
        bigPot.fill(0x5a3a2a);
        floorPlant.addChild(bigPot);

        // Large leaves
        for (let i = 0; i < 5; i++) {
            const leaf = new PIXI.Graphics();
            const angle = ((i - 2) / 4) * 0.8;

            leaf.moveTo(0, -80);
            leaf.quadraticCurveTo(
                Math.sin(angle) * 40,
                -140,
                Math.sin(angle) * 60,
                -180 - Math.random() * 30
            );
            leaf.quadraticCurveTo(
                Math.sin(angle) * 20,
                -120,
                0,
                -80
            );
            leaf.fill(0x2d5a3d);
            floorPlant.addChild(leaf);

            gsap.to(leaf, {
                rotation: 0.03,
                duration: 3 + Math.random(),
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut',
            });
        }

        floorPlant.position.set(w * 0.88, h * 0.85);
        this.container.addChild(floorPlant);
    }

    enter() {
        super.enter();
    }

    update(delta) {
        // Could add typing animation here
    }

    destroy() {
        super.destroy();
    }
}
