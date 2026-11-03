'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileStickyBar } from '@/components/MobileStickyBar';
import { AppointmentModal } from '@/components/AppointmentModal';
import { useLanguage } from '@/context/LanguageContext';
import { BlogPost, Category, Chamber, Condition, SiteSettings } from '@/types/database';
import { formatDigits } from '@/lib/format-utils';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { markdownToHtml } from '@/lib/markdown-to-html';

interface SingleBlogClientProps {
  blog: BlogPost;
  category: Category;
  categories: Category[];
  relatedBlogs: BlogPost[];
  conditions: Condition[];
  settings: SiteSettings;
  chambers: Chamber[];
}

export function SingleBlogClient({
  blog,
  category,
  categories,
  relatedBlogs,
  conditions,
  settings,
  chambers,
}: SingleBlogClientProps) {
  const { lang, isBn } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);

  const t = {
    en: {
      allBlogs: 'Health Blogs',
      reviewedBy: 'Clinically Reviewed by',
      author: 'Dr. Fahim Foysal Kollol',
      authorRole: 'Assistant Professor (Surgery), MMCH · BMDC A-61041',
      published: 'Published on',
      readingTime: blog.reading_time_en || '5 min read',
      disclaimerTitle: 'Medical Safety Notice',
      disclaimerText:
        'This article is published for patient awareness and medical educational purposes only. It is not a substitute for an in-person clinical consultation. If you experience alarming symptoms such as sudden severe pain or bleeding, consult a qualified surgeon promptly.',
      relatedTitle: 'Related Surgical Guides',
      bookCTA: 'Consult Dr. Kollol Regarding This Condition',
      bookSub: 'Serial booking available for Sherpur (Thu & Fri) and Mymensingh (Sat–Tue).',
      bookBtn: 'Book a Serial Now',
      waBtn: 'Ask on WhatsApp',
    },
    bn: {
      allBlogs: 'স্বাস্থ্য ব্লগ',
      reviewedBy: 'চিকিৎসাগত তথ্য অনুমোদন',
      author: 'ডাঃ ফাহিম ফয়সাল কল্লোল',
      authorRole: 'সহকারী অধ্যাপক (সার্জারি), ময়মনসিংহ মেডিকেল কলেজ হাসপাতাল · বিএমডিসি এ-৬১০৪১',
      published: 'প্রকাশের তারিখ',
      readingTime: blog.reading_time_bn || '৫ মিনিট পড়ার সময়',
      disclaimerTitle: 'চিকিৎসা বিষয়ক সতর্কবার্তা',
      disclaimerText:
        'এই লেখার উদ্দেশ্য সাধারণ মানুষের মাঝে সচেতনতা বৃদ্ধি করা। এটি কোনোভাবেই বিশেষজ্ঞ চিকিৎসকের সরাসরি পরামর্শ বা প্রেসক্রিপশনের বিকল্প নয়। যে কোনো তীব্র ব্যথা বা রক্তক্ষরণে দ্রুত সার্জনকে দেখান।',
      relatedTitle: 'আরও সংশ্লিষ্ট স্বাস্থ্য প্রবন্ধ',
      bookCTA: 'এই রোগ সংক্রান্ত পরামর্শের জন্য সিরিয়াল নিন',
      bookSub: 'শেরপুরে প্রতি বৃহস্পতি ও শুক্রবার এবং ময়মনসিংহে শনি থেকে মঙ্গলবার চেম্বার অনুষ্ঠিত হয়।',
      bookBtn: 'সিরিয়াল নিন',
      waBtn: 'WhatsApp-এ পরামর্শ',
    },
  }[lang];

  // Content depending on language
  const content = isBn ? blog.content_bn : blog.content_en;

  // Convert markdown or rich HTML into clean, sanitized HTML
  const finalHtml = markdownToHtml(content || '');

  return (
    <div className="relative min-h-screen bg-white">
      <Navbar
        categories={categories}
        serialPhone={settings.phone_serial}
        onBookClick={() => setModalOpen(true)}
      />

      {/* Article Header */}
      <article className="pt-36 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--teal)] mb-4">
            <Link href="/blogs" className="hover:underline">
              {t.allBlogs}
            </Link>
            <span>/</span>
            <Link href={`/conditions-treatments/${category.slug}`} className="hover:underline">
              {isBn ? category.name_bn : category.name_en}
            </Link>
          </div>

          {/* SEO Main Title H1 */}
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-[2.35rem] text-[var(--ink)] leading-[1.28] tracking-tight">
            {isBn ? blog.title_bn : blog.title_en}
          </h1>

          {/* Author & Reviewer Info */}
          <div className="flex items-center gap-4 mt-6 p-4 rounded-2xl bg-[var(--tint)]/70 border border-[rgba(43,179,177,0.25)] flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--aqua)] to-[var(--teal)] text-white font-extrabold text-lg grid place-items-center shadow-sm">
              K
            </div>
            <div>
              <span className="text-[11px] font-bold text-[var(--aqua)] uppercase block">
                {t.reviewedBy}
              </span>
              <h4 className="font-heading font-bold text-base text-[var(--ink)]">
                {t.author}
              </h4>
              <p className="text-xs text-[var(--muted)]">
                {t.authorRole}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3 text-xs font-semibold text-[var(--muted)]">
              <span>⏱ {t.readingTime}</span>
            </div>
          </div>

          {/* Blog Post Cover Photo (Local device upload or URL) */}
          {blog.cover_image && (
            <div className="my-8 relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-[rgba(43,179,177,0.25)] shadow-lg bg-gray-100">
              <Image
                src={blog.cover_image}
                alt={isBn ? blog.title_bn : blog.title_en}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          )}

          {/* Lead Excerpt */}
          <div className="my-8 p-5 rounded-2xl bg-white border-l-4 border-[var(--teal)] shadow-sm text-sm sm:text-base font-medium text-[var(--ink)] leading-relaxed italic">
            {isBn ? blog.excerpt_bn : blog.excerpt_en}
          </div>

          {/* ---------------------------------------------------------------------------------- */}
          {/* BODY CONTENT (Clean Editorial Typography & Layout) */}
          {/* ---------------------------------------------------------------------------------- */}
          <div
            className="prose max-w-none text-[16px] sm:text-[17.5px] text-[#1A3336] leading-[1.85] font-sans antialiased
              [&_h1]:font-heading [&_h1]:font-extrabold [&_h1]:text-2xl [&_h1]:sm:text-3xl [&_h1]:text-[#062F31] [&_h1]:mt-10 [&_h1]:mb-4 [&_h1]:leading-tight
              [&_h2]:font-heading [&_h2]:font-bold [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:text-[#062F31] [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:border-l-4 [&_h2]:border-[var(--teal)] [&_h2]:pl-4 [&_h2]:leading-snug
              [&_h3]:font-heading [&_h3]:font-bold [&_h3]:text-[1.15rem] [&_h3]:sm:text-[1.25rem] [&_h3]:text-[#0B6E73] [&_h3]:mt-7 [&_h3]:mb-2.5 [&_h3]:leading-snug
              [&_h4]:font-heading [&_h4]:font-semibold [&_h4]:text-base [&_h4]:sm:text-lg [&_h4]:text-[#062F31] [&_h4]:mt-5 [&_h4]:mb-1.5
              [&_p]:my-4.5 [&_p]:leading-[1.85]
              [&_hr]:my-10 [&_hr]:border-0 [&_hr]:h-px [&_hr]:bg-gradient-to-r [&_hr]:from-transparent [&_hr]:via-[rgba(43,179,177,0.35)] [&_hr]:to-transparent
              [&_blockquote]:my-7 [&_blockquote]:p-5 [&_blockquote]:sm:p-6 [&_blockquote]:rounded-2xl [&_blockquote]:bg-gradient-to-r [&_blockquote]:from-[var(--tint)]/80 [&_blockquote]:to-[var(--tint)]/25 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--aqua)] [&_blockquote]:text-[#062F31] [&_blockquote]:shadow-xs [&_blockquote]:italic
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ul]:space-y-2.5 [&_ul]:marker:text-[var(--aqua)]
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ol]:space-y-2.5 [&_ol]:marker:text-[var(--teal)] [&_ol]:marker:font-semibold
              [&_li]:leading-[1.8] [&_li]:text-[#1A3336]
              [&_strong]:font-bold [&_strong]:text-[#062F31]
              [&_em]:italic [&_em]:text-[#062F31]/90
              [&_a]:text-[var(--teal)] [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-semibold [&_a:hover]:text-[var(--ink)]
              [&_table]:w-full [&_table]:text-xs [&_table]:sm:text-sm [&_table]:border-collapse [&_table]:border [&_table]:border-[rgba(43,179,177,0.3)] [&_table]:rounded-2xl [&_table]:overflow-hidden [&_table]:my-7
              [&_th]:bg-[var(--tint)] [&_th]:font-bold [&_th]:text-[#062F31] [&_th]:p-3.5 [&_th]:border-b [&_th]:border-[rgba(43,179,177,0.25)]
              [&_td]:p-3.5 [&_td]:border-b [&_td]:border-gray-100
              [&_img]:rounded-2xl [&_img]:mx-auto [&_img]:shadow-md [&_img]:border [&_img]:border-[rgba(43,179,177,0.2)]
              [&_figcaption]:text-xs [&_figcaption]:text-center [&_figcaption]:text-gray-500 [&_figcaption]:mt-2"
            dangerouslySetInnerHTML={{ __html: finalHtml }}
          />

          {/* Medical Disclaimer Alert */}
          <div className="mt-12 p-5 rounded-2xl bg-amber-50 border border-amber-200">
            <h5 className="font-heading font-bold text-sm text-amber-900 flex items-center gap-2">
              <span>⚠️</span>
              <span>{t.disclaimerTitle}</span>
            </h5>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              {t.disclaimerText}
            </p>
          </div>

          {/* CTA Box */}
          <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white to-[var(--tint)] border border-[rgba(43,179,177,0.35)] shadow-md text-center">
            <h3 className="font-heading font-extrabold text-2xl text-[var(--ink)]">
              {t.bookCTA}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 mb-6">
              {t.bookSub}
            </p>

            <div className="flex justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn btn-p text-xs sm:text-sm py-3 px-6 shadow-md"
              >
                {t.bookBtn}: {formatDigits(settings.phone_serial, isBn)}
              </button>
              <a
                href={settings.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-g text-xs sm:text-sm py-3 px-5 shadow-sm text-emerald-800 border-emerald-300 bg-emerald-50"
              >
                {t.waBtn}
              </a>
            </div>
          </div>

          {/* Related Articles */}
          {relatedBlogs.length > 0 && (
            <div className="mt-16 pt-10 border-t border-[rgba(43,179,177,0.2)]">
              <h3 className="font-heading font-extrabold text-2xl text-[var(--ink)] mb-6">
                {t.relatedTitle}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedBlogs.slice(0, 2).map((rb) => (
                  <Link
                    key={rb.slug}
                    href={`/blogs/${rb.slug}`}
                    className="p-5 rounded-2xl bg-white border border-[rgba(43,179,177,0.25)] hover:border-[var(--teal)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-[var(--aqua)] uppercase">
                        {isBn ? category.name_bn : category.name_en}
                      </span>
                      <h4 className="font-heading font-bold text-base text-[var(--ink)] mt-1">
                        {isBn ? rb.title_bn : rb.title_en}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-[var(--teal)] mt-4">
                      {isBn ? 'সম্পূর্ণ পড়ুন →' : 'Read guide →'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

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
