'use client';

import React, { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Chamber } from '@/types/database';
import { toBengaliDigits } from '@/lib/format-utils';
import {
  X,
  PhoneCall,
  PhoneForwarded,
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
  CheckCircle2,
} from 'lucide-react';

function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  chambers?: Chamber[];
  whatsappUrl?: string;
}

export function AppointmentModal({
  isOpen,
  onClose,
  chambers,
  whatsappUrl = 'https://wa.me/8801670879100',
}: AppointmentModalProps) {
  const { lang, isBn } = useLanguage();

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const t = {
    en: {
      badge: 'Dr. Fahim Foysal Kollol · Serial & Consultation',
      title: 'Book Serial & Direct Contact',
      subtitle:
        'Select your preferred chamber below to call directly or message on WhatsApp to confirm your patient serial promptly.',
      close: 'Close',
      callBtn: 'Call Now',
      whatsappBtn: 'WhatsApp Serial',
      viewMap: 'View on Google Maps',
      emergencyTitle: 'Direct Contact with Doctor (Emergency Purpose)',
      emergencySubtitle:
        'For urgent medical concerns or direct emergency consultation with Dr. Fahim Foysal Kollol.',
      emergencyWaBtn: 'Direct WhatsApp to Doctor',
      emergencyCallBtn: 'Direct Emergency Call',
      serialInfo: 'Info & Serial:',
      assistantLabel: 'Personal Assistant:',
      scheduleLabel: 'Visiting Hours:',
      addressLabel: 'Address:',
      doctorDirectLabel: "Doctor's Direct Mobile:",
      statusActive: 'Active',
      hours247: '24/7 WhatsApp',
      chamberIndexPrefix: '#',
      tipTitle: 'Quick Serial Tip:',
      tipText:
        'When messaging on WhatsApp, simply provide the Patient Name, Age, Problem summary, and preferred Date. Our assistant will confirm the serial number promptly.',
      emergencyBadge: 'Emergency Contact',
    },
    bn: {
      badge: 'ডাঃ ফাহিম ফয়সাল কল্লোল · সিরিয়াল ও কনসালটেশন',
      title: 'সিরিয়াল বুকিং ও সরাসরি যোগাযোগ',
      subtitle:
        'আপনার সুবিধাজনক চেম্বার নির্বাচন করে সরাসরি ফোন করুন অথবা WhatsApp-এ মেসেজ দিয়ে সহজেই সিরিয়াল নিশ্চিত করুন।',
      close: 'বন্ধ করুন',
      callBtn: 'কল করুন',
      whatsappBtn: 'WhatsApp-এ সিরিয়াল নিন',
      viewMap: 'গুগল ম্যাপে লোকেশন দেখুন',
      emergencyTitle: 'সরাসরি ডাক্তারের সাথে যোগাযোগ (জরুরি প্রয়োজনে)',
      emergencySubtitle:
        'যেকোনো জরুরি চিকিৎসাজনিত প্রয়োজনে সরাসরি ডাঃ ফাহিম ফয়সাল কল্লোল স্যারের সাথে WhatsApp বা ফোনে কথা বলুন।',
      emergencyWaBtn: 'ডাক্তারকে সরাসরি WhatsApp',
      emergencyCallBtn: 'জরুরি সরাসরি কল',
      serialInfo: 'তথ্য ও সিরিয়াল:',
      assistantLabel: 'ব্যক্তিগত সহকারী:',
      scheduleLabel: 'সময়সূচি:',
      addressLabel: 'ঠিকানা:',
      doctorDirectLabel: 'ডাক্তারের সরাসরি নম্বর:',
      statusActive: 'সক্রিয়',
      hours247: '২৪/৭ WhatsApp',
      chamberIndexPrefix: '#',
      tipTitle: 'সহজে সিরিয়াল পাওয়ার উপায়:',
      tipText:
        'WhatsApp-এ মেসেজ দেওয়ার সময় রোগীর নাম, বয়স, সমস্যার বিবরণ ও যে তারিখে দেখাতে চান তা লিখে পাঠালে দ্রুত সিরিয়াল নম্বর নিশ্চিত করা হবে।',
      emergencyBadge: 'জরুরি সেবা',
    },
  }[lang];

  // Specific data for the 3 chambers: Sherpur 1, Sherpur 2, Mymensingh
  const chamberCards = [
    {
      id: 'sherpur-healthcare',
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
      map_url:
        'https://www.google.com/maps/search/?api=1&query=Health+Care+Pvt+Hospital%2C+Hospital+Road%2C+Sherpur&query_place_id=ChIJO6EZbULXVzcRKDpZy_ERMTI',
      wa_url: `https://wa.me/8801671869026?text=${encodeURIComponent(
        isBn
          ? 'আসসালামু আলাইকুম মিলন ভাই। আমি শেরপুর হেলথ কেয়ার হাসপাতালে ডাঃ কল্লোল স্যারের বৃহস্পতিবারের সিরিয়াল নিতে চাই।\nরোগীর নাম:\nবয়স:\nসমস্যা:'
          : 'Hello Milon, I want to book a Thursday serial for Dr. Kollol at Health Care Hospital, Sherpur.\nPatient Name:\nAge:\nProblem:'
      )}`,
      tagColor: 'from-[#0B6E73] to-[#148388]',
    },
    {
      id: 'sherpur-amjad',
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
      map_url: 'https://www.google.com/maps?q=25.01915%2C90.02275',
      wa_url: `https://wa.me/8801671869026?text=${encodeURIComponent(
        isBn
          ? 'আসসালামু আলাইকুম মিলন ভাই। আমি শেরপুর আমজাদ ডায়াগনস্টিক সেন্টারে ডাঃ কল্লোল স্যারের শুক্রবারের সিরিয়াল নিতে চাই।\nরোগীর নাম:\nবয়স:\nসমস্যা:'
          : 'Hello Milon, I want to book a Friday serial for Dr. Kollol at Amjad Diagnostic Center, Sherpur.\nPatient Name:\nAge:\nProblem:'
      )}`,
      tagColor: 'from-[#0B6E73] to-[#1a9399]',
    },
    {
      id: 'mymensingh-medicare',
      badge_en: 'Mymensingh · Saturday to Tuesday',
      badge_bn: 'ময়মনসিংহ · প্রতি শনি থেকে মঙ্গলবার',
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
      map_url:
        'https://www.google.com/maps/search/?api=1&query=New+Medicare+Pathology+Lab%2C+Charpara%2C+Mymensingh&query_place_id=ChIJEZk4RglPVjcR9KoUp46judc',
      wa_url: `https://wa.me/8801750529252?text=${encodeURIComponent(
        isBn
          ? 'আসসালামু আলাইকুম। আমি ময়মনসিংহ নিউ মেডিকেয়ার প্যাথলজি ল্যাব চেম্বারে ডাঃ কল্লোল স্যারের সিরিয়াল নিতে চাই।\nরোগীর নাম:\nবয়স:\nসমস্যা:\nতারিখ:'
          : 'Hello, I would like to book an appointment with Dr. Kollol at New Medicare Pathology Lab, Mymensingh.\nPatient Name:\nAge:\nProblem:\nPreferred Date:'
      )}`,
      tagColor: 'from-[#0B6E73] to-[#2BB3B1]',
    },
  ];

  const emergencyDoctorCard = {
    phone_display_en: '01670-879100',
    phone_display_bn: '০১৬৭০-৮৭৯১০০',
    phone_raw: '01670879100',
    wa_url: `https://wa.me/8801670879100?text=${encodeURIComponent(
      isBn
        ? 'আসসালামু আলাইকুম ডাঃ ফাহিম ফয়সাল কল্লোল স্যার। জরুরি চিকিৎসাজনিত প্রয়োজনে আপনার সাথে WhatsApp-এ যোগাযোগ করছি।\nরোগীর নাম:\nসমস্যা:'
        : 'Hello Dr. Fahim Foysal Kollol, contacting you for urgent surgical consultation/emergency.\nPatient Name:\nProblem:'
    )}`,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-[var(--aqua)]/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="relative px-6 py-5 sm:px-8 sm:py-6 bg-gradient-to-r from-[#062F31] via-[#0B6E73] to-[#135A5E] text-white flex items-start justify-between gap-4">
          <div className="pr-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold text-[#8AE1DF] backdrop-blur-sm mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2BB3B1]" />
              {t.badge}
            </span>
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
              {t.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#D4EEEE] mt-1 max-w-2xl leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 shrink-0 rounded-full bg-white/10 hover:bg-white/25 text-white grid place-items-center transition-all cursor-pointer border border-white/20"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body: 4 Cards */}
        <div className="p-4 sm:p-6 lg:p-7 overflow-y-auto space-y-5 bg-[#F8FCFC]">
          {/* Grid of 4 Cards: 3 Chambers + 1 Direct Doctor Emergency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Cards 1, 2, 3: Physical Chambers */}
            {chamberCards.map((ch, idx) => (
              <div
                key={ch.id}
                className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white border border-[#0B6E73]/15 shadow-sm hover:shadow-md hover:border-[#2BB3B1] transition-all duration-300"
              >
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#EEF7F6] text-[#0B6E73] border border-[#2BB3B1]/25">
                      <CalendarDays className="w-3.5 h-3.5 text-[#2BB3B1]" />
                      {isBn ? ch.badge_bn : ch.badge_en}
                    </span>
                    <span className="text-[10px] font-bold text-[#0B6E73]/70 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200/60 uppercase tracking-wider">
                      {t.chamberIndexPrefix}
                      {isBn ? toBengaliDigits(idx + 1) : idx + 1}
                    </span>
                  </div>

                  {/* Chamber Name Header */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200/60 flex items-center justify-center shrink-0 mt-0.5 text-[#0B6E73]">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <h4 className="font-heading font-extrabold text-base sm:text-lg text-[#062F31] leading-snug">
                      {isBn ? ch.name_bn : ch.name_en}
                    </h4>
                  </div>

                  {/* Details List with modern icon micro-containers */}
                  <div className="mt-3.5 space-y-2.5 text-xs text-[#062F31]/80">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-[#EEF7F6] text-[#0B6E73] flex items-center justify-center shrink-0 mt-0.5">
                        <MapPinned className="w-3.5 h-3.5 text-[#2BB3B1]" />
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

                    <div className="flex items-start gap-2.5 pt-0.5">
                      <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                      <span className="leading-relaxed">
                        <strong className="text-[#062F31]">{t.serialInfo}</strong>{' '}
                        <a
                          href={`tel:${ch.phone_raw}`}
                          className="font-bold text-base text-[#0B6E73] hover:underline tracking-tight"
                        >
                          {isBn ? ch.phone_display_bn : ch.phone_display_en}
                        </a>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${ch.phone_raw}`}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0B6E73] hover:bg-[#062F31] text-white text-xs font-bold transition-all shadow-sm active:scale-98"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-white" />
                      <span className="text-white font-bold">{t.callBtn}</span>
                    </a>

                    <a
                      href={ch.wa_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0B6E73] hover:bg-[#062F31] text-white text-xs font-bold transition-all shadow-sm active:scale-98"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                      <span className="text-white font-bold">WhatsApp</span>
                    </a>
                  </div>

                  <a
                    href={ch.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-[#0B6E73] hover:text-[#062F31] py-1 transition-colors group/map"
                  >
                    <Navigation2 className="w-3 h-3 text-[#2BB3B1] group-hover/map:rotate-12 transition-transform" />
                    <span>{t.viewMap}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-60" />
                  </a>
                </div>
              </div>
            ))}

            {/* Card 4: Doctor Direct Emergency Contact (Special Emergency Styling) */}
            <div className="relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/70 border-2 border-emerald-500/40 shadow-md hover:shadow-lg transition-all duration-300">
              <div>
                {/* Emergency Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                    {t.emergencyBadge}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    {t.hours247}
                  </span>
                </div>

                {/* Emergency Heading Header */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <h4 className="font-heading font-extrabold text-base sm:text-lg text-[#062F31] leading-snug">
                    {t.emergencyTitle}
                  </h4>
                </div>

                <p className="text-xs text-[#062F31]/75 mt-2.5 leading-relaxed pl-9.5">
                  {t.emergencySubtitle}
                </p>

                <div className="mt-4 p-3 rounded-xl bg-white/90 border border-emerald-200 shadow-inner flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center shadow-xs">
                      <PhoneCall className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#0B6E73] uppercase tracking-wider block">
                        {t.doctorDirectLabel}
                      </span>
                      <a
                        href={`tel:${emergencyDoctorCard.phone_raw}`}
                        className="font-heading font-extrabold text-base sm:text-lg text-emerald-900 tracking-tight hover:underline"
                      >
                        {isBn
                          ? emergencyDoctorCard.phone_display_bn
                          : emergencyDoctorCard.phone_display_en}
                      </a>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    {t.statusActive}
                  </span>
                </div>
              </div>

              {/* Action Buttons for Doctor Card */}
              <div className="mt-5 pt-4 border-t border-emerald-100 flex flex-col gap-2">
                <a
                  href={emergencyDoctorCard.wa_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0B6E73] hover:bg-[#062F31] text-white text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-98"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span className="text-white font-bold">{t.emergencyWaBtn}</span>
                </a>

                <a
                  href={`tel:${emergencyDoctorCard.phone_raw}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0B6E73] hover:bg-[#062F31] text-white text-xs font-bold transition-all shadow-sm active:scale-98 text-center"
                >
                  <PhoneForwarded className="w-3.5 h-3.5 text-white" />
                  <span className="text-white font-bold">
                    {t.emergencyCallBtn} (
                    {isBn
                      ? emergencyDoctorCard.phone_display_bn
                      : emergencyDoctorCard.phone_display_en}
                    )
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Helpful Note */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#2BB3B1]/20 flex items-start gap-3 text-xs text-[#062F31]/80">
            <CheckCircle2 className="w-4 h-4 text-[#0B6E73] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#062F31] font-bold mr-1">{t.tipTitle}</strong>
              <span>{t.tipText}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
