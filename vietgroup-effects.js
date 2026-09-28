/*
 * VIETGROUP AI — UI MOTION FX
 * Chỉ phụ trách hiệu ứng giao diện. Không truy cập Google Sheet,
 * không sửa tab, không can thiệp API Apps Script.
 */
(function () {
  'use strict';

  const FX = {
    raf: 0,
    canvas: null,
    ctx: null,
    dots: [],
    w: 0,
    h: 0,
    dpr: 1,
    mx: 0,
    my: 0,
    reduced: false
  };

  function qs(sel) { return document.querySelector(sel); }

  function setPointerVars(e) {
    const x = ((e.clientX / window.innerWidth) - 0.5) * 12;
    const y = ((e.clientY / window.innerHeight) - 0.5) * -12;
    FX.mx = x;
    FX.my = y;
    document.documentElement.style.setProperty('--mx', x.toFixed(2));
    document.documentElement.style.setProperty('--my', y.toFixed(2));
  }

  function createDots() {
    const count = Math.max(28, Math.min(72, Math.floor(window.innerWidth / 38)));
    FX.dots = Array.from({ length: count }, function (_, i) {
      return {
        x: Math.random() * FX.w,
        y: Math.random() * FX.h,
        r: Math.random() * 2.2 + 0.7,
        vx: (Math.random() - 0.5) * 0.18 * FX.dpr,
        vy: (Math.random() - 0.5) * 0.18 * FX.dpr,
        c: i % 3 === 0 ? '88,240,176' : (i % 2 ? '167,139,250' : '101,230,255')
      };
    });
  }

  function resizeCanvas() {
    if (!FX.canvas) return;
    FX.dpr = Math.min(2, window.devicePixelRatio || 1);
    FX.w = FX.canvas.width = Math.floor(window.innerWidth * FX.dpr);
    FX.h = FX.canvas.height = Math.floor(window.innerHeight * FX.dpr);
    FX.canvas.style.width = window.innerWidth + 'px';
    FX.canvas.style.height = window.innerHeight + 'px';
    createDots();
  }

  function draw() {
    if (!FX.ctx || FX.reduced) return;
    const ctx = FX.ctx;
    ctx.clearRect(0, 0, FX.w, FX.h);

    for (let i = 0; i < FX.dots.length; i++) {
      const d = FX.dots[i];
      d.x += d.vx + (FX.mx * 0.006 * FX.dpr);
      d.y += d.vy - (FX.my * 0.004 * FX.dpr);

      if (d.x < -20) d.x = FX.w + 20;
      if (d.x > FX.w + 20) d.x = -20;
      if (d.y < -20) d.y = FX.h + 20;
      if (d.y > FX.h + 20) d.y = -20;

      ctx.beginPath();
      ctx.fillStyle = 'rgba(' + d.c + ',.55)';
      ctx.shadowBlur = 12 * FX.dpr;
      ctx.shadowColor = 'rgba(' + d.c + ',.38)';
      ctx.arc(d.x, d.y, d.r * FX.dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      for (let j = i + 1; j < FX.dots.length; j++) {
        const o = FX.dots[j];
        const dx = d.x - o.x;
        const dy = d.y - o.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 118 * FX.dpr;
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(105,190,255,' + ((1 - dist / maxDist) * 0.075) + ')';
          ctx.lineWidth = Math.max(0.6, FX.dpr * 0.55);
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(o.x, o.y);
          ctx.stroke();
        }
      }
    }

    FX.raf = requestAnimationFrame(draw);
  }

  function bindTilt() {
    const selector = '.stat,.panel,.section-card,.status-row';
    document.addEventListener('mousemove', function (e) {
      if (FX.reduced || window.innerWidth < 861) return;
      const target = e.target.closest(selector);
      if (!target) return;
      const r = target.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * 3.5;
      const ry = (px - 0.5) * 4.5;
      target.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-1px)';
    });

    document.addEventListener('mouseout', function (e) {
      const target = e.target.closest && e.target.closest(selector);
      if (target) target.style.transform = '';
    });
  }

  function addVisibilityControl() {
    document.addEventListener('visibilitychange', function () {
      if (!FX.ctx || FX.reduced) return;
      if (document.hidden) {
        cancelAnimationFrame(FX.raf);
      } else {
        cancelAnimationFrame(FX.raf);
        draw();
      }
    });
  }

  function init() {
    if (window.__VIETGROUP_FX_READY__) return;
    window.__VIETGROUP_FX_READY__ = true;

    FX.reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    FX.canvas = qs('#fxCanvas');

    document.addEventListener('mousemove', setPointerVars, { passive: true });
    bindTilt();

    if (FX.canvas && !FX.reduced) {
      FX.ctx = FX.canvas.getContext('2d');
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas, { passive: true });
      addVisibilityControl();
      draw();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
