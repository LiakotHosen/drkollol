'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface MobileStickyBarProps {
  phoneCall?: string;
  whatsappUrl?: string;
  phoneSerial?: string;
  onBookClick?: () => void;
}

export function MobileStickyBar({
  phoneCall = '01670879100',
  whatsappUrl = 'https://wa.me/8801670879100',
  phoneSerial = '01750529252',
  onBookClick,
}: MobileStickyBarProps) {
  const { isBn } = useLanguage();

  return (
    <div className="lg:hidden fixed bottom-3 inset-x-3 z-40 p-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-[rgba(43,179,177,0.3)] shadow-[0_14px_30px_-10px_rgba(6,47,49,0.35)] flex items-center gap-2">
      <a
        href={`tel:${phoneCall}`}
        className="btn btn-g flex-1 py-2.5 px-2 text-xs font-bold text-center justify-center"
      >
        {isBn ? 'কল করুন' : 'Call'}
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-g flex-1 py-2.5 px-2 text-xs font-bold text-center justify-center text-emerald-700 border-emerald-300 bg-emerald-50/50"
      >
        WhatsApp
      </a>
      {onBookClick ? (
        <button
          type="button"
          onClick={onBookClick}
          className="btn btn-p flex-1 py-2.5 px-2 text-xs font-bold text-center justify-center"
        >
          {isBn ? 'সিরিয়াল নিন' : 'Book a serial'}
        </button>
      ) : (
        <a
          href={`tel:${phoneSerial}`}
          className="btn btn-p flex-1 py-2.5 px-2 text-xs font-bold text-center justify-center"
        >
          {isBn ? 'সিরিয়াল নিন' : 'Book a serial'}
        </a>
      )}
    </div>
  );
}
