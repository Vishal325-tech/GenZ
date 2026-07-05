import React, { useState } from 'react';
import { Sparkles, Heart, Gift, Smile } from 'lucide-react';

interface CustomCardDesignerProps {
  onDesignChange: (design: {
    greetingCard: string;
    customMessage: string;
    wrap: string;
    ribbonColor: string;
  }) => void;
}

const WRAPS = [
  { id: 'none', name: 'No Custom Wrapping', price: 0 },
  { id: 'gold_mesh', name: 'Luxury Gold Mesh Wrap', price: 150 },
  { id: 'royal_red', name: 'Royal Crimson Velvet Wrap', price: 200 },
  { id: 'matte_white', name: 'Matte Ivory Ribbon Wrap', price: 120 }
];

const RIBBONS = ['Gold Shimmer', 'Crimson Red', 'Emerald Green', 'Midnight Black', 'None'];

const CARD_TEMPLATES = [
  { id: 'classic_gold', name: 'Classic Gold Filigree', icon: Sparkles, bg: 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-50 via-stone-100 to-amber-100 border-amber-300 text-stone-900' },
  { id: 'crimson_love', name: 'Crimson Romance', icon: Heart, bg: 'bg-gradient-to-tr from-rose-100 to-red-50 border-rose-300 text-rose-950' },
  { id: 'elegant_celebration', name: 'Elegant Stars', icon: Gift, bg: 'bg-gradient-to-tr from-slate-900 to-zinc-800 border-zinc-700 text-amber-100' },
  { id: 'cheerful_wishes', name: 'Cheerful Greeting', icon: Smile, bg: 'bg-gradient-to-tr from-amber-50 to-orange-50 border-amber-200 text-amber-950' }
];

const CustomCardDesigner: React.FC<CustomCardDesignerProps> = ({ onDesignChange }) => {
  const [selectedCard, setSelectedCard] = useState(CARD_TEMPLATES[0].id);
  const [message, setMessage] = useState('');
  const [selectedWrap, setSelectedWrap] = useState(WRAPS[0].id);
  const [selectedRibbon, setSelectedRibbon] = useState(RIBBONS[0]);

  const updateParent = (card: string, msg: string, wrap: string, ribbon: string) => {
    const wrapObj = WRAPS.find(w => w.id === wrap);
    onDesignChange({
      greetingCard: CARD_TEMPLATES.find(c => c.id === card)?.name || 'Classic Gold Filigree',
      customMessage: msg,
      wrap: wrapObj ? `${wrapObj.name} (+₹${wrapObj.price})` : 'None',
      ribbonColor: ribbon
    });
  };

  const handleCardSelect = (id: string) => {
    setSelectedCard(id);
    updateParent(id, message, selectedWrap, selectedRibbon);
  };

  const handleMessageChange = (val: string) => {
    setMessage(val);
    updateParent(selectedCard, val, selectedWrap, selectedRibbon);
  };

  const handleWrapSelect = (id: string) => {
    setSelectedWrap(id);
    updateParent(selectedCard, message, id, selectedRibbon);
  };

  const handleRibbonSelect = (ribbon: string) => {
    setSelectedRibbon(ribbon);
    updateParent(selectedCard, message, selectedWrap, ribbon);
  };

  const currentTemplate = CARD_TEMPLATES.find(c => c.id === selectedCard) || CARD_TEMPLATES[0];
  const Icon = currentTemplate.icon;

  return (
    <div className="bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/25 p-5 md:p-6 shadow-md">
      <h3 className="font-serif text-base font-bold text-luxury-black dark:text-white border-b border-luxury-gold/15 pb-2.5 mb-5 flex items-center gap-1.5">
        <Sparkles className="h-5 w-5 text-luxury-gold" />
        <span>Gifting & Personalization Suite</span>
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Form settings */}
        <div className="space-y-5">
          {/* Card Templates */}
          <div>
            <label className="text-xs font-bold text-luxury-black/70 dark:text-white/70 block mb-2">
              Step 1: Choose Greeting Card Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CARD_TEMPLATES.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => handleCardSelect(c.id)}
                  className={`px-3 py-2 text-xs font-medium border rounded-lg text-left transition-all ${
                    selectedCard === c.id
                      ? 'border-luxury-gold bg-luxury-cream text-luxury-black ring-1 ring-luxury-gold shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-500 hover:border-luxury-gold/50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Greeting message */}
          <div>
            <label className="text-xs font-bold text-luxury-black/70 dark:text-white/70 block mb-1">
              Step 2: Enter Custom Message
            </label>
            <textarea
              maxLength={150}
              placeholder="Write a heartwarming message to print inside the card (Max 150 characters)..."
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              className="w-full h-24 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-luxury-black dark:text-white focus:outline-none focus:ring-1 focus:ring-luxury-gold"
            />
          </div>

          {/* Luxury Wrapping Options */}
          <div>
            <label className="text-xs font-bold text-luxury-black/70 dark:text-white/70 block mb-2">
              Step 3: Select Gift Wrap Packaging
            </label>
            <div className="space-y-2">
              {WRAPS.map((w) => (
                <button
                  type="button"
                  key={w.id}
                  onClick={() => handleWrapSelect(w.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs rounded-lg border text-left transition-all ${
                    selectedWrap === w.id
                      ? 'border-luxury-red bg-luxury-cream text-luxury-black ring-1 ring-luxury-red shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-600 dark:text-neutral-400 hover:border-luxury-red/40'
                  }`}
                >
                  <span className="font-medium">{w.name}</span>
                  <span className="font-bold text-luxury-red">{w.price === 0 ? 'Free' : `+₹${w.price}`}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ribbon Selection */}
          <div>
            <label className="text-xs font-bold text-luxury-black/70 dark:text-white/70 block mb-2">
              Step 4: Choose Ribbon Accent Color
            </label>
            <div className="flex flex-wrap gap-1.5">
              {RIBBONS.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => handleRibbonSelect(r)}
                  className={`px-3 py-1.5 text-[11px] font-semibold border rounded-full transition-all ${
                    selectedRibbon === r
                      ? 'border-luxury-gold bg-luxury-gold text-luxury-black'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-luxury-gold/50 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Live visual preview */}
        <div className="flex flex-col items-center justify-center bg-luxury-cream-dark/40 dark:bg-luxury-black/30 rounded-xl p-5 border border-luxury-gold/10">
          <span className="text-[10px] uppercase font-bold text-luxury-gold mb-3 tracking-widest">
            Live Preview Inside Envelope
          </span>

          {/* Visual Card Card */}
          <div className={`w-full max-w-[280px] aspect-[4/3] rounded-xl border p-4 shadow-xl flex flex-col justify-between transition-all duration-500 hover:scale-102 ${currentTemplate.bg}`}>
            <div className="flex justify-between items-start">
              <Icon className="h-5 w-5" />
              <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">Hand-Pressed Card</span>
            </div>

            {/* Custom written text inside card */}
            <div className="my-auto py-2">
              <p className="text-xs font-serif italic text-center leading-relaxed break-words px-2">
                {message ? `"${message}"` : 'Your customized message will print beautifully here...'}
              </p>
            </div>

            <div className="text-right border-t border-current/20 pt-1.5">
              <span className="text-[8px] uppercase tracking-wider font-semibold opacity-75">Delivered with love</span>
            </div>
          </div>

          <div className="mt-4 space-y-1 text-center">
            <p className="text-[10px] font-bold text-luxury-black/60 dark:text-white/60">
              Wrapping: <span className="text-luxury-red">{WRAPS.find(w => w.id === selectedWrap)?.name}</span>
            </p>
            <p className="text-[10px] font-bold text-luxury-black/60 dark:text-white/60">
              Ribbon Accent: <span className="text-luxury-gold-dark">{selectedRibbon}</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomCardDesigner;
