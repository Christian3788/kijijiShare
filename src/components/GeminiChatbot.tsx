import { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Cpu, 
  Zap, 
  BrainCircuit, 
  MessageSquare, 
  User, 
  X,
  HelpCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface GeminiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  neighborhoodName?: string;
}

export function GeminiChatbot({
  isOpen,
  onClose,
  neighborhoodName = 'Harbord Village & Elmwood',
}: GeminiChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_initial',
      role: 'model',
      content: `Hello neighbor! I am your KijijiShare Community Concierge for ${neighborhoodName}. How can I assist you today? I can help draft a thoughtful mutual aid request, offer advice on tool care and safe porch pickups, or mediate community guidelines without monetary exchange.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map(m => ({ role: m.role, content: m.content })),
          model: selectedModel,
          neighborhood: neighborhoodName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const modelMsg: ChatMessage = {
        id: `msg_model_${Date.now()}`,
        role: 'model',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'model',
        content: `I encountered an issue connecting to the AI Studio backend (${err.message}). Please verify your network connection and try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'How do I politely decline an applicant on a gift?',
    'Draft a mutual aid request for adult crutches',
    'Tips for maintaining a shared electric lawn mower',
    'Explain the 300m location privacy circle',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[620px] shadow-2xl border border-stone-200 flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-stone-900">
                  Community Concierge
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-semibold px-2 py-0.5 rounded-full">
                  Multi-Turn AI
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Grounded advice for {neighborhoodName} · Powered by Gemini
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Model Selector Bar */}
        <div className="px-4 py-2 bg-stone-100/70 border-b border-stone-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-stone-500 font-medium text-[11px]">Reasoning Model:</span>
          <div className="flex items-center gap-1">
            {[
              { id: 'gemini-3.1-flash-lite', label: 'Flash Lite', sub: 'Fast', icon: Zap },
              { id: 'gemini-3.5-flash', label: '3.5 Flash', sub: 'General', icon: Sparkles },
              { id: 'gemini-3.1-pro-preview', label: '3.1 Pro', sub: 'Complex', icon: BrainCircuit },
            ].map(m => {
              const Icon = m.icon;
              const isSelected = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-stone-900 font-bold shadow-xs border border-stone-200'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Icon className="w-3 h-3 text-emerald-700" />
                  <span>{m.label}</span>
                  <span className="text-[10px] text-stone-400">({m.sub})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Thread Messages */}
        <div ref={scrollRef} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {messages.map(msg => {
            const isModel = msg.role === 'model';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isModel ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isModel ? 'bg-emerald-800 text-white' : 'bg-stone-800 text-white'
                }`}>
                  {isModel ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isModel
                    ? 'bg-stone-100 text-stone-800 border border-stone-200/80 rounded-tl-xs'
                    : 'bg-emerald-800 text-white rounded-tr-xs shadow-xs'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <div className={`mt-1.5 flex items-center justify-between text-[10px] ${
                    isModel ? 'text-stone-400' : 'text-emerald-200'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && <span className="font-mono">{msg.modelUsed}</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-stone-500 italic">
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                <span>{selectedModel} is thinking...</span>
              </span>
            </div>
          )}
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-4 py-2 border-t border-stone-100 bg-stone-50/50 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[11px] bg-white border border-stone-200 hover:border-emerald-600 px-2.5 py-1 rounded-full text-stone-600 hover:text-emerald-900 transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-stone-200 bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask the Community Concierge about gift matching, safety, or etiquette..."
              className="flex-1 text-xs p-3 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none placeholder:text-stone-400"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
