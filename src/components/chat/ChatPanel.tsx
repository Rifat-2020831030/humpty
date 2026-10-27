'use client';

import React, { useState, useEffect, useRef } from 'react';
import { trpc } from '@/trpc/client';
import { Role, ChatMessageItem } from '@/types';
import { MessageSquare, Send, X } from 'lucide-react';

export interface ChatPanelProps {
  rideId: string;
  currentUserRole: Role;
  isOpen: boolean;
  onClose: () => void;
  otherPartyName?: string;
  className?: string;
}

const RIDER_QUICK_REPLIES = [
  'I am waiting outside',
  'Near the main gate',
  'On my way down',
  'Please wait 2 mins',
];

const DRIVER_QUICK_REPLIES = [
  'I have arrived',
  'Stuck in Dhaka traffic',
  'On my way to you',
  'Please come to the gate',
];

export function ChatPanel({
  rideId,
  currentUserRole,
  isOpen,
  onClose,
  otherPartyName = 'Ride Partner',
  className = '',
}: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();

  // Load message history with 1.5s short polling
  const historyQuery = trpc.chat.getMessages.useQuery(
    { rideId },
    { enabled: isOpen && !!rideId, refetchInterval: 1500 }
  );

  useEffect(() => {
    if (historyQuery.data) {
      setMessages(
        historyQuery.data.map((m) => ({
          ...m,
          senderRole: m.senderRole as Role,
        }))
      );
    }
  }, [historyQuery.data]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (saved) => {
      const typed: ChatMessageItem = {
        ...saved,
        senderRole: saved.senderRole as Role,
      };
      setMessages((prev) => {
        if (prev.some((m) => m.id === typed.id)) return prev;
        return [...prev, typed];
      });
      setInputText('');
      utils.chat.getMessages.invalidate({ rideId });
    },
  });

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      rideId,
      senderRole: currentUserRole,
      text,
    });
  };

  const quickReplies =
    currentUserRole === 'RIDER' ? RIDER_QUICK_REPLIES : DRIVER_QUICK_REPLIES;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[75vh] sm:h-[550px] overflow-hidden text-white ${className}`}
      >
        {/* Chat Drawer Header */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                <span>{otherPartyName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                In-Trip Chat • {currentUserRole}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Message Thread List */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/40"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-neutral-500">
              <MessageSquare className="w-8 h-8 mb-2 opacity-30 text-emerald-500" />
              <p className="text-xs">No messages yet.</p>
              <p className="text-[11px] text-neutral-600 mt-0.5">
                Use a quick reply or type below to contact your {otherPartyName}.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderRole === currentUserRole;
              const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      isMine
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-neutral-500 mt-1 px-1 font-mono">
                    {timeStr}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Reply Badges */}
        <div className="px-4 py-2 border-t border-neutral-900 bg-neutral-950/80 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => handleSend(reply)}
              className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-full text-[11px] text-neutral-300 whitespace-nowrap transition-colors cursor-pointer"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-neutral-800 bg-neutral-900/60 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            maxLength={500}
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sendMessageMutation.isPending}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 text-white rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPanel;
