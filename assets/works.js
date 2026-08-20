(() => {
  const assetVersion = 'studio-v-portfolio-stills-06';
  const versionedAsset = (url) => url && url.startsWith('./') ? `${url}?v=${assetVersion}` : url;

  const works = [
    {
      slug: 'cube-of-memory',
      group: 'film',
      category: 'Film',
      title: 'Cube of Memory',
      format: 'Virtual Production Film',
      image: './assets/video/showreel-thumbs/cube-main-film.jpg',
      copy: 'Studio V에서 진행한 대표 버추얼 프로덕션 필름 기록입니다.'
    },
    {
      slug: 'seoul-story',
      group: 'film',
      category: 'Film & Drama',
      title: '서울이야기',
      format: 'Drama Shoot',
      image: './assets/video/showreel-thumbs/seoul-story-making.jpg',
      copy: 'Studio V에서 진행한 리허설·테스트 및 본 촬영 지원 기록입니다.'
    },
    {
      slug: 'aion-commercial',
      group: 'ad',
      category: 'AD',
      title: 'AION 2',
      format: 'Commercial',
      image: './assets/video/showreel-thumbs/aion2.jpg',
      copy: 'J자 곡면 LED Wall을 활용한 광고 촬영 기록입니다.'
    },
    {
      slug: 'tucson-print-campaign',
      group: 'ad',
      category: 'AD',
      title: 'Hyundai TUCSON',
      format: 'Print & Web Campaign',
      image: './assets/images/portfolio/tucson-print-campaign.jpg',
      copy: '카탈로그·웹 광고 이미지 촬영 지원 기록입니다.'
    },
    {
      slug: 'dealer-driving-plate',
      group: 'ad',
      category: 'AD',
      title: 'Dealer',
      format: 'Commercial',
      image: './assets/video/showreel-thumbs/dealer.jpg',
      copy: '드라이빙 플레이트를 LED Wall에 구현한 차량 광고 촬영 기록입니다.'
    },
    {
      slug: 'lesserafim-overwatch',
      group: 'music',
      category: 'Music Video',
      title: 'LE SSERAFIM x Overwatch',
      format: 'Music Video',
      image: './assets/video/showreel-thumbs/le-sserafim-overwatch.jpg',
      copy: 'Studio V에서 진행한 뮤직비디오 프로젝트 촬영 기록입니다.'
    },
    {
      slug: 'studio-cube-opening',
      group: 'event',
      category: 'Event',
      title: 'StudioCube Opening',
      format: 'Launch Film',
      image: './assets/video/showreel-thumbs/studiocube-opening.jpg',
      copy: 'StudioCube 개관과 제작 인프라를 소개한 프로젝트 기록입니다.'
    },
    {
      slug: 'beyond-the-set',
      group: 'event',
      category: 'Showcase',
      title: 'Beyond the Set',
      format: 'VP Showcase',
      image: './assets/video/showreel-thumbs/beyond-the-set.jpg',
      copy: 'AI 융합 VP 기술 시연 쇼케이스 기록입니다.'
    },
    {
      slug: 'vp-technical-seminar',
      group: 'event',
      category: 'Seminar',
      title: 'Technical Demonstration I',
      format: 'Technology Demonstration',
      image: './assets/video/showreel-thumbs/seminar-making.jpg',
      copy: '방송·영상 실무진 대상 기술 시연 행사 기록입니다.'
    },
    {
      slug: 'genesis-print-campaign-01',
      group: 'ad',
      category: 'AD',
      title: 'Genesis GV90 1',
      format: 'Print Campaign',
      image: './assets/images/portfolio/genesis-gv90-approved.jpg',
      copy: 'Studio V에서 진행한 Genesis GV90 지면 촬영 기록입니다.'
    },
    {
      slug: 'genesis-print-campaign-02',
      group: 'ad',
      category: 'AD',
      title: 'Genesis GV90 2',
      format: 'Print Campaign',
      image: './assets/images/portfolio/genesis-gv90-02-approved.jpg',
      copy: 'Studio V에서 진행한 Genesis GV90 지면 촬영 기록입니다.'
    },
    {
      slug: 'avante-print-campaign',
      group: 'ad',
      category: 'AD',
      title: 'Avante DN8',
      format: 'Print Campaign',
      image: './assets/images/portfolio/avante-dn8-approved.jpg',
      copy: 'Studio V에서 진행한 Avante DN8 지면 촬영 기록입니다.'
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

    return `<img src="${versionedAsset(work.image)}" alt="${work.title}" loading="lazy" decoding="async">`;
  };

  const render = (filter = 'all') => {
    const list = filter === 'all' ? works : works.filter((work) => work.group === filter);
    grid.innerHTML = list.map((work, index) => `
      <article class="work-card reveal" id="${work.slug}" style="--reveal-delay: ${Math.min(index, 8) * 42}ms">
        <div class="work-card-link work-card-link--static">
          <div class="work-image${work.restricted ? ' work-image--restricted' : ''}">
            ${getThumb(work)}
            <span class="work-format">${work.format}</span>
          </div>
          <div class="work-body">
            <span>${work.category}</span>
            <h3>${work.title}</h3>
            <p>${work.copy}</p>
          </div>
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
