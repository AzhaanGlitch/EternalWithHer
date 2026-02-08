// src/scenes/CurtainScene.js
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import Matter from 'matter-js';
import { SCENES, COLORS } from '../core/constants';
import soundManager from '../core/SoundManager';

export default class CurtainScene {
  constructor(manager) {
    this.manager = manager;
    this.container = new PIXI.Container();
    this.isOpening = false;
    this.pullProgress = 0;
    this.pullThreshold = 100; // Pixels to pull before curtains open

    // Physics
    this.engine = null;
    this.ropeSegments = [];
    this.draggedBody = null;
    this.mouseConstraint = null;
  }

  init() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.createBackground();
    this.createCurtains();
    this.createRopePhysics();
    this.createRopeGraphics();
    this.createInstructionText();
    this.setupPointerEvents();
  }

  createBackground() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Dark theatrical background
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, w, h);
    bg.fill(0x0a0a0a);
    this.container.addChild(bg);

    // Subtle stage lighting effect
    const spotlight = new PIXI.Graphics();

    // Create radial gradient effect using multiple circles
    const centerX = w / 2;
    const centerY = h * 0.4;
    const maxRadius = Math.max(w, h) * 0.8;

    for (let i = 20; i > 0; i--) {
      const radius = (i / 20) * maxRadius;
      const alpha = 0.02 * (1 - i / 20);
      spotlight.circle(centerX, centerY, radius);
      spotlight.fill({ color: COLORS.GOLD, alpha });
    }

    this.container.addChild(spotlight);
  }

  createCurtains() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Left curtain container
    this.leftCurtain = new PIXI.Container();

    // Main curtain body
    const leftBody = new PIXI.Graphics();
    leftBody.rect(0, 0, w / 2 + 20, h);
    leftBody.fill(COLORS.VELVET_RED);
    this.leftCurtain.addChild(leftBody);

    // Curtain folds/pleats
    for (let i = 0; i < 6; i++) {
      const fold = new PIXI.Graphics();
      const x = (w / 2 + 20) / 6 * i;
      fold.rect(x, 0, 3, h);
      fold.fill({ color: 0x000000, alpha: 0.3 });
      this.leftCurtain.addChild(fold);
    }

    // Gold trim on edge
    const leftTrim = new PIXI.Graphics();
    leftTrim.rect(w / 2 - 10, 0, 30, h);
    leftTrim.fill({ color: COLORS.GOLD, alpha: 0.3 });
    this.leftCurtain.addChild(leftTrim);

    // Right curtain container  
    this.rightCurtain = new PIXI.Container();

    const rightBody = new PIXI.Graphics();
    rightBody.rect(0, 0, w / 2 + 20, h);
    rightBody.fill(COLORS.VELVET_RED);
    this.rightCurtain.addChild(rightBody);

    // Curtain folds
    for (let i = 0; i < 6; i++) {
      const fold = new PIXI.Graphics();
      const x = (w / 2 + 20) / 6 * i;
      fold.rect(x, 0, 3, h);
      fold.fill({ color: 0x000000, alpha: 0.3 });
      this.rightCurtain.addChild(fold);
    }

    // Gold trim
    const rightTrim = new PIXI.Graphics();
    rightTrim.rect(-10, 0, 30, h);
    rightTrim.fill({ color: COLORS.GOLD, alpha: 0.3 });
    this.rightCurtain.addChild(rightTrim);

    this.rightCurtain.x = w / 2 - 20;

    // Valance (top decorative piece)
    this.valance = new PIXI.Graphics();
    this.valance.rect(0, 0, w, 60);
    this.valance.fill(COLORS.VELVET_RED);

    // Gold valance trim
    const valanceTrim = new PIXI.Graphics();
    valanceTrim.rect(0, 50, w, 15);
    valanceTrim.fill(COLORS.GOLD);

    // Decorative swags
    for (let i = 0; i < 5; i++) {
      const swag = new PIXI.Graphics();
      const sx = w / 5 * i + w / 10;
      swag.moveTo(sx - 50, 60);
      swag.quadraticCurveTo(sx, 90, sx + 50, 60);
      swag.stroke({ width: 4, color: COLORS.GOLD });
    }

    this.container.addChild(this.leftCurtain);
    this.container.addChild(this.rightCurtain);
    this.container.addChild(this.valance);
    this.container.addChild(valanceTrim);
  }

  createRopePhysics() {
    // Create Matter.js engine
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.3 }
    });

    const w = window.innerWidth;
    const ropeX = w / 2;
    const ropeY = 80;
    const segments = 12;
    const segmentLength = 25;

    const group = Matter.Body.nextGroup(true);

    // Create rope segments
    for (let i = 0; i < segments; i++) {
      const body = Matter.Bodies.rectangle(
        ropeX,
        ropeY + i * segmentLength,
        12,
        segmentLength,
        {
          collisionFilter: { group },
          chamfer: { radius: 3 },
          density: 0.002,
          frictionAir: 0.05,
        }
      );
      this.ropeSegments.push(body);
    }

    // Add constraints between segments
    for (let i = 0; i < segments - 1; i++) {
      const constraint = Matter.Constraint.create({
        bodyA: this.ropeSegments[i],
        pointA: { x: 0, y: segmentLength / 2 },
        bodyB: this.ropeSegments[i + 1],
        pointB: { x: 0, y: -segmentLength / 2 },
        stiffness: 0.9,
        damping: 0.1,
      });
      Matter.Composite.add(this.engine.world, constraint);
    }

    // Anchor top segment to ceiling
    this.anchor = Matter.Constraint.create({
      pointA: { x: ropeX, y: ropeY - segmentLength / 2 },
      bodyB: this.ropeSegments[0],
      pointB: { x: 0, y: -segmentLength / 2 },
      stiffness: 1,
      length: 0,
    });

    Matter.Composite.add(this.engine.world, this.ropeSegments);
    Matter.Composite.add(this.engine.world, this.anchor);

    // Create the tassel at the end
    const tassselBody = Matter.Bodies.circle(
      ropeX,
      ropeY + segments * segmentLength,
      20,
      {
        collisionFilter: { group },
        density: 0.005,
      }
    );
    this.tassel = tassselBody;

    const tasselConstraint = Matter.Constraint.create({
      bodyA: this.ropeSegments[segments - 1],
      pointA: { x: 0, y: segmentLength / 2 },
      bodyB: tassselBody,
      pointB: { x: 0, y: -15 },
      stiffness: 0.9,
    });

    Matter.Composite.add(this.engine.world, [tassselBody, tasselConstraint]);
  }

  createRopeGraphics() {
    this.ropeGraphics = new PIXI.Graphics();
    this.container.addChild(this.ropeGraphics);

    // Tassel graphics
    this.tasselGraphics = new PIXI.Container();

    const tasselBg = new PIXI.Graphics();
    tasselBg.circle(0, 0, 25);
    tasselBg.fill(COLORS.GOLD);

    // Tassel strings
    const strings = new PIXI.Graphics();
    for (let i = -3; i <= 3; i++) {
      strings.moveTo(i * 4, 10);
      strings.lineTo(i * 5, 45);
    }
    strings.stroke({ width: 2, color: COLORS.GOLD_LIGHT });

    this.tasselGraphics.addChild(tasselBg, strings);
    this.container.addChild(this.tasselGraphics);

    // Make tassel interactive
    this.tasselGraphics.eventMode = 'static';
    this.tasselGraphics.cursor = 'grab';
    this.tasselGraphics.hitArea = new PIXI.Circle(0, 15, 50);
  }

  createInstructionText() {
    this.instructionText = new PIXI.Text({
      text: '✦ Pull the rope to begin ✦',
      style: {
        fontFamily: 'Playfair Display, serif',
        fontSize: 24,
        fill: COLORS.GOLD,
        fontWeight: '400',
      }
    });

    this.instructionText.anchor.set(0.5);
    this.instructionText.position.set(window.innerWidth / 2, window.innerHeight - 80);
    this.container.addChild(this.instructionText);

    // Floating animation
    gsap.to(this.instructionText, {
      y: window.innerHeight - 90,
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    // Pulsing glow
    gsap.to(this.instructionText, {
      alpha: 0.6,
      duration: 1.2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });
  }

  setupPointerEvents() {
    this.isDragging = false;
    this.dragStartY = 0;
    this.totalPull = 0;

    this.tasselGraphics.on('pointerdown', (e) => {
      if (this.isOpening) return;
      this.isDragging = true;
      this.dragStartY = e.global.y;
      this.tasselGraphics.cursor = 'grabbing';
    });

    const onMove = (e) => {
      if (!this.isDragging || this.isOpening) return;

      const deltaY = e.global.y - this.dragStartY;

      // Apply force to the tassel
      if (deltaY > 0) {
        Matter.Body.applyForce(this.tassel, this.tassel.position, {
          x: 0,
          y: deltaY * 0.0001
        });

        this.totalPull = Math.max(this.totalPull, deltaY);

        // Update progress indicator
        this.pullProgress = Math.min(1, this.totalPull / this.pullThreshold);

        // If pulled enough, trigger curtain open
        if (this.totalPull >= this.pullThreshold && !this.isOpening) {
          this.startOpening();
        }
      }

      this.dragStartY = e.global.y;
    };

    const onUp = () => {
      this.isDragging = false;
      this.tasselGraphics.cursor = 'grab';

      // Apply return spring force
      if (!this.isOpening) {
        Matter.Body.applyForce(this.tassel, this.tassel.position, {
          x: 0,
          y: -0.01
        });
      }
    };

    // Add global listeners
    this.container.eventMode = 'static';
    this.container.on('pointermove', onMove);
    this.container.on('pointerup', onUp);
    this.container.on('pointerupoutside', onUp);
  }

  startOpening() {
    if (this.isOpening) return;
    this.isOpening = true;

    // Hide instruction
    gsap.to(this.instructionText, { alpha: 0, duration: 0.3 });

    // Play sound
    soundManager.play('curtainOpen');

    const w = window.innerWidth;
    const timeline = gsap.timeline({
      onComplete: () => {
        this.manager.change(SCENES.HOUSE, { transition: 'fade', duration: 0.8 });
      }
    });

    // Curtain opening animation
    timeline.to(this.leftCurtain, {
      x: -w / 2 - 50,
      duration: 1.5,
      ease: 'power2.inOut'
    });

    timeline.to(this.rightCurtain, {
      x: w,
      duration: 1.5,
      ease: 'power2.inOut'
    }, '<');

    // Fade out rope and tassel
    timeline.to([this.ropeGraphics, this.tasselGraphics], {
      alpha: 0,
      duration: 0.8
    }, '<');
  }

  update(delta) {
    if (!this.engine) return;

    // Update physics
    Matter.Engine.update(this.engine, delta * 16.67);

    // Draw rope
    this.ropeGraphics.clear();

    if (this.ropeSegments.length > 0) {
      // Draw rope line
      this.ropeGraphics.moveTo(
        this.ropeSegments[0].position.x,
        this.ropeSegments[0].position.y - 12
      );

      for (const segment of this.ropeSegments) {
        this.ropeGraphics.lineTo(segment.position.x, segment.position.y);
      }

      this.ropeGraphics.stroke({ width: 8, color: COLORS.GOLD_LIGHT });

      // Inner golden highlight
      this.ropeGraphics.moveTo(
        this.ropeSegments[0].position.x,
        this.ropeSegments[0].position.y - 12
      );

      for (const segment of this.ropeSegments) {
        this.ropeGraphics.lineTo(segment.position.x, segment.position.y);
      }

      this.ropeGraphics.stroke({ width: 4, color: COLORS.GOLD });
    }

    // Update tassel position
    if (this.tassel) {
      this.tasselGraphics.position.set(
        this.tassel.position.x,
        this.tassel.position.y
      );
      this.tasselGraphics.rotation = this.tassel.angle;
    }
  }

  enter() {
    // Register sounds (placeholder - would load real sounds)
    soundManager.register('curtainOpen', '/assets/sounds/curtain.mp3');
    soundManager.register('click', '/assets/sounds/click.mp3');
  }

  exit() {
    gsap.killTweensOf(this.instructionText);
  }

  resize() {
    // Would handle resizing here
  }

  destroy() {
    gsap.killTweensOf(this.instructionText);

    if (this.engine) {
      Matter.Engine.clear(this.engine);
      this.engine = null;
    }

    this.ropeSegments = [];
    this.container.destroy({ children: true });
  }
}
