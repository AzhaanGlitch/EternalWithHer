// src/scenes/rooms/DanceRoom.jsx
// The Soundtrack - Gramophone/speaker with Spotify playlist and dancing animations
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import BaseRoom from '../BaseRoom.jsx';
import { COLORS, ROOM_CONFIGS } from '../../core/constants.jsx';
import soundManager from '../../core/SoundManager.jsx';

export default class DanceRoom extends BaseRoom {
  constructor(manager) {
    super(manager, {
      title: ROOM_CONFIGS.DANCE.title,
      subtitle: ROOM_CONFIGS.DANCE.subtitle,
      backgroundColor: ROOM_CONFIGS.DANCE.color,
      gradientTop: ROOM_CONFIGS.DANCE.gradientTop,
      gradientBottom: ROOM_CONFIGS.DANCE.gradientBottom,
    });

    this.isPlaying = false;
    this.particles = [];
    this.spotlights = [];
  }

  init() {
    super.init();
    this.createDanceFloor();
    this.createGramophone();
    this.createPlaylist();
    this.createSpotlights();
    this.createDiscoBall();
  }

  createDanceFloor() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Dance floor with checkerboard
    const floorY = h * 0.65;
    const tileSize = 50;

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < Math.ceil(w / tileSize) + 1; x++) {
        const tile = new PIXI.Graphics();
        const isLight = (x + y) % 2 === 0;

        // 3D perspective effect
        const depth = y / 8;
        const scale = 1 - depth * 0.2;
        const adjustedX = x * tileSize * scale + (w / 2) * (1 - scale);

        tile.rect(0, 0, tileSize * scale - 2, tileSize * scale - 2);
        tile.fill(isLight ? 0x2a1a2a : 0x1a0a1a);
        tile.position.set(adjustedX, floorY + y * tileSize * 0.6);
        tile.alpha = 0.8;

        this.container.addChild(tile);

        // Random color change for some tiles
        if (Math.random() > 0.85) {
          this.animateTile(tile);
        }
      }
    }

    // Stage area
    const stage = new PIXI.Graphics();
    stage.rect(w * 0.25, h * 0.6, w * 0.5, 15);
    stage.fill(0x3a2a3a);
    this.container.addChild(stage);
  }

  animateTile(tile) {
    const colors = [0xff69b4, 0x00ffff, 0xff00ff, 0xffff00, 0x00ff88];
    let colorIndex = 0;

    const animate = () => {
      if (!tile.parent) return;
      colorIndex = (colorIndex + 1) % colors.length;
      tile.clear();
      tile.rect(0, 0, tile.width + 2, tile.height + 2);
      tile.fill({ color: colors[colorIndex], alpha: 0.6 });
    };

    tile.intervalId = setInterval(animate, 400 + Math.random() * 600);
  }

  createGramophone() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const gramophone = new PIXI.Container();

    // Cabinet base
    const cabinet = new PIXI.Graphics();
    cabinet.roundRect(-80, 20, 160, 100, 10);
    cabinet.fill(0x5a3a2a);
    cabinet.stroke({ width: 3, color: COLORS.GOLD });
    gramophone.addChild(cabinet);

    // Decorative inlays
    const inlay = new PIXI.Graphics();
    inlay.roundRect(-60, 35, 120, 70, 5);
    inlay.fill({ color: COLORS.GOLD, alpha: 0.15 });
    gramophone.addChild(inlay);

    // Turntable
    const turntable = new PIXI.Graphics();
    turntable.circle(0, 0, 60);
    turntable.fill(0x2a1a1a);
    turntable.stroke({ width: 3, color: 0x3a2a1a });
    gramophone.addChild(turntable);

    // Record
    this.record = new PIXI.Container();

    const recordDisc = new PIXI.Graphics();
    recordDisc.circle(0, 0, 55);
    recordDisc.fill(0x1a1a1a);
    this.record.addChild(recordDisc);

    // Record grooves
    for (let i = 0; i < 10; i++) {
      const groove = new PIXI.Graphics();
      groove.circle(0, 0, 15 + i * 4);
      groove.stroke({ width: 0.5, color: 0x2a2a2a });
      this.record.addChild(groove);
    }

    // Record label
    const label = new PIXI.Graphics();
    label.circle(0, 0, 15);
    label.fill(0xff69b4);
    this.record.addChild(label);

    // Heart on label
    const heart = new PIXI.Graphics();
    heart.moveTo(0, -5);
    heart.bezierCurveTo(-8, -12, -12, -3, 0, 5);
    heart.bezierCurveTo(12, -3, 8, -12, 0, -5);
    heart.fill(0xffffff);
    heart.scale.set(0.6);
    this.record.addChild(heart);

    gramophone.addChild(this.record);

    // Tone arm
    this.toneArm = new PIXI.Container();

    const armBase = new PIXI.Graphics();
    armBase.circle(0, 0, 10);
    armBase.fill(COLORS.GOLD);
    this.toneArm.addChild(armBase);

    const arm = new PIXI.Graphics();
    arm.rect(0, -5, 50, 6);
    arm.fill(COLORS.GOLD);
    this.toneArm.addChild(arm);

    const head = new PIXI.Graphics();
    head.rect(48, -8, 15, 12);
    head.fill(0x3a3a3a);
    this.toneArm.addChild(head);

    this.toneArm.position.set(55, -20);
    this.toneArm.rotation = -0.3;
    gramophone.addChild(this.toneArm);

    // Horn
    const horn = new PIXI.Container();

    const hornBell = new PIXI.Graphics();
    hornBell.moveTo(0, 0);
    hornBell.quadraticCurveTo(-60, -80, -110, -120);
    hornBell.lineTo(-80, -150);
    hornBell.quadraticCurveTo(-30, -110, 0, -25);
    hornBell.closePath();
    hornBell.fill(COLORS.GOLD_LIGHT);
    horn.addChild(hornBell);

    const hornNeck = new PIXI.Graphics();
    hornNeck.rect(-5, -30, 10, 35);
    hornNeck.fill(0x3a3a3a);
    horn.addChild(hornNeck);

    horn.position.set(-50, 10);
    gramophone.addChild(horn);

    // Glow effect
    const glow = new PIXI.Graphics();
    glow.ellipse(0, 60, 120, 60);
    glow.fill({ color: 0xff69b4, alpha: 0 });
    glow.name = 'glow';
    gramophone.addChildAt(glow, 0);

    // Interactive
    gramophone.eventMode = 'static';
    gramophone.cursor = 'pointer';
    gramophone.hitArea = new PIXI.Rectangle(-100, -160, 200, 300);

    gramophone.on('pointerover', () => {
      gsap.to(glow, { alpha: 0.2, duration: 0.3 });
      gsap.to(gramophone.scale, { x: 1.05, y: 1.05, duration: 0.3 });
    });

    gramophone.on('pointerout', () => {
      gsap.to(glow, { alpha: 0, duration: 0.3 });
      gsap.to(gramophone.scale, { x: 1, y: 1, duration: 0.3 });
    });

    gramophone.on('pointertap', () => {
      this.togglePlay();
    });

    gramophone.position.set(w * 0.2, h * 0.55);
    this.elements.gramophone = gramophone;
    this.container.addChild(gramophone);

    // Play instruction
    const hint = new PIXI.Text({
      text: 'Click the gramophone to play music',
      style: {
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        fill: COLORS.GOLD,
      }
    });
    hint.anchor.set(0.5);
    hint.position.set(w * 0.2, h * 0.72);
    hint.alpha = 0.7;
    this.elements.hint = hint;
    this.container.addChild(hint);

    gsap.to(hint, { alpha: 0.4, duration: 1.5, yoyo: true, repeat: -1 });
  }

  createPlaylist() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Playlist display board
    const board = new PIXI.Container();

    // Board background
    const bg = new PIXI.Graphics();
    bg.roundRect(-130, -180, 260, 360, 10);
    bg.fill(0x1a0a1a);
    bg.stroke({ width: 3, color: COLORS.GOLD });
    board.addChild(bg);

    // Title
    const title = new PIXI.Text({
      text: '♪ Our Playlist ♪',
      style: {
        fontFamily: 'Playfair Display, serif',
        fontSize: 20,
        fill: COLORS.GOLD,
        fontWeight: '600',
      }
    });
    title.anchor.set(0.5);
    title.position.set(0, -150);
    board.addChild(title);

    // Song list
    const songs = [
      { title: 'Perfect', artist: 'Ed Sheeran' },
      { title: 'All of Me', artist: 'John Legend' },
      { title: 'Thinking Out Loud', artist: 'Ed Sheeran' },
      { title: 'A Thousand Years', artist: 'Christina Perri' },
      { title: 'Can\'t Help Falling', artist: 'Elvis Presley' },
      { title: 'At Last', artist: 'Etta James' },
    ];

    songs.forEach((song, i) => {
      // Song entry
      const entry = new PIXI.Container();

      const songBg = new PIXI.Graphics();
      songBg.roundRect(-110, -15, 220, 30, 5);
      songBg.fill({ color: 0x2a1a2a, alpha: 0.5 });
      entry.addChild(songBg);

      // Music note icon
      const note = new PIXI.Text({
        text: '♫',
        style: { fontSize: 14, fill: 0xff69b4 }
      });
      note.anchor.set(0.5);
      note.position.set(-90, 0);
      entry.addChild(note);

      // Song title
      const songTitle = new PIXI.Text({
        text: song.title,
        style: {
          fontFamily: 'Inter, sans-serif',
          fontSize: 12,
          fill: 0xffffff,
          fontWeight: '500',
        }
      });
      songTitle.anchor.set(0, 0.5);
      songTitle.position.set(-70, -3);
      entry.addChild(songTitle);

      // Artist
      const artist = new PIXI.Text({
        text: song.artist,
        style: {
          fontFamily: 'Inter, sans-serif',
          fontSize: 10,
          fill: 0x888888,
        }
      });
      artist.anchor.set(0, 0.5);
      artist.position.set(-70, 10);
      entry.addChild(artist);

      entry.position.set(0, -100 + i * 45);
      board.addChild(entry);
    });

    // Spotify-style indicator
    const spotifyBtn = new PIXI.Container();

    const spotifyBg = new PIXI.Graphics();
    spotifyBg.roundRect(-50, -15, 100, 30, 15);
    spotifyBg.fill(0x1db954);
    spotifyBtn.addChild(spotifyBg);

    const spotifyText = new PIXI.Text({
      text: 'Open Playlist',
      style: {
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
        fill: 0xffffff,
        fontWeight: '600',
      }
    });
    spotifyText.anchor.set(0.5);
    spotifyBtn.addChild(spotifyText);

    spotifyBtn.position.set(0, 155);
    spotifyBtn.eventMode = 'static';
    spotifyBtn.cursor = 'pointer';

    spotifyBtn.on('pointerover', () => {
      gsap.to(spotifyBtn.scale, { x: 1.05, y: 1.05, duration: 0.2 });
    });

    spotifyBtn.on('pointerout', () => {
      gsap.to(spotifyBtn.scale, { x: 1, y: 1, duration: 0.2 });
    });

    spotifyBtn.on('pointertap', () => {
      // In a real app, this would open Spotify
      this.showPlaylistMessage();
    });

    board.addChild(spotifyBtn);

    board.position.set(w * 0.75, h * 0.5);
    this.elements.playlist = board;
    this.container.addChild(board);
  }

  createSpotlights() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const colors = [0xff69b4, 0x00ffff, 0xff00ff, 0xffff00];
    const positions = [
      { x: w * 0.25, angle: 0.3 },
      { x: w * 0.4, angle: 0.15 },
      { x: w * 0.55, angle: -0.15 },
      { x: w * 0.7, angle: -0.3 },
    ];

    positions.forEach((pos, i) => {
      const spotlight = new PIXI.Graphics();

      // Light cone
      spotlight.moveTo(0, 0);
      spotlight.lineTo(-60, h * 0.5);
      spotlight.lineTo(60, h * 0.5);
      spotlight.closePath();
      spotlight.fill({ color: colors[i], alpha: 0.08 });

      spotlight.position.set(pos.x, 120);
      spotlight.rotation = pos.angle;

      this.spotlights.push(spotlight);
      this.container.addChild(spotlight);

      // Animate spotlight sway
      gsap.to(spotlight, {
        rotation: pos.angle + 0.2,
        duration: 2 + i * 0.5,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
      });
    });
  }

  createDiscoBall() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.discoBall = new PIXI.Container();

    // String
    const string = new PIXI.Graphics();
    string.rect(-2, -80, 4, 80);
    string.fill(COLORS.GOLD);
    this.discoBall.addChild(string);

    // Ball
    const ball = new PIXI.Graphics();
    ball.circle(0, 0, 35);
    ball.fill(0xcccccc);
    this.discoBall.addChild(ball);

    // Mirror facets
    for (let ring = 0; ring < 6; ring++) {
      const y = -28 + ring * 12;
      const radius = 35 * Math.cos(Math.asin(y / 35));
      const facets = Math.max(4, Math.floor(radius / 8));

      for (let f = 0; f < facets; f++) {
        const angle = (f / facets) * Math.PI * 2;
        const fx = Math.cos(angle) * radius * 0.85;
        const fy = y;

        const facet = new PIXI.Graphics();
        facet.rect(-4, -4, 8, 8);
        facet.fill(0xffffff);
        facet.position.set(fx, fy);
        facet.rotation = angle;
        this.discoBall.addChild(facet);
      }
    }

    this.discoBall.position.set(w / 2, 150);
    this.container.addChild(this.discoBall);

    // Slow rotation
    gsap.to(this.discoBall, {
      rotation: Math.PI * 2,
      duration: 10,
      repeat: -1,
      ease: 'none'
    });
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      // Start playing
      gsap.to(this.toneArm, { rotation: 0.1, duration: 0.8, ease: 'power2.out' });

      // Spin record
      gsap.to(this.record, {
        rotation: Math.PI * 2,
        duration: 3,
        repeat: -1,
        ease: 'none'
      });

      // Intensify effects
      this.spotlights.forEach(light => {
        gsap.to(light, { alpha: 0.15, duration: 0.5 });
      });

      // Start creating particles
      this.particleInterval = setInterval(() => this.createMusicParticle(), 100);

      // Update hint
      this.elements.hint.text = 'Click again to stop';
    } else {
      // Stop playing
      gsap.to(this.toneArm, { rotation: -0.3, duration: 0.8 });
      gsap.killTweensOf(this.record);

      this.spotlights.forEach(light => {
        gsap.to(light, { alpha: 0.08, duration: 0.5 });
      });

      if (this.particleInterval) {
        clearInterval(this.particleInterval);
      }

      this.elements.hint.text = 'Click the gramophone to play music';
    }
  }

  createMusicParticle() {
    if (!this.isPlaying) return;

    const w = window.innerWidth;
    const notes = ['♪', '♫', '♬', '♩', '❤'];
    const colors = [0xff69b4, 0x00ffff, 0xff00ff, 0xffff00];

    const particle = new PIXI.Text({
      text: notes[Math.floor(Math.random() * notes.length)],
      style: {
        fontSize: 16 + Math.random() * 16,
        fill: colors[Math.floor(Math.random() * colors.length)],
      }
    });

    particle.anchor.set(0.5);
    particle.position.set(
      w * 0.2 + (Math.random() - 0.5) * 100,
      window.innerHeight * 0.55
    );

    this.container.addChild(particle);
    this.particles.push(particle);

    gsap.to(particle, {
      y: particle.y - 150 - Math.random() * 100,
      x: particle.x + (Math.random() - 0.5) * 150,
      alpha: 0,
      rotation: (Math.random() - 0.5) * 2,
      duration: 2 + Math.random(),
      ease: 'power1.out',
      onComplete: () => {
        particle.destroy();
        const idx = this.particles.indexOf(particle);
        if (idx > -1) this.particles.splice(idx, 1);
      }
    });
  }

  showPlaylistMessage() {
    // Create a simple notification
    const w = window.innerWidth;
    const h = window.innerHeight;

    const toast = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.roundRect(-150, -30, 300, 60, 10);
    bg.fill(0x1db954);
    toast.addChild(bg);

    const text = new PIXI.Text({
      text: '💚 Playlist would open in Spotify!',
      style: {
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        fill: 0xffffff,
      }
    });
    text.anchor.set(0.5);
    toast.addChild(text);

    toast.position.set(w / 2, h - 100);
    toast.alpha = 0;
    this.container.addChild(toast);

    gsap.to(toast, {
      alpha: 1,
      y: h - 120,
      duration: 0.3,
      onComplete: () => {
        gsap.to(toast, {
          alpha: 0,
          delay: 2,
          duration: 0.3,
          onComplete: () => toast.destroy()
        });
      }
    });
  }

  enter() {
    super.enter();
  }

  update(delta) {
    // Could add beat-synced effects here
  }

  destroy() {
    if (this.particleInterval) {
      clearInterval(this.particleInterval);
    }

    this.particles.forEach(p => gsap.killTweensOf(p));
    this.spotlights.forEach(s => gsap.killTweensOf(s));
    gsap.killTweensOf(this.discoBall);
    gsap.killTweensOf(this.record);
    gsap.killTweensOf(this.toneArm);

    super.destroy();
  }
}
