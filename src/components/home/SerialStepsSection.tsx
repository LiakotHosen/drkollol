'use client';

import { stableVH, isToolbarOnlyResize } from '@/lib/viewport';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { SerialStep, SurgeonProfile } from '@/types/database';

interface SerialStepsSectionProps {
  steps: SerialStep[];
  profile: SurgeonProfile;
  onBookClick?: () => void;
}

const restH = (x: number) => {
  const b = Math.floor(x);
  const f = x - b;
  const t = Math.min(1, Math.max(0, (f - 0.3) / 0.4));
  return b + t * t * (3 - 2 * t);
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

interface StepButton {
  k: string;
  text: string;
  href: string;
  isBook?: boolean;
  target?: string;
}

interface StepItem {
  t: string;
  p: string;
  b: StepButton[];
}

export function SerialStepsSection({ steps, profile, onBookClick }: SerialStepsSectionProps) {
  const { lang, isBn } = useLanguage();
  const serialSectionRef = useRef<HTMLElement>(null);
  const hsHRef = useRef<HTMLHeadingElement>(null);
  const hsCardsRef = useRef<HTMLDivElement>(null);
  const hsBarRef = useRef<HTMLDivElement>(null);

  const SERIAL_NO = '01750529252';
  const WA_URL = 'https://wa.me/8801670879100';

  const t: { hsH: string; steps: StepItem[] } = {
    en: {
      hsH: 'How to get a serial',
      steps: [
        {
          t: 'See where & when he sits',
          p: 'Sherpur every Thursday & Friday · Mymensingh Saturday to Tuesday. Addresses, days and times are on this page.',
          b: [{ k: 'g', text: 'Chambers & timings →', href: '#visit' }],
        },
        {
          t: 'Tap “Book a serial”',
          p: 'The “Book a serial” button is on every page of the website. One tap opens the serial number.',
          b: [{ k: 'p', text: 'Book a serial', href: `tel:${SERIAL_NO}`, isBook: true }],
        },
        {
          t: 'Call or WhatsApp to confirm',
          p: 'Tell us your name, your problem and your chamber — you’ll get your serial number.',
          b: [
            { k: 'p', text: 'Call', href: `tel:${SERIAL_NO}` },
            { k: 'g', text: 'WhatsApp', href: WA_URL, target: '_blank' },
          ],
        },
      ],
    },
    bn: {
      hsH: 'যেভাবে সিরিয়াল নেবেন',
      steps: [
        {
          t: 'দেখে নিন কবে, কোথায় বসেন',
          p: 'শেরপুরে প্রতি বৃহস্পতি ও শুক্রবার · ময়মনসিংহে শনি থেকে মঙ্গলবার। ঠিকানা, দিন ও সময় এই পাতাতেই আছে।',
          b: [{ k: 'g', text: 'চেম্বার ও সময় দেখুন →', href: '#visit' }],
        },
        {
          t: '“সিরিয়াল নিন” বোতামে চাপ দিন',
          p: 'ওয়েবসাইটের প্রতিটা পাতায় “সিরিয়াল নিন” বোতাম আছে। চাপ দিলেই সিরিয়ালের নম্বর খুলে যাবে।',
          b: [{ k: 'p', text: 'সিরিয়াল নিন', href: `tel:${SERIAL_NO}`, isBook: true }],
        },
        {
          t: 'কল বা WhatsApp-এ নিশ্চিত করুন',
          p: 'আপনার নাম, সমস্যা আর কোন চেম্বারে দেখাবেন জানান — সিরিয়াল নম্বর জানিয়ে দেওয়া হবে।',
          b: [
            { k: 'p', text: 'কল করুন', href: `tel:${SERIAL_NO}` },
            { k: 'g', text: 'WhatsApp', href: WA_URL, target: '_blank' },
          ],
        },
      ],
    },
  }[lang];

  const ICONS = [
    // 1: Calendar / Schedule
    <svg key="1" viewBox="0 0 240 240" role="img" aria-hidden="true">
      <g className="si-flo">
        <use href="#siP" x="70" y="118" />
      </g>
      <g transform="translate(132 86)">
        <rect width="100" height="96" rx="14" className="si-fill" />
        <rect width="100" height="24" rx="12" fill="#0B6E73" />
        <rect x="18" y="-10" width="8" height="20" rx="4" className="si-wh" />
        <rect x="74" y="-10" width="8" height="20" rx="4" className="si-wh" />
        <rect x="8" y="30" width="84" height="58" rx="8" className="si-wh" />
        <rect className="si-day" x="14" y="36" width="20" height="14" rx="4" />
        <rect className="si-day si-d1" x="40" y="36" width="20" height="14" rx="4" />
        <rect className="si-day" x="66" y="36" width="20" height="14" rx="4" />
        <rect className="si-day" x="14" y="56" width="20" height="14" rx="4" />
        <rect className="si-day si-d2" x="40" y="56" width="20" height="14" rx="4" />
        <rect className="si-day si-d3" x="66" y="56" width="20" height="14" rx="4" />
        <rect className="si-day" x="14" y="76" width="20" height="8" rx="3" />
        <rect className="si-day" x="40" y="76" width="20" height="8" rx="3" />
      </g>
      <g className="si-pin">
        <path
          d="M186 30 C170 30 160 42 160 55 C160 72 186 96 186 96 C186 96 212 72 212 55 C212 42 202 30 186 30 Z"
          className="si-soft"
          stroke="#fff"
          strokeWidth="4"
        />
        <circle cx="186" cy="55" r="9" className="si-wh" />
      </g>
    </svg>,

    // 2: Book Button Touch
    <svg key="2" viewBox="0 0 240 240" role="img" aria-hidden="true">
      <g className="si-flo">
        <use href="#siP" x="62" y="122" />
      </g>
      <circle className="si-rip" cx="150" cy="96" r="42" />
      <circle className="si-rip si-rip2" cx="150" cy="96" r="42" />
      <g className="si-btn">
        <circle cx="150" cy="96" r="42" className="si-fill" stroke="#fff" strokeWidth="5" />
        <text
          x="150"
          y="92"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Inter,Arial,sans-serif"
          fontWeight="700"
          fontSize="13"
        >
          BOOK A
        </text>
        <text
          x="150"
          y="110"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Inter,Arial,sans-serif"
          fontWeight="700"
          fontSize="13"
        >
          SERIAL
        </text>
      </g>
      <g transform="translate(40 60) scale(.75)">
        <g className="si-finger">
          <path
            d="M178 136 L178 112 Q178 104 186 104 Q194 104 194 112 L194 132 Q206 128 214 136 Q222 144 218 160 L212 186 Q208 196 196 196 L184 196 Q174 196 168 186 L158 166 Q154 158 162 154 Q170 150 176 158 Z"
            className="si-soft"
            stroke="#fff"
            strokeWidth="4"
          />
        </g>
      </g>
    </svg>,

    // 3: Call & WhatsApp
    <svg key="3" viewBox="0 0 240 240" role="img" aria-hidden="true">
      <g className="si-flo">
        <use href="#siP" x="80" y="126" />
      </g>
      <g className="si-bub">
        <path
          d="M56 22 H136 Q150 22 150 36 V70 Q150 84 136 84 H92 L74 100 L78 84 H56 Q42 84 42 70 V36 Q42 22 56 22 Z"
          className="si-wh"
          stroke="#2BB3B1"
          strokeWidth="5"
        />
        <circle className="si-dot" cx="78" cy="53" r="6" />
        <circle className="si-dot si-dt2" cx="96" cy="53" r="6" />
        <circle className="si-dot si-dt3" cx="114" cy="53" r="6" />
        <path className="si-tick" d="M80 54 L92 66 L114 42" />
      </g>
      <g className="si-ring">
        <rect x="170" y="104" width="54" height="94" rx="12" className="si-fill" stroke="#fff" strokeWidth="5" />
        <rect x="178" y="116" width="38" height="62" rx="5" className="si-wh" />
        <path
          d="M188 138 q4 -6 8 0 l2 6 q-2 4 2 8 q4 4 8 2 l6 2 q6 4 0 8 q-10 6 -22 -6 q-12 -12 -4 -20 z"
          fill="#0B6E73"
        />
        <circle cx="197" cy="188" r="4" className="si-wh" />
      </g>
    </svg>,
  ];

  const BNd = (n: number | string) =>
    String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);

  // Dynamically scale heading on mobile so "যেভাবে সিরিয়াল নেবেন" never clips
  useEffect(() => {
    const fitHsH = () => {
      const el = hsHRef.current;
      if (!el) return;
      const mob = window.innerWidth < 860;
      if (!mob) {
        el.style.removeProperty('--fs');
        return;
      }
      el.style.removeProperty('--fs');
      const base = parseFloat(window.getComputedStyle(el).fontSize) || 28;
      const wd = el.scrollWidth;
      const maxW = window.innerWidth * 0.90;
      if (wd > maxW) {
        let fs = (base * maxW) / wd;
        fs = Math.max(fs, 18);
        el.style.setProperty('--fs', `${Math.floor(fs)}px`);
      }
    };

    fitHsH();
    window.addEventListener('resize', fitHsH);
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(fitHsH);
    }
    return () => window.removeEventListener('resize', fitHsH);
  }, [lang, t.hsH]);

  useEffect(() => {
    const serialEl = serialSectionRef.current;
    const cardsEl = hsCardsRef.current;
    const barEl = hsBarRef.current;
    const doctorSection = document.getElementById('doctor');
    const pinEl = doctorSection ? doctorSection.querySelector<HTMLElement>('.pin') : null;

    if (!serialEl || !cardsEl) return;

    let animId: number;
    let hsLast = '';

    const hsDraw = () => {
      const vh = stableVH();
      const r = serialEl.getBoundingClientRect();
      const cover = clamp(1 - r.top / vh, 0, 1);
      const mob = window.innerWidth < 860;

      if (pinEl) {
        pinEl.style.transform = cover > 0 && cover < 1 ? `scale(${1 - 0.06 * cover})` : cover >= 1 ? 'scale(.94)' : '';
        pinEl.style.opacity = cover > 0 ? String(1 - 0.5 * cover) : '';
      }

      const hsEls = Array.from(cardsEl.children) as HTMLElement[];
      const n = hsEls.length;
      if (!n) return;

      const q = clamp(-r.top / (serialEl.offsetHeight - vh), 0, 1);
      const pos = restH(q * (n - 1)) - (1 - cover);
      const key = pos.toFixed(4) + mob + window.innerWidth;
      if (key === hsLast) return;
      hsLast = key;

      hsEls.forEach((el, i) => {
        const o = i - pos;
        const a = Math.abs(o);
        if (mob) {
          el.style.transform = `translateY(${o * 72}vh) scale(${1 - Math.min(a, 1) * 0.08})`;
          el.style.opacity = String(clamp(1 - a * 1.6, 0, 1));
        } else {
          el.style.transform = `translateX(${o * 46}vw) scale(${1 - Math.min(a, 1.5) * 0.16})`;
          el.style.opacity = String(a > 1.7 ? 0 : clamp(1 - a * 0.55, 0, 1));
        }
        el.style.zIndex = String(10 - Math.round(a * 2));
        el.style.pointerEvents = a < 0.5 ? 'auto' : 'none';
        el.classList.toggle('cur', a < 0.5);
      });

      if (barEl) {
        const bars = Array.from(barEl.children) as HTMLElement[];
        bars.forEach((b, i) => {
          b.classList.toggle('on', Math.round(clamp(pos, 0, n - 1)) === i);
        });
      }
    };

    const loop = () => {
      hsDraw();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <>
      {/* SVG Definitions for Icons */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="siG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0B6E73" />
            <stop offset="1" stopColor="#2BB3B1" />
          </linearGradient>
          <linearGradient id="siS" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2BB3B1" />
            <stop offset="1" stopColor="#7fd6d3" />
          </linearGradient>
          <g id="siP">
            <ellipse fill="rgba(6,47,49,.10)" cx="0" cy="96" rx="46" ry="6" />
            <path className="si-fill" d="M-44 92 L-39 42 Q-36 16 0 16 Q36 16 39 42 L44 92 Z" />
            <circle className="si-fill" stroke="#fff" strokeWidth="5" cx="0" cy="-20" r="30" />
          </g>
        </defs>
      </svg>

      {/* How to get a serial: rises over the conditions stage */}
      <section ref={serialSectionRef} className="hs" id="serial">
        <div className="hs-pin">
          {/* Numbers Ticker */}
          <div className="tkr tkr-num" id="tkrNum">
            <div className="trk" style={{ '--dur': '35s' } as React.CSSProperties}>
              {profile.stats.map((st, i) => (
                <span key={i} className="it">
                  <b data-t={`s${i + 1}n`}>{isBn ? st.num_bn : st.num_en}</b>
                  <span>{isBn ? st.label_bn : st.label_en}</span>
                  <span className="sep">✦</span>
                </span>
              ))}
              {/* Repeated for seamless loop */}
              {profile.stats.map((st, i) => (
                <span key={`dup-${i}`} className="it">
                  <b data-t={`s${i + 1}n`}>{isBn ? st.num_bn : st.num_en}</b>
                  <span>{isBn ? st.label_bn : st.label_en}</span>
                  <span className="sep">✦</span>
                </span>
              ))}
            </div>
          </div>

          <h2 ref={hsHRef} className="hs-h" id="hsH">
            {t.hsH}
          </h2>

          <div ref={hsCardsRef} className="hs-cards" id="hsCards">
            {t.steps.map((step, idx) => (
              <div key={idx} className="hs-card">
                <div className="ico">{ICONS[idx]}</div>
                <div>
                  <span className="num">{isBn ? BNd(idx + 1) : idx + 1}</span>
                  <h3>{step.t}</h3>
                  <p>{step.p}</p>
                  <div className="row">
                    {step.b.map((btn, bIdx) => {
                      if (btn.isBook && onBookClick) {
                        return (
                          <button
                            key={bIdx}
                            type="button"
                            onClick={onBookClick}
                            className={`btn btn-${btn.k}`}
                          >
                            {btn.text}
                          </button>
                        );
                      }
                      return (
                        <a
                          key={bIdx}
                          className={`btn btn-${btn.k}`}
                          href={btn.href}
                          target={btn.target}
                          rel={btn.target ? 'noopener noreferrer' : undefined}
                        >
                          {btn.text}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div ref={hsBarRef} className="hs-bar" id="hsBar">
            {t.steps.map((_, i) => (
              <i key={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
