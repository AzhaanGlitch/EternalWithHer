// src/scenes/rooms/GamingRoom.jsx
// Interactive Quizzes - Retro arcade machine with trivia game
import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import BaseRoom from '../BaseRoom.jsx';
import { COLORS, ROOM_CONFIGS } from '../../core/constants.jsx';
import soundManager from '../../core/SoundManager.jsx';

export default class GamingRoom extends BaseRoom {
  constructor(manager) {
    super(manager, {
      title: ROOM_CONFIGS.GAMING.title,
      subtitle: ROOM_CONFIGS.GAMING.subtitle,
      backgroundColor: ROOM_CONFIGS.GAMING.color,
      gradientTop: ROOM_CONFIGS.GAMING.gradientTop,
      gradientBottom: ROOM_CONFIGS.GAMING.gradientBottom,
    });

    this.quizActive = false;
    this.currentQuestion = 0;
    this.score = 0;
    this.questions = [];
    this.neonColors = [0x00ffff, 0xff00ff, 0x00ff00, 0xff6600];
  }

  init() {
    super.init();
    this.initQuestions();
    this.createRoomDecor();
    this.createArcadeMachine();
    this.createQuizModal();
  }

  initQuestions() {
    // "How well do you know us?" trivia
    this.questions = [
      {
        question: "Where did we first meet?",
        options: ["Coffee Shop", "Through Friends", "Online", "At Work"],
        correct: 1, // Change this to match your story!
      },
      {
        question: "What's our song?",
        options: ["Perfect - Ed Sheeran", "All of Me - John Legend", "Thinking Out Loud", "A Thousand Years"],
        correct: 0,
      },
      {
        question: "What's our favorite movie to watch together?",
        options: ["The Notebook", "Titanic", "A Walk to Remember", "Pride & Prejudice"],
        correct: 2,
      },
      {
        question: "What's our favorite food to share?",
        options: ["Pizza", "Sushi", "Pasta", "Tacos"],
        correct: 0,
      },
      {
        question: "What's our dream travel destination?",
        options: ["Paris", "Maldives", "Japan", "Iceland"],
        correct: 1,
      },
    ];
  }

  createRoomDecor() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Neon grid floor
    for (let x = 0; x < w; x += 60) {
      const line = new PIXI.Graphics();
      line.moveTo(x, h * 0.7);
      line.lineTo(x, h);
      line.stroke({ width: 1, color: 0x00ffff, alpha: 0.2 });
      this.container.addChild(line);
    }

    for (let y = h * 0.7; y < h; y += 30) {
      const line = new PIXI.Graphics();
      line.moveTo(0, y);
      line.lineTo(w, y);
      line.stroke({ width: 1, color: 0x00ffff, alpha: 0.15 });
      this.container.addChild(line);
    }

    // RGB wall lights
    this.createWallLight(30, h * 0.25, h * 0.4, 0xff00ff);
    this.createWallLight(w - 30, h * 0.25, h * 0.4, 0x00ffff);

    // Ceiling neon strip
    const ceilingLight = new PIXI.Graphics();
    ceilingLight.rect(w * 0.15, 100, w * 0.7, 8);
    ceilingLight.fill(0x00ff00);
    this.container.addChild(ceilingLight);
    this.elements.ceilingLight = ceilingLight;

