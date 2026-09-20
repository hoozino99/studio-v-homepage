(() => {
  const videos = [
    {
      slug: 'cube-of-memory-main',
      owner: 'showreel',
      title: 'Cube of Memory',
      category: 'Cube of Memory',
      type: 'Main Film',
      copy: '가상환경과 실사 촬영이 결합된 Studio V 대표 VP 본편입니다.',
      aspect: 'landscape',
      thumb: './assets/video/showreel-thumbs/cube-main-film.jpg',
      driveId: '1pE5i_Xmo8JTyo9UOwuZUizOs9cEf8Xks'
    },
    {
      slug: 'cube-showreel',
      owner: 'showreel',
      title: 'Cube of Memory Showreel',
      category: 'Cube of Memory',
      type: 'Showreel',
      copy: '제작 환경과 현장 장면을 짧고 선명하게 압축한 대표 쇼릴입니다.',
      aspect: 'landscape',
      thumb: './assets/video/showreel-thumbs/cube-showreel.jpg',
      driveId: '1E4xmDwWcuOC3m8u4lJ4u0f_1TBLBzD3l'
    },
    {
      slug: 'cube-of-memory-making',
      owner: 'showreel',
      title: 'Cube of Memory Making',
      category: 'Cube of Memory',
      type: 'Making',
      copy: 'LED 볼륨, 촬영, 조명, 후반 협업이 맞물리는 제작 현장 기록입니다.',
      aspect: 'landscape',
      thumb: './assets/video/showreel-thumbs/cube-making.jpg',
      driveId: '1FLzuKSa9FMpKHOY0BIxYXYgRpU4EB8yu'
    },
    {
      slug: 'opening-ceremony',
      owner: 'showreel',
      title: 'StudioCube Opening Film',
      category: 'StudioCube',
      type: 'Opening Film',
      copy: 'StudioCube 버추얼 프로덕션 스튜디오의 출범과 제작 인프라를 소개하는 영상입니다.',
      aspect: 'landscape',
      thumb: './assets/video/showreel-thumbs/studiocube-opening.jpg',
      driveId: '1vUs4jq9SVRPEO7hq-sBDNPWDAvHybcVO'
    },
    {
      slug: 'pd-shorts',
      owner: 'showreel',
      title: 'PD Point of View',
      category: 'Cube of Memory',
      type: 'Shorts',
      copy: '제작 운영 관점에서 VP 촬영 현장을 짧게 보여주는 세로형 콘텐츠입니다.',
      aspect: 'portrait',
      thumb: './assets/video/showreel-thumbs/pd-shorts.jpg',
      driveId: '1DPl9cB_1YAPNx8vq_OHu1sFXajx9W0TU'
    },
    {
      slug: 'camera-lighting-shorts',
      owner: 'showreel',
      title: 'Cinematography & Lighting',
      category: 'Cube of Memory',
      type: 'Shorts',
      copy: '가상 배경, 실제 조명, 카메라 워크의 결합을 보여주는 세로형 콘텐츠입니다.',
      aspect: 'portrait',
      thumb: './assets/video/showreel-thumbs/camera-lighting-shorts.jpg',
      driveId: '1cOChNlXtDgFvrcOfgwSKPBvIwyzPFhYt'
    },
    {
      slug: 'vfx-shorts',
      owner: 'showreel',
      title: 'VFX Supervisor',
      category: 'Cube of Memory',
      type: 'Shorts',
      copy: '가상환경 세팅부터 후반 확장성까지 VP 제작 흐름을 압축한 세로형 콘텐츠입니다.',
      aspect: 'portrait',
      thumb: './assets/video/showreel-thumbs/vfx-shorts.jpg',
      driveId: '1vNRBJhvg-_yOaVTXyNfO6OC2RF_4zEOS'
    },
    {
      slug: 'showreel-shorts',
      owner: 'showreel',
      title: 'Showreel Shorts',
      category: 'Cube of Memory',
      type: 'Shorts',
      copy: '대표 쇼릴의 장면과 메시지를 SNS 리듬에 맞춰 압축한 세로형 콘텐츠입니다.',
      aspect: 'portrait',
      thumb: './assets/video/showreel-thumbs/showreel-shorts.jpg',
      driveId: '1ROMIFEOJXavswuBr62SOwNiYcRmZ_a1D'
    },
    {
      slug: 'seoul-story-making',
      owner: 'portfolio',
      projectSlug: 'seoul-story',
      group: 'film',
      title: '서울이야기',
      category: 'Film & Drama',
      type: 'Drama Making',
      copy: '드라마 <서울이야기>의 리허설·테스트와 본 촬영 현장을 담은 메이킹 영상입니다.',
      aspect: 'landscape',
      thumb: './assets/video/showreel-thumbs/seoul-story-stage-alt.jpg',
      driveId: '17CK3T7C4hXcof0id6YeZZD4_Yq30F9tw'
    },
    {
      slug: 'aion2',
      owner: 'portfolio',
      projectSlug: 'aion-commercial',
      group: 'ad',
      title: 'AION 2',
      category: 'AD',
      type: 'Commercial BTS',
      copy: 'J자 곡면 LED Wall을 활용한 광고 촬영 현장 BTS입니다.',
      aspect: 'landscape',
      thumb: './assets/video/showreel-thumbs/aion2.jpg',
      driveId: '1L44PEZnlwjZmJxNB6eg9prOQyeIXmMPk'
    },
    {
      slug: 'dealer',
      owner: 'portfolio',
      projectSlug: 'dealer-driving-plate',
      group: 'series',
      title: 'Dealer',
      category: 'Series',
      type: 'BTS',
      copy: '넷플릭스 시리즈 ‘딜러’의 차량 촬영 현장 기록입니다.',
      aspect: 'landscape',
      thumb: './assets/video/showreel-thumbs/dealer.jpg',
      driveId: '1YFZ63grO-clINc0FuRs8QsDMYo8vmGqw'
    },
    {
      slug: 'lesserafim-overwatch',
      owner: 'portfolio',
      projectSlug: 'lesserafim-overwatch',
      group: 'music',
      title: 'LE SSERAFIM x Overwatch',
      category: 'Music Video',
      type: 'Making',
      copy: 'Studio V에서 진행한 LE SSERAFIM x Overwatch 뮤직비디오 메이킹 기록입니다.',
      aspect: 'landscape',
      thumb: './assets/video/showreel-thumbs/le-sserafim-overwatch.jpg',
      driveId: '19SkAhCLzqFXd9e2hfIRjtYsaBJv86ZkD'
    },
    {
      slug: 'beyond-the-set',
      owner: 'portfolio',
      projectSlug: 'beyond-the-set',
      group: 'event',
      title: 'Beyond the Set',
      category: 'Showcase',
      type: 'VP Showcase',
      copy: 'AI 융합 VP 기술 시연과 현장 반응을 묶은 쇼케이스 기록입니다.',
      aspect: 'landscape',
      thumb: './assets/video/showreel-thumbs/beyond-the-set.jpg',
      driveId: '1c7ZZ9ezlPrFwyeNp4ehscClkJsnENYBD'
    },
    {
      slug: 'broadcast-seminar',
      owner: 'portfolio',
      projectSlug: 'vp-technical-seminar',
      group: 'event',
      title: 'Technical Demonstration I',
      category: 'Seminar',
      type: 'Seminar Making',
      copy: '방송·영상 실무진 대상 기술 시연 행사 기록입니다.',
      aspect: 'landscape',
      thumb: './assets/video/showreel-thumbs/seminar-making.jpg',
      driveId: '1svFD2mAPef-QJx-RF1g3v3HYi7Ktt8De'
    }
  ];

  const photos = [
    {
      slug: 'tucson-print-campaign',
      owner: 'portfolio',
      group: 'ad',
      title: 'Hyundai TUCSON',
      category: 'AD',
      type: 'Photo',
      copy: '카탈로그·웹 광고 이미지 촬영 지원 기록입니다.',
      image: './assets/images/portfolio/tucson-print-campaign.jpg'
    },
    {
      slug: 'genesis-print-campaign-01',
      owner: 'portfolio',
      group: 'ad',
      title: 'Genesis GV90 1',
      category: 'AD',
      type: 'Photo',
      copy: 'Studio V에서 진행한 Genesis GV90 지면 촬영 기록입니다.',
      image: './assets/images/portfolio/genesis-gv90-approved.jpg'
    },
    {
      slug: 'genesis-print-campaign-02',
      owner: 'portfolio',
      group: 'ad',
      title: 'Genesis GV90 2',
      category: 'AD',
      type: 'Photo',
      copy: 'Studio V에서 진행한 Genesis GV90 지면 촬영 기록입니다.',
      image: './assets/images/portfolio/genesis-gv90-02-approved.jpg'
    },
    {
      slug: 'avante-print-campaign',
      owner: 'portfolio',
      group: 'ad',
      title: 'Avante DN8',
      category: 'AD',
      type: 'Photo',
      copy: 'Studio V에서 진행한 Avante DN8 지면 촬영 기록입니다.',
      image: './assets/images/portfolio/avante-dn8-approved.jpg'
    }
  ];

  const catalog = Object.freeze({
    videos: Object.freeze(videos.map((video) => Object.freeze(video))),
    photos: Object.freeze(photos.map((photo) => Object.freeze(photo))),
    showreelVideos: Object.freeze(videos.filter((video) => video.owner === 'showreel')),
    portfolioVideos: Object.freeze(videos.filter((video) => video.owner === 'portfolio')),
    portfolioOrder: Object.freeze([
      'seoul-story',
      'aion-commercial',
      'tucson-print-campaign',
      'dealer-driving-plate',
      'lesserafim-overwatch',
      'beyond-the-set',
      'vp-technical-seminar',
      'genesis-print-campaign-01',
      'genesis-print-campaign-02',
      'avante-print-campaign'
    ])
  });

  globalThis.StudioVMediaCatalog = catalog;
})();
