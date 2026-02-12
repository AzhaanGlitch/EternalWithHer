// src/scenes/InteriorScene.jsx
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { SCENES, COLORS, ROOM_CONFIGS } from '../core/constants.jsx';
import soundManager from '../core/SoundManager.jsx';
import interiorBgUrl from '../assets/images/interior_bg.png';

export default class InteriorScene {
  constructor(manager) {
    this.manager = manager;
    this.container = new PIXI.Container();
    this.elements = {};
    this.doors = [];
    this.isInteractive = false;
    this.tweens = [];
  }

  async init() {
    await this.createBackground();
    this.createDoors();
  }

  // ── FULL-SCREEN BACKGROUND ──
  async createBackground() {
    const w = window.innerWidth, h = window.innerHeight;
    try {
      const bgTexture = await PIXI.Assets.load(interiorBgUrl);
      const bg = new PIXI.Sprite(bgTexture);

      // Cover-style scaling
      const imgAspect = bgTexture.width / bgTexture.height;
      const screenAspect = w / h;

      if (screenAspect > imgAspect) {
        bg.width = w;
        bg.height = w / imgAspect;
      } else {
        bg.height = h;
        bg.width = h * imgAspect;
      }

      bg.x = (w - bg.width) / 2;
      bg.y = (h - bg.height) / 2;

      this.elements.bg = bg;
      this.container.addChild(bg);
    } catch (err) {
      console.warn('Failed to load interior background:', err);
      const fallback = new PIXI.Graphics();
      fallback.rect(0, 0, w, h);
      fallback.fill(0x0a0a14);
      this.container.addChild(fallback);
    }
  }

  // ── 7 DOOR CLICK AREAS ──
  createDoors() {
    const w = window.innerWidth, h = window.innerHeight;

    const doorConfigs = [
      {
        scene: SCENES.LIVING, config: ROOM_CONFIGS.LIVING,
        x: w * 0.50, y: h * 0.95,
        tl: { x: -150, y: -200 }, tr: { x: 180, y: -200 },
        br: { x: 430, y: 55 }, bl: { x: -390, y: 55 },
      },
      {
        scene: SCENES.BEDROOM, config: ROOM_CONFIGS.BEDROOM,
        x: w * 0.01, y: h * 0.50,
        tl: { x: -25, y: -190 }, tr: { x: 200, y: -128 },
        br: { x: 200, y: 208 }, bl: { x: -28, y: 280 },
      },
      {
        scene: SCENES.KITCHEN, config: ROOM_CONFIGS.KITCHEN,
        x: w * 0.50, y: h * 0.50,
        tl: { x: -128, y: -55 }, tr: { x: 214, y: -55 },
        br: { x: 214, y: 138 }, bl: { x: -128, y: 138 },
      },
      {
        scene: SCENES.GAMING, config: ROOM_CONFIGS.GAMING,
        x: w * 0.50, y: h * 0.30,
        tl: { x: -130, y: -80 }, tr: { x: 138, y: -80 },
        br: { x: 138, y: 84 }, bl: { x: -130, y: 84 },
      },
      {
        scene: SCENES.DANCE, config: ROOM_CONFIGS.DANCE,
        x: w * 0.39, y: h * 0.50,
        tl: { x: -30, y: 73 }, tr: { x: 30, y: -40 },
        mr: { x: 51, y: -40 },
        br: { x: 51, y: 128 }, bl: { x: -30, y: 140 },
      },
      {
        scene: SCENES.STUDY, config: ROOM_CONFIGS.STUDY,
        x: w * 0.60, y: h * 0.30,
        tl: { x: -32, y: -80 }, tr: { x: 25, y: -80 },
        br: { x: 28, y: 84 }, bl: { x: -28, y: 84 },
      },
      {
        scene: SCENES.GARDEN, config: ROOM_CONFIGS.GARDEN,
        x: w * 0.84, y: h * 0.50,
        tl: { x: -25, y: -210 }, tr: { x: 270, y: -350 },
        br: { x: 280, y: 350 }, bl: { x: -28, y: 240 },
      },
    ];

    doorConfigs.forEach((doorData, index) => {
      this.createDoor(doorData, index);
    });
  }

