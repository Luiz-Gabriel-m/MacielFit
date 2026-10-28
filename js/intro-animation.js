/**
 * Studio Maciel - Interactive Intro Screen & 3D Character Toss Animation
 * Handles drag, scroll, touch gestures, and 3D screen toss physics.
 */

class IntroScreenManager {
  constructor() {
    this.screen = document.getElementById('intro-screen');
    this.mascotStage = document.querySelector('.mascot-image-wrapper');
    this.pullBtn = document.getElementById('pull-handle-btn');
    this.skipBtn = document.getElementById('skip-intro-btn');
    this.replayBtn = document.getElementById('replay-intro-btn');
    
    this.isTossed = false;
    this.startY = 0;
    this.currentY = 0;
    this.isDragging = false;
    this.audioCtx = null;

    this.init();
  }

  init() {
    if (!this.screen) return;

    // Button Triggers
    if (this.pullBtn) {
      this.pullBtn.addEventListener('click', () => this.triggerTossAnimation());
    }

    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.instantSkip();
      });
    }

    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => this.resetAndPlay());
    }

    // Wheel Scroll trigger
    window.addEventListener('wheel', (e) => {
      if (!this.isTossed && e.deltaY > 20) {
        this.triggerTossAnimation();
      }
    }, { passive: true });

    // Touch & Drag Gestures
    this.screen.addEventListener('mousedown', (e) => this.onDragStart(e.clientY));
    window.addEventListener('mousemove', (e) => this.onDragMove(e.clientY));
    window.addEventListener('mouseup', () => this.onDragEnd());

    this.screen.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) this.onDragStart(e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) this.onDragMove(e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchend', () => this.onDragEnd());

    // Keyboard Space or Down Arrow
    window.addEventListener('keydown', (e) => {
      if (!this.isTossed && (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter')) {
        this.triggerTossAnimation();
      }
    });
  }

  playWhooshAudio() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(560, this.audioCtx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.45);
    } catch (err) {
      // Audio autoplay policy fallback
    }
  }

  onDragStart(y) {
    if (this.isTossed) return;
    this.isDragging = true;
    this.startY = y;
    this.screen.classList.add('grabbing');
  }

  onDragMove(y) {
    if (!this.isDragging || this.isTossed) return;
    this.currentY = y;
    const delta = this.currentY - this.startY;

    // If dragged downward or upward beyond threshold
    if (Math.abs(delta) > 55) {
      this.isDragging = false;
      this.triggerTossAnimation();
    }
  }

  onDragEnd() {
    this.isDragging = false;
    if (this.screen) this.screen.classList.remove('grabbing');
  }

  triggerTossAnimation() {
    if (this.isTossed) return;
    this.isTossed = true;

    this.playWhooshAudio();

    // Trigger mascot squat & explosive lift animation
    if (this.mascotStage) {
      this.mascotStage.classList.add('mascot-squatting');
    }

    // Delay physical toss slightly so the squat load phase is visible
    setTimeout(() => {
      if (this.screen) {
        this.screen.classList.add('tossed-away');
      }

      // Re-enable document scrolling
      document.body.style.overflow = 'auto';

      // Animate Hero Elements into view
      if (window.onIntroRevealed) {
        window.onIntroRevealed();
      }
    }, 450);
  }

  instantSkip() {
    this.isTossed = true;
    if (this.screen) {
      this.screen.classList.add('tossed-away');
    }
    document.body.style.overflow = 'auto';
    if (window.onIntroRevealed) {
      window.onIntroRevealed();
    }
  }

  resetAndPlay() {
    this.isTossed = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (this.screen) {
      this.screen.classList.remove('tossed-away');
      if (this.mascotStage) {
        this.mascotStage.classList.remove('mascot-squatting');
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.introManager = new IntroScreenManager();
});
