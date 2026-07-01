/* ─────────────────────────────────────────
   IMPULSO CREATIVO — Main JS
   ───────────────────────────────────────── */

'use strict';

/* ══ Nav: scroll effect ══ */
(function () {
  const header = document.getElementById('site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ══ Nav: mobile toggle ══ */
(function () {
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');
  if (!toggle || !links) return;

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    links.classList.remove('open');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    links.classList.toggle('open', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      close();
      toggle.focus();
    }
  });
})();

/* ══ Reveal on scroll ══ */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = entry.target.style.getPropertyValue('--delay') || '0s';
      entry.target.style.transitionDelay = delay;
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ══ Portfolio filter ══ */
(function () {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card');
  if (!btns.length || !cards.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !show);
      });
    });
  });
})();

/* ══ Pre-fill servicio desde URL (?servicio=xxx) ══ */
(function () {
  const select = document.getElementById('service');
  if (!select) return;
  const params = new URLSearchParams(window.location.search);
  const svc = params.get('servicio');
  if (svc) {
    const option = select.querySelector(`option[value="${svc}"]`);
    if (option) option.selected = true;
  }
})();

/* ══ Contact form validation ══ */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    name:    { el: form.querySelector('#name'),    errEl: form.querySelector('#name-error'),    msg: 'Ingresá tu nombre.' },
    email:   { el: form.querySelector('#email'),   errEl: form.querySelector('#email-error'),   msg: 'Ingresá un email válido.' },
    message: { el: form.querySelector('#message'), errEl: form.querySelector('#message-error'), msg: 'Contanos algo sobre tu proyecto.' },
  };

  const successEl  = document.getElementById('form-success');
  const errorEl    = document.getElementById('form-submit-error');
  const submitBtn  = form.querySelector('.form-submit');
  const submitText = form.querySelector('.submit-text');
  const submitLoad = form.querySelector('.submit-loading');

  /* Crear el formulario en https://formspree.io (email: hola@impulsocreativo.com.ar)
     y reemplazar FORM_ID_AQUI por el ID que te den. */
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/FORM_ID_AQUI';

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(field, msg) {
    field.el.classList.add('error');
    if (field.errEl) field.errEl.textContent = msg;
  }
  function clearError(field) {
    field.el.classList.remove('error');
    if (field.errEl) field.errEl.textContent = '';
  }

  function validate() {
    let valid = true;

    if (!fields.name.el.value.trim()) {
      setError(fields.name, fields.name.msg); valid = false;
    } else { clearError(fields.name); }

    if (!emailRe.test(fields.email.el.value.trim())) {
      setError(fields.email, fields.email.msg); valid = false;
    } else { clearError(fields.email); }

    if (!fields.message.el.value.trim()) {
      setError(fields.message, fields.message.msg); valid = false;
    } else { clearError(fields.message); }

    return valid;
  }

  Object.values(fields).forEach(f => {
    if (f.el) f.el.addEventListener('input', () => clearError(f));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    submitBtn.disabled = true;
    submitText.hidden  = true;
    submitLoad.hidden  = false;
    if (errorEl) errorEl.hidden = true;

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: fields.name.el.value,
          email: fields.email.el.value,
          service: form.querySelector('#service').value,
          message: fields.message.el.value,
        }),
      });

      if (!res.ok) throw new Error('Formspree respondió con error');

      submitBtn.hidden = true;
      if (successEl) successEl.hidden = false;
      form.reset();
    } catch (err) {
      submitBtn.disabled = false;
      submitText.hidden  = false;
      submitLoad.hidden  = true;
      if (errorEl) errorEl.hidden = false;
    }
  });
})();
