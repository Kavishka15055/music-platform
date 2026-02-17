'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, User, ShieldCheck } from 'lucide-react';

interface Message {
  sender: string;
  message: string;
  role: string;
  timestamp: string;
}

interface ChatProps {
  lessonId: string;
  userName: string;
  role: 'host' | 'student';
}

export default function Chat({ lessonId, userName, role }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to the chat namespace
    const socket = io('http://localhost:3005/chat');
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('joinRoom', { lessonId, userName });
    });

    socket.on('message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.emit('leaveRoom', { lessonId, userName });
      socket.disconnect();
    };
  }, [lessonId, userName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && socketRef.current) {
      socketRef.current.emit('sendMessage', {
        lessonId,
        sender: userName,
        message: input.trim(),
        role: role,
      });
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-md border-l border-slate-800 w-80">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-white font-semibold flex items-center gap-2">
          Live Chat
          {isConnected ? (
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          ) : (
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </h2>
        <span className="text-xs text-slate-400">{messages.length} messages</span>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
            <p>Welcome to the chat!</p>
            <p className="text-xs mt-1">Be respectful to others.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {msg.role === 'host' ? (
                  <ShieldCheck size={14} className="text-purple-400" />
                ) : (
                  <User size={14} className="text-slate-400" />
                )}
                <span className={`text-xs font-bold ${msg.role === 'host' ? 'text-purple-400' : 'text-slate-300'}`}>
                  {msg.sender}
                  {msg.role === 'host' && <span className="ml-1 text-[10px] bg-purple-500/20 px-1 rounded">HOST</span>}
                </span>
                <span className="text-[10px] text-slate-500 ml-auto">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-slate-200 bg-slate-800/50 p-2 rounded-lg break-words">
                {msg.message}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-slate-800 text-white text-sm rounded-xl pl-4 pr-12 py-3 border border-slate-700 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-500 hover:text-purple-400 disabled:text-slate-600 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
