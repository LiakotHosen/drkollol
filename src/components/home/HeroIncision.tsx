'use client';

import { stableVH, isToolbarOnlyResize } from '@/lib/viewport';
import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { HeroSection } from '@/types/database';

interface HeroIncisionProps {
  heroData: HeroSection;
}

const CFG = {
  wide: { n: 111, y: 0.811, touch: 1.27, path: [[1.27, 0.165], [2.47, 0.316], [3.67, 0.47]] as [number, number][] },
  tall: { n: 113, y: 0.795, touch: 0.63, path: [[0.63, 0.114], [1.97, 0.278], [3.54, 0.47]] as [number, number][] },
};

const STORY = {
  descend: 0.06,
  cutEnd: 0.62,
  groups: [[0.14, 0.42], [0.42, 0.62], [0.66, 0.8]] as [number, number][],
};

const fps = 30;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (v: number, a: number, b: number) => clamp((v - a) / (b - a), 0, 1);
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

const BEADS = Array.from({ length: 16 }, (_, i) => ({
  f: (i + 0.5) / 16 + ((i * 37) % 7 - 3) / 260,
  r: 0.5 + ((i * 53) % 10) / 13,
  d: ((i * 29) % 9 - 4) / 12,
  late: ((i * 17) % 5) / 100,
}));

function order(n: number) {
  const o: number[] = [], seen = new Set<number>();
  for (let st = 16; st >= 1; st >>= 1) {
    for (let i = 0; i < n; i += st) {
      if (!seen.has(i)) {
        seen.add(i);
        o.push(i);
      }
    }
  }
  if (!seen.has(n - 1)) o.splice(1, 0, n - 1);
  return o;
}

