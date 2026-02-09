'use client';

import { useState } from 'react';
import { Menu, X, Music, Globe } from 'lucide-react';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations('Navbar');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: t('home'), href: '/' },
    { label: t('about'), href: '/about' },
    { label: t('gallery'), href: '/gallery' },
    { label: t('events'), href: '/events' },
    { label: t('lessons'), href: '/lessons' },
    { label: t('contact'), href: '/contact' },
  ];

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'si' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{tc('platformName')}</h1>
              <p className="text-xs text-gray-500">{tc('platformTagline')}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons & Language Switcher */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-indigo-600 px-2 py-1 rounded-md border border-gray-200"
            >
              <Globe className="h-4 w-4" />
              <span>{locale === 'en' ? 'සිංහල' : 'English'}</span>
            </button>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-indigo-600"
            >
              {t('login')}
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {t('register')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
                <button
                  onClick={toggleLanguage}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <Globe className="h-5 w-5" />
                  <span>{locale === 'en' ? 'සිංහල' : 'English'}</span>
                </button>
                <Link
                  href="/login"
                  className="block w-full text-center py-2 text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="block w-full text-center mt-2 py-2 bg-indigo-600 text-white rounded-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('register')}
                </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}