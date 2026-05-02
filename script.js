/**
 * Barrows Guitars — Main Script
 * Handles: hamburger menu toggle, overlay, keyboard nav, body scroll lock
 */

(function () {
  'use strict';

  const hamburger   = document.getElementById('hamburgerBtn');
  const sideNav     = document.getElementById('sideNav');
  const overlay     = document.getElementById('menuOverlay');
  const closeBtn    = document.getElementById('navClose');

  if (!hamburger || !sideNav || !overlay) return;

  // ── Open / Close helpers ──────────────────────────────────────────
  function openMenu() {
    sideNav.classList.add('open');
    overlay.classList.add('active');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    overlay.setAttribute('aria-hidden', 'false');
    // Prevent background scroll on mobile
    document.body.style.overflow = 'hidden';
    // Focus first link for keyboard users
    const firstLink = sideNav.querySelector('.nav-link');
    if (firstLink) setTimeout(() => firstLink.focus(), 400);
  }

  function closeMenu() {
    sideNav.classList.remove('open');
    overlay.classList.remove('active');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  // ── Event Listeners ───────────────────────────────────────────────
  hamburger.addEventListener('click', () => {
    const isOpen = sideNav.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  overlay.addEventListener('click', closeMenu);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sideNav.classList.contains('open')) {
      closeMenu();
    }
  });

  // Trap focus within nav when open
  sideNav.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = sideNav.querySelectorAll(
      'a[href], button, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // ── Subtle background parallax on desktop ────────────────────────
  const bgImage = document.querySelector('.bg-image');
  if (bgImage && window.matchMedia('(min-width: 1024px)').matches) {
    document.addEventListener('mousemove', (e) => {
      const xFrac = (e.clientX / window.innerWidth  - 0.5) * 0.012;
      const yFrac = (e.clientY / window.innerHeight - 0.5) * 0.012;
      bgImage.style.transform = `scale(1.05) translate(${xFrac * 100}%, ${yFrac * 100}%)`;
    });
  }

  // ── Mark active nav link based on current page ───────────────────
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = sideNav.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPath) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

})();
