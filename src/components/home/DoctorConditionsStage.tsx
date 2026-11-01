'use client';

import { stableVH, isToolbarOnlyResize } from '@/lib/viewport';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { Category, Condition, SurgeonProfile } from '@/types/database';

interface DoctorConditionsStageProps {
  profile: SurgeonProfile;
  categories: Category[];
  conditions: Condition[];
  serialPhone?: string;
  callPhone?: string;
  onBookClick?: () => void;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (v: number, a: number, b: number) => clamp((v - a) / (b - a), 0, 1);
const restH = (x: number) => {
  const b = Math.floor(x);
  const f = x - b;
  const t = clamp((f - 0.3) / 0.4, 0, 1);
  return b + t * t * (3 - 2 * t);
};

const DOC_TIMING = {
  hold: 0.05,
  curtain: [0.05, 0.20] as [number, number],
  svc: [0.20, 1.0] as [number, number],
};

export function DoctorConditionsStage({
  profile,
  categories,
  conditions,
  serialPhone = '01750529252',
  callPhone = '01670879100',
  onBookClick,
}: DoctorConditionsStageProps) {
  const { isBn } = useLanguage();

  // Refs for pinned stage container
  const stageRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const docImgRef = useRef<HTMLDivElement>(null);

  // Refs for Intro phase
  const introRef = useRef<HTMLHeadingElement>(null);
  const sideLRef = useRef<HTMLDivElement>(null);
  const sideRRef = useRef<HTMLDivElement>(null);
  const tkrDegRef = useRef<HTMLDivElement>(null);
  const ctaMRef = useRef<HTMLDivElement>(null);

  // Refs for Treatments phase
  const svcHeadRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const svcBarRef = useRef<HTMLDivElement>(null);

  // Stats number count-up state
  const [counts, setCounts] = useState<string[]>(
    profile.stats.map((s) => (isBn ? s.num_bn : s.num_en))
  );

  useEffect(() => {
    setCounts(profile.stats.map((s) => (isBn ? s.num_bn : s.num_en)));
  }, [isBn, profile.stats]);

  // Count-up animation when section is in view
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const BN = '০১২৩৪৫৬৭৮৯';
    const toL = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN.indexOf(d)));
    const toB = (s: string) => s.replace(/\d/g, (d) => BN[parseInt(d, 10)]);

    const countUp = () => {
      profile.stats.forEach((st, idx) => {
        const txt = isBn ? st.num_bn : st.num_en;
        const bnMatch = /[০-৯]/.test(txt);
        const match = toL(txt).match(/[\d,]+/);
        if (!match) return;

        const numVal = parseInt(match[0].replace(/,/g, ''), 10);
        const prefix = toL(txt).slice(0, match.index);
        const suffix = toL(txt).slice((match.index || 0) + match[0].length);
        const start = performance.now();
        const dur = 900;

        const step = (t: number) => {
          const k = Math.min(1, Math.max(0, (t - start) / dur));
          const val = Math.round(numVal * (1 - Math.pow(1 - k, 3)));
          const res = prefix + val.toLocaleString('en-US') + suffix;
          setCounts((prev) => {
            const arr = [...prev];
            arr[idx] = bnMatch ? toB(res) : res;
            return arr;
          });
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            countUp();
          }
        });
      },
      { threshold: 0.1 }
    );

    io.observe(stage);
    return () => io.disconnect();
  }, [isBn, profile.stats]);

  // Dynamic font scaling for mobile Intro title so "Meet Your Surgeon" never clips
  useEffect(() => {
    const fitIntro = () => {
      const el = introRef.current;
      if (!el) return;
      const mob = window.innerWidth < 860;
      if (!mob) {
        el.style.removeProperty('--fs');
        return;
      }
      el.style.removeProperty('--fs');
      const base = parseFloat(window.getComputedStyle(el).fontSize) || 32;
      const wd = el.scrollWidth;
      const maxW = window.innerWidth * 0.90;
      if (wd > maxW) {
        let fs = (base * maxW) / wd;
        fs = Math.max(fs, 18);
        el.style.setProperty('--fs', `${Math.floor(fs)}px`);
      }
    };

    fitIntro();
    window.addEventListener('resize', fitIntro);
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(fitIntro);
    }
    return () => window.removeEventListener('resize', fitIntro);
  }, [isBn, profile.intro_word_en, profile.intro_word_bn]);

  // Filter home featured conditions & rest
  const featured = useMemo(
    () =>
      conditions
        .filter((c) => c.home_order && !c.is_hidden)
        .sort((a, b) => (a.home_order || 0) - (b.home_order || 0)),
    [conditions]
  );
  const rest = useMemo(() => conditions.filter((c) => !c.home_order && !c.is_hidden), [conditions]);

  const svcItems = useMemo(
    () => [
      ...featured.map((c) => ({
        word: isBn ? (c.home_word_bn || c.name_bn) : (c.home_word_en || c.name_en),
        cat: c.category_slug,
        c,
        more: false,
      })),
      {
        word: isBn ? 'আরও অনেক' : 'And more',
        cat: null,
        c: null,
        more: true,
      },
    ],
    [featured, isBn]
  );

  // Group of 3 by position: right x3, left x3... +1 = doctor right, card left
  const sideOf = (i: number) => {
    if (svcItems[i]?.more) return 0;
    return Math.floor(i / 3) % 2 ? -1 : 1;
  };

  // Main scroll loop coordinating Intro lift, single doctor move/scale, and treatments
  useEffect(() => {
    const stage = stageRef.current;
    const docImg = docImgRef.current;
    const introEl = introRef.current;
    const sideL = sideLRef.current;
    const sideR = sideRRef.current;
    const tkrDeg = tkrDegRef.current;
    const ctaM = ctaMRef.current;
    const svcHead = svcHeadRef.current;
    const chipsEl = chipsRef.current;
    const wordsContainer = wordsContainerRef.current;
    const cardsContainer = cardsContainerRef.current;
    const svcBar = svcBarRef.current;

    if (!stage || !docImg) return;

    let animId: number;

    const docState = (i: number) => {
      const sd = sideOf(i);
      if (!sd) return { x: 0, s: 1, y: 0 };
      const H = docImg.offsetHeight || 720;
      const vh = stableVH();
      const S = Math.max(1.6, (0.76 * vh) / (0.42 * H));
      const top0 = vh - H;
      return { x: sd * window.innerWidth * 0.27, s: S, y: vh * 0.24 - (top0 + 0.015 * H * S) };
    };

    const fitWords = () => {
      if (!wordsContainerRef.current) return;
      const words = Array.from(wordsContainerRef.current.children) as HTMLElement[];
      const mob = window.innerWidth < 860;
      const vw = window.innerWidth;
      const vh = stableVH();

      words.forEach((w, i) => {
        w.style.removeProperty('--fs');
        const isMore = !!svcItems[i]?.more;
        const base = parseFloat(window.getComputedStyle(w).fontSize) || 120;
        const wd = w.scrollWidth;

        if (mob) {
          const max = vw * 0.88;
          let fs = wd > max ? (base * max) / wd : base;
          fs = Math.min(fs, vh * 0.12, 72);
          fs = Math.max(fs, 28);
          w.style.setProperty('--fs', `${Math.floor(fs)}px`);
        } else {
          const max = vw * (isMore ? 0.90 : 0.42);
          let fs = wd > max ? (base * max) / wd : base;
          if (!isMore) {
            fs = Math.min(fs, vh * 0.18);
          }
          fs = Math.max(fs, 36);
          w.style.setProperty('--fs', `${Math.floor(fs)}px`);
        }
      });
    };

    fitWords();
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => fitWords());
    }

    const onDraw = () => {
      const r = stage.getBoundingClientRect();
      const vh = stableVH();
      const vw = window.innerWidth;
      // Scroll progress across the whole doctor section
      const q = clamp(-r.top / (stage.offsetHeight - 2 * vh), 0, 1);
      const mob = vw < 860;

      /* 1) Curtain / Intro lift: intro text, qualifications, stats, and ticker lift off */
      const c = seg(q, DOC_TIMING.curtain[0], DOC_TIMING.curtain[1]);
      const up = -c * vh * 1.15;

      if (introEl) {
        introEl.style.transform = `translateY(${up * 1.1}px)`;
        introEl.style.opacity = String(1 - seg(c, 0.55, 1));
      }
      if (sideL) {
        sideL.style.transform = `translateY(${up}px)`;
        sideL.style.opacity = String(1 - seg(c, 0.55, 1));
        sideL.style.pointerEvents = c > 0.5 ? 'none' : 'auto';
      }
      if (sideR) {
        sideR.style.transform = `translateY(${up * 0.9}px)`;
        sideR.style.opacity = String(1 - seg(c, 0.55, 1));
      }
      if (tkrDeg) {
        tkrDeg.style.transform = `translateY(${up * 0.25}px)`;
        tkrDeg.style.opacity = String(1 - seg(c, 0, 0.45));
      }
      if (ctaM) {
        ctaM.style.transform = `translateY(${up * 1.2}px)`;
        ctaM.style.opacity = String(1 - seg(c, 0.55, 1));
        ctaM.style.pointerEvents = c > 0.5 ? 'none' : 'auto';
      }

      /* 2) Treatments appear and the SINGLE doctor image scales/moves to the side */
      const inS = seg(q, DOC_TIMING.curtain[0] + 0.04, DOC_TIMING.curtain[1] + 0.02);
      const n = svcItems.length;
      const pos = mob
        ? seg(q, DOC_TIMING.svc[0], DOC_TIMING.svc[1]) * (n - 1)
        : restH(seg(q, DOC_TIMING.svc[0], DOC_TIMING.svc[1]) * (n - 1));
      const stepDist = vh * (mob ? 0.34 : 0.62);

      if (mob) {
        docImg.style.transform = '';
      } else {
        const a = Math.floor(pos);
        const f = pos - a;
        const A = docState(a);
        const B = docState(Math.min(n - 1, a + 1));
        const e = f * f * (3 - 2 * f);
        const C = { x: 0, s: 1, y: 0 };
        const k = inS * inS * (3 - 2 * inS);

        let x = lerp(A.x, B.x, e);
        let sc =
          lerp(A.s, B.s, e) -
          Math.sin(Math.PI * e) * (A.x && B.x && A.x !== B.x ? 0.45 : 0);
        let y = lerp(A.y, B.y, e);

        // Transition from intro (center, scale 1) into treatments swinging positions
        x = lerp(C.x, x, k);
        sc = lerp(1, sc, k);
        y = lerp(0, y, k);

        docImg.style.transformOrigin = '50% 0';
        docImg.style.transform = `translateX(calc(-50% + ${x}px)) translateY(${y}px) scale(${sc})`;
      }

      if (svcHead) svcHead.style.opacity = String(inS);
      if (svcBar) svcBar.style.opacity = String(inS);

      if (wordsContainer && cardsContainer) {
        const words = Array.from(wordsContainer.children) as HTMLElement[];
        const cards = Array.from(cardsContainer.children) as HTMLElement[];
        const bars = svcBar ? (Array.from(svcBar.children) as HTMLElement[]) : [];

        words.forEach((w, i) => {
          const o = i - pos;
          const a = Math.abs(o);
          const wx = mob ? 0 : -sideOf(i) * vw * 0.25;
          w.style.transform = `translate(calc(-50% + ${wx}px), calc(-50% + ${
            o * stepDist + (1 - inS) * vh * 0.9
          }px - ${mob ? 14 : sideOf(i) ? 14 : 8}vh)) scale(${1 - Math.min(a, 1) * 0.12})`;
          w.style.opacity = String(clamp(1 - a * 0.75, 0, 1) * inS);
        });

        cards.forEach((cd, i) => {
          const o = i - pos;
          const a = Math.abs(o);
          const co = clamp(1 - a * 2.4, 0, 1) * inS;
          cd.style.opacity = String(co);
          cd.style.pointerEvents = co > 0.5 ? 'auto' : 'none';
          cd.style.transform = `translateY(${o * (mob ? 30 : 50)}px)`;
        });

        bars.forEach((b, i) => {
          b.classList.toggle('on', Math.round(pos) === i);
        });
      }

      // Category chip lights up as user scrolls
      const cur = svcItems[Math.round(pos)];
      if (chipsEl) {
        chipsEl.querySelectorAll('a').forEach((a) => {
          const on = !!cur && a.dataset.cat === cur.cat;
          if (on && !a.classList.contains('on') && mob) {
            chipsEl.scrollTo({
              left: a.offsetLeft - chipsEl.clientWidth / 2 + a.offsetWidth / 2,
              behavior: 'smooth',
            });
          }
          a.classList.toggle('on', on);
        });
      }
    };

    const onResize = () => {
      if (isToolbarOnlyResize()) return;
      fitWords();
      onDraw();
    };
    window.addEventListener('resize', onResize);

    const loop = () => {
      onDraw();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [svcItems]);

  return (
    <section
      ref={stageRef}
      className="doc"
      id="doctor"
      style={{
        height: `calc(${svcItems.length} * 80vh + 330vh)`,
      }}
    >
      <div ref={pinRef} className="pin">
        <div className="glow" />

        {/* --- INTRO PHASE ELEMENTS --- */}
        {/* Giant Intro Heading Watermark */}
        <h2 ref={introRef} className="intro rv in">
          <span>
            {isBn
              ? profile.intro_word_bn || 'ইনিই আপনার সার্জন'
              : profile.intro_word_en || 'Meet Your Surgeon'}
          </span>
        </h2>

        {/* Left Side: Doctor Qualifications & Actions */}
        <div ref={sideLRef} className="side l">
          <h3 className="name rv in">{isBn ? profile.name_bn : profile.name_en}</h3>
          <p className="role rv in">{isBn ? profile.role_bn : profile.role_en}</p>
          <div className="deg rv in">
            {profile.degrees_badges.map((deg, i) => (
              <span key={i}>{deg}</span>
            ))}
          </div>
          <p className="post rv in">{isBn ? profile.post_bn : profile.post_en}</p>
          <div className="cta rv in">
            <div className="row">
              {onBookClick ? (
                <button
                  type="button"
                  onClick={onBookClick}
                  className="btn btn-p"
                >
                  {isBn ? 'সিরিয়াল নিন' : 'Book a serial'}
                </button>
              ) : (
                <a href={`tel:${serialPhone}`} className="btn btn-p">
                  {isBn ? 'সিরিয়াল নিন' : 'Book a serial'}
                </a>
              )}
              <a href={`tel:${callPhone}`} className="btn btn-g">
                {isBn ? 'কল করুন' : 'Call now'}
              </a>
            </div>
            <p
              dangerouslySetInnerHTML={{
                __html: isBn ? profile.chambers_summary_bn : profile.chambers_summary_en,
              }}
            />
          </div>
        </div>

        {/* Right Side: 6 Verified Surgical Experience Stats */}
        <div ref={sideRRef} className="side r">
          <div className="stats">
            {profile.stats.map((st, i) => (
              <div key={i} className="stat rv in">
                <b>{counts[i] || (isBn ? st.num_bn : st.num_en)}</b>
                <span>{isBn ? st.label_bn : st.label_en}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Infinite Scrolling Degrees & Recognition Ticker */}
        <div ref={tkrDegRef} className="tkr tkr-deg">
          <div className="trk" style={{ '--dur': '35s' } as React.CSSProperties}>
            {profile.degrees_ticker.map((item, idx) => (
              <span key={idx} className="it">
                <span>{isBn ? item.bn : item.en}</span>
                <span className="sep">✦</span>
              </span>
            ))}
            {profile.degrees_ticker.map((item, idx) => (
              <span key={`dup-${idx}`} className="it">
                <span>{isBn ? item.bn : item.en}</span>
                <span className="sep">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* Mobile-Only CTA Button */}
        <div ref={ctaMRef} className="cta-m">
          {onBookClick ? (
            <button
              type="button"
              onClick={onBookClick}
              className="btn btn-p"
            >
              {isBn ? 'সিরিয়াল নিন' : 'Book a serial'}
            </button>
          ) : (
            <a href={`tel:${serialPhone}`} className="btn btn-p">
              {isBn ? 'সিরিয়াল নিন' : 'Book a serial'}
            </a>
          )}
          <a href={`tel:${callPhone}`} className="btn btn-g">
            {isBn ? 'কল করুন' : 'Call now'}
          </a>
        </div>

        {/* --- SINGLE DOCTOR IMAGE (Transitions smoothly from Intro to Treatments) --- */}
        <div ref={docImgRef} className="doc-img">
          <Image
            src="/img/doctor-v3.webp"
            alt="Dr. Fahim Foysal Kollol, surgeon, in green scrubs"
            width={624}
            height={1126}
            priority
          />
        </div>

        {/* --- CONDITIONS & TREATMENTS PHASE ELEMENTS --- */}
        {/* Category Chips & Section Title */}
        <div ref={svcHeadRef} className="svc-head" id="svcHead" style={{ opacity: 0 }}>
          <span>
            {isBn ? 'যেসব রোগের চিকিৎসা করেন ডাঃ কল্লোল' : 'Conditions Dr. Kollol treats'}
          </span>
          <div ref={chipsRef} className="svc-chips" id="svcChips">
            {categories.map((c) => (
              <Link
                key={c.slug}
                data-cat={c.slug}
                href={`/conditions-treatments/${c.slug}`}
              >
                {isBn ? c.name_bn : c.name_en}
              </Link>
            ))}
          </div>
        </div>

        {/* Giant Condition Words Background Container */}
        <div ref={wordsContainerRef} className="svc-words" id="svcWords">
          {svcItems.map((item, idx) => (
            <div key={idx} className="svc-word" style={{ opacity: 0 }}>
              {item.word}
            </div>
          ))}
        </div>

        {/* Treatments Glass Cards */}
        <div ref={cardsContainerRef} id="svcCards">
          {svcItems.map((item, idx) => {
            if (item.more) {
              return (
                <div key="more" className="svc-card r more" style={{ opacity: 0, pointerEvents: 'none' }}>
                  <small>{isBn ? 'সব রোগ ও চিকিৎসা' : 'All conditions & treatments'}</small>
                  <b>
                    {isBn
                      ? 'ডাঃ কল্লোল আরও যেসব রোগের চিকিৎসা করেন'
                      : 'More conditions Dr. Kollol treats'}
                  </b>
                  <div className="tags">
                    {rest.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/conditions-treatments/${c.category_slug}/${c.slug}`}
                      >
                        {isBn ? c.name_bn : c.name_en}
                      </Link>
                    ))}
                    <Link className="plus" href="/conditions-treatments">
                      +{rest.length - 6 > 0 ? rest.length - 6 : 4}
                    </Link>
                  </div>
                  <p style={{ marginTop: '12px' }}>
                    {isBn
                      ? 'কোন রোগ বুঝতে পারছেন না? একবার দেখিয়ে নিন।'
                      : 'Not sure what you have? Come for a check-up.'}
                  </p>
                  <div className="row">
                    {onBookClick ? (
                      <button type="button" onClick={onBookClick} className="btn btn-p">
                        {isBn ? 'সিরিয়াল নিন' : 'Book a serial'}
                      </button>
                    ) : (
                      <a href={`tel:${serialPhone}`} className="btn btn-p">
                        {isBn ? 'সিরিয়াল নিন' : 'Book a serial'}
                      </a>
                    )}
                    <Link href="/conditions-treatments" className="btn btn-g">
                      {isBn ? 'সব রোগ ও চিকিৎসা' : 'All conditions & treatments'}
                    </Link>
                  </div>
                </div>
              );
            }

            const c = item.c!;
            const isLeft = Math.floor(idx / 3) % 2 === 0;
            const cat = categories.find((ct) => ct.slug === c.category_slug);

            return (
              <Link
                key={c.slug}
                className={`svc-card ${isLeft ? 'l' : 'r'}`}
                href={`/conditions-treatments/${c.category_slug}/${c.slug}`}
                style={{ opacity: 0, pointerEvents: 'none' }}
              >
                <img
                  className="ci"
                  src={c.image_url || `/img/conditions/${c.slug}.webp?v=2`}
                  alt={isBn ? c.name_bn : c.name_en}
                  loading="lazy"
                />
                <small>{cat ? (isBn ? cat.name_bn : cat.name_en) : ''}</small>
                <b>{isBn ? c.name_bn : c.name_en}</b>
                <p>{isBn ? c.short_bn : c.short_en}</p>
                <span className="meta">
                  {c.is_laparoscopic ? (
                    <span className="lapb">{isBn ? 'ল্যাপারোস্কপিক' : 'Laparoscopic'}</span>
                  ) : (
                    <span />
                  )}
                  <span className="go">{isBn ? 'বিস্তারিত →' : 'Learn more →'}</span>
                </span>
              </Link>
            );
          })}
        </div>

        {/* Dots Indicator */}
        <div ref={svcBarRef} className="svc-bar" id="svcBar" style={{ opacity: 0 }}>
          {svcItems.map((_, i) => (
            <i key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
