/**
 * Studio Maciel / Maciel Fit Academia - Main Application Logic
 * Header stickiness, social wall interactions, smooth navigation, WhatsApp linking,
 * floorplan HD render switcher, and anatomical reference artwork modal.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navigation on Scroll
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // 2. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const isVisible = navLinks.style.display === 'flex';
      navLinks.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'rgba(10, 15, 19, 0.98)';
        navLinks.style.padding = '24px';
        navLinks.style.borderBottom = '1px solid var(--border-gold)';
      }
    });

    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navLinks.style.display = 'none';
        }
      });
    });
  }

  // 3. Hero Video Sound Toggle
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

  // 4. Floorplan 3D Maquette & HD Render Switcher
  const btnViewHd = document.getElementById('btn-view-hd');
  const btnViewIso = document.getElementById('btn-view-iso');
  const btnViewTop = document.getElementById('btn-view-top');
  const btnViewReset = document.getElementById('btn-view-reset');
  const hdOverlay = document.getElementById('floorplan-hd-overlay');
  const hintBadge = document.getElementById('floorplan-hint-badge');

  if (btnViewHd && hdOverlay) {
    btnViewHd.addEventListener('click', () => {
      hdOverlay.style.display = 'flex';
      document.querySelectorAll('.floorplan-tool-btn').forEach((b) => b.classList.remove('active'));
      btnViewHd.classList.add('active');
      if (hintBadge) hintBadge.style.display = 'none';
    });

    [btnViewIso, btnViewTop, btnViewReset].forEach((btn) => {
      if (btn) {
        btn.addEventListener('click', () => {
          hdOverlay.style.display = 'none';
          if (btnViewHd) btnViewHd.classList.remove('active');
          if (hintBadge) hintBadge.style.display = 'flex';
        });
      }
    });
  }

  // 5. 3D Muscle Explorer - Anatomical Reference Artwork Modal
  const btnToggleAnatomy = document.getElementById('btn-toggle-anatomy-ref');
  const anatomyOverlay = document.getElementById('anatomy-ref-overlay');
  const btnCloseAnatomy = document.getElementById('close-anatomy-ref');

  if (btnToggleAnatomy && anatomyOverlay) {
    btnToggleAnatomy.addEventListener('click', () => {
      const isVisible = anatomyOverlay.style.display === 'flex';
      anatomyOverlay.style.display = isVisible ? 'none' : 'flex';
      btnToggleAnatomy.classList.toggle('active', !isVisible);
    });
  }

  if (btnCloseAnatomy && anatomyOverlay) {
    btnCloseAnatomy.addEventListener('click', () => {
      anatomyOverlay.style.display = 'none';
      if (btnToggleAnatomy) btnToggleAnatomy.classList.remove('active');
    });
  }

  // 6. Social Wall Likes Interactive Micro-animation
  const likeCards = document.querySelectorAll('.social-post-card');
  likeCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      const likesEl = card.querySelector('.likes-count');
      if (likesEl && !card.classList.contains('liked')) {
        let count = parseInt(likesEl.getAttribute('data-likes') || '120');
        count += 1;
        card.classList.add('liked');
        likesEl.innerHTML = `❤️ ${count} curtidas`;
        likesEl.style.color = '#ff4d6d';
      }
    });
  });

  // 7. WhatsApp Prefilled Plan Links
  const planButtons = document.querySelectorAll('.btn-plan-select');
  planButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const planName = btn.getAttribute('data-plan') || 'VIP';
      const phone = '5535999999999';
      const message = encodeURIComponent(`Olá, Studio Maciel! Gostaria de garantir minha vaga no Plano ${planName}. Como posso realizar minha matrícula?`);
      btn.href = `https://wa.me/${phone}?text=${message}`;
    });
  });

  // 8. Intro Revealed Callback
  window.onIntroRevealed = function() {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      heroContent.style.animation = 'fadeInUp 0.8s ease forwards';
    }
  };
});
