'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Monitor, MonitorOff, Loader2 } from 'lucide-react';

interface LessonData {
  id: string;
  title: string;
  channelName: string;
  currentParticipants: number;
}

export default function AdminLiveLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAgoraLoaded, setIsAgoraLoaded] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Use refs for Agora objects to avoid dependencies in useEffect
  const agoraEngine = useRef<any>(null); // Store the AgoraRTC module
  const clientRef = useRef<any>(null);
  const localAudioTrackRef = useRef<any>(null);
  const localVideoTrackRef = useRef<any>(null);
  const screenTrackRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    const loadAgora = async () => {
      try {
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        agoraEngine.current = AgoraRTC;
        setIsAgoraLoaded(true);
        console.log("Agora SDK loaded");
      } catch (e) {
        console.error("Failed to load Agora SDK", e);
        setError("Failed to load video library. Please refresh.");
      }
    };
    loadAgora();
    fetchLesson();

    return () => {
      handleLeave(true); // cleanup on unmount
    };
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const res = await fetch(`http://localhost:3005/api/v1/lessons/${lessonId}`);
      if (!res.ok) throw new Error('Lesson not found');
      const data = await res.json();
      setLesson(data);
    } catch (err) {
      setError('Failed to load lesson details');
      console.error(err);
    }
  };

  const joinChannel = async () => {
    if (!lesson || !agoraEngine.current) {
        console.warn("Cannot join: Lesson or AgoraEngine missing");
        return;
    }
    if (clientRef.current) return; // Already joined

    setIsJoining(true);
    const AgoraRTC = agoraEngine.current;

    try {
      // Get token from backend
      console.log("Fetching token...");
      const tokenRes = await fetch(`http://localhost:3005/api/v1/lessons/${lessonId}/token?role=host`);
      if (!tokenRes.ok) throw new Error('Failed to get token from backend');
      const { token, channelName, uid, appId } = await tokenRes.json();

      if (!appId || appId.includes('your_')) {
        throw new Error('Agora App ID not configured in backend .env');
      }

      console.log("Creating client...");
      // Create client
      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      clientRef.current = client;

      // Set role to host
      await client.setClientRole('host');

      // Add event listeners
      client.on('user-published', async (user: any, mediaType: string) => {
         await client.subscribe(user, mediaType);
      });
      
      client.on('connection-state-change', (curState: string, revState: string) => {
          console.log(`Connection changed from ${revState} to ${curState}`);
      });

      console.log("Joining channel:", channelName);
      // Join channel
      await client.join(appId, channelName, token, uid);

      console.log("Creating tracks...");
      // Create tracks
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = audioTrack;
      
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      localVideoTrackRef.current = videoTrack;

      // Play local video
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      console.log("Publishing tracks...");
      // Publish tracks
      await client.publish([audioTrack, videoTrack]);

      setIsJoined(true);
      setError(null);
    } catch (err: any) {
      console.error('Failed to join channel:', err);
      // Clean up if failure
      handleLeave(true);
      setError(`Connection failed: ${err.message}`);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async (cleanupOnly = false) => {
    // Stop tracks
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
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current.close();
      screenTrackRef.current = null;
    }

    // Leave channel
    if (clientRef.current) {
       try {
         await clientRef.current.leave();
       } catch (e) {
         console.error('Error leaving channel:', e);
       }
       clientRef.current = null;
    }

    if (!cleanupOnly) {
      setIsJoined(false);
    }
  };

  const toggleMic = async () => {
    if (localAudioTrackRef.current) {
      const newState = !isMicOn;
      await localAudioTrackRef.current.setEnabled(newState);
      setIsMicOn(newState);
    }
  };

  const toggleCamera = async () => {
    if (localVideoTrackRef.current) {
      const newState = !isCameraOn;
      await localVideoTrackRef.current.setEnabled(newState);
      setIsCameraOn(newState);
    }
  };

  const toggleScreenShare = async () => {
    if (!clientRef.current || !agoraEngine.current) return;
    const AgoraRTC = agoraEngine.current;

    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (screenTrackRef.current) {
          await clientRef.current.unpublish(screenTrackRef.current);
          screenTrackRef.current.stop();
          screenTrackRef.current.close();
          screenTrackRef.current = null;
        }
        // Resume camera
        if (localVideoTrackRef.current) {
           await clientRef.current.publish(localVideoTrackRef.current);
           if (localVideoRef.current) {
             localVideoTrackRef.current.play(localVideoRef.current);
           }
        }
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const screenTrack = await AgoraRTC.createScreenVideoTrack({}, 'auto');
        screenTrackRef.current = screenTrack;
        
        screenTrack.on('track-ended', () => {
           toggleScreenShare(); // Toggle back to camera
        });

        if (localVideoTrackRef.current) {
          await clientRef.current.unpublish(localVideoTrackRef.current);
        }
        
        await clientRef.current.publish(screenTrack);
        
        if (localVideoRef.current) {
          screenTrack.play(localVideoRef.current);
        }
        
        setIsScreenSharing(true);
      }
    } catch (err) {
      console.error('Screen share error:', err);
    }
  };

  const endBroadcast = async () => {
    if (confirm("Are you sure you want to end this lesson?")) {
      await handleLeave();
      
      try {
        await fetch(`http://localhost:3005/api/v1/lessons/${lessonId}/end`, { method: 'POST' });
        router.push('/admin/lessons');
      } catch (e) {
        console.error("Failed to update status", e);
        router.push('/admin/lessons');
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl p-8 text-center max-w-md">
          <div className="text-red-400 text-xl mb-4">⚠️ {error}</div>
          <p className="text-gray-400 mb-6 text-sm">Check browser console for details.</p>
          <button
            onClick={() => router.push('/admin/lessons')}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold">{lesson?.title || 'Loading...'}</h1>
          <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
            <Users size={16} />
            <span>{lesson?.currentParticipants || 0} participants</span>
            {isJoined && (
              <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                LIVE
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => router.push('/admin/lessons')}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Back
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex items-center justify-center p-6 bg-black/50">
        <div className="w-full max-w-4xl aspect-video bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700 shadow-2xl">
          <div 
             ref={localVideoRef} 
             className="w-full h-full bg-black"
             id="local-video-container"
          />
          {!isJoined && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
              <div className="p-8 rounded-2xl bg-gray-800 shadow-xl flex flex-col items-center">
                  <Video size={48} className="text-purple-500 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Ready to go live?</h3>
                  <p className="text-gray-400 mb-6 text-center max-w-xs">
                     Check your camera and microphone, then start the broadcast.
                  </p>
                  
                  {!isAgoraLoaded ? (
                     <div className="flex items-center gap-2 text-yellow-400">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Initializing Video Engine...</span>
                     </div>
                  ) : (
                      <button
                        onClick={joinChannel}
                        disabled={isJoining}
                        className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all transform hover:scale-105 ${
                           isJoining 
                           ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                           : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-purple-500/30'
                        }`}
                      >
                        {isJoining ? (
                           <>
                              <Loader2 className="animate-spin" size={20} />
                              Starting...
                           </>
                        ) : (
                           <>
                              <Video size={20} />
                              Start Broadcast
                           </>
                        )}
                      </button>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      {isJoined && (
        <div className="bg-gray-800 px-6 py-4 flex justify-center border-t border-gray-700">
          <div className="flex items-center gap-6">
            <button
              onClick={toggleMic}
              className={`p-4 rounded-full transition-all shadow-lg ${
                isMicOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white shadow-red-500/30'
              }`}
              title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
            </button>
            
            <button
              onClick={toggleCamera}
              className={`p-4 rounded-full transition-all shadow-lg ${
                isCameraOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white shadow-red-500/30'
              }`}
              title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
            
            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full transition-all shadow-lg ${
                isScreenSharing ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
              title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            >
              {isScreenSharing ? <MonitorOff size={24} /> : <Monitor size={24} />}
            </button>
            
            <div className="w-px h-10 bg-gray-700 mx-2"></div>

            <button
              onClick={endBroadcast}
              className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-lg hover:shadow-red-600/30"
              title="End Broadcast"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
