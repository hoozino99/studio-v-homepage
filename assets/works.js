(() => {
  const works = [
    {
      slug: 'cube-of-memory',
      group: 'film',
      number: '01',
      category: 'Film',
      title: 'Cube of Memory',
      format: 'Virtual Production Film',
      image: './assets/video/cube-of-memory-hero-poster.jpg'
    },
    {
      slug: 'aion-commercial',
      group: 'ad',
      number: '02',
      category: 'AD',
      title: 'AION 2',
      format: 'AD',
      image: './assets/images/optimized/usecase-commercial-aion-01-clean-crop.jpg'
    },
    {
      slug: 'dealer-driving-plate',
      group: 'ad',
      number: '03',
      category: 'AD',
      title: 'Dealer',
      format: 'AD',
      image: './assets/images/optimized/usecase-commercial-aion-03-clean-crop.jpg'
    },
    {
      slug: 'lesserafim-overwatch',
      group: 'music',
      number: '04',
      category: 'Music Video',
      title: 'LE SSERAFIM x Overwatch',
      format: 'Music Video',
      image: './assets/images/overview-4.jpg'
    },
    {
      slug: 'studio-cube-opening',
      group: 'event',
      number: '05',
      category: 'Event',
      title: 'StudioCube Opening',
      format: 'Launch Film',
      image: './assets/images/optimized/usecase-event-opening-outpaint.jpg'
    },
    {
      slug: 'beyond-the-set',
      group: 'event',
      number: '06',
      category: 'Showcase',
      title: 'Beyond the Set',
      format: 'VP Showcase',
      image: './assets/images/stage-gallery-led-wall-wide.jpg'
    },
    {
      slug: 'vp-technical-seminar',
      group: 'event',
      number: '07',
      category: 'Seminar',
      title: 'VP Technical Seminar',
      format: 'Technology Demonstration',
      image: './assets/images/stage-gallery-side-led.jpg'
    },
    {
      slug: 'genesis-print-campaign-01',
      group: 'ad',
      number: '08',
      category: 'AD',
      title: 'Genesis I',
      format: 'AD',
      image: './assets/images/stage-gallery-ceiling-led.jpg'
    },
    {
      slug: 'genesis-print-campaign-02',
      group: 'ad',
      number: '09',
      category: 'AD',
      title: 'Genesis II',
      format: 'AD',
      image: './assets/images/stage-gallery-side-led.jpg'
    },
    {
      slug: 'avante-print-campaign',
      group: 'ad',
      number: '10',
      category: 'AD',
      title: 'Avante',
      format: 'AD',
      image: './assets/images/stage-gallery-led-wall-wide.jpg'
    }
  ];

  const grid = document.querySelector('[data-works-grid]');
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const filters = ['film', 'ad', 'music', 'event'];
  if (!grid) return;

  const render = (filter = 'all') => {
    const list = filter === 'all' ? works : works.filter((work) => work.group === filter);
    grid.innerHTML = list.map((work, index) => `
      <article class="work-card reveal" id="${work.slug}" style="--reveal-delay: ${Math.min(index, 8) * 42}ms">
        <div class="work-image">
          <img src="${work.image}" alt="${work.title}" loading="lazy" decoding="async">
          <span class="work-index">${work.number}</span>
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
