(() => {
  const video = document.querySelector('.hero__video');
  if (!video) return;

  const nav = document.querySelector('.site-nav');
  const menuButton = document.querySelector('.site-nav__toggle');
  const menu = document.querySelector('.site-nav__links');
  const updateNav = () => nav?.classList.toggle('is-scrolled', window.scrollY > 40);
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  function setMenuOpen(isOpen) {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    menu.classList.toggle('is-open', isOpen);
  }

  menuButton?.addEventListener('click', () => {
    setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  const projectSection = document.querySelector('.projects-section');
  const projectTitle = document.querySelector('.projects-title');
  const projectsTrack = document.querySelector('.projects-track');
  const projectSlides = [...document.querySelectorAll('.project-card')];
  const projectCount = document.querySelector('.projects-count__current');
  const previousProject = document.querySelector('.projects-arrow--previous');
  const nextProject = document.querySelector('.projects-arrow--next');
  const projectsCarousel = document.querySelector('.projects-carousel');
  const projectsScrollArea = document.querySelector('.projects-scroll-area');
  const projectsWindow = document.querySelector('.projects-window');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (projectSection && projectsTrack && projectSlides.length) {
    let activeProject = 0;
    let scrollFrame = 0;
    const steps = projectSlides.length - 1;
    const getSlideDistance = () => projectsWindow?.clientWidth || projectSlides[0]?.getBoundingClientRect().width || 0;
    const setGsapX = window.gsap ? gsap.quickSetter(projectsTrack, 'x', 'px') : null;
    const setTrackOffset = (offset) => {
      // Keep the scroll-linked track on GSAP's quick setter so it follows the
      // scroll position without queued tweens or lag.
      if (setGsapX) setGsapX(offset);
      else projectsTrack.style.transform = `translate3d(${offset}px, 0, 0)`;
    };

    function getScrollRange() {
      const stickyTop = projectsCarousel ? parseFloat(getComputedStyle(projectsCarousel).top) || 96 : 96;
      const start = window.scrollY + (projectsScrollArea?.getBoundingClientRect().top || 0) - stickyTop;
      // Match the actual sticky travel distance instead of assuming the viewport
      // height. This stays aligned when svh and innerHeight differ on mobile.
      const areaHeight = projectsScrollArea?.getBoundingClientRect().height || 0;
      const carouselHeight = projectsCarousel?.getBoundingClientRect().height || 0;
      return { start, distance: Math.max(1, areaHeight - carouselHeight) };
    }

    function setActiveProject(index) {
      activeProject = Math.max(0, Math.min(projectSlides.length - 1, index));
      projectSlides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeProject;
        slide.setAttribute('aria-hidden', String(!isActive));
        slide.inert = !isActive;
      });
      if (projectCount) projectCount.textContent = String(activeProject + 1).padStart(2, '0');
      if (previousProject) previousProject.disabled = activeProject === 0;
      if (nextProject) nextProject.disabled = activeProject === projectSlides.length - 1;
    }

    function showProject(index, scrollWithPage = false) {
      const targetIndex = Math.max(0, Math.min(projectSlides.length - 1, index));
      if (scrollWithPage && steps > 0 && projectsScrollArea) {
        const { start, distance } = getScrollRange();
        const targetScroll = start + (targetIndex / steps) * distance;
        window.scrollTo({ top: targetScroll, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        return;
      }

      setActiveProject(targetIndex);
      const offset = -activeProject * getSlideDistance();
      setTrackOffset(offset);
    }

    previousProject?.addEventListener('click', () => showProject(activeProject - 1, true));
    nextProject?.addEventListener('click', () => showProject(activeProject + 1, true));
    document.querySelector('.projects-window')?.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showProject(activeProject - 1, true);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        showProject(activeProject + 1, true);
      }
    });
    setActiveProject(0);
    setTrackOffset(0);

    function updateHorizontalFromScroll() {
      scrollFrame = 0;
      if (steps <= 0 || !projectsScrollArea) return;
      const { start, distance } = getScrollRange();
      const progress = Math.max(0, Math.min(1, (window.scrollY - start) / distance));
      const offset = -progress * (steps * getSlideDistance());
      setTrackOffset(offset);
      setActiveProject(Math.round(progress * steps));
    }

    window.addEventListener('scroll', () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateHorizontalFromScroll);
    }, { passive: true });
    window.addEventListener('resize', updateHorizontalFromScroll);
    updateHorizontalFromScroll();

    if (window.gsap && !prefersReducedMotion && 'IntersectionObserver' in window) {
      const projectObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .fromTo(projectSection.querySelector('.projects-eyebrow'), { y: 18, autoAlpha: 0 }, {
            y: 0, autoAlpha: 1, duration: 0.55,
          })
          .fromTo(projectTitle, { y: 42, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 }, '-=0.15')
          .fromTo(projectSection.querySelector('.projects-intro'), { x: 32, autoAlpha: 0 }, {
            x: 0, autoAlpha: 1, duration: 0.7,
          }, '-=0.5');
        projectObserver.disconnect();
      }, { threshold: 0.12 });
      projectObserver.observe(projectSection);
    }
  }

  video.muted = true;
  video.defaultMuted = true;

  // Autoplay may be blocked by browser settings; muted playback is safe to retry.
  video.play().catch(() => {});

  const animationKey = 'hero-intro-played';
  let hasPlayedIntro = false;
  try {
    hasPlayedIntro = sessionStorage.getItem(animationKey) === 'true';
  } catch {
    // Continue with the entrance animation if storage is unavailable.
  }

  if (!hasPlayedIntro && window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    try {
      sessionStorage.setItem(animationKey, 'true');
    } catch {
      // The animation still plays once for this page load without session storage.
    }

    const loader = document.createElement('div');
    loader.className = 'intro-loader';
    loader.setAttribute('aria-hidden', 'true');
    loader.innerHTML = `
      <div class="intro-loader__logo-wrap">
        <svg class="intro-loader__ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle class="intro-loader__ring-track" cx="60" cy="60" r="52"></circle>
          <circle class="intro-loader__ring-progress" cx="60" cy="60" r="52" transform="rotate(-90 60 60)"></circle>
        </svg>
        <img class="intro-loader__logo" src="assets/images/ar_logo.webp" alt="">
      </div>
      <div class="intro-loader__waves" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
    `;
    document.body.append(loader);

    const ringProgress = loader.querySelector('.intro-loader__ring-progress');
    const waves = loader.querySelectorAll('.intro-loader__waves span');
    const brand = nav.querySelector('.site-nav__brand');
    const links = nav.querySelectorAll('.site-nav__links a');
    gsap.set(nav, { autoAlpha: 0, y: -16 });
    gsap.to(waves, { scaleY: 2.1, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 4, stagger: 0.08 });
    const intro = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: () => loader.remove() });
    intro
      .to(ringProgress, { strokeDashoffset: 0, duration: 2.05, ease: 'power1.inOut' }, 0)
      .to(loader, { autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, 1.8)
      .fromTo(nav, { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 1.95)
      .fromTo(brand, { x: -28, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.55, ease: 'power3.out' }, 2.05)
      .fromTo(links, { x: 28, autoAlpha: 0 }, {
        x: 0,
        autoAlpha: 1,
        duration: 0.45,
        ease: 'power3.out',
        stagger: { each: 0.09, from: 'end' },
      }, 2.08);
  }
})();
