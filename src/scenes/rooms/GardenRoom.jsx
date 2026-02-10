// src/scenes/rooms/GardenRoom.jsx
// The Garden - Wishing Well with future bucket list and dreams
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import BaseRoom from '../BaseRoom.jsx';
import { COLORS, ROOM_CONFIGS } from '../../core/constants.jsx';
import soundManager from '../../core/SoundManager.jsx';

export default class GardenRoom extends BaseRoom {
    constructor(manager) {
        super(manager, {
            title: ROOM_CONFIGS.GARDEN.title,
            subtitle: ROOM_CONFIGS.GARDEN.subtitle,
            backgroundColor: ROOM_CONFIGS.GARDEN.color,
            gradientTop: 0x1a3a4a,
            gradientBottom: 0x0a2a1a,
        });

        this.butterflies = [];
        this.fireflies = [];
        this.wishes = [];
        this.wishModalOpen = false;
    }

    init() {
        super.init();
        this.createSky();
        this.createGround();
        this.createTrees();
        this.createFlowers();
        this.createWishingWell();
        this.createBucketList();
        this.createWildlife();
        this.createWishModal();
    }

    createSky() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Sunset/dusk sky gradient
        const skyColors = [
            { pos: 0, color: 0x1a2a4a },
            { pos: 0.3, color: 0x3a4a6a },
            { pos: 0.5, color: 0x6a5a7a },
            { pos: 0.7, color: 0xaa7a6a },
            { pos: 1, color: 0xdd9966 },
        ];

        const sky = new PIXI.Container();
        const strips = 30;

        for (let i = 0; i < strips; i++) {
            const strip = new PIXI.Graphics();
            const ratio = i / strips;

            let color;
            for (let j = 0; j < skyColors.length - 1; j++) {
                if (ratio >= skyColors[j].pos && ratio <= skyColors[j + 1].pos) {
                    const t = (ratio - skyColors[j].pos) / (skyColors[j + 1].pos - skyColors[j].pos);
                    const c1 = skyColors[j].color;
                    const c2 = skyColors[j + 1].color;

                    const r = Math.round(((c1 >> 16) & 0xff) * (1 - t) + ((c2 >> 16) & 0xff) * t);
                    const g = Math.round(((c1 >> 8) & 0xff) * (1 - t) + ((c2 >> 8) & 0xff) * t);
                    const b = Math.round((c1 & 0xff) * (1 - t) + (c2 & 0xff) * t);
                    color = (r << 16) | (g << 8) | b;
                    break;
                }
            }

            const stripHeight = (h * 0.6) / strips;
            strip.rect(0, i * stripHeight, w, stripHeight + 1);
            strip.fill(color);
            sky.addChild(strip);
        }

        this.container.addChildAt(sky, 0);

        // Stars appearing
        for (let i = 0; i < 30; i++) {
            const star = new PIXI.Graphics();
            star.circle(0, 0, 1 + Math.random() * 1.5);
            star.fill(0xffffff);
            star.position.set(Math.random() * w, Math.random() * h * 0.4);
            star.alpha = 0.3 + Math.random() * 0.5;
            this.container.addChild(star);

            gsap.to(star, {
                alpha: 0.1,
                duration: 1.5 + Math.random() * 2,
                yoyo: true,
                repeat: -1,
            });
        }

        // Moon
        const moon = new PIXI.Graphics();
        moon.circle(0, 0, 40);
        moon.fill(0xffffd0);
        moon.position.set(w * 0.85, h * 0.15);
        this.container.addChild(moon);

