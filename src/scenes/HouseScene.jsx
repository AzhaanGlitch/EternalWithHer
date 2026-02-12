// src/scenes/HouseScene.jsx
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { SCENES, COLORS } from '../core/constants.jsx';
import soundManager from '../core/SoundManager.jsx';
import mainBgUrl from '../assets/images/main_bg.jpg';

export default class HouseScene {
  constructor(manager) {
    this.manager = manager;
    this.container = new PIXI.Container();
    this.elements = {};
    this.isInteractive = false;
    this.tweens = [];
  }

  async init() {
    await this.createBackground();
    this.createDoor();
    this.createInstructions();
  }

  // ── FULL-SCREEN BACKGROUND ──
  async createBackground() {
    const w = window.innerWidth, h = window.innerHeight;
    try {
      const bgTexture = await PIXI.Assets.load(mainBgUrl);
      const bg = new PIXI.Sprite(bgTexture);

      // Cover-style scaling: fill screen, preserve aspect ratio
      const imgAspect = bgTexture.width / bgTexture.height;
      const screenAspect = w / h;

      if (screenAspect > imgAspect) {
        bg.width = w;
        bg.height = w / imgAspect;
      } else {
        bg.height = h;
        bg.width = h * imgAspect;
      }

      // Center the image
      bg.x = (w - bg.width) / 2;
      bg.y = (h - bg.height) / 2;

      this.elements.bg = bg;
      this.container.addChild(bg);
    } catch (err) {
      console.warn('Failed to load background image:', err);
      const fallback = new PIXI.Graphics();
      fallback.rect(0, 0, w, h);
      fallback.fill(0x0a0a14);
      this.container.addChild(fallback);
    }
  }

