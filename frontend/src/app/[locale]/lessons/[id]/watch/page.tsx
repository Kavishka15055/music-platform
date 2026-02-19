'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Play, MessageSquare } from 'lucide-react';
import Chat from '@/components/Chat';
import DevicePreCheck, { DevicePreferences } from '@/components/DevicePreCheck';

interface LessonData {
  id: string;
  title: string;
  instructor: string;
  channelName: string;
  currentParticipants: number;
  status: string;
}

interface RemoteUser {
  uid: number | string;
  videoTrack: any;
  audioTrack: any;
  hasVideo: boolean;
  hasAudio: boolean;
}

export default function WatchLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [showLobby, setShowLobby] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceError, setDeviceError] = useState<{ audio?: string; video?: string }>({});
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<Map<string | number, RemoteUser>>(new Map());
  const [showChat, setShowChat] = useState(true);
  const [userName] = useState(`Student_${Math.floor(Math.random() * 1000)}`);

  const agoraEngine = useRef<any>(null);
  const clientRef = useRef<any>(null);
  const localAudioTrackRef = useRef<any>(null);
  const localVideoTrackRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const devicePrefsRef = useRef<DevicePreferences | null>(null);

  // Fetch lesson data on mount (for lobby info + status check)
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch(`http://localhost:3005/api/v1/lessons/${lessonId}`);
        if (!res.ok) throw new Error('Lesson not found');
        const data = await res.json();

        if (data.status !== 'live') {
          setError('This lesson is not currently live');
          return;
        }
        setLesson(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load lesson');
      }
    };
    fetchLesson();
  }, [lessonId]);

  // Start Agora session — only called when user clicks "Join Lesson" from the lobby
  const startSession = async (prefs: DevicePreferences) => {
    devicePrefsRef.current = prefs;
    setShowLobby(false);

    let cancelled = false;

    try {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      if (cancelled) return;

      agoraEngine.current = AgoraRTC;

      AgoraRTC.onAutoplayFailed = () => {
        if (!cancelled) setAudioBlocked(true);
      };

      // Get token
      const tokenRes = await fetch(`http://localhost:3005/api/v1/lessons/${lessonId}/token?role=host`);
      if (!tokenRes.ok) throw new Error('Failed to get token');
      const { token, channelName, uid, appId } = await tokenRes.json();

      if (cancelled) return;

      if (!appId || appId.includes('your_')) {
        setError('Agora credentials not configured');
        return;
      }

      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      clientRef.current = client;

      await client.setClientRole('host');

      // Handle remote user events
      client.on('user-published', async (user: any, mediaType: "audio" | "video") => {
        await client.subscribe(user, mediaType);

        setRemoteUsers(prev => {
          const updated = new Map(prev);
          const existing = updated.get(user.uid) || {
            uid: user.uid, videoTrack: null, audioTrack: null, hasVideo: false, hasAudio: false,
          };

          if (mediaType === 'video') {
            existing.videoTrack = user.videoTrack;
            existing.hasVideo = true;
          }
          if (mediaType === 'audio') {
            existing.audioTrack = user.audioTrack;
            existing.hasAudio = true;
            try { user.audioTrack.play(); } catch (e) {
              if (!cancelled) setAudioBlocked(true);
            }
          }

          updated.set(user.uid, { ...existing });
          return updated;
        });
      });

      client.on('user-unpublished', (user: any, mediaType: string) => {
        setRemoteUsers(prev => {
          const updated = new Map(prev);
          const existing = updated.get(user.uid);
          if (existing) {
            if (mediaType === 'video') { existing.hasVideo = false; existing.videoTrack = null; }
            if (mediaType === 'audio') { existing.hasAudio = false; existing.audioTrack = null; }
            updated.set(user.uid, { ...existing });
          }
          return updated;
        });
      });

      client.on('user-left', (user: any) => {
        setRemoteUsers(prev => {
          const updated = new Map(prev);
          updated.delete(user.uid);
          return updated;
        });
      });

      await client.join(appId, channelName, token, uid);
      if (cancelled) { client.leave(); clientRef.current = null; return; }

      // Create local tracks using selected devices from the lobby
      const tracksToPublish: any[] = [];

      if (prefs.micOn) {
        try {
          const micConfig: any = {};
          if (prefs.micDeviceId) micConfig.microphoneId = prefs.micDeviceId;
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack(micConfig);
          localAudioTrackRef.current = audioTrack;
          tracksToPublish.push(audioTrack);
          setIsMicOn(true);
        } catch (e: any) {
          console.warn('Microphone not available:', e);
          setIsMicOn(false);
          setDeviceError(prev => ({ ...prev, audio: 'Microphone in use or not found' }));
        }
      } else {
        setIsMicOn(false);
      }

      if (prefs.cameraOn) {
        try {
          const camConfig: any = {};
          if (prefs.cameraDeviceId) camConfig.cameraId = prefs.cameraDeviceId;
          const videoTrack = await AgoraRTC.createCameraVideoTrack(camConfig);
          localVideoTrackRef.current = videoTrack;
          tracksToPublish.push(videoTrack);
          setIsCameraOn(true);
        } catch (e: any) {
          console.warn('Camera not available:', e);
          setIsCameraOn(false);
          setDeviceError(prev => ({ ...prev, video: 'Camera in use by another app/tab' }));
        }
      } else {
        setIsCameraOn(false);
      }

      // Publish whatever tracks we got
      if (tracksToPublish.length > 0) {
        await client.publish(tracksToPublish);
      }

      if (cancelled) {
        if (localAudioTrackRef.current) { localAudioTrackRef.current.stop(); localAudioTrackRef.current.close(); }
        if (localVideoTrackRef.current) { localVideoTrackRef.current.stop(); localVideoTrackRef.current.close(); }
        client.leave(); clientRef.current = null;
        return;
      }

      await fetch(`http://localhost:3005/api/v1/lessons/${lessonId}/join`, { method: 'POST' });

      setIsJoined(true);
      setError(null);
    } catch (err: any) {
      console.error('Failed to join:', err);
      if (!cancelled) {
        setError(err.message || 'Failed to join lesson');
      }
    }
  };

  // Poll for lesson status
  useEffect(() => {
    if (showLobby) return; // Don't poll while in lobby

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3005/api/v1/lessons/${lessonId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'ended') {
            clearInterval(interval);
            await cleanup();
            setError('The host has ended the lesson.');
          }
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lessonId, showLobby]);

  // Play local video once the ref becomes available after isJoined state change
  useEffect(() => {
    if (isJoined && localVideoRef.current && localVideoTrackRef.current && isCameraOn) {
      localVideoTrackRef.current.play(localVideoRef.current);
    }
  }, [isJoined, isCameraOn]);

  // Play remote video when ref and track are available
  useEffect(() => {
    if (remoteVideoRef.current) {
      const firstUser = Array.from(remoteUsers.values())[0];
      if (firstUser?.videoTrack && firstUser.hasVideo) {
        try { firstUser.videoTrack.play(remoteVideoRef.current); } catch (e) { /* */ }
      }
    }
  }, [remoteUsers]);

  const cleanup = async () => {
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current.close();
      localAudioTrackRef.current = null;
    }
    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.stop();
      localVideoTrackRef.current.close();
      localVideoTrackRef.current = null;
    }

    if (clientRef.current) {
      try {
        fetch(`http://localhost:3005/api/v1/lessons/${lessonId}/leave`, { method: 'POST', keepalive: true }).catch(console.error);
      } catch (e) { /* ignore */ }

      try {
        await clientRef.current.leave();
        clientRef.current.removeAllListeners();
      } catch (e) {
        console.error(e);
      }
      clientRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => { cleanup(); };
  }, []);

  const handleResumeAudio = () => {
    remoteUsers.forEach((user) => {
      if (user.audioTrack) {
        try { user.audioTrack.play(); } catch (e) { /* ignore */ }
      }
    });
    setAudioBlocked(false);
  };

  const handleLeave = async () => {
    await cleanup();
    router.push('/lessons');
  };

  const toggleMic = async () => {
    if (localAudioTrackRef.current) {
      const newState = !isMicOn;
      await localAudioTrackRef.current.setEnabled(newState);
      setIsMicOn(newState);
    } else {
      // Retry creating track
      try {
        const AgoraRTC = agoraEngine.current;
        if (!AgoraRTC) return;
        const micConfig: any = {};
        if (devicePrefsRef.current?.micDeviceId) micConfig.microphoneId = devicePrefsRef.current.micDeviceId;
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack(micConfig);
        localAudioTrackRef.current = audioTrack;
        await clientRef.current?.publish(audioTrack);
        setIsMicOn(true);
        setDeviceError(prev => ({ ...prev, audio: undefined }));
      } catch (e) {
        console.warn('Microphone retry failed:', e);
        setDeviceError(prev => ({ ...prev, audio: 'Microphone still unavailable' }));
      }
    }
  };

  const toggleCamera = async () => {
    if (localVideoTrackRef.current) {
      const newState = !isCameraOn;
      await localVideoTrackRef.current.setEnabled(newState);
      setIsCameraOn(newState);
    } else {
      // Retry creating track
      try {
        const AgoraRTC = agoraEngine.current;
        if (!AgoraRTC) return;
        const camConfig: any = {};
        if (devicePrefsRef.current?.cameraDeviceId) camConfig.cameraId = devicePrefsRef.current.cameraDeviceId;
        const videoTrack = await AgoraRTC.createCameraVideoTrack(camConfig);
        localVideoTrackRef.current = videoTrack;
        await clientRef.current?.publish(videoTrack);
        setIsCameraOn(true);
        setDeviceError(prev => ({ ...prev, video: undefined }));
        
        // Play the video
        if (localVideoRef.current) {
            videoTrack.play(localVideoRef.current);
        }
      } catch (e) {
        console.warn('Camera retry failed:', e);
        setDeviceError(prev => ({ ...prev, video: 'Camera still unavailable' }));
      }
    }
  };

  // Get only the first remote user (the admin/host)
  const adminUser = Array.from(remoteUsers.values())[0] || null;
  const hasAdmin = adminUser !== null;

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

  // Show the pre-join lobby
  if (showLobby) {
    return (
      <div className="h-screen bg-[#1a1a2e] flex flex-col overflow-hidden text-white">
        <DevicePreCheck
          lessonTitle={lesson?.title}
          instructor={lesson?.instructor}
          onJoin={startSession}
          onBack={() => router.push('/lessons')}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#1a1a2e] flex flex-col overflow-hidden relative text-white">
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

      {/* Main Content Area: Video + Chat side-by-side */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Video GridArea */}
        <div className="flex-1 p-3 overflow-hidden">
          {!isJoined ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex flex-col items-center text-gray-400">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-medium">Connecting to lesson...</p>
              </div>
            </div>
          ) : (
            <div className={`w-full h-full grid gap-3 ${showChat ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2'}`}>
              {/* LEFT: Admin / Host video */}
              <div className="relative rounded-xl overflow-hidden bg-gray-800 border-2 border-green-500/60 shadow-lg shadow-green-500/10">
                <div
                  ref={remoteVideoRef}
                  className="w-full h-full bg-black"
                />
                {!hasAdmin || !adminUser?.hasVideo ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">A</span>
                    </div>
                    {!hasAdmin && (
                      <p className="absolute bottom-16 text-gray-400 text-sm">Waiting for host...</p>
                    )}
                  </div>
                ) : null}
                {/* Name label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-semibold">Admin</span>
                    {hasAdmin && !adminUser?.hasAudio && <MicOff size={14} className="text-red-400" />}
                  </div>
                </div>
                {hasAdmin && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-white rounded-md text-xs font-bold shadow-lg">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      LIVE
                    </span>
                  </div>
                )}
              </div>

              {/* RIGHT: User's own camera (local) */}
              <div className="relative rounded-xl overflow-hidden bg-gray-800 border-2 border-yellow-500/40 shadow-lg">
                <div
                  ref={localVideoRef}
                  className="w-full h-full bg-black"
                />
                {!isCameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 p-4 text-center z-10">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-2">
                      <span className="text-white text-2xl font-bold">Me</span>
                    </div>
                    {deviceError.video ? (
                      <div className="flex flex-col items-center">
                        <p className="text-red-400 text-xs mt-2 bg-black/60 px-2 py-1 rounded mb-2">
                          {deviceError.video}
                        </p>
                        <button 
                          onClick={toggleCamera}
                          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-full transition-colors flex items-center gap-1"
                        >
                          <VideoOff size={12} />
                          Retry Camera
                        </button>
                      </div>
                    ) : (
                       <p className="text-gray-500 text-xs mt-2">Camera Off</p>
                    )}
                  </div>
                )}
                {/* Name label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-semibold">You</span>
                    {!isMicOn && <MicOff size={14} className="text-red-400" />}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Chat Sidebar */}
        {isJoined && showChat && (
          <div className="w-80 flex-shrink-0 animate-in slide-in-from-right duration-300">
            <Chat 
              lessonId={lessonId}
              userName={userName}
              role="student"
            />
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-[#1a1a2e] border-t border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-white text-sm font-semibold truncate">{lesson?.title || 'Loading...'}</h1>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs flex-shrink-0">
            <Users size={14} />
            <span>{(hasAdmin ? 1 : 0) + 1}</span>
          </div>
        </div>

        {isJoined && (
          <div className="flex items-center gap-3 font-semibold">
            <button
              onClick={toggleMic}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                isMicOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white'
              }`}
              title={isMicOn ? 'Mute' : 'Unmute'}
            >
              {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            <button
              onClick={toggleCamera}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                isCameraOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white'
              }`}
              title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>

            <div className="w-px h-8 bg-gray-700 mx-1"></div>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                showChat ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
              title={showChat ? 'Hide Chat' : 'Show Chat'}
            >
              <MessageSquare size={20} />
            </button>

            <button
              onClick={handleLeave}
              className="h-11 px-5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all flex items-center gap-2 text-sm"
              title="End Meeting"
            >
              <PhoneOff size={18} />
              End Meeting
            </button>
          </div>
        )}

        <div className="w-20"></div>
      </div>
    </div>
  );
}
