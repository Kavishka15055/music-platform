'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Volume2, VolumeX, Maximize, Minimize, LogOut, Users, Play } from 'lucide-react';

interface LessonData {
  id: string;
  title: string;
  instructor: string;
  channelName: string;
  currentParticipants: number;
  status: string;
}

export default function WatchLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hostOnline, setHostOnline] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);

  // Use refs to avoid dependency cycles and handle cleanup
  const agoraEngine = useRef<any>(null);
  const clientRef = useRef<any>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const remoteAudioRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    const loadAgora = async () => {
      try {
         const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
         agoraEngine.current = AgoraRTC;
         
         // Handle Audio Autoplay restrictions
         AgoraRTC.onAutoplayFailed = () => {
            if (isMountedRef.current) setAudioBlocked(true);
         };

         // Initialize calling fetchLesson inside to ensure Agora is loaded
         fetchLessonAndJoin();
      } catch (e) {
         console.error("Agora load failed", e);
      }
    };
    
    loadAgora();

    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [lessonId]);

  const fetchLessonAndJoin = async () => {
    try {
      const res = await fetch(`http://localhost:3005/api/v1/lessons/${lessonId}`);
      if (!res.ok) throw new Error('Lesson not found');
      const data = await res.json();
      
      if (!isMountedRef.current) return;

      if (data.status !== 'live') {
        setError('This lesson is not currently live');
        return;
      }
      
      setLesson(data);
      joinChannel(data);
    } catch (err) {
      if (isMountedRef.current) {
         setError('Failed to load lesson');
         console.error(err);
      }
    }
  };

  const joinChannel = async (lessonData: LessonData) => {
    if (clientRef.current) return; // Prevent double join
    const AgoraRTC = agoraEngine.current;
    if (!AgoraRTC) return;

    try {
      // Get token from backend
      const tokenRes = await fetch(`http://localhost:3005/api/v1/lessons/${lessonId}/token?role=audience`);
      if (!tokenRes.ok) throw new Error('Failed to get token');
      const { token, channelName, uid, appId } = await tokenRes.json();

      if (!appId || appId.includes('your_')) {
        setError('Agora credentials not configured');
        return;
      }

      // Create client
      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      clientRef.current = client;

      // Set role to audience
      await client.setClientRole('audience');

      // Handle remote user events
      client.on('user-published', async (user: any, mediaType: string) => {
        await client.subscribe(user, mediaType);
        
        if (mediaType === 'video') {
          setHostOnline(true);
          // Wait a tick for state update (optional, but safer)
          setTimeout(() => {
             const remoteVideoTrack = user.videoTrack;
             if (remoteVideoRef.current && remoteVideoTrack) {
                remoteVideoTrack.play(remoteVideoRef.current);
             }
          }, 100);
        }
        
        if (mediaType === 'audio') {
          const remoteAudioTrack = user.audioTrack;
          remoteAudioRef.current = remoteAudioTrack;
          try {
             remoteAudioTrack.play();
          } catch(e) {
             console.warn("Audio play blocked, waiting for user interaction");
             if (isMountedRef.current) setAudioBlocked(true);
          }
        }
      });

      client.on('user-unpublished', (user: any, mediaType: string) => {
        if (mediaType === 'video') {
           setHostOnline(false);
        }
      });

      client.on('user-left', () => {
         setHostOnline(false);
      });

      // Join channel
      await client.join(appId, channelName, token, uid);

      // Notify backend of join
      await fetch(`http://localhost:3005/api/v1/lessons/${lessonId}/join`, { method: 'POST' });

      if (isMountedRef.current) {
         setIsJoined(true);
         setError(null);
      } else {
         cleanup(); // If unmounted during join
      }
    } catch (err: any) {
      console.error('Failed to join channel:', err);
      if (isMountedRef.current) {
         setError(err.message || 'Failed to join lesson');
      }
    }
  };

  const cleanup = async () => {
    // Stop local playback of remote audio
    if (remoteAudioRef.current) {
      if (typeof remoteAudioRef.current.stop === 'function') {
         remoteAudioRef.current.stop();
      }
      remoteAudioRef.current = null;
    }

    if (clientRef.current) {
      // Before leave, we can notify backend if we were joined
      if (isJoined) {
         try {
             fetch(`http://localhost:3005/api/v1/lessons/${lessonId}/leave`, { method: 'POST', keepalive: true }).catch(console.error);
         } catch(e) {}
      }

      try {
         await clientRef.current.leave();
         clientRef.current.removeAllListeners();
      } catch (e) {
         console.error(e);
      }
      clientRef.current = null;
    }
  };

  const handleResumeAudio = () => {
     // Resume audio context or just try playing again
     if (remoteAudioRef.current) {
        remoteAudioRef.current.play();
        setAudioBlocked(false);
     }
  };

  const handleLeave = async () => {
    await cleanup();
    router.push('/lessons');
  };

  const toggleMute = () => {
    if (remoteAudioRef.current) {
      if (isMuted) {
        remoteAudioRef.current.play();
      } else {
        remoteAudioRef.current.stop();
      }
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
         containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
         document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl p-8 text-center max-w-md">
          <div className="text-red-400 text-xl mb-4">⚠️ {error}</div>
          <button
            onClick={() => router.push('/lessons')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-900 flex flex-col relative">
      {/* Audio Autoplay Blocker Overlay */}
      {audioBlocked && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <button 
               onClick={handleResumeAudio}
               className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-bold text-xl flex items-center gap-3 shadow-lg transform transition-transform hover:scale-105"
            >
               <Play fill="currentColor" />
               Click to Enable Audio
            </button>
         </div>
      )}

      {/* Header */}
      <div className="bg-gray-800/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between z-10">
        <div>
          <h1 className="text-white text-xl font-bold">{lesson?.title || 'Loading...'}</h1>
          <div className="flex items-center gap-3 text-gray-400 text-sm mt-1">
            <span>By {lesson?.instructor}</span>
            <span className="flex items-center gap-1">
              <Users size={14} />
              {lesson?.currentParticipants || 0} watching
            </span>
            {hostOnline && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                LIVE
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleLeave}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
        >
          <LogOut size={18} />
          Leave
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="w-full max-w-5xl aspect-video bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700">
          <div ref={remoteVideoRef} className="w-full h-full bg-black" />
          
          {!hostOnline && isJoined && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/90 hover:bg-gray-800/80 transition-colors z-10">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 font-medium">Waiting for instructor to start streaming...</p>
            </div>
          )}

          {!isJoined && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/90 z-10">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 font-medium">Connecting to lesson...</p>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800/80 backdrop-blur-sm px-6 py-4 flex justify-center">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors ${
              isMuted ? 'bg-red-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
          </button>

          <button
            onClick={handleLeave}
            className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            title="Leave Lesson"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
