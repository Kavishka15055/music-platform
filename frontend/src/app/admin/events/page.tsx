'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  category: string;
  instrument: string;
  level: string;
  maxAttendees: number;
  imageUrl: string;
  status: string;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: '',
    location: '',
    price: 0,
    category: 'concert',
    instrument: '',
    level: 'Beginner',
    maxAttendees: 50,
    status: 'upcoming',
    imageUrl: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:3005/api/v1/events');
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleOpenModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      // Format date for input type="date"
      const formattedDate = new Date(event.date).toISOString().split('T')[0];
      setFormData({ ...event, date: formattedDate });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        price: 0,
        category: 'concert',
        instrument: '',
        level: 'Beginner',
        maxAttendees: 50,
        status: 'upcoming',
        imageUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        const res = await fetch(`http://localhost:3005/api/v1/events/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchEvents();
        } else {
          console.error('Failed to delete event:', res.status);
          alert(`Failed to delete event: ${res.status}`);
        }
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingEvent 
      ? `http://localhost:3005/api/v1/events/${editingEvent.id}` 
      : 'http://localhost:3005/api/v1/events';
    
    const method = editingEvent ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchEvents();
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to save event:', res.status, errorData);
        alert(`Failed to save event: ${res.status} ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Check console for details.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Manage Events</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Event
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Event</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Location</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Price</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{event.title}</div>
                  <div className="text-sm text-gray-500">{event.category}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(event.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-gray-600">{event.location}</td>
                <td className="px-6 py-4 text-gray-600">${event.price}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleOpenModal(event)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(event.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg h-24"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="concert">Concert</option>
                    <option value="workshop">Workshop</option>
                    <option value="masterclass">Masterclass</option>
                    <option value="festival">Festival</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instrument</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formData.instrument}
                    onChange={(e) => setFormData({...formData, instrument: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData({...formData, maxAttendees: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
