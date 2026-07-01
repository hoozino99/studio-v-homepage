(() => {
  const drivePreview = (id) => `https://drive.google.com/file/d/${id}/preview`;
  const driveThumb = (id) => `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
  const assetVersion = 'studio-v-lsf-thumb-01';
  const versionedAsset = (url) => url && url.startsWith('./') ? `${url}?v=${assetVersion}` : url;

  const videos = [
    {
      slug: 'cube-of-memory-main',
      title: 'Cube of Memory',
      copy: '가상환경과 실사 촬영이 결합된 Studio V 대표 VP 본편입니다.',
      type: 'Main Film',
      runtime: '16:9 / MOV',
      source: '0327_Cube of Memory_Edit_full_v008_master.mov',
      driveId: '1ZUX20pEH0LF1tWSTK8ITFTY54Yjzlaf1',
      category: 'Cube of Memory',
      thumb: './assets/video/showreel-thumbs/cube-main-film.jpg'
    },
    {
      slug: 'cube-showreel',
      title: 'Cube of Memory Showreel',
      copy: '제작 환경과 현장 장면을 짧고 선명하게 압축한 대표 쇼릴입니다.',
      type: 'Showreel',
      runtime: '16:9 / MOV',
      source: '0320_Cube of Memory_Showreel_final.mov',
      driveId: '1eVrCmDC0uqISlWLN872BCqF9KMnDJvDi',
      category: 'Cube of Memory',
      thumb: './assets/video/showreel-thumbs/cube-showreel.jpg'
    },
    {
      slug: 'cube-of-memory-making',
      title: 'Cube of Memory Making',
      copy: 'LED 볼륨, 촬영, 조명, 후반 협업이 맞물리는 제작 현장 기록입니다.',
      type: 'Making',
      runtime: '16:9 / MP4',
      source: '큐브오브메모리_VER_9.mp4',
      driveId: '1cooFjFFyFMavmusrecZK8f5lxq_3bztp',
      category: 'Cube of Memory',
      thumb: './assets/video/showreel-thumbs/cube-making.jpg'
    },
    {
      slug: 'opening-ceremony',
      title: 'StudioCube Opening Film',
      copy: 'StudioCube 버추얼 프로덕션 스튜디오의 출범과 제작 인프라를 소개하는 영상입니다.',
      type: 'Longform',
      runtime: '16:9 / MP4',
      source: '0226_스튜디오큐브홍보영상.mp4',
      driveId: '1k3KOYMHdL_wxoiW3HyqIxg5CC09X8n2G',
      category: 'StudioCube',
      thumb: './assets/video/showreel-thumbs/studiocube-opening.jpg'
    },
    {
      slug: 'broadcast-seminar',
      title: 'Broadcast Technology Seminar',
      copy: '방송·영상 실무진 대상 VP 세미나 현장을 담은 메이킹 영상입니다.',
      type: 'Seminar Making',
      runtime: '16:9 / MP4',
      source: '방송기술인세미나_1차편집본.mp4',
      driveId: '18eRI-ttPLWAoUCywOepIyqkim8wXg6-A',
      category: 'Seminar',
      thumb: './assets/video/showreel-thumbs/seminar-making.jpg'
    },
    {
      slug: 'beyond-the-set',
      title: 'Beyond the Set',
      copy: 'AI 융합 VP 기술 시연과 현장 반응을 묶은 쇼케이스 하이라이트입니다.',
      type: 'Showcase',
      runtime: '16:9 / MP4',
      source: '기술시연회1회차.mp4',
      driveId: '1qB_5mW2gIA6dqOMo5dz8twkIGv1wXx4L',
      category: 'Showcase',
      thumb: './assets/video/showreel-thumbs/beyond-the-set.jpg'
    },
    {
      slug: 'aion2',
      title: 'AION2',
      copy: 'J자 곡면 LED Wall을 활용한 광고 촬영 현장 BTS입니다.',
      type: 'Commercial BTS',
      runtime: '16:9 / MP4',
      source: 'Aion2_bts_260504.mp4',
      driveId: '110GMj21y1LWMT8V5U5T0bvQ_LLNpXTNH',
      category: 'Commercial',
      thumb: './assets/video/showreel-thumbs/aion2.jpg'
    },
    {
      slug: 'dealer',
      title: 'Dealer',
      copy: '드라이빙 플레이트를 LED Wall에 구현한 차량 촬영 BTS입니다.',
      type: 'Commercial BTS',
      runtime: '16:9 / MP4',
      source: 'Dealer_0624.mp4',
      driveId: '14R3yiETLyxEAYDciz1GF_ERnoF8rVbji',
      category: 'Commercial',
      thumb: './assets/video/showreel-thumbs/dealer.jpg'
    },
    {
      slug: 'pd-shorts',
      title: 'PD Point of View',
      copy: '제작 운영 관점에서 VP 촬영 현장을 짧게 보여주는 세로형 콘텐츠입니다.',
      type: 'Shorts',
      runtime: '9:16 / MP4',
      source: '쇼츠_A_VER_5.mp4',
      driveId: '17kc0aMNfn25-TA5ohWkoIuiwAb-u9hKL',
      category: 'Cube of Memory',
      aspect: 'portrait',
      thumb: './assets/video/showreel-thumbs/pd-shorts.jpg'
    },
    {
      slug: 'camera-lighting-shorts',
      title: 'Cinematography & Lighting',
      copy: '가상 배경, 실제 조명, 카메라 워크의 결합을 보여주는 세로형 콘텐츠입니다.',
      type: 'Shorts',
      runtime: '9:16 / MP4',
      source: '쇼츠_C_VER_6.mp4',
      driveId: '1fSleWSuuymOwfPzbh-QeZa9Y70dr2OLA',
      category: 'Cube of Memory',
      aspect: 'portrait',
      thumb: './assets/video/showreel-thumbs/camera-lighting-shorts.jpg'
    },
    {
      slug: 'vfx-shorts',
      title: 'VFX Supervisor',
      copy: '가상환경 세팅부터 후반 확장성까지 VP 제작 흐름을 압축한 세로형 콘텐츠입니다.',
      type: 'Shorts',
      runtime: '9:16 / MP4',
      source: '쇼츠_B_VER_6.mp4',
      driveId: '1e3z4i-xiXDpauttAnmlCZ2gWGS-Ae_Cy',
      category: 'Cube of Memory',
      aspect: 'portrait',
      thumb: './assets/video/showreel-thumbs/vfx-shorts.jpg'
    },
    {
      slug: 'showreel-shorts',
      title: 'Showreel Shorts',
      copy: '대표 쇼릴의 장면과 메시지를 SNS 리듬에 맞춰 압축한 세로형 콘텐츠입니다.',
      type: 'Shorts',
      runtime: '9:16 / MP4',
      source: '쇼츠_세로_VER_3.mp4',
      driveId: '1BjaSYnITwlMDEqo5PkU8cXn7nQ7BFaio',
      category: 'Cube of Memory',
      aspect: 'portrait',
      thumb: './assets/video/showreel-thumbs/showreel-shorts.jpg'
    }
  ];

  const iframe = document.querySelector('[data-showreel-iframe]');
  const grid = document.querySelector('[data-showreel-grid]');
  const shortsGrid = document.querySelector('[data-showreel-shorts-grid]');
  const player = document.querySelector('[data-showreel-player]');
  const title = document.querySelector('[data-showreel-title]');
  const copy = document.querySelector('[data-showreel-copy]');
  const type = document.querySelector('[data-showreel-type]');
  const runtime = document.querySelector('[data-showreel-runtime]');
  const source = document.querySelector('[data-showreel-source]');

  if (!grid) return;

  const modal = document.createElement('div');
  modal.className = 'showreel-modal';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <button class="showreel-modal-backdrop" type="button" data-showreel-close aria-label="영상 닫기"></button>
    <section class="showreel-modal-panel" role="dialog" aria-modal="true" aria-label="쇼릴 영상 재생">
      <div class="showreel-modal-head">
        <div>
          <small data-showreel-modal-kicker>Showreel</small>
          <strong data-showreel-modal-title>Studio V Showreel</strong>
        </div>
        <button type="button" data-showreel-close aria-label="영상 닫기">Close</button>
      </div>
      <div class="showreel-modal-frame" data-showreel-modal-frame>
        <iframe data-showreel-modal-iframe title="Studio V 확장 영상 플레이어" allow="autoplay; fullscreen; picture-in-picture" loading="lazy"></iframe>
      </div>
      <p data-showreel-modal-copy></p>
    </section>
  `;
  document.body.appendChild(modal);

  const modalIframe = modal.querySelector('[data-showreel-modal-iframe]');
  const modalFrame = modal.querySelector('[data-showreel-modal-frame]');
  const modalTitle = modal.querySelector('[data-showreel-modal-title]');
  const modalKicker = modal.querySelector('[data-showreel-modal-kicker]');
  const modalCopy = modal.querySelector('[data-showreel-modal-copy]');
  const modalCloseButtons = [...modal.querySelectorAll('[data-showreel-close]')];
  let activeModalIndex = -1;

  const landscapeVideos = videos
    .map((video, index) => ({ video, index }))
    .filter(({ video }) => video.aspect !== 'portrait');
  const portraitVideos = videos
    .map((video, index) => ({ video, index }))
    .filter(({ video }) => video.aspect === 'portrait');

  const renderCards = (items, options = {}) => items.map(({ video, index }, groupIndex) => `
    <button class="showreel-card${options.portrait ? ' showreel-card--portrait' : ''} reveal${index === 0 ? ' is-active' : ''}" type="button" data-video-index="${index}" data-video-slug="${video.slug}" style="--reveal-delay: ${Math.min(groupIndex, 5) * 54}ms">
      <figure${options.portrait ? ' class="is-portrait"' : ''}>
        <img src="${versionedAsset(video.thumb || driveThumb(video.driveId))}" alt="" loading="lazy" decoding="async">
        <span>${String(groupIndex + 1).padStart(2, '0')}</span>
      </figure>
      <div class="showreel-card-copy">
        <small>${video.category} / ${video.type}</small>
        <strong>${video.title}</strong>
        <p>${video.copy}</p>
      </div>
    </button>
  `).join('');

  grid.innerHTML = renderCards(landscapeVideos);
  if (shortsGrid) shortsGrid.innerHTML = renderCards(portraitVideos, { portrait: true });

  const cards = [...document.querySelectorAll('[data-video-index]')];
  document.querySelectorAll('[data-showreel-grid] img, [data-showreel-shorts-grid] img').forEach((image) => {
    image.addEventListener('error', () => {
      image.src = './assets/video/showreel-poster.jpg';
    }, { once: true });
  });

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('showreel-modal-open');
    if (modalIframe) modalIframe.src = '';
    activeModalIndex = -1;
  };

  const openModal = (index) => {
    const item = videos[index];
    if (!item) return;
    activeModalIndex = index;
    if (modalIframe) modalIframe.src = drivePreview(item.driveId);
    modalFrame?.classList.toggle('is-portrait', item.aspect === 'portrait');
    if (modalTitle) modalTitle.textContent = item.title;
    if (modalKicker) modalKicker.textContent = `${item.category} / ${item.type}`;
    if (modalCopy) modalCopy.textContent = item.copy;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('showreel-modal-open');
  };

  modalCloseButtons.forEach((button) => button.addEventListener('click', closeModal));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeModalIndex >= 0) closeModal();
  });

  const setVideo = (index, options = {}) => {
    const item = videos[index];
    if (!item) return;

    if (iframe) {
      iframe.hidden = false;
      iframe.src = drivePreview(item.driveId);
    }
    if (player) {
      player.classList.toggle('is-portrait', item.aspect === 'portrait');
    }
    if (title) title.textContent = item.title;
    if (copy) copy.textContent = item.copy;
    if (type) type.textContent = item.type;
    if (runtime) runtime.textContent = item.runtime;
    if (source) source.textContent = item.source;
    cards.forEach((card) => {
      card.classList.toggle('is-active', Number(card.dataset.videoIndex) === index);
    });
    if (options.updateHash && item.slug && window.location.hash.replace('#', '') !== item.slug) {
      history.replaceState(null, '', `#${item.slug}`);
    }
    if (options.open) openModal(index);
  };

  cards.forEach((card) => {
    card.addEventListener('click', () => setVideo(Number(card.dataset.videoIndex), { open: true, updateHash: true }));
  });

  const playSlug = new URLSearchParams(window.location.search).get('play');
  const requestedSlug = playSlug || window.location.hash.replace('#', '');
  const requestedIndex = videos.findIndex((video) => video.slug === requestedSlug);
  const initialIndex = requestedIndex >= 0 ? requestedIndex : 0;

  requestAnimationFrame(() => {
    cards.forEach((card) => card.classList.add('is-visible'));
  });
  setVideo(initialIndex, { open: Boolean(playSlug) });
})();
