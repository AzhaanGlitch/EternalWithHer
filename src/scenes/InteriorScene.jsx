// src/scenes/InteriorScene.jsx
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { SCENES, COLORS, ROOM_CONFIGS } from '../core/constants.jsx';
import soundManager from '../core/SoundManager.jsx';

export default class InteriorScene {
  constructor(manager) {
    this.manager = manager;
    this.container = new PIXI.Container();
    this.elements = {};
    this.doors = [];
    this.isInteractive = false;
  }

  init() {
    this.createBackground();
    this.createDoors();
    this.createDecor();
    this.createTitle();
  }

  createBackground() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Warm interior gradient
    const bg = new PIXI.Container();
    const strips = 40;
    const topColor = 0x1a0f0a;
    const bottomColor = 0x0a0805;

    for (let i = 0; i < strips; i++) {
      const strip = new PIXI.Graphics();
      const ratio = i / strips;

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
      bg.addChild(strip);
    }
    this.container.addChild(bg);

    // Woodgrain floor
    const floor = new PIXI.Graphics();
    floor.rect(0, h * 0.72, w, h * 0.28);
    floor.fill(0x1a0f08);
    this.container.addChild(floor);

    // Floor planks
    for (let i = 0; i < 15; i++) {
      const plank = new PIXI.Graphics();
      const plankWidth = w / 8;
      plank.rect(i * plankWidth - (i % 2) * plankWidth / 2, h * 0.72, plankWidth - 3, h * 0.28);
      plank.fill({ color: 0x2a1a10, alpha: 0.4 });
      this.container.addChild(plank);
    }

    // Wainscoting
    const wainscot = new PIXI.Graphics();
    wainscot.rect(0, h * 0.55, w, h * 0.17);
    wainscot.fill(0x2a1a10);
    this.container.addChild(wainscot);

    // Wainscot trim
    const trim = new PIXI.Graphics();
    trim.rect(0, h * 0.545, w, 8);
    trim.fill(COLORS.GOLD);
    trim.rect(0, h * 0.715, w, 6);
    trim.fill(COLORS.GOLD);
    this.container.addChild(trim);

    // Crown molding
    const crown = new PIXI.Graphics();
    crown.rect(0, 0, w, 40);
    crown.fill(0x2a1a10);
    crown.rect(0, 35, w, 8);
    crown.fill(COLORS.GOLD);
    this.container.addChild(crown);

