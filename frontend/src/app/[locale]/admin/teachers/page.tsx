'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Award, BookOpen, Clock, RefreshCw } from 'lucide-react';

interface PendingTeacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  qualifications: string;
  teachingExperience: string;
  bio: string;
  createdAt: string;
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<PendingTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  const fetchPendingTeachers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:3005/api/v1/users/pending-teachers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Error fetching pending teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this teacher? They will be able to create and publish lessons.')) return;
    setActionLoading(id);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:3005/api/v1/users/teachers/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTeachers(teachers.filter((t) => t.id !== id));
      } else {
        alert('Failed to approve teacher');
      }
    } catch (error) {
      console.error('Error approving teacher:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Reject this teacher? They will not be able to create lessons.')) return;
    setActionLoading(id);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:3005/api/v1/users/teachers/${id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTeachers(teachers.filter((t) => t.id !== id));
      } else {
        alert('Failed to reject teacher');
      }
    } catch (error) {
      console.error('Error rejecting teacher:', error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Teacher Approvals</h1>
          <p className="text-gray-500 mt-1">Review and approve teacher registrations</p>
        </div>
        <button
          onClick={fetchPendingTeachers}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading...</div>
      ) : teachers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
          <h3 className="text-xl text-gray-600 mb-2">All caught up!</h3>
          <p className="text-gray-400">No pending teacher registrations to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 shrink-0">
                  {teacher.firstName[0]}{teacher.lastName[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">
                        {teacher.firstName} {teacher.lastName}
                      </h3>
                      <p className="text-gray-500 text-sm">{teacher.email}</p>
                      <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                        <Clock size={12} />
                        Registered {new Date(teacher.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-indigo-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Award size={16} className="text-indigo-600" />
                        <span className="text-sm font-semibold text-indigo-900">Qualifications</span>
                      </div>
                      <p className="text-sm text-indigo-700">{teacher.qualifications}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen size={16} className="text-purple-600" />
                        <span className="text-sm font-semibold text-purple-900">Teaching Experience</span>
                      </div>
                      <p className="text-sm text-purple-700">{teacher.teachingExperience}</p>
                    </div>
                  </div>

                  {teacher.bio && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-600">{teacher.bio}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(teacher.id)}
                      disabled={actionLoading === teacher.id}
                      className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(teacher.id)}
                      disabled={actionLoading === teacher.id}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
