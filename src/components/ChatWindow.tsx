'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

interface ChatSession {
  id: string;
  sessionId: string;
  title: string | null;
  lastMessage: string | null;
  messages: Message[];
}

export function ChatWindow() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchSessions() {
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      if (data.code === 0) {
        setSessions(data.data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  }

  async function selectSession(session: ChatSession) {
    setCurrentSession(session);
    setMessages(session.messages);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId: currentSession?.sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const sessionId = response.headers.get('X-Session-Id');

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        // Update the last message (assistant's response) in real-time
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: assistantMessage,
          };
          return updated;
        });
      }

      // Update session info
      if (sessionId && !currentSession) {
        fetchSessions();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '抱歉，发送消息时出错了。' },
      ]);
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }

  function startNewChat() {
    setCurrentSession(null);
    setMessages([]);
  }

  return (
    <div className="flex h-[600px] bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Sessions Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <button
            onClick={startNewChat}
            className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium"
          >
            + 新对话
          </button>
        </div>
        <div className="px-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => selectSession(session)}
              className={`w-full text-left px-3 py-3 rounded-lg mb-1 transition-colors ${
                currentSession?.id === session.id
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'hover:bg-gray-200 text-gray-700'
              }`}
            >
              <div className="font-medium truncate">
                {session.title || '新对话'}
              </div>
              {session.lastMessage && (
                <div className="text-sm text-gray-500 truncate mt-1">
                  {session.lastMessage}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-20">
              <p className="text-lg">开始与 SecondMe AI 对话</p>
              <p className="text-sm mt-2">输入消息开始聊天</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.role === 'assistant' && streaming && index === messages.length - 1 && (
                  <div className="mt-2 text-sm opacity-70">正在思考...</div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="输入消息..."
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? '发送中...' : '发送'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