    // Wallpaper pattern (subtle)
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 12; x++) {
        const pattern = new PIXI.Graphics();
        const px = x * (w / 10) + (y % 2) * (w / 20);
        const py = 60 + y * (h * 0.06);

        // Diamond shape
        pattern.moveTo(px, py - 10);
        pattern.lineTo(px + 8, py);
        pattern.lineTo(px, py + 10);
        pattern.lineTo(px - 8, py);
        pattern.closePath();
        pattern.fill({ color: COLORS.GOLD, alpha: 0.05 });
        this.container.addChild(pattern);
      }
    }
  }

  createDoors() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Door configurations - 7 doors arranged in an arc
    const doorConfigs = [
      { scene: SCENES.LIVING, config: ROOM_CONFIGS.LIVING },
      { scene: SCENES.BEDROOM, config: ROOM_CONFIGS.BEDROOM },
      { scene: SCENES.KITCHEN, config: ROOM_CONFIGS.KITCHEN },
      { scene: SCENES.GAMING, config: ROOM_CONFIGS.GAMING },
      { scene: SCENES.DANCE, config: ROOM_CONFIGS.DANCE },
      { scene: SCENES.STUDY, config: ROOM_CONFIGS.STUDY },
      { scene: SCENES.GARDEN, config: ROOM_CONFIGS.GARDEN },
    ];

    const totalDoors = doorConfigs.length;
    const doorWidth = Math.min(90, (w - 100) / totalDoors - 20);
    const doorHeight = 160;
    const startX = (w - (totalDoors * (doorWidth + 30))) / 2 + doorWidth / 2;
    const baseY = h * 0.72 - doorHeight;

    doorConfigs.forEach((doorData, index) => {
      // Create curved arrangement
      const progress = index / (totalDoors - 1);
      const curve = Math.sin(progress * Math.PI) * 20;
      const x = startX + index * (doorWidth + 30);
      const y = baseY - curve;

      const door = this.createDoor(x, y, doorWidth, doorHeight, doorData, index);
      door.alpha = 0;
      door.y += 60;
      this.doors.push({ container: door, config: doorData, index });
      this.container.addChild(door);
    });
  }

  createDoor(x, y, width, height, doorData, index) {
    const { scene, config } = doorData;
    const doorContainer = new PIXI.Container();
    doorContainer.position.set(x, y);

    // Door frame shadow
    const frameShadow = new PIXI.Graphics();
    frameShadow.roundRect(-width / 2 - 15, -15, width + 30, height + 25, 6);
    frameShadow.fill({ color: 0x000000, alpha: 0.5 });
    doorContainer.addChild(frameShadow);

    // Door frame
    const frame = new PIXI.Graphics();
    frame.roundRect(-width / 2 - 10, -10, width + 20, height + 20, 5);
    frame.fill(0x1a0f08);
    frame.stroke({ width: 2, color: COLORS.GOLD, alpha: 0.6 });
    doorContainer.addChild(frame);

    // Door body with color
    const body = new PIXI.Graphics();
    body.roundRect(-width / 2, 0, width, height, 4);
    body.fill(config.color);
    doorContainer.addChild(body);

    // Door gradient overlay
    const overlay = new PIXI.Graphics();
    overlay.roundRect(-width / 2, 0, width, height, 4);
    overlay.fill({ color: 0x000000, alpha: 0.3 });
    doorContainer.addChild(overlay);

    // Door panels
    const panelMargin = 8;
    const panelWidth = width - panelMargin * 2;
    const panelHeight = (height - 70) / 2;

    const panel1 = new PIXI.Graphics();
    panel1.roundRect(-panelWidth / 2, 15, panelWidth, panelHeight, 3);
    panel1.fill({ color: 0x000000, alpha: 0.15 });
    panel1.stroke({ width: 1.5, color: COLORS.GOLD, alpha: 0.4 });
    doorContainer.addChild(panel1);

    const panel2 = new PIXI.Graphics();
    panel2.roundRect(-panelWidth / 2, panelHeight + 25, panelWidth, panelHeight, 3);
    panel2.fill({ color: 0x000000, alpha: 0.15 });
    panel2.stroke({ width: 1.5, color: COLORS.GOLD, alpha: 0.4 });
    doorContainer.addChild(panel2);

    // Door knob
    const knobX = width / 2 - 18;
    const knobY = height / 2 + 5;

    const knobPlate = new PIXI.Graphics();
    knobPlate.roundRect(knobX - 8, knobY - 25, 16, 50, 4);
    knobPlate.fill(COLORS.GOLD);
    doorContainer.addChild(knobPlate);

    const knob = new PIXI.Graphics();
    knob.circle(knobX, knobY, 8);
    knob.fill(COLORS.GOLD_LIGHT);
    doorContainer.addChild(knob);

    // Room name label (on a elegant plaque)
    const plaqueWidth = Math.min(width + 10, 100);
    const plaque = new PIXI.Graphics();
    plaque.roundRect(-plaqueWidth / 2, height + 12, plaqueWidth, 28, 4);
    plaque.fill(0x0a0805);
    plaque.stroke({ width: 1.5, color: COLORS.GOLD, alpha: 0.8 });
    doorContainer.addChild(plaque);

    const label = new PIXI.Text({
      text: config.title,
      style: {
        fontFamily: 'Playfair Display, serif',
        fontSize: 11,
        fill: COLORS.GOLD,
        fontWeight: '600',
        letterSpacing: 1,
      }
    });
    label.anchor.set(0.5);
    label.position.set(0, height + 26);
    doorContainer.addChild(label);

    // Subtitle below
    const subtitle = new PIXI.Text({
      text: config.subtitle,
      style: {
        fontFamily: 'Inter, sans-serif',
        fontSize: 8,
        fill: 0xaaaaaa,
        fontWeight: '400',
      }
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(0, height + 45);
    subtitle.alpha = 0;
    doorContainer.addChild(subtitle);

    // Glow effect (hidden initially)
    const glow = new PIXI.Graphics();
    glow.roundRect(-width / 2 - 20, -20, width + 40, height + 40, 10);
    glow.fill({ color: config.color, alpha: 0 });
    glow.name = 'glow';
    doorContainer.addChildAt(glow, 0);

    // Light ray effect
    const lightRay = new PIXI.Graphics();
    lightRay.moveTo(0, height);
    lightRay.lineTo(-30, height + 100);
    lightRay.lineTo(30, height + 100);
    lightRay.closePath();
    lightRay.fill({ color: config.color, alpha: 0 });
    lightRay.name = 'lightRay';
    doorContainer.addChildAt(lightRay, 0);

    // Make interactive
    doorContainer.eventMode = 'static';
    doorContainer.cursor = 'pointer';
    doorContainer.hitArea = new PIXI.Rectangle(-width / 2 - 10, -10, width + 20, height + 55);

    doorContainer.on('pointerover', () => {
      if (!this.isInteractive) return;
      gsap.to(glow, { alpha: 0.25, duration: 0.3 });
      gsap.to(lightRay, { alpha: 0.1, duration: 0.3 });
      gsap.to(doorContainer.scale, { x: 1.08, y: 1.08, duration: 0.3, ease: 'back.out' });
      gsap.to(doorContainer, { y: y - 8, duration: 0.3 });
      gsap.to(subtitle, { alpha: 1, duration: 0.3 });
      gsap.to(overlay, { alpha: 0.15, duration: 0.3 });
    });

    doorContainer.on('pointerout', () => {
      gsap.to(glow, { alpha: 0, duration: 0.3 });
      gsap.to(lightRay, { alpha: 0, duration: 0.3 });
      gsap.to(doorContainer.scale, { x: 1, y: 1, duration: 0.3 });
      gsap.to(doorContainer, { y: y, duration: 0.3 });
      gsap.to(subtitle, { alpha: 0, duration: 0.3 });
      gsap.to(overlay, { alpha: 0.3, duration: 0.3 });
    });

    doorContainer.on('pointertap', () => {
      if (!this.isInteractive) return;
      soundManager.play('doorOpen');
      this.isInteractive = false;

      // Door open effect
      gsap.to(doorContainer.scale, { x: 1.3, y: 1.3, duration: 0.4 });
      gsap.to(glow, { alpha: 0.8, duration: 0.4 });
      gsap.to(body, { alpha: 0, duration: 0.3 });

      setTimeout(() => {
        this.manager.change(scene, { transition: 'zoom', duration: 0.6 });
      }, 300);
    });

    return doorContainer;
  }

  createDecor() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Grand chandelier
    this.createChandelier(w / 2, 100);

    // Wall sconces
    this.createSconce(60, h * 0.35);
    this.createSconce(w - 60, h * 0.35);

    // Decorative rug
    const rug = new PIXI.Graphics();
    const rugWidth = w * 0.5;
    const rugHeight = h * 0.18;
    rug.roundRect(-rugWidth / 2, 0, rugWidth, rugHeight, 8);
    rug.fill(0x5a2020);
    rug.stroke({ width: 6, color: COLORS.GOLD, alpha: 0.7 });
    rug.position.set(w / 2, h * 0.78);
    this.container.addChild(rug);

    // Rug pattern
    const rugPattern = new PIXI.Graphics();
    rugPattern.roundRect(-rugWidth / 2 + 25, 25, rugWidth - 50, rugHeight - 50, 4);
    rugPattern.stroke({ width: 2, color: COLORS.GOLD, alpha: 0.4 });
    rugPattern.position.set(w / 2, h * 0.78);
    this.container.addChild(rugPattern);

    // Center medallion
    const medallion = new PIXI.Graphics();
    medallion.circle(0, rugHeight / 2, 30);
    medallion.fill({ color: COLORS.GOLD, alpha: 0.2 });
    medallion.stroke({ width: 2, color: COLORS.GOLD, alpha: 0.5 });
    medallion.position.set(w / 2, h * 0.78);
    this.container.addChild(medallion);
  }

  createChandelier(x, y) {
    const chandelier = new PIXI.Container();

    // Chain
    const chain = new PIXI.Graphics();
    chain.rect(-3, -y + 30, 6, y - 30);
    chain.fill(COLORS.GOLD);
    chandelier.addChild(chain);

    // Central body
    const body = new PIXI.Graphics();
    body.circle(0, 0, 25);
    body.fill(COLORS.GOLD);
    chandelier.addChild(body);

    // Arms and candles
    const armCount = 8;
    this.elements.flames = [];

    for (let i = 0; i < armCount; i++) {
      const angle = (i / armCount) * Math.PI * 2;
      const armLength = 50;
      const endX = Math.cos(angle) * armLength;
      const endY = Math.sin(angle) * 25;

      // Arm
      const arm = new PIXI.Graphics();
      arm.moveTo(0, 0);
      arm.lineTo(endX, endY);
      arm.stroke({ width: 4, color: COLORS.GOLD });
      chandelier.addChild(arm);

      // Candle holder
      const holder = new PIXI.Graphics();
      holder.rect(endX - 5, endY - 5, 10, 8);
      holder.fill(COLORS.GOLD);
      chandelier.addChild(holder);

      // Candle
      const candle = new PIXI.Graphics();
      candle.rect(endX - 4, endY - 25, 8, 22);
      candle.fill(0xfffff5);
      chandelier.addChild(candle);

      // Flame
      const flame = new PIXI.Graphics();
      flame.ellipse(endX, endY - 32, 4, 8);
      flame.fill(0xffaa00);
      chandelier.addChild(flame);
      this.elements.flames.push(flame);

      // Animate flame
      gsap.to(flame.scale, {
        x: 0.7 + Math.random() * 0.3,
        y: 0.8 + Math.random() * 0.4,
        duration: 0.15 + Math.random() * 0.1,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    }

    // Light glow circles
    for (let i = 4; i > 0; i--) {
      const glow = new PIXI.Graphics();
      glow.circle(0, 0, 30 + i * 35);
      glow.fill({ color: 0xffcc66, alpha: 0.015 * i });
      chandelier.addChildAt(glow, 0);
    }

    chandelier.position.set(x, y);
    this.container.addChild(chandelier);
  }

  createSconce(x, y) {
    const sconce = new PIXI.Container();

    // Backplate
    const plate = new PIXI.Graphics();
    plate.roundRect(-12, -30, 24, 60, 5);
    plate.fill(COLORS.GOLD);
    sconce.addChild(plate);

    // Arm
    const arm = new PIXI.Graphics();
    arm.roundRect(-15, 15, 30, 8, 3);
    arm.fill(COLORS.GOLD);
    sconce.addChild(arm);

    // Candle
    const candle = new PIXI.Graphics();
    candle.rect(-5, -5, 10, 25);
    candle.fill(0xfffff5);
    candle.position.set(0, 15);
    sconce.addChild(candle);

    // Flame
    const flame = new PIXI.Graphics();
    flame.ellipse(0, -15, 5, 12);
    flame.fill(0xffaa00);
    flame.position.set(0, 15);
    sconce.addChild(flame);

    gsap.to(flame.scale, {
      x: 0.7 + Math.random() * 0.3,
      y: 0.8 + Math.random() * 0.4,
      duration: 0.2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    // Glow
    const glow = new PIXI.Graphics();
    glow.circle(0, 0, 40);
    glow.fill({ color: 0xffcc66, alpha: 0.1 });
    sconce.addChildAt(glow, 0);

    sconce.position.set(x, y);
    this.container.addChild(sconce);
  }

  createTitle() {
    // Main title at top
    this.elements.title = new PIXI.Text({
      text: 'Choose Your Destination',
      style: {
        fontFamily: 'Playfair Display, serif',
        fontSize: 32,
        fill: COLORS.GOLD,
        fontWeight: '600',
        letterSpacing: 2,
      }
    });

    this.elements.title.anchor.set(0.5);
    this.elements.title.position.set(window.innerWidth / 2, 70);
    this.elements.title.alpha = 0;
    this.container.addChild(this.elements.title);

    // Decorative line
    const line = new PIXI.Graphics();
    line.moveTo(-100, 0);
    line.lineTo(100, 0);
    line.stroke({ width: 1, color: COLORS.GOLD, alpha: 0.5 });
    line.position.set(window.innerWidth / 2, 100);
    this.container.addChild(line);
  }

  enter() {
    soundManager.register('doorOpen', '/assets/sounds/door.mp3');

    // Animate title
    gsap.to(this.elements.title, {
      alpha: 1,
      duration: 0.8,
      delay: 0.3,
      ease: 'power2.out'
    });

    // Animate doors appearing with stagger
    this.doors.forEach((door, index) => {
      const targetY = door.container.y - 60;
      gsap.to(door.container, {
        y: targetY,
        alpha: 1,
        duration: 0.7,
        delay: 0.4 + index * 0.08,
        ease: 'back.out(1.2)'
      });
    });

    // Enable interaction after animations
    setTimeout(() => {
      this.isInteractive = true;
    }, 1200);
  }

  update(delta) {
    // Ambient effects could go here
  }

  exit() {
    this.isInteractive = false;
  }

  resize() {
    // Handle resize
  }

  destroy() {
    this.doors.forEach(door => {
      gsap.killTweensOf(door.container);
      gsap.killTweensOf(door.container.scale);
    });

    if (this.elements.flames) {
      this.elements.flames.forEach(flame => gsap.killTweensOf(flame.scale));
    }

    gsap.killTweensOf(this.elements.title);
    this.container.destroy({ children: true });
  }
}
