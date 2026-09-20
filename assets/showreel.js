(() => {
  const catalog = globalThis.StudioVMediaCatalog;
  const createPlayer = globalThis.StudioVMediaPlayer;
  const assetVersion = 'studio-v-archive-ui-20260920-v2';
  const versionedAsset = (url) => url && url.startsWith('./') ? `${url}?v=${assetVersion}` : url;
  const grid = document.querySelector('[data-showreel-grid]');
  const shortsGrid = document.querySelector('[data-showreel-shorts-grid]');
  if (!grid || !catalog) return;

  const videos = catalog.showreelVideos;
  const movedVideos = new Map(catalog.portfolioVideos.map((video) => [video.slug, video]));
  const movedProjects = new Map(catalog.portfolioVideos.map((video) => [video.projectSlug, video]));
  const requestedPlay = new URLSearchParams(window.location.search).get('play');
  const decodeHash = (value) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return '';
    }
  };
  const requestedHash = decodeHash(window.location.hash.replace(/^#/, ''));
  const movedVideo = movedVideos.get(requestedPlay) || movedVideos.get(requestedHash) || movedProjects.get(requestedHash);

  if (movedVideo) {
    const play = requestedPlay ? `?play=${encodeURIComponent(movedVideo.slug)}` : '';
    window.location.replace(new URL(`portfolio.html${play}#${movedVideo.projectSlug}`, window.location.href).href);
    return;
  }

  const player = typeof createPlayer === 'function'
    ? createPlayer({ heroSelector: '[data-showreel-hero-video]' })
    : null;
  const landscapeVideos = videos.filter((video) => video.aspect !== 'portrait');
  const portraitVideos = videos.filter((video) => video.aspect === 'portrait');

  const renderCards = (items, { portrait = false } = {}) => items.map((video, index) => `
    <button class="showreel-card${portrait ? ' showreel-card--portrait' : ''} reveal${index === 0 ? ' is-active' : ''}" type="button" data-video-slug="${video.slug}" style="--reveal-delay: ${Math.min(index, 5) * 54}ms" aria-label="${video.title} ${video.type} 영상 열기">
      <figure${portrait ? ' class="is-portrait"' : ''}>
        <img src="${versionedAsset(video.thumb)}" alt="${video.title}" loading="lazy" decoding="async">
      </figure>
      <div class="showreel-card-copy">
        <div class="showreel-card-meta">
          <small>${video.type}</small>
          <span class="showreel-play-icon" aria-hidden="true"></span>
        </div>
        <strong>${video.title}</strong>
      </div>
    </button>
  `).join('');

  grid.innerHTML = renderCards(landscapeVideos);
  if (shortsGrid) shortsGrid.innerHTML = renderCards(portraitVideos, { portrait: true });

  document.querySelectorAll('[data-showreel-grid] img, [data-showreel-shorts-grid] img').forEach((image) => {
    image.addEventListener('error', () => {
      image.src = './assets/video/showreel-poster.jpg';
    }, { once: true });
  });

  const cards = [...document.querySelectorAll('[data-video-slug]')];
  const videoBySlug = new Map(videos.map((video) => [video.slug, video]));
  const setActive = (slug) => {
    cards.forEach((card) => card.classList.toggle('is-active', card.dataset.videoSlug === slug));
  };

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const video = videoBySlug.get(card.dataset.videoSlug);
      if (!video || !player) return;
      setActive(video.slug);
      player.open(video, card);
      history.replaceState(null, '', `${window.location.pathname}#${video.slug}`);
    });
  });

  const requestedVideo = videoBySlug.get(requestedPlay) || videoBySlug.get(requestedHash);
  const initialVideo = requestedVideo || videos[0];
  requestAnimationFrame(() => {
    cards.forEach((card) => card.classList.add('is-visible'));
    setActive(initialVideo.slug);
    if (requestedVideo && player) {
      const trigger = cards.find((card) => card.dataset.videoSlug === requestedVideo.slug);
      player.open(requestedVideo, trigger);
    }
  });
})();
