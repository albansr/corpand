'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from '@/components/i18n-provider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LanguageSwitcher } from './language-switcher';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { key: 'inici', path: '/' },
  { key: 'vendre', path: '/vendre-empresa' },
  { key: 'comprar', path: '/comprar-empresa' },
  { key: 'valoracio', path: '/valoracio' },
  { key: 'oportunitats', path: '/oportunitats' },
  { key: 'metode', path: '/metode' },
  { key: 'corpand', path: '/corpand' },
  { key: 'contacte', path: '/contacte' },
];

export function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname() ?? '';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const prefix = locale === 'ca' ? '' : `/${locale}`;

  const strippedPath = locale !== 'ca' && pathname?.startsWith(`/${locale}`)
    ? pathname.slice(`/${locale}`.length) || '/'
    : pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function localHref(path: string) {
    return `${prefix}${path}`;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-navy/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-16 md:h-20">
        <Link href={localHref('/')} className="flex flex-col items-start">
          <span className="text-offwhite text-sm md:text-base font-light tracking-[0.3em]">CORPAND</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = link.path === '/' ? strippedPath === '/' : strippedPath?.startsWith(link.path);
            return (
              <Link
                key={link.key}
                href={localHref(link.path)}
                className={`px-3 py-2 text-xs font-normal tracking-wider uppercase transition-colors duration-200 ${
                  isActive ? 'text-gold' : 'text-offwhite/80 hover:text-gold'
                }`}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <button
            className="lg:hidden text-offwhite p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden bg-navy/98 backdrop-blur-md border-t border-white/10">
          <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = link.path === '/' ? strippedPath === '/' : strippedPath?.startsWith(link.path);
              return (
                <Link
                  key={link.key}
                  href={localHref(link.path)}
                  className={`px-4 py-3 text-sm font-light tracking-wider uppercase transition-colors duration-200 ${
                    isActive ? 'text-gold' : 'text-offwhite/80 hover:text-gold'
                  }`}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
