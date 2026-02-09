'use client';

import { Play, Users, Star } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function Hero() {
  const [isPlaying, setIsPlaying] = useState(false);
  const t = useTranslations('HomePage');

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-300 via-white to-blue-200 py-20 sm:py-32">
      <div className="absolute inset-0 bg-grid-slate-100 -z-10" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              {t('title')}
              <span className="block text-indigo-600 mt-2">{t('subtitle')}</span>
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl">
              {t('description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {t('getStarted')}
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <div className="text-2xl font-bold text-gray-900">2,000+</div>
                <div className="text-sm text-gray-600">{t('stats.students')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">100+</div>
                <div className="text-sm text-gray-600">{t('stats.teachers')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">98%</div>
                <div className="text-sm text-gray-600">{t('stats.satisfaction')}</div>
              </div>
            </div>
          </div>

          {/* Right Content - Video Preview */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                {isPlaying ? (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-pulse mb-4">🎬 Demo Playing...</div>
                      <button
                        onClick={() => setIsPlaying(false)}
                        className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur"
                      >
                        Stop
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center group"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                      <div className="relative bg-white p-6 rounded-full shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="h-12 w-12 text-indigo-600" />
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Testimonial */}
            <div className="mt-12 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center">
                <div className="text-amber-400 flex">
                  {'★'.repeat(5)}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">5.0</span>
              </div>
              <p className="mt-3 text-lg font-medium text-gray-900">
                "The best live platform I've ever used!"
              </p>
              <div className="mt-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">Sarah Chen</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}