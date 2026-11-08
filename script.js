/* ============================================
   JOSEPH PHAM — PORTFOLIO
   Interactions & Animations
   ============================================ */

(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ========== Preloader ========== */
  window.addEventListener('load', () => {
    const preloader = $('.preloader');
    if (!preloader) return;
    // Name types in: 0.2-1.2s, dot pops: 1.2-1.8s, pause, then split apart
    setTimeout(() => preloader.classList.add('done'), 2100);
    setTimeout(() => {
      preloader.classList.add('gone');
      preloader.remove();
    }, 3400);
  });

  /* ========== Custom Cursor ========== */
  if (!isTouch && !prefersReducedMotion) {
    const ring = $('.cursor-ring');
    const dot  = $('.cursor-dot');
    if (ring && dot) {
      let mx = 0, my = 0, rx = 0, ry = 0;
      let firstMove = true;

      window.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        if (firstMove) {
          // position the ring exactly at the mouse to avoid a visible jump
          rx = mx; ry = my;
          ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
          ring.classList.add('ready');
          dot.classList.add('ready');
          firstMove = false;
        }
      }, { passive: true });

      const animateRing = () => {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateRing);
      };
      animateRing();

      // Hover states
      const hoverables = 'a, button, .skill-pill, .stat, .cert-item, .project-card, .testimonial, input, textarea, .nav-burger';
      document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverables)) ring.classList.add('hover');
      });
      document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverables)) ring.classList.remove('hover');
      });
      document.addEventListener('mousedown', () => ring.classList.add('click'));
      document.addEventListener('mouseup',   () => ring.classList.remove('click'));

      // Hide when leaving window
      document.addEventListener('mouseleave', () => {
        ring.classList.remove('ready');
        dot.classList.remove('ready');
      });
      document.addEventListener('mouseenter', () => {
        if (!firstMove) {
          ring.classList.add('ready');
          dot.classList.add('ready');
        }
      });
    }
  }

  /* ========== Nav scroll state + progress ========== */
  const nav = $('.nav');
  const progress = $('.nav-progress');

  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 30);

    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (y / h) * 100 : 0;
      progress.style.width = pct + '%';
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ========== Mobile nav ========== */
  const burger = $('.nav-burger');
  const mobile = $('.nav-mobile');

  if (burger && mobile) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      mobile.classList.toggle('open');
      document.body.style.overflow = mobile.classList.contains('open') ? 'hidden' : '';
    });

    $$('.nav-mobile a').forEach((link) => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        mobile.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ========== Hero orb follows cursor ========== */
  const orb = $('.hero-orb');
  const hero = $('.hero');
  if (orb && hero && !prefersReducedMotion && !isTouch) {
    let ox = 0, oy = 0, tx = 0, ty = 0;

    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 200;
      ty = ((e.clientY - r.top)  / r.height - 0.5) * 200;
    });

    hero.addEventListener('mouseleave', () => {
      tx = 0;
      ty = 0;
    });

    const animOrb = () => {
      ox += (tx - ox) * 0.12;
      oy += (ty - oy) * 0.12;
      orb.style.transform = `translate(calc(-50% + ${ox}px), calc(-50% + ${oy}px))`;
      requestAnimationFrame(animOrb);
    };
    animOrb();
  }

  /* ========== Hero title word reveal ========== */
  const heroTitle = $('.hero-title');
  if (heroTitle && !prefersReducedMotion) {
    $$('.word', heroTitle).forEach((w, i) => {
      w.style.animationDelay = (0.4 + i * 0.12) + 's';
    });
  }

  /* ========== Section title letter split ==========
     Wraps each word of the title in a <span class="word"> and each
     letter in a <span class="char">. The .word container is inline-block
     with white-space:nowrap so the browser never breaks mid-word.
     Spaces between words are rendered as separate spans that CAN break.  */
  const splitTitle = (root) => {
    if (root.dataset.split === '1') return;
    root.dataset.split = '1';

    let index = 0;
    const makeChar = (ch) => {
      const s = document.createElement('span');
      s.className = 'char';
      s.style.setProperty('--i', index++);
      s.textContent = ch;
      return s;
    };
    const makeSpace = () => {
      const s = document.createElement('span');
      s.className = 'char space';
      s.style.setProperty('--i', index++);
      s.innerHTML = '&nbsp;';
      return s;
    };

    const walk = (node) => {
      const children = Array.from(node.childNodes);
      children.forEach((child) => {
        if (child.nodeType === 3) {
          // text node → split into word groups + spaces
          const frag = document.createDocumentFragment();
          const tokens = child.nodeValue.split(/(\s+)/); // keep whitespace
          tokens.forEach((token) => {
            if (token === '') return;
            if (/^\s+$/.test(token)) {
              // render each whitespace as a breakable inline-block space
              for (let i = 0; i < token.length; i++) frag.appendChild(makeSpace());
            } else {
              // wrap word's letters in a nowrap container
              const w = document.createElement('span');
              w.className = 'word-group';
              for (const ch of token) w.appendChild(makeChar(ch));
              frag.appendChild(w);
            }
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(root);
  };

  if (!prefersReducedMotion) {
    $$('.section-title').forEach(splitTitle);
  }

  /* ========== Intersection reveal ========== */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -10% 0px' });

    revealEls.forEach((el) => {
      // Immediately reveal anything already in viewport on page load
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add('visible');
      } else {
        io.observe(el);
      }
    });

    // Safety net: after 2.5s, reveal anything still unrevealed that's near viewport
    setTimeout(() => {
      $$('.reveal:not(.visible)').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight + 200) {
          el.classList.add('visible');
        }
      });
    }, 2500);
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ========== Stat counters ========== */
  const stats = $$('.stat-num[data-count]');
  if (stats.length && 'IntersectionObserver' in window) {
    const statIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        const start = performance.now();

        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el.firstChild.nodeValue = Math.floor(eased * end);
          if (p < 1) requestAnimationFrame(tick);
          else el.firstChild.nodeValue = end;
        };

        // Preserve any trailing <sub> element
        if (el.firstChild && el.firstChild.nodeType === 3) {
          requestAnimationFrame(tick);
        }

        statIO.unobserve(el);
      });
    }, { threshold: 0.4 });

    stats.forEach((s) => statIO.observe(s));
  }

  /* ========== Timeline progressive line + dot fill ========== */
  const timelines = $$('.timeline');
  timelines.forEach((timeline) => {
    const line = timeline.querySelector('.timeline-line');
    if (!line) return;
    const items = Array.from(timeline.querySelectorAll('.timeline-item'));

    const updateLine = () => {
      const rect = timeline.getBoundingClientRect();
      const wH = window.innerHeight;
      const start = rect.top;
      const full  = rect.height;

      // Start growing when timeline enters viewport, cap at its bottom
      const trigger = wH * 0.85;
      let progress = (trigger - start) / full;
      progress = Math.max(0, Math.min(1, progress));

      // Use responsive top value to avoid overflow and match CSS (48px desktop / 39px mobile)
      const isMobile = window.innerWidth <= 768;
      const lineTop = isMobile ? 39 : 48;
      
      line.style.height = `calc(${progress * 100}% - ${lineTop}px)`;

      const lineEndPx = lineTop + (full - lineTop) * progress;
      
      items.forEach((item) => {
        const dotY = item.offsetTop + lineTop; // approximate dot center position
        if (dotY <= lineEndPx) {
          item.classList.add('passed');
        } else {
          item.classList.remove('passed');
        }
      });
    };

    window.addEventListener('scroll', updateLine, { passive: true });
    window.addEventListener('resize', updateLine);
    updateLine();
  });

  /* ========== Cert cards mouse gradient ========== */
  $$('.cert-item').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top)  / r.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });

  /* ========== Project cards tilt effect ========== */
  if (!isTouch && !prefersReducedMotion) {
    $$('.project-card').forEach((card) => {
      const img = card.querySelector('.project-image img');

      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const cx = r.width / 2;
        const cy = r.height / 2;
        const x = e.clientX - r.left - cx;
        const y = e.clientY - r.top  - cy;
        const rx = (y / cy) * -2;
        const ry = (x / cx) * 2;
        card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        if (img) {
          img.style.transform = `scale(1.05) translate(${-x * 0.02}px, ${-y * 0.02}px)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        if (img) img.style.transform = '';
      });
    });
  }

  /* ========== Magnetic buttons (subtle) ========== */
  if (!isTouch && !prefersReducedMotion) {
    $$('.btn-primary, .nav-cta').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top  - r.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ========== Smooth anchor scrolling offset ========== */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ========== Selectable text inside clickable cards ==========
     Allow users to highlight and copy text from cert cards and project
     cards without triggering the outer link. Two things to fix:
       1) Anchor tags are draggable by default → prevent dragstart so
          a mouse drag becomes text selection instead of a link drag.
       2) If a click ended after a drag or with an active selection,
          cancel navigation.                                            */
  $$('.cert-item, .project-link').forEach((a) => {
    a.setAttribute('draggable', 'false');

    a.addEventListener('dragstart', (e) => e.preventDefault());
    a.addEventListener('mousedown', (e) => {
      a._downX = e.clientX;
      a._downY = e.clientY;
    });
    a.addEventListener('click', (e) => {
      const moved = Math.hypot(
        e.clientX - (a._downX || 0),
        e.clientY - (a._downY || 0)
      ) > 5;
      const sel = window.getSelection && window.getSelection().toString();
      if (moved || (sel && sel.length > 0)) {
        e.preventDefault();
      }
    });
  });

  /* ========== Active section highlighting ========== */
  const sections = $$('section[id]');
  const navLinks = $$('.nav-links a, .nav-mobile a');

  if (sections.length && 'IntersectionObserver' in window) {
    const sectIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            link.classList.toggle('is-active', href === '#' + id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });

    sections.forEach((s) => sectIO.observe(s));
  }

  /* ========== Parallax on floating shapes ==========
     Each .floating-shape with data-parallax="0.12" moves vertically
     by scroll * factor relative to its section's center.            */
  const shapes = $$('.floating-shape[data-parallax]');
  if (shapes.length && !prefersReducedMotion) {
    const updateShapes = () => {
      const vh = window.innerHeight;
      shapes.forEach((sh) => {
        const rect = sh.parentElement.getBoundingClientRect();
        const centerDist = rect.top + rect.height / 2 - vh / 2;
        const factor = parseFloat(sh.dataset.parallax) || 0.1;
        sh.style.transform = `translate3d(0, ${-centerDist * factor}px, 0)`;
      });
    };
    window.addEventListener('scroll', updateShapes, { passive: true });
    window.addEventListener('resize', updateShapes);
    updateShapes();
  }

  /* ========== Hero scroll-out (fade + lift as you scroll past) ========== */
  const heroWrap = $('.hero-wrap');
  const heroSection = $('.hero');
  if (heroWrap && heroSection && !prefersReducedMotion) {
    const updateHero = () => {
      const h = heroSection.offsetHeight;
      const y = window.scrollY;
      if (y > h) return;
      const p = Math.min(1, y / (h * 0.9));
      heroWrap.style.opacity = String(1 - p * 1.1);
      heroWrap.style.transform = `translate3d(0, ${-y * 0.25}px, 0)`;
    };
    window.addEventListener('scroll', updateHero, { passive: true });
    updateHero();
  }

  /* ========== Project image parallax (subtle vertical drift) ========== */
  if (!prefersReducedMotion) {
    const projectImages = $$('.project-image img');
    if (projectImages.length) {
      const updateProjImgs = () => {
        const vh = window.innerHeight;
        projectImages.forEach((img) => {
          const wrap = img.parentElement;
          const rect = wrap.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > vh) return;
          const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
          const shift = progress * -30; // max ±30px drift
          img.style.transform = `scale(1.08) translate3d(0, ${shift}px, 0)`;
        });
      };
      window.addEventListener('scroll', updateProjImgs, { passive: true });
      window.addEventListener('resize', updateProjImgs);
      updateProjImgs();
    }
  }

})();