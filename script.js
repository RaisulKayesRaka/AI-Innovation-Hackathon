document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // ------------------------------------------
  // 1. Mobile Navigation
  // ------------------------------------------
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      const isExpanded = mobileMenuBtn.getAttribute("aria-expanded") === "true";
      mobileMenuBtn.setAttribute("aria-expanded", !isExpanded);
      mobileMenuBtn.classList.toggle("active");
      navLinks.classList.toggle("active");
    });

    // Close menu on link click
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenuBtn.setAttribute("aria-expanded", "false");
        mobileMenuBtn.classList.remove("active");
        navLinks.classList.remove("active");
      });
    });
  }

  // ------------------------------------------
  // 2. Navbar scroll effect
  // ------------------------------------------
  const navbar = document.getElementById("navbar");
  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
    lastScroll = currentScroll;
  });

  // ------------------------------------------
  // 3. Section Particle Canvas Animation
  // ------------------------------------------
  class Particle {
    constructor(canvas) {
      this.canvas = canvas;
      this.reset();
    }

    reset() {
      this.x = Math.random() * this.canvas.width;
      this.y = Math.random() * this.canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.hue = Math.random() > 0.5 ? 270 : 330; // purple or pink
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > this.canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > this.canvas.height) this.speedY *= -1;
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.opacity})`;
      ctx.fill();
    }
  }

  class ParticleSystem {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.particles = [];
      this.animationId = null;
      this.isRunning = false;

      this.resize();
      this.init();
    }

    resize() {
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;
      this.init();
    }

    init() {
      const count = Math.min(
        Math.floor((this.canvas.width * this.canvas.height) / 12000),
        100,
      );
      this.particles = [];
      for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(this.canvas));
      }
    }

    connectParticles() {
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.15;
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(124, 58, 237, ${opacity})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            this.ctx.stroke();
          }
        }
      }
    }

    animate() {
      if (!this.isRunning) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.particles.forEach((p) => {
        p.update();
        p.draw(this.ctx);
      });
      this.connectParticles();
      this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
      // Respect prefers-reduced-motion
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      if (!this.isRunning) {
        this.isRunning = true;
        this.animate();
      }
    }

    stop() {
      this.isRunning = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    }
  }

  const particleCanvases = document.querySelectorAll(".section-particles");
  const particleSystems = [];

  particleCanvases.forEach((canvas) => {
    const system = new ParticleSystem(canvas);
    particleSystems.push(system);
  });

  const particleObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const system = particleSystems.find((s) => s.canvas === entry.target);
        if (system) {
          if (entry.isIntersecting) {
            system.start();
          } else {
            system.stop();
          }
        }
      });
    },
    { threshold: 0.1 },
  );

  particleCanvases.forEach((canvas) => particleObserver.observe(canvas));

  window.addEventListener("resize", () => {
    particleSystems.forEach((system) => system.resize());
  });

  // ------------------------------------------
  // 4. Scroll-triggered animations
  // ------------------------------------------
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".animate-on-scroll").forEach((el) => {
    observer.observe(el);
  });

  // ------------------------------------------
  // 5. Counter animation for hero stats
  // ------------------------------------------
  function animateCounter(element) {
    const target = parseInt(element.getAttribute("data-target"));
    const suffix = element.getAttribute("data-suffix") || "";
    const duration = 2000;
    const start = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      element.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counters = entry.target.querySelectorAll(".stat-value");
          counters.forEach((counter) => animateCounter(counter));
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  const heroStats = document.querySelector(".hero-stats");
  if (heroStats) {
    statsObserver.observe(heroStats);
  }

  // ------------------------------------------
  // 6. Countdown Timer Logic (Dynamic Badge)
  // ------------------------------------------
  const phases = [
    { name: "Submission Starts In:", date: new Date("June 25, 2026 00:00:00").getTime() },
    { name: "Phase-1 Submission Ends In:", date: new Date("July 7, 2026 23:59:59").getTime() },
    { name: "Finalist Announcement In:", date: new Date("July 11, 2026 23:59:59").getTime() },
    { name: "Phase-2 Registration Ends In:", date: new Date("July 15, 2026 23:59:59").getTime() },
    { name: "Final Round Starts In:", date: new Date("July 21, 2026 08:00:00").getTime() }
  ];

  function updateCountdown() {
    const now = new Date().getTime();
    
    const currentPhase = phases.find(phase => now < phase.date);
    let targetDate, labelText;

    if (currentPhase) {
      targetDate = currentPhase.date;
      labelText = currentPhase.name;
    } else {
      const badge = document.getElementById("hero-countdown-badge");
      if (badge) {
        badge.innerHTML =
          '<span class="dot"></span> <span class="gradient-text">Hackathon Concluded</span>';
      }
      return;
    }

    const distance = targetDate - now;
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const labelEl = document.getElementById("countdown-label");
    const timerEl = document.getElementById("countdown-timer");

    if (labelEl && timerEl) {
      labelEl.textContent = labelText;
      timerEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // ------------------------------------------
  // 7. Smooth scroll for nav links
  // ------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // ------------------------------------------
  // 7. Active nav link highlighting
  // ------------------------------------------
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll(".nav-links a");

  function highlightNav() {
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute("id");

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navAnchors.forEach((a) => {
          a.classList.remove("active");
          if (a.getAttribute("href") === `#${sectionId}`) {
            a.classList.add("active");
          }
        });
      }
    });
  }

  window.addEventListener("scroll", highlightNav);

  // ------------------------------------------
  // 8. Staggered animation delays for cards
  // ------------------------------------------
  document
    .querySelectorAll(".tracks-grid .track-card, .prizes-grid .prize-card")
    .forEach((card, index) => {
      card.style.transitionDelay = `${index * 0.15}s`;
    });

  // ------------------------------------------
  // 9. Parallax glow on hero
  // ------------------------------------------
  const heroSection = document.getElementById("hero");
  if (heroSection) {
    heroSection.addEventListener("mousemove", (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const heroBg = heroSection.querySelector(".hero-bg");
      if (heroBg) {
        heroBg.style.setProperty("--mouse-x", `${x}%`);
        heroBg.style.setProperty("--mouse-y", `${y}%`);
      }
    });
  }
});
