/**
 * STUDIO MACIEL / MACIEL FIT ACADEMIA - MAIN APPLICATION CONTROLLER
 * Initializes Lucide icons, GSAP scroll triggers, video sound toggle,
 * floorplan HD renderer, StudioMacielBiomechanics3D engine, 3D plan card tilt, and HUD diagnostics.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Initialize 3D Biomechanics Engine (Based on Deadlift3D Architecture)
  let biomechanics3DInstance = null;
  if (typeof StudioMacielBiomechanics3D !== 'undefined') {
    biomechanics3DInstance = new StudioMacielBiomechanics3D('deadlift-canvas-container');
    window.studioBiomechanics = biomechanics3DInstance;
  }

  // 3. Initialize GSAP & ScrollTrigger Animations
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    setupGSAPAnimations(biomechanics3DInstance);
  }

  // 4. Sticky Header with Glassmorphism on Scroll
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      if (header) {
        header.classList.add('bg-neutral-950/90', 'backdrop-blur-xl', 'border-b', 'border-white/10', 'py-2.5');
        header.classList.remove('py-4');
      }
    } else {
      if (header) {
        header.classList.remove('bg-neutral-950/90', 'backdrop-blur-xl', 'border-b', 'border-white/10', 'py-2.5');
        header.classList.add('py-4');
      }
    }
  }, { passive: true });

  // 5. Mobile Navigation Drawer Toggle
  setupMobileNav();

  // 6. Hero Video Sound Toggle
  setupHeroSound();

  // 7. 3D Card Tilt Effect on Plan Cards
  setupPlanCards3D();

  // 9. Biomechanics HUD Toggle (Key 'H' & Button)
  setupBiomechanicsHUDToggle();

  // 10. Social Wall Likes Interactive Micro-animation
  setupSocialWallLikes();
});

/**
 * GSAP ScrollTrigger Animations
 */
function setupGSAPAnimations(biomechanics3D) {
  gsap.utils.toArray('.section-reveal').forEach((elem) => {
    gsap.from(elem, {
      scrollTrigger: {
        trigger: elem,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 40,
      duration: 0.9,
      ease: 'power2.out'
    });
  });

  // Biomechanics Module ScrollTrigger
  if (biomechanics3D && document.getElementById('deadlift-section')) {
    ScrollTrigger.create({
      trigger: '#deadlift-section',
      start: 'top 70%',
      end: 'bottom 30%',
      onEnter: () => {
        if (!biomechanics3D.isAutoPlaying) {
          gsap.to(biomechanics3D, {
            targetProgress: 0.5,
            duration: 1.3,
            ease: 'power2.out',
            onUpdate: () => biomechanics3D.setPhase(biomechanics3D.targetProgress)
          });
        }
      }
    });
  }
}

/**
 * Mobile Navigation Menu
 */
function setupMobileNav() {
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!mobileToggle || !mobileDrawer) return;

  function toggleMenu(forceClose = false) {
    const isClosed = mobileDrawer.classList.contains('translate-x-full');

    if (!isClosed || forceClose) {
      mobileDrawer.classList.add('translate-x-full', 'opacity-0', 'pointer-events-none');
      mobileDrawer.classList.remove('translate-x-0', 'opacity-100', 'pointer-events-auto');
      document.body.classList.remove('overflow-hidden');
      mobileToggle.innerHTML = '<i data-lucide="menu" class="w-6 h-6"></i>';
    } else {
      mobileDrawer.classList.remove('translate-x-full', 'opacity-0', 'pointer-events-none');
      mobileDrawer.classList.add('translate-x-0', 'opacity-100', 'pointer-events-auto');
      document.body.classList.add('overflow-hidden');
      mobileToggle.innerHTML = '<i data-lucide="x" class="w-6 h-6 text-gold-maciel"></i>';
    }
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  mobileToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      toggleMenu(true);
    });
  });

  document.addEventListener('click', (e) => {
    if (!mobileDrawer.contains(e.target) && !mobileToggle.contains(e.target)) {
      toggleMenu(true);
    }
  });
}

/**
 * Hero Background Video Sound Toggle
 */
