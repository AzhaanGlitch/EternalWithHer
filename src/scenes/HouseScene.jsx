// src/scenes/HouseScene.jsx
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { SCENES, COLORS } from '../core/constants.jsx';
import soundManager from '../core/SoundManager.jsx';
import houseImageUrl from '../assets/images/house.png';

export default class HouseScene {
  constructor(manager) {
    this.manager = manager;
    this.container = new PIXI.Container();
    this.elements = {};
    this.isInteractive = false;
    this.tweens = [];
    this.grassBlades = [];
    this.birds = [];
    this.windTime = 0;
    this.houseLoaded = false;
  }

  async init() {
    this.createSunsetSky();
    this.createSun();
    this.createClouds();
    this.createMountains();
    this.createGreenland();
    this.createAnimatedGrass();

    // Load house image as sprite
    await this.createHouse();

    this.createFlyingBirds();
    this.createAmbientEffects();
    this.createInstructions();
  }

  // ── SUNSET SKY ──
  createSunsetSky() {
    const w = window.innerWidth, h = window.innerHeight;
    const sky = new PIXI.Container();
    const colors = [
      [20, 5, 30], [35, 8, 45], [60, 12, 50], [90, 18, 55],
      [130, 30, 55], [170, 50, 50], [200, 75, 45],
      [230, 110, 45], [248, 150, 55], [255, 185, 75],
      [255, 205, 105], [255, 215, 140], [255, 210, 160],
      [255, 195, 165], [250, 170, 155], [240, 145, 150]
    ];
    const strips = 80;
    for (let i = 0; i < strips; i++) {
      const s = new PIXI.Graphics();
      const r = i / strips, ci = r * (colors.length - 1);
      const f = ci - Math.floor(ci);
      const c1 = colors[Math.min(Math.floor(ci), colors.length - 1)];
      const c2 = colors[Math.min(Math.floor(ci) + 1, colors.length - 1)];
      const cr = Math.round(c1[0] + (c2[0] - c1[0]) * f);
      const cg = Math.round(c1[1] + (c2[1] - c1[1]) * f);
      const cb = Math.round(c1[2] + (c2[2] - c1[2]) * f);
      const sh = h / strips + 1;
      s.rect(0, i * sh, w, sh + 1);
      s.fill((cr << 16) | (cg << 8) | cb);
      sky.addChild(s);
    }
    this.container.addChild(sky);
  }

