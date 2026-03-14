/* ══════════════════════════════════════════
   PURE DRINK CO. — main.js
   ══════════════════════════════════════════ */

// ─── Navbar scroll effect ─────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ─── Logo click → smooth scroll to top ────
document.getElementById('nav-logo-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


// ─── Mobile hamburger menu ────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// ─── Reveal on scroll (IntersectionObserver) ─
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger sibling reveals inside the same parent
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ─── Active nav link highlight on scroll ──
const sections = document.querySelectorAll('section[id], footer[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => {
        a.classList.toggle('nav-active', a.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => sectionObserver.observe(s));

// ─── Value card hover category highlight ──
const valueCards = document.querySelectorAll('.value-card');
valueCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    valueCards.forEach(c => {
      if (c !== card) c.style.opacity = '.6';
    });
  });
  card.addEventListener('mouseleave', () => {
    valueCards.forEach(c => c.style.opacity = '');
  });
});

// ─── Staggered team card reveal ───────────
document.querySelectorAll('.team-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.1}s`;
});

// ─── Simple click ripple on buttons ───────
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    ripple.style.cssText = `
      position:absolute;
      border-radius:50%;
      width:0;height:0;
      background:rgba(255,255,255,.35);
      left:${e.clientX - rect.left}px;
      top:${e.clientY - rect.top}px;
      transform:translate(-50%,-50%);
      animation:rippleEffect .6s ease-out forwards;
      pointer-events:none;
    `;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

// Inject ripple keyframe
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleEffect {
    to { width:200px; height:200px; opacity:0; }
  }
  .nav-active { color: var(--orange) !important; }
