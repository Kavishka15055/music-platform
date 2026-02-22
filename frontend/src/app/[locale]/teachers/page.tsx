'use client';

import React, { useState, useEffect } from 'react';
import { GraduationCap, Award, BookOpen, Search } from 'lucide-react';
import { Link } from '@/i18n/routing';
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

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch('http://localhost:3005/api/v1/users/teachers');
      if (res.ok) {
        const data = await res.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const query = searchQuery.toLowerCase();
    return (
      t.firstName.toLowerCase().includes(query) ||
      t.lastName.toLowerCase().includes(query) ||
      (t.qualifications && t.qualifications.toLowerCase().includes(query)) ||
      (t.bio && t.bio.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-6 py-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Teachers
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mb-8">
              Learn from expert music teachers with verified qualifications and years of experience.
            </p>

            {/* Search */}
            <div className="max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teachers by name or qualification..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {loading ? (
            <div className="text-center py-16 text-gray-500 text-xl">Loading teachers...</div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-16">
              <GraduationCap size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl text-gray-500 mb-2">No teachers found</h3>
              <p className="text-gray-400">Check back later for new teachers.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTeachers.map((teacher) => (
                <Link
                  key={teacher.id}
                  href={`/teachers/${teacher.id}`}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all"
                >
                  {/* Avatar area */}
                  <div className="h-36 bg-gradient-to-br from-indigo-500 to-purple-600 relative flex items-center justify-center">
                    {teacher.profileImageUrl ? (
                      <img
                        src={teacher.profileImageUrl}
                        alt={`${teacher.firstName} ${teacher.lastName}`}
                        className="w-24 h-24 rounded-full border-4 border-white object-cover absolute bottom-0 translate-y-1/2"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 absolute bottom-0 translate-y-1/2">
                        {teacher.firstName[0]}{teacher.lastName[0]}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="pt-16 px-6 pb-6">
                    <h3 className="text-xl font-bold text-slate-800 text-center group-hover:text-indigo-600 transition-colors">
                      {teacher.firstName} {teacher.lastName}
                    </h3>

                    {teacher.bio && (
                      <p className="text-gray-500 text-sm text-center mt-2 line-clamp-2">
                        {teacher.bio}
                      </p>
                    )}

                    <div className="mt-4 space-y-2">
                      {teacher.qualifications && (
                        <div className="flex items-start gap-2">
                          <Award size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-gray-600 line-clamp-2">{teacher.qualifications}</p>
                        </div>
                      )}
                      {teacher.teachingExperience && (
                        <div className="flex items-start gap-2">
                          <BookOpen size={16} className="text-purple-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-gray-600 line-clamp-2">{teacher.teachingExperience}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                      <span className="text-sm text-indigo-600 font-medium group-hover:text-indigo-700">
                        View Profile & Lessons →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
