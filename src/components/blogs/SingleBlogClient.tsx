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

  // Detect whether content is Rich Text HTML or legacy Markdown
  const isHtml = /<[a-z][\s\S]*>/i.test(content || '');

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
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-[var(--ink)] leading-tight tracking-tight">
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
          {/* BODY CONTENT (Rich Text HTML or Markdown Fallback) */}
          {/* ---------------------------------------------------------------------------------- */}
          {isHtml ? (
            <div
              className="prose prose-teal max-w-none text-base sm:text-[17px] text-[#062F31]/90 leading-[1.8] font-serif
                [&_h1]:font-heading [&_h1]:font-extrabold [&_h1]:text-3xl [&_h1]:text-[#062F31] [&_h1]:mt-8 [&_h1]:mb-3
                [&_h2]:font-heading [&_h2]:font-extrabold [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:text-[#062F31] [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:border-l-4 [&_h2]:border-[var(--teal)] [&_h2]:pl-3.5 [&_h2]:leading-snug
                [&_h3]:font-heading [&_h3]:font-extrabold [&_h3]:text-xl [&_h3]:sm:text-2xl [&_h3]:text-[var(--teal)] [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:border-b [&_h3]:border-[rgba(43,179,177,0.2)] [&_h3]:pb-2 [&_h3]:leading-snug
                [&_h4]:font-heading [&_h4]:font-bold [&_h4]:text-lg [&_h4]:text-[#062F31] [&_h4]:mt-4 [&_h4]:mb-1
                [&_p]:my-4 [&_p]:leading-[1.8]
                [&_blockquote]:my-6 [&_blockquote]:p-4 [&_blockquote]:sm:p-5 [&_blockquote]:rounded-2xl [&_blockquote]:bg-gradient-to-r [&_blockquote]:from-[var(--tint)] [&_blockquote]:to-white [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--aqua)] [&_blockquote]:text-[#062F31] [&_blockquote]:shadow-2xs [&_blockquote]:italic
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3.5 [&_ul]:space-y-2
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3.5 [&_ol]:space-y-2
                [&_li]:leading-relaxed
                [&_a]:text-[var(--teal)] [&_a]:underline [&_a]:font-semibold [&_a:hover]:text-[var(--ink)]
                [&_table]:w-full [&_table]:text-xs [&_table]:sm:text-sm [&_table]:border-collapse [&_table]:border [&_table]:border-[rgba(43,179,177,0.3)] [&_table]:rounded-2xl [&_table]:overflow-hidden [&_table]:my-6
                [&_th]:bg-[var(--tint)] [&_th]:font-bold [&_th]:text-[#062F31] [&_th]:p-3 [&_th]:border-b [&_th]:border-[rgba(43,179,177,0.25)]
                [&_td]:p-3 [&_td]:border-b [&_td]:border-gray-100
                [&_img]:rounded-2xl [&_img]:mx-auto [&_img]:shadow-md [&_img]:border [&_img]:border-[rgba(43,179,177,0.2)]
                [&_figcaption]:text-xs [&_figcaption]:text-center [&_figcaption]:text-gray-500 [&_figcaption]:mt-2"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
            />
          ) : (
            <div className="prose prose-teal max-w-none text-sm sm:text-base text-[var(--ink)] leading-relaxed flex flex-col gap-5 font-serif">
              {(content || '').split('\n\n').map((paragraph, idx) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;

                // Helper for bold and italic
                const renderInline = (str: string) =>
                  str
                    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-[#062F31]">$1</strong>')
                    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
                    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-gray-100 text-xs font-mono text-[var(--teal)]">$1</code>');

                // Section Heading H2
                if (trimmed.startsWith('## ')) {
                  return (
                    <h2
                      key={idx}
                      className="font-heading font-extrabold text-2xl sm:text-3xl text-[#062F31] mt-8 mb-2 border-l-4 border-[var(--teal)] pl-3.5 leading-snug"
                      dangerouslySetInnerHTML={{ __html: renderInline(trimmed.replace('## ', '')) }}
                    />
                  );
                }

                // Subsection Heading H3
                if (trimmed.startsWith('### ')) {
                  return (
                    <h3
                      key={idx}
                      className="font-heading font-extrabold text-xl sm:text-2xl text-[var(--teal)] mt-6 mb-1 border-b border-[rgba(43,179,177,0.2)] pb-2 leading-snug"
                      dangerouslySetInnerHTML={{ __html: renderInline(trimmed.replace('### ', '')) }}
                    />
                  );
                }

                // Minor Heading H4
                if (trimmed.startsWith('#### ')) {
                  return (
                    <h4
                      key={idx}
                      className="font-heading font-bold text-lg text-[#062F31] mt-4 mb-0.5"
                      dangerouslySetInnerHTML={{ __html: renderInline(trimmed.replace('#### ', '')) }}
                    />
                  );
                }

                // Blockquote / Surgeon Callout Tip
                if (trimmed.startsWith('> ')) {
                  return (
                    <blockquote
                      key={idx}
                      className="my-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[var(--tint)] to-white border-l-4 border-[var(--aqua)] text-sm sm:text-base text-[#062F31] shadow-2xs italic flex items-start gap-3"
                    >
                      <span className="text-xl text-[var(--teal)] font-serif leading-none mt-0.5">❝</span>
                      <div
                        className="leading-relaxed flex-1"
                        dangerouslySetInnerHTML={{
                          __html: renderInline(trimmed.replace(/^>\s*/gm, '').trim()),
                        }}
                      />
                    </blockquote>
                  );
                }

                // Markdown Table
                if (trimmed.startsWith('|')) {
                  const rows = trimmed.split('\n').filter((r) => !r.includes('---'));
                  return (
                    <div key={idx} className="overflow-x-auto my-5">
                      <table className="w-full text-xs sm:text-sm text-left border border-[rgba(43,179,177,0.3)] rounded-2xl overflow-hidden shadow-2xs">
                        <tbody>
                          {rows.map((row, rIdx) => {
                            const cells = row.split('|').filter(Boolean).map((c) => c.trim());
                            return (
                              <tr
                                key={rIdx}
                                className={
                                  rIdx === 0
                                    ? 'bg-[var(--tint)] font-bold text-[#062F31] border-b border-[rgba(43,179,177,0.25)]'
                                    : 'border-t border-gray-100 hover:bg-gray-50/70 transition-colors'
                                }
                              >
                                {cells.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className="p-3 sm:p-3.5 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: renderInline(cell) }}
                                  />
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                // Unordered / Ordered List
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('1. ')) {
                  const items = trimmed.split('\n');
                  return (
                    <ul key={idx} className="flex flex-col gap-2.5 my-3 pl-1 sm:pl-2">
                      {items.map((it, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-3 text-sm sm:text-base leading-relaxed text-[#062F31]/90">
                          <span className="w-2 h-2 rounded-full bg-[var(--aqua)] mt-2 shrink-0 shadow-2xs" />
                          <span
                            className="flex-1"
                            dangerouslySetInnerHTML={{
                              __html: renderInline(it.replace(/^[-*]|\d+\.\s*/, '').trim()),
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  );
                }

                // Standard Paragraph
                return (
                  <p
                    key={idx}
                    className="leading-relaxed text-[#062F31]/85 text-sm sm:text-base"
                    dangerouslySetInnerHTML={{ __html: renderInline(trimmed) }}
                  />
                );
              })}
            </div>
          )}

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
