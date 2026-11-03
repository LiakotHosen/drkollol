'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { BlogPost, Category } from '@/types/database';

interface BlogPreviewSectionProps {
  blogs: BlogPost[];
  categories: Category[];
}

export function BlogPreviewSection({ blogs, categories }: BlogPreviewSectionProps) {
  const { lang, isBn } = useLanguage();

  const t = {
    en: {
      bgEb: 'Health blog',
      bgH: 'Read before you worry',
      tag: 'Read article',
      bmore: 'Read article →',
    },
    bn: {
      bgEb: 'স্বাস্থ্য ব্লগ',
      bgH: 'দুশ্চিন্তার আগে পড়ে নিন',
      tag: 'প্রবন্ধ পড়ুন',
      bmore: 'পড়ুন →',
    },
  }[lang];

  const previewList = blogs.slice(0, 3);

  return (
    <section className="hx" id="blog">
      <div className="wrap">
        <p className="eb">{t.bgEb}</p>
        <h2>{t.bgH}</h2>

        <div className="blogs">
          {previewList.map((b) => {
            const cat = categories.find((c) => c.slug === b.category_slug);
            const catName = cat ? (isBn ? cat.name_bn : cat.name_en) : '';
            const title = isBn ? b.title_bn : b.title_en;
            const excerpt = isBn ? b.excerpt_bn : b.excerpt_en;

            return (
              <Link key={b.slug} className="blog glass group" href={`/blogs/${b.slug}`}>
                <div className="ph relative overflow-hidden">
                  {b.cover_image && (
                    <Image
                      src={b.cover_image}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  )}
                  <div className="relative z-10">
                    <span className="tag-s">{t.tag}</span>
                  </div>
                </div>
                <div className="bd">
                  <small>{catName}</small>
                  <h3>{title}</h3>
                  <p>{excerpt}</p>
                  <span className="go">{t.bmore}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
