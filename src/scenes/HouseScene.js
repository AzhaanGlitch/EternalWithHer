// src/scenes/HouseScene.js
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { SCENES, COLORS } from '../core/constants';
import soundManager from '../core/SoundManager';

export default class HouseScene {
  constructor(manager) {
    this.manager = manager;
    this.container = new PIXI.Container();
    this.elements = {};
    this.isInteractive = false;
  }

  init() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.createBackground();
    this.createHouse();
    this.createAmbientEffects();
    this.createInstructions();
  }

  createBackground() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Night sky gradient
    const sky = new PIXI.Container();
    const strips = 30;

    for (let i = 0; i < strips; i++) {
      const strip = new PIXI.Graphics();
      const ratio = i / strips;
      const topColor = 0x0a0a1a;
      const bottomColor = 0x1a1a3a;

      const r1 = (topColor >> 16) & 0xff;
      const g1 = (topColor >> 8) & 0xff;
      const b1 = topColor & 0xff;
      const r2 = (bottomColor >> 16) & 0xff;
      const g2 = (bottomColor >> 8) & 0xff;
      const b2 = bottomColor & 0xff;

      const r = Math.round(r1 + (r2 - r1) * ratio);
      const g = Math.round(g1 + (g2 - g1) * ratio);
      const b = Math.round(b1 + (b2 - b1) * ratio);

      const stripHeight = h / strips + 1;
      strip.rect(0, i * stripHeight, w, stripHeight);
      strip.fill((r << 16) | (g << 8) | b);
      sky.addChild(strip);
    }

    this.container.addChild(sky);

    // Stars
    this.elements.stars = new PIXI.Container();
    for (let i = 0; i < 100; i++) {
      const star = new PIXI.Graphics();
      const size = Math.random() * 2 + 1;
      star.circle(0, 0, size);
      star.fill({ color: 0xffffff, alpha: Math.random() * 0.5 + 0.3 });
      star.position.set(
        Math.random() * w,
        Math.random() * h * 0.5
      );
      this.elements.stars.addChild(star);

      // Twinkle animation
      gsap.to(star, {
        alpha: Math.random() * 0.3 + 0.2,
        duration: Math.random() * 2 + 1,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: Math.random() * 2,
      });
    }
    this.container.addChild(this.elements.stars);

    // Moon
    const moon = new PIXI.Container();
    const moonGlow = new PIXI.Graphics();
    for (let i = 5; i > 0; i--) {
      moonGlow.circle(0, 0, 40 + i * 15);
      moonGlow.fill({ color: 0xffffd0, alpha: 0.02 * i });
    }

    const moonBody = new PIXI.Graphics();
    moonBody.circle(0, 0, 40);
    moonBody.fill(0xffffd0);

    moon.addChild(moonGlow, moonBody);
    moon.position.set(w * 0.15, h * 0.15);
    this.container.addChild(moon);

    // Ground
    const ground = new PIXI.Graphics();
    ground.rect(0, h * 0.7, w, h * 0.3);
    ground.fill(0x0d1f0d);
    this.container.addChild(ground);

    // Grass patches
    for (let i = 0; i < 50; i++) {
      const grass = new PIXI.Graphics();
      const x = Math.random() * w;
      const y = h * 0.7 + Math.random() * 50;

      grass.moveTo(x, y);
      grass.lineTo(x - 3, y - 10 - Math.random() * 10);
      grass.moveTo(x, y);
      grass.lineTo(x + 3, y - 8 - Math.random() * 10);
      grass.stroke({ width: 2, color: 0x1a3a1a });

      this.container.addChild(grass);
    }
  }

  createHouse() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const houseWidth = 350;
    const houseHeight = 280;
    const centerX = w / 2;
    const baseY = h * 0.7;

    this.elements.house = new PIXI.Container();

    // House body
    const body = new PIXI.Graphics();
    body.rect(-houseWidth / 2, -houseHeight, houseWidth, houseHeight);
    body.fill(0x3a2a1a);
    this.elements.house.addChild(body);

    // Brick pattern
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 8; col++) {
        const brick = new PIXI.Graphics();
        const brickW = 40;
        const brickH = 25;
        const offsetX = (row % 2) * (brickW / 2);
        brick.rect(
          -houseWidth / 2 + col * brickW + offsetX + 5,
          -houseHeight + row * brickH + 5,
          brickW - 3,
          brickH - 3
        );
        brick.fill({ color: 0x4a3a2a, alpha: 0.5 });
        this.elements.house.addChild(brick);
      }
    }

    // Roof
    const roof = new PIXI.Graphics();
    roof.moveTo(-houseWidth / 2 - 30, -houseHeight);
    roof.lineTo(0, -houseHeight - 100);
    roof.lineTo(houseWidth / 2 + 30, -houseHeight);
    roof.closePath();
    roof.fill(0x2a1a0a);
    this.elements.house.addChild(roof);

    // Chimney
    const chimney = new PIXI.Graphics();
    chimney.rect(80, -houseHeight - 80, 40, 80);
    chimney.fill(0x3a2a1a);
    this.elements.house.addChild(chimney);

    // Windows
    const windowPositions = [
      { x: -100, y: -200 },
      { x: 60, y: -200 },
    ];

    windowPositions.forEach(pos => {
      const windowFrame = new PIXI.Graphics();
      windowFrame.rect(pos.x - 30, pos.y, 60, 70);
      windowFrame.fill(0x1a1a2a);
      windowFrame.stroke({ width: 4, color: 0x5a4a3a });

      // Window glow
      const glow = new PIXI.Graphics();
      glow.rect(pos.x - 25, pos.y + 5, 50, 60);
      glow.fill({ color: 0xffcc66, alpha: 0.6 });

      // Window cross
      const cross = new PIXI.Graphics();
      cross.moveTo(pos.x, pos.y);
      cross.lineTo(pos.x, pos.y + 70);
      cross.moveTo(pos.x - 30, pos.y + 35);
      cross.lineTo(pos.x + 30, pos.y + 35);
      cross.stroke({ width: 3, color: 0x5a4a3a });

      this.elements.house.addChild(windowFrame, glow, cross);
    });

    // Door
    this.elements.door = new PIXI.Container();

    const doorFrame = new PIXI.Graphics();
    doorFrame.roundRect(-35, -130, 70, 130, 5);
    doorFrame.fill(COLORS.DOOR_DARK);
    doorFrame.stroke({ width: 4, color: COLORS.GOLD });

    // Door arch
    const doorArch = new PIXI.Graphics();
    doorArch.arc(0, -130, 35, Math.PI, 0);
    doorArch.fill(COLORS.DOOR_DARK);
    doorArch.stroke({ width: 4, color: COLORS.GOLD });

    // Door knob
    const knob = new PIXI.Graphics();
    knob.circle(20, -60, 8);
    knob.fill(COLORS.GOLD);

    // Door glow effect (hidden initially)
    const doorGlow = new PIXI.Graphics();
    doorGlow.roundRect(-40, -135, 80, 140, 8);
    doorGlow.fill({ color: COLORS.GOLD, alpha: 0 });
    doorGlow.name = 'glow';

    this.elements.door.addChild(doorGlow, doorFrame, doorArch, knob);
    this.elements.door.position.set(0, 0);
    this.elements.house.addChild(this.elements.door);

    // Door interactivity
    this.elements.door.eventMode = 'static';
    this.elements.door.cursor = 'pointer';
    this.elements.door.hitArea = new PIXI.Rectangle(-40, -140, 80, 145);

    this.elements.door.on('pointerover', () => {
      if (!this.isInteractive) return;
      gsap.to(doorGlow, { alpha: 0.3, duration: 0.3 });
      gsap.to(this.elements.door.scale, { x: 1.05, y: 1.05, duration: 0.3 });
    });

    this.elements.door.on('pointerout', () => {
      gsap.to(doorGlow, { alpha: 0, duration: 0.3 });
      gsap.to(this.elements.door.scale, { x: 1, y: 1, duration: 0.3 });
    });

    this.elements.door.on('pointertap', () => {
      if (!this.isInteractive) return;
      soundManager.play('doorOpen');
      this.openDoor();
    });

    // Position house
    this.elements.house.position.set(centerX, baseY);
    this.container.addChild(this.elements.house);

    // Path to door
    const path = new PIXI.Graphics();
    path.moveTo(centerX - 40, baseY);
    path.lineTo(centerX + 40, baseY);
    path.lineTo(centerX + 60, h);
    path.lineTo(centerX - 60, h);
    path.closePath();
    path.fill({ color: 0x3a3a2a, alpha: 0.8 });
    this.container.addChild(path);
  }

  createAmbientEffects() {
    // Smoke from chimney
    this.elements.smokeParticles = [];

    const createSmoke = () => {
      if (!this.container.parent) return;

      const smoke = new PIXI.Graphics();
      smoke.circle(0, 0, 8 + Math.random() * 8);
      smoke.fill({ color: 0x888888, alpha: 0.3 });
      smoke.position.set(
        window.innerWidth / 2 + 100,
        window.innerHeight * 0.7 - 350
      );
      this.container.addChild(smoke);

      gsap.to(smoke, {
        x: smoke.x + (Math.random() - 0.5) * 50,
        y: smoke.y - 100 - Math.random() * 50,
        alpha: 0,
        scale: 2,
        duration: 3 + Math.random() * 2,
        ease: 'power1.out',
        onComplete: () => {
          smoke.destroy();
        }
      });
    };

    this.smokeInterval = setInterval(createSmoke, 500);
  }

  createInstructions() {
    this.elements.instruction = new PIXI.Text({
      text: '✦ Click the door to enter ✦',
      style: {
        fontFamily: 'Playfair Display, serif',
        fontSize: 22,
        fill: COLORS.GOLD,
      }
    });

    this.elements.instruction.anchor.set(0.5);
    this.elements.instruction.position.set(window.innerWidth / 2, window.innerHeight - 60);
    this.elements.instruction.alpha = 0;
    this.container.addChild(this.elements.instruction);
  }

  openDoor() {
    this.isInteractive = false;

    // Door open animation
    gsap.to(this.elements.door.scale, {
      x: 0.1,
      duration: 0.5,
      ease: 'power2.in'
    });

    // Fade to interior
    setTimeout(() => {
      this.manager.change(SCENES.INTERIOR, { transition: 'fade', duration: 0.8 });
    }, 400);
  }

  enter() {
    soundManager.register('doorOpen', '/assets/sounds/door.mp3');

    // Animate house appearing
    this.elements.house.scale.set(0.8);
    this.elements.house.alpha = 0;

    gsap.to(this.elements.house, { alpha: 1, duration: 1, ease: 'power2.out' });
    gsap.to(this.elements.house.scale, { x: 1, y: 1, duration: 1.2, ease: 'back.out' });

    // Show instruction after delay
    gsap.to(this.elements.instruction, {
      alpha: 1,
      duration: 0.5,
      delay: 1.2,
    });

    // Enable interaction after animation
    setTimeout(() => {
      this.isInteractive = true;
    }, 1200);
  }

  update(delta) {
    // Could add subtle camera sway here
  }

  exit() {
    if (this.smokeInterval) {
      clearInterval(this.smokeInterval);
    }
  }

  resize() {
    // Handle resize
  }

  destroy() {
    if (this.smokeInterval) {
      clearInterval(this.smokeInterval);
    }
    gsap.killTweensOf(this.elements.instruction);
    gsap.killTweensOf(this.elements.house);
    this.container.destroy({ children: true });
  }
}
