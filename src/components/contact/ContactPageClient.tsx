'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileStickyBar } from '@/components/MobileStickyBar';
import { AppointmentModal } from '@/components/AppointmentModal';
import { useLanguage } from '@/context/LanguageContext';
import { Category, Chamber, SiteSettings } from '@/types/database';
import {
  PhoneCall,
  PhoneForwarded,
  MessageCircle,
  MapPinned,
  Building2,
  Clock3,
  CalendarDays,
  UserCheck,
  Navigation2,
  ArrowUpRight,
  HeartPulse,
  Stethoscope,
  Sparkles,
  ClipboardCheck,
  CalendarCheck,
} from 'lucide-react';

interface ContactPageClientProps {
  categories: Category[];
  settings: SiteSettings;
  chambers: Chamber[];
}

export function ContactPageClient({
  categories,
  settings,
  chambers,
}: ContactPageClientProps) {
  const { lang, isBn } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMapChamberIdx, setSelectedMapChamberIdx] = useState(0);

  const t = {
    en: {
      eyebrow: 'Chambers & Direct Contact',
      heading: 'Consultation Chambers & Serial Information',
      lead: 'Dr. Fahim Foysal Kollol consults patients at Sherpur on Thursdays and Fridays, and at Mymensingh from Saturday to Tuesday. Call our assistants or message on WhatsApp for prompt serial confirmation.',
      badgeDoctor: 'Direct Doctor Consultation',
      assistantLabel: 'Personal Assistant:',
      scheduleLabel: 'Visiting Schedule:',
      addressLabel: 'Address:',
      serialInfo: 'Info & Serial:',
      callNow: 'Call Now',
      waSerial: 'WhatsApp for Serial',
      openMaps: 'Open in Google Maps',
      emergencyTitle: 'Direct Contact with Doctor (Emergency Purpose)',
      emergencySubtitle:
        'For urgent medical concerns or emergencies, contact Dr. Fahim Foysal Kollol directly via WhatsApp or Phone.',
      emergencyWaBtn: 'Direct WhatsApp to Doctor',
      emergencyCallBtn: 'Direct Emergency Call',
      emergencyBadge: 'Emergency Assistance',
      directContactBadge: 'Direct Contact',
      doctorDirectLabel: "Doctor's Direct Number",
      statusActive: 'Active',
      gpsEyebrow: 'GPS & Maps',
      mapSectionTitle: 'Interactive Chamber Navigation',
      mapSectionSubtitle: 'Select a chamber below to view exact location and get GPS directions.',
      instructionsTitle: 'Patient Guide for Smooth Consultation',
      step1Title: '1. Take Serial via WhatsApp / Call',
      step1Desc: 'Send patient name, age and brief problem on WhatsApp or call our assistant to receive your serial number.',
      step2Title: '2. Documents to Bring',
      step2Desc: 'Carry all previous prescriptions, ultrasound reports, lab investigations and current medications list.',
      step3Title: '3. Arrival Time',
      step3Desc: 'Please arrive at the chamber 15-20 minutes before your serial time to complete initial clinical vitals check.',
    },
    bn: {
      eyebrow: 'চেম্বার ও সিরিয়াল তথ্য',
      heading: 'চেম্বার ও সরাসরি যোগাযোগ',
      lead: 'ডাঃ ফাহিম ফয়সাল কল্লোল ময়মনসিংহে প্রতি শনি থেকে মঙ্গলবার এবং শেরপুরে প্রতি বৃহস্পতি ও শুক্রবার নিয়মিত রোগী দেখেন। দ্রুত সিরিয়াল পেতে চেম্বার সহকারী বা সিরিয়াল নম্বরে কল করুন অথবা WhatsApp-এ মেসেজ দিন।',
      badgeDoctor: 'ডাক্তারের সাথে সরাসরি পরামর্শ',
      assistantLabel: 'ব্যক্তিগত সহকারী:',
      scheduleLabel: 'সময়সূচি:',
      addressLabel: 'ঠিকানা:',
      serialInfo: 'তথ্য ও সিরিয়াল:',
      callNow: 'কল করুন',
      waSerial: 'WhatsApp-এ সিরিয়াল নিন',
      openMaps: 'গুগল ম্যাপে লোকেশন দেখুন',
      emergencyTitle: 'সরাসরি ডাক্তারের সাথে যোগাযোগ (জরুরি প্রয়োজনে)',
      emergencySubtitle:
        'কোনো জরুরি প্রয়োজনে বা পরামর্শের জন্য সরাসরি ডাঃ ফাহিম ফয়সাল কল্লোল স্যারের সাথে WhatsApp বা ফোনে যোগাযোগ করুন।',
      emergencyWaBtn: 'ডাক্তারকে সরাসরি WhatsApp',
      emergencyCallBtn: 'জরুরি সরাসরি কল',
      emergencyBadge: 'জরুরি সেবা',
      directContactBadge: 'সরাসরি যোগাযোগ',
      doctorDirectLabel: 'ডাক্তারের সরাসরি নম্বর',
      statusActive: 'সক্রিয়',
      gpsEyebrow: 'জিপিএস ও ম্যাপস',
      mapSectionTitle: 'চেম্বার লোকেশন ও গুগল ম্যাপ',
      mapSectionSubtitle: 'ম্যাপে দেখতে যেকোনো চেম্বার ট্যাব সিলেক্ট করুন এবং সরাসরি দিকনির্দেশনা পান।',
      instructionsTitle: 'রোগী ও স্বজনদের জন্য জরুরি নির্দেশিকা',
      step1Title: '১. কল বা WhatsApp-এ সিরিয়াল নিশ্চিতকরণ',
      step1Desc: 'রোগীর নাম, বয়স ও সমস্যার বিবরণ WhatsApp-এ পাঠিয়ে বা সরাসরি কল করে সহজেই সিরিয়াল নম্বর পেয়ে যাবেন।',
      step2Title: '২. সাথে কী কী রিপোর্ট আনবেন',
      step2Desc: 'পূর্ববর্তী সকল প্রেসক্রিপশন, আল্ট্রাসনোগ্রাম রিপোর্ট, রক্ত পরীক্ষার কাগজপত্র ও নিয়মিত ওষুধের তালিকা সাথে রাখুন।',
      step3Title: '৩. চেম্বারে উপস্থিতির সময়',
      step3Desc: 'সিরিয়ালের নির্ধারিত সময়ের অন্তত ১৫-২০ মিনিট পূর্বে চেম্বারে উপস্থিত হলে সিরিয়াল বজায় রাখা সহজ হয়।',
    },
  }[lang];

  // Specific 3 physical chambers ordered: Sherpur 1, Sherpur 2, Mymensingh
  const chamberList = [
    {
      id: 'sherpur-healthcare',
      tag_en: 'Sherpur Chamber 1',
      tag_bn: 'শেরপুর চেম্বার ১',
      tab_en: 'Sherpur 1 (Health Care Hospital)',
      tab_bn: 'শেরপুর ১ (হেলথ কেয়ার হাসপাতাল)',
      badge_en: 'Sherpur Chamber 1 · Thursday',
      badge_bn: 'শেরপুর চেম্বার ১ · প্রতি বৃহস্পতিবার',
      name_en: 'Chamber 1: Health Care (Pvt) Hospital',
      name_bn: 'চেম্বার ১: হেলথ কেয়ার (প্রাঃ) হাসপাতাল',
      address_en: 'Zila Hospital Road, Narayanpur, Sherpur',
      address_bn: 'জেলা হাসপাতাল রোড, নারায়ণপুর, শেরপুর।',
      schedule_en: 'Every Thursday 4:00 PM – 9:00 PM',
      schedule_bn: 'প্রতি বৃহস্পতিবার বিকাল ৪.০০টা – রাত ৯.০০টা',
      phone_display_en: '01671-869026',
      phone_display_bn: '০১৬৭১-৮৬৯০২৬',
      phone_raw: '01671869026',
      assistant_en: 'Milon',
      assistant_bn: 'মিলন',
      map_query: 'Health Care Pvt Hospital, Hospital Road, Sherpur',
      map_url:
        'https://www.google.com/maps/search/?api=1&query=Health+Care+Pvt+Hospital%2C+Hospital+Road%2C+Sherpur&query_place_id=ChIJO6EZbULXVzcRKDpZy_ERMTI',
      wa_url: `https://wa.me/8801671869026?text=${encodeURIComponent(
        isBn
          ? 'আসসালামু আলাইকুম মিলন ভাই। আমি শেরপুর হেলথ কেয়ার হাসপাতালে ডাঃ কল্লোল স্যারের বৃহস্পতিবারের সিরিয়াল নিতে চাই।\nরোগীর নাম:\nবয়স:\nসমস্যা:'
          : 'Hello Milon, I want to book a Thursday serial for Dr. Kollol at Health Care Hospital, Sherpur.\nPatient Name:\nAge:\nProblem:'
      )}`,
      embed_url:
        'https://maps.google.com/maps?q=Health%20Care%20Pvt%20Hospital%2C%20Hospital%20Road%2C%20Sherpur&z=16&output=embed',
    },
    {
      id: 'sherpur-amjad',
      tag_en: 'Sherpur Chamber 2',
      tag_bn: 'শেরপুর চেম্বার ২',
      tab_en: 'Sherpur 2 (Amjad Diagnostic)',
      tab_bn: 'শেরপুর ২ (আমজাদ ডায়াগনস্টিক)',
      badge_en: 'Sherpur Chamber 2 · Friday',
      badge_bn: 'শেরপুর চেম্বার ২ · প্রতি শুক্রবার',
      name_en: 'Chamber 2: Amjad Diagnostic Center',
      name_bn: 'চেম্বার ২: আমজাদ ডায়াগনস্টিক সেন্টার',
      address_en: 'Zila Hospital Road, Narayanpur, Sherpur',
      address_bn: 'জেলা হাসপাতাল রোড, নারায়ণপুর, শেরপুর।',
      schedule_en: 'Every Friday 11:00 AM – 9:00 PM',
      schedule_bn: 'প্রতি শুক্রবার সকাল ১১.০০টা – রাত ৯.০০টা',
      phone_display_en: '01671-869026',
      phone_display_bn: '০১৬৭১-৮৬৯০২৬',
      phone_raw: '01671869026',
      assistant_en: 'Milon',
      assistant_bn: 'মিলন',
      map_query: '25.01915,90.02275',
      map_url: 'https://www.google.com/maps?q=25.01915%2C90.02275',
      wa_url: `https://wa.me/8801671869026?text=${encodeURIComponent(
        isBn
          ? 'আসসালামু আলাইকুম মিলন ভাই। আমি শেরপুর আমজাদ ডায়াগনস্টিক সেন্টারে ডাঃ কল্লোল স্যারের শুক্রবারের সিরিয়াল নিতে চাই।\nরোগীর নাম:\nবয়স:\nসমস্যা:'
          : 'Hello Milon, I want to book a Friday serial for Dr. Kollol at Amjad Diagnostic Center, Sherpur.\nPatient Name:\nAge:\nProblem:'
      )}`,
      embed_url: 'https://maps.google.com/maps?q=25.01915%2C90.02275&z=16&output=embed',
    },
    {
      id: 'mymensingh-medicare',
      tag_en: 'Mymensingh Chamber',
      tag_bn: 'ময়মনসিংহ চেম্বার',
      tab_en: 'Mymensingh (New Medicare)',
      tab_bn: 'ময়মনসিংহ (নিউ মেডিকেয়ার)',
      badge_en: 'Mymensingh · Saturday to Tuesday',
      badge_bn: 'ময়মনসিংহ · শনি থেকে মঙ্গলবার',
      name_en: 'Chamber: New Medicare Pathology Lab, Mymensingh',
      name_bn: 'চেম্বার: নিউ মেডিকেয়ার প্যাথলজি ল্যাব, ময়মনসিংহ',
      address_en: '208 Charpara (Opposite Hospital Gate 1, 5th Floor), Mymensingh',
      address_bn: '২০৮ চরপাড়া (১নং হাসপাতাল গেইটের বিপরীতে ৫ম তলা), ময়মনসিংহ',
      schedule_en: 'Every Saturday to Tuesday 3:30 PM – 8:00 PM',
      schedule_bn: 'প্রতি শনি থেকে মঙ্গলবার বিকাল ৩.৩০টা – রাত ৮.০০টা',
      phone_display_en: '01750-529252',
      phone_display_bn: '০১৭৫০-৫২৯২৫২',
      phone_raw: '01750529252',
      assistant_en: null,
      assistant_bn: null,
      map_query: 'New Medicare Pathology Lab, Charpara, Mymensingh',
      map_url:
        'https://www.google.com/maps/search/?api=1&query=New+Medicare+Pathology+Lab%2C+Charpara%2C+Mymensingh&query_place_id=ChIJEZk4RglPVjcR9KoUp46judc',
      wa_url: `https://wa.me/8801750529252?text=${encodeURIComponent(
        isBn
          ? 'আসসালামু আলাইকুম। আমি ময়মনসিংহ নিউ মেডিকেয়ার প্যাথলজি ল্যাব চেম্বারে ডাঃ কল্লোল স্যারের সিরিয়াল নিতে চাই।\nরোগীর নাম:\nবয়স:\nসমস্যা:\nতারিখ:'
          : 'Hello, I would like to book a serial for Dr. Kollol at New Medicare Pathology Lab, Mymensingh.\nPatient Name:\nAge:\nProblem:'
      )}`,
      embed_url:
        'https://maps.google.com/maps?q=New%20Medicare%20Pathology%20Lab%2C%20Charpara%2C%20Mymensingh&z=16&output=embed',
    },
  ];

  const emergencyDoctor = {
    phone_display_en: '01670-879100',
    phone_display_bn: '০১৬৭০-৮৭৯১০০',
    phone_raw: '01670879100',
    wa_url: `https://wa.me/8801670879100?text=${encodeURIComponent(
      isBn
        ? 'আসসালামু আলাইকুম ডাঃ ফাহিম ফয়সাল কল্লোল স্যার। জরুরি প্রয়োজনে আপনার সাথে সরাসরি WhatsApp-এ যোগাযোগ করছি।\nরোগীর নাম:\nসমস্যার বিবরণ:'
        : 'Hello Dr. Fahim Foysal Kollol, contacting you for direct emergency surgical consultation.\nPatient Name:\nProblem:'
    )}`,
  };

  const currentMapChamber = chamberList[selectedMapChamberIdx] || chamberList[0];

  return (
    <div className="relative min-h-screen bg-white">
      <Navbar
        categories={categories}
        serialPhone={settings.phone_serial}
        onBookClick={() => setModalOpen(true)}
      />

      {/* Hero Header */}
      <section className="pt-36 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#EEF7F6] via-[#F4FAFA] to-white border-b border-[rgba(43,179,177,0.2)]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--tint)] text-[var(--teal)] text-xs font-bold uppercase tracking-widest border border-[var(--aqua)]/30 mb-3">
            <CalendarCheck className="w-3.5 h-3.5 text-[var(--aqua)]" />
            {t.eyebrow}
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#062F31] leading-tight tracking-tight">
            {t.heading}
          </h1>
          <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto mt-3 leading-relaxed">
            {t.lead}
          </p>
        </div>
      </section>

      {/* 4 Cards Showcase (3 Chambers + 1 Emergency Doctor) */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* 3 Physical Chambers */}
            {chamberList.map((ch, idx) => (
              <div
                key={ch.id}
                className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white border border-[rgba(43,179,177,0.25)] shadow-md hover:shadow-xl hover:border-[var(--teal)] transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-[var(--tint)] text-[var(--teal)] border border-[var(--aqua)]/25">
                      <CalendarDays className="w-3.5 h-3.5 text-[var(--aqua)]" />
                      {isBn ? ch.badge_bn : ch.badge_en}
                    </span>
                    <span className="text-[11px] font-bold text-[#0B6E73]/70 px-2.5 py-0.5 rounded-md bg-gray-50 border border-gray-200/60 uppercase tracking-wider">
                      {isBn ? ch.tag_bn : ch.tag_en}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--tint)] border border-[var(--aqua)]/30 flex items-center justify-center shrink-0 mt-0.5 text-[var(--teal)] shadow-2xs">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <h3 className="font-heading font-extrabold text-xl text-[#062F31] leading-snug">
                      {isBn ? ch.name_bn : ch.name_en}
                    </h3>
                  </div>

                  <div className="mt-4 space-y-2.5 text-xs sm:text-sm text-[#062F31]/80">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-[var(--tint)] text-[var(--teal)] flex items-center justify-center shrink-0 mt-0.5">
                        <MapPinned className="w-3.5 h-3.5 text-[var(--aqua)]" />
                      </div>
                      <span className="leading-relaxed">
                        <strong className="text-[#062F31]">{t.addressLabel}</strong>{' '}
                        {isBn ? ch.address_bn : ch.address_en}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock3 className="w-3.5 h-3.5" />
                      </div>
                      <span className="leading-relaxed">
                        <strong className="text-[#062F31]">{t.scheduleLabel}</strong>{' '}
                        {isBn ? ch.schedule_bn : ch.schedule_en}
                      </span>
                    </div>

                    {(isBn ? ch.assistant_bn : ch.assistant_en) && (
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                          <UserCheck className="w-3.5 h-3.5" />
                        </div>
                        <span className="leading-relaxed">
                          <strong className="text-[#062F31]">{t.assistantLabel}</strong>{' '}
                          {isBn ? ch.assistant_bn : ch.assistant_en}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-2.5 pt-1">
                      <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                      <span className="leading-relaxed">
                        <strong className="text-[#062F31]">{t.serialInfo}</strong>{' '}
                        <a
                          href={`tel:${ch.phone_raw}`}
                          className="font-bold text-base sm:text-lg text-[var(--teal)] hover:underline tracking-tight"
                        >
                          {isBn ? ch.phone_display_bn : ch.phone_display_en}
                        </a>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col gap-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href={`tel:${ch.phone_raw}`}
                      className="inline-flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[var(--teal)] hover:bg-[#062F31] text-white text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-98"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>{t.callNow}</span>
                    </a>

                    <a
                      href={ch.wa_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-98"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  <a
                    href={ch.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--teal)] hover:text-[#062F31] py-1.5 transition-colors group/map"
                  >
                    <Navigation2 className="w-3.5 h-3.5 text-[var(--aqua)] group-hover/map:rotate-12 transition-transform" />
                    <span>{t.openMaps}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                  </a>
                </div>
              </div>
            ))}

            {/* Card 4: Doctor Direct Emergency Contact */}
            <div className="relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/60 border-2 border-emerald-500/40 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                    <HeartPulse className="w-4 h-4 text-rose-600 animate-pulse" />
                    {t.emergencyBadge}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-xl uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    {t.directContactBadge}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-xl text-[#062F31] leading-snug">
                      {t.emergencyTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#062F31]/75 mt-1.5 leading-relaxed">
                      {t.emergencySubtitle}
                    </p>
                  </div>
                </div>

                <div className="mt-5 p-4 rounded-2xl bg-white/95 border border-emerald-200 shadow-inner flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center shadow-xs">
                      <PhoneCall className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[var(--teal)] uppercase tracking-wider block">
                        {t.doctorDirectLabel}
                      </span>
                      <a
                        href={`tel:${emergencyDoctor.phone_raw}`}
                        className="font-heading font-extrabold text-lg sm:text-xl text-emerald-900 tracking-tight hover:underline"
                      >
                        {isBn
                          ? emergencyDoctor.phone_display_bn
                          : emergencyDoctor.phone_display_en}
                      </a>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    {t.statusActive}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-emerald-100 flex flex-col gap-2.5">
                <a
                  href={emergencyDoctor.wa_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 text-white text-sm font-bold transition-all shadow-md active:scale-98"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{t.emergencyWaBtn}</span>
                </a>

                <a
                  href={`tel:${emergencyDoctor.phone_raw}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-gray-50 text-[#062F31] border border-gray-200 text-xs font-semibold transition-all active:scale-98"
                >
                  <PhoneForwarded className="w-3.5 h-3.5 text-[var(--teal)]" />
                  <span>
                    {t.emergencyCallBtn} (
                    {isBn
                      ? emergencyDoctor.phone_display_bn
                      : emergencyDoctor.phone_display_en}
                    )
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Google Map Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F4FAFA] to-white border-t border-[rgba(43,179,177,0.2)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[var(--teal)]">
              <Navigation2 className="w-3.5 h-3.5 text-[var(--aqua)]" />
              {t.gpsEyebrow}
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#062F31] mt-1">
              {t.mapSectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5">
              {t.mapSectionSubtitle}
            </p>

            {/* Chamber Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {chamberList.map((ch, idx) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSelectedMapChamberIdx(idx)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    selectedMapChamberIdx === idx
                      ? 'bg-[var(--teal)] text-white shadow-md scale-102'
                      : 'bg-white text-[#062F31] border border-[rgba(43,179,177,0.3)] hover:bg-[var(--tint)]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{isBn ? ch.tab_bn : ch.tab_en}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Map & Chamber Detail Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-8 rounded-3xl border border-[rgba(43,179,177,0.3)] shadow-lg">
            {/* Info Card Left (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--tint)] border border-[var(--aqua)]/30 flex items-center justify-center shrink-0 mt-0.5 text-[var(--teal)] shadow-2xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--aqua)] block">
                      {isBn ? currentMapChamber.badge_bn : currentMapChamber.badge_en}
                    </span>
                    <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#062F31] mt-0.5">
                      {isBn ? currentMapChamber.name_bn : currentMapChamber.name_en}
                    </h3>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-xs sm:text-sm text-[#062F31]/80">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[var(--tint)] text-[var(--teal)] flex items-center justify-center shrink-0 mt-0.5">
                      <MapPinned className="w-3.5 h-3.5 text-[var(--aqua)]" />
                    </div>
                    <span>
                      <strong className="text-[#062F31]">{t.addressLabel}</strong>{' '}
                      {isBn ? currentMapChamber.address_bn : currentMapChamber.address_en}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock3 className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      <strong className="text-[#062F31]">{t.scheduleLabel}</strong>{' '}
                      {isBn ? currentMapChamber.schedule_bn : currentMapChamber.schedule_en}
                    </span>
                  </div>

                  {(isBn ? currentMapChamber.assistant_bn : currentMapChamber.assistant_en) && (
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                        <UserCheck className="w-3.5 h-3.5" />
                      </div>
                      <span>
                        <strong className="text-[#062F31]">{t.assistantLabel}</strong>{' '}
                        {isBn ? currentMapChamber.assistant_bn : currentMapChamber.assistant_en}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5 pt-1">
                    <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                    </div>
                    <span>
                      <strong className="text-[#062F31]">{t.serialInfo}</strong>{' '}
                      <a
                        href={`tel:${currentMapChamber.phone_raw}`}
                        className="font-bold text-base text-[var(--teal)] hover:underline"
                      >
                        {isBn
                          ? currentMapChamber.phone_display_bn
                          : currentMapChamber.phone_display_en}
                      </a>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-2.5">
                <a
                  href={currentMapChamber.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-p flex-1 py-3 text-xs font-bold text-center justify-center flex items-center gap-1.5 group/mapbtn"
                >
                  <Navigation2 className="w-3.5 h-3.5 group-hover/mapbtn:rotate-12 transition-transform" />
                  <span>{t.openMaps}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </a>
                <a
                  href={currentMapChamber.wa_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-g flex-1 py-3 text-xs font-bold text-center justify-center flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Embedded Live Map Right (7 cols) */}
            <div className="lg:col-span-7 w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-[rgba(43,179,177,0.3)] shadow-inner">
              <iframe
                title={`Map for ${isBn ? currentMapChamber.name_bn : currentMapChamber.name_en}`}
                src={currentMapChamber.embed_url}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* Patient Consultation Guidelines */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white border-t border-[rgba(43,179,177,0.18)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="font-heading font-extrabold text-2xl text-[#062F31]">
              {t.instructionsTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-[var(--tint)]/50 border border-[rgba(43,179,177,0.25)] flex flex-col gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white text-[var(--teal)] border border-[rgba(43,179,177,0.3)] shadow-xs flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[var(--teal)]" />
              </div>
              <h4 className="font-heading font-bold text-base text-[#062F31]">
                {t.step1Title}
              </h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {t.step1Desc}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--tint)]/50 border border-[rgba(43,179,177,0.25)] flex flex-col gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white text-[var(--teal)] border border-[rgba(43,179,177,0.3)] shadow-xs flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-[var(--teal)]" />
              </div>
              <h4 className="font-heading font-bold text-base text-[#062F31]">
                {t.step2Title}
              </h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {t.step2Desc}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--tint)]/50 border border-[rgba(43,179,177,0.25)] flex flex-col gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white text-[var(--teal)] border border-[rgba(43,179,177,0.3)] shadow-xs flex items-center justify-center">
                <Clock3 className="w-5 h-5 text-[var(--teal)]" />
              </div>
              <h4 className="font-heading font-bold text-base text-[#062F31]">
                {t.step3Title}
              </h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {t.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer
        settings={settings}
        categories={categories}
        chambers={chambers}
        onBookClick={() => setModalOpen(true)}
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
