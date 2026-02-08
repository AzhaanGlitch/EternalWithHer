// src/core/Game.js
import * as PIXI from 'pixi.js';
import SceneManager from './SceneManager';
import { SCENES } from './constants';

export default class Game {
  constructor(container) {
    this.app = new PIXI.Application();
    this.container = container;
    this.isRunning = false;

    this.app.init({
      resizeTo: window,
      backgroundColor: 0x0a0a0a,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    }).then(() => {
      container.appendChild(this.app.canvas);

      // Set up the scene manager
      this.sceneManager = new SceneManager(this.app);
      
      // Start the update loop
      this.isRunning = true;
      this.app.ticker.add(this.update.bind(this));

      // Change to the initial scene
      this.sceneManager.change(SCENES.CURTAIN);

      // Handle window resize
      window.addEventListener('resize', this.handleResize.bind(this));
    });
  }

  update(ticker) {
    if (!this.isRunning || !this.sceneManager) return;
    
    const delta = ticker.deltaTime;
    this.sceneManager.update(delta);
  }

  handleResize() {
    if (this.sceneManager && this.sceneManager.currentScene) {
      if (typeof this.sceneManager.currentScene.resize === 'function') {
        this.sceneManager.currentScene.resize();
      }
    }
  }

  destroy() {
    this.isRunning = false;
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    if (this.sceneManager) {
      this.sceneManager.destroy();
      this.sceneManager = null;
    }
    
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true });
      this.app = null;
    }
  }
}
