'use client';

import { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, ArrowRight, Music, Mic, Headphones, Guitar, Drum } from 'lucide-react';
import Link from 'next/link';
import { eventsApi } from '@/services/api';

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
  currentAttendees: number;
  status: string;
  imageUrl?: string;
}

export default function Events({ showAll = false }: { showAll?: boolean }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsApi.getUpcoming();
      console.log('API Response:', response); // Debug log
      setEvents(response.data || []);
    } catch (err: any) {
      console.error('API Error:', err); // Debug log
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    try {
      const response = await eventsApi.register(eventId);
      if (response.data.success) {
        alert('Successfully registered for the event!');
        fetchEvents(); // Refresh events
      } else {
        alert(response.data.message);
      }
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    }
  };

  const getEventIcon = (instrument: string) => {
    switch (instrument.toLowerCase()) {
      case 'piano': return Music;
      case 'guitar': return Guitar;
      case 'voice': return Mic;
      case 'drums': return Drum;
      case 'production': return Headphones;
      default: return Headphones;
    }
  };

  const getEventColor = (category: string) => {
    switch (category) {
      case 'workshop': return 'bg-blue-100 text-blue-700';
      case 'masterclass': return 'bg-purple-100 text-purple-700';
      case 'seminar': return 'bg-green-100 text-green-700';
      case 'intensive': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={fetchEvents}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const displayEvents = showAll ? events : events.slice(0, 3);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Music Events & Workshops
          </h2>
          <p className="text-lg text-gray-600">
            Join masterclasses, workshops, and seminars led by professional musicians and educators from around Australia.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No upcoming events scheduled</div>
            <button
              onClick={fetchEvents}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Check Again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {displayEvents.map((event) => {
                const EventIcon = getEventIcon(event.instrument);
                return (
                  <div
                    key={event.id}
                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-indigo-300"
                  >
                    {/* Event Image */}
                    <div className="relative h-48 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                        <EventIcon className="h-16 w-16 text-white opacity-20" />
                      </div>
                      <div className="absolute top-4 left-4">
                        <div className={`px-3 py-1 rounded-full ${getEventColor(event.category)} font-bold text-sm backdrop-blur-sm`}>
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700">
                          {event.category}
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <div className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
                          {event.instrument}
                        </div>
                      </div>
                    </div>

                    {/* Event Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className={`p-2 rounded-lg ${getEventColor(event.category)}`}>
                            <EventIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500">{event.category}</div>
                            <div className="text-sm font-medium text-gray-700">{event.level}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">${event.price}</div>
                          <div className="text-xs text-gray-500">per person</div>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {event.description}
                      </p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-gray-700">
                          <MapPin className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Users className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="text-sm">{event.currentAttendees}/{event.maxAttendees} registered</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                          event.status === 'upcoming' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {event.status === 'upcoming' ? 'Upcoming' : 'Past Event'}
                        </span>
                        <button
                          onClick={() => handleRegister(event.id)}
                          className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors flex items-center justify-center group/btn"
                        >
                          {event.status === 'upcoming' ? 'Register Now' : 'View Recording'}
                          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {!showAll && events.length > 3 && (
              <div className="text-center">
                <Link 
                  href="/events" 
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white transition-all duration-200 bg-indigo-600 rounded-full hover:bg-indigo-500 hover:shadow-lg hover:-translate-y-0.5"
                >
                  View All {events.length} Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}