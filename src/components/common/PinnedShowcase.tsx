'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export interface ShowcaseStep {
  word: string;
  ey?: string;
  title: string;
  body: React.ReactNode;
  img?: { src: string; alt?: string };
  cat?: string;
  alert?: boolean;
}

interface PinnedShowcaseProps {
  steps: ShowcaseStep[];
  mode?: 'default' | 'swap' | 'hero';
  heroImg?: string;
  crumb?: React.ReactNode;
  chips?: { slug: string; name: string; href: string }[];
  activeChip?: string;
}

const rest = (x: number) => {
  const b = Math.floor(x);
  const f = x - b;
  const t = Math.min(1, Math.max(0, (f - 0.3) / 0.4));
  return b + t * t * (3 - 2 * t);
};

export function PinnedShowcase({
  steps,
  mode = 'default',
  heroImg,
  crumb,
  chips,
  activeChip,
}: PinnedShowcaseProps) {
  const { isBn } = useLanguage();
  const showRef = useRef<HTMLElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const docImgRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const galRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const n = steps.length;

  useEffect(() => {
    const el = showRef.current;
    const wordsEl = wordsRef.current;
    const panelEl = panelRef.current;
    const dotsEl = dotsRef.current;
    const docEl = docImgRef.current;
    const heroEl = heroImgRef.current;
    const galEl = galRef.current;
    const hintEl = hintRef.current;

    if (!el || !wordsEl || !panelEl) return;

    let animId: number;
    let pS = 0;

    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const q = Math.min(1, Math.max(0, -r.top / (el.offsetHeight - window.innerHeight)));
      pS += (q - pS) * 0.16;
      if (Math.abs(q - pS) < 0.0003) pS = q;

      const pos = rest(pS * (n - 1));
      const mob = window.innerWidth < 860;
      const step = window.innerHeight * (mob ? 0.36 : 0.6);
      const cur = Math.round(pos);

      // 1. Words motion
      const words = Array.from(wordsEl.children) as HTMLElement[];
      words.forEach((w, i) => {
        const o = i - pos;
        const a = Math.abs(o);
        w.style.transform = `translate(${mob ? '-50%' : '0'}, calc(-50% + ${o * step}px)) scale(${
          1 - Math.min(a, 1) * 0.1
        })`;
        w.style.opacity = String(
          Math.max(0, 1 - a * (mode === 'hero' || mode === 'swap' ? 1.8 : 0.8))
        );
      });

      // 2. Panes motion
      const panes = Array.from(panelEl.children) as HTMLElement[];
      panes.forEach((p, i) => {
        const o = i - pos;
        const a = Math.abs(o);
        const op = Math.max(0, 1 - a * 2.2);
        p.style.transform = `translateY(${o * 70}px)`;
        p.style.opacity = String(op);
        p.style.pointerEvents = op > 0.6 ? 'auto' : 'none';
      });

      // 3. Dots
      if (dotsEl) {
        const dots = Array.from(dotsEl.children) as HTMLElement[];
        dots.forEach((d, i) => d.classList.toggle('on', i === cur));
      }

      // 4. Swap mode (Category pages)
      if (mode === 'swap' && docEl && galEl) {
        const h = Math.min(1, Math.max(0, pos));
        const e = h * h * (3 - 2 * h);
        docEl.style.opacity = String(1 - e);
        docEl.style.transform = mob
          ? `translateX(calc(-50% - ${e * 70}vw))`
          : `translateX(${-e * 45}vw)`;

        const galItems = Array.from(galEl.children) as HTMLElement[];
        galItems.forEach((g, i) => {
          if (!i) return;
          let op: number;
          let sc: number;
          if (i === 1 && pos < 1) {
            op = e;
            sc = 0.45 + 0.55 * e;
          } else {
            op = Math.max(0, 1 - Math.abs(pos - i) * 2);
            sc = 0.9 + 0.1 * op;
          }
          g.style.opacity = String(op);
          g.style.transform = `scale(${sc})`;
        });
      }

      // 5. Hero mode (Condition pages)
      if (mode === 'hero' && heroEl) {
        const h = Math.min(1, Math.max(0, pos));
        const e = h * h * (3 - 2 * h);
        const k = 1 - e;
        heroEl.style.opacity = String(e);

        if (mob) {
          heroEl.style.transform = `translate(-50%, ${k * 30}vh) scale(${0.45 + 0.55 * e})`;
          wordsEl.style.transform = '';
          panelEl.style.transform = '';
        } else {
          heroEl.style.transform = `translateX(${-k * 45}vw) scale(${0.8 + 0.2 * e})`;
          wordsEl.style.transform = `translateX(${-k * 24}vw)`;
          const fc = panes[0]?.querySelector('.sp-card') as HTMLElement | null;
          if (fc) {
            const cx = panelEl.offsetLeft + fc.offsetLeft + fc.offsetWidth / 2;
            panelEl.style.transform = `translateX(${k * (window.innerWidth / 2 - cx)}px)`;
          }
        }

        if (hintEl) {
          hintEl.style.opacity = String(Math.max(0, 1 - pos * 4));
        }
      }

      // 6. Active chip on scroll
      const curCat = steps[cur]?.cat;
      if (curCat) {
        const chipEls = document.querySelectorAll<HTMLAnchorElement>('.show-chips a');
        chipEls.forEach((c) => {
          const on = c.dataset.cat === curCat;
          if (on && !c.classList.contains('on') && mob) {
            const box = c.parentElement;
            if (box) {
              box.scrollTo({
                left: c.offsetLeft - box.clientWidth / 2 + c.offsetWidth / 2,
                behavior: 'smooth',
              });
            }
          }
          c.classList.toggle('on', on);
        });
      }
    };

    const fitShow = () => {
      const mob = window.innerWidth < 860;
      const words = Array.from(wordsEl.children) as HTMLElement[];
      const panes = Array.from(panelEl.children) as HTMLElement[];

      if (mode === 'swap') {
        words.forEach((w, i) => {
          w.style.removeProperty('--fs');
          const base = parseFloat(getComputedStyle(w).fontSize);
          const card = panes[i]?.querySelector<HTMLElement>('.sp-card');
          const target = mob ? document.documentElement.clientWidth * 0.92 : (card ? card.offsetWidth : 400);
          const cap = mob ? 96 : window.innerHeight * (i ? 0.26 : 0.32);
          let fs = Math.min(cap, (base * target * 0.965) / (w.scrollWidth || 1));
          w.style.setProperty('--fs', `${fs}px`);
          fs = Math.min(cap, (fs * target * 0.965) / (w.scrollWidth || 1));
          w.style.setProperty('--fs', `${fs.toFixed(1)}px`);
        });
        return;
      }

      const hm = mode === 'hero';
      const max = window.innerWidth * (mob ? 0.94 : hm ? 0.44 : 0.72);
      words.forEach((w) => {
        w.style.removeProperty('--fs');
        if (mob && !hm) return;
        const base = parseFloat(getComputedStyle(w).fontSize);
        if (w.scrollWidth > max) {
          w.style.setProperty('--fs', `${Math.floor((base * max) / w.scrollWidth)}px`);
        }
      });
    };

    fitShow();
    if (document.fonts) {
      document.fonts.ready.then(fitShow);
    }

    const onResize = () => {
      fitShow();
      onScroll();
    };

    window.addEventListener('resize', onResize);

    const loop = () => {
      onScroll();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [n, mode, steps]);

  return (
    <section
      ref={showRef}
      className={`show ${mode === 'hero' ? 'hero-mode' : mode === 'swap' ? 'swap-mode' : ''}`}
      style={{ '--steps': n } as React.CSSProperties}
    >
      <div className="show-pin">
        {/* Giant Drift Words */}
        <div ref={wordsRef} className="show-words">
          {steps.map((st, i) => (
            <div key={i} className="sw">
              {st.word}
            </div>
          ))}
        </div>

        {/* Doctor Gloves Cutout (for Default and Swap modes) */}
        {mode !== 'hero' && (
          <div ref={docImgRef} className="show-doc">
            <img
              src="/img/doctor-gloves-v3.webp"
              alt="Dr. Fahim Foysal Kollol"
              width={655}
              height={1069}
            />
          </div>
        )}

        {/* Hero Mode Condition Cutout */}
        {mode === 'hero' && heroImg && (
          <div ref={heroImgRef} className="show-hero">
            <img src={heroImg} alt="" />
          </div>
        )}

        {/* Swap Mode Condition Images Gallery */}
        {mode === 'swap' && (
          <div ref={galRef} className="show-gal">
            {steps.map((st, i) => (
              <div key={i} className="g">
                {st.img?.src ? <img src={st.img.src} alt={st.img.alt || ''} /> : null}
              </div>
            ))}
          </div>
        )}

        {/* Top Header: Breadcrumb & Chips */}
        <div className="show-top">
          {crumb && <div className="crumb">{crumb}</div>}
          {chips && (
            <div className="show-chips">
              {chips.map((c) => (
                <Link
                  key={c.slug}
                  href={c.href}
                  className={activeChip === c.slug ? 'on' : ''}
                  data-cat={c.slug}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Panel Cards Container */}
        <div ref={panelRef} className="show-panel">
          {steps.map((st, i) => (
            <div key={i} className="sp">
              {st.img?.src && (
                <div className="sp-img">
                  <img src={st.img.src} alt={st.img.alt || ''} loading="lazy" />
                </div>
              )}
              <div
                className={`sp-card ${st.alert ? 'alert' : ''} ${i === 0 ? 'first' : ''}`}
              >
                {st.img?.src && (
                  <div className="sp-img">
                    <img src={st.img.src} alt={st.img.alt || ''} loading="lazy" />
                  </div>
                )}
                {st.ey && <span className="ey">{st.ey}</span>}
                <h3>{st.title}</h3>
                {st.body}
              </div>
            </div>
          ))}
        </div>

        {/* Hero Mode Pulsing Scroll Hint */}
        {mode === 'hero' && (
          <div ref={hintRef} className="show-hint">
            <span>{isBn ? 'নিচে স্ক্রল করুন' : 'Scroll down to learn more'}</span>
            <b>↓</b>
          </div>
        )}

        {/* Vertical Step Dots */}
        <div ref={dotsRef} className="show-dots">
          {steps.map((_, i) => (
            <i key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
