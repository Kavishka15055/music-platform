'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Video, VideoOff, ChevronDown, Loader2, AlertTriangle } from 'lucide-react';

interface DevicePreCheckProps {
  lessonTitle?: string;
  instructor?: string;
  onJoin: (prefs: DevicePreferences) => void;
  onBack?: () => void;
}

export interface DevicePreferences {
  cameraOn: boolean;
  micOn: boolean;
  cameraDeviceId?: string;
  micDeviceId?: string;
}

interface DeviceInfo {
  deviceId: string;
  label: string;
}

export default function DevicePreCheck({ lessonTitle, instructor, onJoin, onBack }: DevicePreCheckProps) {
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [cameras, setCameras] = useState<DeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<DeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMic, setSelectedMic] = useState('');
  const [micLevel, setMicLevel] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // Enumerate devices
  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices
        .filter(d => d.kind === 'videoinput')
        .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Camera ${i + 1}` }));
      const audioInputs = devices
        .filter(d => d.kind === 'audioinput')
        .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${i + 1}` }));

      setCameras(videoInputs);
      setMicrophones(audioInputs);

      if (videoInputs.length > 0 && !selectedCamera) {
        setSelectedCamera(videoInputs[0].deviceId);
      }
      if (audioInputs.length > 0 && !selectedMic) {
        setSelectedMic(audioInputs[0].deviceId);
      }
    } catch (e) {
      console.warn('Failed to enumerate devices:', e);
    }
  }, [selectedCamera, selectedMic]);

  // Start camera preview
  const startCamera = useCallback(async (deviceId?: string) => {
    // Stop existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    if (!cameraOn) return;

    try {
      setCameraError(null);
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Re-enumerate to get labels (after permission granted)
      await enumerateDevices();
    } catch (e: any) {
      console.warn('Camera error:', e);
      setCameraError(
        e.name === 'NotAllowedError'
          ? 'Camera permission denied'
          : e.name === 'NotFoundError'
          ? 'No camera found'
          : 'Camera in use or unavailable'
      );
    }
  }, [cameraOn, enumerateDevices]);

  // Start mic analyser
  const startMicAnalyser = useCallback(async (deviceId?: string) => {
    // Stop existing
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setMicLevel(0);

    if (!micOn) return;

    try {
      setMicError(null);
      const constraints: MediaStreamConstraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      audioStreamRef.current = stream;

      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const avg = sum / dataArray.length;
        // Normalize to 0-100
        setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();

      // Re-enumerate to get labels
      await enumerateDevices();
    } catch (e: any) {
      console.warn('Mic error:', e);
      setMicError(
        e.name === 'NotAllowedError'
          ? 'Microphone permission denied'
          : e.name === 'NotFoundError'
          ? 'No microphone found'
          : 'Microphone in use or unavailable'
      );
    }
  }, [micOn, enumerateDevices]);

  // Init on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      // Request permissions to get device labels
      try {
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        tempStream.getTracks().forEach(t => t.stop());
      } catch (e) {
        // Some devices may not have camera/mic
      }
      await enumerateDevices();
      setIsLoading(false);
    };
    init();

    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Start camera when cameraOn or selectedCamera changes
  useEffect(() => {
    if (!isLoading) {
      startCamera(selectedCamera || undefined);
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [cameraOn, selectedCamera, isLoading]);

  // Start mic when micOn or selectedMic changes
  useEffect(() => {
    if (!isLoading) {
      startMicAnalyser(selectedMic || undefined);
    }
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [micOn, selectedMic, isLoading]);

  const handleJoin = () => {
    // Stop all preview tracks before joining (Agora will create its own)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    onJoin({
      cameraOn,
      micOn,
      cameraDeviceId: selectedCamera || undefined,
      micDeviceId: selectedMic || undefined,
    });
  };

  // Mic level bar segments
  const levelSegments = 20;
  const activeSegments = Math.round((micLevel / 100) * levelSegments);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center text-gray-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-medium">Initializing devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-purple-900/30 to-indigo-900/30">
          <h2 className="text-xl font-bold text-white">Get Ready to Join</h2>
          {lessonTitle && (
            <p className="text-gray-400 text-sm mt-1">
              {lessonTitle} {instructor && <span className="text-purple-400">• {instructor}</span>}
            </p>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT: Camera Preview */}
            <div className="flex flex-col">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-gray-700">
                {cameraOn && !cameraError ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-3">
                      {cameraError ? (
                        <AlertTriangle size={28} className="text-yellow-300" />
                      ) : (
                        <VideoOff size={28} className="text-white" />
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {cameraError || 'Camera is off'}
                    </p>
                  </div>
                )}

                {/* Camera toggle overlay */}
                <button
                  onClick={() => setCameraOn(!cameraOn)}
                  className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${
                    cameraOn
                      ? 'bg-white/20 backdrop-blur text-white hover:bg-white/30'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                  title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
                >
                  {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
                </button>
              </div>

              {/* Camera selector */}
              {cameras.length > 0 && (
                <div className="relative mt-3">
                  <select
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="w-full appearance-none bg-gray-700 text-gray-200 text-sm px-4 py-2.5 pr-10 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none cursor-pointer transition-colors"
                  >
                    {cameras.map(c => (
                      <option key={c.deviceId} value={c.deviceId}>{c.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>

            {/* RIGHT: Microphone & Controls */}
            <div className="flex flex-col justify-between">
              {/* Mic Section */}
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {micOn ? (
                      <Mic size={20} className="text-green-400" />
                    ) : (
                      <MicOff size={20} className="text-red-400" />
                    )}
                    <span className="text-white font-medium text-sm">Microphone</span>
                  </div>
                  <button
                    onClick={() => setMicOn(!micOn)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      micOn
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    }`}
                  >
                    {micOn ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Audio Level Bar */}
                <div className="mb-4">
                  <div className="flex items-center gap-1 h-6">
                    {Array.from({ length: levelSegments }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-full rounded-sm transition-all duration-75 ${
                          i < activeSegments
                            ? i < levelSegments * 0.5
                              ? 'bg-green-500'
                              : i < levelSegments * 0.8
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs mt-2">
                    {micError ? (
                      <span className="text-red-400">{micError}</span>
                    ) : micOn ? (
                      micLevel > 5 ? 'Your microphone is working!' : 'Try speaking to test your mic...'
                    ) : (
                      'Microphone is muted'
                    )}
                  </p>
                </div>

                {/* Mic selector */}
                {microphones.length > 0 && (
                  <div className="relative">
                    <select
                      value={selectedMic}
                      onChange={(e) => setSelectedMic(e.target.value)}
                      className="w-full appearance-none bg-gray-700 text-gray-200 text-sm px-4 py-2.5 pr-10 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none cursor-pointer transition-colors"
                    >
                      {microphones.map(m => (
                        <option key={m.deviceId} value={m.deviceId}>{m.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Device Status Summary */}
              <div className="mt-4 bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${cameraOn && !cameraError ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-gray-400">Camera</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${micOn && !micError ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-gray-400">Microphone</span>
                  </div>
                </div>
              </div>

              {/* Join Button */}
              <button
                onClick={handleJoin}
                className="mt-4 w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2 text-base"
              >
                <Video size={20} />
                Join Lesson
              </button>

              {onBack && (
                <button
                  onClick={onBack}
                  className="mt-2 w-full py-2.5 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  ← Back to Lesson Details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
