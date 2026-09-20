(() => {
  const catalog = globalThis.StudioVMediaCatalog;
  const createPlayer = globalThis.StudioVMediaPlayer;
  const assetVersion = 'studio-v-portfolio-split-v01';
  const versionedAsset = (url) => url && url.startsWith('./') ? `${url}?v=${assetVersion}` : url;

  const grid = document.querySelector('[data-works-grid]');
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const filters = ['all', 'film', 'series', 'ad', 'music', 'event'];
  if (!grid || !catalog) return;

  const recordsBySlug = new Map([...catalog.portfolioVideos, ...catalog.photos].map((work) => [work.projectSlug || work.slug, work]));
  const works = catalog.portfolioOrder.map((slug) => recordsBySlug.get(slug)).filter(Boolean);
  const workBySlug = new Map(works.map((work) => [work.slug, work]));
  const projectBySlug = new Map(works.map((work) => [work.projectSlug || work.slug, work]));
  const historicalShowreelHashes = {
    'cube-of-memory': 'cube-of-memory-main',
    'studio-cube-opening': 'opening-ceremony'
  };
  const player = typeof createPlayer === 'function' ? createPlayer() : null;

  const getThumb = (work) => {
    if (work.restricted) {
      return `<div class="project-restricted-thumb" aria-label="${work.title} image restricted"><span>Confidential</span><strong>${work.title}</strong></div>`;
    }
    return `<img src="${versionedAsset(work.thumb || work.image)}" alt="${work.title}" loading="lazy" decoding="async">`;
  };

  const render = (filter = 'all') => {
    const list = filter === 'all' ? works : works.filter((work) => work.group === filter);
    grid.innerHTML = list.map((work, index) => {
      const isPlayable = Boolean(work.driveId && !work.restricted);
      const content = `
        <div class="work-image${isPlayable ? ' work-image--playable' : ''}${work.restricted ? ' work-image--restricted' : ''}">
          ${getThumb(work)}
          ${isPlayable ? '<span class="work-play-hint" aria-hidden="true">Play</span>' : ''}
        </div>
        <div class="work-body">
          <span class="work-category">${work.category}</span>
          <h3>${work.title}</h3>
          <small class="work-format">${work.type}</small>
        </div>
      `;
      return `
        <article class="work-card reveal" id="${work.projectSlug || work.slug}" style="--reveal-delay: ${Math.min(index, 8) * 42}ms">
          ${isPlayable
            ? `<button class="work-card-link work-card-link--playable" type="button" data-media-slug="${work.slug}" aria-label="${work.title} ${work.type} 영상 열기">${content}</button>`
            : `<div class="work-card-link work-card-link--static" aria-label="${work.title} Photo">${content}</div>`}
        </article>
      `;
    }).join('');

    grid.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
    grid.querySelectorAll('[data-media-slug]').forEach((button) => {
      button.addEventListener('click', () => {
        const work = workBySlug.get(button.dataset.mediaSlug);
        if (!work || !player) return;
        player.open(work, button);
        if (window.location.search) {
          history.replaceState(null, '', `?play=${encodeURIComponent(work.slug)}#${work.projectSlug || work.slug}`);
        } else {
          history.replaceState(null, '', `#${work.projectSlug || work.slug}`);
        }
      });
    });
  };

  const setFilter = (filter, { updateHash = false } = {}) => {
    const nextFilter = filters.includes(filter) ? filter : 'all';
    filterButtons.forEach((button) => {
      const active = button.dataset.filter === nextFilter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    render(nextFilter);
    if (updateHash) {
      history.replaceState(null, '', nextFilter === 'all' ? window.location.pathname : `${window.location.pathname}#${nextFilter}`);
    }
  };

  const decodeHash = (value) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return '';
    }
  };

  const scrollToProject = (work) => {
    if (!work) return;
    requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById(work.projectSlug || work.slug)?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  };

  const openFromQuery = () => {
    const requestedSlug = new URLSearchParams(window.location.search).get('play');
    const work = requestedSlug ? workBySlug.get(requestedSlug) : null;
    if (!work?.driveId || !player) return;
    requestAnimationFrame(() => {
      const trigger = grid.querySelector(`[data-media-slug="${work.slug}"]`);
      player.open(work, trigger);
    });
  };

  const handleLocation = () => {
    const hash = decodeHash(window.location.hash.replace(/^#/, ''));
    if (historicalShowreelHashes[hash]) {
      window.location.replace(`./showreel.html#${historicalShowreelHashes[hash]}`);
      return;
    }
    setFilter(filters.includes(hash) ? hash : 'all');
    if (!filters.includes(hash)) scrollToProject(projectBySlug.get(hash) || workBySlug.get(hash));
  };

  filterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', button.classList.contains('is-active') ? 'true' : 'false');
    button.addEventListener('click', () => setFilter(button.dataset.filter, { updateHash: true }));
  });
  window.addEventListener('hashchange', handleLocation);

  handleLocation();
  openFromQuery();
})();
