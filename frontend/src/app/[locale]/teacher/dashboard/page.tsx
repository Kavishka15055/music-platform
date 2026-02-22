'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

interface Lesson {
  id: string;
  title: string;
  status: 'scheduled' | 'live' | 'ended';
  scheduledDate: string;
  currentParticipants: number;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyLessons();
  }, []);

  const fetchMyLessons = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:3005/api/v1/lessons/my-lessons', {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const totalLessons = lessons.length;
  const liveLessons = lessons.filter((l) => l.status === 'live').length;
  const upcomingLessons = lessons.filter((l) => l.status === 'scheduled').length;
  const completedLessons = lessons.filter((l) => l.status === 'ended').length;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-slate-800">
        Welcome, {user?.firstName}! 👋
      </h1>
      <p className="text-gray-500 mb-8">Here&apos;s an overview of your teaching activity.</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen size={20} className="text-purple-600" />
            </div>
            <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Lessons</h2>
          </div>
          <p className="text-4xl font-bold text-slate-900">{totalLessons}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-bold text-sm">LIVE</span>
            </div>
            <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Live Now</h2>
          </div>
          <p className="text-4xl font-bold text-red-600">{liveLessons}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-blue-600" />
            </div>
            <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Upcoming</h2>
          </div>
          <p className="text-4xl font-bold text-blue-600">{upcomingLessons}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Completed</h2>
          </div>
          <p className="text-4xl font-bold text-green-600">{completedLessons}</p>
        </div>
      </div>

      {/* Recent Lessons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold mb-4 text-slate-800">Recent Lessons</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-3 text-gray-300" />
            <p>You haven&apos;t created any lessons yet.</p>
            <p className="text-sm mt-1">Go to &quot;My Lessons&quot; to create your first lesson!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.slice(0, 5).map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-800">{lesson.title}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(lesson.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    <Users size={14} className="inline mr-1" />
                    {lesson.currentParticipants}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lesson.status === 'live' ? 'bg-red-100 text-red-700' :
                    lesson.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {lesson.status === 'live' ? '🔴 LIVE' : lesson.status === 'scheduled' ? 'Upcoming' : 'Ended'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
