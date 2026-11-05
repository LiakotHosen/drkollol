'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Camera,
  Video,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PhoneCall,
  Calendar,
  Layers,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AppointmentModal } from '@/components/AppointmentModal';
import { useLanguage } from '@/context/LanguageContext';
import { parseVideoUrl } from '@/lib/video-utils';
import { formatDigits } from '@/lib/format-utils';
import type {
  GalleryPhoto,
  GalleryVideo,
  GalleryCategory,
  Category,
  Chamber,
  SiteSettings,
} from '@/types/database';

interface GalleryPageClientProps {
  photos: GalleryPhoto[];
  videos: GalleryVideo[];
  categories: Category[];
  settings: SiteSettings;
  chambers: Chamber[];
}

// 4 columns x 2 rows = 8 items per page
const ITEMS_PER_PAGE = 8;

const CATEGORY_NAMES: Record<string, { en: string; bn: string }> = {
  all: { en: 'All Photos', bn: 'সব ছবি' },
  ot: { en: 'Operation Theatre', bn: 'অপারেশন থিয়েটার' },
  chamber: { en: 'Chambers & Clinic', bn: 'চেম্বার ও ক্লিনিক' },
  conference: { en: 'Conferences & Seminars', bn: 'সেমিনার ও সম্মেলন' },
  patient: { en: 'Patient Care & Ward', bn: 'রোগী সেবা ও ওয়ার্ড' },
  camp: { en: 'Health Outreach', bn: 'স্বাস্থ্য ক্যাম্প' },
  general: { en: 'Clinical Practice', bn: 'ক্লিনিক্যাল সেবা' },
};

