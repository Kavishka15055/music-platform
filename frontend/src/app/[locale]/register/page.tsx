'use client';

import React, { useState } from 'react';
import { Music, User, GraduationCap, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/components/AuthContext';

type RegistrationType = 'student' | 'teacher';

export default function RegisterPage() {
  const router = useRouter();
  const { registerStudent, registerTeacher } = useAuth();
  const [type, setType] = useState<RegistrationType>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Teacher-only fields
  const [qualifications, setQualifications] = useState('');
  const [teachingExperience, setTeachingExperience] = useState('');
  const [bio, setBio] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      let result;
      if (type === 'student') {
        result = await registerStudent({ email, password, firstName, lastName, phone });
      } else {
        if (!qualifications || !teachingExperience) {
          setError('Qualifications and teaching experience are required for teachers');
          setLoading(false);
          return;
        }
        result = await registerTeacher({
          email, password, firstName, lastName, phone,
          qualifications, teachingExperience, bio,
        });
      }

      if (result.success) {
        setSuccess(result.message || 'Registration successful! Please login.');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 text-center border-b border-slate-700/50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Music className="h-8 w-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">Create Account</h1>
            </div>
            <p className="text-gray-400 text-sm">Join our music learning community</p>
          </div>

          {/* Type Selector */}
          <div className="p-6 pb-0">
            <div className="flex bg-slate-900/50 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setType('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  type === 'student'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <User size={18} />
                Student
              </button>
              <button
                type="button"
                onClick={() => setType('teacher')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  type === 'teacher'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <GraduationCap size={18} />
                Teacher
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
                <CheckCircle size={16} />
                {success}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                placeholder="+94 71 234 5678"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors pr-10"
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                placeholder="Re-enter your password"
              />
            </div>

            {/* Teacher-only fields */}
            {type === 'teacher' && (
              <>
                <div className="pt-2 border-t border-slate-700/50">
                  <p className="text-sm text-indigo-400 font-medium mb-3">Teacher Qualifications</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Qualifications *</label>
                  <textarea
                    required
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors h-20 resize-none"
                    placeholder="e.g., B.Mus in Piano Performance, ABRSM Grade 8..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Teaching Experience *</label>
                  <textarea
                    required
                    value={teachingExperience}
                    onChange={(e) => setTeachingExperience(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors h-20 resize-none"
                    placeholder="e.g., 5+ years teaching piano at XYZ Academy..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Bio (optional)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors h-20 resize-none"
                    placeholder="Tell students about yourself..."
                  />
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs">
                  ⚠️ Teacher profiles require admin approval before you can create lessons.
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
                type === 'student'
                  ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              } ${loading ? 'opacity-60 cursor-not-allowed' : ''} focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800`}
            >
              {loading ? 'Creating Account...' : `Register as ${type === 'student' ? 'Student' : 'Teacher'}`}
            </button>

            <p className="text-center text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
