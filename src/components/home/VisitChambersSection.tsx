'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { Chamber, SiteSettings } from '@/types/database';

interface VisitChambersSectionProps {
  settings: SiteSettings;
  chambers: Chamber[];
  onBookClick?: () => void;
}

export function VisitChambersSection({ settings, chambers, onBookClick }: VisitChambersSectionProps) {
  const { lang, isBn } = useLanguage();
  const [selectedChamberIdx, setSelectedChamberIdx] = useState(0);

  const SERIAL_NO = '01750529252';
  const EMERGENCY_CALL = '01670879100';
  const WA_URL = 'https://wa.me/8801670879100';

  const t = {
    en: {
      brand: 'Dr. Kollol',
      vH: 'Don’t wait. Talk to your surgeon.',
      vP: 'Call for a serial or message on WhatsApp — Dr. Kollol will carefully assess your condition and guide you toward the right surgical treatment.',
      book: 'Book a serial',
      call: 'Emergency Call',
      wa: 'WhatsApp Doctor',
      dir: 'Directions on Google Maps →',
      mapH: 'Find the consultation chamber',
      mapS: 'Tap any chamber above to view live map location & GPS directions.',
      ch: [
        {
          t: 'Sherpur Chamber 1 · Thursday',
          n: 'Health Care (Pvt) Hospital',
          a: 'Zila Hospital Road, Narayanpur, Sherpur · 4:00 PM – 9:00 PM',
          q: 'Health Care Pvt Hospital, Hospital Road, Sherpur',
          link: 'https://www.google.com/maps/search/?api=1&query=Health+Care+Pvt+Hospital%2C+Hospital+Road%2C+Sherpur&query_place_id=ChIJO6EZbULXVzcRKDpZy_ERMTI',
          embed: 'https://maps.google.com/maps?q=Health%20Care%20Pvt%20Hospital%2C%20Hospital%20Road%2C%20Sherpur&z=16&output=embed',
        },
        {
          t: 'Sherpur Chamber 2 · Friday',
          n: 'Amjad Diagnostic Center',
          a: 'Zila Hospital Road, Narayanpur, Sherpur · 11:00 AM – 9:00 PM',
          q: '25.01915,90.02275',
          link: 'https://www.google.com/maps?q=25.01915%2C90.02275',
          embed: 'https://maps.google.com/maps?q=25.01915%2C90.02275&z=16&output=embed',
        },
        {
          t: 'Mymensingh · Saturday to Tuesday',
          n: 'New Medicare Pathology Lab',
          a: '208 Charpara (opp. Hospital Gate 1, 5th floor) · 3:30 PM – 8:00 PM',
          q: 'New Medicare Pathology Lab, Charpara, Mymensingh',
          link: 'https://www.google.com/maps/search/?api=1&query=New+Medicare+Pathology+Lab%2C+Charpara%2C+Mymensingh&query_place_id=ChIJEZk4RglPVjcR9KoUp46judc',
          embed: 'https://maps.google.com/maps?q=New%20Medicare%20Pathology%20Lab%2C%20Charpara%2C%20Mymensingh&z=16&output=embed',
        },
      ],
    },
    bn: {
      brand: 'ডাঃ কল্লোল',
      vH: 'দেরি নয়। আপনার সার্জনের সাথে কথা বলুন।',
      vP: 'সিরিয়ালের জন্য কল করুন বা WhatsApp-এ মেসেজ দিন — ডাঃ কল্লোল আপনার সমস্যা ও সঠিক চিকিৎসা বুঝিয়ে বলবেন।',
      book: 'সিরিয়াল নিন',
      call: 'জরুরি কল',
      wa: 'WhatsApp ডক্টর',
      dir: 'গুগল ম্যাপে দিকনির্দেশনা →',
      mapH: 'চেম্বার খুঁজে নিন',
      mapS: 'ম্যাপে দেখতে যেকোনো চেম্বারে চাপ দিন।',
      ch: [
        {
          t: 'শেরপুর চেম্বার ১ · বৃহস্পতিবার',
          n: 'হেলথ কেয়ার (প্রাঃ) হাসপাতাল',
          a: 'জেলা হাসপাতাল রোড, নারায়ণপুর, শেরপুর · বিকাল ৪.০০টা – রাত ৯.০০টা',
          q: 'Health Care Pvt Hospital, Hospital Road, Sherpur',
          link: 'https://www.google.com/maps/search/?api=1&query=Health+Care+Pvt+Hospital%2C+Hospital+Road%2C+Sherpur&query_place_id=ChIJO6EZbULXVzcRKDpZy_ERMTI',
          embed: 'https://maps.google.com/maps?q=Health%20Care%20Pvt%20Hospital%2C%20Hospital%20Road%2C%20Sherpur&z=16&output=embed',
        },
        {
          t: 'শেরপুর চেম্বার ২ · শুক্রবার',
          n: 'আমজাদ ডায়াগনস্টিক সেন্টার',
          a: 'জেলা হাসপাতাল রোড, নারায়ণপুর, শেরপুর · সকাল ১১.০০টা – রাত ৯.০০টা',
          q: '25.01915,90.02275',
          link: 'https://www.google.com/maps?q=25.01915%2C90.02275',
          embed: 'https://maps.google.com/maps?q=25.01915%2C90.02275&z=16&output=embed',
        },
        {
          t: 'ময়মনসিংহ · শনি থেকে মঙ্গলবার',
          n: 'নিউ মেডিকেয়ার প্যাথলজি ল্যাব',
          a: '২০৮ চরপাড়া (১নং হাসপাতাল গেইটের বিপরীতে ৫ম তলা) · বিকাল ৩.৩০টা – রাত ৮.০০টা',
          q: 'New Medicare Pathology Lab, Charpara, Mymensingh',
          link: 'https://www.google.com/maps/search/?api=1&query=New+Medicare+Pathology+Lab%2C+Charpara%2C+Mymensingh&query_place_id=ChIJEZk4RglPVjcR9KoUp46judc',
          embed: 'https://maps.google.com/maps?q=New%20Medicare%20Pathology%20Lab%2C%20Charpara%2C%20Mymensingh&z=16&output=embed',
        },
      ],
    },
  }[lang];

  const currentCh = t.ch[selectedChamberIdx] || t.ch[0];

  const handleChamberClick = (idx: number) => {
    if (selectedChamberIdx === idx) {
      window.open(t.ch[idx].link, '_blank', 'noopener');
    } else {
      setSelectedChamberIdx(idx);
    }
  };

  return (
    <section className="hx tint visit" id="visit">
      <div className="v-stage">
        <div className="v-big" id="vBig">
          {t.brand}
        </div>

        <div className="v-doc">
          <Image
            src="/img/doctor-cta-v3.webp"
            alt="Dr. Fahim Foysal Kollol"
            width={649}
            height={1081}
            loading="lazy"
          />
        </div>

        <div className="v-cta glass" id="vCta">
          <h3>{t.vH}</h3>
          <p>{t.vP}</p>
          <div className="row">
            {onBookClick ? (
              <button type="button" onClick={onBookClick} className="btn btn-p cursor-pointer">
                {t.book}
              </button>
            ) : (
              <a href={`tel:${SERIAL_NO}`} className="btn btn-p">
                {t.book}
              </a>
            )}
            <a href={`tel:${EMERGENCY_CALL}`} className="btn btn-g">
              {t.call}
            </a>
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn btn-g">
              {t.wa}
            </a>
          </div>
        </div>

        <div className="v-chs" id="vChs">
          {t.ch.map((x, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChamberClick(idx)}
              className={`v-ch glass ${selectedChamberIdx === idx ? 'on' : ''} cursor-pointer text-left`}
            >
              <small>{x.t}</small>
              <b>{x.n}</b>
              <span>{x.a}</span>
              <em>{t.dir}</em>
            </button>
          ))}
        </div>
      </div>

      <div className="v-map" id="vMap">
        <div className="mh">
          <div>
            <b>{t.mapH}</b>
            <span>{t.mapS}</span>
          </div>
        </div>
        <iframe
          id="mapFrame"
          title="Chamber Map"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          src={currentCh.embed}
        />
      </div>
    </section>
  );
}