`;
document.head.appendChild(style);

console.log('%c🍊 Pure Drink Co. — Freshness Redefined', 'color:#FF8C00;font-size:16px;font-weight:bold;');

// ══════════════════════════════════════════
// AUTOPLAY IMAGE SEQUENCE — Canvas Engine
// ══════════════════════════════════════════
(function () {
  const TOTAL_FRAMES = 280;
  const FPS = 24;
  const FRAME_INTERVAL = 1000 / FPS;
  const FRAME_PATH = (n) => {
    const name = `ezgif-frame-${String(n).padStart(3, '0')}.jpg`;
    if (n <= 100) return `0-100/${name}`;
    if (n <= 200) return `101-200/${name}`;
    return `201-280/${name}`;
  };

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  // High-quality bicubic upscaling for crisp frame rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const loaderBar = document.getElementById('seq-loader-bar');
  const loader = document.getElementById('seq-loader');

  // ── Cover-fit draw ───────────────────────
  let currentFrame = 0;

  function renderFrame(index) {
    const img = images[index];
    if (!img || !img.complete || !img.naturalWidth) return;
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  // ── Resize canvas to viewport ────────────
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderFrame(currentFrame);
  }
  window.addEventListener('resize', resizeCanvas, { passive: true });

  // ── Preload all frames ───────────────────
  const images = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let hasStartedPlayback = false;
  const BUFFER_FRAMES = 30; // Buffer enough frames before starting playback

  function loadImages() {
    // Let the user scroll immediately
    document.body.style.overflow = '';

    let currentIndex = 0;
    const BATCH_SIZE = 20; // Load 20 frames at a time for faster buffering

    function loadNextBatch() {
      if (currentIndex >= TOTAL_FRAMES) return;

      const targetIndex = Math.min(currentIndex + BATCH_SIZE, TOTAL_FRAMES);
      let batchLoadedCount = 0;
      const expectedInBatch = targetIndex - currentIndex;

      for (let i = currentIndex; i < targetIndex; i++) {
        const img = new Image();

        const handleLoadOrError = () => {
          loadedCount++;
          batchLoadedCount++;

          // Show first frame immediately in background
          if (i === 0 && img.complete && img.naturalWidth) { resizeCanvas(); }

          // Update progress bar
          if (loaderBar) {
            loaderBar.style.width = Math.min(((loadedCount / BUFFER_FRAMES) * 100), 100) + '%';
          }

          // Start playback after enough frames are buffered
          if (loadedCount >= BUFFER_FRAMES && !hasStartedPlayback) {
            hasStartedPlayback = true;
            startPlayback();
          }

          // If this batch is fully loaded, trigger the next batch
          if (batchLoadedCount === expectedInBatch) {
            currentIndex = targetIndex;
            loadNextBatch();
          }
        };

        img.onload = handleLoadOrError;
        img.onerror = handleLoadOrError;

        img.src = FRAME_PATH(i + 1);
        images[i] = img;
      }
    }

    loadNextBatch();
  }

  // ── Autoplay loop ────────────────────────
  function startPlayback() {
    // Fade out loader overlay
    if (loader) {
      loader.style.transition = 'opacity 0.6s ease';
      loader.style.opacity = '0';
      setTimeout(() => { if (loader) loader.style.display = 'none'; }, 650);
    }

    currentFrame = 0;
    let lastTime = 0;

    function playLoop(now) {
      if (lastTime === 0) {
        lastTime = now;
        renderFrame(currentFrame);
        currentFrame++;
        requestAnimationFrame(playLoop);
        return;
      }

      const elapsed = now - lastTime;

      if (elapsed >= FRAME_INTERVAL) {
        // Advance by the correct number of frames to stay in sync
        const framesToAdvance = Math.floor(elapsed / FRAME_INTERVAL);
        lastTime += framesToAdvance * FRAME_INTERVAL;

        // Find the target frame, but don't skip past unloaded frames
        let targetFrame = Math.min(currentFrame + framesToAdvance - 1, TOTAL_FRAMES - 1);

        // If the target frame isn't loaded yet, show the last loaded frame
        while (targetFrame > currentFrame && (!images[targetFrame] || !images[targetFrame].complete || !images[targetFrame].naturalWidth)) {
          targetFrame--;
        }

        currentFrame = targetFrame;
        renderFrame(currentFrame);

        if (currentFrame < TOTAL_FRAMES - 1) {
          currentFrame++;
          requestAnimationFrame(playLoop);
        } else {
          onSequenceComplete();
        }
      } else {
        requestAnimationFrame(playLoop);
      }
    }

    requestAnimationFrame(playLoop);
  }

  // ── After last frame: show tagline → reveal site ─
  function onSequenceComplete() {
    // Show tagline text
    const tagline = document.getElementById('hero-tagline');
    if (tagline) {
      requestAnimationFrame(() => tagline.classList.add('seq-visible'));
    }

    // Fade background to black
    const heroCanvas = document.getElementById('hero-canvas');
    if (heroCanvas) {
      heroCanvas.style.transition = 'opacity 0.8s ease';
      heroCanvas.style.opacity = '0';
    }

    // After 0.2s reveal the rest of the page
    setTimeout(() => {
      document.body.classList.remove('seq-playing');
      setupCanvasInteractive();
    }, 200);
  }

  // ── Cursor parallax after sequence ends ──
  function setupCanvasInteractive() {
    let curX = 0, curY = 0;
    let lerpX = 0, lerpY = 0;

    window.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      // Calculate offset based on distance from center
      curX = ((e.clientX - cx) / cx) * -16; // Move in opposite direction slightly
      curY = ((e.clientY - cy) / cy) * -12;
    }, { passive: true });

    function animateInteractive() {
      // Smooth lerp
      lerpX += (curX - lerpX) * 0.08;
      lerpY += (curY - lerpY) * 0.08;

      // Scale slightly up (1.04) so we don't see black borders when shifting
      canvas.style.transform = `scale(1.04) translate(${lerpX}px, ${lerpY}px)`;
      requestAnimationFrame(animateInteractive);
    }

    canvas.style.transition = 'transform 0.4s ease, opacity 0.8s ease';
    canvas.style.transform = `scale(1.04) translate(0px, 0px)`;
    setTimeout(() => {
      canvas.style.transition = 'opacity 0.8s ease';
      requestAnimationFrame(animateInteractive);
    }, 400);
  }

  // ── Machine Animation Sequence ─────────────────
  function setupMachineAnimation() {
    const demoCard = document.getElementById('machine-demo-card');
    const techGrid = document.getElementById('tech-details-grid');
    if (!demoCard || !techGrid) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          demoCard.classList.add('ma-play');
          setTimeout(() => {
            demoCard.classList.add('ma-fade-out');
            setTimeout(() => {
              demoCard.style.display = 'none';
              techGrid.classList.add('tech-visible');
            }, 1000);
          }, 5500);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(demoCard);

  }

  // ── Boot ─────────────────────────────────
  document.body.classList.add('seq-playing');
  resizeCanvas();
  loadImages();
  setupMachineAnimation();
})();

// ── EmailJS Contact Form Logic ───────────────
// Initialize EmailJS with your public key
// REPLACE "YOUR_PUBLIC_KEY", "YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID" 
// with your actual EmailJS dashboard values.
const EMAILJS_PUBLIC_KEY = '9wGk5iDS53Jf43dzS';
const EMAILJS_SERVICE_ID = 'service_e2zhmjk';
const EMAILJS_TEMPLATE_ID = 'template_kpf1hh6';

emailjs.init(EMAILJS_PUBLIC_KEY);

const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');

if (contactForm) {
  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();

    // UI Loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    formStatus.className = 'form-status'; // reset classes
    formStatus.textContent = '';

    // Generate a random contact number for the hidden template param if used
    this.contact_number = Math.random() * 100000 | 0;

    // Send the form via EmailJS
    emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, this)
      .then(function () {
        // Success
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
        formStatus.textContent = 'Message sent successfully! We will get back to you soon.';
        formStatus.classList.add('success');
        contactForm.reset();

        // Hide success message after 5 seconds
        setTimeout(() => {
          formStatus.classList.remove('success');
        }, 5000);
      }, function (error) {
        // Error
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
        formStatus.textContent = 'Failed to send message. Please please try again.';
        formStatus.classList.add('error');
        console.error('EmailJS Error:', error);
      });
  });
}