        // Moon glow
        const moonGlow = new PIXI.Graphics();
        moonGlow.circle(0, 0, 60);
        moonGlow.fill({ color: 0xffffd0, alpha: 0.15 });
        moonGlow.position.set(w * 0.85, h * 0.15);
        this.container.addChildAt(moonGlow, 1);
    }

    createGround() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Ground
        const ground = new PIXI.Graphics();
        ground.rect(0, h * 0.55, w, h * 0.45);
        ground.fill(0x2a4a2a);
        this.container.addChild(ground);

        // Path to well
        const path = new PIXI.Graphics();
        path.moveTo(w * 0.3, h);
        path.bezierCurveTo(w * 0.35, h * 0.85, w * 0.4, h * 0.75, w * 0.45, h * 0.7);
        path.lineTo(w * 0.55, h * 0.7);
        path.bezierCurveTo(w * 0.6, h * 0.75, w * 0.65, h * 0.85, w * 0.7, h);
        path.closePath();
        path.fill(0x8b7355);
        this.container.addChild(path);

        // Path stones
        for (let i = 0; i < 15; i++) {
            const stone = new PIXI.Graphics();
            const x = w * 0.35 + Math.random() * w * 0.3;
            const y = h * 0.72 + Math.random() * (h * 0.25);
            stone.ellipse(0, 0, 15 + Math.random() * 15, 8 + Math.random() * 8);
            stone.fill(0x9a8875);
            stone.position.set(x, y);
            this.container.addChild(stone);
        }
    }

    createTrees() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Left tree
        this.createTree(w * 0.08, h * 0.55, 0.8);

        // Right tree
        this.createTree(w * 0.92, h * 0.56, 0.9);

        // Background trees (smaller)
        this.createTree(w * 0.2, h * 0.52, 0.5, true);
        this.createTree(w * 0.8, h * 0.52, 0.5, true);
    }

    createTree(x, y, scale, isBg = false) {
        const tree = new PIXI.Container();

        // Trunk
        const trunk = new PIXI.Graphics();
        trunk.rect(-15 * scale, 0, 30 * scale, 120 * scale);
        trunk.fill(isBg ? 0x3a2a1a : 0x5a4030);
        tree.addChild(trunk);

        // Foliage layers
        const foliageColors = isBg ? [0x1a3a1a, 0x2a4a2a] : [0x228b22, 0x32a852, 0x2d7a32];

        foliageColors.forEach((color, i) => {
            const foliage = new PIXI.Graphics();
            const size = (80 - i * 15) * scale;
            foliage.circle(0, -50 * scale - i * 30 * scale, size);
            foliage.fill(color);
            tree.addChild(foliage);
        });

        tree.position.set(x, y);
        this.container.addChild(tree);

        // Sway animation
        gsap.to(tree, {
            rotation: 0.02,
            duration: 3 + Math.random() * 2,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
        });
    }

    createFlowers() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        const flowerColors = [0xff69b4, 0xffff00, 0xff6347, 0xda70d6, 0xffffff];

        // Scatter flowers
        for (let i = 0; i < 25; i++) {
            const flower = new PIXI.Container();
            const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];

            // Stem
            const stem = new PIXI.Graphics();
            stem.rect(-1, 0, 2, 15 + Math.random() * 10);
            stem.fill(0x228b22);
            flower.addChild(stem);

            // Petals
            for (let p = 0; p < 5; p++) {
                const petal = new PIXI.Graphics();
                const angle = (p / 5) * Math.PI * 2;
                petal.ellipse(Math.cos(angle) * 6, Math.sin(angle) * 6 - 5, 5, 8);
                petal.fill(color);
                flower.addChild(petal);
            }

            // Center
            const center = new PIXI.Graphics();
            center.circle(0, -5, 4);
            center.fill(0xffd700);
            flower.addChild(center);

            // Position avoiding path
            let fx, fy;
            do {
                fx = Math.random() * w;
                fy = h * 0.6 + Math.random() * (h * 0.35);
            } while (fx > w * 0.3 && fx < w * 0.7 && fy > h * 0.7);

            flower.position.set(fx, fy);
            flower.scale.set(0.6 + Math.random() * 0.4);
            this.container.addChild(flower);

            // Gentle sway
            gsap.to(flower, {
                rotation: 0.1,
                duration: 1.5 + Math.random(),
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut',
            });
        }
    }

    createWishingWell() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        const well = new PIXI.Container();

        // Well base (stone)
        const base = new PIXI.Graphics();
        base.ellipse(0, 30, 70, 25);
        base.fill(0x5a5a5a);
        well.addChild(base);

        const wall = new PIXI.Graphics();
        wall.rect(-65, -30, 130, 60);
        wall.fill(0x6a6a6a);
        well.addChild(wall);

        // Stone texture
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 8; col++) {
                const stone = new PIXI.Graphics();
                const sx = -60 + col * 16 + (row % 2) * 8;
                const sy = -25 + row * 15;
                stone.roundRect(sx, sy, 14, 13, 2);
                stone.fill(0x7a7a7a);
                stone.stroke({ width: 1, color: 0x5a5a5a });
                well.addChild(stone);
            }
        }

        // Inner darkness (water)
        const water = new PIXI.Graphics();
        water.ellipse(0, -5, 50, 18);
        water.fill(0x1a1a3a);
        well.addChild(water);

        // Water shimmer
        const shimmer = new PIXI.Graphics();
        shimmer.ellipse(10, -8, 15, 5);
        shimmer.fill({ color: 0x4a4a8a, alpha: 0.5 });
        well.addChild(shimmer);

        gsap.to(shimmer, {
            x: -15,
            duration: 3,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
        });

        // Roof support posts
        const leftPost = new PIXI.Graphics();
        leftPost.rect(-55, -130, 10, 105);
        leftPost.fill(0x5a4030);
        well.addChild(leftPost);

        const rightPost = new PIXI.Graphics();
        rightPost.rect(45, -130, 10, 105);
        rightPost.fill(0x5a4030);
        well.addChild(rightPost);

        // Roof
        const roof = new PIXI.Graphics();
        roof.moveTo(0, -170);
        roof.lineTo(-75, -125);
        roof.lineTo(75, -125);
        roof.closePath();
        roof.fill(0x8b4513);
        roof.stroke({ width: 2, color: 0x6a3410 });
        well.addChild(roof);

        // Roof tiles
        for (let i = 0; i < 3; i++) {
            const tile = new PIXI.Graphics();
            tile.moveTo(0, -170 + i * 15);
            tile.lineTo(-55 - i * 7, -125);
            tile.stroke({ width: 1, color: 0x6a3410 });
            tile.moveTo(0, -170 + i * 15);
            tile.lineTo(55 + i * 7, -125);
            tile.stroke({ width: 1, color: 0x6a3410 });
            well.addChild(tile);
        }

        // Bucket and rope
        const rope = new PIXI.Graphics();
        rope.moveTo(0, -130);
        rope.lineTo(0, -40);
        rope.stroke({ width: 3, color: 0x8b7355 });
        well.addChild(rope);

        const bucket = new PIXI.Graphics();
        bucket.moveTo(-12, -55);
        bucket.lineTo(-15, -35);
        bucket.lineTo(15, -35);
        bucket.lineTo(12, -55);
        bucket.closePath();
        bucket.fill(0x654321);
        bucket.stroke({ width: 1, color: 0x4a3215 });
        well.addChild(bucket);

        // Handle
        const bucketHandle = new PIXI.Graphics();
        bucketHandle.arc(0, -55, 10, Math.PI, 0);
        bucketHandle.stroke({ width: 2, color: 0x4a4a4a });
        well.addChild(bucketHandle);

        // Label
        const label = new PIXI.Text({
            text: '✨ Wishing Well ✨',
            style: {
                fontFamily: 'Playfair Display, serif',
                fontSize: 16,
                fill: COLORS.GOLD,
                fontWeight: '600',
            }
        });
        label.anchor.set(0.5);
        label.position.set(0, 60);
        well.addChild(label);

        // Glow effect
        const glow = new PIXI.Graphics();
        glow.ellipse(0, 0, 100, 50);
        glow.fill({ color: 0x4a90e2, alpha: 0 });
        glow.name = 'glow';
        well.addChildAt(glow, 0);

        // Make interactive
        well.eventMode = 'static';
        well.cursor = 'pointer';
        well.hitArea = new PIXI.Rectangle(-75, -170, 150, 240);

        well.on('pointerover', () => {
            gsap.to(glow, { alpha: 0.15, duration: 0.3 });
            gsap.to(well.scale, { x: 1.05, y: 1.05, duration: 0.3 });
        });

        well.on('pointerout', () => {
            gsap.to(glow, { alpha: 0, duration: 0.3 });
            gsap.to(well.scale, { x: 1, y: 1, duration: 0.3 });
        });

        well.on('pointertap', () => {
            this.showWishes();
        });

        well.position.set(w / 2, h * 0.72);
        this.elements.well = well;
        this.container.addChild(well);
    }

    createBucketList() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Signpost with bucket list
        const signpost = new PIXI.Container();

        // Post
        const post = new PIXI.Graphics();
        post.rect(-8, -180, 16, 220);
        post.fill(0x5a4030);
        signpost.addChild(post);

        // Signs
        const dreams = [
            { text: '🗼 Paris Together', angle: -0.15 },
            { text: '🏝️ Maldives Beach', angle: 0.1 },
            { text: '🗻 Climb a Mountain', angle: -0.08 },
            { text: '🏠 Our Dream Home', angle: 0.12 },
        ];

        dreams.forEach((dream, i) => {
            const sign = new PIXI.Container();

            const plank = new PIXI.Graphics();
            const direction = i % 2 === 0 ? 1 : -1;
            plank.roundRect(0, 0, 130, 35, 3);
            plank.fill(0x8b7355);
            plank.stroke({ width: 2, color: 0x6a5540 });
            sign.addChild(plank);

            // Arrow point
            const arrow = new PIXI.Graphics();
            if (direction === 1) {
                arrow.moveTo(130, 0);
                arrow.lineTo(145, 17.5);
                arrow.lineTo(130, 35);
                arrow.closePath();
            } else {
                arrow.moveTo(0, 0);
                arrow.lineTo(-15, 17.5);
                arrow.lineTo(0, 35);
                arrow.closePath();
            }
            arrow.fill(0x8b7355);
            sign.addChild(arrow);

            const text = new PIXI.Text({
                text: dream.text,
                style: {
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    fill: 0xffffff,
                    fontWeight: '500',
                }
            });
            text.anchor.set(0.5);
            text.position.set(65, 17.5);
            sign.addChild(text);

            sign.position.set(direction === 1 ? 8 : -138, -170 + i * 45);
            sign.rotation = dream.angle;
            signpost.addChild(sign);
        });

        // Title sign at top
        const titleSign = new PIXI.Graphics();
        titleSign.roundRect(-60, -210, 120, 30, 5);
        titleSign.fill(0x4a3520);
        titleSign.stroke({ width: 2, color: COLORS.GOLD });
        signpost.addChild(titleSign);

        const title = new PIXI.Text({
            text: '🌟 Our Dreams 🌟',
            style: {
                fontFamily: 'Playfair Display, serif',
                fontSize: 12,
                fill: COLORS.GOLD,
            }
        });
        title.anchor.set(0.5);
        title.position.set(0, -195);
        signpost.addChild(title);

        signpost.position.set(w * 0.18, h * 0.8);
        this.container.addChild(signpost);

        // Second signpost on right
        const rightPost = new PIXI.Container();

        const rightPole = new PIXI.Graphics();
        rightPole.rect(-8, -150, 16, 190);
        rightPole.fill(0x5a4030);
        rightPost.addChild(rightPole);

        const moreDreams = [
            '💫 Travel the World',
            '📸 Photo Album',
            '🎓 Learn Together',
        ];

        moreDreams.forEach((text, i) => {
            const sign = new PIXI.Graphics();
            sign.roundRect(-65, -140 + i * 45, 130, 35, 3);
            sign.fill(0x7a6545);
            sign.stroke({ width: 1, color: 0x5a4535 });
            rightPost.addChild(sign);

            const label = new PIXI.Text({
                text: text,
                style: {
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    fill: 0xffffff,
                }
            });
            label.anchor.set(0.5);
            label.position.set(0, -122.5 + i * 45);
            rightPost.addChild(label);
        });

        rightPost.position.set(w * 0.82, h * 0.8);
        this.container.addChild(rightPost);
    }

    createWildlife() {
        // Fireflies
        for (let i = 0; i < 20; i++) {
            this.createFirefly();
        }

        // Butterflies
        for (let i = 0; i < 5; i++) {
            this.createButterfly();
        }
    }

    createFirefly() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        const firefly = new PIXI.Graphics();
        firefly.circle(0, 0, 3);
        firefly.fill(0xffff88);

        firefly.position.set(
            Math.random() * w,
            h * 0.4 + Math.random() * (h * 0.5)
        );

        this.container.addChild(firefly);
        this.fireflies.push(firefly);

        // Float around
        const duration = 3 + Math.random() * 4;

        gsap.to(firefly, {
            x: firefly.x + (Math.random() - 0.5) * 200,
            y: firefly.y + (Math.random() - 0.5) * 100,
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
        });

        // Glow pulse
        gsap.to(firefly, {
            alpha: 0.2,
            duration: 0.5 + Math.random() * 0.5,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
        });
    }

    createButterfly() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const colors = [0xff69b4, 0xffa500, 0x87ceeb, 0xdda0dd];

        const butterfly = new PIXI.Container();
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Wings
        const leftWing = new PIXI.Graphics();
        leftWing.ellipse(-8, 0, 10, 15);
        leftWing.fill(color);
        butterfly.addChild(leftWing);

        const rightWing = new PIXI.Graphics();
        rightWing.ellipse(8, 0, 10, 15);
        rightWing.fill(color);
        butterfly.addChild(rightWing);

        // Body
        const body = new PIXI.Graphics();
        body.ellipse(0, 0, 2, 8);
        body.fill(0x2a2a2a);
        butterfly.addChild(body);

        butterfly.position.set(
            Math.random() * w,
            h * 0.3 + Math.random() * (h * 0.3)
        );
        butterfly.scale.set(0.5 + Math.random() * 0.3);

        this.container.addChild(butterfly);
        this.butterflies.push(butterfly);

        // Wing flap
        gsap.to(leftWing.scale, { x: 0.3, duration: 0.15, yoyo: true, repeat: -1 });
        gsap.to(rightWing.scale, { x: 0.3, duration: 0.15, yoyo: true, repeat: -1 });

        // Float path
        const floatButterfly = () => {
            gsap.to(butterfly, {
                x: Math.random() * w,
                y: h * 0.3 + Math.random() * (h * 0.3),
                duration: 5 + Math.random() * 5,
                ease: 'sine.inOut',
                onComplete: floatButterfly,
            });
        };
        floatButterfly();
    }

    createWishModal() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Wishes/dreams data
        this.wishes = [
            { wish: 'To grow old together, hand in hand 👫', icon: '💕' },
            { wish: 'To see the Northern Lights with you 🌌', icon: '✨' },
            { wish: 'To build a home filled with love 🏠', icon: '💖' },
            { wish: 'To dance in the rain together 🌧️', icon: '💃' },
            { wish: 'To never stop making each other laugh 😄', icon: '❤️' },
        ];

        this.wishModal = new PIXI.Container();
        this.wishModal.visible = false;

        // Backdrop
        const backdrop = new PIXI.Graphics();
        backdrop.rect(0, 0, w, h);
        backdrop.fill({ color: 0x000000, alpha: 0.85 });
        backdrop.eventMode = 'static';
        backdrop.on('pointertap', () => this.hideWishes());
        this.wishModal.addChild(backdrop);

        // Modal content
        this.wishCard = new PIXI.Container();

        // Scroll/paper background
        const scroll = new PIXI.Graphics();
        scroll.roundRect(-220, -250, 440, 500, 15);
        scroll.fill(0xf5e6c8);
        scroll.stroke({ width: 4, color: 0xd4b896 });
        this.wishCard.addChild(scroll);

        // Decorative top
        const scrollTop = new PIXI.Graphics();
        scrollTop.ellipse(0, -250, 200, 20);
        scrollTop.fill(0xd4b896);
        this.wishCard.addChild(scrollTop);

        // Title
        const title = new PIXI.Text({
            text: '✨ Our Wishes ✨',
            style: {
                fontFamily: 'Playfair Display, serif',
                fontSize: 28,
                fill: 0x5a4030,
                fontWeight: '600',
            }
        });
        title.anchor.set(0.5);
        title.position.set(0, -200);
        this.wishCard.addChild(title);

        // Subtitle
        const subtitle = new PIXI.Text({
            text: 'Dreams we\'re planting together',
            style: {
                fontFamily: 'Dancing Script, cursive',
                fontSize: 16,
                fill: 0x8a7a6a,
            }
        });
        subtitle.anchor.set(0.5);
        subtitle.position.set(0, -165);
        this.wishCard.addChild(subtitle);

        // Wishes list
        this.wishes.forEach((wish, i) => {
            const wishContainer = new PIXI.Container();

            // Icon
            const icon = new PIXI.Text({
                text: wish.icon,
                style: { fontSize: 24 }
            });
            icon.anchor.set(0.5);
            icon.position.set(-180, 0);
            wishContainer.addChild(icon);

            // Wish text
            const text = new PIXI.Text({
                text: wish.wish,
                style: {
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14,
                    fill: 0x4a3a2a,
                    wordWrap: true,
                    wordWrapWidth: 320,
                }
            });
            text.anchor.set(0, 0.5);
            text.position.set(-150, 0);
            wishContainer.addChild(text);

            wishContainer.position.set(0, -110 + i * 65);
            this.wishCard.addChild(wishContainer);
        });

        // Decorative line
        const line = new PIXI.Graphics();
        line.moveTo(-180, 210);
        line.lineTo(180, 210);
        line.stroke({ width: 1, color: 0xd4b896 });
        this.wishCard.addChild(line);

        // Close hint
        const closeHint = new PIXI.Text({
            text: 'Click anywhere to close',
            style: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                fill: 0x8a7a6a,
            }
        });
        closeHint.anchor.set(0.5);
        closeHint.position.set(0, 230);
        this.wishCard.addChild(closeHint);

        this.wishCard.position.set(w / 2, h / 2);
        this.wishModal.addChild(this.wishCard);

        this.container.addChild(this.wishModal);
    }

    showWishes() {
        this.wishModalOpen = true;
        this.wishModal.visible = true;
        this.wishCard.alpha = 0;
        this.wishCard.scale.set(0.8);

        gsap.to(this.wishCard, { alpha: 1, duration: 0.3 });
        gsap.to(this.wishCard.scale, { x: 1, y: 1, duration: 0.4, ease: 'back.out' });
    }

    hideWishes() {
        gsap.to(this.wishCard, { alpha: 0, duration: 0.2 });
        gsap.to(this.wishCard.scale, {
            x: 0.8, y: 0.8, duration: 0.2, onComplete: () => {
                this.wishModal.visible = false;
                this.wishModalOpen = false;
            }
        });
    }

    enter() {
        super.enter();
    }

    update(delta) {
        // Fireflies already animated via GSAP
    }

    destroy() {
        this.fireflies.forEach(f => gsap.killTweensOf(f));
        this.butterflies.forEach(b => {
            gsap.killTweensOf(b);
            b.children.forEach(c => gsap.killTweensOf(c.scale));
        });
        gsap.killTweensOf(this.wishCard);
        gsap.killTweensOf(this.wishCard.scale);
        super.destroy();
    }
}
