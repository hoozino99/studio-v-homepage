(() => {
  const assetVersion = 'studio-v-lsf-thumb-01';
  const versionedAsset = (url) => url && url.startsWith('./') ? `${url}?v=${assetVersion}` : url;

  const works = [
    {
      slug: 'cube-of-memory',
      group: 'film',
      number: '01',
      category: 'Film',
      title: 'Cube of Memory',
      format: 'Virtual Production Film',
      image: './assets/video/showreel-thumbs/cube-main-film.jpg'
    },
    {
      slug: 'aion-commercial',
      group: 'ad',
      number: '02',
      category: 'AD',
      title: 'AION 2',
      format: 'AD',
      image: './assets/video/showreel-thumbs/aion2.jpg'
    },
    {
      slug: 'dealer-driving-plate',
      group: 'ad',
      number: '03',
      category: 'AD',
      title: 'Dealer',
      format: 'AD',
      image: './assets/video/showreel-thumbs/dealer.jpg'
    },
    {
      slug: 'lesserafim-overwatch',
      group: 'music',
      number: '04',
      category: 'Music Video',
      title: 'LE SSERAFIM x Overwatch',
      format: 'Music Video',
      image: './assets/video/showreel-thumbs/le-sserafim-overwatch.jpg'
    },
    {
      slug: 'studio-cube-opening',
      group: 'event',
      number: '05',
      category: 'Event',
      title: 'StudioCube Opening',
      format: 'Launch Film',
      image: './assets/video/showreel-thumbs/studiocube-opening.jpg'
    },
    {
      slug: 'beyond-the-set',
      group: 'event',
      number: '06',
      category: 'Showcase',
      title: 'Beyond the Set',
      format: 'VP Showcase',
      image: './assets/video/showreel-thumbs/beyond-the-set.jpg'
    },
    {
      slug: 'vp-technical-seminar',
      group: 'event',
      number: '07',
      category: 'Seminar',
      title: 'Technical Demonstration I',
      format: 'Technology Demonstration',
      image: './assets/video/showreel-thumbs/seminar-making.jpg'
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
    grid.innerHTML = list.map((work, index) => `
      <article class="work-card reveal" id="${work.slug}" style="--reveal-delay: ${Math.min(index, 8) * 42}ms">
        <div class="work-image${work.restricted ? ' work-image--restricted' : ''}${work.pendingThumbnail ? ' work-image--pending' : ''}">
          ${getThumb(work)}
          <span class="work-format">${work.format}</span>
        </div>
        <div class="work-body">
          <span>${work.category}</span>
          <h3>${work.title}</h3>
        </div>
      </article>
    `).join('');
    requestAnimationFrame(() => {
      grid.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
    });
  };

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
