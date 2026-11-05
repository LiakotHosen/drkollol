'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileStickyBar } from '@/components/MobileStickyBar';
import { AppointmentModal } from '@/components/AppointmentModal';
import { PinnedShowcase, ShowcaseStep } from '@/components/common/PinnedShowcase';
import { useLanguage } from '@/context/LanguageContext';
import { Category, Condition, SiteSettings, Chamber } from '@/types/database';
import { formatDigits } from '@/lib/format-utils';

interface ConditionsHubClientProps {
  categories: Category[];
  conditions: Condition[];
  settings: SiteSettings;
  chambers: Chamber[];
}

export function ConditionsHubClient({
  categories,
  conditions,
  settings,
  chambers,
}: ConditionsHubClientProps) {
  const { lang, isBn } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);

  const t = {
    en: {
      crumb: 'Treatments by Dr. Kollol',
      giant: 'Conditions & Treatments',
      introEy: 'Find your problem',
      introT: 'Every condition, explained simply.',
      introP:
        'Scroll to see the conditions Dr. Kollol treats — or jump to an area below. Each page explains the problem in simple words and how he treats it.',
      browse: 'Browse by area',
      n: 'conditions',
      learnMore: 'Learn more',
      ctaH: 'Don’t wait. Talk to your surgeon.',
      ctaS: 'Call for a serial or come to the chamber — Dr. Kollol will explain your problem and the right treatment.',
      book: 'Book a serial',
      call: 'Call now',
      wa: 'WhatsApp',
    },
    bn: {
      crumb: 'ডাঃ কল্লোলের চিকিৎসা',
      giant: 'রোগ ও চিকিৎসা',
      introEy: 'আপনার সমস্যা খুঁজুন',
      introT: 'প্রতিটা রোগ, সহজ ভাষায়।',
      introP:
        'স্ক্রল করে দেখুন ডাঃ কল্লোল কোন কোন রোগের চিকিৎসা করেন, অথবা নিচে ক্ষেত্র অনুযায়ী খুঁজুন। প্রতিটা পেজে রোগটা আর তার চিকিৎসা সহজ ভাষায় বোঝানো আছে।',
      browse: 'ক্ষেত্র অনুযায়ী খুঁজুন',
      n: 'টি রোগ',
      learnMore: 'বিস্তারিত',
      ctaH: 'দেরি করবেন না। সার্জনের সাথে কথা বলুন।',
      ctaS: 'সিরিয়ালের জন্য কল করুন বা চেম্বারে আসুন — ডাঃ কল্লোল আপনার সমস্যা ও সঠিক চিকিৎসা বুঝিয়ে বলবেন।',
      book: 'সিরিয়াল নিন',
      call: 'কল করুন',
      wa: 'হোয়াটসঅ্যাপ',
    },
  }[lang];

  // List of conditions in category order matching prototype
  const list = categories.flatMap((cat) =>
    conditions.filter((cond) => cond.category_slug === cat.slug)
  );

  const steps: ShowcaseStep[] = [
    {
      word: t.giant,
      ey: t.introEy,
      title: t.introT,
      body: (
        <>
          <p>{t.introP}</p>
          <div className="row">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn btn-p"
            >
              {t.book}
            </button>
            <a className="btn btn-g" href="#cats">
              {t.browse}
            </a>
          </div>
        </>
      ),
    },
    ...list.map((c) => {
      const cat = categories.find((k) => k.slug === c.category_slug);
      return {
        word: isBn ? (c.home_word_bn || c.name_bn) : (c.home_word_en || c.name_en),
        cat: c.category_slug,
        ey: isBn ? cat?.name_bn : cat?.name_en,
        title: isBn ? c.name_bn : c.name_en,
        img: {
          src: c.image_url || `/img/conditions/${c.slug}.webp`,
          alt: isBn ? c.name_bn : c.name_en,
        },
        body: (
          <>
            <p>{isBn ? c.short_bn : c.short_en}</p>
            <div className="meta">
              {c.is_laparoscopic ? (
                <span className="badge lap">
                  {isBn ? 'ল্যাপারোস্কপিক' : 'Laparoscopic'}
                </span>
              ) : (
                <span></span>
              )}
              <Link
                className="go"
                href={`/conditions-treatments/${c.category_slug}/${c.slug}`}
              >
                {t.learnMore} →
              </Link>
            </div>
          </>
        ),
      };
    }),
  ];

  useEffect(() => {
    // 1. Reveal observer for .rv elements
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
          } else if (e.boundingClientRect.top > 0) {
            e.target.classList.remove('in');
          }
        });
      },
      { threshold: 0.12 }
    );

    const observe = () => {
      document.querySelectorAll<HTMLElement>('.rv').forEach((el) => {
        if (el.closest('.cards')) {
          const parent = el.parentNode;
          if (parent) {
            const idx = Array.from(parent.children).indexOf(el);
            el.style.transitionDelay = `${(idx % 6) * 0.06}s`;
          }
        }
        io.observe(el);
      });
    };

    // 2. Upward drift for [data-drift] giant words
    const drift = () => {
      document.querySelectorAll<HTMLElement>('[data-drift]').forEach((el) => {
        const parent = el.parentElement;
        if (!parent) return;
        const r = parent.getBoundingClientRect();
        const k = Number(el.dataset.drift) || 0.18;
        el.style.transform = `translateY(${Math.min(0, r.top) * k}px)`;
      });
    };

    // 3. Spy on sections to toggle active chip
    const sp = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            document.querySelectorAll('#chips .chip').forEach((a) => {
              a.classList.toggle('on', a.getAttribute('href') === `#${e.target.id}`);
            });
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    document.querySelectorAll('#cats section').forEach((s) => sp.observe(s));

    // 4. Fit swords
    const fitSwords = () => {
      document.querySelectorAll<HTMLElement>('.sword').forEach((s) => {
        s.style.fontSize = '';
        const base = parseFloat(getComputedStyle(s).fontSize);
        const max = window.innerWidth * (window.innerWidth < 860 ? 0.9 : 0.88);
        if (s.scrollWidth > max) {
          s.style.fontSize = `${Math.floor((base * max) / s.scrollWidth)}px`;
        }
      });
    };

    observe();
    drift();
    fitSwords();

    if (document.fonts) {
      document.fonts.ready.then(fitSwords);
    }

    const onScroll = () => requestAnimationFrame(drift);
    const onResize = () => fitSwords();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      io.disconnect();
      sp.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [lang, conditions]);

  return (
    <>
      <Navbar
        categories={categories}
        serialPhone={settings.phone_serial}
        onBookClick={() => setModalOpen(true)}
      />

      {/* Pinned Showcase with Doctor Gloves & Condition Cards */}
      <PinnedShowcase
        steps={steps}
        mode="default"
        crumb={t.crumb}
        chips={categories.map((c) => ({
          slug: c.slug,
          name: isBn ? c.name_bn : c.name_en,
          href: `/conditions-treatments/${c.slug}`,
        }))}
      />

      {/* Sticky Chip Navigation Bar */}
      <div className="chipbar">
        <div className="wrap">
          <div className="chips" id="chips">
            {categories.map((c) => (
              <a key={c.slug} className="chip" href={`#${c.slug}`}>
                {isBn ? c.name_bn : c.name_en}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Categories Section */}
      <main id="cats">
        {categories.map((c, i) => {
          const items = conditions.filter((item) => item.category_slug === c.slug);
          const num = isBn
            ? String(items.length).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)])
            : items.length;

          return (
            <section
              className={`sec ${i % 2 ? 'tint' : ''}`}
              id={c.slug}
              key={c.slug}
            >
              <div className="wrap">
                <div style={{ overflow: 'hidden' }}>
                  <p className="sword" data-drift=".18">
                    {isBn ? c.name_bn : c.name_en}
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    gap: '20px',
                    flexWrap: 'wrap',
                  }}
                >
                  <p className="sub rv" style={{ margin: 0 }}>
                    {isBn ? c.desc_bn : c.desc_en}
                  </p>
                  <Link className="chip rv" href={`/conditions-treatments/${c.slug}`}>
                    {num} {t.n} →
                  </Link>
                </div>
                <div className="cards">
                  {items.map((item) => {
                    const name = isBn ? item.name_bn : item.name_en;
                    const med = isBn ? item.med_bn : item.med_en;
                    return (
                      <Link
                        key={item.slug}
                        className="ccard rv"
                        href={`/conditions-treatments/${c.slug}/${item.slug}`}
                      >
                        <img
                          className="cimg"
                          src={item.image_url || `/img/conditions/${item.slug}.webp`}
                          alt=""
                          loading="lazy"
                        />
                        <span className="cat">{isBn ? c.name_bn : c.name_en}</span>
                        <b>{name}</b>
                        {med && med !== name ? <span className="med">{med}</span> : null}
                        <p>{isBn ? item.short_bn : item.short_en}</p>
                        <span className="foot">
                          {item.is_laparoscopic ? (
                            <span className="badge lap">
                              {isBn ? 'ল্যাপারোস্কপিক' : 'Laparoscopic'}
                            </span>
                          ) : (
                            <span></span>
                          )}
                          <span className="more">{t.learnMore}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </main>

      {/* CTA Band */}
      <section className="ctaband rv" id="book">
        <div className="wrap">
          <span className="incision"></span>
          <h2 className="h2">{t.ctaH}</h2>
          <p className="sub">{t.ctaS}</p>
          <div className="row">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn btn-p"
            >
              {t.book}
            </button>
            <a className="btn btn-g" href={`tel:${settings.phone_call}`}>
              {t.call}
            </a>
            <a
              className="btn btn-g"
              href={settings.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.wa}
            </a>
          </div>
          <div className="chambers">
            {chambers.map((ch) => (
              <div className="glass" key={ch.id}>
                <small>{isBn ? ch.schedule_bn : ch.schedule_en}</small>
                <b>{isBn ? ch.name_bn : ch.name_en}</b>
                <p>{isBn ? ch.timing_bn : ch.timing_en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer
        settings={settings}
        categories={categories}
        chambers={chambers}
        onBookClick={() => setModalOpen(true)}
      />

      <MobileStickyBar
        phoneCall={settings.phone_call}
        whatsappUrl={settings.whatsapp_url}
        phoneSerial={settings.phone_serial}
        onBookClick={() => setModalOpen(true)}
      />

      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        chambers={chambers}
        whatsappUrl={settings.whatsapp_url}
      />
    </>
  );
}
