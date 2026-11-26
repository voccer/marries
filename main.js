(() => {
  document.documentElement.classList.replace('no-js', 'js');
  const envelope = document.querySelector('#envelope');
  const bgm = document.querySelector('#bgm');
  const musicButton = document.querySelector('#music-toggle');
  const video = document.querySelector('#highlight');
  const gallery = [...document.querySelectorAll('.gallery__item')];
  const lightbox = document.querySelector('#lightbox');
  const lightboxImage = lightbox.querySelector('img');
  const toast = document.querySelector('#toast');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let opened = false;
  let currentImage = 0;
  let toastTimer;
  let resumeAfterVideo = false;
  let resumeAfterVisibility = false;
  let intro = () => {};
  let stopPetals = () => {};
  document.body.style.overflow = 'hidden';

  function syncMusic() {
    const playing = !bgm.paused;
    musicButton.setAttribute('aria-pressed', String(playing));
    musicButton.setAttribute('aria-label', playing ? 'Tắt nhạc' : 'Bật nhạc');
    musicButton.classList.toggle('is-playing', playing);
  }
  bgm.addEventListener('play', syncMusic);
  bgm.addEventListener('pause', syncMusic);
  function requestMusic() {
    const attempt = bgm.play();
    if (attempt && attempt.catch) attempt.catch(() => { bgm.pause(); syncMusic(); });
    syncMusic();
  }
  function revealPage() {
    envelope.hidden = true;
    document.body.style.overflow = '';
    intro();
  }
  envelope.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    bgm.volume = 0;
    requestMusic(); // Phải gọi đồng bộ trong cử chỉ chạm để mở khóa âm thanh.
    if (window.gsap && !reduced.matches) {
      gsap.to(bgm, { volume: 0.6, duration: 2 });
      gsap.timeline({ onComplete: revealPage })
        .to('.envelope__seal', { scale: 0, opacity: 0, duration: .35 })
        .to('.envelope__flap', { rotateX: -160, duration: .85, transformOrigin: 'top center', ease: 'power2.inOut' }, 0)
        .to('.envelope__letter', { y: -180, duration: .9, ease: 'power2.out' }, .45)
        .to(envelope, { opacity: 0, duration: .6 }, 1.1);
    } else {
      bgm.volume = 0.6;
      revealPage();
    }
  });
  musicButton.addEventListener('click', () => { if (bgm.paused) { bgm.volume = .6; requestMusic(); } else bgm.pause(); });
  video.addEventListener('play', () => { resumeAfterVideo = !bgm.paused; bgm.pause(); });
  function restoreAfterVideo() { if (resumeAfterVideo) { requestMusic(); resumeAfterVideo = false; } }
  video.addEventListener('pause', restoreAfterVideo);
  video.addEventListener('ended', restoreAfterVideo);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { resumeAfterVisibility = !bgm.paused; bgm.pause(); stopPetals(); }
    else if (resumeAfterVisibility && video.paused) { requestMusic(); resumeAfterVisibility = false; }
  });

  function showImage(index) {
    currentImage = (index + gallery.length) % gallery.length;
    lightboxImage.src = gallery[currentImage].dataset.full;
    lightboxImage.alt = gallery[currentImage].querySelector('img').alt;
  }
  gallery.forEach((item, index) => item.addEventListener('click', () => { showImage(index); lightbox.showModal(); }));
  lightbox.querySelector('.lightbox__prev').addEventListener('click', () => showImage(currentImage - 1));
  lightbox.querySelector('.lightbox__next').addEventListener('click', () => showImage(currentImage + 1));
  lightbox.querySelector('.lightbox__close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); showImage(currentImage - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); showImage(currentImage + 1); }
  });
  let swipeStart = null;
  lightbox.addEventListener('pointerdown', e => { swipeStart = e.clientX; });
  lightbox.addEventListener('pointerup', e => {
    if (swipeStart === null) return;
    const distance = e.clientX - swipeStart;
    if (Math.abs(distance) > 50) showImage(currentImage + (distance < 0 ? 1 : -1));
    swipeStart = null;
  });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2000);
  }
  function oldCopy(value) {
    const input = document.createElement('textarea');
    input.value = value;
    input.style.cssText = 'position:fixed;top:0;left:-9999px';
    document.body.append(input);
    input.select();
    const copied = document.execCommand('copy');
    input.remove();
    return copied;
  }
  document.querySelectorAll('.copy-btn').forEach(button => button.addEventListener('click', async () => {
    const value = button.dataset.copy;
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
      else if (!oldCopy(value)) throw new Error('copy failed');
      showToast('Đã sao chép STK');
    } catch {
      try { if (oldCopy(value)) showToast('Đã sao chép STK'); else showToast('Không thể sao chép STK'); }
      catch { showToast('Không thể sao chép STK'); }
    }
  }));

  // Các tương tác cơ bản vẫn hoạt động khi CDN hiệu ứng không tải được.
  if (!window.gsap) return;
  gsap.registerPlugin(...[window.ScrollTrigger, window.SplitText].filter(Boolean));
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: reduce)', () => {});
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const heroImage = document.querySelector('.hero__bg');
    const names = document.querySelector('.hero__names');
    intro = () => {
      gsap.fromTo(heroImage, { scale: 1.15 }, { scale: 1, duration: 12, ease: 'none' });
      if (window.SplitText) {
        const split = new SplitText(names, { type: 'chars' });
        gsap.from(split.chars, { opacity: 0, y: 28, stagger: .045, duration: .8, ease: 'power2.out', onComplete: () => split.revert() });
      }
      startPetals();
    };
    const line = document.querySelector('.timeline__line');
    const length = line.getTotalLength();
    gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(line, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '#events', start: 'top 80%', end: 'bottom 70%', scrub: true } });
    gsap.utils.toArray('.event-card').forEach(card => gsap.from(card, { y: 24, opacity: 0, duration: .65, scrollTrigger: { trigger: card, start: 'top 85%' } }));
    mm.add('(min-width: 768px)', () => {
      const track = document.querySelector('.gallery__track');
      const gallerySection = document.querySelector('#gallery');
      gsap.to(track, { x: () => -Math.max(0, track.scrollWidth - gallerySection.clientWidth + 40), ease: 'none', scrollTrigger: { trigger: gallerySection, start: 'top top', end: () => '+=' + Math.max(0, track.scrollWidth - gallerySection.clientWidth + 40), pin: true, scrub: 1, invalidateOnRefresh: true } });
    });
    mm.add('(max-width: 767px)', () => {
      gallery.forEach(item => gsap.fromTo(item, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: .75, scrollTrigger: { trigger: item, start: 'top 92%' } }));
    });
    document.querySelectorAll('.gift-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        if (e.pointerType === 'touch') return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        gsap.to(card, { rotateX: -y * 16, rotateY: x * 16, duration: .3 });
      });
      card.addEventListener('pointerleave', () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: .4 }));
    });
    function startPetals() {
      const canvas = document.querySelector('#petals');
      const ctx = canvas.getContext('2d');
      const particles = Array.from({ length: 30 }, () => ({ x: Math.random(), y: Math.random(), speed: .00015 + Math.random() * .00035, size: 3 + Math.random() * 6, drift: Math.random() * 10 }));
      let frame = 0, active = true;
      const observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; if (active && !frame && !document.hidden) draw(); });
      observer.observe(document.querySelector('#hero'));
      function draw() {
        frame = 0;
        if (!active || document.hidden) return;
        const w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = w * dpr; canvas.height = h * dpr; }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(255,226,219,.55)';
        for (const p of particles) { p.y += p.speed; if (p.y > 1.04) p.y = -.04; ctx.beginPath(); ctx.ellipse(p.x * w + Math.sin(p.y * 8 + p.drift) * 24, p.y * h, p.size, p.size * .55, p.y * 4, 0, Math.PI * 2); ctx.fill(); }
        frame = requestAnimationFrame(draw);
      }
      stopPetals = () => { cancelAnimationFrame(frame); frame = 0; };
      draw();
    }
  });
})();
