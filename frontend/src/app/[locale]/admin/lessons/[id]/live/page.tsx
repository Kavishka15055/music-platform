'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Monitor, MonitorOff, Loader2, MessageSquare, Circle, Pause, Square } from 'lucide-react';
import Chat from '@/components/Chat';
import DevicePreCheck, { DevicePreferences } from '@/components/DevicePreCheck';

interface LessonData {
  id: string;
  title: string;
  channelName: string;
  currentParticipants: number;
}

interface RemoteUser {
  uid: number | string;
  videoTrack: any;
  audioTrack: any;
  hasVideo: boolean;
  hasAudio: boolean;
}

type RecordingState = 'idle' | 'recording' | 'paused';

export default function AdminLiveLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceError, setDeviceError] = useState<{ audio?: string; video?: string }>({});
  const [isAgoraLoaded, setIsAgoraLoaded] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<Map<string | number, RemoteUser>>(new Map());
  const [showChat, setShowChat] = useState(true);

  // Recording State
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const agoraEngine = useRef<any>(null);
  const clientRef = useRef<any>(null);
  const localAudioTrackRef = useRef<any>(null);
  const localVideoTrackRef = useRef<any>(null);
  const screenTrackRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const devicePrefsRef = useRef<DevicePreferences | null>(null);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const loadAgora = async () => {
      try {
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        agoraEngine.current = AgoraRTC;
        setIsAgoraLoaded(true);
      } catch (e) {
        console.error("Failed to load Agora SDK", e);
        setError("Failed to load video library. Please refresh.");
      }
    };
    loadAgora();
    fetchLesson();

    return () => {
      handleLeave(true);
    };
  }, [lessonId]);

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

  const joinChannel = async (prefs?: DevicePreferences) => {
    if (!lesson || !agoraEngine.current) return;
    if (clientRef.current) return;

    if (prefs) devicePrefsRef.current = prefs;
    setIsJoining(true);
    const AgoraRTC = agoraEngine.current;

    try {
      // 1. Start the lesson first (set status to LIVE)
      const startRes = await fetch(`http://localhost:3005/api/v1/lessons/${lessonId}/start`, { method: 'POST' });
      if (!startRes.ok) {
        const errData = await startRes.json().catch(() => ({}));
        // Allow if already live
        if (!errData.message?.includes('already live')) {
          throw new Error(errData.message || 'Failed to start lesson');
        }
      }

      // 2. Get host token
      const tokenRes = await fetch(`http://localhost:3005/api/v1/lessons/${lessonId}/token?role=host`);
      if (!tokenRes.ok) throw new Error('Failed to get token from backend');
      const { token, channelName, uid, appId } = await tokenRes.json();

      if (!appId || appId.includes('your_')) {
        throw new Error('Agora App ID not configured in backend .env');
      }

      // 3. Create Agora client as HOST
      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      clientRef.current = client;

      await client.setClientRole('host');

      // Handle remote users (students joining)
      client.on('user-published', async (user: any, mediaType: "audio" | "video") => {
        await client.subscribe(user, mediaType);

        setRemoteUsers(prev => {
          const updated = new Map(prev);
          const existing = updated.get(user.uid) || {
            uid: user.uid,
            videoTrack: null,
            audioTrack: null,
            hasVideo: false,
            hasAudio: false,
          };

          if (mediaType === 'video') {
            existing.videoTrack = user.videoTrack;
            existing.hasVideo = true;
          }
          if (mediaType === 'audio') {
            existing.audioTrack = user.audioTrack;
            existing.hasAudio = true;
            try { user.audioTrack.play(); } catch (e) { /* autoplay blocked */ }
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
            if (mediaType === 'video') {
              existing.hasVideo = false;
              existing.videoTrack = null;
            }
            if (mediaType === 'audio') {
              existing.hasAudio = false;
              existing.audioTrack = null;
            }
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

      // 4. Join the channel
      await client.join(appId, channelName, token, uid);

      // 5. Create and publish local tracks using device preferences
      const tracksToPublish = [];
      const dp = devicePrefsRef.current;

      if (!dp || dp.micOn) {
        try {
          const micConfig: any = {};
          if (dp?.micDeviceId) micConfig.microphoneId = dp.micDeviceId;
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack(micConfig);
          localAudioTrackRef.current = audioTrack;
          tracksToPublish.push(audioTrack);
          setIsMicOn(true);
        } catch (e) {
          console.warn('Microphone not available for admin:', e);
          setIsMicOn(false);
          setDeviceError(prev => ({ ...prev, audio: 'Microphone Error' }));
        }
      } else {
        setIsMicOn(false);
      }

      if (!dp || dp.cameraOn) {
        try {
          const camConfig: any = {};
          if (dp?.cameraDeviceId) camConfig.cameraId = dp.cameraDeviceId;
          const videoTrack = await AgoraRTC.createCameraVideoTrack(camConfig);
          localVideoTrackRef.current = videoTrack;
          tracksToPublish.push(videoTrack);
          setIsCameraOn(true);
        } catch (e) {
          console.warn('Camera not available for admin:', e);
          setIsCameraOn(false);
          setDeviceError(prev => ({ ...prev, video: 'Camera Error / In Use' }));
        }
      } else {
        setIsCameraOn(false);
      }

      if (tracksToPublish.length > 0) {
        await client.publish(tracksToPublish);
      }

      // 6. Set isJoined — the useEffect above will play the video on the ref
      setIsJoined(true);
      setError(null);
    } catch (err: any) {
      console.error('Failed to join channel:', err);
      handleLeave(true);
      setError(`Connection failed: ${err.message}`);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async (cleanupOnly = false) => {
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
      setRemoteUsers(new Map());
    }
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

  const toggleScreenShare = async () => {
    if (!clientRef.current || !agoraEngine.current) return;
    const AgoraRTC = agoraEngine.current;

    try {
      if (isScreenSharing) {
        if (screenTrackRef.current) {
          await clientRef.current.unpublish(screenTrackRef.current);
          screenTrackRef.current.stop();
          screenTrackRef.current.close();
          screenTrackRef.current = null;
        }
        if (localVideoTrackRef.current) {
          await clientRef.current.publish(localVideoTrackRef.current);
          if (localVideoRef.current) {
            localVideoTrackRef.current.play(localVideoRef.current);
          }
        }
        setIsScreenSharing(false);
      } else {
        const screenTrack = await AgoraRTC.createScreenVideoTrack({}, 'auto');
        screenTrackRef.current = screenTrack;

        screenTrack.on('track-ended', () => {
          toggleScreenShare();
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `lesson-recording-${new Date().toISOString()}.webm`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        // Stop all tracks to stop the "sharing" indicator
        stream.getTracks().forEach(track => track.stop());
        
        setRecordingState('idle');
      };

      // Handle user clicking "Stop Sharing" on the browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      mediaRecorder.start(1000); // Collect 1s chunks
      setRecordingState('recording');
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Failed to start recording. Please try again.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      // State reset happens in onstop event
    }
  };

  const endBroadcast = async () => {
    if (confirm("Are you sure you want to end this lesson?")) {
      // Auto-stop/save recording if active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      await handleLeave();

      try {
        await fetch(`http://localhost:3005/api/v1/lessons/${lessonId}/end`, { method: 'POST' });
        router.push(`/admin/lessons`);
      } catch (e) {
        console.error("Failed to update status", e);
        router.push(`/admin/lessons`);
      }
    }
  };

  // Get only the first remote user (the student)
  const studentUser = Array.from(remoteUsers.values())[0] || null;
  const hasStudent = studentUser !== null;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="bg-gray-800 rounded-xl p-8 text-center max-w-md border border-slate-700">
          <div className="text-red-400 text-xl mb-4">⚠️ {error}</div>
          <p className="text-gray-400 mb-6 text-sm">Check browser console for details.</p>
          <button
            onClick={() => router.push(`/admin/lessons`)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#1a1a2e] flex flex-col overflow-hidden text-white">
      {/* Main Content Area: Video + Chat side-by-side */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Video Grid Area */}
        <div className="flex-1 p-3 overflow-hidden">
          {!isJoined ? (
            /* Pre-join Device Check Screen */
            isJoining ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center text-gray-400">
                  <Loader2 className="animate-spin mb-4" size={40} />
                  <p className="font-medium">Starting broadcast...</p>
                </div>
              </div>
            ) : !isAgoraLoaded ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Initializing Video Engine...</span>
                </div>
              </div>
            ) : (
              <DevicePreCheck
                lessonTitle={lesson?.title}
                onJoin={(prefs) => joinChannel(prefs)}
                onBack={() => router.push('/admin/lessons')}
              />
            )
          ) : (
            /* Two side-by-side frames: Admin (local) + User (remote) */
            <div className={`w-full h-full grid gap-3 ${showChat ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2'}`}>
              {/* LEFT: Admin's own camera (local) */}
              <div className="relative rounded-xl overflow-hidden bg-gray-800 border-2 border-green-500/60 shadow-lg shadow-green-500/10">
                <div
                  ref={localVideoRef}
                  className="w-full h-full bg-black"
                />
                {!isCameraOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 p-4 text-center z-10">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-2">
                      <span className="text-white text-2xl font-bold">A</span>
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
                    <span className="text-white text-sm font-semibold">Admin</span>
                    {!isMicOn && <MicOff size={14} className="text-red-400" />}
                    {isScreenSharing && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Sharing Screen</span>
                    )}
                  </div>
                </div>
                {/* LIVE badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-white rounded-md text-xs font-bold shadow-lg">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                </div>
              </div>

              {/* RIGHT: Student / User (remote) */}
              <div className="relative rounded-xl overflow-hidden bg-gray-800 border-2 border-yellow-500/40 shadow-lg">
                <div
                  ref={remoteVideoRef}
                  className="w-full h-full bg-black"
                />
                {!hasStudent || !studentUser?.hasVideo ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">U</span>
                    </div>
                    {!hasStudent && (
                      <p className="absolute bottom-16 text-gray-400 text-sm">Waiting for student...</p>
                    )}
                  </div>
                ) : null}
                {/* Name label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-semibold">
                      {hasStudent ? `User ${String(studentUser.uid).slice(-4)}` : 'Student'}
                    </span>
                    {hasStudent && !studentUser?.hasAudio && <MicOff size={14} className="text-red-400" />}
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
              userName="Admin"
              role="host"
            />
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-[#1a1a2e] border-t border-gray-800 px-6 py-3 flex items-center justify-between">
        {/* Left: Lesson info */}
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-white text-sm font-semibold truncate">{lesson?.title || 'Loading...'}</h1>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs flex-shrink-0">
            <Users size={14} />
            <span>{(hasStudent ? 1 : 0) + 1}</span>
          </div>
        </div>

        {/* Center: Controls */}
        {isJoined && (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMic}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                isMicOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white'
              }`}
              title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
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

            <button
              onClick={toggleScreenShare}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                isScreenSharing ? 'bg-green-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
              title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            >
              {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
            </button>

            <div className="w-px h-8 bg-gray-700 mx-1"></div>
            
            {/* Recording Controls */}
            {recordingState === 'idle' ? (
              <button
                onClick={startRecording}
                className="w-11 h-11 rounded-full flex items-center justify-center bg-gray-700 text-white hover:bg-gray-600 transition-all"
                title="Start Recording"
              >
                <Circle size={20} className="text-red-500 fill-current" />
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2 bg-gray-800 rounded-full px-2 py-1 border border-red-500/30">
                  <div className={`w-2 h-2 rounded-full ${recordingState === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                  <span className="text-xs font-mono w-16 text-center">
                    {recordingState === 'recording' ? 'REC' : 'PAUSED'}
                  </span>
                  
                  {recordingState === 'recording' ? (
                    <button
                      onClick={pauseRecording}
                      className="p-1.5 hover:bg-gray-700 rounded-full text-white"
                      title="Pause Recording"
                    >
                      <Pause size={14} fill="currentColor" />
                    </button>
                  ) : (
                    <button
                      onClick={resumeRecording}
                      className="p-1.5 hover:bg-gray-700 rounded-full text-white"
                      title="Resume Recording"
                    >
                      <Circle size={14} className="text-red-500 fill-current" />
                    </button>
                  )}
                  
                  <button
                    onClick={stopRecording}
                    className="p-1.5 hover:bg-gray-700 rounded-full text-white"
                    title="Stop Recording"
                  >
                    <Square size={14} fill="currentColor" />
                  </button>
                </div>
              </>
            )}

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
              onClick={endBroadcast}
              className="h-11 px-5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all flex items-center gap-2 text-sm font-semibold"
              title="End Meeting"
            >
              <PhoneOff size={18} />
              End Meeting
            </button>
          </div>
        )}

        {/* Right: Back button */}
        <button
          onClick={() => router.push(`/admin/lessons`)}
          className="text-gray-500 hover:text-white text-sm transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