  // ── SUN ──
  createSun() {
    const w = window.innerWidth, h = window.innerHeight;
    const sun = new PIXI.Container();
    const sr = Math.min(w, h) * 0.08;

    // Outer atmospheric glow rings
    for (let i = 10; i > 0; i--) {
      const g = new PIXI.Graphics();
      g.circle(0, 0, sr + i * sr * 0.6);
      g.fill({ color: (255 << 16) | ((190 + i * 4) << 8) | (60 + i * 12), alpha: 0.012 * (11 - i) });
      sun.addChild(g);
    }
    // Inner glow
    for (let i = 6; i > 0; i--) {
      const g = new PIXI.Graphics();
      g.circle(0, 0, sr + i * 20);
      g.fill({ color: 0xffcc44, alpha: 0.035 * (7 - i) });
      sun.addChild(g);
    }
    const body = new PIXI.Graphics();
    body.circle(0, 0, sr);
    body.fill(0xffe880);
    sun.addChild(body);
    const core = new PIXI.Graphics();
    core.circle(0, 0, sr * 0.55);
    core.fill({ color: 0xfff8e0, alpha: 0.85 });
    sun.addChild(core);
    sun.position.set(w * 0.18, h * 0.36);
    this.container.addChild(sun);
    this._tw(sun.scale, { x: 1.04, y: 1.04, duration: 3.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  // ── CLOUDS ──
  createClouds() {
    const w = window.innerWidth, h = window.innerHeight;
    const cc = new PIXI.Container();
    // Cloud configs: [x, y, scale, puffs array]
    const cloudConfigs = [
      { x: w * 0.08, y: h * 0.08, sc: 0.7, drift: 35 },
      { x: w * 0.30, y: h * 0.05, sc: 1.0, drift: 50 },
      { x: w * 0.55, y: h * 0.11, sc: 0.8, drift: 40 },
      { x: w * 0.80, y: h * 0.06, sc: 0.6, drift: 30 },
      { x: w * 0.15, y: h * 0.20, sc: 0.5, drift: 25 },
      { x: w * 0.92, y: h * 0.16, sc: 0.55, drift: 28 },
    ];
    cloudConfigs.forEach(({ x, y, sc, drift }) => {
      const cloud = new PIXI.Container();
      // Build a fluffy cloud from overlapping soft ellipses
      const puffData = [
        [-35, 4, 30, 16], [-10, -2, 40, 22], [20, 0, 35, 20],
        [5, 8, 38, 14], [-22, -6, 28, 16], [35, -4, 25, 14],
        [-5, -10, 32, 15], [15, 6, 30, 13],
      ];
      // Outer soft glow layer (subtle)
      puffData.forEach(([px, py, rx, ry]) => {
        const glow = new PIXI.Graphics();
        glow.ellipse(px, py, rx + 6, ry + 4);
        glow.fill({ color: 0xffd5c0, alpha: 0.04 });
        cloud.addChild(glow);
      });
      // Main cloud body
      puffData.forEach(([px, py, rx, ry]) => {
        const puff = new PIXI.Graphics();
        puff.ellipse(px, py, rx, ry);
        puff.fill({ color: 0xffe8d8, alpha: 0.15 });
        cloud.addChild(puff);
      });
      // Bright highlights on top puffs
      [[-10, -6, 25, 12], [18, -4, 22, 11], [-25, -2, 18, 10]].forEach(([px, py, rx, ry]) => {
        const hl = new PIXI.Graphics();
        hl.ellipse(px, py, rx, ry);
        hl.fill({ color: 0xfff5ee, alpha: 0.12 });
        cloud.addChild(hl);
      });
      cloud.position.set(x, y);
      cloud.scale.set(sc);
      cc.addChild(cloud);
      this._tw(cloud, {
        x: x + drift + Math.random() * 25,
        duration: 25 + Math.random() * 20,
        yoyo: true, repeat: -1, ease: 'sine.inOut'
      });
    });
    this.container.addChild(cc);
  }

  // ── MOUNTAINS ──
  createMountains() {
    const w = window.innerWidth, h = window.innerHeight;
    const ranges = [
      {
        baseY: h * 0.52, color: 0x2d1835, alpha: 0.7,
        peaks: [[0, -h * 0.2, w * 0.25], [w * 0.15, -h * 0.25, w * 0.3], [w * 0.35, -h * 0.17, w * 0.25], [w * 0.5, -h * 0.22, w * 0.3], [w * 0.7, -h * 0.19, w * 0.25], [w * 0.85, -h * 0.15, w * 0.3]]
      },
      {
        baseY: h * 0.58, color: 0x3a1d40, alpha: 0.8,
        peaks: [[-w * 0.05, -h * 0.16, w * 0.3], [w * 0.2, -h * 0.2, w * 0.35], [w * 0.45, -h * 0.13, w * 0.28], [w * 0.6, -h * 0.18, w * 0.35], [w * 0.85, -h * 0.12, w * 0.3]]
      },
      {
        baseY: h * 0.63, color: 0x1e3018, alpha: 0.9,
        peaks: [[-w * 0.05, -h * 0.12, w * 0.35], [w * 0.25, -h * 0.14, w * 0.3], [w * 0.5, -h * 0.09, w * 0.3], [w * 0.7, -h * 0.13, w * 0.35]]
      }
    ];
    ranges.forEach(({ baseY, color, alpha, peaks }) => {
      const m = new PIXI.Graphics();
      m.moveTo(0, baseY);
      peaks.forEach(([px, py, pw]) => {
        const mx = px + pw * 0.5;
        m.bezierCurveTo(px + pw * 0.2, baseY - 10, mx - pw * 0.15, baseY + py + 10, mx, baseY + py);
        m.bezierCurveTo(mx + pw * 0.15, baseY + py + 10, px + pw - pw * 0.2, baseY - 10, px + pw, baseY);
      });
      m.lineTo(w + 10, baseY);
      m.lineTo(w + 10, h);
      m.lineTo(0, h);
      m.closePath();
      m.fill({ color, alpha });
      this.container.addChild(m);
    });
  }

  // ── GREENLAND ──
  createGreenland() {
    const w = window.innerWidth, h = window.innerHeight;
    [
      [h * 0.66, 0x1e4c16, 28], [h * 0.70, 0x245c1e, 22],
      [h * 0.74, 0x2c6c26, 16]
    ].forEach(([baseY, color, amp]) => {
      const hill = new PIXI.Graphics();
      hill.moveTo(0, baseY);
      for (let x = 0; x <= w; x += 4)
        hill.lineTo(x, baseY + Math.sin(x * 0.003) * amp + Math.sin(x * 0.007 + 1) * amp * 0.5);
      hill.lineTo(w + 10, h + 10);
      hill.lineTo(-10, h + 10);
      hill.closePath();
      hill.fill(color);
      this.container.addChild(hill);
    });
    // Main ground
    const gnd = new PIXI.Graphics();
    gnd.rect(0, h * 0.78, w, h * 0.22);
    gnd.fill(0x2d7a25);
    this.container.addChild(gnd);

    // Wildflowers
    for (let i = 0; i < 30; i++) {
      const f = new PIXI.Graphics();
      const fc = [0xffdd44, 0xff8866, 0xffaacc, 0xffffff, 0xffcc99, 0xddaaff][Math.floor(Math.random() * 6)];
      const fx = Math.random() * w;
      const fy = h * 0.76 + Math.random() * h * 0.2;
      // Stem
      const stem = new PIXI.Graphics();
      stem.moveTo(fx, fy);
      stem.lineTo(fx, fy + 5 + Math.random() * 5);
      stem.stroke({ width: 1, color: 0x2a6a20, alpha: 0.5 });
      this.container.addChild(stem);
      // Petal
      f.circle(fx, fy, 2 + Math.random() * 2.5);
      f.fill({ color: fc, alpha: 0.6 + Math.random() * 0.3 });
      this.container.addChild(f);
    }

    // Distant trees (left side only to not overlap house)
    for (let i = 0; i < 8; i++) {
      const t = new PIXI.Container();
      const trunk = new PIXI.Graphics();
      trunk.rect(-3, -5, 6, 28);
      trunk.fill(0x1a3015);
      t.addChild(trunk);
      const canopy = new PIXI.Graphics();
      canopy.ellipse(0, -22, 14 + Math.random() * 10, 20 + Math.random() * 12);
      canopy.fill({ color: 0x1a4214, alpha: 0.85 });
      t.addChild(canopy);
      // Canopy highlight
      const highlight = new PIXI.Graphics();
      highlight.ellipse(-3, -26, 8 + Math.random() * 5, 12 + Math.random() * 6);
      highlight.fill({ color: 0x2a5a20, alpha: 0.5 });
      t.addChild(highlight);
      t.position.set(Math.random() * w * 0.4, h * 0.63 + Math.random() * 35);
      t.scale.set(0.4 + Math.random() * 0.35);
      this.container.addChild(t);
    }
  }

  // ── ANIMATED GRASS (wind physics) ──
  createAnimatedGrass() {
    const w = window.innerWidth, h = window.innerHeight;
    this.elements.grassContainer = new PIXI.Container();

    const addBlade = (x, y, bladeH, shade) => {
      const blade = new PIXI.Graphics();
      blade.moveTo(0, 0);
      blade.lineTo(-2, -bladeH * 0.6);
      blade.lineTo(0, -bladeH);
      blade.lineTo(2, -bladeH * 0.6);
      blade.closePath();
      blade.fill({ color: shade, alpha: 0.55 + Math.random() * 0.4 });
      blade.position.set(x, y);
      blade.pivot.set(0, 0);
      this.elements.grassContainer.addChild(blade);
      this.grassBlades.push({
        graphic: blade, baseX: x, height: bladeH,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.8
      });
    };

    // Layer 1: scattered grass across the greenland area
    for (let i = 0; i < 250; i++) {
      const x = Math.random() * w;
      const y = h * 0.74 + Math.random() * (h * 0.26);
      const bladeH = 10 + Math.random() * 22;
      const shade = this._lerpColor(0x4aaa40, 0x1e6a18, Math.random());
      addBlade(x, y, bladeH, shade);
    }

    // Layer 2: dense short grass at the very bottom of the screen
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * w;
      const y = h * 0.88 + Math.random() * (h * 0.12);
      const bladeH = 8 + Math.random() * 16;
      const shade = this._lerpColor(0x3a9a35, 0x1a5a12, Math.random());
      addBlade(x, y, bladeH, shade);
    }

    // Layer 3: extra-tall prominent grass blades at the bottom edge
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * w;
      const y = h * 0.92 + Math.random() * (h * 0.08);
      const bladeH = 18 + Math.random() * 32;
      const shade = this._lerpColor(0x55bb4a, 0x2a7a1a, Math.random());
      addBlade(x, y, bladeH, shade);
    }

    this.container.addChild(this.elements.grassContainer);
  }

  // ── REALISTIC HOUSE (Sprite-based) ──
  async createHouse() {
    const w = window.innerWidth, h = window.innerHeight;
    this.elements.house = new PIXI.Container();

    try {
      // Load the house image
      const houseTexture = await PIXI.Assets.load(houseImageUrl);
      const houseSprite = new PIXI.Sprite(houseTexture);

      // Calculate sizing — house should take up ~60% of the screen width for a prominent look
      const targetWidth = w * 0.60;
      const aspectRatio = houseSprite.texture.width / houseSprite.texture.height;
      const targetHeight = targetWidth / aspectRatio;

      houseSprite.width = targetWidth;
      houseSprite.height = targetHeight;
      houseSprite.anchor.set(0.5, 1); // Anchor at bottom-center

      this.elements.houseSprite = houseSprite;

      // (No ground shadow or ground glow — clean look on grass)

      // ── Add the house sprite ──
      this.elements.house.addChild(houseSprite);

      // ── WARM WINDOW GLOW overlay (behind/around the sprite) ──
      const windowGlow = new PIXI.Container();

      // Upper floor window glow (large glass area)
      const upperGlow = new PIXI.Graphics();
      upperGlow.rect(-targetWidth * 0.18, -targetHeight * 0.7, targetWidth * 0.4, targetHeight * 0.28);
      upperGlow.fill({ color: 0xff8822, alpha: 0 });
      windowGlow.addChild(upperGlow);
      this.elements.upperGlow = upperGlow;

      // Lower floor window glow
      const lowerGlow = new PIXI.Graphics();
      lowerGlow.rect(-targetWidth * 0.12, -targetHeight * 0.38, targetWidth * 0.35, targetHeight * 0.22);
      lowerGlow.fill({ color: 0xffaa44, alpha: 0 });
      windowGlow.addChild(lowerGlow);
      this.elements.lowerGlow = lowerGlow;

      // Atmospheric glow haze around house
      for (let i = 3; i > 0; i--) {
        const haze = new PIXI.Graphics();
        haze.rect(
          -targetWidth * 0.55 - i * 15,
          -targetHeight - i * 10,
          targetWidth * 1.1 + i * 30,
          targetHeight + i * 20
        );
        haze.fill({ color: 0xffaa33, alpha: 0.008 * (4 - i) });
        windowGlow.addChild(haze);
      }

      this.elements.house.addChild(windowGlow);

      // ── ANIMATED WARM LIGHT PULSE on windows ──
      this._tw(upperGlow, { alpha: 0.12, duration: 2.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      this._tw(lowerGlow, { alpha: 0.1, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.8 });

      // ── INTERACTIVE DOOR ZONE ──
      // The door is on the right side of the ground floor — the dark brown panel
      // visible between the glass windows. Position relative to sprite anchor (0.5, 1).
      this.elements.door = new PIXI.Container();
      const doorW = targetWidth * 0.055;
      const doorH = targetHeight * 0.30;
      // Door is the dark brown panel on the right side of the ground floor front face
      // ~22% right of center, ~25% up from bottom of the house image
      const doorOffsetX = targetWidth * 0.22;
      const doorOffsetY = -targetHeight * 0.25;

      // Visible door highlight — subtle golden glow outline (only on hover)
      const doorHighlight = new PIXI.Graphics();
      doorHighlight.roundRect(-doorW / 2, -doorH / 2, doorW, doorH, 4);
      doorHighlight.stroke({ width: 2.5, color: COLORS.GOLD, alpha: 0 });
      doorHighlight.name = 'highlight';
      this.elements.door.addChild(doorHighlight);
      this.elements.doorHighlight = doorHighlight;

      // Door glow effect — warm light emanating from door
      const doorGlow = new PIXI.Graphics();
      doorGlow.roundRect(-doorW * 0.9, -doorH * 0.6, doorW * 1.8, doorH * 1.2, 10);
      doorGlow.fill({ color: COLORS.GOLD, alpha: 0 });
      doorGlow.name = 'glow';
      this.elements.door.addChild(doorGlow);
      this.elements.doorGlow = doorGlow;

      // Invisible hit area for click detection (slightly larger than door)
      const doorHitArea = new PIXI.Graphics();
      doorHitArea.rect(-doorW * 0.9, -doorH * 0.6, doorW * 1.8, doorH * 1.2);
      doorHitArea.fill({ color: 0xffffff, alpha: 0.001 });
      this.elements.door.addChild(doorHitArea);

      this.elements.door.position.set(doorOffsetX, doorOffsetY);
      this.elements.house.addChild(this.elements.door);

      // Door interactivity — ONLY the door reacts, NOT the whole house
      this.elements.door.eventMode = 'static';
      this.elements.door.cursor = 'pointer';
      this.elements.door.on('pointerover', () => {
        if (!this.isInteractive) return;
        gsap.to(this.elements.doorHighlight, { alpha: 0.9, duration: 0.35 });
        gsap.to(this.elements.doorGlow, { alpha: 0.35, duration: 0.35 });
      });
      this.elements.door.on('pointerout', () => {
        gsap.to(this.elements.doorHighlight, { alpha: 0, duration: 0.25 });
        gsap.to(this.elements.doorGlow, { alpha: 0, duration: 0.25 });
      });
      this.elements.door.on('pointertap', () => {
        if (!this.isInteractive) return;
        soundManager.play('doorOpen');
        this.openDoor();
      });

      // ── POSITION THE HOUSE: right-bottom corner of the screen ──
      this.elements.house.position.set(w * 0.78, h * 1.18);
      this.container.addChild(this.elements.house);

      // ── All decorations below are added to the MAIN container ──
      // House is at (w*0.78, h*1.18) with anchor (0.5,1), so:
      //   visible left edge ≈ w*0.48,  right edge off-screen at w*1.08
      //   visible bottom of house image ≈ y = h (screen bottom)
      const houseScreenX = w * 0.78;
      const halfW = targetWidth * 0.5;
      const houseLeftEdge = houseScreenX - halfW; // ≈ w*0.48

      // (shadow removed — was causing a black shape at bottom-middle)

      // ── DENSE BUSHES along the visible bottom of the house ──
      const bushContainer = new PIXI.Container();
      // Shorter bush line — only around the house's visible base
      const bushLength = targetWidth * 0.45; // reduced length
      const bushBaseY = h - 90;
      // Draw bushes centered at origin (0,0) then position + rotate the container
      for (let bx = -bushLength / 2; bx <= bushLength / 2; bx += 8 + Math.random() * 8) {
        const clusterSize = 2 + Math.floor(Math.random() * 3);
        for (let j = 0; j < clusterSize; j++) {
          const b = new PIXI.Graphics();
          const rx = 10 + Math.random() * 14;
          const ry = 8 + Math.random() * 11;
          const ox = (Math.random() - 0.5) * 14;
          const oy = (Math.random() - 0.5) * 8;
          b.ellipse(bx + ox, oy, rx, ry);
          b.fill(this._lerpColor(0x1a5212, 0x0e3a0a, Math.random()));
          bushContainer.addChild(b);
        }
        // Lighter green highlight on top
        const hl = new PIXI.Graphics();
        hl.ellipse(bx + (Math.random() - 0.5) * 8, -8 - Math.random() * 4, 7 + Math.random() * 7, 5 + Math.random() * 4);
        hl.fill({ color: this._lerpColor(0x2a7a20, 0x3a9a30, Math.random()), alpha: 0.7 });
        bushContainer.addChild(hl);
      }
      // Position bushes at the house’s visible bottom-left corner (moved up-left)
      bushContainer.position.set(houseLeftEdge + bushLength * 0.75, bushBaseY - 45);
      bushContainer.rotation = (7 * Math.PI) / 180;
      this.container.addChild(bushContainer);

      // ── GRASS BLADES at the house base (visible area) ──
      const houseGrassContainer = new PIXI.Container();
      const grassCenterX = houseLeftEdge + bushLength * 0.55;
      const grassSpread = bushLength * 0.8;
      for (let i = 0; i < 100; i++) {
        const gx = grassCenterX - grassSpread / 2 + Math.random() * grassSpread;
        const gy = bushBaseY + 5 + (Math.random() - 0.5) * 15;
        const gH = 12 + Math.random() * 28;
        const gBlade = new PIXI.Graphics();
        const gShade = this._lerpColor(0x4aaa40, 0x1a6a14, Math.random());
        gBlade.moveTo(0, 0);
        gBlade.lineTo(-1.5, -gH * 0.6);
        gBlade.lineTo(0, -gH);
        gBlade.lineTo(1.5, -gH * 0.6);
        gBlade.closePath();
        gBlade.fill({ color: gShade, alpha: 0.5 + Math.random() * 0.4 });
        gBlade.position.set(gx, gy);
        houseGrassContainer.addChild(gBlade);
        this.grassBlades.push({
          graphic: gBlade, baseX: gx, height: gH,
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 1.5
        });
      }
      this.container.addChild(houseGrassContainer);

      // ── LIGHT SPILL ON GROUND ──
      const lightSpill = new PIXI.Container();
      const spill1 = new PIXI.Graphics();
      spill1.moveTo(houseScreenX - halfW * 0.4, h - 10);
      spill1.lineTo(houseScreenX - halfW * 0.7, h);
      spill1.lineTo(houseScreenX + halfW * 0.3, h);
      spill1.lineTo(houseScreenX - halfW * 0.1, h - 10);
      spill1.closePath();
      spill1.fill({ color: 0xffaa33, alpha: 0.03 });
      lightSpill.addChild(spill1);
      this.container.addChild(lightSpill);
      this._tw(lightSpill, { alpha: 0.6, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });

      this.houseLoaded = true;
    } catch (err) {
      console.warn('Failed to load house image, falling back to simple placeholder:', err);
      this._createFallbackHouse(w, h);
    }
  }

  // Simple fallback if image fails to load
  _createFallbackHouse(w, h) {
    const placeholder = new PIXI.Graphics();
    placeholder.rect(-150, -200, 300, 200);
    placeholder.fill(0xd4c5a9);
    placeholder.rect(-25, -80, 50, 80);
    placeholder.fill(0x3a2518);
    this.elements.house.addChild(placeholder);
    this.elements.house.position.set(w * 0.68, h * 1.0);

    this.elements.door = new PIXI.Container();
    this.elements.doorHighlight = { alpha: 0 };
    this.elements.doorGlow = { alpha: 0 };
    this.elements.door.position.set(0, -40);
    const hitArea = new PIXI.Graphics();
    hitArea.rect(-25, -40, 50, 80);
    hitArea.fill({ color: 0xffffff, alpha: 0.001 });
    this.elements.door.addChild(hitArea);
    this.elements.door.eventMode = 'static';
    this.elements.door.cursor = 'pointer';
    this.elements.door.on('pointertap', () => {
      if (!this.isInteractive) return;
      soundManager.play('doorOpen');
      this.openDoor();
    });
    this.elements.house.addChild(this.elements.door);
    this.container.addChild(this.elements.house);
    this.houseLoaded = true;
  }

  // ── FLYING BIRDS ──
  createFlyingBirds() {
    const w = window.innerWidth, h = window.innerHeight;
    this.elements.birdsContainer = new PIXI.Container();
    for (let i = 0; i < 9; i++) {
      const bird = new PIXI.Container();
      const bx = Math.random() * w * 0.65 + w * 0.05;
      const by = h * 0.06 + Math.random() * h * 0.22;
      const size = 5 + Math.random() * 9;
      const lWing = new PIXI.Graphics();
      const rWing = new PIXI.Graphics();
      const drawWing = (g, dir) => {
        g.moveTo(0, 0);
        g.quadraticCurveTo(dir * size * 0.5, -size * 0.65, dir * size, -size * 0.3);
        g.stroke({ width: 1.5, color: 0x1a0a10, alpha: 0.45 });
      };
      drawWing(lWing, -1);
      drawWing(rWing, 1);
      bird.addChild(lWing, rWing);
      bird.position.set(bx, by);
      this.elements.birdsContainer.addChild(bird);
      const speed = 18 + Math.random() * 28;
      this._tw(bird, { x: bx + w * 0.3, y: by - 25 + Math.random() * 50, duration: speed, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      this._tw(lWing, { rotation: 0.55, duration: 0.25 + Math.random() * 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      this._tw(rWing, { rotation: -0.55, duration: 0.25 + Math.random() * 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      this.birds.push(bird);
    }
    this.container.addChild(this.elements.birdsContainer);
  }

  // ── AMBIENT EFFECTS ──
  createAmbientEffects() {
    const w = window.innerWidth, h = window.innerHeight;

    // Fireflies
    for (let i = 0; i < 20; i++) {
      const ff = new PIXI.Graphics();
      const ffSize = 1.5 + Math.random() * 2.5;
      ff.circle(0, 0, ffSize);
      ff.fill({ color: 0xffee88, alpha: 0.2 + Math.random() * 0.4 });
      ff.position.set(Math.random() * w * 0.55, h * 0.6 + Math.random() * h * 0.35);
      this.container.addChild(ff);
      // Outer glow
      const ffGlow = new PIXI.Graphics();
      ffGlow.circle(0, 0, ffSize * 3);
      ffGlow.fill({ color: 0xffee66, alpha: 0.06 });
      ffGlow.position.copyFrom(ff.position);
      this.container.addChild(ffGlow);
      this._tw(ff, {
        x: ff.x + (Math.random() - 0.5) * 70,
        y: ff.y - 25 - Math.random() * 45,
        alpha: 0, duration: 3.5 + Math.random() * 4.5,
        yoyo: true, repeat: -1, ease: 'sine.inOut',
        delay: Math.random() * 3
      });
      this._tw(ffGlow, {
        x: ff.x + (Math.random() - 0.5) * 70,
        y: ff.y - 25 - Math.random() * 45,
        alpha: 0, duration: 3.5 + Math.random() * 4.5,
        yoyo: true, repeat: -1, ease: 'sine.inOut',
        delay: Math.random() * 3
      });
    }

    // Floating dust particles (warm atmosphere)
    for (let i = 0; i < 12; i++) {
      const dust = new PIXI.Graphics();
      dust.circle(0, 0, 1 + Math.random());
      dust.fill({ color: 0xffddaa, alpha: 0.15 + Math.random() * 0.15 });
      dust.position.set(w * 0.4 + Math.random() * w * 0.4, h * 0.5 + Math.random() * h * 0.3);
      this.container.addChild(dust);
      this._tw(dust, {
        x: dust.x + (Math.random() - 0.5) * 100,
        y: dust.y - 40 - Math.random() * 60,
        alpha: 0, duration: 6 + Math.random() * 6,
        yoyo: true, repeat: -1, ease: 'sine.inOut',
        delay: Math.random() * 5
      });
    }
  }

  // ── INSTRUCTIONS ──
  createInstructions() {
    this.elements.instruction = new PIXI.Text({
      style: {
        fontFamily: 'Playfair Display, serif',
        fontSize: 24,
        fill: 0xffeedd,
        dropShadow: true,
        dropShadowColor: 0x000000,
        dropShadowBlur: 8,
        dropShadowDistance: 2
      }
    });
    this.elements.instruction.anchor.set(0.5);
    this.elements.instruction.position.set(window.innerWidth * 0.35, window.innerHeight - 50);
    this.elements.instruction.alpha = 0;
    this.container.addChild(this.elements.instruction);
    this._tw(this.elements.instruction, { alpha: 0.7, duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  openDoor() {
    this.isInteractive = false;
    // Fade the door highlight and glow
    gsap.to(this.elements.doorHighlight, { alpha: 0, duration: 0.3 });
    gsap.to(this.elements.doorGlow, { alpha: 0.8, duration: 0.4 });
    // Scale down house slightly as we "enter"
    gsap.to(this.elements.house.scale, { x: 1.15, y: 1.15, duration: 0.6, ease: 'power2.in' });
    gsap.to(this.elements.house, { alpha: 0, duration: 0.5, delay: 0.2, ease: 'power2.in' });
    setTimeout(() => {
      this.manager.change(SCENES.INTERIOR, { transition: 'fade', duration: 0.8 });
    }, 500);
  }

  enter() {
    soundManager.register('doorOpen', '/assets/sounds/door.mp3');
    if (this.elements.house) {
      this.elements.house.scale.set(0.82);
      this.elements.house.alpha = 0;
      gsap.to(this.elements.house, { alpha: 1, duration: 1.4, ease: 'power2.out' });
      gsap.to(this.elements.house.scale, { x: 1, y: 1, duration: 1.8, ease: 'back.out(1.1)' });
    }
    if (this.elements.instruction) {
      gsap.to(this.elements.instruction, { alpha: 1, duration: 0.8, delay: 1.8 });
    }
    setTimeout(() => { this.isInteractive = true; }, 1800);
  }

  update(delta) {
    // Wind-animated grass physics
    this.windTime += delta * 0.02;
    const windStrength = Math.sin(this.windTime * 0.5) * 0.15 + 0.1;
    this.grassBlades.forEach(blade => {
      const sway = Math.sin(this.windTime * blade.speed + blade.phase) * windStrength;
      blade.graphic.skew.x = sway;
    });
  }

  exit() { }
  resize() { }

  destroy() {
    this.tweens.forEach(t => t && t.kill && t.kill());
    if (this.elements.instruction) gsap.killTweensOf(this.elements.instruction);
    if (this.elements.house) {
      gsap.killTweensOf(this.elements.house);
      gsap.killTweensOf(this.elements.house.scale);
    }
    if (this.elements.door) gsap.killTweensOf(this.elements.door.scale);
    if (this.elements.doorHighlight) gsap.killTweensOf(this.elements.doorHighlight);
    if (this.elements.doorGlow) gsap.killTweensOf(this.elements.doorGlow);
    if (this.elements.upperGlow) gsap.killTweensOf(this.elements.upperGlow);
    if (this.elements.lowerGlow) gsap.killTweensOf(this.elements.lowerGlow);
    this.container.destroy({ children: true });
  }

  // ── UTILS ──
  _tw(target, props) { const t = gsap.to(target, props); this.tweens.push(t); return t; }
  _lerp(a, b, t) { return a + (b - a) * t; }
  _lerpColor(c1, c2, t) {
    const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
    const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff;
    return (Math.round(r1 + (r2 - r1) * t) << 16) | (Math.round(g1 + (g2 - g1) * t) << 8) | Math.round(b1 + (b2 - b1) * t);
  }
}