function toBanglaDigits(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

export function GalleryPageClient({
  photos,
  videos,
  categories,
  settings,
  chambers,
}: GalleryPageClientProps) {
  const { lang, isBn } = useLanguage();
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'videos'>('photos');
  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState<string>('all');
  const [photoPage, setPhotoPage] = useState<number>(1);
  const [videoPage, setVideoPage] = useState<number>(1);

  // Lightbox / Modals
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<GalleryPhoto | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<GalleryVideo | null>(null);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState<boolean>(false);

  const t = {
    en: {
      crumbHome: 'Home',
      crumbGallery: 'Media Gallery',
      giantWord: 'Gallery',
      pageTitle: 'Inside Clinical Practice & Surgical Insights',
      pageSub:
        'Explore authentic photo moments from our modern laparoscopic operating theatres, patient consultation chambers, and educational surgical video guides by Dr. Fahim Foysal Kollol.',
      tabPhotos: 'Photo Gallery',
      tabVideos: 'Video Insights',
      filterAll: 'All Collections',
      photosCount: 'Photos in Collection',
      videosCount: 'Informational Videos',
      viewZoom: 'Click to expand image',
      watchVideo: 'Watch surgery guide',
      pageInfo: 'Page',
      ofPages: 'of',
      prev: 'Previous',
      next: 'Next',
      ctaTitle: 'Ready to Discuss Your Surgical Treatment?',
      ctaSub:
        'Schedule a confidential consultation with Dr. Kollol at Sherpur or Mymensingh chambers.',
      bookSerial: 'Book a Serial',
      callSurgeon: 'Call Helpline',
    },
    bn: {
      crumbHome: 'হোম',
      crumbGallery: 'মিডিয়া গ্যালারি',
      giantWord: 'গ্যালারি',
      pageTitle: 'ছবি ও ভিডিওতে আধুনিক সার্জিক্যাল সেবা',
      pageSub:
        'উন্নত ল্যাপারোস্কপিক অপারেশন থিয়েটার, শেরপুর ও ময়মনসিংহ চেম্বারের পরিবেশ এবং সাধারণ রোগীদের জন্য ডাঃ ফাহিম ফয়সাল কল্লোলের তথ্যবহুল ভিডিও পরামর্শ।',
      tabPhotos: 'ফটো গ্যালারি',
      tabVideos: 'ভিডিও কর্নার',
      filterAll: 'সকল ছবি',
      photosCount: 'টি ছবি সংরক্ষিত',
      videosCount: 'টি ভিডিও গাইড',
      viewZoom: 'বড় করে দেখতে ক্লিক করুন',
      watchVideo: 'ভিডিও দেখতে ক্লিক করুন',
      pageInfo: 'পৃষ্ঠা',
      ofPages: 'এর',
      prev: 'আগের পৃষ্ঠা',
      next: 'পরের পৃষ্ঠা',
      ctaTitle: 'অপারেশন বা চিকিৎসা বিষয়ে পরামর্শ নিতে চান?',
      ctaSub: 'শেরপুর অথবা ময়মনসিংহ চেম্বারে সরাসরি ডাঃ কল্লোলের সিরিয়াল নিতে যোগাযোগ করুন।',
      bookSerial: 'সিরিয়াল নিন',
      callSurgeon: 'সরাসরি কল করুন',
    },
  }[lang];

  // ----------------------------------------------------------------------------------
  // Filtering & Pagination for Photos (4 columns x 2 rows = 8 items)
  // ----------------------------------------------------------------------------------
  const filteredPhotos = useMemo(() => {
    let list = [...photos];
    if (selectedPhotoCategory !== 'all') {
      list = list.filter((p) => p.category === selectedPhotoCategory);
    }
    return list.sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99));
  }, [photos, selectedPhotoCategory]);

  const totalPhotoPages = Math.max(1, Math.ceil(filteredPhotos.length / ITEMS_PER_PAGE));
  const currentPhotoPage = Math.min(photoPage, totalPhotoPages);
  const paginatedPhotos = useMemo(() => {
    const start = (currentPhotoPage - 1) * ITEMS_PER_PAGE;
    return filteredPhotos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPhotos, currentPhotoPage]);

  // ----------------------------------------------------------------------------------
  // Pagination for Videos (4 columns x 2 rows = 8 items)
  // ----------------------------------------------------------------------------------
  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99));
  }, [videos]);

  const totalVideoPages = Math.max(1, Math.ceil(sortedVideos.length / ITEMS_PER_PAGE));
  const currentVideoPage = Math.min(videoPage, totalVideoPages);
  const paginatedVideos = useMemo(() => {
    const start = (currentVideoPage - 1) * ITEMS_PER_PAGE;
    return sortedVideos.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedVideos, currentVideoPage]);

  // Reset page when category changes
  const handlePhotoCategorySelect = (catKey: string) => {
    setSelectedPhotoCategory(catKey);
    setPhotoPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[var(--ink)] flex flex-col selection:bg-[var(--aqua)]/20 selection:text-[var(--ink)]">
      {/* Navigation Header */}
      <Navbar
        categories={categories}
        serialPhone={settings.phone_serial}
        onBookClick={() => setAppointmentModalOpen(true)}
      />

      <main className="flex-1 pt-24 pb-20">
        {/* Hero Header Stage with Giant Gradient Word */}
        <section className="relative overflow-hidden pt-8 pb-12 sm:pb-16 bg-gradient-to-b from-[#EEF7F6]/60 via-white to-white border-b border-[var(--aqua)]/15">
          {/* Ambient Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[var(--aqua)]/15 to-transparent blur-3xl rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Breadcrumb */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[var(--aqua)]/30 text-xs font-semibold text-[var(--teal)] mb-6 shadow-xs backdrop-blur-xs">
              <Link href="/" className="hover:underline text-[var(--muted)]">
                {t.crumbHome}
              </Link>
              <span>/</span>
              <span className="text-[var(--teal)] font-bold">{t.crumbGallery}</span>
            </div>

            {/* Giant Gradient Title Word */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 font-serif">
              <span className="bg-gradient-to-r from-[var(--teal)] via-[#159391] to-[var(--aqua)] bg-clip-text text-transparent">
                {t.giantWord}
              </span>
            </h1>

            {/* Editorial Heading */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--ink)] max-w-3xl mx-auto leading-tight font-serif mb-4">
              {t.pageTitle}
            </h2>

            <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
              {t.pageSub}
            </p>

            {/* Media Mode Selector (Photos vs Videos) */}
            <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-white border border-[var(--aqua)]/25 shadow-md">
              <button
                type="button"
                onClick={() => setActiveMediaTab('photos')}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeMediaTab === 'photos'
                    ? 'bg-gradient-to-r from-[var(--teal)] to-[var(--aqua)] text-white shadow-md'
                    : 'text-[var(--ink)] hover:text-[var(--teal)]'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>
                  {t.tabPhotos} ({isBn ? toBanglaDigits(photos.length) : photos.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMediaTab('videos')}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeMediaTab === 'videos'
                    ? 'bg-gradient-to-r from-[var(--teal)] to-[var(--aqua)] text-white shadow-md'
                    : 'text-[var(--ink)] hover:text-[var(--teal)]'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>
                  {t.tabVideos} ({isBn ? toBanglaDigits(videos.length) : videos.length})
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------------------------- */}
        {/* SECTION 1: PHOTO GALLERY */}
        {/* ---------------------------------------------------------------------------------- */}
        {activeMediaTab === 'photos' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            {/* Category Filter Pills */}
            <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
              {['all', 'ot', 'chamber', 'conference', 'patient', 'camp'].map((catKey) => {
                const isSelected = selectedPhotoCategory === catKey;
                const catLabel =
                  CATEGORY_NAMES[catKey]?.[lang] || CATEGORY_NAMES[catKey]?.en || catKey;
                const count =
                  catKey === 'all'
                    ? photos.length
                    : photos.filter((p) => p.category === catKey).length;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => handlePhotoCategorySelect(catKey)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      isSelected
                        ? 'bg-[var(--teal)] text-white shadow-sm'
                        : 'bg-[#EEF7F6] text-[var(--muted)] hover:bg-[#E1F3F2] border border-[var(--aqua)]/15'
                    }`}
                  >
                    {catLabel} ({isBn ? toBanglaDigits(count) : count})
                  </button>
                );
              })}
            </div>

            {/* 4-Columns x 2-Rows Grid (Strictly 8 items per page on desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
              {paginatedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setActiveLightboxPhoto(photo)}
                  className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-[var(--aqua)]/25 p-3 shadow-sm hover:shadow-xl hover:border-[var(--aqua)]/60 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
                >
                  {/* Photo Visual */}
                  <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-gradient-to-br from-[#EEF7F6] to-white mb-3">
                    <Image
                      src={photo.image_url}
                      alt={isBn ? photo.title_bn : photo.title_en}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                    />

                    {/* Gradient Overlay & Hover Cue */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="text-[11px] text-white font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--aqua)]" />
                        {t.viewZoom}
                      </span>
                    </div>

                    {/* Category Chip */}
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-white/90 text-[var(--teal)] backdrop-blur-xs border border-[var(--aqua)]/20 shadow-xs">
                      {CATEGORY_NAMES[photo.category]?.[lang] || photo.category}
                    </span>
                  </div>

                  {/* Title & Caption */}
                  <div className="px-1 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[var(--ink)] group-hover:text-[var(--teal)] transition-colors line-clamp-1 font-serif">
                        {isBn ? photo.title_bn : photo.title_en}
                      </h3>
                      {(isBn ? photo.caption_bn : photo.caption_en) && (
                        <p className="text-xs text-[var(--muted)] line-clamp-2 mt-1 leading-relaxed">
                          {isBn ? photo.caption_bn : photo.caption_en}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls for Photos */}
            {totalPhotoPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--aqua)]/20">
                <div className="text-xs text-[var(--muted)] font-medium">
                  {t.pageInfo}{' '}
                  <b className="text-[var(--ink)]">
                    {isBn ? toBanglaDigits(currentPhotoPage) : currentPhotoPage}
                  </b>{' '}
                  {t.ofPages}{' '}
                  <b className="text-[var(--ink)]">
                    {isBn ? toBanglaDigits(totalPhotoPages) : totalPhotoPages}
                  </b>{' '}
                  ({isBn ? toBanglaDigits(filteredPhotos.length) : filteredPhotos.length}{' '}
                  {t.photosCount})
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPhotoPage <= 1}
                    onClick={() => setPhotoPage((p) => Math.max(1, p - 1))}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[var(--aqua)]/30 text-[var(--ink)] hover:bg-[#EEF7F6] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{t.prev}</span>
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPhotoPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = pageNum === currentPhotoPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setPhotoPage(pageNum)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-[var(--teal)] text-white shadow-xs'
                              : 'text-[var(--muted)] hover:bg-[#EEF7F6]'
                          }`}
                        >
                          {isBn ? toBanglaDigits(pageNum) : pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={currentPhotoPage >= totalPhotoPages}
                    onClick={() => setPhotoPage((p) => Math.min(totalPhotoPages, p + 1))}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[var(--aqua)]/30 text-[var(--ink)] hover:bg-[#EEF7F6] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <span>{t.next}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ---------------------------------------------------------------------------------- */}
        {/* SECTION 2: VIDEO INSIGHTS */}
        {/* ---------------------------------------------------------------------------------- */}
        {activeMediaTab === 'videos' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            {sortedVideos.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white/70 backdrop-blur-sm rounded-3xl border border-dashed border-[var(--aqua)]/30 max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-[var(--aqua)]/15 text-[var(--teal)] flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[var(--ink)] mb-2 font-serif">
                  {isBn ? 'কোনো ভিডিও এখনও যুক্ত করা হয়নি' : 'No Videos Published Yet'}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  {isBn
                    ? 'অ্যাডমিন প্যানেল থেকে ভিডিও যুক্ত করা হলে তা এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।'
                    : 'Videos added from the admin dashboard will automatically appear here.'}
                </p>
              </div>
            ) : (
            /* 4-Columns x 2-Rows Grid (Strictly 8 items per page on desktop) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
              {paginatedVideos.map((video) => {
                const parsed = parseVideoUrl(video.video_url);
                const thumb = video.thumbnail_url || parsed.thumbnailUrl || '/img/doctor-cta-v3.webp';

                return (
                  <div
                    key={video.id}
                    onClick={() => setActiveVideoModal(video)}
                    className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-[var(--aqua)]/25 p-3 shadow-sm hover:shadow-xl hover:border-[var(--aqua)]/60 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
                  >
                    {/* Video Thumbnail Visual with Glowing Play Button */}
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 mb-3">
                      <Image
                        src={thumb}
                        alt={isBn ? video.title_bn : video.title_en}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-90"
                      />

                      {/* Video Player Center Indicator */}
                      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors grid place-items-center">
                        <span className="w-12 h-12 rounded-full bg-white/95 text-[var(--teal)] grid place-items-center shadow-lg group-hover:scale-115 transition-transform duration-300">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </span>
                      </div>

                      {/* Platform Tag */}
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#062F31]/80 text-white backdrop-blur-xs uppercase border border-white/10 shadow-xs">
                        {video.video_type}
                      </span>

                      {/* Category Tag */}
                      {video.category && (
                        <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/90 text-[var(--ink)]">
                          {video.category}
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="px-1 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-[var(--ink)] group-hover:text-[var(--teal)] transition-colors line-clamp-2 font-serif leading-snug">
                          {isBn ? video.title_bn : video.title_en}
                        </h3>
                        {(isBn ? video.description_bn : video.description_en) && (
                          <p className="text-xs text-[var(--muted)] line-clamp-2 mt-1 leading-relaxed">
                            {isBn ? video.description_bn : video.description_en}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-[var(--teal)] font-semibold">
                        <span>{t.watchVideo}</span>
                        <Play className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            {/* Pagination Controls for Videos */}
            {totalVideoPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--aqua)]/20">
                <div className="text-xs text-[var(--muted)] font-medium">
                  {t.pageInfo}{' '}
                  <b className="text-[var(--ink)]">
                    {isBn ? toBanglaDigits(currentVideoPage) : currentVideoPage}
                  </b>{' '}
                  {t.ofPages}{' '}
                  <b className="text-[var(--ink)]">
                    {isBn ? toBanglaDigits(totalVideoPages) : totalVideoPages}
                  </b>{' '}
                  ({isBn ? toBanglaDigits(sortedVideos.length) : sortedVideos.length}{' '}
                  {t.videosCount})
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentVideoPage <= 1}
                    onClick={() => setVideoPage((p) => Math.max(1, p - 1))}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[var(--aqua)]/30 text-[var(--ink)] hover:bg-[#EEF7F6] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{t.prev}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalVideoPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = pageNum === currentVideoPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setVideoPage(pageNum)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-[var(--teal)] text-white shadow-xs'
                              : 'text-[var(--muted)] hover:bg-[#EEF7F6]'
                          }`}
                        >
                          {isBn ? toBanglaDigits(pageNum) : pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={currentVideoPage >= totalVideoPages}
                    onClick={() => setVideoPage((p) => Math.min(totalVideoPages, p + 1))}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[var(--aqua)]/30 text-[var(--ink)] hover:bg-[#EEF7F6] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <span>{t.next}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ---------------------------------------------------------------------------------- */}
        {/* LIGHTBOX MODAL FOR PHOTOS */}
        {/* ---------------------------------------------------------------------------------- */}
        {activeLightboxPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setActiveLightboxPhoto(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveLightboxPhoto(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 text-white grid place-items-center hover:bg-black/70 transition-colors backdrop-blur-xs"
              >
                <X className="w-5 h-5" />
              </button>

              {/* High-res Image Preview */}
              <div className="relative aspect-16/10 w-full bg-slate-950">
                <Image
                  src={activeLightboxPhoto.image_url}
                  alt={isBn ? activeLightboxPhoto.title_bn : activeLightboxPhoto.title_en}
                  fill
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-contain"
                />

              </div>

              {/* Caption & Context Bar */}
              <div className="p-6 sm:p-7 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#EEF7F6] text-[var(--teal)] border border-[var(--aqua)]/30">
                    {CATEGORY_NAMES[activeLightboxPhoto.category]?.[lang] ||
                      activeLightboxPhoto.category}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-[var(--ink)] leading-snug">
                  {isBn ? activeLightboxPhoto.title_bn : activeLightboxPhoto.title_en}
                </h3>
                {(isBn ? activeLightboxPhoto.caption_bn : activeLightboxPhoto.caption_en) && (
                  <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed max-w-3xl">
                    {isBn ? activeLightboxPhoto.caption_bn : activeLightboxPhoto.caption_en}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------------------- */}
        {/* VIDEO EMBED PLAYER MODAL */}
        {/* ---------------------------------------------------------------------------------- */}
        {activeVideoModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setActiveVideoModal(null)}
          >
            <div
              className="bg-black rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white grid place-items-center hover:bg-black/80 transition-colors backdrop-blur-xs"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Video Iframe Container */}
              <div className="aspect-video w-full bg-black flex items-center justify-center">
                {(() => {
                  const parsed = parseVideoUrl(activeVideoModal.video_url);
                  if (!parsed.isValid || !parsed.embedUrl) {
                    return (
                      <div className="w-full h-full flex items-center justify-center text-white/70 p-6 text-center">
                        <p className="text-sm">Video cannot be embedded or URL is invalid.</p>
                      </div>
                    );
                  }
                  const embedWithAutoplay = parsed.embedUrl.includes('?')
                    ? `${parsed.embedUrl}&autoplay=1`
                    : `${parsed.embedUrl}?autoplay=1`;
                  return (
                    <iframe
                      src={embedWithAutoplay}
                      title={isBn ? activeVideoModal.title_bn : activeVideoModal.title_en}
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                    />
                  );
                })()}
              </div>

              {/* Video Title Details */}
              <div className="p-5 sm:p-6 bg-[#062F31] text-white">
                <span className="text-[10px] uppercase font-bold text-[var(--aqua)] tracking-wider block mb-1">
                  {activeVideoModal.video_type} · {activeVideoModal.category || 'Surgery Guide'}
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-serif leading-snug">
                  {isBn ? activeVideoModal.title_bn : activeVideoModal.title_en}
                </h3>
                {(isBn ? activeVideoModal.description_bn : activeVideoModal.description_en) && (
                  <p className="text-xs sm:text-sm text-white/80 mt-1.5 leading-relaxed">
                    {isBn ? activeVideoModal.description_bn : activeVideoModal.description_en}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------------------- */}
        {/* BOTTOM CONVERSION CTA BANNER */}
        {/* ---------------------------------------------------------------------------------- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 bg-gradient-to-br from-[#0B6E73] to-[#062F31] text-white shadow-2xl">
            {/* Ambient Aqua Backlight */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--aqua)]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl text-center lg:text-left">
                <h3 className="text-2xl sm:text-3xl font-extrabold font-serif mb-2 leading-tight">
                  {t.ctaTitle}
                </h3>
                <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                  {t.ctaSub}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setAppointmentModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[var(--aqua)] to-white text-[var(--ink)] font-extrabold text-sm shadow-xl hover:scale-105 transition-all"
                >
                  <Calendar className="w-4 h-4 text-[var(--teal)]" />
                  <span>{t.bookSerial}</span>
                </button>

                <a
                  href={`tel:${settings.phone_serial}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-xs transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{t.callSurgeon}: {formatDigits(settings.phone_serial, isBn)}</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer settings={settings} categories={categories} chambers={chambers} onBookClick={() => setAppointmentModalOpen(true)} />

      {/* Appointment Modal */}
      {appointmentModalOpen && (
        <AppointmentModal
          isOpen={appointmentModalOpen}
          onClose={() => setAppointmentModalOpen(false)}
          chambers={chambers}
          whatsappUrl={settings.whatsapp_url}
        />
      )}
    </div>
  );
}

