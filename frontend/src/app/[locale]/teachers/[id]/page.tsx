'use client';

import React, { useState, useEffect } from 'react';
import { Award, BookOpen, Clock, Users, PlayCircle, Music, ArrowLeft, GraduationCap } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  qualifications: string;
  teachingExperience: string;
  bio: string;
  profileImageUrl: string;
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
}

export default function TeacherProfilePage() {
  const params = useParams();
  const teacherId = params.id as string;
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teacherId) {
      fetchTeacher();
      fetchLessons();
    }
  }, [teacherId]);

  const fetchTeacher = async () => {
    try {
      const res = await fetch(`http://localhost:3005/api/v1/users/teachers/${teacherId}`);
      if (res.ok) {
        const data = await res.json();
        setTeacher(data);
      }
    } catch (error) {
      console.error('Error fetching teacher:', error);
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await fetch(`http://localhost:3005/api/v1/lessons/teacher/${teacherId}`);
      if (res.ok) {
        const data = await res.json();
        setLessons(data);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-gray-500 text-xl">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Teacher Not Found</h2>
            <Link href="/teachers" className="text-indigo-600 hover:text-indigo-700">
              Back to Teachers
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const upcomingLessons = lessons.filter((l) => l.status === 'scheduled');
  const liveLessons = lessons.filter((l) => l.status === 'live');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Back link */}
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <Link href="/teachers" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft size={18} />
            All Teachers
          </Link>
        </div>

        {/* Teacher Profile Header */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
              {teacher.profileImageUrl ? (
                <img
                  src={teacher.profileImageUrl}
                  alt={`${teacher.firstName} ${teacher.lastName}`}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover absolute bottom-0 left-8 translate-y-1/2"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600 absolute bottom-0 left-8 translate-y-1/2">
                  {teacher.firstName[0]}{teacher.lastName[0]}
                </div>
              )}
            </div>

            <div className="pt-20 px-8 pb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">
                    {teacher.firstName} {teacher.lastName}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <GraduationCap size={18} className="text-indigo-500" />
                    <span className="text-indigo-600 font-medium">Verified Teacher</span>
                  </div>
                </div>
              </div>

              {teacher.bio && (
                <p className="text-gray-600 mb-6 max-w-3xl">{teacher.bio}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teacher.qualifications && (
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award size={18} className="text-indigo-600" />
                      <h3 className="font-semibold text-indigo-900">Qualifications</h3>
                    </div>
                    <p className="text-indigo-700 text-sm">{teacher.qualifications}</p>
                  </div>
                )}
                {teacher.teachingExperience && (
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen size={18} className="text-purple-600" />
                      <h3 className="font-semibold text-purple-900">Teaching Experience</h3>
                    </div>
                    <p className="text-purple-700 text-sm">{teacher.teachingExperience}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Teacher's Lessons */}
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Lessons by {teacher.firstName}
          </h2>

          {/* Live lessons */}
          {liveLessons.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Live Now
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveLessons.map((lesson) => (
                  <div key={lesson.id} className="bg-white rounded-xl shadow-sm border-2 border-red-200 overflow-hidden">
                    <div className="relative aspect-video bg-gradient-to-br from-red-500/20 to-pink-500/20">
                      {lesson.thumbnailUrl ? (
                        <img src={lesson.thumbnailUrl} alt={lesson.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Music size={48} className="text-red-300" />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-full text-sm font-semibold">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                    </div>
                    <div className="p-5">
                      <h4 className="text-lg font-semibold text-slate-800 mb-2">{lesson.title}</h4>
                      <p className="text-gray-500 text-sm mb-3 line-clamp-2">{lesson.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1"><Clock size={14} /> {lesson.duration} min</span>
                        <span className="flex items-center gap-1"><Users size={14} /> {lesson.currentParticipants}/{lesson.maxParticipants}</span>
                      </div>
                      <Link
                        href={`/lessons/${lesson.id}/watch`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                      >
                        <PlayCircle size={18} />
                        Join Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming lessons */}
          {upcomingLessons.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-blue-600 mb-4">Upcoming Lessons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingLessons.map((lesson) => (
                  <div key={lesson.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-indigo-50">
                      {lesson.thumbnailUrl ? (
                        <img src={lesson.thumbnailUrl} alt={lesson.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Music size={48} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h4 className="text-lg font-semibold text-slate-800 mb-2">{lesson.title}</h4>
                      <p className="text-gray-500 text-sm mb-3 line-clamp-2">{lesson.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1"><Clock size={14} /> {lesson.duration} min</span>
                        <span className="flex items-center gap-1"><Users size={14} /> {lesson.currentParticipants}/{lesson.maxParticipants}</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(lesson.scheduledDate).toLocaleDateString('en-US', {
                          weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lessons.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">This teacher hasn&apos;t created any lessons yet.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
