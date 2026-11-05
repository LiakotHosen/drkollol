'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AppointmentModal } from '@/components/AppointmentModal';
import { MeetYourSurgeonHero } from '@/components/home/MeetYourSurgeonHero';
import { useLanguage } from '@/context/LanguageContext';
import { Category, Chamber, SiteSettings, SurgeonProfile } from '@/types/database';

interface AboutPageClientProps {
  profile: SurgeonProfile;
  categories: Category[];
  settings: SiteSettings;
  chambers: Chamber[];
}

export function AboutPageClient({
  profile,
  categories,
  settings,
  chambers,
}: AboutPageClientProps) {
  const { lang, isBn } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChamberIdx, setSelectedChamberIdx] = useState(0);

  const SERIAL_NO = '01750529252';
  const CALL_NO = '01670879100';
  const WA_URL = 'https://wa.me/8801670879100';

  const t = {
    en: {
      crumb: 'About the Surgeon',
      giant: 'Dr. Kollol',
      leadTitle: 'Dr. Fahim Foysal Kollol',
      leadRole: 'General, Laparoscopic, Breast & Colorectal Surgeon',
      leadPost: 'Assistant Professor of Surgery, Mymensingh Medical College Hospital · BMDC Reg. A-61041',
      book: 'Book a serial',
      call: 'Call now',
      scroll: 'Scroll to explore career',
      statsEb: 'Verified track record',
      statsH: 'Surgical Experience in Numbers',
      statsLead: 'Over a decade of dedicated surgical care in Sherpur and Mymensingh.',
      timelineEb: 'Career Milestones',
      timelineH: 'Specialist Training & Journey',
      timelineLead: 'From premier surgical training to faculty mentorship at MMCH.',
      timeline: [
        {
          year: '2015',
          title: 'Commenced Surgical Practice',
          desc: 'Graduated MBBS and entered dedicated clinical surgery service, managing acute abdominal and trauma emergencies.',
        },
        {
          year: '2017',
          title: 'MMCH Advanced Surgical Trainee',
          desc: 'Intensive surgical residency training at Mymensingh Medical College Hospital managing high-volume operating theatres.',
        },
        {
          year: '2022',
          title: 'FCPS (Surgery) Specialist Fellow',
          desc: 'Achieved specialist qualification in surgery from the prestigious BCPS and Member of the American College of Surgeons (MACS, USA).',
        },
        {
          year: 'Present',
          title: 'Assistant Professor of Surgery, MMCH',
          desc: 'Mentoring future doctors and leading specialized laparoscopic, breast, and colorectal surgical units in Sherpur & Mymensingh.',
        },
      ],
      membershipsEb: 'Professional Recognition',
      membershipsH: 'Societies & Fellowships',
      memberships: [
        { name: 'FCPS (Surgery)', sub: 'Bangladesh College of Physicians & Surgeons' },
        { name: 'MACS (USA)', sub: 'Member, American College of Surgeons' },
        { name: 'Life Member, SOSB', sub: 'Society of Surgeons of Bangladesh' },
        { name: 'Life Member, SELSB', sub: 'Society of Endolaparoscopic Surgeons of Bangladesh' },
        { name: 'BMDC Registered', sub: 'Registration No. A-61041' },
        { name: 'BCS (Health)', sub: '33rd BCS (Health Cadre)' },
      ],
      pubsEb: 'Academic Research',
      pubsH: '11 Research Publications',
      pubsLead: 'Authored and published research in peer-reviewed national and international surgical journals.',
      publications: [
        { title: 'Comparative Outcomes of Laparoscopic vs Open Appendicectomy in Acute Appendicitis', journal: 'MMCH Medical Journal', year: '2022' },
        { title: 'Surgical Outcomes of Stapled Hemorrhoidopexy (Longo Method) in Grade III & IV Hemorrhoids', journal: 'Bangladesh Journal of Surgery', year: '2023' },
        { title: 'Management Protocols and Recurrence Prevention in Complex Perianal Fistula', journal: 'Journal of Surgical Sciences', year: '2021' },
        { title: 'Efficacy of Minimal Access Keyhole Cholecystectomy in Difficult Gallbladder Anatomy', journal: 'International Surgical Spectrum', year: '2023' },
        { title: 'Transabdominal Preperitoneal (TAPP) Mesh Repair in Inguinal Hernia: A 3-Year Single Center Study', journal: 'MMCH Journal of Medicine & Surgery', year: '2022' },
        { title: 'Diagnostic Accuracy of Triple Assessment in Palpable Breast Lumps among Reproductive Age Females', journal: 'Bangladesh Medical Review', year: '2020' },
        { title: 'Laparoscopic Varicocelectomy Outcomes on Semen Parameters and Pain Alleviation', journal: 'Clinical Surgery Insights', year: '2024' },
        { title: 'Analysis of Conservative vs Surgical Management in Subacute Anal Fissures', journal: 'Asian Journal of Coloproctology', year: '2023' },
        { title: 'Emergency Management of Blunt Abdominal Trauma in Secondary Healthcare Facilities', journal: 'MMCH Trauma Series', year: '2019' },
        { title: 'Clinical Spectrum and Pathological Profiling of Soft Tissue Lipomas', journal: 'Journal of Surgical Practice', year: '2021' },
        { title: 'Evaluation of Postoperative Quality of Life following Minimally Invasive Colorectal Surgery', journal: 'South Asian Surgical Bulletin', year: '2024' },
      ],
      vH: 'Meet Dr. Kollol for Consultation',
      vP: 'Call for a serial or come to the chamber — Dr. Kollol will examine your condition and recommend the safest surgical treatment.',
      dir: 'Directions →',
      ch: [
        {
          t: 'Sherpur Chamber 1 · Thursday',
          n: 'Health Care (Pvt) Hospital',
          a: 'Zila Hospital Road, Narayanpur, Sherpur · 4:00 PM – 9:00 PM',
          q: 'Health Care Pvt Hospital, Hospital Road, Sherpur',
          link: 'https://www.google.com/maps/search/?api=1&query=Health+Care+Pvt+Hospital%2C+Hospital+Road%2C+Sherpur&query_place_id=ChIJO6EZbULXVzcRKDpZy_ERMTI',
        },
        {
          t: 'Sherpur Chamber 2 · Friday',
          n: 'Amjad Diagnostic Center',
          a: 'Zila Hospital Road, Narayanpur, Sherpur · 11:00 AM – 9:00 PM',
          q: '25.01915,90.02275',
          link: 'https://www.google.com/maps?q=25.01915%2C90.02275',
        },
        {
          t: 'Mymensingh · Saturday to Tuesday',
          n: 'New Medicare Pathology Lab',
          a: '208 Charpara (opp. Hospital Gate 1, 5th floor) · 3:30 PM – 8:00 PM',
          q: 'New Medicare Pathology Lab, Charpara, Mymensingh',
          link: 'https://www.google.com/maps/search/?api=1&query=New+Medicare+Pathology+Lab%2C+Charpara%2C+Mymensingh&query_place_id=ChIJEZk4RglPVjcR9KoUp46judc',
        },
      ],
    },
    bn: {
      crumb: 'ডাক্তার পরিচিতি',
      giant: 'ডাঃ কল্লোল',
      leadTitle: 'ডাঃ ফাহিম ফয়সাল কল্লোল',
      leadRole: 'জেনারেল, ল্যাপারোস্কপিক, ব্রেস্ট ও কলোরেক্টাল সার্জন',
      leadPost: 'সহকারী অধ্যাপক (সার্জারি), ময়মনসিংহ মেডিকেল কলেজ হাসপাতাল · বিএমডিসি রেজি: এ-৬১০৪১',
      book: 'সিরিয়াল নিন',
      call: 'কল করুন',
      scroll: 'বিস্তারিত জানতে স্ক্রল করুন',
      statsEb: 'বাস্তব কাজের অভিজ্ঞতা',
      statsH: 'সংখ্যায় সফল অপারেশনের খতিয়ান',
      statsLead: 'শেরপুর ও ময়মনসিংহে দীর্ঘ এক দশকেরও বেশি সময় ধরে রোগীদের নির্ভরতার প্রতীক।',
      timelineEb: 'কর্মজীবনের ধাপ',
      timelineH: 'উচ্চতর প্রশিক্ষণ ও অভিজ্ঞতা',
      timelineLead: 'দেশসেরা চিকিৎসালয়ে গভীর প্রশিক্ষণ থেকে শুরু করে এমএমসিএইচ-এ শিক্ষকতা পর্যন্ত।',
      timeline: [
        {
          year: '২০১৫',
          title: 'চিকিৎসা সেবায় পদার্পণ',
          desc: 'স্নাতক সম্পন্ন করে জেনারেল ও জরুরি সার্জিক্যাল রোগীদের সেবায় নিজেকে নিয়োজিত করেন।',
        },
        {
          year: '২০১৭',
          title: 'ময়মনসিংহ মেডিকেল কলেজ হাসপাতালে রেসিডেন্ট ট্রেইনি',
          desc: 'এমএমসিএইচ-এ জটিল ও সংকটাপন্ন রোগীদের অস্ত্রোপচার ব্যবস্থাপনায় দীর্ঘ ও নিবিড় প্রশিক্ষণ গ্রহণ।',
        },
        {
          year: '২০২২',
          title: 'এফসিপিএস (সার্জারি) ফেলোশিপ অর্জন',
          desc: 'বিসিপিএস থেকে সার্জারির সর্বোচ্চ ডিগ্রি এবং আমেরিকান কলেজ অব সার্জন্সের (MACS) সম্মানিত সদস্যপদ লাভ।',
        },
        {
          year: 'বর্তমান',
          title: 'সহকারী অধ্যাপক (সার্জারি), ময়মনসিংহ মেডিকেল কলেজ',
          desc: 'আগামী প্রজন্মের চিকিৎসকদের শিক্ষকতা এবং শেরপুর ও ময়মনসিংহে নিয়মিত সফল অস্ত্রোপচার পরিচালনা।',
        },
      ],
      membershipsEb: 'স্বীকৃতি ও সদস্যপদ',
      membershipsH: 'পেশাদার ফেলোশিপ ও সোসাইটি',
      memberships: [
        { name: 'এফসিপিএস (সার্জারি)', sub: 'বাংলাদেশ কলেজ অব ফিজিশিয়ানস অ্যান্ড সার্জনস' },
        { name: 'এমএসিএস (আমেরিকা)', sub: 'মেম্বার, আমেরিকান কলেজ অব সার্জন্স' },
        { name: 'আজীবন সদস্য, এসওএসবি', sub: 'সোসাইটি অব সার্জন্স অব বাংলাদেশ' },
        { name: 'আজীবন সদস্য, এসইএলএসবি', sub: 'সোসাইটি অব এন্ডোল্যাপারোস্কপিক সার্জন্স অব বাংলাদেশ' },
        { name: 'বিএমডিসি নিবন্ধিত', sub: 'রেজিস্ট্রেশন নং: এ-৬১০৪১' },
        { name: 'বিসিএস (স্বাস্থ্য)', sub: '৩৩তম বিসিএস (স্বাস্থ্য ক্যাডার)' },
      ],
      pubsEb: 'গবেষণা ও প্রকাশনা',
      pubsH: '১১টি স্বীকৃত গবেষণাপত্র',
      pubsLead: 'জাতীয় ও আন্তর্জাতিক পিয়ার-রিভিউড সার্জিক্যাল জার্নালে প্রকাশিত গুরুত্বপূর্ণ গবেষণাকর্ম।',
      publications: [
        { title: 'তীব্র অ্যাপেন্ডিসাইটিসে ল্যাপারোস্কপিক বনাম ওপেন অপারেশনের ফলাফল', journal: 'এমএমসিএইচ মেডিকেল জার্নাল', year: '২০২২' },
        { title: 'উন্নত পাইলস চিকিৎসায় লংগো (স্টেপলার) পদ্ধতির কার্যকারিতা', journal: 'বাংলাদেশ জার্নাল অব সার্জারি', year: '২০২৩' },
        { title: 'জটিল পেরিঅ্যানাল ফিস্টুলার চিকিৎসা ও পুনরাবৃত্তি রোধের কৌশল', journal: 'জার্নাল অব সার্জিক্যাল সায়েন্স', year: '২০২১' },
        { title: 'কঠিন পিত্তথলির অ্যানাটমিতে ল্যাপারোস্কপিক কোলেসিস্টেক্টমির সাফল্য', journal: 'ইন্টারন্যাশনাল সার্জিক্যাল স্পেকট্রাম', year: '২০২৩' },
        { title: 'কুঁচকির হার্নিয়ায় ল্যাপারোস্কপিক মেশ রিপেয়ার (TAPP) মূল্যায়ন', journal: 'এমএমসিএইচ জার্নাল অব সার্জারি', year: '২০২২' },
        { title: 'স্তন টিউমার নির্ণয়ে ট্রিপল অ্যাসেসমেন্টের নিখুঁত ভূমিকা', journal: 'বাংলাদেশ মেডিকেল রিভিউ', year: '২০২০' },
        { title: 'ল্যাপারোস্কপিক ভেরিকোসিল অপারেশনে শুক্রাণু ও ব্যথা উপশম', journal: 'ক্লিনিক্যাল সার্জারি ইনসাইটস', year: '২০২৪' },
        { title: 'এনাল ফিশার নিরাময়ে আধুনিক চিকিৎসা ও অপারেশনের তুলনা', journal: 'এশিয়ান জার্নাল অব কলোপ্রোক্টোলজি', year: '২০২৩' },
        { title: 'পেটের জরুরি ট্রমার তাৎক্ষণিক সার্জিক্যাল ব্যবস্থাপনা', journal: 'এমএমসিএইচ ট্রমা সিরিজ', year: '২০১৯' },
        { title: 'চামড়ার নিচে নরম চর্বির চাকা ও লাইপোমার প্যাথলজি', journal: 'জার্নাল অব সার্জিক্যাল প্র্যাকটিস', year: '২০২১' },
        { title: 'মলদ্বারের আধুনিক সার্জারির পর রোগীর জীবনযাত্রার মান', journal: 'সাউথ এশিয়ান সার্জিক্যাল বুলেটিন', year: '২০২৪' },
      ],
      vH: 'সরাসরি পরামর্শের জন্য চেম্বারে আসুন',
      vP: 'সিরিয়ালের জন্য কল করুন বা চেম্বারে আসুন — ডাঃ কল্লোল যত্ন নিয়ে আপনার সমস্যা পরীক্ষা করে সঠিক সমাধান জানাবেন।',
      dir: 'দিকনির্দেশনা →',
      ch: [
        {
          t: 'শেরপুর চেম্বার ১ · প্রতি বৃহস্পতিবার',
          n: 'হেলথ কেয়ার (প্রাঃ) হাসপাতাল',
          a: 'জেলা হাসপাতাল রোড, নারায়ণপুর, শেরপুর · বিকাল ৪.০০টা – রাত ৯.০০টা',
          q: 'Health Care Pvt Hospital, Hospital Road, Sherpur',
          link: 'https://www.google.com/maps/search/?api=1&query=Health+Care+Pvt+Hospital%2C+Hospital+Road%2C+Sherpur&query_place_id=ChIJO6EZbULXVzcRKDpZy_ERMTI',
        },
        {
          t: 'শেরপুর চেম্বার ২ · প্রতি শুক্রবার',
          n: 'আমজাদ ডায়াগনস্টিক সেন্টার',
          a: 'জেলা হাসপাতাল রোড, নারায়ণপুর, শেরপুর · সকাল ১১.০০টা – রাত ৯.০০টা',
          q: '25.01915,90.02275',
          link: 'https://www.google.com/maps?q=25.01915%2C90.02275',
        },
        {
          t: 'ময়মনসিংহ · প্রতি শনি থেকে মঙ্গলবার',
          n: 'নিউ মেডিকেয়ার প্যাথলজি ল্যাব',
          a: '২০৮ চরপাড়া (১নং হাসপাতাল গেইটের বিপরীতে ৫ম তলা) · বিকাল ৩.৩০টা – রাত ৮.০০টা',
          q: 'New Medicare Pathology Lab, Charpara, Mymensingh',
          link: 'https://www.google.com/maps/search/?api=1&query=New+Medicare+Pathology+Lab%2C+Charpara%2C+Mymensingh&query_place_id=ChIJEZk4RglPVjcR9KoUp46judc',
        },
      ],
    },
  }[lang];

  const handleChamberClick = (idx: number) => {
    setSelectedChamberIdx(idx);
    if (t.ch[idx]?.link) {
      window.open(t.ch[idx].link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F6F6F6]">
      <Navbar
        categories={categories}
        serialPhone={settings.phone_serial}
        onBookClick={() => setModalOpen(true)}
      />

      {/* 1. Page Hero: Meet Your Surgeon (shared component with Home page) */}
      <MeetYourSurgeonHero
        profile={profile}
        serialPhone={settings.phone_serial}
        callPhone={CALL_NO}
        onBookClick={() => setModalOpen(true)}
        id="top"
        headingLevel="h1"
      />











      {/* 3. Career Timeline */}
      <section className="hx" id="timeline">
        <div className="wrap" style={{ maxWidth: '920px' }}>
          <p className="eb">{t.timelineEb}</p>
          <h2>{t.timelineH}</h2>
          <p className="lead">{t.timelineLead}</p>

          <div
            style={{
              position: 'relative',
              marginTop: '44px',
              borderLeft: '2px solid var(--aqua)',
              paddingLeft: '28px',
              marginLeft: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
            }}
          >
            {t.timeline.map((item, idx) => (
              <div key={idx} className="glass" style={{ padding: '22px 24px', position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '-40px',
                    top: '20px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#fff',
                    border: '4px solid var(--teal)',
                    boxShadow: '0 0 0 4px rgba(43,179,177,0.2)',
                  }}
                />
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--aqua)',
                  }}
                >
                  {item.year}
                </span>
                <h3 style={{ margin: '6px 0 8px', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
                  {item.title}
                </h3>
                <p style={{ margin: 0, fontSize: '14.5px', lineHeight: 1.6, color: 'var(--muted)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Professional Recognition & Fellowships */}
      <section className="hx tint" id="fellowships">
        <div className="wrap">
          <p className="eb">{t.membershipsEb}</p>
          <h2>{t.membershipsH}</h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginTop: '36px',
            }}
          >
            {t.memberships.map((m, idx) => (
              <div key={idx} className="glass" style={{ padding: '22px 24px' }}>
                <span className="tag-s" style={{ marginBottom: '8px' }}>
                  Verified
                </span>
                <b style={{ display: 'block', fontSize: '20px', color: 'var(--teal)', marginTop: '6px' }}>
                  {m.name}
                </b>
                <span style={{ display: 'block', marginTop: '6px', fontSize: '14px', color: 'var(--muted)' }}>
                  {m.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Academic Research & Publications */}
      <section className="hx" id="publications">
        <div className="wrap">
          <p className="eb">{t.pubsEb}</p>
          <h2>{t.pubsH}</h2>
          <p className="lead">{t.pubsLead}</p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px',
              marginTop: '36px',
            }}
          >
            {t.publications.map((pub, idx) => (
              <div
                key={idx}
                className="glass"
                style={{
                  padding: '20px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'var(--aqua)',
                      }}
                    >
                      Paper #{idx + 1}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--teal)',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: 'var(--tint)',
                      }}
                    >
                      {pub.year}
                    </span>
                  </div>
                  <h4 style={{ margin: 0, fontSize: '16px', lineHeight: 1.4, fontWeight: 700, color: 'var(--ink)' }}>
                    {pub.title}
                  </h4>
                </div>
                <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(43,179,177,0.2)' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--muted)' }}>
                    {pub.journal}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Consultation & Chambers Section */}
      <section className="hx tint visit" id="visit">
        <div className="v-stage">
          <div className="v-big">{t.giant}</div>

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
              <button type="button" onClick={() => setModalOpen(true)} className="btn btn-p">
                {t.book}
              </button>
              <a href={`tel:${CALL_NO}`} className="btn btn-g">
                {t.call}
              </a>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn btn-g">
                WhatsApp
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

      </section>

      <Footer
        settings={settings}
        categories={categories}
        chambers={chambers}
        onBookClick={() => setModalOpen(true)}
      />

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        chambers={chambers}
        whatsappUrl={settings.whatsapp_url}
      />
    </div>
  );
}
