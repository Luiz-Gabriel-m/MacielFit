/**
 * Studio Maciel / Maciel Fit Academia - Main Application Logic
 * Header stickiness, social wall interactions, smooth navigation, WhatsApp linking.
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

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navLinks.style.display = 'none';
        }
      });
    });
  }

  // 3. Social Wall Likes Interactive Micro-animation
  const likeButtons = document.querySelectorAll('.social-post-card');
  likeButtons.forEach((card) => {
    card.addEventListener('click', () => {
      const likesEl = card.querySelector('.likes-count');
      if (likesEl) {
        let count = parseInt(likesEl.getAttribute('data-likes') || '120');
        if (!card.classList.contains('liked')) {
          count += 1;
          card.classList.add('liked');
          likesEl.innerHTML = `❤️ ${count}`;
          likesEl.style.color = '#ff4d6d';
        }
      }
    });
  });

  // 4. WhatsApp Prefilled Plan Links
  const planButtons = document.querySelectorAll('.btn-plan-select');
  planButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const planName = btn.getAttribute('data-plan') || 'VIP';
      const phone = '5535999999999'; // Default WhatsApp line for Studio Maciel
      const message = encodeURIComponent(`Olá, Studio Maciel! Gostaria de garantir minha vaga no Plano ${planName}. Como posso realizar minha matrícula?`);
      btn.href = `https://wa.me/${phone}?text=${message}`;
    });
  });

  // 5. Intro Revealed Callback: animate hero text
  window.onIntroRevealed = function() {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      heroContent.style.animation = 'fadeInUp 0.8s ease forwards';
    }
  };
});
