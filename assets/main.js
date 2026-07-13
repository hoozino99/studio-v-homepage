(() => {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const cursor = document.getElementById('cursor');
  const heroScrub = document.querySelector('[data-hero-scrub]');
  const solidHeaderSection = document.querySelector('.stage-overview');
  const solidHeaderEndSection = document.querySelector('[data-stage-gallery]') || document.querySelector('[data-usecase-scene]');

  const onScroll = () => {
    if (!header) return;
    if (heroScrub && solidHeaderSection) {
      const headerHeight = header.offsetHeight || 0;
      const solidPoint = solidHeaderSection.offsetTop + Math.min(window.innerHeight * 0.08, 96) - headerHeight;
      const solidEndPoint = solidHeaderEndSection ? solidHeaderEndSection.offsetTop - headerHeight * 1.35 : Number.POSITIVE_INFINITY;
      header.classList.toggle('is-solid', window.scrollY >= solidPoint && window.scrollY < solidEndPoint);
      return;
    }
    header.classList.toggle('is-solid', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const ambientBackplate = document.querySelector('[data-ambient-backplate]');
  if (ambientBackplate) {
    const usecaseAnchor = document.querySelector('[data-usecase-scene]');
    let ticking = false;

    const updateAmbient = () => {
      ticking = false;
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - viewport);
      const progress = clamp(window.scrollY / maxScroll, 0, 1);
      const warmStart = solidHeaderSection ? solidHeaderSection.offsetTop - viewport * 0.35 : viewport * 0.5;
      const warmEnd = usecaseAnchor ? usecaseAnchor.offsetTop - viewport * 0.2 : warmStart + viewport * 1.5;
      const warmth = clamp((window.scrollY - warmStart) / Math.max(1, warmEnd - warmStart), 0, 1);
      const coolAlpha = 0.16 * (1 - warmth);
      const warmAlpha = 0.19 * warmth;

      document.body.style.setProperty('--ambient-progress', progress.toFixed(4));
      document.body.style.setProperty('--ambient-warmth', warmth.toFixed(4));
      document.body.style.setProperty('--ambient-cool-alpha', coolAlpha.toFixed(4));
      document.body.style.setProperty('--ambient-warm-alpha', warmAlpha.toFixed(4));
    };

    const requestAmbientUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateAmbient);
    };

    updateAmbient();
    window.addEventListener('scroll', requestAmbientUpdate, { passive: true });
    window.addEventListener('resize', requestAmbientUpdate);

    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('pointermove', (event) => {
        const x = ((event.clientX / Math.max(1, window.innerWidth)) - 0.5) * 2;
        const y = ((event.clientY / Math.max(1, window.innerHeight)) - 0.5) * 2;
        document.body.style.setProperty('--ambient-pointer-x', x.toFixed(3));
        document.body.style.setProperty('--ambient-pointer-y', y.toFixed(3));
      }, { passive: true });
    }
  }

  const depthHost = document.querySelector('main');
  const reducedDepthMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (depthHost && !document.body.matches('[data-page="tour"]')) {
    const depthCanvas = document.createElement('canvas');
    depthCanvas.className = 'depth-canvas depth-canvas--v06';
    depthCanvas.dataset.depthCanvas = 'depth-v06';
    depthCanvas.setAttribute('aria-hidden', 'true');
    depthHost.prepend(depthCanvas);
    document.body.classList.add('has-depth-v06');

    const depthContext = depthCanvas.getContext('2d', { alpha: true });
    if (depthContext) {
      const depthState = {
        width: 0,
        height: 0,
        pointerX: 0,
        pointerY: 0,
        targetX: 0,
        targetY: 0,
        compact: false,
        lastFrame: 0,
        frameId: 0
      };
      const lightRibbons = [
        { y: 0.17, amplitude: 0.08, depth: 0.28, width: 56, alpha: 0.055, phase: 0.4 },
        { y: 0.38, amplitude: 0.12, depth: 0.46, width: 92, alpha: 0.072, phase: 2.2 },
        { y: 0.62, amplitude: 0.10, depth: 0.68, width: 128, alpha: 0.082, phase: 4.1 },
        { y: 0.84, amplitude: 0.07, depth: 0.88, width: 168, alpha: 0.065, phase: 5.5 }
      ];

      const resizeDepthCanvas = () => {
        const width = window.innerWidth || document.documentElement.clientWidth;
        const height = window.innerHeight || document.documentElement.clientHeight;
        const compact = width < 780;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, compact ? 1 : 1.25);
        depthState.width = width;
        depthState.height = height;
        depthState.compact = compact;
        depthCanvas.width = Math.max(1, Math.round(width * pixelRatio));
        depthCanvas.height = Math.max(1, Math.round(height * pixelRatio));
        depthCanvas.style.width = `${width}px`;
        depthCanvas.style.height = `${height}px`;
        depthContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      };

      const traceRibbon = (baseY, amplitude, phase, offsetY = 0) => {
        const overscan = depthState.width * 0.12;
        const span = depthState.width + overscan * 2;
        const segments = depthState.compact ? 18 : 30;
        depthContext.beginPath();
        for (let index = 0; index <= segments; index += 1) {
          const ratio = index / segments;
          const x = -overscan + span * ratio;
          const primary = Math.sin(ratio * Math.PI * 2.15 + phase);
          const harmonic = Math.sin(ratio * Math.PI * 4.6 - phase * 0.74) * 0.28;
          const y = baseY + (primary + harmonic) * amplitude + offsetY;
          if (index === 0) depthContext.moveTo(x, y);
          else depthContext.lineTo(x, y);
        }
      };

      const drawLightRibbon = (ribbon, scrollPhase, timePhase, pointerX, pointerY) => {
        const { width, height } = depthState;
        const phase = ribbon.phase + timePhase * (0.34 + ribbon.depth * 0.2) + scrollPhase * (0.5 + ribbon.depth * 1.05);
        const baseY = height * ribbon.y + pointerY * height * ribbon.depth * 0.035;
        const amplitude = height * ribbon.amplitude;
        const offsetY = Math.sin(scrollPhase * 0.72 + ribbon.phase) * height * 0.045 * ribbon.depth;
        const ribbonGradient = depthContext.createLinearGradient(-width * 0.08, 0, width * 1.08, 0);
        ribbonGradient.addColorStop(0, 'rgba(111, 152, 161, 0)');
        ribbonGradient.addColorStop(0.22, `rgba(111, 152, 161, ${ribbon.alpha * 0.48})`);
        ribbonGradient.addColorStop(0.52 + pointerX * 0.06, `rgba(179, 210, 215, ${ribbon.alpha})`);
        ribbonGradient.addColorStop(0.78, `rgba(92, 137, 148, ${ribbon.alpha * 0.42})`);
        ribbonGradient.addColorStop(1, 'rgba(92, 137, 148, 0)');

        depthContext.save();
        depthContext.translate(pointerX * width * ribbon.depth * 0.024, 0);
        depthContext.strokeStyle = ribbonGradient;
        depthContext.lineCap = 'round';
        depthContext.lineJoin = 'round';
        depthContext.filter = `blur(${Math.round(ribbon.width * 0.28)}px)`;
        depthContext.lineWidth = ribbon.width;
        traceRibbon(baseY, amplitude, phase, offsetY);
        depthContext.stroke();

        depthContext.filter = `blur(${Math.max(2, Math.round(ribbon.width * 0.055))}px)`;
        depthContext.lineWidth = Math.max(1, ribbon.width * 0.032);
        depthContext.strokeStyle = `rgba(190, 219, 223, ${ribbon.alpha * 0.78})`;
        traceRibbon(baseY, amplitude, phase, offsetY);
        depthContext.stroke();
        depthContext.restore();
      };

      const drawRefractionVeil = (scrollPhase, timePhase, pointerX, pointerY) => {
        const { width, height } = depthState;
        const centerX = width * (0.72 + pointerX * 0.045);
        const veilWidth = width * (depthState.compact ? 0.42 : 0.30);
        const sway = Math.sin(scrollPhase * 0.68 + timePhase * 0.28) * width * 0.055;
        const gradient = depthContext.createLinearGradient(centerX - veilWidth, 0, centerX + veilWidth, 0);
        gradient.addColorStop(0, 'rgba(108, 151, 161, 0)');
        gradient.addColorStop(0.36, 'rgba(108, 151, 161, 0.015)');
        gradient.addColorStop(0.52, 'rgba(181, 211, 216, 0.065)');
        gradient.addColorStop(0.68, 'rgba(101, 143, 153, 0.018)');
        gradient.addColorStop(1, 'rgba(101, 143, 153, 0)');
        depthContext.save();
        depthContext.translate(sway, pointerY * height * 0.018);
        depthContext.rotate(-0.12 + pointerX * 0.018);
        depthContext.filter = `blur(${depthState.compact ? 34 : 52}px)`;
        depthContext.fillStyle = gradient;
        depthContext.fillRect(centerX - veilWidth, -height * 0.28, veilWidth * 2, height * 1.56);
        depthContext.restore();
      };

      const drawSignalTraces = (scrollPhase, timePhase, pointerX, pointerY) => {
        const { width, height, compact } = depthState;
        const traceCount = compact ? 3 : 5;
        for (let index = 0; index < traceCount; index += 1) {
          const depth = 0.32 + index * 0.13;
          const phase = timePhase * (0.22 + index * 0.035) - scrollPhase * (0.74 + depth) + index * 1.55;
          const baseY = height * (0.18 + index * 0.17) + pointerY * height * depth * 0.022;
          const amplitude = height * (0.018 + index * 0.005);
          depthContext.save();
          depthContext.translate(pointerX * width * depth * -0.018, 0);
          depthContext.strokeStyle = `rgba(164, 198, 204, ${0.032 + depth * 0.035})`;
          depthContext.lineWidth = index % 2 === 0 ? 0.9 : 0.55;
          depthContext.filter = 'blur(0.25px)';
          traceRibbon(baseY, amplitude, phase, 0);
          depthContext.stroke();
          depthContext.restore();
        }
      };

      const drawDepthCanvas = (time) => {
        const { width, height, compact } = depthState;
        if (!width || !height) return;
        const scroll = reducedDepthMotion.matches ? 0 : Math.max(0, window.scrollY);
        const timePhase = reducedDepthMotion.matches ? 0 : time * 0.00016;
        depthState.pointerX += (depthState.targetX - depthState.pointerX) * 0.055;
        depthState.pointerY += (depthState.targetY - depthState.pointerY) * 0.055;
        const pointerX = depthState.pointerX;
        const pointerY = depthState.pointerY;
        const scrollPhase = scroll / Math.max(1, height);

        depthContext.clearRect(0, 0, width, height);
        depthContext.save();
        depthContext.globalCompositeOperation = 'lighter';

        drawRefractionVeil(scrollPhase, timePhase, pointerX, pointerY);
        lightRibbons.forEach((ribbon) => {
          drawLightRibbon(ribbon, scrollPhase, timePhase, pointerX, pointerY);
        });
        drawSignalTraces(scrollPhase, timePhase, pointerX, pointerY);
        depthContext.restore();
      };

      const renderDepthCanvas = (time) => {
        const interval = depthState.compact ? 50 : 33;
        if (time - depthState.lastFrame >= interval) {
          depthState.lastFrame = time;
          drawDepthCanvas(time);
        }
        depthState.frameId = window.requestAnimationFrame(renderDepthCanvas);
      };

      resizeDepthCanvas();
      if (reducedDepthMotion.matches) {
        drawDepthCanvas(0);
      } else {
        depthState.frameId = window.requestAnimationFrame(renderDepthCanvas);
        window.addEventListener('pointermove', (event) => {
          depthState.targetX = ((event.clientX / Math.max(1, window.innerWidth)) - 0.5) * 2;
          depthState.targetY = ((event.clientY / Math.max(1, window.innerHeight)) - 0.5) * 2;
        }, { passive: true });
        document.addEventListener('visibilitychange', () => {
          if (document.hidden && depthState.frameId) {
            window.cancelAnimationFrame(depthState.frameId);
            depthState.frameId = 0;
          } else if (!document.hidden && !depthState.frameId) {
            depthState.lastFrame = 0;
            depthState.frameId = window.requestAnimationFrame(renderDepthCanvas);
          }
        });
      }
      window.addEventListener('resize', resizeDepthCanvas, { passive: true });
    }
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
      menuButton.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
    });
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuButton.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        document.body.classList.remove('menu-open');
      });
    });
  }

  if (heroScrub && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const video = heroScrub.querySelector('[data-hero-video]');
    const isLoopHero = video?.hasAttribute('data-hero-loop');
    let ticking = false;

    const updateHeroScrub = () => {
      ticking = false;
      const rect = heroScrub.getBoundingClientRect();
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      const scrollRange = Math.max(1, rect.height - viewport);
      const progress = clamp((0 - rect.top) / scrollRange, 0, 1);

      heroScrub.style.setProperty('--hero-progress', progress.toFixed(4));
      heroScrub.style.setProperty('--hero-content-exit', clamp(progress * 1.08, 0, 1).toFixed(4));
      heroScrub.style.setProperty('--hero-lift', `${(-1 - progress * 3.6).toFixed(2)}%`);
      heroScrub.style.setProperty('--hero-scale', (1.045 + progress * 0.045).toFixed(4));

      if (!isLoopHero && video && Number.isFinite(video.duration) && video.duration > 0) {
        const targetTime = Math.min(video.duration - 0.04, video.duration * progress);
        if (Math.abs(video.currentTime - targetTime) > 0.02) {
          try {
            video.currentTime = targetTime;
          } catch (_error) {}
        }
      }
    };

    const requestHeroScrubUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateHeroScrub);
    };

    if (video) {
      video.muted = true;
      video.playsInline = true;
      if (isLoopHero) {
        video.autoplay = true;
        video.loop = true;
        video.play().catch(() => {});
      } else {
        video.autoplay = false;
        video.loop = false;
        video.pause();
        video.addEventListener('loadedmetadata', requestHeroScrubUpdate, { once: true });
        video.addEventListener('canplay', requestHeroScrubUpdate, { once: true });
      }
    }
    updateHeroScrub();
    window.addEventListener('scroll', requestHeroScrubUpdate, { passive: true });
    window.addEventListener('resize', requestHeroScrubUpdate);
  }

  const homeProjects = document.querySelector('[data-home-projects]');
  if (homeProjects) {
    const projectAssetVersion = 'studio-v-lsf-thumb-01';
    const versionedProjectAsset = (url) => url && url.startsWith('./') ? `${url}?v=${projectAssetVersion}` : url;
    const projects = [
      {
        title: 'Cube of Memory',
        format: 'Virtual Production Film',
        image: './assets/video/showreel-thumbs/cube-main-film.jpg'
      },
      {
        title: 'AION 2',
        format: 'AD',
        image: './assets/video/showreel-thumbs/aion2.jpg'
      },
      {
        title: 'Dealer',
        format: 'AD',
        image: './assets/video/showreel-thumbs/dealer.jpg'
      },
      {
        title: 'LE SSERAFIM x Overwatch',
        format: 'Music Video',
        image: './assets/video/showreel-thumbs/le-sserafim-overwatch.jpg'
      },
      {
        title: 'StudioCube Opening',
        format: 'Launch Film',
        image: './assets/video/showreel-thumbs/studiocube-opening.jpg'
      },
      {
        title: 'Beyond the Set',
        format: 'VP Showcase',
        image: './assets/video/showreel-thumbs/beyond-the-set.jpg'
      },
      {
        title: 'VP Technical Seminar',
        format: 'Technology Demonstration',
        image: './assets/video/showreel-thumbs/seminar-making.jpg'
      },
      {
        title: 'Genesis GV90 1',
        format: 'AD',
        restricted: true
      },
      {
        title: 'Genesis GV90 2',
        format: 'AD',
        restricted: true
      },
      {
        title: 'Avante DN8',
        format: 'AD',
        restricted: true
      },
    ];
    const renderProjectMedia = (project) => project.restricted
      ? `<div class="project-restricted-thumb" aria-label="${project.title} image restricted">
          <span>Confidential</span>
          <strong>${project.title}</strong>
        </div>`
      : project.pendingThumbnail
        ? `<div class="project-pending-thumb" aria-label="${project.title} thumbnail pending">
            <span>${project.pendingLabel || 'Thumbnail Pending'}</span>
            <strong>${project.title}</strong>
          </div>`
      : `<img src="${versionedProjectAsset(project.image)}" alt="" loading="eager" fetchpriority="low" decoding="async">`;
    const cardMarkup = projects.map((project, index) => `
      <article class="home-project-card${project.restricted ? ' home-project-card--restricted' : ''}">
        ${renderProjectMedia(project)}
        <div class="home-project-card-copy">
          <span>${String(index + 1).padStart(2, '0')} / ${project.format}</span>
          <strong>${project.title}</strong>
        </div>
      </article>
    `).join('');

    homeProjects.innerHTML = `
      <div class="home-projects-copy reveal">
        <p class="section-kicker">Projects</p>
        <h2>Made at Studio V.</h2>
      </div>
      <div class="home-project-marquee reveal" aria-label="Studio V project highlights">
        <div class="home-project-track">
          <div class="home-project-set" data-project-set>${cardMarkup}</div>
          <div class="home-project-set" aria-hidden="true">${cardMarkup}</div>
        </div>
      </div>
    `;

    const projectMarquee = homeProjects.querySelector('.home-project-marquee');
    const projectTrack = homeProjects.querySelector('.home-project-track');
    const projectSet = homeProjects.querySelector('[data-project-set]');
    if (projectMarquee && projectTrack && projectSet) {
      let projectInView = false;
      const syncProjectLoop = () => {
        const trackStyles = window.getComputedStyle(projectTrack);
        const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap) || 0;
        const loopDistance = Math.round(projectSet.getBoundingClientRect().width + gap);
        projectTrack.style.setProperty('--project-loop-distance', `${-loopDistance}px`);
      };
      const updateProjectPlayback = () => {
        projectTrack.classList.toggle('is-running', projectInView && !document.hidden);
      };

      window.requestAnimationFrame(syncProjectLoop);
      window.addEventListener('resize', syncProjectLoop, { passive: true });
      if ('ResizeObserver' in window) {
        new ResizeObserver(syncProjectLoop).observe(projectSet);
      }
      if ('IntersectionObserver' in window) {
        const projectObserver = new IntersectionObserver((entries) => {
          projectInView = entries.some((entry) => entry.isIntersecting);
          updateProjectPlayback();
        }, { threshold: 0.08 });
        projectObserver.observe(projectMarquee);
      } else {
        projectInView = true;
        updateProjectPlayback();
      }
      document.addEventListener('visibilitychange', updateProjectPlayback);
    }
  }

  const partnerStrips = [...document.querySelectorAll('[data-partner-strip]')];
  if (partnerStrips.length) {
    const primaryPartnerLogos = [
      ['lg-electronics', 'LG전자', './assets/images/partners-plaque-rectified/lg-electronics.png', 'plaque'],
      ['brompton-technology', 'Brompton Technology', './assets/images/partners-official/brompton-technology.webp', 'official'],
      ['arri', 'ARRI', './assets/images/partners-official/arri.svg', 'official'],
      ['av-stumpfl', 'AV Stumpfl', './assets/images/partners-official/av-stumpfl.svg', 'official'],
      ['mbc-ci', 'MBC C&I', './assets/images/partners-official/mbc-ci.png', 'official'],
      ['optitrack', 'OptiTrack', './assets/images/partners-official/optitrack.svg', 'official'],
    ];
    const supportPartnerLogos = [
      ['saeki-pnc', 'SAEKI P&C', './assets/images/partners-plaque-rectified/saeki-official.png', 'plaque'],
      ['kol-corporation', '주식회사 고일', './assets/images/partners-plaque-rectified/kol-corporation.png', 'plaque'],
      ['petadata', 'PetaData', './assets/images/partners-plaque-rectified/petadata.png', 'plaque'],
      ['myungin-enc', '명인이앤씨', './assets/images/partners-plaque-rectified/myungin-enc.png', 'plaque'],
      ['vision-tech', 'VISION&TECH', './assets/images/partners-plaque-rectified/vision-tech.png', 'plaque'],
      ['bx-media', '비윙스미디어', './assets/images/partners-plaque-rectified/bx-media.png', 'plaque'],
      ['sewon-sp', 'SEWON · SP Studio Perspective', './assets/images/partners-plaque-rectified/sewon-sp.png', 'plaque'],
      ['cms', 'CMS', './assets/images/partners-plaque-rectified/cms.png', 'plaque'],
      ['livelab', 'LIVELAB', './assets/images/partners-plaque-rectified/livelab.png', 'plaque'],
      ['media-village-tech', '미디어빌리지테크', './assets/images/partners-plaque-rectified/media-village-tech.png', 'plaque'],
      ['leader', 'Leader', './assets/images/partners-plaque-rectified/leader.png', 'plaque'],
      ['hm-vision', 'HM vision', './assets/images/partners-plaque-rectified/hm-vision.png', 'plaque'],
      ['dhav', 'DHAV', './assets/images/partners-plaque-rectified/dhav.png', 'plaque'],
      ['funomad', 'FUNOMAD', './assets/images/partners-plaque-rectified/funomad.png', 'plaque'],
      ['vidente', 'vidente', './assets/images/partners-plaque-rectified/vidente.png', 'plaque'],
      ['batech', 'BATECH', './assets/images/partners-plaque-rectified/batech.png', 'plaque'],
      ['doohyun-tech', 'DOOHYUN TECH', './assets/images/partners-plaque-rectified/doohyun-tech.png', 'plaque'],
      ['epic-games', 'Epic Games', './assets/images/partners-official/epic-games.svg', 'official'],
    ];

    const logoMarkup = (logos, tier) => logos.map(([slug, name, src, source], index) => `
      <li class="partner-logo-card partner-logo-card--${source} partner-logo-card--${tier}" data-logo="${slug}" style="--logo-delay: ${Math.min(index, 11) * 22}ms">
        <img src="${src}?v=studio-v-partner-rectified-v02" alt="${name}" loading="lazy" decoding="async">
      </li>
    `).join('');

    partnerStrips.forEach((strip) => {
      strip.innerHTML = `
        <div class="partner-strip-inner">
          <div class="partner-strip-copy reveal">
            <p>Powered by</p>
            <h2>Technology Partners</h2>
          </div>
          <ul class="partner-logo-wall partner-logo-wall--primary reveal" aria-label="Studio V primary technology partners">
            ${logoMarkup(primaryPartnerLogos, 'primary')}
          </ul>
          <ul class="partner-logo-wall partner-logo-wall--supporting reveal" aria-label="Studio V equipment suppliers">
            ${logoMarkup(supportPartnerLogos, 'supporting')}
          </ul>
        </div>
      `;
    });
  }

  const revealItems = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const stageGallery = document.querySelector('[data-stage-gallery]');
  if (stageGallery && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const frames = [...stageGallery.querySelectorAll('.stage-scroll-frame')];
    const count = stageGallery.querySelector('[data-stage-count]');
    const title = stageGallery.querySelector('[data-stage-title]');
    const caption = stageGallery.querySelector('[data-stage-caption]');
    const progressBar = stageGallery.querySelector('[data-stage-progress]');
    let activeIndex = -1;
    let ticking = false;

    const setActiveFrame = (index) => {
      if (index === activeIndex) return;
      activeIndex = index;
      frames.forEach((frame, frameIndex) => {
        frame.classList.toggle('is-active', frameIndex === index);
        frame.classList.toggle('is-before', frameIndex < index);
      });
      const frame = frames[index];
      if (!frame) return;
      if (count) count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')}`;
      if (title) title.textContent = frame.dataset.title || '';
      if (caption) caption.textContent = frame.dataset.caption || '';
    };

    const setStageFrameProgress = (frameProgress) => {
      const framePosition = clamp(frameProgress, 0, 1) * Math.max(0, frames.length - 1);
      const nextIndex = Math.round(framePosition);
      frames.forEach((frame, frameIndex) => {
        const offset = frameIndex - framePosition;
        const distance = Math.abs(offset);
        const opacity = clamp(1 - distance * 1.25, 0, 1);
        frame.style.setProperty('--stage-frame-opacity', opacity.toFixed(4));
        frame.style.setProperty('--stage-frame-offset', offset.toFixed(4));
        frame.style.setProperty('--stage-frame-scale', (1 + Math.min(distance, 1) * 0.012).toFixed(4));
        frame.classList.toggle('is-active', frameIndex === nextIndex);
        frame.classList.toggle('is-before', frameIndex < nextIndex);
      });
      setActiveFrame(nextIndex);
    };

    const updateStageGallery = () => {
      ticking = false;
      const rect = stageGallery.getBoundingClientRect();
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      const galleryTop = rect.top + window.scrollY;
      const start = galleryTop - viewport * 0.16;
      const end = galleryTop + stageGallery.offsetHeight - viewport * 0.28;
      const travel = Math.max(1, end - start);
      const progress = clamp((window.scrollY - start) / travel, 0, 1);
      const frameProgress = clamp((progress - 0.04) / 0.84, 0, 1);
      const copyExit = clamp((progress - 0.95) / 0.05, 0, 1);
      setStageFrameProgress(frameProgress);
      stageGallery.style.setProperty('--stage-copy-exit', copyExit.toFixed(4));
      if (progressBar) progressBar.style.setProperty('--stage-progress', `${progress * 100}%`);
    };

    const requestStageGalleryUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateStageGallery);
    };

    updateStageGallery();
    window.addEventListener('scroll', requestStageGalleryUpdate, { passive: true });
    window.addEventListener('resize', requestStageGalleryUpdate);
  }

  const usecaseScene = document.querySelector('[data-usecase-scene]');
  if (usecaseScene) {
    const options = [...usecaseScene.querySelectorAll('[data-usecase-option]')];
    const backgrounds = [...usecaseScene.querySelectorAll('[data-usecase-bg]')];
    const slideGroups = backgrounds.map((background) => [...background.querySelectorAll('[data-usecase-slide]')]);
    const frames = slideGroups.flatMap((slides, backgroundIndex) => (
      slides.map((slide, slideIndex) => ({
        backgroundIndex,
        slideIndex,
        slide,
      }))
    ));
    const frameIndexByBackground = backgrounds.map((_, backgroundIndex) => {
      const frameIndex = frames.findIndex((frame) => frame.backgroundIndex === backgroundIndex);
      return frameIndex === -1 ? 0 : frameIndex;
    });
    const scrollUsecaseQuery = window.matchMedia('(min-width: 781px)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeIndex = -1;
    let ticking = false;

    const shouldUseScrollUsecase = () => (
      scrollUsecaseQuery.matches
      && !reducedMotionQuery.matches
      && frames.length > 1
    );

    const setActiveUsecase = (index) => {
      if (!options.length) return;
      const nextIndex = clamp(index, 0, options.length - 1);
      if (nextIndex === activeIndex) return;
      activeIndex = nextIndex;
      options.forEach((option, optionIndex) => {
        const isActive = optionIndex === nextIndex;
        option.classList.toggle('is-active', isActive);
        option.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    };

    const setStaticUsecase = (index) => {
      const nextIndex = clamp(index, 0, Math.max(0, backgrounds.length - 1));
      usecaseScene.style.setProperty('--usecase-scroll-progress', '0');
      usecaseScene.style.setProperty('--usecase-copy-exit', '0');
      usecaseScene.style.setProperty('--usecase-scene-exit', '0');
      usecaseScene.style.setProperty('--usecase-image-lift', '0');
      usecaseScene.style.setProperty('--usecase-sheen-opacity', '0.24');
      setActiveUsecase(nextIndex);
      backgrounds.forEach((background, backgroundIndex) => {
        const isActive = backgroundIndex === nextIndex;
        background.style.setProperty('--usecase-bg-opacity', isActive ? '1' : '0');
        background.style.setProperty('--usecase-bg-x', isActive ? '0' : '2vw');
        background.style.setProperty('--usecase-bg-scale', isActive ? '1' : '1.012');
        background.classList.toggle('is-active', isActive);
      });
      slideGroups.forEach((slides, backgroundIndex) => {
        slides.forEach((slide, slideIndex) => {
          const isActive = backgroundIndex === nextIndex && slideIndex === 0;
          slide.style.setProperty('--usecase-slide-opacity', isActive ? '1' : '0');
          slide.style.setProperty('--usecase-slide-x', '0');
          slide.style.setProperty('--usecase-slide-scale', isActive ? '1' : '1.012');
          slide.classList.toggle('is-active', isActive);
        });
      });
    };

    const setUsecaseFrame = (frameProgress) => {
      if (!frames.length) {
        setActiveUsecase(0);
        return;
      }

      const maxFrame = Math.max(0, frames.length - 1);
      const normalizedProgress = clamp(frameProgress, 0, 1);
      const framePosition = normalizedProgress * maxFrame;
      const activeFrameIndex = frames.length <= 1
        ? 0
        : Math.min(maxFrame, Math.round(framePosition));
      const activeFrame = frames[activeFrameIndex] || frames[0];

      frames.forEach((frame, frameIndex) => {
        const offset = frameIndex - framePosition;
        const distance = Math.abs(offset);
        const isActive = frameIndex === activeFrameIndex;
        const opacity = clamp(1 - distance * 1.2, 0, 1);
        const scale = 1 + Math.min(distance, 1) * 0.012;

        frame.slide.style.setProperty('--usecase-slide-opacity', opacity.toFixed(4));
        frame.slide.style.setProperty('--usecase-slide-x', `${(offset * 4.5).toFixed(3)}vw`);
        frame.slide.style.setProperty('--usecase-slide-scale', scale.toFixed(4));
        frame.slide.classList.toggle('is-active', isActive);
      });

      backgrounds.forEach((background, backgroundIndex) => {
        const groupFrames = frames.filter((frame) => frame.backgroundIndex === backgroundIndex);
        const opacity = groupFrames.reduce((maximum, frame) => {
          const frameIndex = frames.indexOf(frame);
          return Math.max(maximum, clamp(1 - Math.abs(frameIndex - framePosition) * 1.2, 0, 1));
        }, 0);
        const isActive = backgroundIndex === activeFrame.backgroundIndex;
        const scale = 1 + (1 - opacity) * 0.01;
        background.style.setProperty('--usecase-bg-opacity', opacity.toFixed(4));
        background.style.setProperty('--usecase-bg-x', '0');
        background.style.setProperty('--usecase-bg-scale', scale.toFixed(4));
        background.classList.toggle('is-active', isActive);
      });

      setActiveUsecase(activeFrame.backgroundIndex);
    };

    const updateUsecaseByScroll = () => {
      ticking = false;
      if (!shouldUseScrollUsecase()) {
        setStaticUsecase(activeIndex < 0 ? 0 : activeIndex);
        return;
      }
      const rect = usecaseScene.getBoundingClientRect();
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      const sectionTop = rect.top + window.scrollY;
      const start = sectionTop;
      const end = sectionTop + usecaseScene.offsetHeight - viewport * 0.18;
      const travel = Math.max(1, end - start);
      const progress = clamp((window.scrollY - start) / travel, 0, 1);
      const frameProgress = clamp((progress - 0.04) / 0.84, 0, 1);
      usecaseScene.style.setProperty('--usecase-scroll-progress', progress.toFixed(4));
      usecaseScene.style.setProperty('--usecase-copy-exit', '0');
      usecaseScene.style.setProperty('--usecase-scene-exit', '0');
      usecaseScene.style.setProperty('--usecase-image-lift', '0');
      usecaseScene.style.setProperty('--usecase-sheen-opacity', '0.20');
      setUsecaseFrame(frameProgress);
    };

    const requestUsecaseUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateUsecaseByScroll);
    };

    const scrollToUsecase = (index) => {
      if (!shouldUseScrollUsecase()) {
        setStaticUsecase(index);
        return;
      }
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      const sectionTop = usecaseScene.getBoundingClientRect().top + window.scrollY;
      const start = sectionTop;
      const end = sectionTop + usecaseScene.offsetHeight - viewport * 0.18;
      const travel = Math.max(1, end - start);
      const frameIndex = frameIndexByBackground[index] || 0;
      const progress = frames.length > 1 ? frameIndex / frames.length : 0;
      const scrollProgress = progress * 0.86;
      window.scrollTo({
        top: start + scrollProgress * travel,
        behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
      });
    };

    options.forEach((option, index) => {
      option.addEventListener('mouseenter', () => {
        if (!shouldUseScrollUsecase()) setStaticUsecase(index);
      });
      option.addEventListener('focus', () => {
        if (!shouldUseScrollUsecase()) setStaticUsecase(index);
      });
      option.addEventListener('click', () => scrollToUsecase(index));
    });

    setStaticUsecase(0);
    updateUsecaseByScroll();
    window.addEventListener('scroll', requestUsecaseUpdate, { passive: true });
    window.addEventListener('resize', requestUsecaseUpdate);
    if (scrollUsecaseQuery.addEventListener) {
      scrollUsecaseQuery.addEventListener('change', requestUsecaseUpdate);
      reducedMotionQuery.addEventListener('change', requestUsecaseUpdate);
    }
  }

  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    const move = (event) => {
      x = event.clientX;
      y = event.clientY;
      cursor.classList.add('is-visible');
    };
    const tick = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(tick);
    };
    document.addEventListener('mousemove', move, { passive: true });
    document.querySelectorAll('a, button, input, select, textarea, canvas').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
    tick();
  }

})();
