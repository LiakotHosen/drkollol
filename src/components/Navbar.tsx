'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Category } from '@/types/database';
import { DEFAULT_CATEGORIES } from '@/lib/content/default-data';

interface NavbarProps {
  categories?: Category[];
  serialPhone?: string;
  onBookClick?: () => void;
}

export function Navbar({ categories, serialPhone = '01750529252', onBookClick }: NavbarProps) {
  const { lang, setLang, isBn } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    setMobileServicesOpen(false);
  }, [pathname]);

  const navLinks = {
    en: {
      brand: 'Dr. Kollol',
      home: 'Home',
      about: 'About the Doctor',
      services: 'Conditions & Treatments',
      all: 'All conditions & treatments',
      gallery: 'Gallery',
      blogs: 'Blogs',
      contact: 'Contact',
      book: 'Book a serial',
      call: 'Call now',
    },
    bn: {
      brand: 'ডাঃ কল্লোল',
      home: 'হোম',
      about: 'ডাক্তার সম্পর্কে',
      services: 'রোগ ও চিকিৎসা',
      all: 'সব রোগ ও চিকিৎসা',
      gallery: 'গ্যালারি',
      blogs: 'ব্লগ',
      contact: 'যোগাযোগ',
      book: 'সিরিয়াল নিন',
      call: 'কল করুন',
    },
  }[lang];

  // Guarantee all 7 core categories are always present and properly sorted
  const categoryMap = new Map<string, Category>();
  DEFAULT_CATEGORIES.forEach((c) => categoryMap.set(c.slug, c));
  if (categories && Array.isArray(categories)) {
    categories.forEach((c) => categoryMap.set(c.slug, c));
  }
  const allNavCategories = Array.from(categoryMap.values()).sort(
    (a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99)
  );

  return (
    <>
      <header className="nav">
        <Link className="brand" href="/">
          <i>K</i>
          <span>{navLinks.brand}</span>
        </Link>

        <nav className="links">
          <Link href="/" className={pathname === '/' ? 'on' : ''}>
            {navLinks.home}
          </Link>
          <Link
            href="/about"
            className={pathname === '/about' ? 'on' : ''}
          >
            {navLinks.about}
          </Link>

          <div className={`dd ${dropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {navLinks.services}
            </button>
            <div className="dd-menu">
              <Link
                className={`all ${pathname === '/conditions-treatments' ? 'on' : ''}`}
                href="/conditions-treatments"
              >
                {navLinks.all}
              </Link>
              {allNavCategories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/conditions-treatments/${c.slug}`}
                  className={pathname === `/conditions-treatments/${c.slug}` ? 'on' : ''}
                >
                  {isBn ? c.name_bn : c.name_en}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/gallery" className={pathname === '/gallery' ? 'on' : ''}>
            {navLinks.gallery}
          </Link>
          <Link href="/blogs" className={pathname.startsWith('/blogs') ? 'on' : ''}>
            {navLinks.blogs}
          </Link>
          <Link href="/contact" className={pathname === '/contact' ? 'on' : ''}>
            {navLinks.contact}
          </Link>
        </nav>

        <div className="right">
          <div className="lang">
            <button
              type="button"
              className={lang === 'en' ? 'on' : ''}
              onClick={() => setLang('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={lang === 'bn' ? 'on' : ''}
              onClick={() => setLang('bn')}
            >
              বাং
            </button>
          </div>

          {onBookClick ? (
            <button type="button" onClick={onBookClick} className="btn btn-p">
              {navLinks.book}
            </button>
          ) : (
            <a className="btn btn-p" href={`tel:${serialPhone}`}>
              {navLinks.book}
            </a>
          )}

          <button
            type="button"
            className="burger"
            aria-label="Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Sheet */}
      {mobileMenuOpen && (
        <div
          className="sheet-backdrop"
          onClick={() => {
            setMobileMenuOpen(false);
            setMobileServicesOpen(false);
          }}
          aria-hidden="true"
        />
      )}
      <div className={`sheet ${mobileMenuOpen ? 'open' : ''}`}>
        <Link
          href="/"
          onClick={() => {
            setMobileMenuOpen(false);
            setMobileServicesOpen(false);
          }}
        >
          {navLinks.home}
        </Link>
        <Link
          href="/about"
          onClick={() => {
            setMobileMenuOpen(false);
            setMobileServicesOpen(false);
          }}
        >
          {navLinks.about}
        </Link>

        {/* Collapsible Mobile Dropdown for Conditions & Treatments */}
        <div className={`sheet-acc ${mobileServicesOpen ? 'open' : ''}`}>
          <button
            type="button"
            className="sheet-acc-trigger"
            onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
            aria-expanded={mobileServicesOpen}
          >
            <span>{navLinks.services}</span>
            <ChevronDown
              size={18}
              className={`sheet-acc-arrow ${mobileServicesOpen ? 'rotated' : ''}`}
            />
          </button>
          <div className="sheet-acc-content">
            <div className="sheet-acc-inner">
              <Link
                className={`sub all ${pathname === '/conditions-treatments' ? 'active' : ''}`}
                href="/conditions-treatments"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setMobileServicesOpen(false);
                }}
              >
                <span>{navLinks.all}</span>
                <span className="arrow-hint">→</span>
              </Link>
              {allNavCategories.map((c) => {
                const isCatActive = pathname === `/conditions-treatments/${c.slug}`;
                return (
                  <Link
                    key={c.slug}
                    className={`sub ${isCatActive ? 'active' : ''}`}
                    href={`/conditions-treatments/${c.slug}`}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileServicesOpen(false);
                    }}
                  >
                    <span className="sub-dot" />
                    <span>{isBn ? c.name_bn : c.name_en}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <Link
          href="/gallery"
          onClick={() => {
            setMobileMenuOpen(false);
            setMobileServicesOpen(false);
          }}
          className={pathname === '/gallery' ? 'active' : ''}
        >
          {navLinks.gallery}
        </Link>
        <Link
          href="/blogs"
          onClick={() => {
            setMobileMenuOpen(false);
            setMobileServicesOpen(false);
          }}
        >
          {navLinks.blogs}
        </Link>
        <Link
          href="/contact"
          onClick={() => {
            setMobileMenuOpen(false);
            setMobileServicesOpen(false);
          }}
        >
          {navLinks.contact}
        </Link>
        {onBookClick ? (
          <button
            type="button"
            className="btn btn-p cursor-pointer"
            style={{ marginTop: '8px' }}
            onClick={() => {
              setMobileMenuOpen(false);
              setMobileServicesOpen(false);
              onBookClick();
            }}
          >
            {navLinks.book}
          </button>
        ) : (
          <a
            href={`tel:${serialPhone}`}
            className="btn btn-p"
            style={{ marginTop: '8px' }}
            onClick={() => {
              setMobileMenuOpen(false);
              setMobileServicesOpen(false);
            }}
          >
            {navLinks.book}
          </a>
        )}
      </div>
    </>
  );
}
