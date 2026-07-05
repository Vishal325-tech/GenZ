import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, X, AlertTriangle } from 'lucide-react';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check SpeechRecognition support in Webkit browsers
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN'; // Indian English, catches Hindi names well

      rec.onstart = () => {
        setListening(true);
        setError('');
        setTranscript('Listening for your voice...');
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setTranscript(resultText);
        setListening(false);
        
        // Auto-redirect to shop after a brief pause
        setTimeout(() => {
          navigate(`/shop?search=${encodeURIComponent(resultText)}`);
          onClose();
        }, 1200);
      };

      rec.onerror = (event: any) => {
        console.error('Speech Recognition Error:', event.error);
        setError(`Error: ${event.error === 'not-allowed' ? 'Microphone permission denied.' : 'Speech not recognized. Please try again.'}`);
        setListening(false);
      };

      rec.onend = () => {
        setListening(false);
      };

      setRecognition(rec);
    } else {
      setError('Web Speech API is not supported in this browser. Please try Chrome, Edge, or Safari.');
    }
  }, [navigate, onClose]);

  const startListening = () => {
    if (recognition) {
      try {
        recognition.start();
      } catch (err) {
        console.warn('Recognition already started');
      }
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setListening(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Auto start listening on mount
      setTimeout(() => {
        startListening();
      }, 300);
    } else {
      stopListening();
      setTranscript('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-luxury-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-8 rounded-2xl border border-luxury-gold/30 bg-luxury-cream dark:bg-luxury-black-soft text-center shadow-2xl mx-4">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-luxury-gold hover:text-luxury-red transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <h3 className="font-serif text-xl font-semibold text-luxury-red dark:text-luxury-gold mb-6">
          Voice Search
        </h3>

        {/* Mic Circle Visual */}
        <div className="flex justify-center mb-6">
          <button
            onClick={listening ? stopListening : startListening}
            className={`relative flex items-center justify-center h-24 w-24 rounded-full transition-all duration-500 shadow-lg ${
              listening 
                ? 'bg-luxury-red text-white scale-110 shadow-red-glow' 
                : 'bg-luxury-gold text-luxury-black hover:bg-luxury-gold-hover'
            }`}
          >
            <Mic className="h-10 w-10 animate-pulse" />
            
            {/* Animated Audio Sound Waves */}
            {listening && (
              <span className="absolute inset-0 rounded-full border border-luxury-red/40 animate-ping"></span>
            )}
          </button>
        </div>

        {/* Status text */}
        <div className="min-h-[60px] px-4">
          {error ? (
            <div className="flex items-center justify-center space-x-2 text-luxury-red text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <p className={`text-base font-medium ${listening ? 'text-luxury-gold animate-pulse' : 'text-luxury-black dark:text-white'}`}>
              "{transcript || 'Click mic to speak'}"
            </p>
          )}
        </div>

        <p className="text-xs text-luxury-black/50 dark:text-white/50 mt-4">
          Tip: Say "Anniversary luxury hamper" or "Teddy Bear under 2000"
        </p>

      </div>
    </div>
  );
};

export default VoiceSearchModal;
