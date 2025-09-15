/* LocksmithNavigation — unified, fixed, accessible nav + mobile menu script */
class LocksmithNavigation {
  constructor() {
    // Mobile menu elements (expects HTML with #mobileMenu, .overlay, .menu-content)
    this.mobileMenu = document.getElementById('mobileMenu');
    // Prefer explicit ID button, fallback to old onclick selector for legacy markup
    this.mobileMenuButton = document.getElementById('mobileMenuButton') ||
                            document.querySelector('[onclick="toggleMobileMenu()"]') ||
                            document.querySelector('[data-mobile-menu-button]');
    this.closeButton = document.getElementById('closeMobileMenu') || this.mobileMenu?.querySelector('[data-close]');
    this.activeSubmenu = null;
    this.isAnimating = false;
    this.closeTimeout = null;

    // desktop dropdown hover timeout store
    this._hoverTimeouts = new WeakMap();

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupDesktopDropdowns();
    this.setupKeyboardNavigation();
    this.setupTouchHandling();
    this.setupScrollBehavior(); // only toggles shadow; nav remains visible
    this.handleInitialTransforms();
  }

  // Ensure menu-content starts off-screen
  handleInitialTransforms() {
    if (this.mobileMenu) {
      const menuContent = this.mobileMenu.querySelector('.menu-content');
      if (menuContent) {
        menuContent.style.transform = 'translateX(-100%)';
        menuContent.style.transition = 'transform 300ms ease';
      }
    }
  }

