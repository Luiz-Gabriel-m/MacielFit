/**
 * Studio Maciel - Interactive Intro Screen (Preloader & Transition)
 * Pure, luxury entrance animation with smooth upward slide & sound synthesis.
 */

class IntroScreenManager {
  constructor() {
    this.screen = document.getElementById('intro-screen');
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

    // Keyboard Space, Enter or Down Arrow
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
      osc.frequency.setValueAtTime(160, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.audioCtx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.4);
    } catch (err) {
      // Audio autoplay fallback
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

    if (Math.abs(delta) > 50) {
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

    if (this.screen) {
      this.screen.classList.add('tossed-away');
    }

    document.body.style.overflow = 'auto';

    // Start background video if paused
    const video = document.querySelector('.hero-bg-video');
    if (video && video.paused) {
      video.play().catch(() => {});
    }

    // Trigger hero animations
    if (window.onIntroRevealed) {
      window.onIntroRevealed();
    }
  }

  instantSkip() {
    this.isTossed = true;
    if (this.screen) {
      this.screen.classList.add('tossed-away');
    }
    document.body.style.overflow = 'auto';

    const video = document.querySelector('.hero-bg-video');
    if (video && video.paused) {
      video.play().catch(() => {});
    }

    if (window.onIntroRevealed) {
      window.onIntroRevealed();
    }
  }

  resetAndPlay() {
    this.isTossed = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (this.screen) {
      this.screen.classList.remove('tossed-away');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.introManager = new IntroScreenManager();
});
