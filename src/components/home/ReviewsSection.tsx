'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Review, SiteSettings } from '@/types/database';
import {
  Star,
  QrCode,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  X,
  Copy,
  Check,
  Quote,
  Sparkles,
} from 'lucide-react';
import QRCodeLib from 'qrcode';

interface ReviewsSectionProps {
  reviews: Review[];
  siteSettings?: SiteSettings;
}

export function ReviewsSection({ reviews, siteSettings }: ReviewsSectionProps) {
  const { lang, isBn } = useLanguage();

  // Primary Google Review URL
  const googleReviewUrl =
    siteSettings?.google_review_url || 'https://maps.google.com/?cid=drkollol';
  const googleRating = siteSettings?.google_rating || 4.9;
  const googleReviewCount = siteSettings?.google_review_count || 54;

  // State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Dragging & Interaction Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);
  const isMouseDownRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragScrollLeftRef = useRef(0);
  const initializedPosRef = useRef(false);

  // Generate QR Code data URL
  useEffect(() => {
    QRCodeLib.toDataURL(googleReviewUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#062F31',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate Google Review QR Code:', err));
  }, [googleReviewUrl]);

  // Triple the list to create a seamless infinite 3-zone buffer (Left buffer, Active middle, Right buffer)
  const displayReviews = React.useMemo(() => {
    if (!reviews || reviews.length === 0) return [];
    return [
      ...reviews.map((r, i) => ({ ...r, _uKey: `s0-${r.id}-${i}` })),
      ...reviews.map((r, i) => ({ ...r, _uKey: `s1-${r.id}-${i}` })),
      ...reviews.map((r, i) => ({ ...r, _uKey: `s2-${r.id}-${i}` })),
    ];
  }, [reviews]);

  // Helper to measure card step (card width + 20px gap)
  const getCardStep = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return 360;
    const firstCard = el.querySelector<HTMLElement>('[data-review-card]');
    if (!firstCard) return 360;
    return firstCard.offsetWidth + 20;
  }, []);

  // Position at the start of the middle set on initial mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || reviews.length === 0 || initializedPosRef.current) return;

    const timer = setTimeout(() => {
      const step = getCardStep();
      const singleSetWidth = reviews.length * step;
      el.scrollLeft = singleSetWidth;
      initializedPosRef.current = true;
    }, 60);

    return () => clearTimeout(timer);
  }, [reviews.length, getCardStep]);

  // IntersectionObserver: only run animations when section is in viewport
  useEffect(() => {
    const section = document.getElementById('reviews');
    if (!section || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Seamless wrap handler for manual scrolling
  const handleScrollWrap = useCallback(() => {
    const el = scrollRef.current;
    if (!el || reviews.length === 0) return;

    const step = getCardStep();
    const singleSetWidth = reviews.length * step;

    // If scrolled past the 2nd set, wrap back by 1 set
    if (el.scrollLeft >= singleSetWidth * 2) {
      el.scrollLeft -= singleSetWidth;
    }
    // If scrolled before the 1st set (e.g. left swipes), wrap forward by 1 set
    else if (el.scrollLeft <= singleSetWidth * 0.1) {
      el.scrollLeft += singleSetWidth;
    }
  }, [reviews.length, getCardStep]);

  // Smooth continuous auto-scroll loop (Delta-time based for smooth 60fps/120fps across all screens)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || reviews.length === 0) return;

    let animId: number;
    let lastTime = performance.now();
    const speedPerSec = 38; // 38px per second: smooth, comfortable reading pace

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      const clampedDelta = Math.min(delta, 0.1);

      if (
        !isPaused &&
        !isHovered &&
        !isInteractingRef.current &&
        isVisibleRef.current &&
        el
      ) {
        el.scrollLeft += clampedDelta * speedPerSec;

        const step = getCardStep();
        const singleSetWidth = reviews.length * step;
        if (el.scrollLeft >= singleSetWidth * 2) {
          el.scrollLeft -= singleSetWidth;
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, isHovered, reviews.length, getCardStep]);

  // Manual scroll buttons: pause continuous auto-scroll and smoothly advance
  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;

    // Pause auto-scroll during and after button click
    isInteractingRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 3000);

    const step = getCardStep();
    const scrollAmount = direction === 'left' ? -step : step;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Mobile Touch handlers: pause auto-scroll during touch, let native iOS/Android momentum scrolling handle swiping
  const handleTouchStart = () => {
    isInteractingRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const handleTouchEnd = () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 2500);
  };

  // Desktop Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isMouseDownRef.current = true;
    isInteractingRef.current = true;
    dragStartXRef.current = e.pageX - el.offsetLeft;
    dragScrollLeftRef.current = el.scrollLeft;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragStartXRef.current) * 1.3;
    scrollRef.current.scrollLeft = dragScrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        isInteractingRef.current = false;
      }, 2000);
    }
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(googleReviewUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const t = {
    en: {
      rvEb: 'Patient reviews',
      rvH: 'What patients say',
      rvLead: 'Real experiences and surgical testimonials from patients in Sherpur and Mymensingh.',
      gT: 'Google reviews',
      gS: `${googleRating} ★★★★★ (${googleReviewCount}+ verified ratings on Google)`,
      gSee: 'See reviews on Google',
      gWrite: 'Write a review',
      gScanBtn: 'Scan QR to Review',
      gScanTitle: 'Scan to Review on Google',
      gScanSub: 'Point your phone camera at this QR code to rate Dr. Kollol directly on Google Maps.',
      step1: '1. Open Camera',
      step2: '2. Scan QR Code',
      step3: '3. Tap to Rate',
      copyBtn: 'Copy Link',
      copied: 'Copied!',
      directBtn: 'Open in Google Maps',
      viewOnGoogle: 'View on Google',
      verified: 'Verified Google Review',
      sample: 'Sample Review',
      pause: 'Pause slider',
      resume: 'Resume slider',
      prev: 'Previous',
      next: 'Next',
      dragTip: 'Swipe or drag to explore patient testimonials',
    },
    bn: {
      rvEb: 'রোগীদের মতামত',
      rvH: 'রোগীরা যা বলেন',
      rvLead: 'শেরপুর ও ময়মনসিংহের রোগীদের বাস্তব অভিজ্ঞতা ও সফল অস্ত্রোপচারের গল্প।',
      gT: 'Google রিভিউ',
      gS: `${isBn ? '৪.৯' : googleRating} ★★★★★ (${isBn ? '৫৪+' : googleReviewCount}টি যাচাইকৃত গুগল রিভিউ)`,
      gSee: 'Google-এ রিভিউ দেখুন',
      gWrite: 'রিভিউ লিখুন',
      gScanBtn: 'QR স্ক্যান করুন',
      gScanTitle: 'Google-এ রিভিউ দিতে স্ক্যান করুন',
      gScanSub: 'আপনার ফোনের ক্যামেরা দিয়ে এই QR কোডটি স্ক্যান করলেই সরাসরি Google রিভিউ দেওয়ার পেজ খুলবে।',
      step1: '১. ক্যামেরা খুলুন',
      step2: '২. QR স্ক্যান করুন',
      step3: '৩. স্টার রেটিং দিন',
      copyBtn: 'লিংক কপি',
      copied: 'কপি হয়েছে!',
      directBtn: 'গুগল ম্যাপে খুলুন',
      viewOnGoogle: 'গুগলে দেখুন',
      verified: 'যাচাইকৃত গুগল রিভিউ',
      sample: 'নমুনা রিভিউ',
      pause: 'স্লাইড থামান',
      resume: 'স্লাইড চালু করুন',
      prev: 'পূর্ববর্তী',
      next: 'পরবর্তী',
      dragTip: 'বাম-ডানে টেনে সকল রোগীদের মন্তব্য দেখুন',
    },
  }[lang];

  return (
    <section className="hx relative overflow-hidden py-16" id="reviews">
      <div className="wrap">
        <p className="eb">{t.rvEb}</p>
        <h2>{t.rvH}</h2>
        <p className="lead">{t.rvLead}</p>

        {/* Google Reviews Glass Box - WIDE & ELEGANT */}
        <div className="gbox glass relative overflow-hidden shadow-xl border border-[#0B6E73]/20 bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 md:p-8 max-w-5xl w-full mx-auto mt-8 transition-all hover:border-[#2BB3B1]/40">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 w-full">
            {/* Left: Google Badge & Rating Info */}
            <div className="flex items-center gap-4 sm:gap-5 text-center sm:text-left min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-[#2BB3B1]/30 flex items-center justify-center shadow-sm shrink-0">
                <svg className="w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>

              <div className="gt min-w-0">
                {/* Line 1: Google Reviews + 5 Stars + Score Pill */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#062F31] tracking-tight whitespace-nowrap">
                    {t.gT}
                  </h3>
                  <div className="flex items-center text-amber-500 gap-0.5">
                    <Star className="w-4.5 h-4.5 fill-current" />
                    <Star className="w-4.5 h-4.5 fill-current" />
                    <Star className="w-4.5 h-4.5 fill-current" />
                    <Star className="w-4.5 h-4.5 fill-current" />
                    <Star className="w-4.5 h-4.5 fill-current" />
                  </div>
                  <span className="text-xs font-bold font-mono text-[#0B6E73] bg-[#EEF7F6] px-2.5 py-0.5 rounded-lg border border-[#2BB3B1]/30">
                    {isBn ? '৪.৯' : googleRating} / {isBn ? '৫.০' : '5.0'}
                  </span>
                </div>

                {/* Line 2: Single clear subtitle without wrapping */}
                <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-snug">
                  {isBn
                    ? `${isBn ? '৫৪+' : googleReviewCount}টি যাচাইকৃত রোগীর গুগল রিভিউ ও রেটিং · শেরপুর ও ময়মনসিংহ`
                    : `${googleReviewCount}+ verified patient ratings on Google Maps · Sherpur & Mymensingh`}
                </p>
              </div>
            </div>

            {/* Right: Prominent Bigger QR Code + Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-4 shrink-0 w-full lg:w-auto">
              {/* Prominent Live QR Code Trigger Badge */}
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className="group relative flex items-center gap-3 p-2.5 pr-4 rounded-2xl border border-[#2BB3B1]/40 bg-gradient-to-br from-white to-[#EEF7F6] hover:border-[#0B6E73] hover:shadow-md transition-all cursor-pointer text-left shrink-0"
                title={isBn ? 'বড় করে দেখতে ক্লিক করুন' : 'Click to enlarge QR code'}
              >
                {/* Big live QR code thumbnail: 76px x 76px */}
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 bg-white p-1 rounded-xl border border-gray-200/90 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Google Review QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <QrCode className="w-8 h-8 text-gray-400" />
                  )}
                  {/* Subtle hover overlay cue */}
                  <div className="absolute inset-0 bg-[#0B6E73]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#0B6E73]" />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#062F31] group-hover:text-[#0B6E73] transition-colors">
                    <QrCode className="w-3.5 h-3.5 text-[#0B6E73]" />
                    <span>{isBn ? 'মোবাইলে স্ক্যান' : 'Scan on Mobile'}</span>
                  </div>
                  <span className="text-[11px] text-gray-500 block leading-tight">
                    {isBn ? 'ক্যামেরা দিয়ে রিভিউ দিন' : 'Point camera to rate'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2BB3B1] group-hover:underline">
                    <span>Google Maps</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </button>

              {/* Action Buttons */}
                            {/* Action Buttons: Responsive Stack on mobile, side-by-side on larger screens */}
              <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto justify-center">
                <a
                  className="btn btn-p text-xs sm:text-sm px-4 sm:px-5 py-3 sm:py-2.5 rounded-xl shadow-xs text-center w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span>{t.gSee}</span>
                </a>

                <a
                  className="btn btn-g text-xs sm:text-sm px-4 sm:px-5 py-3 sm:py-2.5 rounded-xl shadow-xs text-center w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Star className="w-4 h-4 shrink-0 fill-amber-400 text-amber-500" />
                  <span>{t.gWrite}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Bleed Reviews Carousel Runway */}
      <div className="relative w-full mt-10">
        {/* Left & Right Soft Edge Gradient Masks for continuous bleed feel */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 md:w-24 bg-gradient-to-r from-[#F6F6F6] via-[#F6F6F6]/80 to-transparent z-10 hidden sm:block" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 md:w-24 bg-gradient-to-l from-[#F6F6F6] via-[#F6F6F6]/80 to-transparent z-10 hidden sm:block" />

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          onScroll={handleScrollWrap}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            handleMouseUpOrLeave();
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="flex gap-5 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing px-4 sm:px-12 select-none py-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x pan-y',
            overscrollBehaviorX: 'contain',
          }}
        >
          {displayReviews.map((r) => {
            const quote = isBn ? r.quote_bn : r.quote_en;
            const author = isBn ? r.author_name_bn : r.author_name_en;
            const meta = isBn ? r.author_meta_bn : r.author_meta_en;
            const initials = author.replace(/[.\s]/g, '').slice(0, isBn ? 3 : 2);
            const reviewUrl = r.google_review_url || googleReviewUrl;

            return (
              <div
                key={r._uKey}
                data-review-card
                className="review-card-item glass w-[300px] sm:w-[350px] md:w-[380px] shrink-0 rounded-3xl p-6 sm:p-7 border border-[#0B6E73]/15 hover:border-[#2BB3B1] bg-white/90 backdrop-blur-md shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Stars & Google Badge */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100/80">
                    <div className="flex items-center text-amber-400 gap-0.5">
                      {Array.from({ length: r.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current drop-shadow-xs" />
                      ))}
                    </div>

                    {!r.is_sample ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 shadow-xs">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                          />
                        </svg>
                        <span>{t.verified}</span>
                      </span>
                    ) : (
                      <span className="tag-s">{t.sample}</span>
                    )}
                  </div>

                  {/* Review Quote Body */}
                  <div className="relative pt-4 pb-4">
                    <Quote className="w-6 h-6 text-[#2BB3B1]/25 mb-1 -ml-1" />
                    <p className="font-normal text-sm sm:text-[15px] leading-relaxed text-[#062F31]/90">
                      &quot;{quote}&quot;
                    </p>
                  </div>
                </div>

                {/* Card Footer: Patient Profile & View on Google Button */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="av shrink-0 w-10 h-10 rounded-full font-bold text-xs text-white bg-gradient-to-tr from-[#0B6E73] to-[#2BB3B1] flex items-center justify-center shadow-xs">
                      {initials}
                    </span>
                    <div className="min-w-0">
                      <b className="text-xs sm:text-sm font-semibold text-[#062F31] block truncate">
                        {author}
                      </b>
                      <span className="text-[11px] text-gray-500 block truncate font-mono">
                        {meta}
                      </span>
                    </div>
                  </div>

                  {/* "View on Google" CTA Button */}
                  <a
                    href={reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-[#EEF7F6] text-[#0B6E73] hover:text-[#062F31] text-xs font-semibold border border-gray-200 transition-all shrink-0 hover:border-[#2BB3B1] group-hover:bg-[#EEF7F6]"
                    title={`${t.viewOnGoogle} - ${author}`}
                  >
                    <span>{t.viewOnGoogle}</span>
                    <ExternalLink className="w-3 h-3 text-[#2BB3B1]" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slider Controls (Play/Pause, Prev, Next, Touch tip) */}
      <div className="wrap mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t.dragTip}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Pause / Resume Button */}
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors shadow-xs cursor-pointer"
            title={isPaused ? t.resume : t.pause}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                <span>{t.resume}</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-[#0B6E73]" />
                <span>{t.pause}</span>
              </>
            )}
          </button>

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-[#EEF7F6] hover:text-[#0B6E73] transition-colors shadow-xs cursor-pointer"
            title={t.prev}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-[#EEF7F6] hover:text-[#0B6E73] transition-colors shadow-xs cursor-pointer"
            title={t.next}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* High-Resolution QR Code Modal */}
      {qrModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setQrModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-[#0B6E73]/20 relative text-center space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EEF7F6] text-[#0B6E73] mx-auto flex items-center justify-center mb-3 shadow-xs">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#062F31]">
                {t.gScanTitle}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-[260px] mx-auto leading-relaxed">
                {t.gScanSub}
              </p>
            </div>

            {/* QR Code Canvas */}
            <div className="bg-gradient-to-br from-[#EEF7F6] to-white p-4 rounded-2xl border border-[#2BB3B1]/20 inline-block shadow-inner mx-auto">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Dr. Kollol Google Review QR Code"
                  className="w-56 h-56 rounded-xl mx-auto border border-gray-200 shadow-sm"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-gray-400">
                  <span>Generating QR...</span>
                </div>
              )}
            </div>

            {/* Steps Guide */}
            <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
              <span>{t.step1}</span>
              <span>{t.step2}</span>
              <span>{t.step3}</span>
            </div>

            {/* Action Buttons: Copy link & Open in Google Maps */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.copyBtn}</span>
                  </>
                )}
              </button>

              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#0B6E73] hover:bg-[#084f53] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>{t.directBtn}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
