'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Play,
  Pause,
  ArrowRight,
  X,
  Video,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { parseVideoUrl } from '@/lib/video-utils';
import type { GalleryVideo } from '@/types/database';

interface VideosSectionProps {
  videos?: GalleryVideo[];
}

const VIDEO_CATEGORY_NAMES: Record<string, { en: string; bn: string }> = {
  colorectal: { en: 'Colorectal Surgery', bn: 'কলোরেক্টাল সার্জারি' },
  laparoscopy: { en: 'Keyhole Laparoscopy', bn: 'ল্যাপারোস্কপিক সার্জারি' },
  breast: { en: 'Breast Clinic', bn: 'ব্রেস্ট ক্লিনিক ও টিউমার' },
  general: { en: 'Clinical Guidance', bn: 'ক্লিনিক্যাল গাইড' },
};

function toBanglaDigits(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

export function VideosSection({ videos = [] }: VideosSectionProps) {
  const { lang, isBn } = useLanguage();

  // Ensure we have a valid, sorted list of dynamic videos from database only
  const baseVideos: GalleryVideo[] = useMemo(() => {
    const list = (videos || []).filter((v) => Boolean(v && v.video_url));
    return [...list].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99));
  }, [videos]);

  // Triple duplicated list for seamless, infinite looping
  const infiniteVideos = useMemo(() => {
    return [...baseVideos, ...baseVideos, ...baseVideos];
  }, [baseVideos]);

  // Slider state
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartScrollLeft, setDragStartScrollLeft] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeVideoIdx, setActiveVideoIdx] = useState<number>(0);

  // Video Modal Player state
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);

  const t = {
    en: {
      vdEb: 'Videos & Insights',
      vdH: 'Watch & Understand Surgical Care',
      vdLead:
        'Short educational videos where Dr. Kollol explains common abdominal problems, piles recovery, and keyhole surgery.',
      viewAll: 'Watch All Video Guides',
      pause: 'Pause auto-slide',
      resume: 'Resume auto-slide',
      autoPlaying: 'Auto-slide Active',
      paused: 'Auto-slide Paused',
      prevVideo: 'Previous Video',
      nextVideo: 'Next Video',
      videoOf: 'Video',
      ofTotal: 'of',
      swipeHint: 'Swipe or drag to explore videos',
      watchVideo: 'Click to watch video',
      close: 'Close Player',
    },
    bn: {
      vdEb: 'ভিডিও গাইড',
      vdH: 'ভিডিওতে জানুন জটিল রোগের সহজ ব্যাখ্যা',
      vdLead:
        'পাইলস, ফিস্টুলা, পিত্তথলির পাথর ও ল্যাপারোস্কপিক অপারেশন নিয়ে ডাঃ কল্লোলের গুরুত্বপূর্ণ পরামর্শমূলক ভিডিও।',
      viewAll: 'সব ভিডিও গ্যালারিতে দেখুন',
      pause: 'অটো-স্লাইড থামান',
      resume: 'অটো-স্লাইড চালু করুন',
      autoPlaying: 'অটো-স্লাইড চালু',
      paused: 'অটো-স্লাইড স্থগিত',
      prevVideo: 'পূর্ববর্তী ভিডিও',
      nextVideo: 'পরবর্তী ভিডিও',
      videoOf: 'ভিডিও নং',
      ofTotal: 'এর',
      swipeHint: 'ডানে-বামে টেনে বা সোয়াইপ করে ভিডিও দেখুন',
      watchVideo: 'ভিডিও প্লে করুন',
      close: 'প্লেয়ার বন্ধ করুন',
    },
  }[lang];

  // Helper to get card width + gap
  const getCardStep = useCallback(() => {
    if (!sliderRef.current) return 400;
    const firstCard = sliderRef.current.querySelector<HTMLElement>('[data-video-card]');
    if (!firstCard) return 400;
    const computedGap = 20; // 20px gap-5
    return firstCard.offsetWidth + computedGap;
  }, []);

  // Update progress & active index on scroll
  const handleScroll = useCallback(() => {
    const el = sliderRef.current;
    if (!el || baseVideos.length === 0) return;

    const step = getCardStep();
    const singleSetWidth = baseVideos.length * step;

    // Infinite loop boundaries reset seamlessly
    if (el.scrollLeft >= singleSetWidth * 2) {
      el.style.scrollBehavior = 'auto';
      el.scrollLeft -= singleSetWidth;
      el.style.scrollBehavior = 'smooth';
    } else if (el.scrollLeft <= singleSetWidth * 0.1) {
      el.style.scrollBehavior = 'auto';
      el.scrollLeft += singleSetWidth;
      el.style.scrollBehavior = 'smooth';
    }

    // Normalized progress in the current cycle (0 to 100%)
    const normalizedScroll = (el.scrollLeft % singleSetWidth + singleSetWidth) % singleSetWidth;
    const progressPercent = Math.min(100, Math.max(0, (normalizedScroll / singleSetWidth) * 100));
    setScrollProgress(progressPercent);

    // Active video index relative to baseVideos
    const currentIdx = Math.floor((normalizedScroll + step * 0.4) / step) % baseVideos.length;
    setActiveVideoIdx(currentIdx);
  }, [baseVideos.length, getCardStep]);

  // Initial scroll to middle set on mount for smooth two-way sliding
  useEffect(() => {
    const el = sliderRef.current;
    if (!el || baseVideos.length === 0) return;

    const step = getCardStep();
    const singleSetWidth = baseVideos.length * step;
    el.style.scrollBehavior = 'auto';
    el.scrollLeft = singleSetWidth;
    el.style.scrollBehavior = 'smooth';
    handleScroll();
  }, [baseVideos.length, getCardStep, handleScroll]);

  // Auto-play ticker: advances smoothly from right to left every 3.8 seconds
  useEffect(() => {
    if (!isPlaying || isHovered || isDragging || activeVideoIndex !== null) return;

    const interval = setInterval(() => {
      const el = sliderRef.current;
      if (!el) return;
      const step = getCardStep();
      el.scrollBy({ left: step, behavior: 'smooth' });
    }, 3800);

    return () => clearInterval(interval);
  }, [isPlaying, isHovered, isDragging, activeVideoIndex, getCardStep]);

  // Manual Prev / Next Arrow Navigation
  const handleNav = (direction: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    const step = getCardStep();
    const delta = direction === 'left' ? -step : step;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  // Scrubber / Progress Bar click or drag
  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const el = sliderRef.current;
    if (!track || !el || baseVideos.length === 0) return;

    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));

    const step = getCardStep();
    const singleSetWidth = baseVideos.length * step;
    el.style.scrollBehavior = 'smooth';
    el.scrollLeft = singleSetWidth + ratio * singleSetWidth;
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = sliderRef.current;
    if (!el) return;
    setIsDragging(true);
    setDragStartX(e.pageX - el.offsetLeft);
    setDragStartScrollLeft(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const el = sliderRef.current;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartX) * 1.3;
    el.scrollLeft = dragStartScrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // Keyboard navigation for Video Modal
  useEffect(() => {
    if (activeVideoIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveVideoIndex(null);
      } else if (e.key === 'ArrowRight') {
        setActiveVideoIndex((prev) =>
          prev !== null ? (prev + 1) % baseVideos.length : 0
        );
      } else if (e.key === 'ArrowLeft') {
        setActiveVideoIndex((prev) =>
          prev !== null ? (prev - 1 + baseVideos.length) % baseVideos.length : 0
        );
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeVideoIndex, baseVideos.length]);

  const activeVideo = activeVideoIndex !== null ? baseVideos[activeVideoIndex] : null;

  // Fully dynamic: if no videos are configured from the admin panel, do not render the section
  if (baseVideos.length === 0) {
    return null;
  }

  return (
    <section
      className="hx tint relative overflow-hidden py-16 sm:py-24 bg-[#EEF7F6]/60"
      id="videos"
      aria-label="Medical Explanation Videos"
    >
      {/* 1. Header Section */}
      <div className="wrap text-center">
        <p className="eb flex items-center justify-center gap-2">
          <Video className="w-4 h-4 text-[var(--teal)] inline" />
          {t.vdEb}
        </p>
        <h2>{t.vdH}</h2>
        <p className="lead">{t.vdLead}</p>
      </div>

      {/* 2. Full-Screen Bleed Carousel Container */}
      <div
        className="w-full relative mt-8 sm:mt-12 overflow-hidden select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleMouseUpOrLeave();
        }}
      >
        {/* Soft edge fade masks on laptop screens */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 sm:w-24 md:w-36 z-20 bg-gradient-to-r from-[#EEF7F6] via-[#EEF7F6]/80 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:w-24 md:w-36 z-20 bg-gradient-to-l from-[#EEF7F6] via-[#EEF7F6]/80 to-transparent" />

        {/* Scrollable track with video cards */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
          className={`flex gap-4 sm:gap-5 px-4 sm:px-12 md:px-24 overflow-x-auto scroll-smooth scrollbar-none py-4 cursor-${
            isDragging ? 'grabbing' : 'grab'
          }`}
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {infiniteVideos.map((item, idx) => {
            const originalIndex = idx % baseVideos.length;
            const parsed = parseVideoUrl(item.video_url);
            const thumb = item.thumbnail_url || parsed.thumbnailUrl || '/img/doctor-cta-v3.webp';
            const catKey = (item.category || '').toLowerCase();
            const categoryObj = VIDEO_CATEGORY_NAMES[catKey] || {
              en: item.category || 'Clinical Guidance',
              bn: item.category || 'ক্লিনিক্যাল গাইড',
            };
            const categoryLabel = isBn ? categoryObj.bn : categoryObj.en;
            const title = isBn ? item.title_bn : item.title_en;
            const description = isBn ? item.description_bn : item.description_en;

            return (
              <div
                key={`${item.id}-${idx}`}
                data-video-card
                onClick={() => {
                  if (!isDragging) {
                    setActiveVideoIndex(originalIndex);
                  }
                }}
                className="group relative shrink-0 w-[290px] sm:w-[360px] md:w-[410px] lg:w-[440px] aspect-[16/11] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer bg-white border border-[var(--aqua)]/25 hover:border-[var(--aqua)]/80 shadow-[0_8px_24px_rgba(11,110,115,0.06)] hover:shadow-[0_16px_36px_rgba(11,110,115,0.18)] transition-all duration-300 hover:-translate-y-1"
              >
                {/* Video Thumbnail Image */}
                <Image
                  src={thumb}
                  alt={title}
                  fill
                  sizes="(max-width: 640px) 290px, (max-width: 1024px) 380px, 440px"
                  className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  draggable={false}
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />

                {/* Top Category Badge & Order Chip */}
                <div className="absolute top-3 inset-x-3.5 z-10 flex items-center justify-between pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/90 backdrop-blur-md text-[var(--teal)] border border-[var(--aqua)]/30 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    {categoryLabel}
                  </span>

                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[var(--ink)]/70 text-white/95 backdrop-blur-xs">
                    #{isBn ? toBanglaDigits(originalIndex + 1) : String(originalIndex + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Center Video Play Button */}
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/95 group-hover:bg-white text-[var(--teal)] group-hover:text-red-600 grid place-items-center shadow-xl group-hover:scale-110 transition-all duration-300 backdrop-blur-xs border border-white/40">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Bottom Card Title & Description */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-[var(--ink)]/95 via-[var(--ink)]/40 to-transparent flex flex-col justify-end p-4 sm:p-5 text-left transition-all duration-300">
                  <h3 className="text-white text-sm sm:text-base font-semibold line-clamp-2 leading-snug drop-shadow-sm font-serif">
                    {title}
                  </h3>

                  {description && (
                    <p className="text-white/75 text-xs line-clamp-1 mt-1 font-sans">
                      {description}
                    </p>
                  )}

                  {/* Hover action indicator */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-[var(--aqua)] font-semibold opacity-90 group-hover:opacity-100 transition-opacity">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-xs border border-white/15">
                      <Sparkles className="w-3 h-3 text-[var(--aqua)]" />
                      {t.watchVideo}
                    </span>
                    <span className="text-white/70 group-hover:text-white transition-colors text-[10px] uppercase font-mono tracking-wider">
                      {item.video_type || 'HD'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Pro Level Controls & Scrubber Bar */}
      <div className="wrap mt-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          {/* Top Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            {/* Play/Pause & Live Status */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white text-[var(--ink)] border border-[var(--aqua)]/30 shadow-xs hover:shadow-md transition-all font-semibold active:scale-95"
                title={isPlaying ? t.pause : t.resume}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-[var(--teal)] fill-[var(--teal)]" />
                    <span>{t.pause}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-[var(--teal)] fill-[var(--teal)] ml-0.5" />
                    <span>{t.resume}</span>
                  </>
                )}
              </button>

              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[var(--muted)] font-medium">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPlaying ? 'bg-red-500 animate-ping' : 'bg-amber-400'
                  }`}
                />
                {isPlaying ? t.autoPlaying : t.paused}
              </span>
            </div>

            {/* Video Counter & Navigation Arrows */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-white/70 border border-[var(--aqua)]/20 text-[var(--ink)] font-mono text-xs font-bold shadow-xs">
                <span>{t.videoOf} </span>
                <span className="text-[var(--teal)]">
                  {isBn ? toBanglaDigits(activeVideoIdx + 1) : String(activeVideoIdx + 1).padStart(2, '0')}
                </span>
                <span className="text-gray-400"> / </span>
                <span>
                  {isBn ? toBanglaDigits(baseVideos.length) : String(baseVideos.length).padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleNav('left')}
                  className="w-9 h-9 rounded-xl bg-white/90 hover:bg-white text-[var(--teal)] border border-[var(--aqua)]/30 grid place-items-center shadow-xs hover:shadow-md transition-all active:scale-90"
                  aria-label={t.prevVideo}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('right')}
                  className="w-9 h-9 rounded-xl bg-white/90 hover:bg-white text-[var(--teal)] border border-[var(--aqua)]/30 grid place-items-center shadow-xs hover:shadow-md transition-all active:scale-90"
                  aria-label={t.nextVideo}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Scrub Track */}
          <div
            ref={trackRef}
            onClick={handleScrubberClick}
            className="w-full h-2 sm:h-2.5 rounded-full bg-[var(--aqua)]/15 hover:bg-[var(--aqua)]/25 relative cursor-pointer overflow-hidden transition-colors shadow-inner"
            title="Click or drag to scrub video playlist"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--teal)] via-[var(--aqua)] to-[var(--teal)] transition-[width] duration-200"
              style={{ width: `${Math.max(8, scrollProgress)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--muted)] px-1">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-[var(--teal)]" />
              {t.swipeHint}
            </span>
            <span>
              {isBn
                ? `মোট ${toBanglaDigits(baseVideos.length)}টি ভিডিও নির্দেশিকা`
                : `${baseVideos.length} Video Guides`}
            </span>
          </div>
        </div>

        {/* View All Button */}
        <div className="mt-10 sm:mt-12 text-center">
          <Link
            href="/gallery?tab=videos"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[var(--teal)] to-[var(--aqua)] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-xl hover:scale-105 transition-all"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 4. Fullscreen Video Player Modal */}
      {activeVideo && activeVideoIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveVideoIndex(null)}
        >
          {/* Modal Container */}
          <div
            className="bg-black rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative border border-white/20 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setActiveVideoIndex(null)}
              className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white grid place-items-center transition-colors backdrop-blur-xs border border-white/20"
              aria-label={t.close}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Video Iframe Area */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {(() => {
                const parsed = parseVideoUrl(activeVideo.video_url);
                if (!parsed.isValid || !parsed.embedUrl) {
                  return (
                    <div className="w-full h-full flex items-center justify-center text-white/70 p-6 text-center">
                      <p className="text-sm">Video cannot be embedded or link is invalid.</p>
                    </div>
                  );
                }
                const embedWithAutoplay = parsed.embedUrl.includes('?')
                  ? `${parsed.embedUrl}&autoplay=1`
                  : `${parsed.embedUrl}?autoplay=1`;
                return (
                  <iframe
                    src={embedWithAutoplay}
                    title={isBn ? activeVideo.title_bn : activeVideo.title_en}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                  />
                );
              })()}

              {/* Prev Button inside Modal */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveVideoIndex(
                    (activeVideoIndex - 1 + baseVideos.length) % baseVideos.length
                  );
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 text-white grid place-items-center transition-all backdrop-blur-xs border border-white/20 active:scale-90"
                aria-label={t.prevVideo}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Button inside Modal */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveVideoIndex((activeVideoIndex + 1) % baseVideos.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 text-white grid place-items-center transition-all backdrop-blur-xs border border-white/20 active:scale-90"
                aria-label={t.nextVideo}
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Floating Counter */}
              <div className="absolute bottom-3 left-4 z-20 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-xs font-mono font-medium">
                {t.videoOf}{' '}
                {isBn ? toBanglaDigits(activeVideoIndex + 1) : activeVideoIndex + 1}{' '}
                {t.ofTotal}{' '}
                {isBn ? toBanglaDigits(baseVideos.length) : baseVideos.length}
              </div>
            </div>

            {/* Modal Details Footer */}
            <div className="p-5 sm:p-7 bg-[#062F31] text-white">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white/10 text-[var(--aqua)] border border-[var(--aqua)]/30 inline-block mb-2">
                {activeVideo.video_type?.toUpperCase() || 'HD'} ·{' '}
                {isBn
                  ? VIDEO_CATEGORY_NAMES[(activeVideo.category || '').toLowerCase()]?.bn || activeVideo.category
                  : VIDEO_CATEGORY_NAMES[(activeVideo.category || '').toLowerCase()]?.en || activeVideo.category}
              </span>

              <h3 className="text-lg sm:text-2xl font-bold font-serif leading-snug">
                {isBn ? activeVideo.title_bn : activeVideo.title_en}
              </h3>

              {(activeVideo.description_en || activeVideo.description_bn) && (
                <p className="text-sm text-white/75 mt-2 leading-relaxed font-sans">
                  {isBn ? activeVideo.description_bn : activeVideo.description_en}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
