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

    const playVideo = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.play().catch((error) => {
        if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
          console.error('The hero video could not be played.', error);
        }
      });
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(playVideo, { timeout: 2000 });
    } else {
      window.setTimeout(playVideo, 500);
    }
  };

  const initHeroModel = () => {
    const model = document.querySelector('.hero__model');
    const hero = model?.closest('.hero');
    if (!model || !hero) return;

    window.addEventListener('portfolio:ready', () => {
      const startModel = () => {
        import('three')
          .then(async (THREE) => {
            const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
            const renderer = new THREE.WebGLRenderer({
              canvas: model,
              alpha: true,
              antialias: true,
              powerPreference: 'low-power',
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
            camera.position.z = 7;
            scene.add(new THREE.AmbientLight(0xffe2bd, 2));
            const keyLight = new THREE.DirectionalLight(0xffffff, 3);
            keyLight.position.set(-2, 4, 5);
            scene.add(keyLight);

            const loader = new GLTFLoader();
            loader.load(
              'assets/models/Orange_Fall_Leaves_optimized.glb',
              ({ scene: leaves }) => {
                const bounds = new THREE.Box3().setFromObject(leaves);
                const size = bounds.getSize(new THREE.Vector3());
                const center = bounds.getCenter(new THREE.Vector3());
                leaves.position.sub(center);
                leaves.scale.setScalar(1.7 / size.y);
                const leafTemplate = new THREE.Group();
                leafTemplate.add(leaves);
                const fallingLeaves = [
                  leafTemplate,
                  leafTemplate.clone(true),
                  leafTemplate.clone(true),
                ];
                fallingLeaves.forEach((leafGroup) => scene.add(leafGroup));

                let width = 0;
                let height = 0;
                let frameId = 0;
                let visible = false;
                const clock = new THREE.Clock();

                const resize = () => {
                  const rect = hero.getBoundingClientRect();
                  const nextWidth = rect.width;
                  const nextHeight = rect.height;
                  if (!nextWidth || !nextHeight || (width === nextWidth && height === nextHeight)) return;

                  width = nextWidth;
                  height = nextHeight;
                  renderer.setSize(width, height, false);
                  camera.aspect = width / height;
                  camera.updateProjectionMatrix();
                };

                const draw = () => {
                  frameId = 0;
                  resize();
                  if (!width || !height) return;

                  const viewHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
                  const viewWidth = viewHeight * camera.aspect;
                  const modelHeight = 1.7;
                  const duration = 7;
                  const elapsed = clock.getElapsedTime() / duration;
                  fallingLeaves.forEach((leafGroup, index) => {
                    leafGroup.visible = !prefersReducedMotion.matches || index === 0;
                    const progress = (elapsed + index / fallingLeaves.length) % 1;
                    const xDrift = prefersReducedMotion.matches
                      ? 0
                      : Math.sin(progress * Math.PI * 2) * viewWidth * 0.035;

                    leafGroup.position.set(
                      -viewWidth * (0.24 + index * 0.025) + xDrift,
                      prefersReducedMotion.matches
                        ? 0
                        : viewHeight / 2 + modelHeight / 2 - progress * (viewHeight + modelHeight),
                      0,
                    );
                    leafGroup.rotation.set(
                      prefersReducedMotion.matches ? 0 : progress * Math.PI * 2,
                      prefersReducedMotion.matches ? 0 : progress * Math.PI * 1.3,
                      prefersReducedMotion.matches ? 0 : Math.sin(progress * Math.PI * 2) * 0.3,
                    );
                  });
                  renderer.render(scene, camera);

                  if (visible && !prefersReducedMotion.matches) {
                    frameId = window.requestAnimationFrame(draw);
                  }
                };

                const setVisible = (isVisible) => {
                  visible = isVisible;
                  clock.start();
                  if (visible && !frameId) draw();
                  if (!visible && frameId) {
                    window.cancelAnimationFrame(frameId);
                    frameId = 0;
                  }
                };

                const visibilityObserver = new IntersectionObserver(([entry]) => {
                  setVisible(entry.isIntersecting);
                });
                visibilityObserver.observe(hero);
                new ResizeObserver(() => {
                  resize();
                  if (visible && prefersReducedMotion.matches) draw();
                }).observe(hero);
                prefersReducedMotion.addEventListener('change', draw);
                resize();
              },
              undefined,
              (error) => console.error('The hero 3D model could not be loaded.', error),
            );
          })
          .catch((error) => {
            console.error('Three.js could not be loaded for the hero model.', error);
          });
      };

      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(startModel, { timeout: 1500 });
      } else {
        window.setTimeout(startModel, 300);
      }
    }, { once: true });
  };

  const initHeroStats = () => {
    const stats = document.querySelector('.hero__stats');
    const index = stats?.querySelector('.hero__stat-index');
    const buttons = [...(index?.querySelectorAll('button[aria-controls]') ?? [])];
    if (!stats || !buttons.length) return;

    const cards = buttons
      .map((button) => document.getElementById(button.getAttribute('aria-controls')))
      .filter(Boolean);
    const mobileQuery = window.matchMedia('(max-width: 760px)');
    let activeIndex = -1;

    const updateActiveStat = (nextIndex) => {
      activeIndex = nextIndex;
      buttons.forEach((button, indexValue) => {
        const isActive = indexValue === activeIndex;
        button.setAttribute('aria-expanded', String(isActive));
        cards[indexValue].classList.toggle('is-mobile-active', isActive && mobileQuery.matches);
        cards[indexValue].setAttribute('aria-hidden', String(mobileQuery.matches && !isActive));
      });
    };

    buttons.forEach((button, indexValue) => {
      button.addEventListener('click', () => {
        updateActiveStat(activeIndex === indexValue ? -1 : indexValue);
      });
    });

    mobileQuery.addEventListener('change', () => updateActiveStat(-1));
    updateActiveStat(-1);
  };

  const initLazyProjectPreviews = () => {
    const frames = document.querySelectorAll('iframe[data-src]');
    const loadFrame = (frame) => {
      frame.src = frame.dataset.src;
      frame.removeAttribute('data-src');
    };

    if (!('IntersectionObserver' in window)) {
      frames.forEach(loadFrame);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        loadFrame(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '200px 0px' });

    frames.forEach((frame) => observer.observe(frame));
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
    const logo = loader.querySelector('.intro-loader__welcome img');
    const logoReady = new Promise((resolve) => {
      if (!logo || logo.complete) {
        if (logo && !logo.naturalWidth) {
          console.error('The loading logo could not be loaded.', logo.src);
        }
        resolve();
        return;
      }

      logo.addEventListener('load', resolve, { once: true });
      logo.addEventListener('error', () => {
        console.error('The loading logo could not be loaded.', logo.src);
        resolve();
      }, { once: true });
    });
    const fontsReady = document.fonts?.load('400 3rem Allura').catch((error) => {
      console.error('The loading font could not be loaded.', error);
    }) ?? Promise.resolve();
    const posterReady = video?.poster
      ? new Promise((resolve) => {
        const poster = new Image();
        poster.addEventListener('load', resolve, { once: true });
        poster.addEventListener('error', () => {
          console.error('The hero poster could not be loaded.', video.poster);
          resolve();
        }, { once: true });
        poster.src = video.poster;
        if (poster.complete) resolve();
      })
      : Promise.resolve();

    Promise.all([logoReady, fontsReady, posterReady]).then(() => {
      main.setAttribute('aria-busy', 'false');
      window.dispatchEvent(new Event('portfolio:ready'));

      if (window.gsap && !prefersReducedMotion.matches) {
        gsap.set(video?.closest('.hero'), { x: '-100vw', autoAlpha: 0, scale: 0.98 });
        gsap.set(nav, { autoAlpha: 0, y: -16 });
        gsap.set(loader, { x: 0 });
        document.body.classList.add('is-transitioning');
      }

      document.body.classList.remove('is-loading');
      initVideoPlayback();

      if (window.gsap && !prefersReducedMotion.matches) {
        const introTimeline = gsap.timeline({
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            loader.remove();
            document.body.classList.remove('is-transitioning');
          },
        });

        introTimeline
          .to(loader, { x: '100%', autoAlpha: 0, duration: 1, ease: 'power4.inOut' })
          .fromTo(video?.closest('.hero'), {
            x: '-100vw',
            autoAlpha: 0,
            scale: 0.98,
          }, {
            x: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 0.95,
            ease: 'power4.out',
          }, 0.08)
          .fromTo(nav, { autoAlpha: 0, y: -16 }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: 'power3.out',
          }, 0.52)
          .fromTo(brand, { x: -18, autoAlpha: 0 }, {
            x: 0,
            autoAlpha: 1,
            duration: 0.45,
          }, 0.62)
          .fromTo(links, { x: 24, autoAlpha: 0 }, {
            x: 0,
            autoAlpha: 1,
            duration: 0.45,
            stagger: { each: 0.07, from: 'end' },
          }, 0.64);

        return;
      }

      loader.classList.add('is-dismissed');
      window.setTimeout(() => loader.remove(), 350);
    });
  };

  const init = () => {
    initNavigation();
    initBackToTop();
    initHeroModel();
    initHeroStats();
    initProjectCarousel();
    initLazyProjectPreviews();
    initContactForm();
    initIntroLoader();
  };

  init();
})();
