const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/MA3T62JT4N';
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);

  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* header + burger */
  const header = $('#header');
  const burger = $('#burger'), nav = $('#nav');
  burger?.addEventListener('click', () => {
    const o = burger.classList.toggle('is-open');
    nav.classList.toggle('is-open', o);
    burger.setAttribute('aria-expanded', o);
  });
  $$('a', nav).forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('is-open'); nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  /* smooth anchors with header offset */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const h = a.getAttribute('href');
    if (h.length <= 1) return;
    const t = $(h); if (!t) return;
    e.preventDefault();
    const top = t.getBoundingClientRect().top + scrollY - (h === '#contact' ? 0 : 60);
    scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* headline split into masked lines (by words, balanced by natural wrap) */
  $$('[data-split]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = '';
    const spans = words.map(w => {
      const l = document.createElement('span'); l.className = 'line'; l.setAttribute('aria-hidden', 'true');
      const s = document.createElement('span'); s.textContent = w; l.appendChild(s);
      el.appendChild(l); el.appendChild(document.createTextNode(' '));
      return l;
    });
    spans.forEach(l => { l.style.display = 'inline-block';  });
    spans.forEach((l, i) => l.firstChild.style.setProperty('--li', i));
    spans.forEach((l, i) => l.firstChild.style.transitionDelay = (i * 55) + 'ms');
  });

  /* reveal */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal],[data-split]').forEach(el => {
    if (el.parentElement.classList.contains('start__steps')) el.style.setProperty('--i', [...el.parentElement.children].indexOf(el));
    if (el.parentElement.classList.contains('faq__list')) el.style.setProperty('--i', 0);
    io.observe(el);
  });
  if (reduce) $$('[data-reveal],[data-split]').forEach(el => el.classList.add('in'));
  setTimeout(() => $$('.hero [data-split]').forEach(el => el.classList.add('in')), 120);

  /* magnetic buttons */
  if (matchMedia('(pointer:fine)').matches && !reduce) {
    $$('[data-magnet]').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .22, yy = (e.clientY - r.top - r.height / 2) * .35;
        b.style.transform = `translate(${x}px,${yy}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  /* hero: car tilts toward the pointer */
  const stage = $('#heroStage'), car = $('.car-hero');
  if (stage && car && !reduce && matchMedia('(pointer:fine)').matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0, run = false;
    stage.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - .5) * 16;
      ty = ((e.clientY - r.top) / r.height - .5) * -10;
      if (!run) { run = true; requestAnimationFrame(loop); }
    });
    stage.addEventListener('pointerleave', () => { tx = ty = 0; if (!run) { run = true; requestAnimationFrame(loop); } });
    const loop = () => {
      cx += (tx - cx) * .08; cy += (ty - cy) * .08;
      car.style.setProperty('--ry', cx.toFixed(2) + 'deg');
      car.style.setProperty('--rx', cy.toFixed(2) + 'deg');
      if (Math.abs(tx - cx) > .02 || Math.abs(ty - cy) > .02) requestAnimationFrame(loop); else run = false;
    };
  }

  /* ticker speed tied to scroll velocity */
  const tk = $('#ticker');
  let tkPos = 0, lastY = scrollY, vel = 0;
  if (tk && !reduce) {
    const w = () => tk.firstElementChild.offsetWidth;
    const tick = () => {
      vel += (Math.abs(scrollY - lastY) - vel) * .1; lastY = scrollY;
      tkPos -= .6 + vel * .35;
      const W = w(); if (-tkPos >= W) tkPos += W;
      tk.style.transform = `translate3d(${tkPos}px,0,0)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* lift scene: scroll-driven */
  const lift = $('.lift'), liftCar = $('#liftCar'), items = $$('.lift__item'), pins = $$('.pin');
  const N = items.length;
  let active = -1;
  const setActive = i => {
    if (i === active) return; active = i;
    items.forEach((it, k) => it.classList.toggle('is-on', k === i));
    pins.forEach((p, k) => p.classList.toggle('is-on', k === i));
  };
  const onLift = () => {
    if (!lift || reduce) return;
    const r = lift.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    const up = ease(clamp(p / .16));
    liftCar.style.transform = `translateY(${-(up * 118).toFixed(1)}px)`;
    const sp = clamp((p - .16) / .84);
    setActive(p < .12 ? -1 : Math.min(N - 1, Math.floor(sp * N)));
  };
  if (reduce) { liftCar && (liftCar.style.transform = 'translateY(-118px)'); items.forEach(i => i.classList.add('is-on')); }
  addEventListener('scroll', () => { header?.classList.toggle('scrolled', scrollY > 8); onLift(); }, { passive: true });
  addEventListener('resize', onLift);
  header?.classList.toggle('scrolled', scrollY > 8);
  onLift();

  /* audit: заказ-наряд */
  const checks = $$('.chk input');
  const nEl = $('#auditN'), lbl = $('#auditLbl'), verdict = $('#auditVerdict'), bad = $('#auditBad');
  const word = n => (n % 10 === 1 && n % 100 !== 11) ? 'неисправность' : ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) ? 'неисправности' : 'неисправностей';
  const renderAudit = () => {
    const miss = checks.filter(c => !c.checked);
    const n = miss.length, total = checks.length;
    nEl.textContent = n;
    lbl.textContent = `${word(n)} из ${total}`;
    verdict.textContent = n === 0
      ? 'Основа в порядке. Разбор покажет, где ещё можно добавить заявок.'
      : n === total
        ? 'Ничего не отмечено: профиль почти не ведётся или вы не уверены. Разберём бесплатно.'
        : n <= 3 ? 'Основа есть, но заявки теряются на мелочах. Покажем, на каких.'
        : 'Профиль работает вполсилы. Вот что мы нашли.';
    bad.innerHTML = '';
    miss.slice(0, 4).forEach(c => { const li = document.createElement('li'); li.textContent = c.dataset.bad; bad.appendChild(li); });
    if (miss.length > 4) { const li = document.createElement('li'); li.textContent = `И ещё ${miss.length - 4}. Покажем в разборе.`; bad.appendChild(li); }
  };
  checks.forEach(c => c.addEventListener('change', renderAudit));
  renderAudit();
  $('#auditGo')?.addEventListener('click', () => {
    const miss = checks.filter(c => !c.checked).map(c => c.nextElementSibling.textContent);
    const ta = $('#comment');
    if (ta && !ta.value) ta.value = miss.length ? 'Не отмечено в проверке профиля: ' + miss.join('; ') + '.' : 'Прошли проверку профиля, хотим разбор.';
  });

  /* form → Cloudflare Worker → Telegram */
  const form = $('#leadForm'), note = $('#formNote');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    const fd = new FormData(form);
    const payload = {};
    fd.forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    if (!payload.name || !payload.phone) { note.textContent = 'Заполните имя и телефон или Telegram'; return; }
    if (!form.consent.checked) { note.textContent = 'Нужно согласие на обработку данных'; return; }
    delete payload.consent;
    btn.disabled = true; btn.textContent = 'Отправляем…'; note.textContent = '';
    try {
      const resp = await fetch(LEAD_ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      btn.textContent = 'Заявка отправлена';
      note.textContent = 'Спасибо! Свяжемся с вами и покажем, где профиль теряет заявки.';
      form.reset();
    } catch (err) {
      console.error(err);
      btn.textContent = 'Ошибка, попробуйте ещё раз';
      note.textContent = 'Не удалось отправить. Попробуйте ещё раз через минуту.';
    } finally {
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3500);
    }
  });
})();