    gsap.to(ceilingLight, {
      tint: 0xff00ff,
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

    // Gaming posters
    this.createPoster(w * 0.15, h * 0.35, 'PLAY', 0xff00ff);
    this.createPoster(w * 0.85, h * 0.35, 'WIN!', 0x00ffff);

    // Gaming chair
    this.createGamingChair(w * 0.3, h * 0.75);
  }

  createWallLight(x, y, height, color) {
    const light = new PIXI.Graphics();
    light.rect(0, 0, 15, height);
    light.fill(color);
    light.position.set(x, y);
    this.container.addChild(light);

    gsap.to(light, {
      tint: this.neonColors[Math.floor(Math.random() * this.neonColors.length)],
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

    return light;
  }

  createPoster(x, y, text, color) {
    const poster = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.roundRect(-50, -60, 100, 120, 5);
    bg.fill(0x1a1a2a);
    bg.stroke({ width: 3, color: color });
    poster.addChild(bg);

    const label = new PIXI.Text({
      text: text,
      style: {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: 24,
        fill: color,
        fontWeight: 'bold',
      }
    });
    label.anchor.set(0.5);
    poster.addChild(label);

    // Neon glow effect
    gsap.to(label, {
      alpha: 0.6,
      duration: 0.8,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

    poster.position.set(x, y);
    this.container.addChild(poster);
  }

  createGamingChair(x, y) {
    const chair = new PIXI.Container();

    // Seat
    const seat = new PIXI.Graphics();
    seat.roundRect(-50, 0, 100, 40, 8);
    seat.fill(0x1a1a2a);
    seat.stroke({ width: 2, color: 0xff0066 });
    chair.addChild(seat);

    // Backrest
    const back = new PIXI.Graphics();
    back.roundRect(-45, -100, 90, 110, 10);
    back.fill(0x1a1a2a);
    back.stroke({ width: 2, color: 0xff0066 });
    chair.addChild(back);

    // Racing stripes
    const stripe1 = new PIXI.Graphics();
    stripe1.rect(-25, -90, 8, 90);
    stripe1.fill(0xff0066);
    chair.addChild(stripe1);

    const stripe2 = new PIXI.Graphics();
    stripe2.rect(17, -90, 8, 90);
    stripe2.fill(0xff0066);
    chair.addChild(stripe2);

    chair.position.set(x, y);
    this.container.addChild(chair);
  }

  createArcadeMachine() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const arcade = new PIXI.Container();

    // Cabinet body
    const cabinet = new PIXI.Graphics();
    cabinet.moveTo(-100, 0);
    cabinet.lineTo(-120, -350);
    cabinet.lineTo(-100, -400);
    cabinet.lineTo(100, -400);
    cabinet.lineTo(120, -350);
    cabinet.lineTo(100, 0);
    cabinet.closePath();
    cabinet.fill(0x1a1a2a);
    cabinet.stroke({ width: 4, color: 0x00ffff });
    arcade.addChild(cabinet);

    // Screen bezel
    const bezel = new PIXI.Graphics();
    bezel.roundRect(-90, -370, 180, 150, 5);
    bezel.fill(0x0a0a1a);
    bezel.stroke({ width: 3, color: 0xff00ff });
    arcade.addChild(bezel);

    // Screen
    const screen = new PIXI.Graphics();
    screen.roundRect(-80, -360, 160, 130, 3);
    screen.fill(0x000815);
    arcade.addChild(screen);

    // Screen content - "INSERT COIN"
    this.arcadeText = new PIXI.Text({
      text: 'HOW WELL DO\nYOU KNOW US?',
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 16,
        fill: 0x00ffff,
        align: 'center',
        lineHeight: 22,
      }
    });
    this.arcadeText.anchor.set(0.5);
    this.arcadeText.position.set(0, -320);
    arcade.addChild(this.arcadeText);

    // Blinking "PRESS START"
    this.startText = new PIXI.Text({
      text: 'CLICK TO START',
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 12,
        fill: 0xff00ff,
      }
    });
    this.startText.anchor.set(0.5);
    this.startText.position.set(0, -260);
    arcade.addChild(this.startText);

    gsap.to(this.startText, {
      alpha: 0.3,
      duration: 0.5,
      yoyo: true,
      repeat: -1,
    });

    // Control panel
    const panel = new PIXI.Graphics();
    panel.rect(-90, -200, 180, 80);
    panel.fill(0x2a2a3a);
    panel.stroke({ width: 2, color: 0xffff00 });
    arcade.addChild(panel);

    // Joystick
    const joystickBase = new PIXI.Graphics();
    joystickBase.circle(-40, -160, 25);
    joystickBase.fill(0x1a1a1a);
    arcade.addChild(joystickBase);

    const joystick = new PIXI.Graphics();
    joystick.circle(-40, -170, 12);
    joystick.fill(0xff0000);
    arcade.addChild(joystick);

    // Buttons
    const buttonColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
    buttonColors.forEach((color, i) => {
      const btn = new PIXI.Graphics();
      btn.circle(25 + i * 22, -165, 10);
      btn.fill(color);
      arcade.addChild(btn);
    });

    // Marquee at top
    const marquee = new PIXI.Graphics();
    marquee.roundRect(-100, -420, 200, 25, 5);
    marquee.fill(0xff00ff);
    arcade.addChild(marquee);

    const marqueeText = new PIXI.Text({
      text: '♥ LOVE QUIZ ♥',
      style: {
        fontFamily: 'Arial Black',
        fontSize: 14,
        fill: 0xffffff,
        fontWeight: 'bold',
      }
    });
    marqueeText.anchor.set(0.5);
    marqueeText.position.set(0, -408);
    arcade.addChild(marqueeText);

    // Coin slot
    const coinSlot = new PIXI.Graphics();
    coinSlot.roundRect(-15, -100, 30, 40, 3);
    coinSlot.fill(0x000000);
    coinSlot.stroke({ width: 2, color: 0xffd700 });
    arcade.addChild(coinSlot);

    const coinLabel = new PIXI.Text({
      text: 'INSERT\nCOIN',
      style: {
        fontFamily: 'Arial',
        fontSize: 8,
        fill: 0xffd700,
        align: 'center',
      }
    });
    coinLabel.anchor.set(0.5);
    coinLabel.position.set(0, -80);
    arcade.addChild(coinLabel);

    // Glow effect
    const glow = new PIXI.Graphics();
    glow.roundRect(-130, -430, 260, 450, 15);
    glow.fill({ color: 0x00ffff, alpha: 0 });
    glow.name = 'glow';
    arcade.addChildAt(glow, 0);

    // Make interactive
    arcade.eventMode = 'static';
    arcade.cursor = 'pointer';
    arcade.hitArea = new PIXI.Rectangle(-120, -420, 240, 440);

    arcade.on('pointerover', () => {
      gsap.to(glow, { alpha: 0.15, duration: 0.3 });
      gsap.to(arcade.scale, { x: 1.03, y: 1.03, duration: 0.3 });
    });

    arcade.on('pointerout', () => {
      gsap.to(glow, { alpha: 0, duration: 0.3 });
      gsap.to(arcade.scale, { x: 1, y: 1, duration: 0.3 });
    });

    arcade.on('pointertap', () => {
      if (!this.quizActive) {
        this.startQuiz();
      }
    });

    arcade.position.set(w * 0.6, h * 0.85);
    this.elements.arcade = arcade;
    this.container.addChild(arcade);
  }

  createQuizModal() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.quizModal = new PIXI.Container();
    this.quizModal.visible = false;

    // Backdrop
    const backdrop = new PIXI.Graphics();
    backdrop.rect(0, 0, w, h);
    backdrop.fill({ color: 0x000000, alpha: 0.9 });
    this.quizModal.addChild(backdrop);

    // Quiz card
    this.quizCard = new PIXI.Container();

    const cardBg = new PIXI.Graphics();
    cardBg.roundRect(-280, -220, 560, 440, 15);
    cardBg.fill(0x0a0a1a);
    cardBg.stroke({ width: 4, color: 0x00ffff });
    this.quizCard.addChild(cardBg);

    // Scanlines effect
    for (let i = 0; i < 60; i++) {
      const line = new PIXI.Graphics();
      line.rect(-280, -220 + i * 8, 560, 2);
      line.fill({ color: 0x000000, alpha: 0.15 });
      this.quizCard.addChild(line);
    }

    // Question text
    this.questionText = new PIXI.Text({
      text: '',
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 22,
        fill: 0x00ffff,
        wordWrap: true,
        wordWrapWidth: 500,
        align: 'center',
      }
    });
    this.questionText.anchor.set(0.5);
    this.questionText.position.set(0, -150);
    this.quizCard.addChild(this.questionText);

    // Option buttons
    this.optionButtons = [];
    for (let i = 0; i < 4; i++) {
      const btn = this.createOptionButton(i);
      btn.position.set(0, -50 + i * 70);
      this.optionButtons.push(btn);
      this.quizCard.addChild(btn);
    }

    // Score display
    this.scoreText = new PIXI.Text({
      text: 'SCORE: 0',
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 18,
        fill: 0xff00ff,
      }
    });
    this.scoreText.anchor.set(0.5);
    this.scoreText.position.set(0, -190);
    this.quizCard.addChild(this.scoreText);

