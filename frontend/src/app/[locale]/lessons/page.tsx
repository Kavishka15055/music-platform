'use client';

import React, { useState, useEffect } from 'react';
import { PlayCircle, Clock, Users, Filter, Music } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface Lesson {
  id: string;
  title: string;
  description: string;
  scheduledDate: string;
  duration: number;
  instructor: string;
  category: string;
  level: string;
  thumbnailUrl: string;
  status: 'scheduled' | 'live' | 'ended';
  maxParticipants: number;
  currentParticipants: number;
}

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
    // Refresh every 10 seconds to get live updates
    const interval = setInterval(fetchLessons, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLessons = async () => {
    try {
      const res = await fetch('http://localhost:3005/api/v1/lessons');
      const data = await res.json();
      setLessons(data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = lessons.filter((lesson) => {
    // Tab filter
    if (activeTab === 'live' && lesson.status !== 'live') return false;
    if (activeTab === 'upcoming' && lesson.status !== 'scheduled') return false;
    
    // Category filter
    if (categoryFilter !== 'all' && lesson.category !== categoryFilter) return false;
    
    return true;
  });

  const categories = ['all', ...new Set(lessons.map((l) => l.category))];
  const liveLessonsCount = lessons.filter((l) => l.status === 'live').length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'live':
        return (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-full text-sm font-semibold shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              LIVE NOW
            </span>
          </div>
        );
      case 'scheduled':
        return (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500/90 text-white rounded-full text-sm font-medium">
              <Clock size={14} />
              Upcoming
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading lessons...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-pink-900/50"></div>
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Live Music Lessons
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Join our expert instructors for real-time video lessons. Learn music from anywhere in the world.
          </p>
          {liveLessonsCount > 0 && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-red-300">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              {liveLessonsCount} lesson{liveLessonsCount > 1 ? 's' : ''} live now
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
          {/* Tabs */}
          <div className="flex gap-2 bg-slate-800 p-1 rounded-xl">
            {[
              { id: 'all', label: 'All Lessons' },
              { id: 'live', label: '🔴 Live Now' },
              { id: 'upcoming', label: 'Upcoming' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-800 text-gray-300 px-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lessons Grid */}
        {filteredLessons.length === 0 ? (
          <div className="text-center py-16">
            <Music size={64} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">No lessons found</h3>
            <p className="text-gray-500">Check back later for upcoming lessons</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`bg-slate-800 rounded-2xl overflow-hidden border transition-all hover:transform hover:scale-[1.02] ${
                  lesson.status === 'live'
                    ? 'border-red-500/50 shadow-lg shadow-red-500/20'
                    : 'border-slate-700 hover:border-purple-500/50'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-purple-900 to-pink-900">
                  {lesson.thumbnailUrl && (
                    <img
                      src={lesson.thumbnailUrl}
                      alt={lesson.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {!lesson.thumbnailUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Music size={48} className="text-white/30" />
                    </div>
                  )}
                  {getStatusDisplay(lesson.status)}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white line-clamp-2">
                      {lesson.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {lesson.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {lesson.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {lesson.currentParticipants}/{lesson.maxParticipants}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                      {lesson.category}
                    </span>
                    <span className="px-2 py-1 bg-slate-700 text-gray-400 rounded-full text-xs">
                      {lesson.level}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div>
                      <p className="text-xs text-gray-500">Instructor</p>
                      <p className="text-sm text-white">{lesson.instructor}</p>
                    </div>
                    
                    {lesson.status === 'live' ? (
                      <Link
                        href={`/lessons/${lesson.id}/watch`}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                      >
                        <PlayCircle size={18} />
                        Join Now
                      </Link>
                    ) : lesson.status === 'scheduled' ? (
                      <Link
                        href={`/lessons/${lesson.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                      >
                        View Details
                      </Link>
                    ) : (
                      <span className="px-4 py-2 bg-slate-700 text-gray-400 rounded-lg text-sm">
                        Ended
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