  setupEventListeners() {
    // Mobile open
    if (this.mobileMenuButton) {
      this.mobileMenuButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMobileMenu();
      });
    }

    // Mobile close button
    if (this.closeButton) {
      this.closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeMobileMenu();
      });
    }

    // Overlay click (expects .overlay inside #mobileMenu)
    const overlay = this.mobileMenu?.querySelector('.overlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.closeMobileMenu());
    }

    // Prevent clicking inside menu content from bubbling to overlay
    const menuContent = this.mobileMenu?.querySelector('.menu-content');
    if (menuContent) {
      menuContent.addEventListener('click', (e) => e.stopPropagation());
    }

    // Mobile submenu toggles (legacy inline onclicks replaced with data attr or id)
    // Buttons in your HTML should call toggleSubmenu('services') / toggleSubmenu('areas')
    // or have data-submenu="services"
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-submenu]');
      if (btn) {
        e.preventDefault();
        const id = btn.getAttribute('data-submenu');
        if (id) this.toggleSubmenu(id);
      }
    });

    // Close menus on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAllMenus();
    });

    // Window resize: close mobile menu when switching to desktop
    window.addEventListener('resize', () => this.handleResize());
  }

  setupDesktopDropdowns() {
    // Desktop groups: look for elements with .group (your markup uses .group)
    const groups = document.querySelectorAll('.group');
    groups.forEach(group => {
      const trigger = group.querySelector('button, a');
      const dropdown = group.querySelector('.absolute, .dropdown, [data-dropdown]'); // flexible selectors
      if (!trigger || !dropdown) return;

      let timeoutId = null;

      group.addEventListener('mouseenter', () => {
        clearTimeout(timeoutId);
        this.showDropdown(dropdown);
      });

      group.addEventListener('mouseleave', () => {
        timeoutId = setTimeout(() => this.hideDropdown(dropdown), 150);
      });

      // keyboard toggling
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleDropdown(dropdown);
        }
      });

      // store so we can clear later if needed
      this._hoverTimeouts.set(group, () => clearTimeout(timeoutId));
    });
  }

  setupKeyboardNavigation() {
    // Trap Tab focus only when mobile menu is active
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && this.mobileMenu?.classList.contains('active')) {
        this.trapFocus(e);
      }
    });
  }

  setupTouchHandling() {
    // Swipe left to close menu
    let touchStartX = 0;
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, {passive:true});

    document.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = Math.abs(touchEndY - touchStartY);
      if (deltaX < -50 && deltaY < 100 && this.mobileMenu?.classList.contains('active')) {
        this.closeMobileMenu();
      }
    });
  }

  setupScrollBehavior() {
    // Keep nav visible; only toggle shadow for visual cue
    const nav = document.querySelector('nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) nav.classList.add('shadow-lg');
      else nav.classList.remove('shadow-lg');
    }, {passive:true});
  }

  // ------------ Mobile menu open/close ------------
  toggleMobileMenu() {
    if (this.isAnimating) return;
    if (!this.mobileMenu) return;
    if (this.mobileMenu.classList.contains('active')) this.closeMobileMenu();
    else this.openMobileMenu();
  }

  openMobileMenu() {
    if (this.isAnimating || !this.mobileMenu) return;
    this.isAnimating = true;

    // show wrapper
    this.mobileMenu.style.display = 'block';
    // lock page scroll
    document.body.style.overflow = 'hidden';

    const menuContent = this.mobileMenu.querySelector('.menu-content');
    if (menuContent) {
      // use rAF to ensure transform change triggers transition
      requestAnimationFrame(() => {
        menuContent.style.transform = 'translateX(0)';
      });
    }

    this.mobileMenu.classList.add('active');

    // clear any pending close timeout
    clearTimeout(this.closeTimeout);
    this.closeTimeout = setTimeout(() => {
      this.isAnimating = false;
      // focus first interactive element
      const first = this.mobileMenu.querySelector('button, a, [tabindex]:not([tabindex="-1"])');
      if (first) first.focus();
    }, 310);
  }

  closeMobileMenu() {
    if (this.isAnimating || !this.mobileMenu) return;
    this.isAnimating = true;

    // restore page scroll
    document.body.style.overflow = '';

    const menuContent = this.mobileMenu.querySelector('.menu-content');
    if (menuContent) {
      menuContent.style.transform = 'translateX(-100%)';
    }

    clearTimeout(this.closeTimeout);
    this.closeTimeout = setTimeout(() => {
      this.mobileMenu.classList.remove('active');
      // hide wrapper to allow clicks through
      this.mobileMenu.style.display = 'none';
      this.isAnimating = false;
      // also close any open submenus
      this.closeAllSubmenus();
    }, 310);

    // return focus to toggler
    if (this.mobileMenuButton) this.mobileMenuButton.focus();
  }

  // ------------ Submenu accordion (mobile) ------------
  toggleSubmenu(menuId) {
    const submenu = document.getElementById(menuId);
    const icon = document.getElementById(menuId + 'Icon');
    if (!submenu) return;

    const isOpen = !submenu.classList.contains('hidden');

    // close other submenu
    if (this.activeSubmenu && this.activeSubmenu !== menuId) this.closeSubmenu(this.activeSubmenu);

    if (isOpen) this.closeSubmenu(menuId);
    else this.openSubmenu(menuId);
  }

  openSubmenu(menuId) {
    const submenu = document.getElementById(menuId);
    const icon = document.getElementById(menuId + 'Icon');
    if (!submenu) return;

    submenu.classList.remove('hidden');
    // animate
    submenu.style.maxHeight = '0px';
    submenu.style.opacity = '0';
    submenu.style.transform = 'translateY(-8px)';
    submenu.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      submenu.style.transition = 'all 300ms ease';
      submenu.style.maxHeight = submenu.scrollHeight + 'px';
      submenu.style.opacity = '1';
      submenu.style.transform = 'translateY(0)';
    });

    if (icon) icon.style.transform = 'rotate(180deg)';
    this.activeSubmenu = menuId;
  }

  closeSubmenu(menuId) {
    const submenu = document.getElementById(menuId);
    const icon = document.getElementById(menuId + 'Icon');
    if (!submenu) return;

    submenu.style.transition = 'all 300ms ease';
    submenu.style.maxHeight = '0';
    submenu.style.opacity = '0';
    submenu.style.transform = 'translateY(-8px)';

    setTimeout(() => {
      submenu.classList.add('hidden');
      submenu.style.maxHeight = '';
      submenu.style.opacity = '';
      submenu.style.transform = '';
      submenu.style.transition = '';
    }, 310);

    if (icon) icon.style.transform = 'rotate(0deg)';
    if (this.activeSubmenu === menuId) this.activeSubmenu = null;
  }

  closeAllSubmenus() {
    ['services', 'areas'].forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.classList.contains('hidden')) this.closeSubmenu(id);
    });
  }

  // ------------ Desktop dropdown helpers ------------
  showDropdown(dropdown) {
    dropdown.classList.remove('opacity-0', 'invisible');
    dropdown.classList.add('opacity-100', 'visible');
    dropdown.style.transform = 'translateY(0)';
  }

  hideDropdown(dropdown) {
    dropdown.classList.remove('opacity-100', 'visible');
    dropdown.classList.add('opacity-0', 'invisible');
    dropdown.style.transform = 'translateY(-10px)';
  }

  toggleDropdown(dropdown) {
    if (!dropdown) return;
    if (dropdown.classList.contains('opacity-100')) this.hideDropdown(dropdown);
    else this.showDropdown(dropdown);
  }

  // ------------ Utilities ------------
  closeAllMenus() {
    if (this.mobileMenu?.classList.contains('active')) this.closeMobileMenu();
    document.querySelectorAll('.group .absolute, .group [data-dropdown]').forEach(dd => this.hideDropdown(dd));
    this.closeAllSubmenus();
  }

  trapFocus(e) {
    if (!this.mobileMenu) return;
    const focusable = Array.from(this.mobileMenu.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(Boolean);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  handleResize() {
    if (window.innerWidth >= 1024 && this.mobileMenu?.classList.contains('active')) {
      this.closeMobileMenu();
    }
  }
}

/* ---------- Legacy global helpers for existing markup ---------- */
function toggleMobileMenu() {
  if (window.locksmithNav) window.locksmithNav.toggleMobileMenu();
}
function toggleSubmenu(menuId) {
  if (window.locksmithNav) window.locksmithNav.toggleSubmenu(menuId);
}

/* ---------- Init on DOM ready ---------- */
document.addEventListener('DOMContentLoaded', () => {
  window.locksmithNav = new LocksmithNavigation();

  // smooth anchor scrolling (non-blocking)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Short loading visual for tel/book buttons
  document.querySelectorAll('a[href^="tel:"], a[href*="book"]').forEach(btn => {
    btn.addEventListener('click', function () {
      const original = this.innerHTML;
      // use a simple inline spinner icon (material icons available on page)
      this.innerHTML = original.replace(/Call Now|Book Service/, '<span class="material-icons animate-spin">hourglass_empty</span>');
      this.style.pointerEvents = 'none';
      setTimeout(() => {
        this.innerHTML = original;
        this.style.pointerEvents = '';
      }, 900);
    });
  });
});