    // Progress indicator
    this.progressText = new PIXI.Text({
      text: '',
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 14,
        fill: 0x888888,
      }
    });
    this.progressText.anchor.set(1, 0);
    this.progressText.position.set(250, -200);
    this.quizCard.addChild(this.progressText);

    this.quizCard.position.set(w / 2, h / 2);
    this.quizModal.addChild(this.quizCard);

    this.container.addChild(this.quizModal);
  }

  createOptionButton(index) {
    const btn = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.roundRect(-220, -25, 440, 50, 8);
    bg.fill(0x1a1a3a);
    bg.stroke({ width: 2, color: 0x00ffff });
    btn.addChild(bg);

    const text = new PIXI.Text({
      text: '',
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 16,
        fill: 0xffffff,
      }
    });
    text.anchor.set(0.5);
    text.name = 'text';
    btn.addChild(text);

    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.hitArea = new PIXI.Rectangle(-220, -25, 440, 50);

    btn.on('pointerover', () => {
      gsap.to(bg, { tint: 0x3a3a5a, duration: 0.2 });
      gsap.to(btn.scale, { x: 1.02, y: 1.02, duration: 0.2 });
    });

    btn.on('pointerout', () => {
      gsap.to(bg, { tint: 0xffffff, duration: 0.2 });
      gsap.to(btn.scale, { x: 1, y: 1, duration: 0.2 });
    });

    btn.on('pointertap', () => {
      this.selectAnswer(index);
    });

    btn.bg = bg;
    return btn;
  }

  startQuiz() {
    this.quizActive = true;
    this.currentQuestion = 0;
    this.score = 0;

    this.quizModal.visible = true;
    this.quizCard.alpha = 0;
    this.quizCard.scale.set(0.8);

    gsap.to(this.quizCard, { alpha: 1, duration: 0.3 });
    gsap.to(this.quizCard.scale, { x: 1, y: 1, duration: 0.4, ease: 'back.out' });

    this.showQuestion();
  }

  showQuestion() {
    if (this.currentQuestion >= this.questions.length) {
      this.showResults();
      return;
    }

    const q = this.questions[this.currentQuestion];
    this.questionText.text = q.question;
    this.scoreText.text = `SCORE: ${this.score}`;
    this.progressText.text = `${this.currentQuestion + 1}/${this.questions.length}`;

    this.optionButtons.forEach((btn, i) => {
      const text = btn.getChildByName('text');
      text.text = q.options[i] || '';
      btn.visible = i < q.options.length;
      btn.bg.tint = 0xffffff;
    });
  }

  selectAnswer(index) {
    const q = this.questions[this.currentQuestion];
    const correct = index === q.correct;

    // Visual feedback
    this.optionButtons.forEach((btn, i) => {
      if (i === q.correct) {
        btn.bg.tint = 0x00ff00;
      } else if (i === index && !correct) {
        btn.bg.tint = 0xff0000;
      }
      btn.eventMode = 'none';
    });

    if (correct) {
      this.score++;
      this.scoreText.text = `SCORE: ${this.score}`;
    }

    // Next question after delay
    setTimeout(() => {
      this.currentQuestion++;
      this.optionButtons.forEach(btn => {
        btn.eventMode = 'static';
      });
      this.showQuestion();
    }, 1000);
  }

  showResults() {
    const percentage = Math.round((this.score / this.questions.length) * 100);
    let message = '';

    if (percentage === 100) {
      message = "PERFECT! 💕\nYou know us so well!";
    } else if (percentage >= 80) {
      message = "AMAZING! 🌟\nYou really pay attention!";
    } else if (percentage >= 60) {
      message = "GREAT JOB! ✨\nNot bad at all!";
    } else {
      message = "NICE TRY! 💫\nTime to create more memories!";
    }

    this.questionText.text = `GAME OVER!\n\nScore: ${this.score}/${this.questions.length}\n\n${message}`;

    this.optionButtons.forEach(btn => btn.visible = false);

    // Add replay button
    const replayBtn = this.optionButtons[0];
    const replayText = replayBtn.getChildByName('text');
    replayText.text = 'PLAY AGAIN';
    replayBtn.visible = true;
    replayBtn.bg.tint = 0xff00ff;
    replayBtn.position.set(0, 100);

    replayBtn.off('pointertap');
    replayBtn.on('pointertap', () => {
      this.closeQuiz();
    });
  }

  closeQuiz() {
    gsap.to(this.quizCard, { alpha: 0, duration: 0.2 });
    gsap.to(this.quizCard.scale, {
      x: 0.8, y: 0.8, duration: 0.2, onComplete: () => {
        this.quizModal.visible = false;
        this.quizActive = false;

        // Reset replay button
        const replayBtn = this.optionButtons[0];
        replayBtn.position.set(0, -50);
        replayBtn.off('pointertap');
        replayBtn.on('pointertap', () => this.selectAnswer(0));
      }
    });
  }

  enter() {
    super.enter();
  }

  destroy() {
    gsap.killTweensOf(this.quizCard);
    gsap.killTweensOf(this.quizCard.scale);
    gsap.killTweensOf(this.startText);
    if (this.elements.ceilingLight) {
      gsap.killTweensOf(this.elements.ceilingLight);
    }
    super.destroy();
  }
}
