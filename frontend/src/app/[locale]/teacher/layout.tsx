'use client';

import React from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { LayoutDashboard, BookOpen, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Redirect if not teacher
  if (!user || user.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need a teacher account to access this area.</p>
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Show pending status notice
  if (user.approvalStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⏳</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Approval Pending</h2>
          <p className="text-gray-600 mb-6">
            Your teacher profile is currently under review by the admin. You&apos;ll be able to create lessons once approved.
          </p>
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (user.approvalStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Rejected</h2>
          <p className="text-gray-600 mb-6">
            Unfortunately, your teacher profile has been rejected. Please contact the admin for more information.
          </p>
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-indigo-800">
          Teacher Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/teacher/dashboard" className="flex items-center gap-3 p-3 hover:bg-indigo-800 rounded transition-colors">
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link href="/teacher/lessons" className="flex items-center gap-3 p-3 hover:bg-indigo-800 rounded transition-colors">
            <BookOpen size={20} />
            My Lessons
          </Link>
          <div className="pt-8 mt-8 border-t border-indigo-800">
            <Link href="/" className="flex items-center gap-3 p-3 hover:bg-indigo-800 rounded transition-colors text-indigo-300">
              <ArrowLeft size={20} />
              Back to Site
            </Link>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="flex items-center gap-3 p-3 hover:bg-indigo-800 rounded transition-colors text-indigo-300 w-full text-left"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </nav>
        <div className="p-4 border-t border-indigo-800">
          <p className="text-sm text-indigo-300">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-indigo-400">Teacher</p>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
