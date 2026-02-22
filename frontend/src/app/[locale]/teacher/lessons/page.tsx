'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Play, Square, Video } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/components/AuthContext';

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
  channelName: string;
  maxParticipants: number;
  currentParticipants: number;
}

export default function TeacherLessonsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState<Partial<Lesson>>({
    title: '',
    description: '',
    scheduledDate: '',
    duration: 60,
    category: 'General',
    level: 'All Levels',
    thumbnailUrl: '',
    maxParticipants: 100,
  });

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
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
    }
  };

  const handleOpenModal = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      const formattedDate = new Date(lesson.scheduledDate).toISOString().slice(0, 16);
      setFormData({ ...lesson, scheduledDate: formattedDate });
    } else {
      setEditingLesson(null);
      setFormData({
        title: '',
        description: '',
        scheduledDate: '',
        duration: 60,
        category: 'General',
        level: 'All Levels',
        thumbnailUrl: '',
        maxParticipants: 100,
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`http://localhost:3005/api/v1/lessons/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          fetchLessons();
        } else {
          alert('Failed to delete lesson');
        }
      } catch (error) {
        console.error('Error deleting lesson:', error);
      }
    }
  };

  const handleStartLesson = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:3005/api/v1/lessons/${id}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchLessons();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to start lesson: ${errorData.message || res.status}`);
      }
    } catch (error) {
      console.error('Error starting lesson:', error);
    }
  };

  const handleEndLesson = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:3005/api/v1/lessons/${id}/end`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchLessons();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to end lesson: ${errorData.message || res.status}`);
      }
    } catch (error) {
      console.error('Error ending lesson:', error);
    }
  };

  const handleJoinAsHost = (lesson: Lesson) => {
    router.push(`/teacher/lessons/${lesson.id}/live` as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');
    const url = editingLesson
      ? `http://localhost:3005/api/v1/lessons/${editingLesson.id}`
      : 'http://localhost:3005/api/v1/lessons';

    const method = editingLesson ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchLessons();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to save lesson: ${errorData.message || res.status}`);
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Error saving lesson.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            LIVE
          </span>
        );
      case 'scheduled':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            Scheduled
          </span>
        );
      case 'ended':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
            Ended
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">My Lessons</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          Create Lesson
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Lesson</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Scheduled</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Participants</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {lessons.map((lesson) => (
              <tr key={lesson.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{lesson.title}</div>
                  <div className="text-sm text-gray-500">{lesson.category} • {lesson.level}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(lesson.scheduledDate).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(lesson.status)}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {lesson.currentParticipants} / {lesson.maxParticipants}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {lesson.status === 'scheduled' && (
                      <button
                        onClick={() => handleStartLesson(lesson.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Start Lesson"
                      >
                        <Play size={18} />
                      </button>
                    )}
                    {lesson.status === 'live' && (
                      <>
                        <button
                          onClick={() => handleJoinAsHost(lesson)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Join as Host"
                        >
                          <Video size={18} />
                        </button>
                        <button
                          onClick={() => handleEndLesson(lesson.id)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="End Lesson"
                        >
                          <Square size={18} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleOpenModal(lesson)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(lesson.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {lessons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No lessons created yet. Click &quot;Create Lesson&quot; to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editingLesson ? 'Edit Lesson' : 'Create New Lesson'}</h2>
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
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg h-24"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="General">General</option>
                    <option value="Piano">Piano</option>
                    <option value="Guitar">Guitar</option>
                    <option value="Violin">Violin</option>
                    <option value="Drums">Drums</option>
                    <option value="Voice">Voice</option>
                    <option value="Music Theory">Music Theory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL (optional)</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="https://example.com/image.jpg"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
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
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingLesson ? 'Save Changes' : 'Create Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
