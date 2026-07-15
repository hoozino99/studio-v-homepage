(() => {
  const drivePreview = (id) => `https://drive.google.com/file/d/${id}/preview?autoplay=1`;
  const assetVersion = 'studio-v-portfolio-modal-01';
  const versionedAsset = (url) => url && url.startsWith('./') ? `${url}?v=${assetVersion}` : url;

  const works = [
    {
      slug: 'cube-of-memory',
      group: 'film',
      number: '01',
      category: 'Film',
      title: 'Cube of Memory',
      format: 'Virtual Production Film',
      image: './assets/video/showreel-thumbs/cube-main-film.jpg',
      driveId: '1ZUX20pEH0LF1tWSTK8ITFTY54Yjzlaf1'
    },
    {
      slug: 'aion-commercial',
      group: 'ad',
      number: '02',
      category: 'AD',
      title: 'AION 2',
      format: 'AD',
      image: './assets/video/showreel-thumbs/aion2.jpg',
      driveId: '110GMj21y1LWMT8V5U5T0bvQ_LLNpXTNH'
    },
    {
      slug: 'dealer-driving-plate',
      group: 'ad',
      number: '03',
      category: 'AD',
      title: 'Dealer',
      format: 'AD',
      image: './assets/video/showreel-thumbs/dealer.jpg',
      driveId: '14R3yiETLyxEAYDciz1GF_ERnoF8rVbji'
    },
    {
      slug: 'lesserafim-overwatch',
      group: 'music',
      number: '04',
      category: 'Music Video',
      title: 'LE SSERAFIM x Overwatch',
      format: 'Music Video',
      image: './assets/video/showreel-thumbs/le-sserafim-overwatch.jpg',
      driveId: '1qTCZuoi2A2-vN8fF9xs9wgHjYqerBdW3'
    },
    {
      slug: 'studio-cube-opening',
      group: 'event',
      number: '05',
      category: 'Event',
      title: 'StudioCube Opening',
      format: 'Launch Film',
      image: './assets/video/showreel-thumbs/studiocube-opening.jpg',
      driveId: '1k3KOYMHdL_wxoiW3HyqIxg5CC09X8n2G'
    },
    {
      slug: 'beyond-the-set',
      group: 'event',
      number: '06',
      category: 'Showcase',
      title: 'Beyond the Set',
      format: 'VP Showcase',
      image: './assets/video/showreel-thumbs/beyond-the-set.jpg',
      driveId: '1qB_5mW2gIA6dqOMo5dz8twkIGv1wXx4L'
    },
    {
      slug: 'vp-technical-seminar',
      group: 'event',
      number: '07',
      category: 'Seminar',
      title: 'Technical Demonstration I',
      format: 'Technology Demonstration',
      image: './assets/video/showreel-thumbs/seminar-making.jpg',
      driveId: '18eRI-ttPLWAoUCywOepIyqkim8wXg6-A'
    },
    {
      slug: 'genesis-print-campaign-01',
      group: 'ad',
      number: '08',
      category: 'AD',
      title: 'Genesis GV90 1',
      format: 'AD',
      restricted: true
    },
    {
      slug: 'genesis-print-campaign-02',
      group: 'ad',
      number: '09',
      category: 'AD',
      title: 'Genesis GV90 2',
      format: 'AD',
      restricted: true
    },
    {
      slug: 'avante-print-campaign',
      group: 'ad',
      number: '10',
      category: 'AD',
      title: 'Avante DN8',
      format: 'AD',
      restricted: true
    }
  ];

  const grid = document.querySelector('[data-works-grid]');
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const filters = ['film', 'ad', 'music', 'event'];
  if (!grid) return;

  const modal = document.createElement('div');
  modal.className = 'showreel-modal portfolio-video-modal';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <button class="showreel-modal-backdrop" type="button" data-work-video-close aria-label="영상 닫기"></button>
    <section class="showreel-modal-panel" role="dialog" aria-modal="true" aria-label="포트폴리오 영상 재생">
      <div class="showreel-modal-head">
        <div>
          <small data-work-video-kicker>Studio V Project</small>
          <strong data-work-video-title>Studio V Project</strong>
        </div>
        <button type="button" data-work-video-close aria-label="영상 닫기">Close</button>
      </div>
      <div class="showreel-modal-frame">
        <iframe data-work-video-iframe title="Studio V 프로젝트 영상 플레이어" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
      </div>
    </section>
  `;
  document.body.appendChild(modal);

  const modalIframe = modal.querySelector('[data-work-video-iframe]');
  const modalTitle = modal.querySelector('[data-work-video-title]');
  const modalKicker = modal.querySelector('[data-work-video-kicker]');
  const modalCloseButtons = [...modal.querySelectorAll('[data-work-video-close]')];
  let activeTrigger = null;

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('showreel-modal-open');
    if (modalIframe) modalIframe.src = '';
    activeTrigger?.focus();
    activeTrigger = null;
  };

  const openModal = (work, trigger) => {
    if (!work?.driveId) return;
    activeTrigger = trigger;
    if (modalTitle) modalTitle.textContent = work.title;
    if (modalKicker) modalKicker.textContent = `${work.category} / ${work.format}`;
    if (modalIframe) modalIframe.src = drivePreview(work.driveId);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('showreel-modal-open');
  };

  modalCloseButtons.forEach((button) => button.addEventListener('click', closeModal));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  const getThumb = (work) => {
    if (work.restricted) {
      return `<div class="project-restricted-thumb" aria-label="${work.title} image restricted">
        <span>Confidential</span>
        <strong>${work.title}</strong>
      </div>`;
    }

    if (work.pendingThumbnail) {
      return `<div class="project-pending-thumb" aria-label="${work.title} thumbnail pending">
        <span>${work.pendingLabel || 'Thumbnail Pending'}</span>
        <strong>${work.title}</strong>
      </div>`;
    }

    return `<img src="${versionedAsset(work.image)}" alt="${work.title}" loading="lazy" decoding="async">`;
  };

  const render = (filter = 'all') => {
    const list = filter === 'all' ? works : works.filter((work) => work.group === filter);
    grid.innerHTML = list.map((work, index) => {
      const tag = work.driveId ? 'button' : 'div';
      const attributes = work.driveId
        ? `type="button" data-work-video="${work.slug}" aria-label="${work.title} 영상 재생"`
        : 'aria-disabled="true"';
      return `
        <article class="work-card reveal" id="${work.slug}" style="--reveal-delay: ${Math.min(index, 8) * 42}ms">
          <${tag} class="work-card-link${work.driveId ? ' work-card-link--playable' : ' work-card-link--static'}" ${attributes}>
            <div class="work-image${work.restricted ? ' work-image--restricted' : ''}${work.pendingThumbnail ? ' work-image--pending' : ''}">
              ${getThumb(work)}
              ${work.driveId ? '<span class="work-play-hint" aria-hidden="true">Play</span>' : ''}
              <span class="work-format">${work.format}</span>
            </div>
            <div class="work-body">
              <span>${work.category}</span>
              <h3>${work.title}</h3>
            </div>
          </${tag}>
        </article>
      `;
    }).join('');
    requestAnimationFrame(() => {
      grid.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
    });
  };

  grid.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-work-video]');
    if (!trigger || !grid.contains(trigger)) return;
    const work = works.find((item) => item.slug === trigger.dataset.workVideo);
    openModal(work, trigger);
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((item) => item.classList.remove('is-active'));
      button.classList.add('is-active');
      render(button.dataset.filter);
    });
  });

  const hashFilter = window.location.hash.replace('#', '');
  const initialFilter = filters.includes(hashFilter) ? hashFilter : 'all';
  render(initialFilter);
  filterButtons.forEach((item) => {
    item.classList.toggle('is-active', item.dataset.filter === initialFilter);
  });
})();
