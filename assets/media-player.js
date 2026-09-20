(() => {
  const drivePreview = (id) => `https://drive.google.com/file/d/${id}/preview`;
  const driveSource = (id) => `https://drive.google.com/file/d/${id}/view`;

  const createPlayer = ({ heroSelector = null } = {}) => {
    const dialog = document.createElement('dialog');
    dialog.className = 'media-dialog';
    dialog.setAttribute('aria-labelledby', 'media-dialog-title');
    dialog.setAttribute('aria-describedby', 'media-dialog-status');
    dialog.innerHTML = `
      <section class="media-dialog__panel">
        <header class="media-dialog__head">
          <div>
            <p class="media-dialog__kicker" data-media-dialog-kicker></p>
            <h2 id="media-dialog-title" data-media-dialog-title></h2>
          </div>
          <button class="media-dialog__close" type="button" data-media-dialog-close aria-label="영상 닫기">Close</button>
        </header>
        <div class="media-dialog__frame" data-media-dialog-frame>
          <iframe data-media-dialog-iframe title="Studio V 영상 플레이어" allow="autoplay; fullscreen; picture-in-picture" loading="lazy"></iframe>
        </div>
        <footer class="media-dialog__foot">
          <p id="media-dialog-status" data-media-dialog-status>재생이 안 되면 원본 링크에서 확인해 주세요.</p>
          <a data-media-dialog-source href="#" target="_blank" rel="noopener noreferrer">원본 Drive 열기 ↗</a>
        </footer>
      </section>
    `;
    document.body.appendChild(dialog);

    const frame = dialog.querySelector('[data-media-dialog-frame]');
    const iframe = dialog.querySelector('[data-media-dialog-iframe]');
    const kicker = dialog.querySelector('[data-media-dialog-kicker]');
    const title = dialog.querySelector('[data-media-dialog-title]');
    const source = dialog.querySelector('[data-media-dialog-source]');
    const closeButton = dialog.querySelector('[data-media-dialog-close]');
    const heroVideo = heroSelector ? document.querySelector(heroSelector) : null;
    let lastTrigger = null;
    let heroWasPlaying = false;
    let activeRecord = null;
    let ignoreNextCloseEvent = false;

    const restoreHero = (wasPlaying = heroWasPlaying) => {
      if (!heroVideo || !wasPlaying) return;
      heroVideo.play().catch(() => {});
    };

    const restoreHeroAfterClose = (wasPlaying) => {
      if (!wasPlaying) return;
      const restore = () => {
        if (!dialog.open && !activeRecord) restoreHero(wasPlaying);
      };
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(restore);
      } else {
        setTimeout(restore, 0);
      }
    };

    const finalizeClose = ({ restoreFocus = true } = {}) => {
      if (!activeRecord) return;
      const shouldRestoreHero = heroWasPlaying;
      iframe?.removeAttribute('src');
      document.body.classList.remove('media-dialog-open');
      const trigger = lastTrigger;
      activeRecord = null;
      lastTrigger = null;
      heroWasPlaying = false;
      if (restoreFocus && trigger?.isConnected) trigger.focus({ preventScroll: true });
      return { trigger, shouldRestoreHero };
    };

    const close = ({ restoreFocus = true } = {}) => {
      const wasOpen = dialog.open;
      const closeState = finalizeClose({ restoreFocus: false });
      if (wasOpen) ignoreNextCloseEvent = true;
      if (dialog.open) {
        dialog.close();
      }
      restoreHeroAfterClose(closeState?.shouldRestoreHero);
      if (restoreFocus && closeState?.trigger?.isConnected) closeState.trigger.focus({ preventScroll: true });
    };

    const open = (record, trigger = document.activeElement) => {
      if (!record?.driveId || !dialog.showModal) return;
      if (dialog.open) close({ restoreFocus: false });

      activeRecord = record;
      lastTrigger = trigger && typeof trigger.focus === 'function' ? trigger : null;
      heroWasPlaying = Boolean(heroVideo && !heroVideo.paused);
      heroVideo?.pause();
      if (kicker) kicker.textContent = `${record.category} / ${record.type}`;
      if (title) title.textContent = record.title;
      if (source) source.href = driveSource(record.driveId);
      if (iframe) {
        iframe.title = `${record.title} ${record.type} 영상 플레이어`;
        iframe.src = drivePreview(record.driveId);
      }
      frame?.classList.toggle('is-portrait', record.aspect === 'portrait');
      document.body.classList.add('media-dialog-open');
      dialog.showModal();
      closeButton?.focus({ preventScroll: true });
    };

    closeButton?.addEventListener('click', close);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) close();
    });
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      close();
    });
    dialog.addEventListener('close', () => {
      if (ignoreNextCloseEvent) {
        ignoreNextCloseEvent = false;
        return;
      }
      const closeState = finalizeClose();
      restoreHeroAfterClose(closeState?.shouldRestoreHero);
    });

    return Object.freeze({ open, close, element: dialog });
  };

  globalThis.StudioVMediaPlayer = createPlayer;
})();
