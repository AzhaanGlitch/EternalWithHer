// src/core/SceneManager.jsx
import gsap from 'gsap';
import { SCENES } from './constants.jsx';
import HouseScene from '../scenes/HouseScene.jsx';
import InteriorScene from '../scenes/InteriorScene.jsx';
import LivingRoom from '../scenes/rooms/LivingRoom.jsx';
import BedroomRoom from '../scenes/rooms/BedroomRoom.jsx';
import KitchenRoom from '../scenes/rooms/KitchenRoom.jsx';
import GamingRoom from '../scenes/rooms/GamingRoom.jsx';
import DanceRoom from '../scenes/rooms/DanceRoom.jsx';
import StudyRoom from '../scenes/rooms/StudyRoom.jsx';
import GardenRoom from '../scenes/rooms/GardenRoom.jsx';
import GardenSittingArea from '../scenes/rooms/GardenSittingArea.jsx';
import GardenPath from '../scenes/rooms/GardenPath.jsx';
import Balcony from '../scenes/rooms/Balcony.jsx';

export default class SceneManager {
  constructor(app) {
    this.app = app;
    this.currentScene = null;
    this.transitioning = false;
    this.sceneHistory = [];
  }

  createScene(sceneName) {
    switch (sceneName) {
      case SCENES.HOUSE:
        return new HouseScene(this);
      case SCENES.INTERIOR:
        return new InteriorScene(this);
      case SCENES.LIVING:
        return new LivingRoom(this);
      case SCENES.BEDROOM:
        return new BedroomRoom(this);
      case SCENES.BALCONY:
        return new Balcony(this);
      case SCENES.KITCHEN:
        return new KitchenRoom(this);
      case SCENES.GAMING:
        return new GamingRoom(this);
      case SCENES.DANCE:
        return new DanceRoom(this);
      case SCENES.STUDY:
        return new StudyRoom(this);
      case SCENES.GARDEN:
        return new GardenRoom(this);
      case SCENES.GARDEN_SITTING:
        return new GardenSittingArea(this);
      case SCENES.GARDEN_PATH:
        return new GardenPath(this);
      default:
        console.warn(`Unknown scene: ${sceneName}`);
        return null;
    }
  }

  async change(sceneName, options = {}) {
    if (this.transitioning) return;

    const { transition = 'fade', duration = 0.5, addToHistory = true } = options;

    this.transitioning = true;
    console.log(`Changing scene to: ${sceneName}`, options);

    // Exit current scene with transition
    if (this.currentScene) {
      await this.transitionOut(transition, duration);

      if (typeof this.currentScene.exit === 'function') {
        this.currentScene.exit();
      }

      this.currentScene.destroy();
      this.app.stage.removeChildren();
    }

    // Add to history if not going back
    if (addToHistory && this.currentScene) {
      this.sceneHistory.push(this.currentSceneName);
    }

    // Create and enter new scene
    this.currentSceneName = sceneName;
    this.currentScene = this.createScene(sceneName);

    if (!this.currentScene) {
      this.transitioning = false;
      return;
    }

    // Initialize the scene
    if (typeof this.currentScene.init === 'function') {
      await this.currentScene.init();
    }

    this.app.stage.addChild(this.currentScene.container);

    // Enter the scene
    if (typeof this.currentScene.enter === 'function') {
      this.currentScene.enter();
    }

    // Transition in
    await this.transitionIn(transition, duration);

    this.transitioning = false;

    // Emit scene change event
    window.dispatchEvent(new CustomEvent('sceneChange', {
      detail: { scene: sceneName }
    }));
  }

  async goBack() {
    if (this.sceneHistory.length > 0) {
      const previousScene = this.sceneHistory.pop();
      await this.change(previousScene, { addToHistory: false });
    }
  }

  canGoBack() {
    return this.sceneHistory.length > 0;
  }

  transitionOut(type, duration) {
    return new Promise((resolve) => {
      if (!this.currentScene) {
        resolve();
        return;
      }

      const container = this.currentScene.container;
      const timeline = gsap.timeline({ onComplete: resolve });

      switch (type) {
        case 'fade':
          timeline.to(container, { alpha: 0, duration, ease: 'power2.in' });
          break;
        case 'slideLeft':
          timeline.to(container, { x: -window.innerWidth, duration, ease: 'power2.in' });
          break;
        case 'slideRight':
          timeline.to(container, { x: window.innerWidth, duration, ease: 'power2.in' });
          break;
        case 'scale':
          timeline.to(container, { alpha: 0, scale: 0.8, duration, ease: 'power2.in' });
          break;
        case 'zoom':
          timeline.to(container, { alpha: 0, scale: 1.5, duration, ease: 'power2.in' });
          break;
        default:
          resolve();
      }
    });
  }

  transitionIn(type, duration) {
    return new Promise((resolve) => {
      if (!this.currentScene) {
        resolve();
        return;
      }

      const container = this.currentScene.container;
      const timeline = gsap.timeline({ onComplete: resolve });

      switch (type) {
        case 'fade':
          container.alpha = 0;
          timeline.to(container, { alpha: 1, duration, ease: 'power2.out' });
          break;
        case 'slideLeft':
          container.x = window.innerWidth;
          timeline.to(container, { x: 0, duration, ease: 'power2.out' });
          break;
        case 'slideRight':
          container.x = -window.innerWidth;
          timeline.to(container, { x: 0, duration, ease: 'power2.out' });
          break;
        case 'scale':
          container.alpha = 0;
          container.scale.set(1.2);
          timeline.to(container, { alpha: 1, scale: 1, duration, ease: 'power2.out' });
          break;
        case 'zoom':
          container.alpha = 0;
          container.scale.set(0.5);
          timeline.to(container, { alpha: 1, scale: 1, duration, ease: 'back.out' });
          break;
        default:
          resolve();
      }
    });
  }

  update(delta) {
    if (this.currentScene && typeof this.currentScene.update === 'function') {
      this.currentScene.update(delta);
    }
  }

  destroy() {
    if (this.currentScene) {
      if (typeof this.currentScene.exit === 'function') {
        this.currentScene.exit();
      }
      this.currentScene.destroy();
      this.currentScene = null;
    }
    this.sceneHistory = [];
  }
}
