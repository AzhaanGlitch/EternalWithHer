// src/scenes/rooms/KitchenRoom.jsx
// Our Recipes / Sweet Moments - Fridge with digital magnets
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import BaseRoom from '../BaseRoom.jsx';
import { COLORS, ROOM_CONFIGS } from '../../core/constants.jsx';
import soundManager from '../../core/SoundManager.jsx';

export default class KitchenRoom extends BaseRoom {
  constructor(manager) {
    super(manager, {
      title: ROOM_CONFIGS.KITCHEN.title,
      subtitle: ROOM_CONFIGS.KITCHEN.subtitle,
      backgroundColor: ROOM_CONFIGS.KITCHEN.color,
      gradientTop: ROOM_CONFIGS.KITCHEN.gradientTop,
      gradientBottom: ROOM_CONFIGS.KITCHEN.gradientBottom,
    });

    this.magnets = [];
    this.selectedMagnet = null;
    this.steamParticles = [];
  }

  init() {
    super.init();
    this.createKitchenElements();
    this.createFridge();
    this.createMagnets();
    this.createMagnetModal();
  }

  createKitchenElements() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Floor tiles
    const tileSize = 60;
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < Math.ceil(w / tileSize) + 1; x++) {
        const tile = new PIXI.Graphics();
        const isLight = (x + y) % 2 === 0;
        tile.rect(x * tileSize, h * 0.7 + y * tileSize, tileSize - 2, tileSize - 2);
        tile.fill(isLight ? 0xfaf0e6 : 0xe8d8c8);
        this.container.addChild(tile);
      }
    }

    // Counter
    const counter = new PIXI.Graphics();
    counter.rect(0, h * 0.68, w * 0.35, h * 0.32);
    counter.fill(0x3a2a1a);
    this.container.addChild(counter);

    // Counter top
    const counterTop = new PIXI.Graphics();
    counterTop.rect(0, h * 0.66, w * 0.36, 20);
    counterTop.fill(0xf5f5f5);
    this.container.addChild(counterTop);

    // Stove
    this.createStove(w * 0.2, h * 0.55);

    // Window
    const windowFrame = new PIXI.Graphics();
    windowFrame.roundRect(-100, -80, 200, 160, 8);
    windowFrame.fill(0x87ceeb);
    windowFrame.stroke({ width: 10, color: 0xf5f5f5 });
    windowFrame.position.set(w * 0.65, h * 0.3);
    this.container.addChild(windowFrame);

    // Window cross
    const crossV = new PIXI.Graphics();
    crossV.rect(-3, -80, 6, 160);
    crossV.fill(0xf5f5f5);
    crossV.position.set(w * 0.65, h * 0.3);
    this.container.addChild(crossV);

    const crossH = new PIXI.Graphics();
    crossH.rect(-100, -3, 200, 6);
    crossH.fill(0xf5f5f5);
    crossH.position.set(w * 0.65, h * 0.3);
    this.container.addChild(crossH);

    // Curtains
    const leftCurtain = new PIXI.Graphics();
    leftCurtain.rect(-120, -90, 30, 180);
    leftCurtain.fill(0xffb6c1);
    leftCurtain.position.set(w * 0.65, h * 0.3);
    this.container.addChild(leftCurtain);

    const rightCurtain = new PIXI.Graphics();
    rightCurtain.rect(90, -90, 30, 180);
    rightCurtain.fill(0xffb6c1);
    rightCurtain.position.set(w * 0.65, h * 0.3);
    this.container.addChild(rightCurtain);
  }

  createStove(x, y) {
    const stove = new PIXI.Container();

    // Stove body
    const body = new PIXI.Graphics();
    body.roundRect(-80, 0, 160, 120, 5);
    body.fill(0xf5f5f5);
    body.stroke({ width: 2, color: 0xd0d0d0 });
    stove.addChild(body);

    // Stovetop
    const top = new PIXI.Graphics();
    top.rect(-80, -15, 160, 20);
    top.fill(0x2a2a2a);
    stove.addChild(top);

    // Burners
    const burnerPositions = [{ x: -40, y: -5 }, { x: 40, y: -5 }];

    burnerPositions.forEach((pos, i) => {
      const ring = new PIXI.Graphics();
      ring.circle(pos.x, pos.y, 25);
      ring.stroke({ width: 3, color: 0x1a1a1a });
      stove.addChild(ring);

      if (i === 0) {
        // Flame on first burner
        for (let f = 0; f < 6; f++) {
          const angle = (f / 6) * Math.PI * 2;
          const flame = new PIXI.Graphics();
          flame.ellipse(pos.x + Math.cos(angle) * 15, pos.y + Math.sin(angle) * 15, 5, 10);
          flame.fill(0x3388ff);
          stove.addChild(flame);

          gsap.to(flame.scale, {
            x: 0.7 + Math.random() * 0.3,
            y: 0.7 + Math.random() * 0.4,
            duration: 0.1 + Math.random() * 0.1,
            yoyo: true,
            repeat: -1,
          });
        }

        // Pot
        const pot = new PIXI.Graphics();
        pot.rect(pos.x - 30, pos.y - 50, 60, 45);
        pot.fill(0x4a4a4a);
        pot.stroke({ width: 2, color: 0x5a5a5a });
        stove.addChild(pot);

        // Pot handles
        const lHandle = new PIXI.Graphics();
        lHandle.rect(pos.x - 40, pos.y - 35, 12, 8);
        lHandle.fill(0x3a3a3a);
        stove.addChild(lHandle);

        const rHandle = new PIXI.Graphics();
        rHandle.rect(pos.x + 28, pos.y - 35, 12, 8);
        rHandle.fill(0x3a3a3a);
        stove.addChild(rHandle);

        // Store steam source position
        this.steamSource = { x: x + pos.x, y: y + pos.y - 55 };
      }
    });

    // Control knobs
    for (let k = 0; k < 4; k++) {
      const knob = new PIXI.Graphics();
      knob.circle(-60 + k * 40, 55, 12);
      knob.fill(0x2a2a2a);
      knob.stroke({ width: 2, color: 0x4a4a4a });
      stove.addChild(knob);
    }

    stove.position.set(x, y);
    this.container.addChild(stove);
  }

  createFridge() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const fridge = new PIXI.Container();

    // Fridge body
    const body = new PIXI.Graphics();
    body.roundRect(-100, -200, 200, 400, 10);
    body.fill(0xf5f5f5);
    body.stroke({ width: 3, color: 0xd0d0d0 });
    fridge.addChild(body);

    // Top door (freezer)
    const topDoor = new PIXI.Graphics();
    topDoor.roundRect(-95, -195, 190, 120, 5);
    topDoor.stroke({ width: 2, color: 0xd0d0d0 });
    fridge.addChild(topDoor);

    // Bottom door (fridge)
    const bottomDoor = new PIXI.Graphics();
    bottomDoor.roundRect(-95, -65, 190, 260, 5);
    bottomDoor.stroke({ width: 2, color: 0xd0d0d0 });
    fridge.addChild(bottomDoor);

    // Handles
    const topHandle = new PIXI.Graphics();
    topHandle.roundRect(70, -160, 15, 50, 5);
    topHandle.fill(0xd0d0d0);
    fridge.addChild(topHandle);

    const bottomHandle = new PIXI.Graphics();
    bottomHandle.roundRect(70, -30, 15, 80, 5);
    bottomHandle.fill(0xd0d0d0);
    fridge.addChild(bottomHandle);

    fridge.position.set(w * 0.82, h * 0.55);
    this.elements.fridge = fridge;
    this.container.addChild(fridge);

    // Instruction
    const hint = new PIXI.Text({
      text: 'Click the magnets to read sweet notes',
      style: {
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        fill: COLORS.GOLD,
      }
    });
    hint.anchor.set(0.5);
    hint.position.set(w * 0.82, h * 0.92);
    hint.alpha = 0.7;
    this.container.addChild(hint);

    gsap.to(hint, { alpha: 0.4, duration: 1.5, yoyo: true, repeat: -1 });
  }

  createMagnets() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Love notes for magnets
    const notes = [
      { emoji: '❤️', text: 'You make my heart smile every single day', color: 0xff6b6b },
      { emoji: '☕', text: 'Our morning coffee moments are my favorite', color: 0x8b4513 },
      { emoji: '🌟', text: 'You are the star that lights up my universe', color: 0xffd700 },
      { emoji: '🏠', text: 'Home is wherever I am with you', color: 0x87ceeb },
      { emoji: '🎵', text: 'You are the melody to my life\'s song', color: 0xdda0dd },
      { emoji: '🌹', text: 'Every day with you is Valentine\'s Day', color: 0xff69b4 },
      { emoji: '✨', text: 'You sprinkle magic into my ordinary days', color: 0xffffff },
      { emoji: '🍪', text: 'Life with you is sweeter than cookies', color: 0xd2691e },
    ];

    const fridgeX = w * 0.82;
    const fridgeY = h * 0.55;

    // Distribute magnets on fridge door
    const magnetPositions = [
      { x: -60, y: -40 }, { x: 20, y: -50 },
      { x: -40, y: 30 }, { x: 40, y: 20 },
      { x: -70, y: 100 }, { x: 10, y: 90 },
      { x: 50, y: 120 }, { x: -20, y: 150 },
    ];

    notes.forEach((note, index) => {
      if (index >= magnetPositions.length) return;

      const pos = magnetPositions[index];
      const magnet = this.createMagnet(
        fridgeX + pos.x,
        fridgeY + pos.y,
        note,
        index
      );
      this.magnets.push(magnet);
      this.container.addChild(magnet);
    });
  }

  createMagnet(x, y, note, index) {
    const magnet = new PIXI.Container();
    magnet.position.set(x, y);
    magnet.rotation = (Math.random() - 0.5) * 0.4;

    // Magnet background (paper note style)
    const paper = new PIXI.Graphics();
    const size = 50 + Math.random() * 15;
    paper.roundRect(-size / 2, -size / 2, size, size, 3);
    paper.fill(note.color);
    paper.stroke({ width: 1, color: 0x888888, alpha: 0.3 });
    magnet.addChild(paper);

    // Emoji
    const emoji = new PIXI.Text({
      text: note.emoji,
      style: { fontSize: 24 }
    });
    emoji.anchor.set(0.5);
    magnet.addChild(emoji);

    // Glow effect
    const glow = new PIXI.Graphics();
    glow.roundRect(-size / 2 - 5, -size / 2 - 5, size + 10, size + 10, 5);
    glow.fill({ color: note.color, alpha: 0 });
    glow.name = 'glow';
    magnet.addChildAt(glow, 0);

    // Store note data
    magnet.noteData = note;

    // Interactive
    magnet.eventMode = 'static';
    magnet.cursor = 'pointer';
    magnet.hitArea = new PIXI.Rectangle(-size / 2 - 5, -size / 2 - 5, size + 10, size + 10);

    magnet.on('pointerover', () => {
      gsap.to(glow, { alpha: 0.4, duration: 0.2 });
      gsap.to(magnet.scale, { x: 1.15, y: 1.15, duration: 0.2, ease: 'back.out' });
      gsap.to(magnet, { rotation: 0, duration: 0.2 });
    });

    magnet.on('pointerout', () => {
      gsap.to(glow, { alpha: 0, duration: 0.2 });
      gsap.to(magnet.scale, { x: 1, y: 1, duration: 0.2 });
      gsap.to(magnet, { rotation: (Math.random() - 0.5) * 0.3, duration: 0.2 });
    });

    magnet.on('pointertap', () => {
      this.showNote(note);
    });

    return magnet;
  }

  createMagnetModal() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.noteModal = new PIXI.Container();
    this.noteModal.visible = false;

    // Backdrop
    const backdrop = new PIXI.Graphics();
    backdrop.rect(0, 0, w, h);
    backdrop.fill({ color: 0x000000, alpha: 0.75 });
    backdrop.eventMode = 'static';
    backdrop.on('pointertap', () => this.hideNote());
    this.noteModal.addChild(backdrop);

    // Note card
    this.noteCard = new PIXI.Container();

    const cardBg = new PIXI.Graphics();
    cardBg.roundRect(-180, -120, 360, 240, 15);
    cardBg.fill(0xfff8dc);
    cardBg.stroke({ width: 3, color: COLORS.GOLD });
    this.noteCard.addChild(cardBg);

    // Pin at top
    const pin = new PIXI.Graphics();
    pin.circle(0, -105, 12);
    pin.fill(0xff4444);
    pin.stroke({ width: 2, color: 0xcc0000 });
    this.noteCard.addChild(pin);

    // Emoji display
    this.noteEmoji = new PIXI.Text({
      text: '',
      style: { fontSize: 48 }
    });
    this.noteEmoji.anchor.set(0.5);
    this.noteEmoji.position.set(0, -50);
    this.noteCard.addChild(this.noteEmoji);

    // Note text
    this.noteText = new PIXI.Text({
      text: '',
      style: {
        fontFamily: 'Dancing Script, cursive',
        fontSize: 22,
        fill: 0x4a3a2a,
        wordWrap: true,
        wordWrapWidth: 320,
        align: 'center',
        lineHeight: 30,
      }
    });
    this.noteText.anchor.set(0.5);
    this.noteText.position.set(0, 30);
    this.noteCard.addChild(this.noteText);

    // Close hint
    const closeHint = new PIXI.Text({
      text: 'Click anywhere to close',
      style: {
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
        fill: 0x888888,
      }
    });
    closeHint.anchor.set(0.5);
    closeHint.position.set(0, 100);
    this.noteCard.addChild(closeHint);

    this.noteCard.position.set(w / 2, h / 2);
    this.noteModal.addChild(this.noteCard);

    this.container.addChild(this.noteModal);
  }

  showNote(note) {
    this.noteEmoji.text = note.emoji;
    this.noteText.text = `"${note.text}"`;

    this.noteModal.visible = true;
    this.noteCard.alpha = 0;
    this.noteCard.scale.set(0.5);
    this.noteCard.rotation = -0.1;

    gsap.to(this.noteCard, { alpha: 1, rotation: 0, duration: 0.3 });
    gsap.to(this.noteCard.scale, { x: 1, y: 1, duration: 0.4, ease: 'back.out' });
  }

  hideNote() {
    gsap.to(this.noteCard, { alpha: 0, duration: 0.2 });
    gsap.to(this.noteCard.scale, {
      x: 0.8, y: 0.8, duration: 0.2, onComplete: () => {
        this.noteModal.visible = false;
      }
    });
  }

  createSteam() {
    if (!this.steamSource) return;

    const steam = new PIXI.Graphics();
    steam.circle(0, 0, 4 + Math.random() * 4);
    steam.fill({ color: 0xffffff, alpha: 0.35 });
    steam.position.set(
      this.steamSource.x + (Math.random() - 0.5) * 40,
      this.steamSource.y
    );

    this.container.addChild(steam);
    this.steamParticles.push(steam);

    gsap.to(steam, {
      y: steam.y - 60 - Math.random() * 30,
      x: steam.x + (Math.random() - 0.5) * 25,
      alpha: 0,
      scale: 2,
      duration: 1.5 + Math.random(),
      ease: 'power1.out',
      onComplete: () => {
        steam.destroy();
        const idx = this.steamParticles.indexOf(steam);
        if (idx > -1) this.steamParticles.splice(idx, 1);
      }
    });
  }

  enter() {
    super.enter();

    // Animate magnets appearing
    this.magnets.forEach((magnet, index) => {
      magnet.alpha = 0;
      magnet.scale.set(0);
      gsap.to(magnet, {
        alpha: 1,
        duration: 0.3,
        delay: 0.5 + index * 0.08,
      });
      gsap.to(magnet.scale, {
        x: 1,
        y: 1,
        duration: 0.4,
        delay: 0.5 + index * 0.08,
        ease: 'back.out'
      });
    });
  }

  update(delta) {
    // Create steam particles
    if (Math.random() > 0.92) {
      this.createSteam();
    }
  }

  destroy() {
    this.magnets.forEach(m => {
      gsap.killTweensOf(m);
      gsap.killTweensOf(m.scale);
    });
    this.steamParticles.forEach(p => gsap.killTweensOf(p));
    gsap.killTweensOf(this.noteCard);
    gsap.killTweensOf(this.noteCard.scale);
    super.destroy();
  }
}
