/**
 * STUDIO MACIEL - INTRO SCREEN & 3D CHARACTER TRANSITION
 * Deep Teal (#076b77) preloader with isolated pulsing golden dumbbell symbol
 * and an interactive 3D animated lifter character that tosses the screen up on scroll/drag.
 */

class IntroScreenManager {
  constructor() {
    this.screen = document.getElementById('intro-screen');
    if (!this.screen) return;

    this.pullBtn = document.getElementById('pull-handle-btn');
    this.skipBtn = document.getElementById('skip-intro-btn');
    this.replayBtn = document.getElementById('replay-intro-btn');
    this.lifterContainer = document.getElementById('intro-lifter-container');

    this.isTossed = false;
    this.startY = 0;
    this.currentY = 0;
    this.isDragging = false;
    this.audioCtx = null;

    // 3D Lifter Scene
    this.lifterScene = null;
    this.lifterCamera = null;
    this.lifterRenderer = null;
    this.lifterCharGroup = null;
    this.lifterBarbell = null;
    this.lifterAnimPhase = 0; // 0 = idle, 1 = squat/prep, 2 = explosive toss
    this.lifterTime = 0;

    this.init();
    this.init3DLifter();
  }

  init() {
    // Button triggers
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

    // Scroll Wheel Trigger
    window.addEventListener('wheel', (e) => {
      if (!this.isTossed && e.deltaY > 15) {
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

  /**
   * Initializes a 3D stylized athletic character holding a barbell in Three.js
   * Performing an exercise animation (squat & overhead toss)
   */
  init3DLifter() {
    if (!this.lifterContainer || typeof THREE === 'undefined') return;

    const width = this.lifterContainer.clientWidth || 320;
    const height = this.lifterContainer.clientHeight || 220;

    this.lifterScene = new THREE.Scene();
    this.lifterCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    this.lifterCamera.position.set(0, 1.2, 3.8);
    this.lifterCamera.lookAt(0, 0.7, 0);

    this.lifterRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.lifterRenderer.setSize(width, height);
    this.lifterRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.lifterContainer.appendChild(this.lifterRenderer.domElement);

    // Warm golden & teal lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.lifterScene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffd700, 1.5);
    dirLight.position.set(2, 4, 3);
    this.lifterScene.add(dirLight);

    const tealRim = new THREE.DirectionalLight(0x00e5ff, 1.2);
    tealRim.position.set(-2, 2, -2);
    this.lifterScene.add(tealRim);

    // Build Athletic 3D Character Group
    this.lifterCharGroup = new THREE.Group();

    // Metallic Gold & Dark Carbon Materials
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.85,
      roughness: 0.2
    });
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x141416,
      metalness: 0.4,
      roughness: 0.5
    });
    const tealMat = new THREE.MeshStandardMaterial({
      color: 0x076b77,
      metalness: 0.6,
      roughness: 0.3
    });

    // 1. Torso
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.55, 16);
    this.lifterTorso = new THREE.Mesh(torsoGeo, tealMat);
    this.lifterTorso.position.y = 0.85;
    this.lifterCharGroup.add(this.lifterTorso);

