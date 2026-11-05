(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.querySelector('.site-nav');
  const menuButton = document.querySelector('.site-nav__toggle');
  const menu = document.querySelector('.site-nav__links');
  const video = document.querySelector('.hero__video');
  const projectSection = document.querySelector('.projects-section');
  const projectTitle = document.querySelector('.projects-title');
  const projectsTrack = document.querySelector('.projects-track');
  const projectsWindow = document.querySelector('.projects-window');
  const projectsCarousel = document.querySelector('.projects-carousel');
  const projectsScrollArea = document.querySelector('.projects-scroll-area');
  const projectSlides = [...document.querySelectorAll('.project-card')];
  const projectCount = document.querySelector('.projects-count__current');
  const previousProject = document.querySelector('.projects-arrow--previous');
  const nextProject = document.querySelector('.projects-arrow--next');
  const contactForm = document.querySelector('.contact-form');

  const setMenuOpen = (isOpen) => {
    if (!menuButton || !menu) return;

    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    menu.classList.toggle('is-open', isOpen);
  };

  const updateNavState = () => {
    nav?.classList.toggle('is-scrolled', window.scrollY > 40);
  };

  const initNavigation = () => {
    updateNavState();
    window.addEventListener('scroll', updateNavState, { passive: true });

    menuButton?.addEventListener('click', () => {
      setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
    });

    menu?.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    });
  };

  const initBackToTop = () => {
    const backToTopButton = document.querySelector('.back-to-top');
    backToTopButton?.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
      });
    });
  };

  const initVideoPlayback = () => {
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.play().catch(() => {});
  };

  const initContactForm = () => {
    if (!contactForm) return;

    const dateInput = contactForm.querySelector('input[name="date"]');
    const status = contactForm.querySelector('.contact-form__status');

    if (dateInput) {
      const localToday = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
      dateInput.min = localToday;
    }

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;

      const formData = new FormData(contactForm);
      const message = [
        `Name: ${formData.get('name')}`,
        `Email: ${formData.get('email')}`,
        `Phone: ${formData.get('phone')}`,
        `Preferred way to connect: ${formData.get('preferred-contact')}`,
        `Preferred date: ${formData.get('date')}`,
        `Preferred time (visitor's local time): ${formData.get('time')}`,
        '',
        'Conversation details:',
        formData.get('message'),
      ].join('\n');
      const subject = `Conversation request from ${formData.get('name')}`;
      const mailto = `mailto:abdulrehmanmujahid1100@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

      if (status) {
        const fallbackLink = document.createElement('a');
        fallbackLink.href = mailto;
        fallbackLink.textContent = 'open an email draft';
        status.replaceChildren(
          document.createTextNode('Your email app should open with your request. If it does not, '),
          fallbackLink,
          document.createTextNode('. Review the details and send the email to complete your request.'),
        );
        fallbackLink.click();
        return;
      }

      window.location.href = mailto;
    });
  };

  const initProjectCarousel = () => {
    if (!projectSection || !projectsTrack || !projectSlides.length) return;

    let activeProject = 0;
    let scrollFrame = 0;
    const steps = projectSlides.length - 1;

    const getSlideDistance = () => {
      return projectsWindow?.clientWidth || projectSlides[0]?.getBoundingClientRect().width || 0;
    };

    const setGsapX = window.gsap ? gsap.quickSetter(projectsTrack, 'x', 'px') : null;

    const setTrackOffset = (offset) => {
      if (setGsapX) {
        setGsapX(offset);
        return;
      }

      projectsTrack.style.transform = `translate3d(${offset}px, 0, 0)`;
    };

    const getScrollRange = () => {
      const stickyTop = projectsCarousel ? parseFloat(getComputedStyle(projectsCarousel).top) || 96 : 96;
      const start = window.scrollY + (projectsScrollArea?.getBoundingClientRect().top || 0) - stickyTop;
      const areaHeight = projectsScrollArea?.getBoundingClientRect().height || 0;
      const carouselHeight = projectsCarousel?.getBoundingClientRect().height || 0;

      return { start, distance: Math.max(1, areaHeight - carouselHeight) };
    };

    const setActiveProject = (index) => {
      activeProject = Math.max(0, Math.min(projectSlides.length - 1, index));

      projectSlides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeProject;
        slide.setAttribute('aria-hidden', String(!isActive));
        slide.inert = !isActive;
      });

      if (projectCount) {
        projectCount.textContent = String(activeProject + 1).padStart(2, '0');
      }

      if (previousProject) {
        previousProject.disabled = activeProject === 0;
      }

      if (nextProject) {
        nextProject.disabled = activeProject === projectSlides.length - 1;
      }
    };

    const showProject = (index, scrollWithPage = false) => {
      const targetIndex = Math.max(0, Math.min(projectSlides.length - 1, index));

      if (scrollWithPage && steps > 0 && projectsScrollArea) {
        const { start, distance } = getScrollRange();
        const targetScroll = start + (targetIndex / steps) * distance;
        window.scrollTo({ top: targetScroll, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
        return;
      }

      setActiveProject(targetIndex);
      const offset = -activeProject * getSlideDistance();
      setTrackOffset(offset);
    };

    const updateHorizontalFromScroll = () => {
      scrollFrame = 0;

      if (steps <= 0 || !projectsScrollArea) return;

      const { start, distance } = getScrollRange();
      const progress = Math.max(0, Math.min(1, (window.scrollY - start) / distance));
      const offset = -progress * (steps * getSlideDistance());

      setTrackOffset(offset);
      setActiveProject(Math.round(progress * steps));
    };

    previousProject?.addEventListener('click', () => showProject(activeProject - 1, true));
    nextProject?.addEventListener('click', () => showProject(activeProject + 1, true));

    projectsWindow?.addEventListener('keydown', (event) => {
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

    window.addEventListener('scroll', () => {
      if (!scrollFrame) {
        scrollFrame = requestAnimationFrame(updateHorizontalFromScroll);
      }
    }, { passive: true });

    window.addEventListener('resize', updateHorizontalFromScroll);
    updateHorizontalFromScroll();

    if (window.gsap && !prefersReducedMotion.matches && 'IntersectionObserver' in window) {
      const projectObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;

        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .fromTo(projectSection.querySelector('.projects-eyebrow'), { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55 })
          .fromTo(projectTitle, { y: 42, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 }, '-=0.15')
          .fromTo(projectSection.querySelector('.projects-intro'), { x: 32, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7 }, '-=0.5');

        projectObserver.disconnect();
      }, { threshold: 0.12 });

      projectObserver.observe(projectSection);
    }
  };

  const initIntroLoader = () => {
    const loader = document.querySelector('.intro-loader');
    const main = document.querySelector('main');
    if (!loader || !main) return;

    const brand = nav?.querySelector('.site-nav__brand');
    const links = nav?.querySelectorAll('.site-nav__links a');
    const pageLoad = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const hasVideoSource = video && (video.currentSrc || video.hasAttribute('src') || video.querySelector('source[src]'));
    const videoReady = !video
      || video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      || video.error
      || !hasVideoSource
      ? Promise.resolve()
      : new Promise((resolve) => {
        video.addEventListener('loadeddata', resolve, { once: true });
        video.addEventListener('error', resolve, { once: true });
      });

    Promise.all([pageLoad, fontsReady, videoReady]).then(() => {
      main.setAttribute('aria-busy', 'false');

      if (window.gsap && !prefersReducedMotion.matches) {
        gsap.set(nav, { autoAlpha: 0, y: -16 });
        const introTimeline = gsap.timeline({
          defaults: { ease: 'power2.out' },
          onComplete: () => loader.remove(),
        });

        introTimeline
          .to(loader, { autoAlpha: 0, duration: 0.35 })
          .fromTo(nav, { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.45 }, 0.05)
          .fromTo(brand, { x: -28, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.45 }, 0.12)
          .fromTo(links, { x: 28, autoAlpha: 0 }, {
            x: 0,
            autoAlpha: 1,
            duration: 0.4,
            stagger: { each: 0.07, from: 'end' },
          }, 0.15);

        document.body.classList.remove('is-loading');
        return;
      }

      document.body.classList.remove('is-loading');
      loader.classList.add('is-dismissed');
      window.setTimeout(() => loader.remove(), 350);
    });
  };

  const init = () => {
    initNavigation();
    initBackToTop();
    initProjectCarousel();
    initVideoPlayback();
    initContactForm();
    initIntroLoader();
  };

  init();
})();
