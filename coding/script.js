// script.js — updated: more particles in light theme
document.addEventListener('DOMContentLoaded', () => {
  // set year
  const yearEl = document.getElementById('year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* THEME TOGGLE */
  (function(){
    const tgl = document.getElementById('theme-toggle');
    try {
      const saved = localStorage.getItem('ih_theme');
      if (saved === 'light') document.body.classList.add('light');
      function toggleTheme(){ document.body.classList.toggle('light'); localStorage.setItem('ih_theme', document.body.classList.contains('light') ? 'light' : 'dark'); }
      if (tgl) tgl.addEventListener('click', toggleTheme);
    } catch(e){ console.warn('theme init failed', e); }
  })();

  /* PARTICLES (higher density in light theme) */
  (function(){
    const canvas = document.getElementById('bg-canvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = 0, height = 0, DPR = 1;
    function getDPR() { return Math.max(window.devicePixelRatio || 1, 1); }

    // mobile check to adjust particle density
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    function resize() {
      DPR = getDPR();
      width = Math.max(320, window.innerWidth); height = Math.max(240, window.innerHeight);
      canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
      canvas.width = Math.floor(width * DPR); canvas.height = Math.floor(height * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      createParticles();
    }
    addEventListener('resize', () => {
      if (typeof window._ihResizeTimeout !== 'undefined') clearTimeout(window._ihResizeTimeout);
      window._ihResizeTimeout = setTimeout(resize, 120);
    });

    const darkColors = [
      'rgba(6,182,212,0.22)',
      'rgba(61,213,192,0.18)',
      'rgba(255,185,77,0.12)',
      'rgba(255,255,255,0.06)'
    ];
    const lightColors = [
      'rgba(6,182,212,0.50)', /* bolder turquoise */
      'rgba(61,213,192,0.45)',
      'rgba(255,185,77,0.40)',
      'rgba(50,80,120,0.35)' /* deeper blue-gray */
    ];
    function getColors() { return document.body.classList.contains('light') ? lightColors : darkColors; }
    function rand(min, max) { return Math.random() * (max - min) + min }

    let particles = [];
    function createParticles() {
      particles = [];
      const area = width * height;
      const isLight = document.body.classList.contains('light');
      const base = isMobile ? (isLight ? 15000 : 40000) : (isLight ? 8000 : 20000); // higher density in light theme
      const density = Math.max(22, Math.round(area / base));
      const colors = getColors();
      for (let i = 0; i < density; i++) {
        const largeChance = Math.random() < 0.18;
        particles.push({
          x: rand(0, width),
          y: rand(0, height),
          r: largeChance ? rand(3.8, 9.0) : rand(1.8, 6.0),
          vx: rand(-0.18, 0.18), vy: rand(-0.12, 0.12),
          c: colors[i % colors.length], t: rand(0, Math.PI * 2)
        });
      }
    }

    resize();

    const pointer = { x: -9999, y: -9999, active: false, movedAt: 0 };
    function setPointer(x, y) { pointer.x = x; pointer.y = y; pointer.movedAt = Date.now(); }
    window.addEventListener('pointermove', (e) => { setPointer(e.clientX, e.clientY); pointer.active = true; });
    window.addEventListener('pointercancel', () => { pointer.x = -9999; pointer.y = -9999; pointer.active = false; });
    window.addEventListener('pointerout', () => { pointer.x = -9999; pointer.y = -9999; pointer.active = false; });
    window.addEventListener('pointerleave', () => { pointer.x = -9999; pointer.y = -9999; pointer.active = false; });
    window.addEventListener('pointerdown', (e) => { burst(e.clientX, e.clientY); });

    function repelParticle(p, px, py, radius, strength) {
      const dx = p.x - px; const dy = p.y - py; const d2 = dx * dx + dy * dy;
      if (d2 <= 0) return;
      const d = Math.sqrt(d2);
      if (d < radius) {
        const force = Math.pow(1 - (d / radius), 1.7) * strength * (0.95 + Math.random() * 0.1);
        p.vx += (dx / d) * force;
        p.vy += (dy / d) * force;
      }
    }

    function burst(x, y) {
      for (let i = 0; i < particles.length; i++) {
        repelParticle(particles[i], x, y, 160, 2.0);
      }
      for (let k = 0; k < 6; k++) {
        const idx = Math.floor(Math.random() * particles.length);
        const p = particles[idx];
        if (!p) continue;
        p.vx += rand(-2.2, 2.2);
        p.vy += rand(-2.2, 2.2);
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, 'rgba(0,0,0,0.00)');
      g.addColorStop(1, document.body.classList.contains('light') ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.10)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, width, height);

      for (let p of particles) {
        p.t += 0.008 + (p.r / 800);
        p.x += p.vx + Math.sin(p.t) * 0.12;
        p.y += p.vy + Math.cos(p.t * 0.6) * 0.08;
        p.vx *= 0.985; p.vy *= 0.985;
        if (p.x > width + 40) p.x = -40; if (p.x < -40) p.x = width + 40;
        if (p.y > height + 40) p.y = -40; if (p.y < -40) p.y = height + 40;
        if (pointer.active && (Date.now() - pointer.movedAt) < 1500) {
          repelParticle(p, pointer.x, pointer.y, 220, 0.32);
        }
        ctx.beginPath(); ctx.fillStyle = p.c; ctx.globalAlpha = 0.94; ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }

      ctx.globalAlpha = 0.08; /* increased for light theme visibility */
      ctx.strokeStyle = document.body.classList.contains('light') ? 'rgba(6,182,212,0.25)' : 'rgba(6,182,212,0.12)';
      const maxLinks = Math.min(particles.length, 40);
      for (let i = 0; i < maxLinks; i++) {
        for (let j = i + 1; j < maxLinks; j++) {
          const a = particles[i]; const b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y; const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.lineWidth = (1 - d / 110) * 0.5;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

    window.addEventListener('touchstart', (e) => {
      if (!e.touches || !e.touches[0]) return;
      const t = e.touches[0]; setPointer(t.clientX, t.clientY); pointer.active = true; burst(t.clientX, t.clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!e.touches || !e.touches[0]) return; const t = e.touches[0]; setPointer(t.clientX, t.clientY); pointer.active = true;
    }, { passive: true });

    window.addEventListener('touchend', () => { pointer.active = false; pointer.x = -9999; pointer.y = -9999; });
  })();

  /* TICKER: DW-first RSS (Russian), fallback to rss2json; items clickable (no raw URLs), super slow CSS animation */
  (function(){
    const tickerContentEl = document.getElementById('ticker-content');
    const refreshBtn = document.getElementById('refresh-news');
    if (!tickerContentEl) return;

    const DW_RSS = 'https://rss.dw.com/rdf/rss-ru-all';
    const rss2jsonProxy = 'https://api.rss2json.com/v1/api.json?rss_url=';
    const feedsFallback = [
      'http://feeds.bbci.co.uk/news/world/rss.xml',
      'http://rss.cnn.com/rss/cnn_world.rss'
    ];
    const geoKeywords = ['russia','ukraine','china','nato','sanction','war','conflict','diplomacy','military','putin','biden','xi','iran','israel','palestine','turkey','syria','afghanistan'];

    function isGeoRelevant(text){
      const t = (text || '').toLowerCase();
      return geoKeywords.some(k => t.includes(k));
    }

    async function translateText(text) {
      try {
        const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=${encodeURIComponent(text)}`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(googleUrl)}`;
        const resp = await fetch(proxyUrl);
        if (!resp.ok) throw new Error('Translation failed');
        const json = await resp.json();
        const data = JSON.parse(json.contents);
        return data[0][0][0];
      } catch (e) {
        console.warn('Translation error', e);
        return text;
      }
    }

    async function fetchRSS_XML(url){
      try{
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('bad resp');
        const txt = await resp.text();
        const doc = new DOMParser().parseFromString(txt, 'application/xml');
        const items = Array.from(doc.querySelectorAll('item')).map(i => ({
          title: i.querySelector('title') ? i.querySelector('title').textContent.trim() : '',
          link: i.querySelector('link') ? i.querySelector('link').textContent.trim() : '',
          date: i.querySelector('pubDate') ? i.querySelector('pubDate').textContent.trim() : '',
          description: i.querySelector('description') ? i.querySelector('description').textContent.trim() : ''
        }));
        return items;
      }catch(e){
        console.warn('rss xml fetch failed', e);
        return null;
      }
    }

    async function fetchViaRSS2JSON(url){
      try{
        const resp = await fetch(rss2jsonProxy + encodeURIComponent(url));
        if (!resp.ok) throw new Error('proxy fail');
        const json = await resp.json();
        if (json && json.items) {
          const items = json.items.map(it => ({ title: it.title, link: it.link, date: it.pubDate, description: it.description || '' }));
          for (let item of items) {
            item.title = await translateText(item.title);
          }
          return items;
        }
      }catch(e){
        console.warn('rss2json failed', e);
        return null;
      }
    }

    async function getItems(){
      let items = await fetchRSS_XML(DW_RSS);
      if (items && items.length) {
        const geo = items.filter(it => isGeoRelevant(it.title + ' ' + it.description));
        return geo.length ? geo.slice(0,10) : items.slice(0,10);
      }
      let all = [];
      for (const f of feedsFallback){
        const res = await fetchViaRSS2JSON(f);
        if (res && res.length) all.push(...res.slice(0,8));
      }
      if (!all.length) return [];
      const geo = all.filter(it => isGeoRelevant(it.title + ' ' + it.description));
      return (geo.length ? geo : all).slice(0,10);
    }

    function buildTicker(items){
      if (!items || !items.length){ tickerContentEl.innerHTML = 'Новости недоступны — попробуйте обновить.'; return; }
      tickerContentEl.innerHTML = '';
      items.forEach((it, idx) => {
        const a = document.createElement('a');
        a.className = 'ticker-item';
        a.href = it.link || '#';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = it.title;
        tickerContentEl.appendChild(a);
        if (idx < items.length - 1){
          const sep = document.createElement('span');
          sep.className = 'sep';
          sep.textContent = ' · ';
          tickerContentEl.appendChild(sep);
        }
      });
      requestAnimationFrame(() => {
        const container = tickerContentEl.parentElement;
        if (!container) return;
        const containerW = container.getBoundingClientRect().width;
        const contentW = tickerContentEl.getBoundingClientRect().width;
        const duration = Math.max(30, Math.round(contentW / 35));
        tickerContentEl.style.animation = 'none';
        tickerContentEl.style.transform = `translateX(${containerW}px)`;
        const distance = contentW + containerW + 60;
        const start = performance.now();
        function animate(now){
          const t = (now - start) / (duration * 1000);
          const x = containerW - distance * t;
          tickerContentEl.style.transform = `translateX(${x}px)`;
          if (t < 1) {
            requestAnimationFrame(animate);
          } else {
            setTimeout(() => buildTicker(items), 600);
          }
        }
        requestAnimationFrame(animate);
      });
    }

    async function loadAndBuild(){
      try{
        tickerContentEl.textContent = 'Загрузка новостей…';
        const items = await getItems();
        buildTicker(items);
      }catch(e){
        console.warn('ticker load failed', e);
        tickerContentEl.textContent = 'Ошибка загрузки новостей.';
      }
    }

    if (refreshBtn) refreshBtn.addEventListener('click', loadAndBuild);
    loadAndBuild();
    setInterval(loadAndBuild, 2 * 60 * 60 * 1000);
  })();
});