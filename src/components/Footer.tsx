'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Category, Chamber, SiteSettings } from '@/types/database';
import { DEFAULT_CATEGORIES } from '@/lib/content/default-data';
import { formatDigits } from '@/lib/format-utils';

interface FooterProps {
  settings: SiteSettings;
  categories?: Category[];
  chambers: Chamber[];
  onBookClick?: () => void;
}

export function Footer({ settings, categories, chambers, onBookClick }: FooterProps) {
  const { lang, isBn } = useLanguage();

  const content = {
    en: {
      brand: 'Dr. Fahim Foysal Kollol',
      qualification: 'MBBS, BCS (Health), FCPS (Surgery), MACS (USA)',
      designation: 'Assistant Professor of Surgery, Mymensingh Medical College Hospital',
      bmdc: 'BMDC Reg. No. A-61041',
      quickLinks: 'Quick Links',
      home: 'Home',
      about: 'About Surgeon',
      treatments: 'Conditions & Treatments',
      gallery: 'Media & Videos',
      blogs: 'Health Blogs',
      contact: 'Chambers & Contact',
      areas: 'Surgical Disciplines',
      chambersTitle: 'Consultation Chambers',
      sherpurBadge: 'Sherpur Highlight',
      contactTitle: 'Direct Appointment & Helpline',
      serial: 'Serial Booking',
      call: 'Doctor Helpline',
      assistant: 'Assistant Serial',
      whatsapp: 'WhatsApp Consultation',
      disclaimer: settings.disclaimer_en,
      credit: 'Engineered & Designed by Benzadid Intelligence',
      creditUrl: 'https://benzadid.com',
    },
    bn: {
      brand: 'ডাঃ ফাহিম ফয়সাল কল্লোল',
      qualification: 'এমবিবিএস, বিসিএস (স্বাস্থ্য), এফসিপিএস (সার্জারি), এমএসিএস (আমেরিকা)',
      designation: 'সহকারী অধ্যাপক (সার্জারি), ময়মনসিংহ মেডিকেল কলেজ হাসপাতাল',
      bmdc: 'বিএমডিসি রেজি: এ-৬১০৪১',
      quickLinks: 'প্রয়োজনীয় লিংক',
      home: 'হোম',
      about: 'সার্জন পরিচিতি',
      treatments: 'রোগ ও চিকিৎসা তালিকা',
      gallery: 'ফটো ও ভিডিও গ্যালারি',
      blogs: 'স্বাস্থ্য ব্লগ',
      contact: 'চেম্বার ও যোগাযোগ',
      areas: 'চিকিৎসার ক্ষেত্রসমূহ',
      chambersTitle: 'চেম্বার ও রোগী দেখার সময়',
      sherpurBadge: 'শেরপুর চেম্বার',
      contactTitle: 'সিরিয়াল ও জরুরি যোগাযোগ',
      serial: 'সিরিয়াল নম্বর',
      call: 'সরাসরি হেল্পলাইন',
      assistant: 'সহকারী মিলন',
      whatsapp: 'WhatsApp কনসালটেশন',
      disclaimer: settings.disclaimer_bn,
      credit: 'বেনজাদিদ ইন্টেলিজেন্স কর্তৃক কারিগরি নির্মিত ও ডিজাইনকৃত',
      creditUrl: 'https://benzadid.com',
    },
  }[lang];

  // Guarantee all 7 core categories are always present in footer
  const categoryMap = new Map<string, Category>();
  DEFAULT_CATEGORIES.forEach((c) => categoryMap.set(c.slug, c));
  if (categories && Array.isArray(categories)) {
    categories.forEach((c) => categoryMap.set(c.slug, c));
  }
  const allFooterCategories = Array.from(categoryMap.values()).sort(
    (a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99)
  );

  return (
    <footer className="relative z-20 bg-gradient-to-b from-[#EEF7F6] via-[#E1F3F2] to-[#D4EEEE] text-[var(--ink)] border-t border-[rgba(43,179,177,0.3)] pt-16 pb-12 overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-r from-[var(--aqua)]/15 via-[var(--teal)]/10 to-transparent blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Main Grid: 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-14">
          {/* Col 1: Surgeon Brand Block (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--aqua)] to-[var(--teal)] grid place-items-center text-white font-extrabold text-lg shadow-md">
                K
              </span>
              <div>
                <h3 className="font-heading font-extrabold text-xl text-[var(--teal)] leading-snug">
                  {content.brand}
                </h3>
                <span className="text-xs font-semibold text-[var(--muted)] block">
                  {content.bmdc}
                </span>
              </div>
            </div>

            <p className="text-sm font-medium text-[var(--ink)] leading-relaxed">
              {content.qualification}
            </p>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {content.designation}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {onBookClick ? (
                <button
                  type="button"
                  onClick={onBookClick}
                  className="btn btn-p text-xs py-2 px-4 shadow-sm cursor-pointer"
                >
                  {isBn ? 'সিরিয়াল নিন' : 'Book a serial'}
                </button>
              ) : (
                <a
                  href={`tel:${settings.phone_serial}`}
                  className="btn btn-p text-xs py-2 px-4 shadow-sm"
                >
                  {isBn ? 'সিরিয়াল নিন' : 'Book a serial'}
                </a>
              )}
              <a
                href={settings.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-g text-xs py-2 px-3.5 shadow-sm"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-heading font-bold text-base text-[var(--teal)] mb-4 border-b border-[var(--aqua)]/30 pb-2 inline-block">
              {content.quickLinks}
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-[var(--ink)] font-medium">
              <li>
                <Link href="/" className="hover:text-[var(--teal)] transition-colors">
                  {content.home}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--teal)] transition-colors">
                  {content.about}
                </Link>
              </li>
              <li>
                <Link href="/conditions-treatments" className="hover:text-[var(--teal)] transition-colors">
                  {content.treatments}
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[var(--teal)] transition-colors">
                  {content.gallery}
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-[var(--teal)] transition-colors">
                  {content.blogs}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--teal)] transition-colors">
                  {content.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories Disciplines (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="font-heading font-bold text-base text-[var(--teal)] mb-4 border-b border-[var(--aqua)]/30 pb-2 inline-block">
              {content.areas}
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-[var(--ink)] font-medium">
              {allFooterCategories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/conditions-treatments/${c.slug}`}
                    className="hover:text-[var(--teal)] transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--aqua)]" />
                    <span>{isBn ? c.name_bn : c.name_en}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Consultation Chambers (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="font-heading font-bold text-base text-[var(--teal)] mb-4 border-b border-[var(--aqua)]/30 pb-2 inline-block">
              {content.chambersTitle}
            </h4>
            <div className="flex flex-col gap-3">
              {chambers.map((ch) => (
                <div
                  key={ch.id}
                  className={`p-3 rounded-xl border backdrop-blur-md transition-all ${
                    ch.is_highlighted
                      ? 'bg-white/90 border-[var(--aqua)] shadow-sm'
                      : 'bg-white/60 border-[rgba(43,179,177,0.2)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--teal)]">
                      {isBn ? ch.schedule_bn : ch.schedule_en}
                    </span>
                    {ch.is_highlighted && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--tint)] text-[var(--teal)] border border-[var(--aqua)]/30">
                        {content.sherpurBadge}
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-xs text-[var(--ink)] leading-snug">
                    {isBn ? ch.name_bn : ch.name_en}
                  </h5>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5 line-clamp-1">
                    {isBn ? ch.timing_bn : ch.timing_en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Medical Disclaimer, Benzadid Intelligence Credit */}
        <div className="border-t border-[rgba(43,179,177,0.25)] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)] font-medium text-center md:text-left">
          <div>
            <p>
              © {isBn ? '২০২৬' : '2026'} {content.brand} · {content.bmdc}
            </p>
            <p className="mt-1 text-[11px] opacity-85">{content.disclaimer}</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={content.creditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--teal)] hover:text-[var(--ink)] font-semibold transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/50 border border-[rgba(43,179,177,0.2)]"
            >
              <span>{content.credit}</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
