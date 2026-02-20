'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, Users, Calendar, ArrowLeft, PlayCircle, Star, Trash2 } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface LessonReview {
  id: string;
  studentName: string;
  studentId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

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
  reviews: LessonReview[];
}

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('');

  const currentStudentId = typeof window !== 'undefined' ? sessionStorage.getItem('studentId') : null;

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  useEffect(() => {
    if (lesson?.status === 'scheduled') {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const scheduledDate = new Date(lesson.scheduledDate).getTime();
        const diff = scheduledDate - now;

        if (diff <= 0) {
          setCountdown('Starting soon...');
          fetchLesson(); // Refresh to check if live
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) {
          setCountdown(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setCountdown(`${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lesson]);

  const fetchLesson = async () => {
    try {
      const res = await fetch(`http://localhost:3005/api/v1/lessons/${lessonId}`);
      if (!res.ok) throw new Error('Lesson not found');
      const data = await res.json();
      setLesson(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Lesson not found</div>
          <Link href="/lessons" className="text-purple-400 hover:text-purple-300">
            Back to Lessons
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAverageRating = (reviews: LessonReview[]) => {
    if (!reviews || reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  };

  const renderStars = (rating: number, size: number = 16) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
        />
      ))}
    </div>
  );

  const handleDeleteReview = async (reviewId: string) => {
    if (!currentStudentId) return;
    try {
      await fetch(`http://localhost:3005/api/v1/lessons/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: currentStudentId }),
      });
      fetchLesson();
    } catch (e) {
      console.error('Failed to delete review:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          href="/lessons"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Lessons
        </Link>

        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="aspect-video bg-gradient-to-br from-purple-900 to-pink-900">
            {lesson.thumbnailUrl && (
              <img
                src={lesson.thumbnailUrl}
                alt={lesson.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-6 left-6">
            {lesson.status === 'live' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full font-semibold shadow-lg">
                <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span>
                LIVE NOW
              </span>
            )}
            {lesson.status === 'scheduled' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full font-medium">
                <Clock size={16} />
                Starts in {countdown}
              </span>
            )}
            {lesson.status === 'ended' && (
              <span className="px-4 py-2 bg-gray-600 text-white rounded-full">
                Lesson Ended
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-white mb-4">{lesson.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                {lesson.category}
              </span>
              <span className="px-3 py-1 bg-slate-700 text-gray-300 rounded-full text-sm">
                {lesson.level}
              </span>
            </div>

            <div className="prose prose-invert">
              <p className="text-gray-300 text-lg leading-relaxed">{lesson.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="bg-slate-800 rounded-2xl p-6 h-fit border border-slate-700">
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Calendar size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Scheduled</p>
                  <p className="text-white text-sm">{formatDate(lesson.scheduledDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Clock size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-white text-sm">{lesson.duration} minutes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Users size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Participants</p>
                  <p className="text-white text-sm">
                    {lesson.currentParticipants} / {lesson.maxParticipants}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6 mb-6">
              <p className="text-xs text-gray-500 mb-1">Instructor</p>
              <p className="text-white font-medium">{lesson.instructor}</p>
            </div>

            {lesson.status === 'live' ? (
              <Link
                href={`/lessons/${lesson.id}/watch`}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                <PlayCircle size={20} />
                Join Live Lesson
              </Link>
            ) : lesson.status === 'scheduled' ? (
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Lesson starts in</p>
                <p className="text-2xl font-bold text-purple-400">{countdown}</p>
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-700 rounded-xl">
                <p className="text-gray-400">This lesson has ended</p>
              </div>
            )}

            {/* Average Rating in Sidebar */}
            {lesson.reviews && lesson.reviews.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  {renderStars(getAverageRating(lesson.reviews))}
                  <span className="text-yellow-400 font-semibold">{getAverageRating(lesson.reviews).toFixed(1)}</span>
                </div>
                <p className="text-gray-500 text-xs">{lesson.reviews.length} review{lesson.reviews.length !== 1 ? 's' : ''}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        {lesson.reviews && lesson.reviews.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Student Reviews</h2>
            <div className="space-y-4">
              {lesson.reviews.map((review) => (
                <div key={review.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{review.studentName.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{review.studentName}</p>
                        <p className="text-gray-500 text-xs">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderStars(review.rating, 14)}
                      {currentStudentId === review.studentId && (
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-400/60 hover:text-red-400 transition-colors p-1"
                          title="Delete your review"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-300 text-sm mt-2 pl-11">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
