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
  function revealPage(runIntro = true) {
    envelope.hidden = true;
    document.body.style.overflow = '';
    if (runIntro) intro();
    // Thanh cuộn chỉ xuất hiện sau khi mở thiệp nên phải đo lại vị trí các trigger
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  envelope.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    bgm.volume = 0;
    requestMusic(); // Phải gọi đồng bộ trong cử chỉ chạm để mở khóa âm thanh.
    if (window.gsap && !reduced.matches) {
      gsap.to(bgm, { volume: 0.6, duration: 2 });
      // Intro hero chạy cùng lúc phong bì mờ đi, tránh ảnh giật khi lộ ra
      gsap.timeline({ onComplete: () => revealPage(false) })
        .to('.envelope__seal', { scale: 0, opacity: 0, duration: .35 })
        .to('.envelope__flap', { rotateX: -160, duration: .85, transformOrigin: 'top center', ease: 'power2.inOut' }, 0)
        .to('.envelope__letter', { y: -180, duration: .9, ease: 'power2.out' }, .45)
        .add(() => intro(), 1.1)
        .to(envelope, { opacity: 0, duration: .6 }, 1.1);
    } else {
      bgm.volume = 0.6;
      revealPage();
    }
  });
  musicButton.addEventListener('click', () => { if (bgm.paused) { bgm.volume = .6; requestMusic(); } else bgm.pause(); });
  video.addEventListener('play', () => { resumeAfterVideo = !bgm.paused; bgm.pause(); });
  function restoreAfterVideo() {
    if (!resumeAfterVideo) return;
    resumeAfterVideo = false;
    // Hệ điều hành tự dừng video khi app vào nền: hoãn bật nhạc tới lúc quay lại
    if (document.hidden) { resumeAfterVisibility = true; return; }
    requestMusic();
  }
  video.addEventListener('pause', restoreAfterVideo);
  video.addEventListener('ended', restoreAfterVideo);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { resumeAfterVisibility = resumeAfterVisibility || !bgm.paused; bgm.pause(); }
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
  lightbox.addEventListener('pointercancel', () => { swipeStart = null; });
  lightbox.addEventListener('pointerup', e => {
    if (swipeStart === null) return;
    const distance = e.clientX - swipeStart;
    if (Math.abs(distance) > 50) showImage(currentImage + (distance < 0 ? 1 : -1));
    swipeStart = null;
  });

  // Hộp QR mừng cưới
  const giftBox = document.querySelector('#gift-box');
  document.querySelector('.gift-open').addEventListener('click', () => giftBox.showModal());
  giftBox.querySelector('.dialog__close').addEventListener('click', () => giftBox.close());
  giftBox.addEventListener('click', e => { if (e.target === giftBox) giftBox.close(); });

  function showToast(message) {
    // Dialog modal nằm ở top layer: đưa toast vào trong dialog đang mở để không bị che
    const host = document.querySelector('dialog[open]') || document.body;
    if (toast.parentElement !== host) host.append(toast);
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

  // main.js chạy trước các script GSAP (cùng defer) để phong bì hiện ngay;
  // DOMContentLoaded chỉ bắn sau khi mọi script defer đã chạy xong.
  // Thiếu GSAP hoặc ScrollTrigger thì bỏ hiệu ứng, các tương tác cơ bản ở trên vẫn chạy.
  document.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(...[window.ScrollTrigger, window.SplitText].filter(Boolean));
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const heroImage = document.querySelector('.hero__bg');
    const names = document.querySelector('.hero__names');
    // Đặt sẵn trạng thái đầu của intro sau phong bì; nếu khách đã mở thiệp trước khi GSAP tải xong thì bỏ qua intro
    if (!opened) gsap.set(heroImage, { scale: 1.15 });
    if (!opened && window.SplitText) gsap.set(names, { opacity: 0 });
    intro = () => {
      gsap.to(heroImage, { scale: 1, duration: 12, ease: 'none' });
      if (window.SplitText) {
        gsap.set(names, { opacity: 1 });
        const split = new SplitText(names, { type: 'chars' });
        gsap.from(split.chars, { opacity: 0, y: 28, stagger: .045, duration: .8, ease: 'power2.out', onComplete: () => split.revert() });
      }
      startPetals();
    };
    if (opened) startPetals();
    // Các khối nội dung hiện dần khi cuộn tới (chỉ opacity/y trên phần tử không có transform CSS riêng)
    gsap.utils.toArray('.section > h2, .couple .person, .event-card, .film__frame, .gift-open').forEach(el =>
      gsap.from(el, { y: 24, opacity: 0, duration: .7, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
    // Polaroid đã xoay bằng CSS nên chỉ fade, ảnh lưới thì mở màn từ dưới lên
    gsap.utils.toArray('.gallery__item--polaroid').forEach((el, i) =>
      gsap.from(el, { opacity: 0, duration: .8, delay: i * .15, scrollTrigger: { trigger: '#gallery', start: 'top 75%' } }));
    gallery.filter(item => !item.classList.contains('gallery__item--polaroid')).forEach(item =>
      gsap.fromTo(item, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: .75, ease: 'power2.out', scrollTrigger: { trigger: item, start: 'top 94%' } }));
  });
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    document.querySelectorAll('.gift-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        if (e.pointerType === 'touch') return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        gsap.to(card, { rotateX: -y * 16, rotateY: x * 16, transformPerspective: 800, duration: .3 });
      });
      card.addEventListener('pointerleave', () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: .4 }));
    });
  });
  function startPetals() {
      const canvas = document.querySelector('#petals');
      const ctx = canvas.getContext('2d');
      const particles = Array.from({ length: 30 }, () => ({ x: Math.random(), y: Math.random(), speed: .00015 + Math.random() * .00035, size: 3 + Math.random() * 6, drift: Math.random() * 10 }));
      let frame = 0, active = true;
      const observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; if (active && !frame) draw(); });
      observer.observe(document.querySelector('#hero'));
      // requestAnimationFrame tự ngừng khi tab ẩn và chạy tiếp khi quay lại, không cần dừng tay
      function draw() {
        frame = 0;
        if (!active) return;
        const w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = w * dpr; canvas.height = h * dpr; }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(255,226,219,.55)';
        for (const p of particles) { p.y += p.speed; if (p.y > 1.04) p.y = -.04; ctx.beginPath(); ctx.ellipse(p.x * w + Math.sin(p.y * 8 + p.drift) * 24, p.y * h, p.size, p.size * .55, p.y * 4, 0, Math.PI * 2); ctx.fill(); }
        frame = requestAnimationFrame(draw);
      }
      draw();
  }
  });
})();
