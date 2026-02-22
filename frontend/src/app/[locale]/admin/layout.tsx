import React from 'react';
import { Link } from '@/i18n/routing';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-800">
          CMS Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block p-3 hover:bg-slate-800 rounded transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/events" className="block p-3 hover:bg-slate-800 rounded transition-colors">
            Events
          </Link>
          <Link href="/admin/gallery" className="block p-3 hover:bg-slate-800 rounded transition-colors">
            Gallery
          </Link>
          <Link href="/admin/lessons" className="block p-3 hover:bg-slate-800 rounded transition-colors">
            Live Lessons
          </Link>
          <Link href="/admin/teachers" className="block p-3 hover:bg-slate-800 rounded transition-colors">
            Teacher Approvals
          </Link>
          <div className="pt-8 mt-8 border-t border-slate-800">
            <Link href="/" className="block p-3 hover:bg-slate-800 rounded transition-colors text-slate-400">
              Back to Site
            </Link>
          </div>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
