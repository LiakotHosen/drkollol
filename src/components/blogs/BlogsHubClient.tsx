'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileStickyBar } from '@/components/MobileStickyBar';
import { AppointmentModal } from '@/components/AppointmentModal';
import { useLanguage } from '@/context/LanguageContext';
import { BlogPost, Category, Chamber, SiteSettings } from '@/types/database';

interface BlogsHubClientProps {
  blogs: BlogPost[];
  categories: Category[];
  settings: SiteSettings;
  chambers: Chamber[];
}

export function BlogsHubClient({
  blogs,
  categories,
  settings,
  chambers,
}: BlogsHubClientProps) {
  const { lang, isBn } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const t = {
    en: {
      eyebrow: 'Patient Education & Advice',
      heading: 'Health & Surgery Blog Library',
      lead: 'Comprehensive, easy-to-understand surgical guides and articles reviewed by Dr. Fahim Foysal Kollol.',
      allCat: 'All Categories',
      searchPlaceholder: 'Search articles by disease or symptoms...',
      readMore: 'Read Complete Guide →',
      noResults: 'No articles found matching your search.',
    },
    bn: {
      eyebrow: 'রোগীদের জন্য স্বাস্থ্য তথ্য',
      heading: 'স্বাস্থ্য ও সার্জারি ব্লগ লাইব্রেরি',
      lead: 'সহজ বাংলায় নির্ভরযোগ্য চিকিৎসাতথ্য, বিভিন্ন রোগের কারণ ও আধুনিক অপারেশন নিয়ে ডাঃ কল্লোলের পরামর্শ।',
      allCat: 'সব বিভাগ',
      searchPlaceholder: 'রোগের নাম বা লক্ষণ দিয়ে খুঁজুন...',
      readMore: 'সম্পূর্ণ পড়ুন →',
      noResults: 'আপনার অনুসন্ধানের সাথে মিল রেখে কোনো লেখা পাওয়া যায়নি।',
    },
  }[lang];

  const filteredBlogs = blogs.filter((b) => {
    const matchesCat = selectedCat === 'all' || b.category_slug === selectedCat;
    const title = (isBn ? b.title_bn : b.title_en).toLowerCase();
    const excerpt = (isBn ? b.excerpt_bn : b.excerpt_en).toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = title.includes(query) || excerpt.includes(query);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="relative min-h-screen bg-white">
      <Navbar
        categories={categories}
        serialPhone={settings.phone_serial}
        onBookClick={() => setModalOpen(true)}
      />

      {/* Header */}
      <section className="pt-36 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--tint)] to-white border-b border-[rgba(43,179,177,0.2)]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--aqua)] block">
            {t.eyebrow}
          </span>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-[var(--teal)] leading-tight tracking-tight mt-1">
            {t.heading}
          </h1>
          <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto mt-2 leading-relaxed">
            {t.lead}
          </p>

          {/* Search Input */}
          <div className="max-w-md mx-auto mt-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full px-4 py-3 rounded-full border border-[rgba(43,179,177,0.35)] bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal)]"
            />
          </div>
        </div>
      </section>

      {/* Categories Filter Tabs */}
      <div className="sticky top-20 z-30 py-3 bg-white/90 backdrop-blur-md border-b border-[rgba(43,179,177,0.2)]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCat('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              selectedCat === 'all'
                ? 'bg-[var(--teal)] text-white'
                : 'bg-white text-[var(--teal)] border border-[rgba(43,179,177,0.3)] hover:bg-[var(--tint)]'
            }`}
          >
            {t.allCat}
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setSelectedCat(c.slug)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
                selectedCat === c.slug
                  ? 'bg-[var(--teal)] text-white'
                  : 'bg-white text-[var(--teal)] border border-[rgba(43,179,177,0.3)] hover:bg-[var(--tint)]'
              }`}
            >
              {isBn ? c.name_bn : c.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Blogs Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white min-h-[50vh]">
        <div className="max-w-7xl mx-auto">
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-20 text-[var(--muted)] text-sm">
              {t.noResults}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((b) => {
                const cat = categories.find((c) => c.slug === b.category_slug);
                return (
                  <Link
                    key={b.slug}
                    href={`/blogs/${b.slug}`}
                    className="group rounded-3xl overflow-hidden bg-white border border-[rgba(43,179,177,0.25)] shadow-[0_16px_36px_-24px_rgba(6,47,49,0.3)] hover:shadow-xl hover:border-[var(--teal)] transition-all duration-300 flex flex-col justify-between"
                  >
                    {b.cover_image && (
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 border-b border-[rgba(43,179,177,0.15)]">
                        <Image
                          src={b.cover_image}
                          alt={isBn ? b.title_bn : b.title_en}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      </div>
                    )}
                    <div className="p-6 pb-2">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--teal)] bg-[var(--tint)] px-3 py-1 rounded-full border border-[rgba(43,179,177,0.25)]">
                          {isBn ? cat?.name_bn : cat?.name_en}
                        </span>
                        <span className="text-xs font-semibold text-[var(--muted)]">
                          {isBn ? b.reading_time_bn : b.reading_time_en}
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-xl text-[var(--ink)] group-hover:text-[var(--teal)] transition-colors leading-snug">
                        {isBn ? b.title_bn : b.title_en}
                      </h3>

                      <p className="text-xs sm:text-sm text-[var(--muted)] mt-2.5 leading-relaxed line-clamp-3">
                        {isBn ? b.excerpt_bn : b.excerpt_en}
                      </p>
                    </div>

                    <div className="p-6 pt-3 border-t border-[rgba(43,179,177,0.15)] flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--teal)] group-hover:underline">
                        {t.readMore}
                      </span>
                      <span className="text-[var(--aqua)] group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

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
    </div>
  );
}
