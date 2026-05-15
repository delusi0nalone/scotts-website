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

  // ── Cart Manager ───────────────────────────────────────────────────────
  const CartManager = {
    items: [],
    
    init() {
      // Load cart from localStorage
      const savedCart = localStorage.getItem('bg_cart');
      if (savedCart) {
        try {
          this.items = JSON.parse(savedCart);
        } catch (e) {
          this.items = [];
        }
      }
      
      this.injectCartUI();
      this.attachEventListeners();
      this.updateUI();
    },

    save() {
      localStorage.setItem('bg_cart', JSON.stringify(this.items));
    },

    addItem(id, name, price) {
      if (!this.items.some(item => item.id === id)) {
        this.items.push({ id, name, price: parseFloat(price) });
        this.save();
        this.updateUI();
      }
    },

    removeItem(id) {
      this.items = this.items.filter(item => item.id !== id);
      this.save();
      this.updateUI();
    },

    injectCartUI() {
      // Inject global cart icon
      const cartIcon = document.createElement('div');
      cartIcon.className = 'global-cart-icon';
      cartIcon.id = 'globalCartIcon';
      cartIcon.setAttribute('aria-label', 'Open Shopping Cart');
      cartIcon.innerHTML = `
        🛒
        <div class="cart-badge" id="cartBadge">0</div>
      `;
      document.body.appendChild(cartIcon);

      // Inject cart modal
      const cartModal = document.createElement('div');
      cartModal.className = 'cart-modal-overlay';
      cartModal.id = 'cartModalOverlay';
      cartModal.innerHTML = `
        <div class="cart-modal-container" role="dialog" aria-modal="true" aria-labelledby="cartModalTitle">
          <div class="cart-modal-header">
            <h2 class="cart-modal-title" id="cartModalTitle">Your Cart</h2>
            <button class="cart-close-btn" id="cartCloseBtn" aria-label="Close Cart">✕</button>
          </div>
          <div class="cart-modal-body" id="cartModalBody">
            <div class="cart-empty-msg">Your cart is empty.</div>
          </div>
          <div class="cart-modal-footer">
            <span class="cart-total-label">Total Estimate:</span>
            <span class="cart-total-price" id="cartTotalPrice">$0.00</span>
          </div>
        </div>
      `;
      document.body.appendChild(cartModal);

      this.iconEl = cartIcon;
      this.badgeEl = document.getElementById('cartBadge');
      this.modalOverlay = cartModal;
      this.modalBody = document.getElementById('cartModalBody');
      this.totalPriceEl = document.getElementById('cartTotalPrice');
      this.closeBtn = document.getElementById('cartCloseBtn');

      // Modal Events
      this.iconEl.addEventListener('click', () => this.openModal());
      this.closeBtn.addEventListener('click', () => this.closeModal());
      this.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) this.closeModal();
      });
    },

    openModal() {
      this.modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // prevent bg scroll
    },

    closeModal() {
      this.modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    },

    attachEventListeners() {
      // Listen to "Add to Cart" buttons on services page
      const addBtns = document.querySelectorAll('.add-to-cart-btn');
      addBtns.forEach(btn => {
        const id = btn.getAttribute('data-id');
        
        // Initial state
        if (this.items.some(item => item.id === id)) {
          btn.classList.add('added');
          btn.textContent = 'Added to Cart ✓';
        }

        btn.addEventListener('click', () => {
          if (!btn.classList.contains('added')) {
            const name = btn.getAttribute('data-name');
            const price = btn.getAttribute('data-price');
            this.addItem(id, name, price);
            btn.classList.add('added');
            btn.textContent = 'Added to Cart ✓';
          }
        });
      });
    },

    updateUI() {
      // Update badge
      const count = this.items.length;
      this.badgeEl.textContent = count;
      if (count > 0) {
        this.iconEl.classList.add('has-items');
      } else {
        this.iconEl.classList.remove('has-items');
      }

      // Update modal list
      if (count === 0) {
        this.modalBody.innerHTML = '<div class="cart-empty-msg">Your cart is empty.</div>';
        this.totalPriceEl.textContent = '$0.00';
      } else {
        let total = 0;
        let html = '';
        this.items.forEach(item => {
          total += item.price;
          html += `
            <div class="cart-item">
              <div class="cart-item-info">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">$${item.price.toFixed(2)}</span>
              </div>
              <button class="cart-item-remove" data-id="${item.id}">Remove</button>
            </div>
          `;
        });
        this.modalBody.innerHTML = html;
        this.totalPriceEl.textContent = '$' + total.toFixed(2);

        // Attach remove events
        const removeBtns = this.modalBody.querySelectorAll('.cart-item-remove');
        removeBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            this.removeItem(id);
            // Reset "Add to Cart" button if we are on the services page
            const addBtn = document.querySelector(`.add-to-cart-btn[data-id="${id}"]`);
            if (addBtn) {
              addBtn.classList.remove('added');
              addBtn.textContent = 'Add to Cart';
            }
          });
        });
      }
    }
  };

  // Initialize Cart Manager
  CartManager.init();

})();
