'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from '@/components/i18n-provider';
import { usePathname, useRouter } from 'next/navigation';
import type { Locale } from '@/i18n/routing';

/* ── Inline SVG flag components (4:3 ratio, 20×15) ── */

function FlagAD() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" className="w-5 h-[15px] rounded-[2px] flex-shrink-0 shadow-sm">
      <rect width="6.67" height="15" fill="#0032A0" />
      <rect x="6.67" width="6.67" height="15" fill="#FEDF00" />
      <rect x="13.33" width="6.67" height="15" fill="#D1001F" />
    </svg>
  );
}

function FlagES() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" className="w-5 h-[15px] rounded-[2px] flex-shrink-0 shadow-sm">
      <rect width="20" height="15" fill="#AA151B" />
      <rect y="3.75" width="20" height="7.5" fill="#F1BF00" />
    </svg>
  );
}

function FlagGB() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" className="w-5 h-[15px] rounded-[2px] flex-shrink-0 shadow-sm">
      <rect width="20" height="15" fill="#012169" />
      <path d="M0,0 L20,15 M20,0 L0,15" stroke="#fff" strokeWidth="2.5" />
      <path d="M0,0 L20,15 M20,0 L0,15" stroke="#C8102E" strokeWidth="1.5" />
      <path d="M10,0 V15 M0,7.5 H20" stroke="#fff" strokeWidth="4" />
      <path d="M10,0 V15 M0,7.5 H20" stroke="#C8102E" strokeWidth="2.4" />
    </svg>
  );
}

function FlagFR() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" className="w-5 h-[15px] rounded-[2px] flex-shrink-0 shadow-sm">
      <rect width="6.67" height="15" fill="#002395" />
      <rect x="6.67" width="6.67" height="15" fill="#fff" />
      <rect x="13.33" width="6.67" height="15" fill="#ED2939" />
    </svg>
  );
}

function FlagDE() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" className="w-5 h-[15px] rounded-[2px] flex-shrink-0 shadow-sm">
      <rect width="20" height="5" fill="#000" />
      <rect y="5" width="20" height="5" fill="#DD0000" />
      <rect y="10" width="20" height="5" fill="#FFCC00" />
    </svg>
  );
}

function FlagPT() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15" className="w-5 h-[15px] rounded-[2px] flex-shrink-0 shadow-sm">
      <rect width="20" height="15" fill="#FF0000" />
      <rect width="8" height="15" fill="#006600" />
      <circle cx="8" cy="7.5" r="2.8" fill="#FFCC00" />
    </svg>
  );
}

const localeConfig: { code: Locale; Flag: () => JSX.Element; label: string }[] = [
  { code: 'ca', Flag: FlagAD, label: 'Català' },
  { code: 'es', Flag: FlagES, label: 'Español' },
  { code: 'en', Flag: FlagGB, label: 'English' },
  { code: 'fr', Flag: FlagFR, label: 'Français' },
  { code: 'de', Flag: FlagDE, label: 'Deutsch' },
  { code: 'pt', Flag: FlagPT, label: 'Português' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = localeConfig.find((l) => l.code === locale) ?? localeConfig[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const switchLocale = (newLocale: Locale) => {
    let basePath = pathname;
    if (locale !== 'ca' && pathname?.startsWith(`/${locale}`)) {
      basePath = pathname.slice(`/${locale}`.length) || '/';
    }
    const newPath = newLocale === 'ca' ? basePath : `/${newLocale}${basePath}`;
    router.push(newPath);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-offwhite/80 hover:text-offwhite text-sm transition-colors px-2 py-1"
        aria-label="Language"
      >
        <current.Flag />
        <span className="hidden sm:inline text-xs font-light tracking-wide uppercase">{current?.code}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 bg-navy/98 backdrop-blur-md rounded shadow-lg border border-white/10 min-w-[180px] py-1 z-50">
          {localeConfig.map((l) => (
            <button
              key={l.code}
              onClick={() => switchLocale(l.code)}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                l.code === locale ? 'text-gold bg-white/5' : 'text-offwhite/80 hover:text-offwhite hover:bg-white/5'
              }`}
            >
              <l.Flag />
              <span className="font-light">{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
