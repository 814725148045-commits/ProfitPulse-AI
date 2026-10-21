import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  RotateCcw, 
  ShieldCheck, 
  Info,
  ArrowRight
} from 'lucide-react';
import { ChatMessage, NavigationTab } from '../../types';
import { aiCopilotService } from '../../services/aiCopilotService';
import { formatINR } from '../../utils/financialCalculations';

interface AICopilotPageProps {
  onNavigateToLeak?: (leakId: string) => void;
  onNavigateTab?: (tab: NavigationTab) => void;
}

export const AICopilotPage: React.FC<AICopilotPageProps> = ({
  onNavigateToLeak,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      role: 'assistant',
      timestamp: 'Just now',
      isDemoResponse: true,
      text: `Hello! I am your **ProfitPulse AI Financial Copilot**.\n\nI have audited your live store ledger (₹99.89L Net Sales, ₹42.25L Contribution Profit, 12 catalog products, and 6 detected profit leaks). I can answer complex questions about your margins, discount leakages, RTO return spikes, or carrier freight anomalies.\n\nSelect a suggested prompt below or type any question to begin:`,
      highlightMetrics: [
        { label: 'Audited Net Sales', value: '₹99.89 L', color: 'text-slate-900' },
        { label: 'Identified Profit at Risk', value: '₹13.80 L', color: 'text-rose-600' },
        { label: 'Avg Contribution Margin', value: '42.3%', color: 'text-emerald-600' },
      ],
      suggestedQuestions: [
        'What is causing the biggest profit loss?',
        'Which products have the weakest margins?',
        'How could we reduce discount-related losses?',
        'Explain the highest-impact finding.',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      isDemoResponse: false,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiCopilotService.generateResponse(textToSend, messages);
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          text: 'Unable to analyze query. Please try again or select one of the suggested prompts.',
          timestamp: 'Now',
          isDemoResponse: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-init-reset',
        role: 'assistant',
        timestamp: 'Just now',
        isDemoResponse: true,
        text: `Chat history cleared. What financial metric or profit leak would you like to examine next?`,
        suggestedQuestions: [
          'What is causing the biggest profit loss?',
          'Which products have the weakest margins?',
          'How could we reduce discount-related losses?',
          'Explain the highest-impact finding.',
        ],
      },
    ]);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              AI Copilot & Margin Advisor
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Deterministic Demo Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Explains verified accounting ledgers and recommends evidence-based profit recovery tactics.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold transition cursor-pointer"
          title="Clear chat history"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Demo Mode Notice Callout */}
      <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong>Deterministic Analysis Mode:</strong> Responses calculate verified figures directly from your local accounting state. AI explains evidence without hallucinating financial figures.
          </span>
        </div>
      </div>

      {/* Messages Scrollable Container */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-slate-900 text-white font-bold text-xs'
                    : 'bg-blue-600 text-white shadow-sm'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs'
                }`}
              >
                {/* Demo engine badge on assistant messages */}
                {!isUser && (
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-200/60 text-[10px] text-slate-400">
                    <span className="font-semibold text-blue-700">ProfitPulse Verified Analysis</span>
                    <span>{msg.timestamp}</span>
                  </div>
                )}

                {/* Formatted Text */}
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.text.split('\n\n').map((paragraph, pIdx) => {
                    // Headings
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h4 key={pIdx} className="font-bold text-slate-900 text-xs mt-2 mb-1">
                          {paragraph.replace('### ', '')}
                        </h4>
                      );
                    }
                    return <p key={pIdx}>{paragraph}</p>;
                  })}
                </div>

                {/* Highlight Metrics */}
                {msg.highlightMetrics && msg.highlightMetrics.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/70">
                    {msg.highlightMetrics.map((m, idx) => (
                      <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block truncate">
                          {m.label}
                        </span>
                        <span className={`font-mono font-bold text-xs mt-0.5 block ${m.color || 'text-slate-900'}`}>
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Related Finding Link */}
                {msg.relatedLeakId && onNavigateToLeak && (
                  <div className="mt-3 pt-2 border-t border-slate-200/70 flex justify-end">
                    <button
                      onClick={() => onNavigateToLeak(msg.relatedLeakId!)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Open Finding Audit Drawer <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Suggested Questions */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200/70 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Recommended Follow-Up Queries:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedQuestions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSend(q)}
                          className="text-left px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 rounded-tl-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Reconciling financial ledger and formulating evidence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200 p-2 shadow-sm shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your profit leaks, margins, discounts, or logistics costs..."
          className="flex-1 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
