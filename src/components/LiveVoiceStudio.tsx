import { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Radio, 
  X, 
  CheckCircle2, 
  MessageSquare,
  Bot
} from 'lucide-react';

interface LiveVoiceStudioProps {
  isOpen: boolean;
  onClose: () => void;
  neighborhood?: string;
}

export function LiveVoiceStudio({
  isOpen,
  onClose,
  neighborhood = 'Harbord Village & Elmwood',
}: LiveVoiceStudioProps) {
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [aiSpokenResponse, setAiSpokenResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check SpeechRecognition support in browser
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setLiveTranscript(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (liveTranscript.trim()) {
        sendVoicePrompt(liveTranscript);
      }
    } else {
      setLiveTranscript('');
      setAiSpokenResponse(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start recognition directly:', err);
        setIsListening(true);
      }
    }
  };

  const sendVoicePrompt = async (transcript: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/gemini/voice-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textPrompt: transcript,
          neighborhood,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const reply = data.text || 'Understood! I will help coordinate with your neighbors.';
      setAiSpokenResponse(reply);

      // Playback via speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(reply);
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      console.error('Voice conversation error:', err);
      setAiSpokenResponse(`Live API response error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
              <Radio className="w-5 h-5 animate-pulse text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-stone-900">
                  Live Voice Assistant
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-semibold px-2 py-0.5 rounded-full font-mono">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Real-time spoken dialogue with Live API for hands-free neighbor coordination
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Visualizer Core */}
        <div className="p-8 text-center space-y-6">
          <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
            {/* Animated Pulses */}
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
                <div className="absolute -inset-4 rounded-full bg-emerald-500/10 animate-pulse"></div>
              </>
            )}
            
            <button
              onClick={toggleListening}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 scale-105 ring-4 ring-rose-300'
                  : 'bg-emerald-800 hover:bg-emerald-700 active:scale-95'
              }`}
            >
              {isListening ? (
                <Mic className="w-10 h-10 animate-bounce" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>
          </div>

          <div>
            <div className="text-sm font-bold text-stone-900">
              {isListening ? 'Listening to your voice...' : isProcessing ? 'Processing with gemini-3.8-live...' : 'Tap the microphone to speak'}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Ask about available tools, request porch pickups, or find neighbors offering help.
            </p>
          </div>

          {/* Spoken Text Transcript Box */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-left space-y-3 min-h-[100px]">
            <div>
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                Your Speech:
              </span>
              <p className="text-xs text-stone-800 font-medium mt-0.5 italic">
                {liveTranscript || (isListening ? 'Speak now...' : 'No voice detected yet.')}
              </p>
            </div>

            {aiSpokenResponse && (
              <div className="pt-2 border-t border-stone-200">
                <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Gemini 3.8 Live Voice Response:</span>
                </span>
                <p className="text-xs text-stone-900 leading-relaxed mt-0.5">
                  {aiSpokenResponse}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="text-[11px] text-stone-500">
            Powered by Gemini Live API (Audio In / Audio Out)
          </div>
          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
