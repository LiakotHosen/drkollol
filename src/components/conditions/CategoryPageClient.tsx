'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileStickyBar } from '@/components/MobileStickyBar';
import { AppointmentModal } from '@/components/AppointmentModal';
import { PinnedShowcase, ShowcaseStep } from '@/components/common/PinnedShowcase';
import { useLanguage } from '@/context/LanguageContext';
import { Category, Condition, SiteSettings, Chamber } from '@/types/database';
import { formatDigits } from '@/lib/format-utils';

interface CategoryPageClientProps {
  category: Category;
  conditions: Condition[];
  allCategories: Category[];
  settings: SiteSettings;
  chambers: Chamber[];
}

export function CategoryPageClient({
  category,
  conditions,
  allCategories,
  settings,
  chambers,
}: CategoryPageClientProps) {
  const { lang, isBn } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);

  const allSecRef = useRef<HTMLElement>(null);
  const otherSecRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  const t = {
    en: {
      eb: 'All conditions in this area',
      other: 'Other areas Dr. Kollol treats',
      all: 'Conditions & Treatments',
      introEy: 'Treated by Dr. Kollol',
      scroll: 'Scroll to see each condition.',
      book: 'Book a serial',
      call: 'Call now',
      wa: 'WhatsApp',
      learnMore: 'Learn more',
      ctaH: 'Don’t wait. Talk to your surgeon.',
      ctaS: 'Call for a serial or come to the chamber — Dr. Kollol will explain your problem and the right treatment.',
    },
    bn: {
      eb: 'এই ক্ষেত্রের সব রোগ',
      other: 'ডাঃ কল্লোল আরও যেসব ক্ষেত্রের চিকিৎসা করেন',
      all: 'রোগ ও চিকিৎসা',
      introEy: 'ডাঃ কল্লোলের চিকিৎসা',
      scroll: 'স্ক্রল করে প্রতিটা রোগ দেখুন।',
      book: 'সিরিয়াল নিন',
      call: 'কল করুন',
      wa: 'হোয়াটসঅ্যাপ',
      learnMore: 'বিস্তারিত',
      ctaH: 'দেরি করবেন না। সার্জনের সাথে কথা বলুন।',
      ctaS: 'সিরিয়ালের জন্য কল করুন বা চেম্বারে আসুন — ডাঃ কল্লোল আপনার সমস্যা ও সঠিক চিকিৎসা বুঝিয়ে বলবেন।',
    },
  }[lang];

  const steps: ShowcaseStep[] = [
    {
      word: isBn ? category.name_bn : category.name_en,
      cat: category.slug,
      ey: t.introEy,
      title: isBn ? category.name_bn : category.name_en,
      body: (
        <>
          <p>
            {isBn ? category.desc_bn : category.desc_en} {t.scroll}
          </p>
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
          </div>
        </>
      ),
    },
    ...conditions.map((c) => ({
      word: isBn ? (c.home_word_bn || c.name_bn) : (c.home_word_en || c.name_en),
      cat: category.slug,
      ey: isBn ? category.name_bn : category.name_en,
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
              href={`/conditions-treatments/${category.slug}/${c.slug}`}
            >
              {t.learnMore} →
            </Link>
          </div>
        </>
      ),
    })),
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

    // 2. Stacking Sections (.stk) logic matching site.js K.stack([allSec, otherSec, cta])
    const stackEls = [allSecRef.current, otherSecRef.current, ctaRef.current].filter(
      Boolean
    ) as HTMLElement[];

    stackEls.forEach((el, i) => {
      el.classList.add('stk');
      el.classList.toggle('stk-up', i > 0);
      el.style.zIndex = String(10 + i);
    });

    let animId: number;
    const drawStack = () => {
      const H = window.innerHeight;
      stackEls.forEach((el, i) => {
        const nx = stackEls[i + 1];
        if (!nx) {
          el.style.position = '';
          el.style.transform = '';
          el.style.opacity = '';
          return;
        }
        el.style.position = 'sticky';
        el.style.top = `${Math.min(0, H - el.offsetHeight)}px`;
        const p = Math.min(1, Math.max(0, 1 - nx.getBoundingClientRect().top / H));
        el.style.transform = p ? `scale(${1 - 0.06 * p})` : '';
        el.style.opacity = p ? String(1 - 0.45 * p) : '';
      });
      animId = requestAnimationFrame(drawStack);
    };

    animId = requestAnimationFrame(drawStack);

    return () => {
      io.disconnect();
      cancelAnimationFrame(animId);
      stackEls.forEach((el) => {
        el.classList.remove('stk', 'stk-up');
        el.style.position = '';
        el.style.transform = '';
        el.style.opacity = '';
        el.style.zIndex = '';
      });
    };
  }, [lang, conditions]);

  return (
    <>
      <Navbar
        categories={allCategories}
        serialPhone={settings.phone_serial}
        onBookClick={() => setModalOpen(true)}
      />

      {/* Pinned Showcase with Swap Mode (Doctor on step 0 -> Condition Cutouts on steps 1..N) */}
      <PinnedShowcase
        steps={steps}
        mode="swap"
        crumb={
          <>
            <Link href="/conditions-treatments">{t.all}</Link>
            &nbsp;/&nbsp;
            <span>{isBn ? category.name_bn : category.name_en}</span>
          </>
        }
      />

      {/* All Conditions Grid in this Area */}
      <section className="sec" id="allSec" ref={allSecRef}>
        <div className="wrap">
          <p className="eyebrow rv" id="eb">
            {t.eb}
          </p>
          <h2 className="h2 rv" id="h2">
            {isBn ? category.name_bn : category.name_en}
          </h2>
          <div className="cards" id="cards">
            {conditions.map((item) => {
              const name = isBn ? item.name_bn : item.name_en;
              const med = isBn ? item.med_bn : item.med_en;
              return (
                <Link
                  key={item.slug}
                  className="ccard rv"
                  href={`/conditions-treatments/${category.slug}/${item.slug}`}
                >
                  <img
                    className="cimg"
                    src={item.image_url || `/img/conditions/${item.slug}.webp`}
                    alt=""
                    loading="lazy"
                  />
                  <span className="cat">{isBn ? category.name_bn : category.name_en}</span>
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

      {/* Other Categories Chips Section */}
      <section className="sec tint" id="otherSec" ref={otherSecRef}>
        <div className="wrap">
          <p className="eyebrow rv" id="otherEb">
            {t.other}
          </p>
          <div className="chips rv" id="others" style={{ marginTop: '16px' }}>
            {allCategories
              .filter((x) => x.slug !== category.slug)
              .map((x) => (
                <Link
                  key={x.slug}
                  className="chip"
                  href={`/conditions-treatments/${x.slug}`}
                >
                  {isBn ? x.name_bn : x.name_en}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Band with Doctor Cutout */}
      <section className="ctaband rv has-doc" id="book" ref={ctaRef}>
        <div className="cta-stick">
          <img
            className="cta-doc"
            src="/img/doctor-cta-v3.webp"
            alt="Dr. Fahim Foysal Kollol"
            width={649}
            height={1081}
            loading="lazy"
          />
        </div>
        <div className="wrap">
          <div className="cta-big">{isBn ? 'ডাঃ কল্লোল' : 'Dr. Kollol'}</div>
          <div className="glass cta-card">
            <span className="incision"></span>
            <h2 className="h2">{t.ctaH}</h2>
            <p className="sub">{t.ctaS}</p>
            <div className="row">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn btn-p"
              >
                {t.book}: {formatDigits(settings.phone_serial, isBn)}
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
        categories={allCategories}
        chambers={chambers}
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