function setupHeroSound() {
  const soundBtn = document.getElementById('hero-sound-btn');
  const heroVideo = document.getElementById('hero-bg-video');
  const iconMuted = document.getElementById('sound-icon-muted');
  const iconUnmuted = document.getElementById('sound-icon-unmuted');
  const soundText = document.getElementById('sound-text');

  if (soundBtn && heroVideo) {
    soundBtn.addEventListener('click', () => {
      heroVideo.muted = !heroVideo.muted;
      if (heroVideo.muted) {
        if (iconMuted) iconMuted.style.display = 'block';
        if (iconUnmuted) iconUnmuted.style.display = 'none';
        if (soundText) soundText.textContent = 'Ativar Som';
      } else {
        if (iconMuted) iconMuted.style.display = 'none';
        if (iconUnmuted) iconUnmuted.style.display = 'block';
        if (soundText) soundText.textContent = 'Silenciar';
      }
    });
  }
}

/**
 * 3D Tilt Effect on Plan Cards with Specular Light Glare
 */
function setupPlanCards3D() {
  const planCards = document.querySelectorAll('.plan-card-3d');
  if (!planCards.length) return;

  const isFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (!isFinePointer || window.innerWidth <= 1024) return;

  planCards.forEach((card) => {
    const glare = card.querySelector('.plan-card-glare');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      if (glare) {
        glare.style.opacity = '1';
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 215, 0, 0.18) 0%, transparent 65%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      if (glare) {
        glare.style.opacity = '0';
      }
    });
  });
}

/**
 * Biomechanics HUD Toggle (Button & Keyboard 'H')
 */
function setupBiomechanicsHUDToggle() {
  const toggleBtn = document.getElementById('deadlift-hud-toggle');
  const hudCard = document.getElementById('deadlift-hud-card');
  if (!toggleBtn || !hudCard) return;

  let isVisible = true;

  function setHUDState(visible) {
    isVisible = visible;
    if (visible) {
      hudCard.classList.remove('opacity-0', '-translate-y-2', 'pointer-events-none');
      hudCard.classList.add('opacity-100', 'translate-y-0');
      toggleBtn.innerHTML = '<i data-lucide="eye" class="w-3.5 h-3.5"></i> <span>Ocultar Fases</span>';
      toggleBtn.classList.remove('border-gold-500/40', 'text-gold-300');
      toggleBtn.classList.add('border-white/15', 'text-gray-300');
    } else {
      hudCard.classList.remove('opacity-100', 'translate-y-0');
      hudCard.classList.add('opacity-0', '-translate-y-2', 'pointer-events-none');
      toggleBtn.innerHTML = '<i data-lucide="eye-off" class="w-3.5 h-3.5"></i> <span>Exibir Fases</span>';
      toggleBtn.classList.remove('border-white/15', 'text-gray-300');
      toggleBtn.classList.add('border-gold-500/40', 'text-gold-300');
    }
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    setHUDState(!isVisible);
  });

  window.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement;
    const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
    if (isInput) return;

    if (e.key === 'h' || e.key === 'H') {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();
      setHUDState(!isVisible);
    }
  });
}

/**
 * Social Wall Likes Interaction
 */
function setupSocialWallLikes() {
  const likeCards = document.querySelectorAll('.social-post-card');
  likeCards.forEach((card) => {
    card.addEventListener('click', () => {
      const likesEl = card.querySelector('.likes-count');
      if (likesEl && !card.classList.contains('liked')) {
        let count = parseInt(likesEl.getAttribute('data-likes') || '250', 10);
        count += 1;
        card.classList.add('liked');
        likesEl.innerHTML = `❤️ ${count} curtidas`;
        likesEl.style.color = '#ffd700';
      }
    });
  });
}

// Intro Revealed callback
window.onIntroRevealed = function() {
  if (typeof gsap !== 'undefined') {
    gsap.from('.hero-section h1, .hero-section p, .hero-section .tech-badge', {
      opacity: 0,
      y: 30,
      stagger: 0.12,
      duration: 0.9,
      ease: 'power3.out'
    });
  }
};
