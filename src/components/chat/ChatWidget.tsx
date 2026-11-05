'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X, Send, Phone, RotateCcw, ExternalLink, MessageSquare, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  actions?: Array<{
    label: string;
    url?: string;
    type?: 'call' | 'link' | 'booking';
  }>;
}

// ----------------------------------------------------------------------------------
// INLINE & BLOCK MARKDOWN PARSER (Renders **bold**, *italic*, [link], lists, headers)
// ----------------------------------------------------------------------------------

function parseInlineMarkdown(text: string, isUser: boolean = false): React.ReactNode[] {
  // Regex to match **bold**, *italic*, [link text](url)
  const regex = /(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong
          key={idx}
          className={`font-bold ${isUser ? 'text-white underline decoration-white/40' : 'text-[#062F31] font-semibold'}`}
        >
          {boldText}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const italicText = part.slice(1, -1);
      return (
        <em key={idx} className={`italic ${isUser ? 'text-teal-100' : 'text-[#0B6E73]'}`}>
          {italicText}
        </em>
      );
    }

    // Link: [label](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      const isExternal = url.startsWith('http');
      return (
        <a
          key={idx}
          href={url}
          target={isExternal ? '_blank' : '_self'}
          rel={isExternal ? 'noreferrer' : undefined}
          className={`underline underline-offset-2 font-semibold transition-colors ${
            isUser ? 'text-teal-100 hover:text-white' : 'text-[#0B6E73] hover:text-[#2BB3B1]'
          }`}
        >
          {label}
        </a>
      );
    }

    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function FormattedMessageText({ text, isUser }: { text: string; isUser?: boolean }) {
  if (!text) return null;

  if (isUser) {
    return <p className="whitespace-pre-line select-text text-white">{parseInlineMarkdown(text, true)}</p>;
  }

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ol' | 'ul'; items: React.ReactNode[] } | null = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ol') {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-1.5 space-y-1.5 pl-0.5 list-none">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-xs leading-relaxed text-[#062F31]">
                <span className="font-bold text-[#0B6E73] shrink-0 text-[11px] mt-0.5 min-w-[16px]">
                  {idx + 1}.
                </span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-1.5 space-y-1 pl-1 list-none">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-xs leading-relaxed text-[#062F31]">
                <span className="text-[#2BB3B1] font-bold shrink-0 text-sm leading-none mt-0.5">
                  •
                </span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        );
      }
      currentList = null;
    }
  };

  lines.forEach((rawLine, lineIdx) => {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList();
      elements.push(<div key={`spacer-${lineIdx}`} className="h-1" />);
      return;
    }

    // Heading: ### or ## or #
    if (trimmed.startsWith('#')) {
      flushList();
      const headingText = trimmed.replace(/^#+\s*/, '');
      elements.push(
        <h4
          key={`h-${lineIdx}`}
          className="font-bold text-[#062F31] text-[13px] mt-2 mb-1 tracking-tight"
        >
          {parseInlineMarkdown(headingText, false)}
        </h4>
      );
      return;
    }

    // Numbered list item: e.g. "1. **Anwer Memorial...**" or "1) Title"
    const olMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(parseInlineMarkdown(olMatch[2], false));
      return;
    }

    // Bullet list item: e.g. "- Friday: 9am" or "* text" or "• text"
    const ulMatch = trimmed.match(/^[\-\*\•]\s+(.*)/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(parseInlineMarkdown(ulMatch[1], false));
      return;
    }

    // Regular line / paragraph
    flushList();
    elements.push(
      <p key={`p-${lineIdx}`} className="leading-relaxed text-xs text-[#062F31]">
        {parseInlineMarkdown(rawLine, false)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1 select-text">{elements}</div>;
}

// ----------------------------------------------------------------------------------
// 3 QUESTION BUBBLES (float above the launcher; tap = open chat + instant answer, no AI call)
// Every answer ends in "book a serial / call". Approved wording 2026-10-20.
// ----------------------------------------------------------------------------------

interface QuickChipItem {
  id: string;
  isHoverFeatured?: boolean;
  label_en: string;
  label_bn: string;
  answer_en: string;
  answer_bn: string;
  actions: Array<{
    label: string;
    url: string;
    type: 'call' | 'link' | 'booking';
  }>;
}

const QUICK_CHIPS: QuickChipItem[] = [
  {
    id: 'serial',
    isHoverFeatured: true,
    label_en: 'How do I book a serial?',
    label_bn: 'সিরিয়াল কীভাবে নেব?',
    answer_en:
      'To book a serial, please contact:\n• Personal Assistant Milon: 01671-869026 (Sherpur Chamber 1: Health Care Hospital / Chamber 2: Amjad Diagnostic)\n• Serial Hotline: 01750-529252 (Mymensingh Chamber: New Medicare Pathology Lab)\n• Doctor Direct WhatsApp (emergency): 01670-879100',
    answer_bn:
      'সিরিয়ালের জন্য সরাসরি যোগাযোগ করুন:\n• **ব্যক্তিগত সহকারী মিলন:** 01671-869026 (শেরপুর চেম্বার ১: হেলথ কেয়ার হাসপাতাল / শেরপুর চেম্বার ২: আমজাদ ডায়াগনস্টিক)\n• **সিরিয়াল ও তথ্য হটলাইন:** 01750-529252 (ময়মনসিংহ চেম্বার: নিউ মেডিকেয়ার প্যাথলজি ল্যাব)\n• **ডাক্তারকে সরাসরি WhatsApp (জরুরি প্রয়োজনে):** 01670-879100',
    actions: [
      { label: 'ব্যক্তিগত সহকারী মিলন (শেরপুর)', url: 'tel:01671869026', type: 'call' },
      { label: 'সিরিয়াল হটলাইন (ময়মনসিংহ)', url: 'tel:01750529252', type: 'call' },
      { label: 'ডাক্তারকে সরাসরি WhatsApp', url: 'https://wa.me/8801670879100', type: 'link' },
    ],
  },
  {
    id: 'chambers',
    isHoverFeatured: true,
    label_en: 'Chambers & Schedule',
    label_bn: 'চেম্বারের স্থান ও সময়সূচী',
    answer_en:
      'Dr. Kollol consults regularly at:\n1. **Sherpur Chamber 1 (Health Care Hospital):** Every Thursday 4:00 PM – 9:00 PM (Assistant Milon: 01671-869026)\n2. **Sherpur Chamber 2 (Amjad Diagnostic Center):** Every Friday 11:00 AM – 9:00 PM (Assistant Milon: 01671-869026)\n3. **Mymensingh Chamber (New Medicare Pathology Lab):** Every Saturday to Tuesday 3:30 PM – 8:00 PM (Hotline: 01750-529252)',
    answer_bn:
      'ডাঃ কল্লোল নিয়মিত চেম্বার করেন:\n\n1. **শেরপুর চেম্বার ১ (হেলথ কেয়ার হাসপাতাল):** প্রতি বৃহস্পতিবার বিকাল ৪.০০টা – রাত ৯.০০টা (সহকারী মিলন: 01671-869026)\n2. **শেরপুর চেম্বার ২ (আমজাদ ডায়াগনস্টিক সেন্টার):** প্রতি শুক্রবার সকাল ১১.০০টা – রাত ৯.০০টা (সহকারী মিলন: 01671-869026)\n3. **ময়মনসিংহ চেম্বার (নিউ মেডিকেয়ার প্যাথলজি ল্যাব):** প্রতি শনি থেকে মঙ্গলবার বিকাল ৩.৩০টা – রাত ৮.০০টা (সিরিয়াল: 01750-529252)',
    actions: [
      { label: 'সহকারী মিলন (শেরপুর)', url: 'tel:01671869026', type: 'call' },
      { label: 'সিরিয়াল হটলাইন (ময়মনসিংহ)', url: 'tel:01750529252', type: 'call' },
      { label: 'চেম্বারের বিস্তারিত · Details', url: '/#chambers', type: 'link' },
    ],
  },
  {
    id: 'treats',
    isHoverFeatured: true,
    label_en: 'What conditions are treated?',
    label_bn: 'কোন কোন রোগের চিকিৎসা করেন?',
    answer_en:
      'Dr. Kollol is a General, Laparoscopic, Breast & Colorectal Surgeon — piles, fistula, fissure, gallstones, appendicitis, hernia, breast lumps, kidney stones, varicocele and other surgical problems. Book a visit for your problem.',
    answer_bn:
      'ডাঃ কল্লোল জেনারেল, ল্যাপারোস্কপিক, ব্রেস্ট ও কলোরেক্টাল সার্জন। পাইলস, ফিস্টুলা, ফিশার, পিত্তথলির পাথর, অ্যাপেন্ডিসাইটিস, হার্নিয়া, স্তনের চাকা, কিডনির পাথর, ভ্যারিকোসিলসহ নানা সার্জিক্যাল সমস্যার চিকিৎসা করেন। আপনার সমস্যার জন্য সরাসরি দেখিয়ে নিন।',
    actions: [
      { label: 'সিরিয়াল হটলাইন (ময়মনসিংহ)', url: 'tel:01750529252', type: 'call' },
      { label: 'সহকারী মিলন (শেরপুর)', url: 'tel:01671869026', type: 'call' },
    ],
  },
  {
    id: 'piles',
    label_en: 'Do piles always need surgery?',
    label_bn: 'পাইলস হলে কি অপারেশন লাগবেই?',
    answer_en:
      'Whether surgery is needed is hard to say without examining you. The most important step is to meet the doctor in person. Book a serial — Dr. Kollol will do his best to solve your problem.',
    answer_bn:
      'অপারেশন লাগবে কি না, তা রোগীকে সরাসরি না দেখে বলা খুবই মুশকিল। সবচেয়ে জরুরি হলো ডাক্তারের সাথে সামনাসামনি দেখা করে আপনার সমস্যা বলা। সিরিয়াল নিয়ে দেখা করুন, ডাঃ কল্লোল আপনার সমস্যার সমাধানের সর্বোচ্চ চেষ্টা করবেন।',
    actions: [
      { label: 'সিরিয়াল হটলাইন (ময়মনসিংহ)', url: 'tel:01750529252', type: 'call' },
      { label: 'সহকারী মিলন (শেরপুর)', url: 'tel:01671869026', type: 'call' },
    ],
  },
  {
    id: 'bleeding',
    label_en: 'Bleeding with stool',
    label_bn: 'পায়খানার সাথে রক্ত যায়',
    answer_en:
      'Bleeding can have many causes — hard to say without seeing you. Don’t delay; book a serial and meet the doctor in person.',
    answer_bn:
      'রক্ত যাওয়ার কারণ অনেক রকম হতে পারে, রোগী না দেখে বলা মুশকিল। দেরি না করে সিরিয়াল নিয়ে ডাক্তারের সাথে সরাসরি দেখা করুন এবং আপনার সমস্যার কথা বলুন।',
    actions: [
      { label: 'সিরিয়াল হটলাইন (ময়মনসিংহ)', url: 'tel:01750529252', type: 'call' },
      { label: 'সহকারী মিলন (শেরপুর)', url: 'tel:01671869026', type: 'call' },
    ],
  },
  {
    id: 'fistula',
    label_en: 'Can fistula recur?',
    label_bn: 'ফিস্টুলা কি আবার হতে পারে?',
    answer_en:
      'It’s not possible to say for your case without an examination. Book a serial and meet Dr. Kollol — he’ll do his best for you.',
    answer_bn:
      'আপনার ক্ষেত্রে কী হবে, তা পরীক্ষা না করে বলা সম্ভব নয়। সিরিয়াল নিয়ে ডাঃ কল্লোলের সাথে সরাসরি দেখা করুন, তিনি আপনার সমস্যার সমাধানের সর্বোচ্চ চেষ্টা করবেন।',
    actions: [
      { label: 'সিরিয়াল হটলাইন (ময়মনসিংহ)', url: 'tel:01750529252', type: 'call' },
      { label: 'সহকারী মিলন (শেরপুর)', url: 'tel:01671869026', type: 'call' },
    ],
  },
  {
    id: 'anal_pain',
    label_en: 'Anal burning & pain',
    label_bn: 'মলদ্বারে জ্বালাপোড়া ও ব্যথা',
    answer_en:
      'The cause of this pain is hard to tell without seeing you. Book a serial and tell the doctor in person.',
    answer_bn:
      'এমন ব্যথার কারণ রোগী না দেখে বোঝা মুশকিল। সিরিয়াল নিয়ে ডাক্তারের সাথে সামনাসামনি দেখা করে সমস্যাটা বলুন, তিনি সমাধানের সর্বোচ্চ চেষ্টা করবেন।',
    actions: [
      { label: 'সিরিয়াল হটলাইন (ময়মনসিংহ)', url: 'tel:01750529252', type: 'call' },
      { label: 'সহকারী মিলন (শেরপুর)', url: 'tel:01671869026', type: 'call' },
    ],
  },
  {
    id: 'gallstones',
    label_en: 'Gallstones treatment',
    label_bn: 'পিত্তথলিতে পাথর',
    answer_en:
      'The right treatment depends on examining you and your reports. Book a serial and meet the doctor.',
    answer_bn:
      'কোন চিকিৎসা আপনার জন্য ঠিক, তা আপনাকে দেখে আর রিপোর্ট দেখে বলতে হবে। সিরিয়াল নিয়ে ডাক্তারের সাথে সরাসরি দেখা করুন।',
    actions: [
      { label: 'সিরিয়াল হটলাইন (ময়মনসিংহ)', url: 'tel:01750529252', type: 'call' },
      { label: 'সহকারী মিলন (শেরপুর)', url: 'tel:01671869026', type: 'call' },
    ],
  },
  {
    id: 'laparoscopy',
    label_en: 'What is laparoscopy?',
    label_bn: 'ল্যাপারোস্কপি কী?',
    answer_en:
      'Laparoscopy is keyhole surgery with a camera — but whether it suits you, the doctor will decide after seeing you. Book a serial.',
    answer_bn:
      'ল্যাপারোস্কপি হলো ছোট ছিদ্রে ক্যামেরার সাহায্যে অপারেশন। তবে আপনার জন্য এটা উপযুক্ত কি না, তা ডাক্তার সরাসরি দেখে বলবেন। সিরিয়াল নিয়ে দেখা করুন।',
    actions: [
      { label: 'সিরিয়াল হটলাইন (ময়মনসিংহ)', url: 'tel:01750529252', type: 'call' },
      { label: 'সহকারী মিলন (শেরপুর)', url: 'tel:01671869026', type: 'call' },
    ],
  },
  {
    id: 'hernia',
    label_en: 'Hernia (groin/navel swelling)',
    label_bn: 'হার্নিয়া (কুঁচকি বা নাভিতে ফোলা)',
    answer_en:
      'The cause of a bulge can’t be confirmed without seeing you — book a serial. If it suddenly becomes hard or very painful, go to hospital at once.',
    answer_bn:
      'ফোলার কারণ রোগী না দেখে নিশ্চিত বলা যায় না। সিরিয়াল নিয়ে ডাক্তারের সাথে সরাসরি দেখা করুন। ফোলা হঠাৎ শক্ত বা খুব ব্যথা হলে দেরি না করে হাসপাতালে যান।',
    actions: [
      { label: 'সিরিয়াল হটলাইন (ময়মনসিংহ)', url: 'tel:01750529252', type: 'call' },
      { label: 'সহকারী মিলন (শেরপুর)', url: 'tel:01671869026', type: 'call' },
    ],
  },
  {
    id: 'breast_lump',
    label_en: 'Breast lump',
    label_bn: 'স্তনে চাকা',
    answer_en:
      'What kind of lump it is can’t be said without an examination. Book a serial and see the doctor as soon as possible.',
    answer_bn:
      'চাকা কী ধরনের, তা রোগী না দেখে বলা সম্ভব নয়। যত দ্রুত সম্ভব সিরিয়াল নিয়ে ডাক্তারের সাথে সরাসরি দেখা করুন।',
    actions: [
      { label: 'সিরিয়াল হটলাইন (ময়মনসিংহ)', url: 'tel:01750529252', type: 'call' },
      { label: 'সহকারী মিলন (শেরপুর)', url: 'tel:01671869026', type: 'call' },
    ],
  },
  {
    id: 'chamber_prep',
    label_en: 'What to bring to chamber?',
    label_bn: 'চেম্বারে কী নিয়ে আসব?',
    answer_en:
      'Bring your old prescriptions, any test reports and the list of medicines you take — if you have them. Call for a serial.',
    answer_bn:
      'আগের প্রেসক্রিপশন, বিভিন্ন পরীক্ষার রিপোর্ট আর যে ওষুধ খাচ্ছেন তার তালিকা, যদি থাকে, সাথে আনুন। সিরিয়ালের জন্য কল করুন।',
    actions: [
      { label: 'সিরিয়াল হটলাইন (ময়মনসিংহ)', url: 'tel:01750529252', type: 'call' },
      { label: 'সহকারী মিলন (শেরপুর)', url: 'tel:01671869026', type: 'call' },
    ],
  },
];

export function ChatWidget() {
  const { lang, isBn } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // iOS Safari Virtual Keyboard & Mobile Responsive State
  const [visualHeight, setVisualHeight] = useState<number | null>(null);
  const [visualTop, setVisualTop] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const updateDimensions = () => {
      const mobile = typeof window !== 'undefined' && window.innerWidth < 640;
      setIsMobile(mobile);
      if (mobile && window.visualViewport) {
        setVisualHeight(window.visualViewport.height);
        setVisualTop(window.visualViewport.offsetTop);
      } else {
        setVisualHeight(null);
        setVisualTop(0);
      }
    };

    updateDimensions();

    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (vv) {
      vv.addEventListener('resize', updateDimensions);
      vv.addEventListener('scroll', updateDimensions);
    }
    window.addEventListener('resize', updateDimensions);

    return () => {
      if (vv) {
        vv.removeEventListener('resize', updateDimensions);
        vv.removeEventListener('scroll', updateDimensions);
      }
      window.removeEventListener('resize', updateDimensions);
    };
  }, [isOpen]);

  // Lock background scroll on mobile when chat is open
  useEffect(() => {
    if (isOpen && isMobile) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, isMobile]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Welcome Message
  useEffect(() => {
    const welcomeText = isBn
      ? 'আসসালামু আলাইকুম। আমি **ডাঃ ফাহিম ফয়সাল কল্লোলের** সহকারী।\n\nআসলে রোগী সরাসরি না দেখে তো অনুমান করে সঠিক কারণ বা চিকিৎসার পরামর্শ দেওয়া যায় না। তাই ডক্টর নিজে পরীক্ষা করে দেখলে সবচেয়ে ভালো ও নিরাপদ হয়। আপনার যেকোনো তথ্যের জন্য নিচে বিষয় বেছে নিন অথবা সরাসরি মেসেজ দিন।'
      : "Hello! I am **Dr. Fahim Foysal Kollol's** assistant.\n\nAn in-person consultation is always best for safe medical care. Please choose a topic below or type your message.";

    setMessages([
      {
        id: 'welcome_1',
        sender: 'bot',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [isBn]);

  // Auto-scroll on new message and when keyboard pops up
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen, isTyping, visualHeight]);

  // Focus input when opened and update scroll state
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setHasInteracted(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  // Handle Question Bubbles (Instant, zero API call) — opens the chat with that question
  const handleChipClick = (chip: (typeof QUICK_CHIPS)[0]) => {
    setIsOpen(true);
    const userText = isBn ? chip.label_bn : chip.label_en;
    const botAnswer = isBn ? chip.answer_bn : chip.answer_en;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: 'user_' + Date.now(),
        sender: 'user',
        text: userText,
        timestamp: now,
      },
      {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        text: botAnswer,
        timestamp: now,
        // labels are written 'বাংলা · English' — show only the active language
        actions: chip.actions.map((a) => ({ ...a, label: a.label.split(' · ')[isBn ? 0 : 1] ?? a.label })),
      },
    ]);
  };

  // Handle Free Typing Message through Google Gemini AI
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputText.trim();
    if (!query || isTyping) return;

    setInputText('');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add user message
    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Build brief conversation history (excluding initial static welcome message)
      const history = messages
        .filter((m) => !m.id.startsWith('welcome'))
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          text: m.text,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory: history,
        }),
      });

      const data = await res.json();
      const replyText =
        data.reply ||
        (isBn
          ? 'ধন্যবাদ। সরাসরি সিরিয়াল বা তথ্যের জন্য কল করুন: **01750529252**।'
          : 'Thank you. For direct assistance, please call: **01750529252**.');

      setMessages((prev) => [
        ...prev,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions:
            data.actions && data.actions.length > 0
              ? data.actions
              : [
                  { label: isBn ? 'সিরিয়াল হটলাইন (কল)' : 'Serial Hotline', url: 'tel:01750529252', type: 'call' },
                ],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: isBn
            ? 'নেটওয়ার্ক সংযোগে সমস্যা হচ্ছে। জরুরি তথ্যে সরাসরি সিরিয়াল নম্বরে কল করুন: **01750529252**।'
            : 'Connection timeout. Please contact Dr. Kollol directly at: **01750529252**.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    const welcomeText = isBn
      ? 'আসসালামু আলাইকুম। আমি **ডাঃ ফাহিম ফয়সাল কল্লোলের** সহকারী। আসলে রোগী না দেখে তো অনুমান করে চিকিৎসা বা উত্তর দেওয়া যায় না। আপনার যেকোনো তথ্য বা সিরিয়ালের জন্য আমি কীভাবে সহায়তা করতে পারি?'
      : "Hello! I am **Dr. Fahim Foysal Kollol's** assistant. How may I help you today?";

    setMessages([
      {
        id: 'welcome_' + Date.now(),
        sender: 'bot',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Bubbles float in, stay ~14 s, then tuck away so they never cover page content (launcher stays)
  // Homepage only: the widget stays hidden during the hero video and appears once the
  // "Meet Your Surgeon" section (#doctor) reaches the screen. Every other page: always shown.
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [heroPassed, setHeroPassed] = useState(false);
  useEffect(() => {
    if (!isHome) return;
    const check = () => {
      const doc = document.getElementById('doctor');
      setHeroPassed(!!doc && doc.getBoundingClientRect().top <= window.innerHeight * 0.6);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [isHome]);
  const widgetVisible = !isHome || heroPassed || isOpen;

  // Laptop: the 3 questions + a 'click to chat' label appear only while the mouse is over the launcher.
  // Phone (no hover): one tap opens the chat; the questions then sit inside the chat window.

  return (
    <>
      {/* Question-bubbles launcher animations (design only) */}
      <style>{`
        @keyframes kqUp { from { opacity: 0; transform: translateY(12px) scale(.92); } to { opacity: 1; transform: none; } }
        @keyframes kqRing { 0% { opacity: .8; transform: scale(.95); } 100% { opacity: 0; transform: scale(1.35); } }
        @keyframes kqDot { 0%,60%,100% { transform: translateY(0); opacity: .45; } 30% { transform: translateY(-4px); opacity: 1; } }
        @keyframes kqOpen { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: none; } }
        .kq-bubble { opacity: 0; animation: kqUp .35s cubic-bezier(.2,1.3,.4,1) forwards; }
        .kq-ring::after { content: ''; position: absolute; inset: -5px; border-radius: 9999px; border: 2px solid rgba(43,179,177,.55); animation: kqRing 2.2s ease-out infinite; }
        .kq-dot { animation: kqDot 1.2s infinite; }
        .kq-panel { animation: kqOpen .3s cubic-bezier(.2,.8,.2,1); }
        @media (prefers-reduced-motion: reduce) { .kq-bubble, .kq-ring::after, .kq-dot, .kq-panel { animation: none !important; opacity: 1; } }
      `}</style>

      {/* ---------------------------------------------------------------------------------- */}
      {/* LAUNCHER: doctor avatar + 3 floating question bubbles */}
      {/* ---------------------------------------------------------------------------------- */}
      <aside
        aria-label="Medical AI Assistant"
        aria-hidden={!widgetVisible}
        className={`group fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 select-none flex flex-col items-end gap-2 transition-all duration-500 ${
          widgetVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        {!isOpen && (
          <div className="hidden group-hover:flex flex-col items-end gap-2 max-w-[78vw]">
            {QUICK_CHIPS.filter((c) => c.isHoverFeatured).map((chip, i) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleChipClick(chip)}
                style={{ animationDelay: `${i * 0.08}s` }}
                className="kq-bubble px-3.5 py-2.5 rounded-2xl rounded-br-md bg-white text-[#062F31] text-[13px] font-semibold text-left border border-[#2BB3B1]/30 shadow-[0_12px_26px_-16px_rgba(6,47,49,.55)] hover:border-[#2BB3B1] hover:text-[#0B6E73] transition-colors cursor-pointer"
              >
                {isBn ? chip.label_bn : chip.label_en}
              </button>
            ))}
          </div>
        )}

        {!isOpen && (
          <div className="relative">
          {/* hover label (laptop only — hidden on touch screens) */}
          <span className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 hidden group-hover:block whitespace-nowrap px-3.5 py-2 rounded-xl bg-[#0B6E73] text-white text-[12.5px] font-semibold shadow-[0_12px_26px_-14px_rgba(6,47,49,.6)]">
            {isBn ? 'ডাঃ কল্লোলের সহকারী · চ্যাট করতে ক্লিক করুন' : "Dr. Kollol's Assistant · Click to chat"}
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Dr. Kollol Clinical Assistant"
            className="kq-ring relative w-16 h-16 rounded-full p-1 bg-gradient-to-br from-[#2BB3B1] to-[#0B6E73] shadow-[0_14px_30px_-10px_rgba(11,110,115,.65)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <span className="relative block w-full h-full rounded-full overflow-hidden bg-[#EEF7F6]">
              <Image src="/img/doctor-v3.webp" alt="Dr. Kollol" fill className="object-cover object-top" sizes="56px" />
            </span>
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold grid place-items-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>
          </div>
        )}
      </aside>

      {/* ---------------------------------------------------------------------------------- */}
      {/* CHAT WINDOW DIALOG */}
      {/* ---------------------------------------------------------------------------------- */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Dr. Kollol Clinical Assistant Dialog"
          style={
            isMobile && visualHeight
              ? {
                  height: `${visualHeight}px`,
                  top: `${visualTop}px`,
                  bottom: 'auto',
                }
              : undefined
          }
          className="kq-panel fixed inset-0 z-50 flex flex-col bg-white overflow-hidden sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[390px] sm:h-[600px] sm:max-h-[85vh] sm:rounded-3xl sm:border sm:border-[#2BB3B1]/25 sm:shadow-[0_30px_70px_-30px_rgba(6,47,49,.55)]"
        >
          {/* Header */}
          <div className="px-4 py-3 sm:py-3.5 bg-[#EEF7F6] border-b border-[#2BB3B1]/25 flex items-center gap-3 shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))]">
            {/* Mobile Back Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="sm:hidden -ml-1 p-1.5 rounded-full hover:bg-black/5 text-[#0B6E73] flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              aria-label={isBn ? 'ফিরে যান' : 'Back to website'}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs font-semibold">{isBn ? 'ব্যাক' : 'Back'}</span>
            </button>

            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white border-2 border-white shadow-sm shrink-0">
              <Image src="/img/doctor-v3.webp" alt="Dr. Kollol" fill className="object-cover object-top" sizes="40px" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm font-serif text-[#062F31] leading-tight truncate">
                {isBn ? 'ডাঃ কল্লোলের সহকারী' : "Dr. Kollol's Assistant"}
              </h3>
              <p className="text-[11px] text-[#0B6E73] flex items-center gap-1 mt-0.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{isBn ? 'অনলাইন · সিরিয়াল ও তথ্য' : 'Online · Serial & info'}</span>
              </p>
            </div>

            <div className="ml-auto flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleResetChat}
                className="w-8 h-8 rounded-full grid place-items-center bg-white text-[#0B6E73] hover:bg-[#0B6E73] hover:text-white shadow-xs transition-colors cursor-pointer"
                title={isBn ? 'চ্যাট রিলোড করুন' : 'Reset chat'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full grid place-items-center bg-white text-[#0B6E73] hover:bg-[#0B6E73] hover:text-white shadow-xs transition-colors cursor-pointer"
                title={isBn ? 'বন্ধ করুন' : 'Close assistant'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-white to-[#EEF7F6]/60 overscroll-contain">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[88%] sm:max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-[#2BB3B1] to-[#0B6E73] text-white rounded-br-md shadow-xs'
                      : 'bg-white text-[#062F31] border border-[#2BB3B1]/25 rounded-bl-md shadow-[0_8px_18px_-14px_rgba(6,47,49,.45)]'
                  }`}
                >
                  <FormattedMessageText text={msg.text} isUser={msg.sender === 'user'} />
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {msg.actions.map((act, aIdx) => (
                        <a
                          key={aIdx}
                          href={act.url || '#'}
                          target={act.url?.startsWith('http') ? '_blank' : '_self'}
                          rel={act.url?.startsWith('http') ? 'noreferrer' : undefined}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold text-[11.5px] transition-colors ${
                            aIdx === 0
                              ? 'bg-[#0B6E73] text-white hover:bg-[#095c60]'
                              : 'bg-[#EEF7F6] text-[#0B6E73] border border-[#2BB3B1]/30 hover:bg-[#0B6E73] hover:text-white'
                          }`}
                        >
                          {act.type === 'call' && <Phone className="w-3 h-3" />}
                          {act.type === 'link' && (act.url?.startsWith('sms:') ? <MessageSquare className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />)}
                          <span>{act.label}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9.5px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1 px-3.5 py-3 bg-white rounded-2xl rounded-bl-md border border-[#2BB3B1]/25 w-fit">
                <span className="kq-dot w-1.5 h-1.5 rounded-full bg-[#2BB3B1]" />
                <span className="kq-dot w-1.5 h-1.5 rounded-full bg-[#2BB3B1] [animation-delay:.15s]" />
                <span className="kq-dot w-1.5 h-1.5 rounded-full bg-[#2BB3B1] [animation-delay:.3s]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions inside the chat — shown until the conversation starts */}
          {messages.length <= 1 && !isTyping && (
            <div className="px-3 py-2 bg-white/95 border-t border-[#2BB3B1]/15 shrink-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar sm:flex-wrap sm:max-h-32 sm:overflow-y-auto">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="shrink-0 px-3 py-1.5 rounded-full border border-[#2BB3B1]/35 bg-[#EEF7F6] text-[#0B6E73] text-[12px] font-semibold hover:bg-[#0B6E73] hover:text-white active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  {isBn ? chip.label_bn : chip.label_en}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar: Note text-base on mobile prevents iOS Safari auto-zoom! */}
          <form
            onSubmit={handleSendMessage}
            className="px-3 pt-2.5 pb-2 bg-white border-t border-[#2BB3B1]/20 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={() => {
                setTimeout(() => {
                  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 200);
              }}
              placeholder={isBn ? 'আপনার প্রশ্ন লিখুন…' : 'Type your question…'}
              maxLength={500}
              className="flex-1 text-base sm:text-[13px] rounded-full border border-[#2BB3B1]/30 py-2.5 px-4 bg-white text-[#062F31] placeholder-gray-400 focus:outline-hidden focus:border-[#2BB3B1] focus:ring-2 focus:ring-[#2BB3B1]/20 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              aria-label="Send Message"
              className={`w-10 h-10 rounded-full grid place-items-center transition-all shrink-0 ${
                inputText.trim() && !isTyping
                  ? 'bg-gradient-to-br from-[#2BB3B1] to-[#0B6E73] text-white shadow-md hover:scale-105 active:scale-95 cursor-pointer'
                  : 'bg-[#EEF7F6] text-[#2BB3B1]/60 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="pb-[max(0.6rem,env(safe-area-inset-bottom))] text-center text-[10px] sm:text-[10.5px] text-[#3F6668] bg-white shrink-0 px-2 truncate">
            {isBn ? '⚠️ তথ্যমূলক এআই সহকারী — সঠিক চিকিৎসার জন্য ডাক্তার দেখান।' : '⚠️ Informational AI assistant — please consult the doctor for treatment.'}
          </p>
        </div>
      )}
    </>
  );
}
