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

interface ConditionPageClientProps {
  condition: Condition;
  category: Category;
  categories: Category[];
  relatedConditions: Condition[];
  settings: SiteSettings;
  chambers: Chamber[];
}

export function ConditionPageClient({
  condition,
  category,
  categories,
  relatedConditions,
  settings,
  chambers,
}: ConditionPageClientProps) {
  const { lang, isBn } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);

  const ctaRef = useRef<HTMLElement>(null);
  const relSecRef = useRef<HTMLElement>(null);

  const t = {
    en: {
      all: 'Conditions & Treatments',
      what: 'What is it?',
      whatW: 'What is it?',
      symp: 'Symptoms',
      sympT: 'Do you have these?',
      treat: 'Treatment',
      treatT: 'How Dr. Kollol treats it',
      when: 'When to see a doctor',
      whenW: 'Don’t wait',
      whenT: 'Act early',
      lap: 'Laparoscopic (keyhole) surgery',
      relEb: 'Related',
      relH: 'Other conditions in this area',
      book: 'Book a serial',
      call: 'Call now',
      wa: 'WhatsApp',
      learnMore: 'Learn more',
      ctaH: 'Don’t wait. Talk to your surgeon.',
      ctaS: 'Call for a serial or come to the chamber — Dr. Kollol will explain your problem and the right treatment.',
    },
    bn: {
      all: 'রোগ ও চিকিৎসা',
      what: 'এটা কী?',
      whatW: 'এটা কী?',
      symp: 'লক্ষণ',
      sympT: 'আপনার কি এমন হচ্ছে?',
      treat: 'চিকিৎসা',
      treatT: 'ডাঃ কল্লোল যেভাবে চিকিৎসা করেন',
      when: 'কখন ডাক্তার দেখাবেন',
      whenW: 'দেরি নয়',
      whenT: 'আগে দেখান',
      lap: 'ল্যাপারোস্কপিক (ছোট ছিদ্রে) অপারেশন',
      relEb: 'আরও দেখুন',
      relH: 'এই ক্ষেত্রের অন্যান্য রোগ',
      book: 'সিরিয়াল নিন',
      call: 'কল করুন',
      wa: 'হোয়াটসঅ্যাপ',
      learnMore: 'বিস্তারিত',
      ctaH: 'দেরি করবেন না। সার্জনের সাথে কথা বলুন।',
      ctaS: 'সিরিয়ালের জন্য কল করুন বা চেম্বারে আসুন — ডাঃ কল্লোল আপনার সমস্যা ও সঠিক চিকিৎসা বুঝিয়ে বলবেন।',
    },
  }[lang];

  const name = isBn ? condition.name_bn : condition.name_en;
  const word = isBn
    ? (condition.home_word_bn || condition.name_bn)
    : (condition.home_word_en || condition.name_en);
  const med = isBn ? condition.med_bn : condition.med_en;
  const stat = isBn ? condition.stat_bn : condition.stat_en;

  const steps: ShowcaseStep[] = [
    // Step 1: Overview & TOC
    {
      word,
      cat: condition.category_slug,
      ey: `${isBn ? category.name_bn : category.name_en}${
        med && med !== name ? ` · ${med}` : ''
      }`,
      title: name,
      body: (
        <>
          <p>{isBn ? condition.short_bn : condition.short_en}</p>
          <div className="toc">
            <small>{isBn ? 'এই পাতায়' : 'On this page'}</small>
            {[t.what, t.symp, t.treat, t.when].map((tab, idx) => (
              <span key={idx}>
                <i>{idx + 1}</i>
                {tab}
              </span>
            ))}
          </div>
          {(condition.is_laparoscopic || stat) && (
            <div className="meta">
              {condition.is_laparoscopic ? (
                <span className="badge lap">{t.lap}</span>
              ) : null}
              {stat ? <span className="go">✓ {stat}</span> : null}
            </div>
          )}
          <div className="row">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn btn-p"
            >
              {t.book}
            </button>
            <a
              className="btn btn-g"
              href={settings.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.wa}
            </a>
          </div>
        </>
      ),
    },

    // Step 2: What is it?
    {
      word: t.whatW,
      cat: condition.category_slug,
      ey: t.what,
      title: name,
      body: (
        <p style={{ fontSize: '16px', color: 'var(--ink)' }}>
          {isBn ? condition.what_bn : condition.what_en}
        </p>
      ),
    },

    // Step 3: Symptoms
    {
      word: t.symp,
      cat: condition.category_slug,
      ey: t.symp,
      title: t.sympT,
      body: (
        <ul>
          {(isBn ? condition.symptoms_bn : condition.symptoms_en).map((s, idx) => (
            <li key={idx}>{s}</li>
          ))}
        </ul>
      ),
    },

    // Step 4: Treatment
    {
      word: t.treat,
      cat: condition.category_slug,
      ey: t.treat,
      title: t.treatT,
      body: (
        <>
          <ol>
            {(isBn ? condition.treat_bn : condition.treat_en).map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
          {stat && (
            <div className="meta">
              <span className="go">✓ {stat}</span>
            </div>
          )}
        </>
      ),
    },

    // Step 5: When to see a doctor
    {
      word: t.whenW,
      cat: condition.category_slug,
      alert: true,
      ey: t.when,
      title: t.whenT,
      body: (
        <>
          <p style={{ fontSize: '16px', color: 'var(--ink)' }}>
            {isBn ? condition.when_bn : condition.when_en}
          </p>
          <div className="row">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn btn-p"
            >
              {t.book}
            </button>
            <a
              className="btn btn-g"
              href={settings.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.wa}
            </a>
          </div>
        </>
      ),
    },
  ];

  const relList = relatedConditions.filter((o) => o.slug !== condition.slug);

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

    // 2. Stacking Sections (.stk) logic matching site.js K.stack([cta, relSec])
    const stackEls = [ctaRef.current, relSecRef.current].filter(
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
  }, [lang, condition.slug]);

  return (
    <>
      <Navbar
        categories={categories}
        serialPhone={settings.phone_serial}
        onBookClick={() => setModalOpen(true)}
      />

      {/* Pinned Showcase in Hero Mode */}
      <PinnedShowcase
        steps={steps}
        mode="hero"
        heroImg={condition.image_url || `/img/conditions/${condition.slug}.webp`}
        crumb={
          <>
            <Link href="/conditions-treatments">{t.all}</Link>
            &nbsp;/&nbsp;
            <Link href={`/conditions-treatments/${category.slug}`}>
              {isBn ? category.name_bn : category.name_en}
            </Link>
          </>
        }
      />

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

      {/* Related Conditions in this Anatomical Area */}
      {relList.length > 0 && (
        <section className="sec" id="relSec" ref={relSecRef}>
          <div className="wrap">
            <p className="eyebrow rv" id="relEb">
              {t.relEb}
            </p>
            <h2 className="h2 rv" id="relH">
              {t.relH}
            </h2>
            <div className="cards" id="rel">
              {relList.map((item) => {
                const itemCat =
                  categories.find((c) => c.slug === item.category_slug) || category;
                const itemName = isBn ? item.name_bn : item.name_en;
                const itemMed = isBn ? item.med_bn : item.med_en;
                return (
                  <Link
                    key={item.slug}
                    className="ccard rv"
                    href={`/conditions-treatments/${item.category_slug}/${item.slug}`}
                  >
                    <img
                      className="cimg"
                      src={item.image_url || `/img/conditions/${item.slug}.webp`}
                      alt=""
                      loading="lazy"
                    />
                    <span className="cat">{isBn ? itemCat.name_bn : itemCat.name_en}</span>
                    <b>{itemName}</b>
                    {itemMed && itemMed !== itemName ? (
                      <span className="med">{itemMed}</span>
                    ) : null}
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
      )}

      <Footer
        settings={settings}
        categories={categories}
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
