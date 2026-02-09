import React from 'react';

async function getStats() {
  const eventsRes = await fetch('http://localhost:3005/api/v1/events/stats', { cache: 'no-store' });
  const galleryRes = await fetch('http://localhost:3005/api/v1/gallery/stats', { cache: 'no-store' });
  
  const eventsStats = await eventsRes.json();
  const galleryStats = await galleryRes.json();
  
  return { eventsStats, galleryStats };
}

export default async function AdminDashboard() {
  const { eventsStats, galleryStats } = await getStats();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Total Events</h2>
          <p className="text-4xl font-bold text-slate-900">{eventsStats.totalEvents}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Upcoming Events</h2>
          <p className="text-4xl font-bold text-blue-600">{eventsStats.upcomingEvents}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Gallery Items</h2>
          <p className="text-4xl font-bold text-slate-900">{galleryStats.total}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Featured Items</h2>
          <p className="text-4xl font-bold text-yellow-500">{galleryStats.featured}</p>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-slate-800">Quick Actions</h3>
          <div className="space-y-4">
             <button className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
               Add New Event
             </button>
             <button className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
               Upload Gallery Image
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