    // Chest & abs plates
    const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.2, 0.08), goldMat);
    chestPlate.position.set(0, 0.98, 0.12);
    this.lifterCharGroup.add(chestPlate);

    // 2. Head
    const headGeo = new THREE.SphereGeometry(0.14, 20, 20);
    this.lifterHead = new THREE.Mesh(headGeo, goldMat);
    this.lifterHead.position.y = 1.3;
    this.lifterCharGroup.add(this.lifterHead);

    // 3. Legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.55, 12);
    this.lifterLegL = new THREE.Mesh(legGeo, carbonMat);
    this.lifterLegL.position.set(-0.16, 0.35, 0);
    this.lifterCharGroup.add(this.lifterLegL);

    this.lifterLegR = new THREE.Mesh(legGeo, carbonMat);
    this.lifterLegR.position.set(0.16, 0.35, 0);
    this.lifterCharGroup.add(this.lifterLegR);

    // 4. Arms holding barbell
    const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.42, 12);
    this.lifterArmL = new THREE.Mesh(armGeo, goldMat);
    this.lifterArmL.position.set(-0.35, 0.92, 0.12);
    this.lifterArmL.rotation.x = -Math.PI / 4;
    this.lifterCharGroup.add(this.lifterArmL);

    this.lifterArmR = new THREE.Mesh(armGeo, goldMat);
    this.lifterArmR.position.set(0.35, 0.92, 0.12);
    this.lifterArmR.rotation.x = -Math.PI / 4;
    this.lifterCharGroup.add(this.lifterArmR);

    // 5. Olympic Barbell
    this.lifterBarbell = new THREE.Group();
    const barMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.4, 16), carbonMat);
    barMesh.rotation.z = Math.PI / 2;
    this.lifterBarbell.add(barMesh);

    // Gold bumper plates
    [-0.58, 0.58].forEach((x) => {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 24), goldMat);
      plate.rotation.z = Math.PI / 2;
      plate.position.x = x;
      this.lifterBarbell.add(plate);
    });

    this.lifterBarbell.position.set(0, 1.05, 0.22);
    this.lifterCharGroup.add(this.lifterBarbell);

    // Glowing base pedestal ring
    const ringGeo = new THREE.RingGeometry(0.65, 0.72, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.02;
    this.lifterCharGroup.add(ring);

    this.lifterScene.add(this.lifterCharGroup);

    // Resize listener
    window.addEventListener('resize', () => {
      if (!this.lifterContainer || !this.lifterRenderer || !this.lifterCamera) return;
      const w = this.lifterContainer.clientWidth;
      const h = this.lifterContainer.clientHeight;
      if (w > 0 && h > 0) {
        this.lifterCamera.aspect = w / h;
        this.lifterCamera.updateProjectionMatrix();
        this.lifterRenderer.setSize(w, h);
      }
    });

    // Start 3D loop
    this.animate3DLifter();
  }

  animate3DLifter() {
    if (!this.lifterRenderer || !this.lifterScene || !this.lifterCamera) return;

    requestAnimationFrame(() => this.animate3DLifter());

    this.lifterTime += 0.035;

    if (this.lifterAnimPhase === 0) {
      // Idle athletic breathing & gentle barbell shrug
      const bob = Math.sin(this.lifterTime * 2) * 0.03;
      this.lifterCharGroup.position.y = bob;
      if (this.lifterBarbell) {
        this.lifterBarbell.position.y = 1.05 + bob * 1.5;
      }
    } else if (this.lifterAnimPhase === 1) {
      // Squatting down preparing to launch
      this.lifterCharGroup.position.y = -0.22;
      if (this.lifterBarbell) {
        this.lifterBarbell.position.y = 0.85;
      }
    } else if (this.lifterAnimPhase === 2) {
      // Explosive upward snatch / push press
      this.lifterCharGroup.position.y = 0.45;
      if (this.lifterBarbell) {
        this.lifterBarbell.position.y += 0.08;
      }
    }

    this.lifterRenderer.render(this.lifterScene, this.lifterCamera);
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
      osc.frequency.setValueAtTime(180, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, this.audioCtx.currentTime + 0.4);

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
    this.lifterAnimPhase = 1; // Deep squat prep
    this.screen.classList.add('grabbing');
  }

  onDragMove(y) {
    if (!this.isDragging || this.isTossed) return;
    this.currentY = y;
    const delta = this.startY - this.currentY;

    if (delta > 35) {
      this.isDragging = false;
      this.triggerTossAnimation();
    }
  }

  onDragEnd() {
    if (this.isTossed) return;
    this.isDragging = false;
    this.lifterAnimPhase = 0; // Return to idle
    if (this.screen) this.screen.classList.remove('grabbing');
  }

  triggerTossAnimation() {
    if (this.isTossed) return;
    this.isTossed = true;

    // Trigger explosive 3D lifter upward thrust
    this.lifterAnimPhase = 2;

    this.playWhooshAudio();

    if (this.screen) {
      this.screen.classList.add('tossed-away');
    }

    document.body.style.overflow = 'auto';

    // Start background video if paused
    const video = document.querySelector('.hero-bg-video') || document.getElementById('hero-bg-video');
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

    const video = document.querySelector('.hero-bg-video') || document.getElementById('hero-bg-video');
    if (video && video.paused) {
      video.play().catch(() => {});
    }

    if (window.onIntroRevealed) {
      window.onIntroRevealed();
    }
  }

  resetAndPlay() {
    this.isTossed = false;
    this.lifterAnimPhase = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (this.screen) {
      this.screen.classList.remove('tossed-away');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.introManager = new IntroScreenManager();
});
