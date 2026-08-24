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
  const debugParams = new URLSearchParams(window.location.search);
  document.body.classList.toggle('is-logo-grid', debugParams.get('logoGrid') === '1');

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
  const hasDepthLayout = depthHost && !document.body.matches('[data-page="tour"]');
  // Page-wide depth now comes from CSS light fields and card motion only.
  // Stage, ceiling/truss, and rig photographs remain available in their real
  // content sections but are never reused as a fixed global background.
  const usesGlobalPhotoDepth = false;
  if (hasDepthLayout) {
    document.body.classList.add('has-depth-v08', 'has-depth-v11', 'has-depth-v12');
  }
  if (usesGlobalPhotoDepth) {
    const depthCanvas = document.createElement('canvas');
    depthCanvas.className = 'depth-canvas depth-canvas--v08 depth-canvas--v11 depth-canvas--v12';
    depthCanvas.dataset.depthCanvas = 'depth-v12';
    depthCanvas.setAttribute('aria-hidden', 'true');
    depthHost.prepend(depthCanvas);

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
        visualScroll: Math.max(0, window.scrollY) / Math.max(1, window.innerHeight),
        lastScroll: Math.max(0, window.scrollY),
        scrollVelocity: 0,
        lastFrame: 0,
        frameId: 0
      };
      const silhouetteSources = [
        {
          src: './assets/images/stage-gallery-led-wall-wide.jpg',
          mode: 'led',
          depth: 0.18,
          opacity: 0.105,
          scale: 1.14,
          blur: 6,
          focusY: 0.22,
          phase: 0.4
        },
        {
          src: './assets/images/stage-gallery-ceiling-led.jpg',
          mode: 'truss',
          depth: 0.48,
          opacity: 0.148,
          scale: 1.20,
          blur: 3.2,
          focusY: 0.08,
          phase: 2.3
        },
        {
          src: './assets/images/optimized/overview-1.jpg',
          mode: 'rig',
          depth: 0.82,
          opacity: 0.098,
          scale: 1.27,
          blur: 7,
          focusY: 0.56,
          phase: 4.7
        }
      ];
      const silhouetteLayers = [];
      const grainCanvas = document.createElement('canvas');
      grainCanvas.width = 96;
      grainCanvas.height = 96;
      const grainContext = grainCanvas.getContext('2d');
      if (grainContext) {
        const grain = grainContext.createImageData(grainCanvas.width, grainCanvas.height);
        for (let index = 0; index < grain.data.length; index += 4) {
          const value = 112 + Math.round(Math.random() * 72);
          grain.data[index] = value;
          grain.data[index + 1] = value;
          grain.data[index + 2] = value;
          grain.data[index + 3] = Math.round(Math.random() * 30);
        }
        grainContext.putImageData(grain, 0, 0);
      }
      const grainPattern = grainContext ? depthContext.createPattern(grainCanvas, 'repeat') : null;

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

      const buildSilhouette = (source, image) => {
        const buffer = document.createElement('canvas');
        const targetWidth = Math.min(960, image.naturalWidth || image.width || 960);
        const ratio = (image.naturalHeight || image.height || 540) / Math.max(1, image.naturalWidth || image.width || 960);
        buffer.width = Math.max(1, Math.round(targetWidth));
        buffer.height = Math.max(1, Math.round(targetWidth * ratio));
        const bufferContext = buffer.getContext('2d', { willReadFrequently: true });
        if (!bufferContext) return null;

        bufferContext.drawImage(image, 0, 0, buffer.width, buffer.height);
        const imageData = bufferContext.getImageData(0, 0, buffer.width, buffer.height);
        const pixels = imageData.data;
        const sourcePixels = new Uint8ClampedArray(pixels);
        const stride = buffer.width * 4;

        for (let y = 0; y < buffer.height; y += 1) {
          const edgeY = Math.min(buffer.height - 1, y + 1);
          const verticalFeather = Math.min(1, y / Math.max(1, buffer.height * 0.10), (buffer.height - 1 - y) / Math.max(1, buffer.height * 0.10));
          for (let x = 0; x < buffer.width; x += 1) {
            const edgeX = Math.min(buffer.width - 1, x + 1);
            const index = y * stride + x * 4;
            const rightIndex = y * stride + edgeX * 4;
            const downIndex = edgeY * stride + x * 4;
            const luminance = sourcePixels[index] * 0.2126 + sourcePixels[index + 1] * 0.7152 + sourcePixels[index + 2] * 0.0722;
            const rightLuminance = sourcePixels[rightIndex] * 0.2126 + sourcePixels[rightIndex + 1] * 0.7152 + sourcePixels[rightIndex + 2] * 0.0722;
            const downLuminance = sourcePixels[downIndex] * 0.2126 + sourcePixels[downIndex + 1] * 0.7152 + sourcePixels[downIndex + 2] * 0.0722;
            const edge = Math.abs(luminance - rightLuminance) + Math.abs(luminance - downLuminance);
            const darkness = Math.max(0, 112 - luminance);
            const horizontalFeather = Math.min(1, x / Math.max(1, buffer.width * 0.10), (buffer.width - 1 - x) / Math.max(1, buffer.width * 0.10));
            const feather = clamp(horizontalFeather * verticalFeather, 0, 1);
            let strength = 0;

            if (source.mode === 'truss') strength = Math.max(0, edge - 7) * 2.7 + darkness * 0.16;
            else if (source.mode === 'rig') strength = Math.max(0, edge - 9) * 2.2 + darkness * 0.12;
            else strength = Math.max(0, edge - 6) * 2.35 + darkness * 0.045;

            pixels[index] = 142;
            pixels[index + 1] = 174;
            pixels[index + 2] = 181;
            pixels[index + 3] = Math.round(clamp(strength * feather, 0, 150));
          }
        }
        bufferContext.putImageData(imageData, 0, 0);
        return { ...source, image: buffer };
      };

      silhouetteSources.forEach((source) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => {
          const layer = buildSilhouette(source, image);
          if (layer) silhouetteLayers.push(layer);
          if (reducedDepthMotion.matches) drawDepthCanvas(0);
        };
        image.src = source.src;
      });

      const drawImageCover = (image, scale, focusY, offsetX, offsetY) => {
        const { width, height } = depthState;
        const baseScale = Math.max(width / image.width, height / image.height) * scale;
        const drawWidth = image.width * baseScale;
        const drawHeight = image.height * baseScale;
        const x = (width - drawWidth) * 0.5 + offsetX;
        const y = (height - drawHeight) * focusY + offsetY;
        depthContext.drawImage(image, x, y, drawWidth, drawHeight);
      };

      const drawSilhouetteLayer = (layer, scrollPhase, timePhase, pointerX, pointerY, velocity) => {
        const { width, height, compact } = depthState;
        const phase = layer.phase + scrollPhase * (0.28 + layer.depth * 0.18) + timePhase * 0.05;
        const pointerScale = compact ? 0 : 1;
        const compactScale = compact ? 0.64 : 1;
        const offsetX = (
          Math.sin(phase) * width * 0.054 * layer.depth
          + Math.sin(scrollPhase * 0.22 + layer.phase) * width * 0.030 * layer.depth
          + pointerX * width * 0.052 * layer.depth * pointerScale
        ) * compactScale;
        const offsetY = (
          Math.cos(phase * 0.78) * height * 0.066 * layer.depth
          + Math.sin(scrollPhase * 0.43 + layer.phase * 0.72) * height * 0.055 * layer.depth
          + pointerY * height * 0.040 * layer.depth * pointerScale
          + velocity * height * 0.72 * layer.depth
        ) * compactScale;
        const interactionLift = compact
          ? 1
          : 1 + Math.min(0.20, (Math.abs(pointerX) + Math.abs(pointerY)) * 0.045 + Math.abs(velocity) * 0.9);
        depthContext.save();
        depthContext.globalCompositeOperation = 'screen';
        depthContext.globalAlpha = layer.opacity * (compact ? 0.72 : interactionLift);
        depthContext.filter = `blur(${compact ? Math.max(3, layer.blur * 0.72) : layer.blur}px)`;
        drawImageCover(layer.image, compact ? layer.scale * 1.16 : layer.scale, layer.focusY, offsetX, offsetY);
        depthContext.restore();
      };

      const drawStageLight = (scrollPhase, pointerX, pointerY) => {
        const { width, height, compact } = depthState;
        const center = height * (0.46 + Math.sin(scrollPhase * 0.31) * 0.05 + pointerY * 0.015);
        const light = depthContext.createLinearGradient(0, center - height * 0.34, width, center + height * 0.30);
        light.addColorStop(0, 'rgba(88, 130, 140, 0)');
        light.addColorStop(0.40 + pointerX * 0.025, 'rgba(123, 166, 174, 0.018)');
        light.addColorStop(0.58, 'rgba(181, 207, 211, 0.036)');
        light.addColorStop(0.78, 'rgba(98, 139, 148, 0.010)');
        light.addColorStop(1, 'rgba(88, 130, 140, 0)');
        depthContext.save();
        depthContext.globalCompositeOperation = 'screen';
        depthContext.filter = `blur(${compact ? 34 : 58}px)`;
        depthContext.fillStyle = light;
        depthContext.fillRect(-width * 0.08, -height * 0.12, width * 1.16, height * 1.24);
        depthContext.restore();
      };

      const drawGrain = (scrollPhase) => {
        if (!grainPattern) return;
        const { width, height } = depthState;
        depthContext.save();
        depthContext.globalCompositeOperation = 'soft-light';
        depthContext.globalAlpha = depthState.compact ? 0.034 : 0.045;
        depthContext.translate((scrollPhase * 13) % 96, (scrollPhase * -9) % 96);
        depthContext.fillStyle = grainPattern;
        depthContext.fillRect(-96, -96, width + 192, height + 192);
        depthContext.restore();
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
        const targetScroll = scroll / Math.max(1, height);
        const scrollDelta = (scroll - depthState.lastScroll) / Math.max(1, height);
        depthState.lastScroll = scroll;
        depthState.scrollVelocity += (clamp(scrollDelta, -0.16, 0.16) - depthState.scrollVelocity) * 0.28;
        depthState.scrollVelocity *= 0.88;
        depthState.visualScroll += (targetScroll - depthState.visualScroll) * 0.075;
        const scrollPhase = depthState.visualScroll;
        const velocity = depthState.scrollVelocity;

        depthContext.clearRect(0, 0, width, height);
        drawStageLight(scrollPhase, pointerX, pointerY);
        silhouetteLayers
          .slice()
          .sort((a, b) => a.depth - b.depth)
          .forEach((layer) => {
            drawSilhouetteLayer(layer, scrollPhase, timePhase, pointerX, pointerY, velocity);
          });
        drawGrain(scrollPhase);
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

  if (window.matchMedia('(pointer: fine)').matches && !reducedDepthMotion.matches) {
    const mediaSelector = '.home-project-card, .work-card-link, .showreel-card';
    let activeMediaCard = null;
    const resetMediaDepth = (card) => {
      if (!card) return;
      card.style.setProperty('--media-depth-x', '0px');
      card.style.setProperty('--media-depth-y', '0px');
    };

    document.addEventListener('pointermove', (event) => {
      const card = event.target.closest?.(mediaSelector);
      if (!card) {
        if (activeMediaCard) resetMediaDepth(activeMediaCard);
        activeMediaCard = null;
        return;
      }
      if (activeMediaCard && activeMediaCard !== card) resetMediaDepth(activeMediaCard);
      activeMediaCard = card;
      const bounds = card.getBoundingClientRect();
      const x = clamp((event.clientX - bounds.left) / Math.max(1, bounds.width) - 0.5, -0.5, 0.5);
      const y = clamp((event.clientY - bounds.top) / Math.max(1, bounds.height) - 0.5, -0.5, 0.5);
      card.style.setProperty('--media-depth-x', `${(x * -10).toFixed(2)}px`);
      card.style.setProperty('--media-depth-y', `${(y * -8).toFixed(2)}px`);
    }, { passive: true });

    document.addEventListener('pointerout', (event) => {
      const card = event.target.closest?.(mediaSelector);
      if (!card || card.contains(event.relatedTarget)) return;
      resetMediaDepth(card);
      if (activeMediaCard === card) activeMediaCard = null;
    }, { passive: true });
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

  const heroVideo = heroScrub?.querySelector('[data-hero-video]');
  const isLoopHero = heroVideo?.hasAttribute('data-hero-loop');

  const playLoopHero = () => {
    if (!heroVideo || !isLoopHero) return;
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;
    heroVideo.autoplay = true;
    heroVideo.loop = true;
    heroVideo.controls = false;
    heroVideo.setAttribute('muted', '');
    heroVideo.setAttribute('playsinline', '');
    heroVideo.setAttribute('webkit-playsinline', '');
    heroVideo.removeAttribute('controls');
    heroVideo.play().catch(() => {});
  };

  if (heroVideo && isLoopHero) {
    playLoopHero();
    heroVideo.addEventListener('loadeddata', playLoopHero, { once: true });
    heroVideo.addEventListener('canplay', playLoopHero, { once: true });
    window.addEventListener('pageshow', playLoopHero);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) playLoopHero();
    });
    document.addEventListener('pointerdown', playLoopHero, { once: true, passive: true });
    document.addEventListener('touchstart', playLoopHero, { once: true, passive: true });
  }

  if (heroScrub && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const video = heroVideo;
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
        playLoopHero();
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
      ['lg-electronics', 'LG전자', './assets/images/partners-official/lg-electronics-ko-white.png', 'official'],
      ['brompton-technology', 'Brompton Technology', './assets/images/partners-official/brompton-technology.webp', 'official'],
      ['arri', 'ARRI', './assets/images/partners-official/arri.svg', 'official'],
      ['av-stumpfl', 'AV Stumpfl', './assets/images/partners-official/av-stumpfl.svg', 'official'],
      ['mbc-ci', 'MBC C&I', './assets/images/partners-official/mbc-ci.png', 'official'],
      ['optitrack', 'OptiTrack', './assets/images/partners-official/optitrack.svg', 'official'],
    ];
    const supportPartnerLogos = [
      ['epic-games', 'Epic Games', './assets/images/partners-official/epic-games.svg', 'official'],
      ['saeki-pnc', 'SAEKI P&C', './assets/images/partners-plaque-leveled-v14/saeki-official.png', 'plaque'],
      ['kol-corporation', '주식회사 고일', './assets/images/partners-plaque-leveled-v14/kol-corporation.png', 'plaque'],
      ['petadata', 'PetaData', './assets/images/partners-plaque-leveled-v14/petadata.png', 'plaque'],
      ['myungin-enc', '명인이앤씨', './assets/images/partners-plaque-leveled-v14/myungin-enc.png', 'plaque'],
      ['vision-tech', 'VISION&TECH', './assets/images/partners-plaque-leveled-v14/vision-tech.png', 'plaque'],
      ['bx-media', '비윙스미디어', './assets/images/partners-plaque-leveled-v14/bx-media.png', 'plaque'],
      ['sewon-sp', 'SEWON · SP Studio Perspective', './assets/images/partners-plaque-leveled-v14/sewon-sp.png', 'plaque'],
      ['cms', 'CMS', './assets/images/partners-plaque-leveled-v14/cms.png', 'plaque'],
      ['livelab', 'LIVELAB', './assets/images/partners-plaque-leveled-v14/livelab.png', 'plaque'],
      ['media-village-tech', '미디어빌리지테크', './assets/images/partners-official/media-village-tech.png', 'official'],
      ['leader', 'Leader', './assets/images/partners-plaque-leveled-v14/leader.png', 'plaque'],
      ['hm-vision', 'HM vision', './assets/images/partners-plaque-leveled-v14/hm-vision.png', 'plaque'],
      ['dhav', 'DHAV', './assets/images/partners-plaque-leveled-v14/dhav.png', 'plaque'],
      ['funomad', 'FUNOMAD', './assets/images/partners-plaque-leveled-v14/funomad.png', 'plaque'],
      ['vidente', 'vidente', './assets/images/partners-plaque-leveled-v14/vidente.png', 'plaque'],
      ['batech', 'BATECH', './assets/images/partners-plaque-leveled-v14/batech.png', 'plaque'],
      ['doohyun-tech', 'DOOHYUN TECH', './assets/images/partners-plaque-leveled-v14/doohyun-tech.png', 'plaque'],
    ];

    const logoMarkup = (logos, tier) => logos.map(([slug, name, src, source], index) => `
      <li class="partner-logo-card partner-logo-card--${source} partner-logo-card--${tier}" data-logo="${slug}" style="--logo-delay: ${Math.min(index, 11) * 22}ms">
        <img src="${src}?v=studio-v-partner-optical-v14" alt="${name}" loading="lazy" decoding="async">
      </li>
    `).join('');

    partnerStrips.forEach((strip) => {
      strip.innerHTML = `
        <div class="partner-strip-inner">
          <div class="partner-strip-copy reveal">
            <p>Powered by</p>
            <h2>Technology Partners</h2>
          </div>
          <div class="partner-stage-canvas">
            <ul class="partner-logo-wall partner-logo-wall--primary reveal" aria-label="Studio V primary technology partners">
              ${logoMarkup(primaryPartnerLogos, 'primary')}
            </ul>
            <ul class="partner-logo-wall partner-logo-wall--supporting reveal" aria-label="Studio V equipment suppliers">
              ${logoMarkup(supportPartnerLogos, 'supporting')}
            </ul>
          </div>
        </div>
      `;
    });

    const partnerMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePartnerTransformVars = (strip) => {
      const scroll = Number.parseFloat(strip.style.getPropertyValue('--partner-scroll')) || 0;
      const pointerX = Number.parseFloat(strip.style.getPropertyValue('--partner-pointer-x')) || 0;
      const pointerY = Number.parseFloat(strip.style.getPropertyValue('--partner-pointer-y')) || 0;
      strip.style.setProperty('--partner-soft-far-x', `${(pointerX * 4 + scroll * 3).toFixed(3)}px`);
      strip.style.setProperty('--partner-soft-far-y', `${(scroll * -8 + pointerY * 3).toFixed(3)}px`);
      strip.style.setProperty('--partner-soft-mid-x', `${(pointerX * 18 + scroll * 9).toFixed(3)}px`);
      strip.style.setProperty('--partner-soft-mid-y', `${(scroll * 17 + pointerY * 8).toFixed(3)}px`);
      strip.style.setProperty('--partner-soft-near-x', `${(pointerX * -34 + scroll * -10).toFixed(3)}px`);
      strip.style.setProperty('--partner-soft-near-y', `${(pointerY * -15 + scroll * 13).toFixed(3)}px`);
      strip.style.setProperty('--partner-glass-x', `${(pointerX * 10 + scroll * 4).toFixed(3)}px`);
      strip.style.setProperty('--partner-glass-y', `${(scroll * 5 + pointerY * 5).toFixed(3)}px`);
      strip.style.setProperty('--partner-copy-x', `${(pointerX * -3).toFixed(3)}px`);
      strip.style.setProperty('--partner-copy-y', `${(scroll * -2 + pointerY * -1).toFixed(3)}px`);
      strip.style.setProperty('--partner-stage-x', `${(pointerX * 4).toFixed(3)}px`);
      strip.style.setProperty('--partner-stage-y', `${(scroll * 4 + pointerY * 2).toFixed(3)}px`);
      strip.style.setProperty('--partner-primary-x', `${(pointerX * -7).toFixed(3)}px`);
      strip.style.setProperty('--partner-primary-y', `${(scroll * -4 + pointerY * -2).toFixed(3)}px`);
      strip.style.setProperty('--partner-support-x', `${(pointerX * 11).toFixed(3)}px`);
      strip.style.setProperty('--partner-support-y', `${(scroll * 8 + pointerY * 3).toFixed(3)}px`);
    };
    const updatePartnerDepth = () => {
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      partnerStrips.forEach((strip) => {
        const rect = strip.getBoundingClientRect();
        const progress = clamp((viewport - rect.top) / Math.max(1, viewport + rect.height), 0, 1);
        strip.style.setProperty('--partner-scroll', ((progress - 0.5) * 2).toFixed(4));
        updatePartnerTransformVars(strip);
      });
    };

    if (partnerMotionQuery.matches) {
      partnerStrips.forEach((strip) => {
        strip.style.setProperty('--partner-scroll', '0');
        strip.style.setProperty('--partner-pointer-x', '0');
        strip.style.setProperty('--partner-pointer-y', '0');
        updatePartnerTransformVars(strip);
      });
    } else {
      let partnerDepthTicking = false;
      const requestPartnerDepth = () => {
        if (partnerDepthTicking) return;
        partnerDepthTicking = true;
        window.requestAnimationFrame(() => {
          partnerDepthTicking = false;
          updatePartnerDepth();
        });
      };

      updatePartnerDepth();
      window.addEventListener('scroll', requestPartnerDepth, { passive: true });
      window.addEventListener('resize', requestPartnerDepth);

      const partnerPointerQuery = window.matchMedia('(pointer: fine)');
      if (partnerPointerQuery.matches) {
        window.addEventListener('pointermove', (event) => {
          const x = ((event.clientX / Math.max(1, window.innerWidth)) - 0.5) * 2;
          const y = ((event.clientY / Math.max(1, window.innerHeight)) - 0.5) * 2;
          partnerStrips.forEach((strip) => {
            strip.style.setProperty('--partner-pointer-x', x.toFixed(3));
            strip.style.setProperty('--partner-pointer-y', y.toFixed(3));
            updatePartnerTransformVars(strip);
          });
        }, { passive: true });
      }
    }
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
    const scrollUsecaseQuery = window.matchMedia('(min-width: 1px)');
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
      const end = sectionTop + usecaseScene.offsetHeight - viewport;
      const travel = Math.max(1, end - start);
      const progress = clamp((window.scrollY - start) / travel, 0, 1);
      const frameProgress = clamp((progress - 0.035) / 0.70, 0, 1);
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
      const end = sectionTop + usecaseScene.offsetHeight - viewport;
      const travel = Math.max(1, end - start);
      const frameIndex = frameIndexByBackground[index] || 0;
      const progress = frames.length > 1 ? frameIndex / (frames.length - 1) : 0;
      const scrollProgress = 0.035 + progress * 0.70;
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

    let usecaseTouchStart = null;
    usecaseScene.addEventListener('touchstart', (event) => {
      if (shouldUseScrollUsecase() || event.touches.length !== 1) return;
      const touch = event.touches[0];
      usecaseTouchStart = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });

    usecaseScene.addEventListener('touchend', (event) => {
      if (!usecaseTouchStart || shouldUseScrollUsecase() || !event.changedTouches.length) {
        usecaseTouchStart = null;
        return;
      }
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - usecaseTouchStart.x;
      const deltaY = touch.clientY - usecaseTouchStart.y;
      usecaseTouchStart = null;
      if (Math.abs(deltaX) < 54 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) return;
      const direction = deltaX < 0 ? 1 : -1;
      setStaticUsecase(clamp(activeIndex + direction, 0, backgrounds.length - 1));
    }, { passive: true });

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
