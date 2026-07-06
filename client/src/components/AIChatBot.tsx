import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Sparkles, ShoppingBag } from 'lucide-react';

import { Product, INITIAL_PRODUCTS, getAssetUrl } from '../data/initialData';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  products?: Array<{
    _id: string;
    name: string;
    price: number;
    images: string[];
  }>;
}

const AIChatBot: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am your GENZ Royal Hampers Shopping Assistant. 🎁\n\nTell me: who are you shopping for, what is the occasion (e.g., Anniversary, Birthday), or your budget? I will find the perfect luxury match!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    
    // Append User Message
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();
      
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: data.reply,
        products: data.products || []
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Using offline AI fallback:", err);
      
      // Offline fallback logic: search INITIAL_PRODUCTS for keywords in user input
      const query = userText.trim().toLowerCase();
      const greetings = ['hi', 'hello', 'hey', 'greetings', 'hi!', 'hello!'];
      
      if (greetings.includes(query)) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot_fallback_${Date.now()}`,
            sender: 'bot',
            text: "Hello there! 👋 I am your Royal Shopping Assistant. Are you looking for a birthday, anniversary, or wedding gift?",
            products: []
          }
        ]);
        return;
      }

      const matchedProducts = INITIAL_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      ).slice(0, 3);

      let fallbackText = "I found some exquisite luxury gifts that might be perfect for you!";
      if (matchedProducts.length === 0) {
        fallbackText = "I'm having trouble connecting to my live luxury database right now. Could you try checking our Shop page directly for the perfect gift?";
      }

      setMessages(prev => [
        ...prev,
        {
          id: `bot_fallback_${Date.now()}`,
          sender: 'bot',
          text: fallbackText,
          products: matchedProducts.map(p => ({
            _id: p._id,
            name: p.name,
            price: p.price,
            images: [getAssetUrl(p.images[0])]
          }))
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Circle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center h-14 w-14 rounded-full bg-luxury-red text-white border border-luxury-gold shadow-lg hover:scale-105 transition-all animate-bounce hover:shadow-red-glow"
          title="Ask AI Advisor"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[500px] flex flex-col rounded-2xl border border-luxury-gold/30 bg-luxury-cream dark:bg-luxury-black-soft shadow-2xl overflow-hidden animate-scaleUp">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-luxury-red to-luxury-red-dark border-b border-luxury-gold/20 text-white">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-full bg-white/10">
                <Sparkles className="h-4 w-4 text-luxury-gold" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">AI Gift Advisor</h4>
                <div className="flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping"></span>
                  <span className="text-[10px] text-luxury-cream-light/60">Online & Ready</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-luxury-gold text-luxury-black font-medium rounded-tr-none'
                      : 'bg-white dark:bg-luxury-black text-luxury-black-dark dark:text-white rounded-tl-none border border-luxury-gold/15'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Render recommended products */}
                {msg.products && msg.products.length > 0 && (
                  <div className="w-full max-w-[85%] grid grid-cols-1 gap-2 mt-2">
                    <span className="text-[9px] uppercase tracking-wider text-luxury-gold font-bold">
                      Recommended Matches:
                    </span>
                    {msg.products.map(p => (
                      <div
                        key={p._id}
                        onClick={() => { setIsOpen(false); navigate(`/product/${p._id}`); }}
                        className="flex items-center p-2 rounded-lg bg-white dark:bg-luxury-black border border-luxury-gold/10 hover:border-luxury-gold cursor-pointer transition-all duration-300"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-10 w-10 object-cover rounded bg-neutral-100"
                        />
                        <div className="ml-2 flex-grow overflow-hidden">
                          <h5 className="text-[11px] font-semibold truncate text-luxury-black dark:text-white">
                            {p.name}
                          </h5>
                          <span className="text-[10px] font-bold text-luxury-gold">
                            Bespoke Gifting
                          </span>
                        </div>
                        <ShoppingBag className="h-3.5 w-3.5 text-luxury-gold shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center space-x-2 text-luxury-black/40 dark:text-white/40 text-xs">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce [animation-delay:0.2s]">●</span>
                <span className="animate-bounce [animation-delay:0.4s]">●</span>
                <span>AI is searching the luxury shelves...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-luxury-gold/15 bg-white dark:bg-luxury-black flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask for anniversary, birthday gifts..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow px-3 py-2 text-xs rounded-full border border-luxury-gold/20 focus:outline-none focus:border-luxury-gold bg-luxury-cream dark:bg-luxury-black-soft text-luxury-black dark:text-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-full bg-luxury-red hover:bg-luxury-red-dark text-white disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};

export default AIChatBot;
