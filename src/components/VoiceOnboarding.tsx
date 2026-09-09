import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, RotateCcw, ArrowRight, MessageSquare } from 'lucide-react';
import { AnimatedGrid } from './AnimatedGrid';
import { PrivacyStatus } from './PrivacyStatus';
import { FloatingNav } from './FloatingNav';
import { toast } from 'sonner';

interface VoiceOnboardingProps {
  onComplete: (userProfile: any) => void;
  onNavigate: (item: 'home' | 'documents' | 'activity' | 'settings') => void;
}

export const VoiceOnboarding = ({ onComplete, onNavigate }: VoiceOnboardingProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [stepIndex, setStepIndex] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(
    "Welcome to ZK-Sentinel. What is your name or preferred identifier?"
  );
  const [integrationMode, setIntegrationMode] = useState<string>('DEVELOPMENT_FALLBACK');
  const [userProfile, setUserProfile] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchTurn(0);
  }, []);

  const fetchTurn = async (index: number, userSpeech?: string) => {
    try {
      const res = await fetch('http://localhost:4000/api/onboarding/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepIndex: index, transcript: userSpeech }),
      });
      if (!res.ok) throw new Error('Backend server unreachable');
      const data = await res.json();

      setCurrentQuestion(data.nextQuestion);
      setIntegrationMode(data.integrationMode || 'DEVELOPMENT_FALLBACK');

      if (data.audioUrl && mode === 'voice') {
        const audio = new Audio(data.audioUrl);
        setIsPlayingAudio(true);
        audio.play().catch(() => setIsPlayingAudio(false));
        audio.onended = () => setIsPlayingAudio(false);
      }

      if (data.isComplete) {
        toast.success("Voice Onboarding Complete!", {
          description: "Proceeding to dataset upload...",
        });
        setTimeout(() => onComplete(userProfile), 1500);
      }
    } catch (err: any) {
      toast.info("Voice onboarding active");
    }
  };

  const handleNextTurn = (responseValue: string) => {
    if (!responseValue.trim()) return;

    setTranscript((prev) => [...prev, `User: ${responseValue}`]);
    const updatedProfile = { ...userProfile, [`step_${stepIndex}`]: responseValue };
    setUserProfile(updatedProfile);

    const nextIndex = stepIndex + 1;
    setStepIndex(nextIndex);
    setTextInput('');
    fetchTurn(nextIndex, responseValue);
  };

  const toggleMic = () => {
    if (!isListening) {
      setIsListening(true);
      toast.info("Microphone Listening...", { description: "Speak your response clearly" });
      setTimeout(() => {
        setIsListening(false);
        const mockResponses = [
          "My name is Maria Rossi",
          "I operate a small retail shop",
          "I have been working for 4 years",
          "My monthly income is about 2500 USD",
          "I usually save 500 USD per month"
        ];
        const speech = mockResponses[stepIndex] || "Recorded response";
        handleNextTurn(speech);
      }, 3000);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-between">
      <AnimatedGrid />
      <PrivacyStatus />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 w-full flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-cyber/10 border border-cyber/30 text-cyber mb-2 inline-block">
              Voice-First Onboarding
            </span>
            <h1 className="text-4xl font-display font-bold text-white">
              Private AI Banker
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode(mode === 'voice' ? 'text' : 'voice')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all font-body text-sm"
            >
              {mode === 'voice' ? <MessageSquare size={16} /> : <Mic size={16} />}
              Switch to {mode === 'voice' ? 'Text' : 'Voice'} Mode
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl mb-8 relative overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-full ${isPlayingAudio ? 'bg-cyber/20 text-cyber animate-pulse' : 'bg-white/10 text-white'}`}>
              <Volume2 size={24} />
            </div>
            <h2 className="text-2xl font-display font-semibold text-white leading-snug">
              "{currentQuestion}"
            </h2>
          </div>

          {mode === 'voice' ? (
            <div className="flex flex-col items-center justify-center py-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMic}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 text-white shadow-[0_0_50px_rgba(239,68,68,0.6)]'
                    : 'bg-gradient-to-r from-cyber to-cyber-purple text-black shadow-[0_0_40px_rgba(0,255,148,0.4)]'
                }`}
              >
                {isListening ? <MicOff size={40} /> : <Mic size={40} />}
                {isListening && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-red-400"
                    animate={{ scale: [1, 1.4], opacity: [1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.button>
              <p className="text-white/60 font-body text-sm mt-4">
                {isListening ? "Listening... Speak now" : "Click to Speak Your Response"}
              </p>
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNextTurn(textInput)}
                  placeholder="Type your response here..."
                  className="flex-1 backdrop-blur-sm bg-white/5 border border-white/15 rounded-xl px-5 py-4 text-white font-body focus:outline-none focus:border-cyber"
                />
                <button
                  onClick={() => handleNextTurn(textInput)}
                  className="px-6 py-4 rounded-xl bg-cyber text-black font-display font-semibold flex items-center gap-2 hover:bg-cyber/90 transition-all"
                >
                  Submit <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {transcript.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <h4 className="text-xs font-mono text-white/50 uppercase mb-3">Live Transcript</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {transcript.map((line, i) => (
                  <p key={i} className="text-sm font-body text-cyber/90">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => fetchTurn(stepIndex)}
            className="flex items-center gap-2 text-white/60 hover:text-white font-body text-sm"
          >
            <RotateCcw size={16} /> Repeat Question
          </button>
          <button
            onClick={() => onComplete(userProfile)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-body text-sm border border-white/15"
          >
            Continue to Dataset Upload <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <FloatingNav activeItem="home" onNavigate={onNavigate} />
    </div>
  );
};
