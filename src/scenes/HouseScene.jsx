// src/scenes/HouseScene.jsx
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { SCENES, COLORS } from '../core/constants.jsx';
import soundManager from '../core/SoundManager.jsx';

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
  }

  init() {
    this.createSunsetSky();
    this.createSun();
    this.createClouds();
    this.createMountains();
    this.createGreenland();
    this.createAnimatedGrass();
    this.createHouse();
    this.createFlyingBirds();
    this.createAmbientEffects();
    this.createInstructions();
  }

  // ── SUNSET SKY ──
  createSunsetSky() {
    const w = window.innerWidth, h = window.innerHeight;
    const sky = new PIXI.Container();
    const colors = [
      [45, 10, 40], [70, 15, 50], [120, 25, 50], [180, 50, 40], [210, 80, 40],
      [235, 120, 50], [250, 160, 60], [255, 195, 80], [255, 210, 120],
      [255, 200, 150], [255, 180, 160], [240, 150, 160]
    ];
    const strips = 60;
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
    for (let i = 8; i > 0; i--) {
      const g = new PIXI.Graphics();
      g.circle(0, 0, sr + i * sr * 0.5);
      g.fill({ color: (255 << 16) | ((180 + i * 5) << 8) | (50 + i * 10), alpha: 0.015 * (9 - i) });
      sun.addChild(g);
    }
    for (let i = 5; i > 0; i--) {
      const g = new PIXI.Graphics();
      g.circle(0, 0, sr + i * 18);
      g.fill({ color: 0xffcc44, alpha: 0.04 * (6 - i) });
      sun.addChild(g);
    }
    const body = new PIXI.Graphics(); body.circle(0, 0, sr); body.fill(0xffe880); sun.addChild(body);
    const core = new PIXI.Graphics(); core.circle(0, 0, sr * 0.6); core.fill({ color: 0xfff5d0, alpha: 0.8 }); sun.addChild(core);
    sun.position.set(w * 0.2, h * 0.38);
    this.container.addChild(sun);
    this._tw(sun.scale, { x: 1.03, y: 1.03, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  // ── CLOUDS ──
  createClouds() {
    const w = window.innerWidth, h = window.innerHeight;
    const cc = new PIXI.Container();
    [[w * 0.08, h * 0.12, 0.7], [w * 0.3, h * 0.08, 1], [w * 0.55, h * 0.15, 0.8], [w * 0.75, h * 0.1, 0.6], [w * 0.15, h * 0.25, 0.5]].forEach(([cx, cy, sc]) => {
      const c = new PIXI.Container();
      [[-35, 5, 35, 20], [0, 0, 50, 25], [40, -10, 40, 22], [20, 8, 45, 18], [-15, -8, 38, 20]].forEach(([bx, by, rx, ry]) => {
        const g = new PIXI.Graphics(); g.ellipse(bx, by, rx, ry); g.fill({ color: 0xffeedd, alpha: 0.1 }); c.addChild(g);
      });
      c.position.set(cx, cy); c.scale.set(sc); cc.addChild(c);
      this._tw(c, { x: cx + 40 + Math.random() * 30, duration: 20 + Math.random() * 15, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    });
    this.container.addChild(cc);
  }

  // ── MOUNTAINS ──
  createMountains() {
    const w = window.innerWidth, h = window.innerHeight;
    const ranges = [
      { baseY: h * 0.55, color: 0x3d2847, alpha: 0.7, peaks: [[0, -h * 0.18, w * 0.25], [w * 0.15, -h * 0.22, w * 0.3], [w * 0.35, -h * 0.15, w * 0.25], [w * 0.5, -h * 0.2, w * 0.3], [w * 0.7, -h * 0.17, w * 0.25], [w * 0.85, -h * 0.13, w * 0.3]] },
      { baseY: h * 0.6, color: 0x4a2d50, alpha: 0.8, peaks: [[-w * 0.05, -h * 0.14, w * 0.3], [w * 0.2, -h * 0.18, w * 0.35], [w * 0.45, -h * 0.12, w * 0.28], [w * 0.6, -h * 0.16, w * 0.35], [w * 0.85, -h * 0.1, w * 0.3]] },
      { baseY: h * 0.65, color: 0x2d3a28, alpha: 0.9, peaks: [[-w * 0.05, -h * 0.1, w * 0.35], [w * 0.25, -h * 0.12, w * 0.3], [w * 0.5, -h * 0.08, w * 0.3], [w * 0.7, -h * 0.11, w * 0.35]] }
    ];
    ranges.forEach(({ baseY, color, alpha, peaks }) => {
      const m = new PIXI.Graphics();
      m.moveTo(0, baseY);
      peaks.forEach(([px, py, pw]) => {
        const mx = px + pw * 0.5;
        m.bezierCurveTo(px + pw * 0.2, baseY - 10, mx - pw * 0.15, baseY + py + 10, mx, baseY + py);
        m.bezierCurveTo(mx + pw * 0.15, baseY + py + 10, px + pw - pw * 0.2, baseY - 10, px + pw, baseY);
      });
      m.lineTo(w + 10, baseY); m.lineTo(w + 10, h); m.lineTo(0, h); m.closePath();
      m.fill({ color, alpha });
      this.container.addChild(m);
    });
  }

  // ── GREENLAND ──
  createGreenland() {
    const w = window.innerWidth, h = window.innerHeight;
    [[h * 0.68, 0x2a5c20, 25], [h * 0.72, 0x306b28, 20], [h * 0.76, 0x387a30, 15]].forEach(([baseY, color, amp]) => {
      const hill = new PIXI.Graphics();
      hill.moveTo(0, baseY);
      for (let x = 0; x <= w; x += 5)
        hill.lineTo(x, baseY + Math.sin(x * 0.003) * amp + Math.sin(x * 0.007 + 1) * amp * 0.5);
      hill.lineTo(w + 10, h + 10); hill.lineTo(-10, h + 10); hill.closePath();
      hill.fill(color);
      this.container.addChild(hill);
    });
    const gnd = new PIXI.Graphics(); gnd.rect(0, h * 0.8, w, h * 0.2); gnd.fill(0x3d8a35);
    this.container.addChild(gnd);
    // Flowers
    for (let i = 0; i < 20; i++) {
      const f = new PIXI.Graphics();
      const fc = [0xffdd44, 0xff8866, 0xffaacc, 0xffffff][Math.floor(Math.random() * 4)];
      f.circle(Math.random() * w * 0.5, h * 0.78 + Math.random() * h * 0.18, 2 + Math.random() * 2);
      f.fill({ color: fc, alpha: 0.7 });
      this.container.addChild(f);
    }
    // Distant trees
    for (let i = 0; i < 6; i++) {
      const t = new PIXI.Container();
      const trunk = new PIXI.Graphics(); trunk.rect(-3, -5, 6, 25); trunk.fill(0x1a3015); t.addChild(trunk);
      const canopy = new PIXI.Graphics(); canopy.ellipse(0, -20, 12 + Math.random() * 8, 18 + Math.random() * 10); canopy.fill({ color: 0x1e4a18, alpha: 0.85 }); t.addChild(canopy);
      t.position.set(Math.random() * w * 0.45, h * 0.65 + Math.random() * 30);
      t.scale.set(0.4 + Math.random() * 0.3);
      this.container.addChild(t);
    }
  }

  // ── ANIMATED GRASS (wind physics) ──
  createAnimatedGrass() {
    const w = window.innerWidth, h = window.innerHeight;
    this.elements.grassContainer = new PIXI.Container();
    for (let i = 0; i < 180; i++) {
      const x = Math.random() * w;
      const y = h * 0.76 + Math.random() * (h * 0.24);
      const bladeH = 10 + Math.random() * 18;
      const blade = new PIXI.Graphics();
      const shade = this._lerpColor(0x4aaa40, 0x2a7a20, Math.random());
      blade.moveTo(0, 0);
      blade.lineTo(-2, -bladeH * 0.6);
      blade.lineTo(0, -bladeH);
      blade.lineTo(2, -bladeH * 0.6);
      blade.closePath();
      blade.fill({ color: shade, alpha: 0.7 });
      blade.position.set(x, y);
      blade.pivot.set(0, 0);
      this.elements.grassContainer.addChild(blade);
      this.grassBlades.push({ graphic: blade, baseX: x, height: bladeH, phase: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 1.5 });
    }
    this.container.addChild(this.elements.grassContainer);
  }

  // ── MODERN LUXURY HOUSE (3/4 perspective) ──
  createHouse() {
    const w = window.innerWidth, h = window.innerHeight;
    this.elements.house = new PIXI.Container();
    // Perspective offset: clockwise drone rotation → right side recedes
    const P = 0.12; // perspective factor
    const HW = w * 0.50, HH = h * 0.55; // house front face dimensions
    const sideD = HW * 0.25; // visible side wall depth
    const baseY = 0; // bottom of house at container origin

    // Helper: draw a perspective quad
    const quad = (x1, y1, x2, y2, x3, y3, x4, y4, color, alpha = 1) => {
      const g = new PIXI.Graphics();
      g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x3, y3); g.lineTo(x4, y4); g.closePath();
      g.fill({ color, alpha });
      return g;
    };

    // Front face coords (slightly trapezoid: right side shorter for perspective)
    const fbl = [0, baseY]; // front bottom-left
    const fbr = [HW, baseY + HH * P * 0.3]; // front bottom-right (shifted down slightly)
    const ftr = [HW, baseY - HH + HH * P]; // front top-right (higher due to perspective)
    const ftl = [0, baseY - HH]; // front top-left

    // Side wall (right face, receding)
    const sbl = fbr; // shared edge
    const sbr = [HW + sideD, baseY + HH * P * 0.6]; // side bottom-right
    const str = [HW + sideD, baseY - HH * 0.75]; // side top-right
    const stl = ftr; // shared edge

    // ── SIDE WALL (right face, drawn first - behind front) ──
    const sideWall = quad(sbl[0], sbl[1], sbr[0], sbr[1], str[0], str[1], stl[0], stl[1], 0x8a7055);
    this.elements.house.addChild(sideWall);
    // Side wall wood cladding lines
    for (let i = 1; i < 12; i++) {
      const t = i / 12;
      const ly = baseY - HH * 0.75 * t + HH * P * t;
      const g = new PIXI.Graphics();
      const lx1 = HW + 2;
      const lx2 = HW + sideD - 2;
      const ly1 = this._lerp(stl[1], sbl[1], t);
      const ly2 = this._lerp(str[1], sbr[1], t);
      g.moveTo(lx1, ly1); g.lineTo(lx2, ly2);
      g.stroke({ width: 0.8, color: 0x6a5540, alpha: 0.4 });
      this.elements.house.addChild(g);
    }

    // ── FRONT FACE MAIN WALL ──
    const frontWall = quad(fbl[0], fbl[1], fbr[0], fbr[1], ftr[0], ftr[1], ftl[0], ftl[1], 0xd4c5a9);
    this.elements.house.addChild(frontWall);

    // ── DARK STEEL FRAME BEAMS ──
    const beamW = 8;
    // Vertical columns
    const colPositions = [0, HW * 0.3, HW * 0.55, HW * 0.78, HW];
    colPositions.forEach(cx => {
      const t = cx / HW;
      const by = this._lerp(fbl[1], fbr[1], t);
      const ty = this._lerp(ftl[1], ftr[1], t);
      const g = new PIXI.Graphics();
      g.rect(cx - beamW / 2, ty, beamW, by - ty);
      g.fill(0x2a2a2a);
      this.elements.house.addChild(g);
    });

    // Floor slab / balcony concrete divider (between floors)
    const midY_l = baseY - HH * 0.48;
    const midY_r = baseY - HH * 0.48 + HH * P * 0.5;
    const slabH = 14;
    const slab = quad(0, midY_l, HW, midY_r, HW, midY_r + slabH, 0, midY_l + slabH, 0x808080);
    this.elements.house.addChild(slab);
    // Slab extends slightly out (balcony overhang)
    const overhang = quad(-15, midY_l - 2, HW + 10, midY_r - 2, HW + 10, midY_r + slabH + 4, -15, midY_l + slabH + 4, 0x707070, 0.8);
    this.elements.house.addChild(overhang);

    // ── ROOF ──
    const roofExt = 25;
    const roofH = 15;
    const rtl = [ftl[0] - roofExt, ftl[1] - roofH];
    const rtr = [ftr[0] + roofExt, ftr[1] - roofH];
    const rbl = [ftl[0] - roofExt, ftl[1] + 3];
    const rbr = [ftr[0] + roofExt, ftr[1] + 3];
    const roof = quad(rbl[0], rbl[1], rbr[0], rbr[1], rtr[0], rtr[1], rtl[0], rtl[1], 0x3a3a3a);
    this.elements.house.addChild(roof);
    // Roof side extension
    const roofSide = quad(rbr[0], rbr[1], rbr[0] + sideD * 0.6, rbr[1] + HH * P * 0.2, rtr[0] + sideD * 0.6, rtr[1] + HH * P * 0.2 - roofH, rtr[0], rtr[1], 0x2d2d2d);
    this.elements.house.addChild(roofSide);

    // ── UNDER-ROOF WARM DOWNLIGHTS ──
    for (let i = 0; i < 12; i++) {
      const t = (i + 0.5) / 12;
      const lx = HW * t;
      const ly = this._lerp(ftl[1], ftr[1], t) + 6;
      const light = new PIXI.Graphics();
      light.circle(lx, ly, 4);
      light.fill({ color: 0xff9933, alpha: 0.9 });
      this.elements.house.addChild(light);
      // Light cone
      const cone = new PIXI.Graphics();
      cone.moveTo(lx - 3, ly + 2);
      cone.lineTo(lx - 18, ly + 50);
      cone.lineTo(lx + 18, ly + 50);
      cone.lineTo(lx + 3, ly + 2);
      cone.closePath();
      cone.fill({ color: 0xffaa44, alpha: 0.08 });
      this.elements.house.addChild(cone);
    }

    // ── STONE ACCENT WALL (left portion ground floor) ──
    const stoneX = 8, stoneY = midY_l + slabH + 4;
    const stoneW = HW * 0.28, stoneH = fbl[1] - stoneY;
    const stoneBg = new PIXI.Graphics();
    stoneBg.rect(stoneX, stoneY, stoneW, stoneH);
    stoneBg.fill(0x9a8a7a);
    this.elements.house.addChild(stoneBg);
    // Random stones
    for (let row = 0; row < Math.floor(stoneH / 18); row++) {
      let cx = stoneX + 3;
      while (cx < stoneX + stoneW - 5) {
        const sw = 15 + Math.random() * 25;
        const sh = 12 + Math.random() * 5;
        const st = new PIXI.Graphics();
        st.roundRect(cx, stoneY + row * 18 + 2, Math.min(sw, stoneX + stoneW - cx - 3), sh, 2);
        st.fill(this._lerpColor(0x7a6a5a, 0xb0a090, Math.random()));
        st.stroke({ width: 0.5, color: 0x5a4a3a, alpha: 0.3 });
        this.elements.house.addChild(st);
        cx += sw + 3;
      }
    }

    // ── STONE ACCENT (upper floor left) ──
    const uStoneY = ftl[1] + 10;
    const uStoneH = midY_l - uStoneY - 5;
    const uStoneBg = new PIXI.Graphics();
    uStoneBg.rect(stoneX, uStoneY, stoneW * 0.8, uStoneH);
    uStoneBg.fill(0x9a8a7a);
    this.elements.house.addChild(uStoneBg);
    for (let row = 0; row < Math.floor(uStoneH / 18); row++) {
      let cx = stoneX + 3;
      while (cx < stoneX + stoneW * 0.8 - 5) {
        const sw = 12 + Math.random() * 22;
        const sh = 11 + Math.random() * 5;
        const st = new PIXI.Graphics();
        st.roundRect(cx, uStoneY + row * 18 + 2, Math.min(sw, stoneX + stoneW * 0.8 - cx - 3), sh, 2);
        st.fill(this._lerpColor(0x7a6a5a, 0xb0a090, Math.random()));
        this.elements.house.addChild(st);
        cx += sw + 3;
      }
    }

    // ── WOOD CLADDING (upper floor center) ──
    const woodX = stoneX + stoneW * 0.8 + beamW;
    const woodW = HW * 0.35;
    const woodY = ftl[1] + 10;
    const woodH = midY_l - woodY - 5;
    const woodBg = new PIXI.Graphics();
    woodBg.rect(woodX, woodY, woodW, woodH);
    woodBg.fill(0x8B5E3C);
    this.elements.house.addChild(woodBg);
    for (let i = 0; i < Math.floor(woodH / 10); i++) {
      const l = new PIXI.Graphics();
      l.moveTo(woodX, woodY + i * 10);
      l.lineTo(woodX + woodW, woodY + i * 10);
      l.stroke({ width: 0.6, color: 0x6b4020, alpha: 0.35 });
      this.elements.house.addChild(l);
    }

    // ── LARGE GLASS PANELS (upper floor right) ──
    const glassX = woodX + woodW + beamW;
    const glassW = HW - glassX - beamW;
    const glassY = ftl[1] + 10;
    const glassH = midY_l - glassY - 5;
    const glass = new PIXI.Graphics();
    glass.rect(glassX, glassY, glassW, glassH);
    glass.fill(0x1a2a3a);
    this.elements.house.addChild(glass);
    // Reflection tint
    const glassReflect = new PIXI.Graphics();
    glassReflect.rect(glassX, glassY, glassW, glassH);
    glassReflect.fill({ color: 0xffbb66, alpha: 0.15 });
    this.elements.house.addChild(glassReflect);
    // Vertical mullion
    const gMid = new PIXI.Graphics();
    gMid.rect(glassX + glassW / 2 - 2, glassY, 4, glassH);
    gMid.fill(0x2a2a2a);
    this.elements.house.addChild(gMid);

    // ── GLASS BALCONY RAILING ──
    const railY = midY_l - 2;
    const railH = 35;
    const railGlass = new PIXI.Graphics();
    railGlass.rect(glassX - 10, railY - railH, glassW + 30, railH);
    railGlass.fill({ color: 0xaaccdd, alpha: 0.15 });
    railGlass.stroke({ width: 2, color: 0x555555 });
    this.elements.house.addChild(railGlass);

    // ── GROUND FLOOR: large glass showing interior ──
    const gfGlassX = stoneX + stoneW + beamW;
    const gfGlassW = HW * 0.42;
    const gfGlassY = midY_l + slabH + 10;
    const gfGlassH = fbl[1] - gfGlassY - 8;
    const gfGlass = new PIXI.Graphics();
    gfGlass.rect(gfGlassX, gfGlassY, gfGlassW, gfGlassH);
    gfGlass.fill(0x1a2535);
    this.elements.house.addChild(gfGlass);
    // Interior warm glow
    const gfGlow = new PIXI.Graphics();
    gfGlow.rect(gfGlassX + 3, gfGlassY + 3, gfGlassW - 6, gfGlassH - 6);
    gfGlow.fill({ color: 0xffcc66, alpha: 0.3 });
    this.elements.house.addChild(gfGlow);
    // Interior furniture silhouettes
    const sofa = new PIXI.Graphics();
    sofa.roundRect(gfGlassX + 15, gfGlassY + gfGlassH * 0.6, gfGlassW * 0.4, gfGlassH * 0.2, 3);
    sofa.fill({ color: 0x3a3a5a, alpha: 0.4 });
    this.elements.house.addChild(sofa);
    const lamp = new PIXI.Graphics();
    lamp.rect(gfGlassX + gfGlassW * 0.7, gfGlassY + gfGlassH * 0.3, 5, gfGlassH * 0.5);
    lamp.fill({ color: 0x4a4a4a, alpha: 0.3 });
    lamp.circle(gfGlassX + gfGlassW * 0.7 + 2.5, gfGlassY + gfGlassH * 0.28, 10);
    lamp.fill({ color: 0xffdd88, alpha: 0.4 });
    this.elements.house.addChild(lamp);
    // Glass dividers
    for (let i = 1; i < 3; i++) {
      const d = new PIXI.Graphics();
      d.rect(gfGlassX + (gfGlassW / 3) * i - 2, gfGlassY, 4, gfGlassH);
      d.fill(0x2a2a2a);
      this.elements.house.addChild(d);
    }

    // ── WOOD PANEL (ground floor right) ──
    const wpX = gfGlassX + gfGlassW + beamW;
    const wpW = HW - wpX - beamW;
    const wpBg = new PIXI.Graphics();
    wpBg.rect(wpX, gfGlassY, wpW, gfGlassH);
    wpBg.fill(0x8B5E3C);
    this.elements.house.addChild(wpBg);
    for (let i = 0; i < Math.floor(gfGlassH / 10); i++) {
      const l = new PIXI.Graphics();
      l.moveTo(wpX, gfGlassY + i * 10);
      l.lineTo(wpX + wpW, gfGlassY + i * 10);
      l.stroke({ width: 0.5, color: 0x6b4020, alpha: 0.3 });
      this.elements.house.addChild(l);
    }

    // ── FRONT DOOR ──
    this.elements.door = new PIXI.Container();
    const doorW = HW * 0.1, doorH = gfGlassH * 0.9;
    const doorX = gfGlassX + gfGlassW + beamW + wpW * 0.3;
    const doorY = gfGlassY + (gfGlassH - doorH) / 2;
    const dFrame = new PIXI.Graphics();
    dFrame.roundRect(-doorW * 0.6, -doorH * 0.52, doorW * 1.2, doorH * 1.05, 3);
    dFrame.fill(0x3a3a3a);
    this.elements.door.addChild(dFrame);
    const dBody = new PIXI.Graphics();
    dBody.roundRect(-doorW / 2, -doorH / 2, doorW, doorH, 2);
    dBody.fill(0x3a2518);
    this.elements.door.addChild(dBody);
    // Door handle
    const knob = new PIXI.Graphics();
    knob.roundRect(doorW * 0.2, -5, 12, 10, 2);
    knob.fill(COLORS.GOLD);
    this.elements.door.addChild(knob);
    // Door glow
    const doorGlow = new PIXI.Graphics();
    doorGlow.roundRect(-doorW * 0.7, -doorH * 0.55, doorW * 1.4, doorH * 1.1, 5);
    doorGlow.fill({ color: COLORS.GOLD, alpha: 0 });
    doorGlow.name = 'glow';
    this.elements.door.addChild(doorGlow);

    this.elements.door.position.set(doorX + doorW / 2, doorY + doorH / 2);
    this.elements.house.addChild(this.elements.door);

    // Door interactivity
    this.elements.door.eventMode = 'static';
    this.elements.door.cursor = 'pointer';
    this.elements.door.hitArea = new PIXI.Rectangle(-doorW, -doorH * 0.6, doorW * 2, doorH * 1.2);
    this.elements.door.on('pointerover', () => {
      if (!this.isInteractive) return;
      gsap.to(doorGlow, { alpha: 0.35, duration: 0.3 });
      gsap.to(this.elements.door.scale, { x: 1.06, y: 1.06, duration: 0.3 });
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

    // ── BUSHES & PLANTS at base ──
    const bushPositions = [
      [HW * 0.05, baseY], [HW * 0.15, baseY], [HW * 0.35, baseY],
      [HW * 0.55, baseY], [HW * 0.75, baseY], [HW * 0.9, baseY]
    ];
    bushPositions.forEach(([bx, by]) => {
      for (let j = 0; j < 3 + Math.floor(Math.random() * 3); j++) {
        const b = new PIXI.Graphics();
        b.ellipse(bx + (Math.random() - 0.5) * 25, by + 5, 10 + Math.random() * 12, 8 + Math.random() * 8);
        b.fill(this._lerpColor(0x2a6a20, 0x1a5a15, Math.random()));
        this.elements.house.addChild(b);
      }
    });
    // Small decorative tree
    const treeX = HW * 0.65;
    const treeTrunk = new PIXI.Graphics();
    treeTrunk.rect(treeX - 4, baseY - 55, 8, 60);
    treeTrunk.fill(0x4a3520);
    this.elements.house.addChild(treeTrunk);
    const treeCanopy = new PIXI.Graphics();
    treeCanopy.ellipse(treeX, baseY - 70, 28, 35);
    treeCanopy.fill(0x2a6420);
    this.elements.house.addChild(treeCanopy);

    // ── FOUNDATION LINE ──
    const foundation = new PIXI.Graphics();
    foundation.rect(-5, baseY, HW + sideD + 10, 6);
    foundation.fill(0x555555);
    this.elements.house.addChild(foundation);

    // ── POSITION HOUSE: right side, 3/4 perspective (clockwise drone view) ──
    this.elements.house.position.set(w * 0.52, h * 0.82);
    this.elements.house.skew.set(0, 0.04); // Y-skew: right side recedes upward = clockwise drone view
    this.container.addChild(this.elements.house);

    // ── LIGHT SPILL ON GROUND ──
    const lightSpill = new PIXI.Graphics();
    lightSpill.moveTo(w * 0.58, h * 0.82);
    lightSpill.lineTo(w * 0.48, h);
    lightSpill.lineTo(w * 0.72, h);
    lightSpill.lineTo(w * 0.68, h * 0.82);
    lightSpill.closePath();
    lightSpill.fill({ color: 0xffcc44, alpha: 0.05 });
    this.container.addChild(lightSpill);
  }

  // ── FLYING BIRDS ──
  createFlyingBirds() {
    const w = window.innerWidth, h = window.innerHeight;
    this.elements.birdsContainer = new PIXI.Container();
    for (let i = 0; i < 7; i++) {
      const bird = new PIXI.Container();
      const bx = Math.random() * w * 0.6 + w * 0.05;
      const by = h * 0.08 + Math.random() * h * 0.2;
      const size = 6 + Math.random() * 8;
      const lWing = new PIXI.Graphics();
      const rWing = new PIXI.Graphics();
      const drawWing = (g, dir) => {
        g.moveTo(0, 0);
        g.quadraticCurveTo(dir * size * 0.5, -size * 0.6, dir * size, -size * 0.3);
        g.stroke({ width: 1.5, color: 0x1a1015, alpha: 0.5 });
      };
      drawWing(lWing, -1); drawWing(rWing, 1);
      bird.addChild(lWing, rWing);
      bird.position.set(bx, by);
      this.elements.birdsContainer.addChild(bird);
      // Flying movement
      const speed = 15 + Math.random() * 25;
      this._tw(bird, { x: bx + w * 0.3, y: by - 20 + Math.random() * 40, duration: speed, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      // Wing flap
      this._tw(lWing, { rotation: 0.5, duration: 0.3 + Math.random() * 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      this._tw(rWing, { rotation: -0.5, duration: 0.3 + Math.random() * 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      this.birds.push(bird);
    }
    this.container.addChild(this.elements.birdsContainer);
  }

  // ── AMBIENT EFFECTS ──
  createAmbientEffects() {
    const w = window.innerWidth, h = window.innerHeight;
    // Fireflies
    for (let i = 0; i < 15; i++) {
      const ff = new PIXI.Graphics();
      ff.circle(0, 0, 2 + Math.random() * 2);
      ff.fill({ color: 0xffee88, alpha: 0.3 + Math.random() * 0.3 });
      ff.position.set(Math.random() * w * 0.5, h * 0.65 + Math.random() * h * 0.3);
      this.container.addChild(ff);
      this._tw(ff, { x: ff.x + (Math.random() - 0.5) * 60, y: ff.y - 20 - Math.random() * 40, alpha: 0, duration: 3 + Math.random() * 4, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: Math.random() * 3 });
    }
  }

  // ── INSTRUCTIONS ──
  createInstructions() {
    this.elements.instruction = new PIXI.Text({
      text: '✦ Click the door to enter ✦',
      style: { fontFamily: 'Playfair Display, serif', fontSize: 24, fill: 0xffeedd, dropShadow: true, dropShadowColor: 0x000000, dropShadowBlur: 6, dropShadowDistance: 2 }
    });
    this.elements.instruction.anchor.set(0.5);
    this.elements.instruction.position.set(window.innerWidth * 0.35, window.innerHeight - 50);
    this.elements.instruction.alpha = 0;
    this.container.addChild(this.elements.instruction);
    this._tw(this.elements.instruction, { alpha: 0.6, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  openDoor() {
    this.isInteractive = false;
    gsap.to(this.elements.door.scale, { x: 0.1, duration: 0.5, ease: 'power2.in' });
    setTimeout(() => { this.manager.change(SCENES.INTERIOR, { transition: 'fade', duration: 0.8 }); }, 400);
  }

  enter() {
    soundManager.register('doorOpen', '/assets/sounds/door.mp3');
    this.elements.house.scale.set(0.85);
    this.elements.house.alpha = 0;
    gsap.to(this.elements.house, { alpha: 1, duration: 1.2, ease: 'power2.out' });
    gsap.to(this.elements.house.scale, { x: 1, y: 1, duration: 1.5, ease: 'back.out(1.2)' });
    gsap.to(this.elements.instruction, { alpha: 1, duration: 0.8, delay: 1.5 });
    setTimeout(() => { this.isInteractive = true; }, 1500);
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
    gsap.killTweensOf(this.elements.instruction);
    gsap.killTweensOf(this.elements.house);
    if (this.elements.door) gsap.killTweensOf(this.elements.door.scale);
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