  createDoor(doorData, index) {
    const { scene, config, x, y, tl, tr, mr, br, bl } = doorData;

    const door = new PIXI.Container();

    // Helper: draw quad or pentagon polygon
    const drawQuad = (g, tl, tr, br, bl, mr = null) => {
      g.moveTo(tl.x, tl.y);
      g.lineTo(tr.x, tr.y);
      if (mr) g.lineTo(mr.x, mr.y); // Add middle right point if provided
      g.lineTo(br.x, br.y);
      g.lineTo(bl.x, bl.y);
      g.closePath();
    };

    // Helper: expand quad or pentagon
    const expandQuad = (tl, tr, br, bl, px, mr = null) => {
      const expanded = {
        tl: { x: tl.x - px, y: tl.y - px },
        tr: { x: tr.x + px, y: tr.y - px },
        br: { x: br.x + px, y: br.y + px },
        bl: { x: bl.x - px, y: bl.y + px },
      };
      if (mr) {
        expanded.mr = { x: mr.x + px, y: mr.y };
      }
      return expanded;
    };

    // ── Soft outer glow rings ──
    for (let i = 3; i > 0; i--) {
      const ring = new PIXI.Graphics();
      const exp = expandQuad(tl, tr, br, bl, i * 8, mr);
      drawQuad(ring, exp.tl, exp.tr, exp.br, exp.bl, exp.mr);
      ring.fill({ color: 0xffd080, alpha: 0.015 * (4 - i) });
      door.addChild(ring);
      this._tw(ring, {
        alpha: 0.06 * (4 - i), duration: 1.8 + i * 0.4,
        yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.3
      });
    }

    // ── Glassy panel ──
    const glassPanel = new PIXI.Graphics();
    drawQuad(glassPanel, tl, tr, br, bl, mr);
    glassPanel.fill({ color: 0xffffff, alpha: 0.06 });
    glassPanel.stroke({ width: 1, color: 0xffeedd, alpha: 0.15 });
    door.addChild(glassPanel);

    // ── Light-sweep shimmer ──
    const shimmerContainer = new PIXI.Container();
    const shimmerMask = new PIXI.Graphics();
    drawQuad(shimmerMask, tl, tr, br, bl, mr);
    shimmerMask.fill(0xffffff);
    shimmerContainer.addChild(shimmerMask);

    const doorWidth = Math.max(tr.x - tl.x, br.x - bl.x);
    const doorHeight = Math.max(bl.y - tl.y, br.y - tr.y);
    const shimmer = new PIXI.Graphics();
    const stripeW = doorWidth * 0.35;
    shimmer.moveTo(-stripeW, -doorHeight * 0.7);
    shimmer.lineTo(stripeW * 0.3, -doorHeight * 0.7);
    shimmer.lineTo(-stripeW * 0.3, doorHeight * 0.7);
    shimmer.lineTo(-stripeW, doorHeight * 0.7);
    shimmer.closePath();
    shimmer.fill({ color: 0xffffff, alpha: 0.18 });
    shimmer.mask = shimmerMask;
    shimmerContainer.addChild(shimmer);
    door.addChild(shimmerContainer);

    shimmer.x = -doorWidth;
    this._tw(shimmer, {
      x: doorWidth * 2, duration: 1.6, ease: 'power1.inOut',
      repeat: -1, repeatDelay: 2.5 + index * 0.4
    });

    // ── Edge highlights ──
    const topEdge = new PIXI.Graphics();
    topEdge.moveTo(tl.x + 3, tl.y + 1);
    topEdge.lineTo(tr.x - 3, tr.y + 1);
    topEdge.stroke({ width: 1, color: 0xffffff, alpha: 0.12 });
    door.addChild(topEdge);

    const leftEdge = new PIXI.Graphics();
    leftEdge.moveTo(tl.x + 1, tl.y + 4);
    leftEdge.lineTo(bl.x + 1, bl.y - 4);
    leftEdge.stroke({ width: 0.8, color: 0xffffff, alpha: 0.08 });
    door.addChild(leftEdge);

    // ── Golden highlight on hover ──
    const doorHighlight = new PIXI.Graphics();
    drawQuad(doorHighlight, tl, tr, br, bl, mr);
    doorHighlight.stroke({ width: 2.5, color: COLORS.GOLD, alpha: 0 });
    door.addChild(doorHighlight);

    // ── Warm glow on hover ──
    const doorGlow = new PIXI.Graphics();
    const glowExp = expandQuad(tl, tr, br, bl, 12, mr);
    drawQuad(doorGlow, glowExp.tl, glowExp.tr, glowExp.br, glowExp.bl, glowExp.mr);
    doorGlow.fill({ color: COLORS.GOLD, alpha: 0 });
    door.addChild(doorGlow);

    // ── Room label ──
    const label = new PIXI.Text({
      text: config.title,
      style: {
        fontFamily: 'Playfair Display, serif',
        fontSize: 12,
        fill: COLORS.GOLD,
        fontWeight: '600',
        letterSpacing: 1,
        dropShadow: true,
        dropShadowColor: 0x000000,
        dropShadowBlur: 4,
        dropShadowDistance: 1,
      }
    });
    label.anchor.set(0.5);
    label.position.set(0, bl.y + 18);
    label.alpha = 0;
    door.addChild(label);

    // ── Invisible hit area ──
    const hitArea = new PIXI.Graphics();
    const hitExp = expandQuad(tl, tr, br, bl, 10, mr);
    drawQuad(hitArea, hitExp.tl, hitExp.tr, hitExp.br, hitExp.bl, hitExp.mr);
    hitArea.fill({ color: 0xffffff, alpha: 0.001 });
    door.addChild(hitArea);

    door.position.set(x, y);
    this.container.addChild(door);

    // ── Interactivity ──
    door.eventMode = 'static';
    door.cursor = 'pointer';
    door.on('pointerover', () => {
      if (!this.isInteractive) return;
      gsap.to(doorHighlight, { alpha: 0.9, duration: 0.35 });
      gsap.to(doorGlow, { alpha: 0.35, duration: 0.35 });
      gsap.to(label, { alpha: 1, duration: 0.3 });
    });
    door.on('pointerout', () => {
      gsap.to(doorHighlight, { alpha: 0, duration: 0.25 });
      gsap.to(doorGlow, { alpha: 0, duration: 0.25 });
      gsap.to(label, { alpha: 0, duration: 0.25 });
    });
    door.on('pointertap', () => {
      if (!this.isInteractive) return;
      // soundManager.play('doorOpen');
      this.isInteractive = false;

      gsap.to(doorGlow, { alpha: 0.8, duration: 0.4 });
      gsap.to(this.container, { alpha: 0, duration: 0.5, delay: 0.1, ease: 'power2.in' });

      setTimeout(() => {
        this.manager.change(scene, { transition: 'fade', duration: 0.6 });
      }, 400);
    });

    this.doors.push({ container: door, doorHighlight, doorGlow, label });
  }

  enter() {
    soundManager.setAmbient('/assets/sounds/home_interior.mp3', { volume: 0.35, loop: true });

    this.container.alpha = 0;
    gsap.to(this.container, { alpha: 1, duration: 1.2, ease: 'power2.out' });

    setTimeout(() => { this.isInteractive = true; }, 1200);
  }

  update(delta) { }
  exit() { this.isInteractive = false; }
  resize() { }

  destroy() {
    this.tweens.forEach(t => t && t.kill && t.kill());
    this.doors.forEach(d => {
      gsap.killTweensOf(d.container);
      gsap.killTweensOf(d.doorHighlight);
      gsap.killTweensOf(d.doorGlow);
      gsap.killTweensOf(d.label);
    });
    gsap.killTweensOf(this.container);
    this.container.destroy({ children: true });
  }

  // ── UTILS ──
  _tw(target, props) { const t = gsap.to(target, props); this.tweens.push(t); return t; }
}