export function HeroIncision({ heroData }: HeroIncisionProps) {
  const { isBn } = useLanguage();
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emergeRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLButtonElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const hero = heroRef.current;
    const cv = canvasRef.current;
    if (!hero || !cv) return;
    const cx = cv.getContext('2d');
    if (!cx) return;

    let mode: 'wide' | 'tall' = window.innerWidth / stableVH() < 0.9 ? 'tall' : 'wide';
    let C = CFG[mode];
    let W = 1600;
    let H = 900;
    let view = { s: 1, ox: 0, oy: 0 };
    let pS = 0;
    let lastKey = '';
    let edgeDone = false;
    let edgeKey = '';

    const SETS = {
      wide: { f: [] as Blob[], bm: new Map<number, ImageBitmap>(), started: false },
      tall: { f: [] as Blob[], bm: new Map<number, ImageBitmap>(), started: false },
    };

    function resize() {
      if (!C || !cv || !cx) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = window.innerWidth * dpr;
      cv.height = stableVH() * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const s = Math.max(window.innerWidth / W, stableVH() / H);
      const dw = W * s;
      const centre = (window.innerWidth - dw) / 2;
      const safe = 20 - C.path[0][1] * dw;
      view = {
        s,
        ox: clamp(Math.max(centre, Math.min(0, safe)), window.innerWidth - dw, 0),
        oy: (stableVH() - H * s) / 2,
      };
      lastKey = '';
      edgeDone = false;
    }

    const sx = (fx: number) => view.ox + fx * W * view.s;
    const sy = (fy: number) => view.oy + fy * H * view.s;
    const phone = () => window.innerWidth < 560;

    function timeAt(p: number) {
      const d = CFG[mode];
      const end = (d.n - 1) / fps;
      if (p < STORY.descend) return lerp(0, d.touch, p / STORY.descend);
      if (p < STORY.cutEnd) return lerp(d.touch, d.path[d.path.length - 1][0], (p - STORY.descend) / (STORY.cutEnd - STORY.descend));
      return lerp(d.path[d.path.length - 1][0], end, seg(p, STORY.cutEnd, 1));
    }

    function tipAt(t: number) {
      const p = C.path;
      if (t <= p[0][0]) return p[0][1];
      for (let i = 1; i < p.length; i++) {
        if (t <= p[i][0]) return lerp(p[i - 1][1], p[i][1], (t - p[i - 1][0]) / (p[i][0] - p[i - 1][0]));
      }
      return p[p.length - 1][1];
    }

    function frameBitmap(i: number) {
      const bm = SETS[mode].bm;
      if (bm.has(i)) return bm.get(i)!;
      for (let d = 1; d < C.n; d++) {
        if (bm.has(i - d)) return bm.get(i - d)!;
        if (bm.has(i + d)) return bm.get(i + d)!;
      }
      return null;
    }

    function drawCut(t: number) {
      if (!cx) return 0;
      const x0 = C.path[0][1];
      const x1 = C.path[C.path.length - 1][1];
      const tip = tipAt(t);
      if (t < C.touch || tip - x0 < 0.002) return tip;

      const a = sx(x0);
      const b = sx(tip);
      const y = sy(C.y);
      const u = Math.max(1, (view.s * W) / 1300);

      const g = cx.createLinearGradient(0, y - 3 * u, 0, y + 3 * u);
      g.addColorStop(0, '#6d0a10');
      g.addColorStop(0.5, '#b3141d');
      g.addColorStop(1, '#56060a');

      cx.lineCap = 'round';
      cx.strokeStyle = g;
      cx.lineWidth = 2.4 * u;
      cx.beginPath();
      cx.moveTo(a, y);
      for (let x = a; x < b; x += 5 * u) {
        cx.lineTo(x, y + Math.sin(x * 0.09) * 0.3 * u);
      }
      cx.lineTo(Math.max(a, b - 1.5 * u), y);
      cx.stroke();

      cx.strokeStyle = 'rgba(255,255,255,.35)';
      cx.lineWidth = 0.7 * u;
      cx.beginPath();
      cx.moveTo(a, y - 0.8 * u);
      cx.lineTo(Math.max(a, b - 3 * u), y - 0.8 * u);
      cx.stroke();

      BEADS.forEach((k) => {
        const fx = x0 + k.f * (x1 - x0);
        const age = (tip - fx - k.late) / 0.045;
        if (age <= 0) return;
        const gr = ease(clamp(age, 0, 1));
        const px = sx(fx);
        const py = y + k.d * u;
        const rx = k.r * 3.6 * u * gr;
        const ry = k.r * 2.4 * u * gr;

        const rg = cx.createRadialGradient(px - rx * 0.3, py - ry * 0.4, 0, px, py, rx);
        rg.addColorStop(0, '#d62a33');
        rg.addColorStop(0.55, '#9e121b');
        rg.addColorStop(1, '#55050a');

        cx.fillStyle = rg;
        cx.beginPath();
        cx.ellipse(px, py, rx, ry, 0, 0, 7);
        cx.fill();

        cx.fillStyle = 'rgba(255,255,255,.6)';
        cx.beginPath();
        cx.ellipse(px - rx * 0.35, py - ry * 0.35, rx * 0.22, ry * 0.18, 0, 0, 7);
        cx.fill();
      });

      return tip;
    }

    function placeText() {
      const em = emergeRef.current;
      if (!em) return;
      const y = sy(C.y);
      const left = Math.max(20, sx(C.path[0][1]));

      if (phone()) {
        em.style.left = left + 'px';
        em.style.width = window.innerWidth - left - 20 + 'px';
        em.style.top = '84px';
        em.style.height = y - 84 - 2 + 'px';
      } else {
        em.style.left = left + 'px';
        em.style.width = Math.max(300, sx(C.path[C.path.length - 1][1]) - left - 12) + 'px';
        em.style.top = '84px';
        em.style.height = y - 84 - 2 + 'px';
      }

      const lines = Array.from(em.querySelectorAll<HTMLElement>('.ln'));
      if (!lines.length) return;

      const gap = phone() ? 14 : 20;
      const box = em.clientHeight;
      let bottom = phone() ? 8 : 16;

      const rest = [...lines]
        .reverse()
        .map((el) => {
          const h = el.offsetHeight || (el.classList.contains('t-h') ? 90 : el.classList.contains('t-sub') ? 35 : 30);
          const top = box - bottom - h;
          bottom += h + gap;
          return [el, top] as const;
        });

      if (phone()) {
        const total = bottom - gap;
        const shift = Math.max(0, box - total - box * 0.18);
        rest.forEach((r) => {
          r[0].dataset.top = String(r[1] - shift);
        });
      } else {
        rest.forEach(([el, top]) => {
          el.dataset.top = String(top);
        });
      }
    }

    function drawText(p: number, tip: number) {
      const em = emergeRef.current;
      if (!em) return;
      const box = em.clientHeight;

      if (!phone()) {
        const tipX = sx(tip) - em.getBoundingClientRect().left - 14;
        em.style.clipPath = p < STORY.cutEnd ? `inset(-60px ${Math.max(0, em.clientWidth - tipX)}px 0 -60px)` : 'none';
      } else {
        em.style.clipPath = 'none';
      }

      const lines = Array.from(em.querySelectorAll<HTMLElement>('.ln'));
      lines.forEach((el) => {
        const g = parseInt(el.dataset.g || '1', 10) - 1;
        const [a, b] = STORY.groups[g] || [0, 1];
        const e = ease(seg(p, a, b));
        const top = parseFloat(el.dataset.top || '0');
        const y = lerp(box, top, e);

        el.style.transform = `translateY(${y}px)`;
        el.style.top = '0';
        el.style.opacity = e <= 0 ? '0' : String(0.25 + 0.75 * e);
        el.style.filter = e < 1 ? `blur(${(1 - e) * 3}px)` : 'none';
        if (!el.classList.contains('t-cue')) {
          el.style.color = e < 1 ? `rgb(${Math.round(lerp(158, 6, e))},${Math.round(lerp(18, 47, e))},${Math.round(lerp(27, 49, e))})` : '';
        }
      });
    }

    function sampleEdge() {
      if (!cx || !cv) return;
      const n = 24;
      const row = cx.getImageData(0, cv.height - 1, cv.width, 1).data;
      const bw = Math.floor(cv.width / n);
      const stops: string[] = [];

      for (let k = 0; k < n; k++) {
        let r = 0, g = 0, b = 0;
        for (let x = k * bw; x < (k + 1) * bw; x++) {
          const o = x * 4;
          r += row[o];
          g += row[o + 1];
          b += row[o + 2];
        }
        stops.push(`rgb(${Math.round(r / bw)},${Math.round(g / bw)},${Math.round(b / bw)}) ${(((k + 0.5) / n) * 100).toFixed(1)}%`);
      }

      const v = `linear-gradient(90deg,${stops.join(',')})`;
      if (v !== edgeKey) {
        edgeKey = v;
        const doctorSection = document.getElementById('doctor');
        if (doctorSection) {
          doctorSection.style.setProperty('--edge-row', v);
        }
      }
      edgeDone = true;
    }

    async function load() {
      mode = window.innerWidth / stableVH() < 0.9 ? 'tall' : 'wide';
      C = CFG[mode];
      const S = SETS[mode];
      const m = mode;
      lastKey = '';

      const url = (i: number) => `/frames/${m}/${String(i + 1).padStart(3, '0')}.webp`;
      const get = async (i: number) => {
        if (S.f[i]) return;
        try {
          const res = await fetch(url(i));
          const blob = await res.blob();
          S.f[i] = blob;
          const bm = await createImageBitmap(blob);
          S.bm.set(i, bm);
        } catch {}
      };

      await get(0);
      const b0 = S.bm.get(0);
      if (b0) {
        W = b0.width;
        H = b0.height;
      }
      resize();

      if (S.started) return;
      S.started = true;
      const q = order(C.n);
      let k = 0, done = 0;

      const worker = async () => {
        while (k < q.length) {
          const i = q[k++];
          await get(i);
          done++;
          if (m === mode) {
            setLoadingProgress((100 * done) / C.n);
            lastKey = '';
          }
        }
      };

      await Promise.all(Array.from({ length: 6 }, worker));
    }

    function progress() {
      if (!hero) return 0;
      const r = hero.getBoundingClientRect();
      return clamp(-r.top / (hero.offsetHeight - stableVH()), 0, 1);
    }

    let animId: number;
    function tick() {
      const p = progress();
      pS += (p - pS) * 0.28;
      if (Math.abs(p - pS) < 0.0004) pS = p;

      if (C && cx) {
        const t = timeAt(pS);
        const i = clamp(Math.round(t * fps), 0, C.n - 1);
        const key = mode + i + '|' + pS.toFixed(4) + '|' + window.innerWidth + 'x' + stableVH() + '|' + (isBn ? 'bn' : 'en');

        if (key !== lastKey) {
          lastKey = key;
          const bm = frameBitmap(i);
          if (bm) {
            cx.fillStyle = '#F6F6F6';
            cx.fillRect(0, 0, window.innerWidth, stableVH());
            cx.drawImage(bm, view.ox, view.oy, W * view.s, H * view.s);

            const fadeH = 50;
            const fadeG = cx.createLinearGradient(0, stableVH() - fadeH, 0, stableVH());
            fadeG.addColorStop(0, 'rgba(246, 246, 246, 0)');
            fadeG.addColorStop(1, 'rgba(246, 246, 246, 1)');
            cx.fillStyle = fadeG;
            cx.fillRect(0, stableVH() - fadeH, window.innerWidth, fadeH);
          }
          const tip = drawCut(i / fps);
          placeText();
          drawText(pS, tip);
          if (bm && (pS > 0.9 || !edgeDone)) sampleEdge();
        }

        if (cueRef.current) {
          // ring fills with hero progress; fades out as the incision story ends
          cueRef.current.style.setProperty('--p', pS.toFixed(4));
          const fade = 1 - seg(pS, 0.9, 1);
          cueRef.current.style.opacity = String(fade);
          cueRef.current.style.pointerEvents = fade > 0.1 ? 'auto' : 'none';
        }
      }

      animId = requestAnimationFrame(tick);
    }

    if (document.fonts) {
      document.fonts.ready.then(() => {
        lastKey = '';
      });
    }

    const handleResize = () => {
      if (isToolbarOnlyResize()) return;
      const m: 'wide' | 'tall' = window.innerWidth / stableVH() < 0.9 ? 'tall' : 'wide';
      if (m !== mode) {
        load();
      } else {
        resize();
      }
    };

    window.addEventListener('resize', handleResize);
    load();
    animId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isBn]);

  return (
    <section ref={heroRef} className="relative h-[290vh] z-10" id="hero">
      <div className="sticky top-0 h-[100vh] h-[100svh] overflow-hidden bg-[#F6F6F6]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

        {/* Emergent text rising out of the incision */}
        <div ref={emergeRef} className="emerge" id="em">
          <div
            className="ln t-h"
            data-g="1"
            dangerouslySetInnerHTML={{ __html: isBn ? heroData.h1_bn : heroData.h1_en }}
          />
          <div
            className="ln t-sub"
            data-g="2"
            dangerouslySetInnerHTML={{ __html: isBn ? heroData.h2_bn : heroData.h2_en }}
          />
          <a
            href="#doctor"
            className="ln t-cue"
            data-g="3"
          >
            <span>{isBn ? heroData.meet_cta_bn : heroData.meet_cta_en}</span>
            <i>↓</i>
          </a>
        </div>

        {/* Scroll cue indicator */}
        <button
          ref={cueRef}
          type="button"
          className="cue-ring"
          id="cue"
          aria-label={isBn ? heroData.scroll_cue_bn : heroData.scroll_cue_en}
          onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
        >
          <span className="cue-ring__dial" aria-hidden="true">
            <svg viewBox="0 0 52 52">
              <circle className="bg" cx="26" cy="26" r="22" />
              <circle className="fg" cx="26" cy="26" r="22" />
            </svg>
            <i>↓</i>
          </span>
          <span className="cue-ring__tx">
            <b>{isBn ? heroData.scroll_cue_bn : heroData.scroll_cue_en}</b>
            <small>{isBn ? 'অথবা এখানে চাপুন' : 'or tap here'}</small>
          </span>
        </button>

        {/* Preloader progress bar */}
        {loadingProgress < 100 && (
          <div
            ref={loaderRef}
            className="loader"
            id="ld"
            style={{ width: `${loadingProgress}%` }}
          />
        )}
      </div>
    </section>
  );
}
