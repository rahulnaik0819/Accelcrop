import { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface VaidyaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: {
    activeField: string;
    moisturePct: number;
    forecastedYieldTons: number;
    yieldVariancePct: number;
    temperatureC: number;
    soilPh: number;
  };
  onApplyActivity: (activity: string, status: 'Completed' | 'Upcoming' | 'Running') => void;
  onOpenOptimizer?: () => void;
  onOpenWaterLogger?: () => void;
}

interface Message {
  sender: 'user' | 'vaidya';
  text: string;
}

const SUGGESTIONS = [
  "What is the optimal STCR fertilizer dosage?",
  "Restore moisture balance with FAO-56 ETo",
  "Analyze Field 01 risk & labor",
  "Audit pump runtime & water efficiency"
];

function MessageContent({ text, onAction }: { text: string; onAction: (actionText: string) => void }) {
  const lines = text.split('\n');

  return (
    <div className="flex flex-col gap-1 text-xs leading-relaxed text-slate-700">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // 1. Action Button check
        if (trimmed.startsWith('[Action:') && trimmed.endsWith(']')) {
          const actionText = trimmed.slice(8, -1).trim();
          return (
            <button
              key={idx}
              onClick={() => onAction(actionText)}
              className="mt-2 w-full py-2 px-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl transition shadow-md shadow-emerald-100 flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {actionText}
            </button>
          );
        }

        // 2. Headings (### )
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-sm font-bold text-slate-800 mt-2 mb-1">
              {trimmed.slice(4)}
            </h3>
          );
        }

        // 3. Bullet points (* or -)
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const content = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-1.5 ml-2 my-0.5">
              <span className="text-emerald-500 mt-1">•</span>
              <span className="flex-1">{parseBoldText(content)}</span>
            </div>
          );
        }

        // 4. Default paragraphs
        return trimmed ? (
          <p key={idx} className="my-0.5">
            {parseBoldText(trimmed)}
          </p>
        ) : (
          <div key={idx} className="h-1" />
        );
      })}
    </div>
  );
}

function parseBoldText(text: string) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="font-bold text-slate-900">{part}</strong>;
    }
    return part;
  });
}

export default function VaidyaDrawer({
  isOpen,
  onClose,
  telemetry,
  onApplyActivity,
  onOpenOptimizer,
  onOpenWaterLogger,
}: VaidyaDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync greeting when activeField changes
  useEffect(() => {
    setMessages([
      {
        sender: 'vaidya',
        text: `### Welcome back! 👋
I'm **Vaidya AI**, your agronomic advisor. I am currently monitoring the telemetry for **${telemetry.activeField}** (Soil pH: **${telemetry.soilPh}**, Moisture: **${telemetry.moisturePct}%**).

How can I help you optimize your crop yield and resources today?`
      }
    ]);
  }, [telemetry.activeField]);

  // Auto-scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMessage: Message = { sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.chat({
        message: messageText,
        telemetry_context: {
          active_field: telemetry.activeField,
          moisture_pct: telemetry.moisturePct,
          forecasted_yield_tons: telemetry.forecastedYieldTons,
          yield_variance_pct: telemetry.yieldVariancePct,
          temperature_c: telemetry.temperatureC,
          soil_ph: telemetry.soilPh
        }
      });

      setMessages(prev => [...prev, { sender: 'vaidya', text: response.reply }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { sender: 'vaidya', text: "❌ Sorry, I'm having trouble connecting to my knowledge base right now." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (actionText: string) => {
    let activity = actionText;
    let status: 'Completed' | 'Upcoming' | 'Running' = 'Running';

    if (actionText.includes('Micro-Irrigation')) {
      activity = 'Micro-Irrigation';
      status = 'Running';
    } else if (actionText.includes('Fertilizer')) {
      activity = 'Fertilizer Optimization';
      status = 'Running';
      if (onOpenOptimizer) {
        onOpenOptimizer();
      }
    } else if (actionText.includes('Water') || actionText.includes('Pump')) {
      activity = 'Water Audit Log';
      status = 'Completed';
      if (onOpenWaterLogger) {
        onOpenWaterLogger();
      }
    } else if (actionText.includes('Leaf Sampling')) {
      activity = 'Leaf Sampling';
      status = 'Upcoming';
    }

    onApplyActivity(activity, status);

    setMessages(prev => [
      ...prev,
      {
        sender: 'vaidya',
        text: `### Task Initiated! 🚀
I've successfully scheduled and deployed the **${activity}** task to the dashboard status strip (Status: **${status}**).`
      }
    ]);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-40 transition-opacity duration-300"
        />
      )}

      {/* Drawer */}
      <div
        id="vaidya-drawer"
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col transition-all duration-300 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50/50 to-white dark:from-slate-800/80 dark:to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-100 dark:shadow-none">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">Vaidya AI Assistant</h2>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">Agronomist Co-Pilot</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Telemetry Context Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide text-[10px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
          <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">Field: {telemetry.activeField}</span>
          <span>Moisture: {telemetry.moisturePct}%</span>
          <span>Yield: {telemetry.forecastedYieldTons}t ({telemetry.yieldVariancePct}%)</span>
          <span>pH: {telemetry.soilPh}</span>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50/30 dark:bg-slate-950/40">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 max-w-[85%] ${
                msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              {msg.sender === 'vaidya' && (
                <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-emerald-600" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="text-xs">{msg.text}</p>
                ) : (
                  <MessageContent text={msg.text} onAction={handleAction} />
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-2.5 max-w-[85%] self-start">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* suggestion pills */}
        {messages.length === 1 && !loading && (
          <div className="px-4 py-2 flex flex-col gap-1.5 border-t border-slate-100 bg-white">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-emerald-500" />
              Quick Suggestions:
            </span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-xl text-[11px] font-medium border border-slate-200 hover:border-emerald-200 transition cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Panel */}
        <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
          <input
            id="drawer-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Type your message…"
            disabled={loading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:ring-1 focus:ring-emerald-300 focus:bg-white transition"
          />
          <button
            id="drawer-chat-send"
            onClick={() => handleSend(input)}
            disabled={loading || !input.trim()}
            className="w-9 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center transition shadow-md shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </>
  );
}