  // ── DOOR CLICK AREA ──
  createDoor() {
    const w = window.innerWidth, h = window.innerHeight;

    // Door anchor position on screen
    const doorX = w * 0.76;
    const doorY = h * 0.85;

    const tl = { x: -22, y: -50 };  // top-left
    const tr = { x: 40, y: -60 };  // top-right 
    const br = { x: 34, y: 40 };  // bottom-right
    const bl = { x: -28, y: 52 };  // bottom-left

    this.elements.door = new PIXI.Container();

    // Helper: draw the quad polygon on a Graphics object
    const drawQuad = (g, tl, tr, br, bl) => {
      g.moveTo(tl.x, tl.y);
      g.lineTo(tr.x, tr.y);
      g.lineTo(br.x, br.y);
      g.lineTo(bl.x, bl.y);
      g.closePath();
    };

    // Helper: draw an expanded quad (for glow rings)
    const expandQuad = (tl, tr, br, bl, px) => ({
      tl: { x: tl.x - px, y: tl.y - px },
      tr: { x: tr.x + px, y: tr.y - px },
      br: { x: br.x + px, y: br.y + px },
      bl: { x: bl.x - px, y: bl.y + px },
    });

    // ── Soft outer glow rings (pulsing to draw attention) ──
    for (let i = 3; i > 0; i--) {
      const ring = new PIXI.Graphics();
      const exp = expandQuad(tl, tr, br, bl, i * 8);
      drawQuad(ring, exp.tl, exp.tr, exp.br, exp.bl);
      ring.fill({ color: 0xffd080, alpha: 0.015 * (4 - i) });
      this.elements.door.addChild(ring);
      this._tw(ring, {
        alpha: 0.06 * (4 - i), duration: 1.8 + i * 0.4,
        yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.3
      });
    }

    // ── Glassy panel ──
    const glassPanel = new PIXI.Graphics();
    drawQuad(glassPanel, tl, tr, br, bl);
    glassPanel.fill({ color: 0xffffff, alpha: 0.06 });
    glassPanel.stroke({ width: 1, color: 0xffeedd, alpha: 0.15 });
    this.elements.door.addChild(glassPanel);

    // ── Light-sweep shimmer (diagonal stripe that glides across) ──
    const shimmerContainer = new PIXI.Container();
    const shimmerMask = new PIXI.Graphics();
    drawQuad(shimmerMask, tl, tr, br, bl);
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
    this.elements.door.addChild(shimmerContainer);

    shimmer.x = -doorWidth;
    this._tw(shimmer, {
      x: doorWidth * 2, duration: 1.6, ease: 'power1.inOut',
      repeat: -1, repeatDelay: 2.5
    });

    // ── Subtle edge highlights (glass reflection) ──
    const topEdge = new PIXI.Graphics();
    topEdge.moveTo(tl.x + 3, tl.y + 1);
    topEdge.lineTo(tr.x - 3, tr.y + 1);
    topEdge.stroke({ width: 1, color: 0xffffff, alpha: 0.12 });
    this.elements.door.addChild(topEdge);

    const leftEdge = new PIXI.Graphics();
    leftEdge.moveTo(tl.x + 1, tl.y + 4);
    leftEdge.lineTo(bl.x + 1, bl.y - 4);
    leftEdge.stroke({ width: 0.8, color: 0xffffff, alpha: 0.08 });
    this.elements.door.addChild(leftEdge);

    // ── Golden highlight on hover ──
    const doorHighlight = new PIXI.Graphics();
    drawQuad(doorHighlight, tl, tr, br, bl);
    doorHighlight.stroke({ width: 2.5, color: COLORS.GOLD, alpha: 0 });
    this.elements.door.addChild(doorHighlight);
    this.elements.doorHighlight = doorHighlight;

    // ── Warm glow on hover ──
    const doorGlow = new PIXI.Graphics();
    const glowExp = expandQuad(tl, tr, br, bl, 12);
    drawQuad(doorGlow, glowExp.tl, glowExp.tr, glowExp.br, glowExp.bl);
    doorGlow.fill({ color: COLORS.GOLD, alpha: 0 });
    this.elements.door.addChild(doorGlow);
    this.elements.doorGlow = doorGlow;

    // ── Invisible hit area ──
    const hitArea = new PIXI.Graphics();
    const hitExp = expandQuad(tl, tr, br, bl, 10);
    drawQuad(hitArea, hitExp.tl, hitExp.tr, hitExp.br, hitExp.bl);
    hitArea.fill({ color: 0xffffff, alpha: 0.001 });
    this.elements.door.addChild(hitArea);

    this.elements.door.position.set(doorX, doorY);
    this.container.addChild(this.elements.door);

    // ── Interactivity ──
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
      // soundManager.play('doorOpen'); // Removing incorrect sound
      this.openDoor();
    });
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
    gsap.to(this.elements.doorHighlight, { alpha: 0, duration: 0.3 });
    gsap.to(this.elements.doorGlow, { alpha: 0.8, duration: 0.4 });

    // Stop the city ambient sound
    soundManager.stopAmbient();

    // Fade the whole scene out as we "enter"
    gsap.to(this.container, { alpha: 0, duration: 0.6, ease: 'power2.in' });

    setTimeout(() => {
      this.manager.change(SCENES.INTERIOR, { transition: 'fade', duration: 0.8 });
    }, 500);
  }

  enter() {
    // soundManager.register('doorOpen', '/assets/sounds/curtain_opening.mp3'); // Incorrect sound

    // Start city ambient music only after curtain is done
    // (HouseScene.enter() is called immediately by Game, before curtain opens)
    this._onCurtainDone = () => {
      soundManager.setAmbient('/assets/sounds/home_city.mp3', { volume: 0.3, loop: true });
    };
    window.addEventListener('curtainDone', this._onCurtainDone, { once: true });

    this.container.alpha = 0;
    gsap.to(this.container, { alpha: 1, duration: 1.4, ease: 'power2.out' });

    if (this.elements.instruction) {
      gsap.to(this.elements.instruction, { alpha: 1, duration: 0.8, delay: 1.8 });
    }
    setTimeout(() => { this.isInteractive = true; }, 1800);
  }

  update(delta) { }
  exit() { }
  resize() { }

  destroy() {
    this.tweens.forEach(t => t && t.kill && t.kill());
    if (this._onCurtainDone) window.removeEventListener('curtainDone', this._onCurtainDone);
    if (this.elements.instruction) gsap.killTweensOf(this.elements.instruction);
    if (this.elements.doorHighlight) gsap.killTweensOf(this.elements.doorHighlight);
    if (this.elements.doorGlow) gsap.killTweensOf(this.elements.doorGlow);
    gsap.killTweensOf(this.container);
    this.container.destroy({ children: true });
  }

  // ── UTILS ──
  _tw(target, props) { const t = gsap.to(target, props); this.tweens.push(t); return t; }
}
