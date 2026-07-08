import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, Image, Video, Camera, Calendar, Clock, Globe, Lock,
  Send, Sparkles, Heart, Hash, MessageSquare, Gift, User, Mail,
  Phone, MapPin, Instagram, Facebook, Youtube, Linkedin, ExternalLink,
  ChevronDown, Eye, Trash2, AlertCircle, CheckCircle2, Play, Pause, Loader2
} from 'lucide-react';
import StoryViewer from '../components/StoryViewer';

const getApiBase = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  if (url.endsWith('/api')) return url;
  if (url.endsWith('/api/')) return url.slice(0, -1);
  return `${url}/api`;
};
const API_BASE = getApiBase();

const OCCASIONS = [
  'Birthday', 'Anniversary', 'Wedding', 'Proposal', 'Engagement',
  'Baby Shower', 'Housewarming', 'Graduation', 'Retirement',
  "Mother's Day", "Father's Day", "Valentine's Day", 'Christmas',
  'Diwali', 'New Year', 'Congratulations', 'Corporate Celebration',
  'Festival', 'Custom Occasion'
];

const DURATION_OPTIONS = [
  { value: '24h', label: '24 Hours' },
  { value: '48h', label: '48 Hours' },
  { value: '3d', label: '3 Days' },
  { value: '7d', label: '7 Days' },
  { value: 'custom', label: 'Custom' },
];

const MUSIC_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'happy_birthday', label: 'Happy Birthday Tune 🎂' },
  { value: 'anniversary', label: 'Anniversary Beats 💍' },
  { value: 'romantic', label: 'Romantic Melody 💝' },
  { value: 'celebration', label: 'Celebration Pop 🎉' },
  { value: 'acoustic', label: 'Calm Acoustic 🎸' },
  { value: 'corporate', label: 'Corporate Vibe 💼' },
  { value: 'lullaby', label: 'Soft Lullaby 🍼' },
  { value: 'party', label: 'Energetic Party 🎆' },
  { value: 'wedding', label: 'Wedding Bells 💒' },
  { value: 'custom_url', label: 'Custom Audio URL 🌐' },
];

const MUSIC_URLS: Record<string, string> = {
  happy_birthday: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  anniversary: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  romantic: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  celebration: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  acoustic: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  corporate: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  lullaby: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  party: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  wedding: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
};

const occasionEmoji: Record<string, string> = {
  Birthday: '🎂', Anniversary: '💍', Wedding: '💒', Proposal: '💍',
  Engagement: '💍', 'Baby Shower': '🍼', Housewarming: '🏠',
  Graduation: '🎓', Retirement: '🎉', "Mother's Day": '🌸',
  "Father's Day": '👔', "Valentine's Day": '💝', Christmas: '🎄',
  Diwali: '🪔', 'New Year': '🎆', Congratulations: '🎊',
  'Corporate Celebration': '🏢', Festival: '🎊', 'Custom Occasion': '🌟'
};

const SubmitStory: React.FC = () => {
  // Form State
  const [formData, setFormData] = useState({
    customerName: '', email: '', mobile: '', city: '', state: '', country: 'India',
    occasion: '', customOccasion: '', title: '', caption: '', personalMessage: '',
    giftMessage: '', hashtags: '',
    celebrationDate: '', publishTime: '', storyDuration: '24h', customDurationHours: 24,
    visibility: 'public', hideComments: false, allowSharing: true, backgroundMusic: '', customMusicUrl: '',
    brideName: '', groomName: '',
    socialMedia: { instagram: '', facebook: '', youtube: '', website: '', linkedin: '' },
    showSocialMedia: false,
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [coverPreview, setCoverPreview] = useState('');
  const [thumbPreview, setThumbPreview] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiWishes, setAiWishes] = useState<{ wishes: string; hashtags: string[]; giftSuggestions: string[] } | null>(null);
  const [error, setError] = useState('');
  const [isPreviewingStory, setIsPreviewingStory] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  // Stop music preview if dropdown changes or user navigates
  useEffect(() => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
      setIsAudioLoading(false);
    }
  }, [step, formData.backgroundMusic, formData.customMusicUrl]);

  const togglePreview = () => {
    if (!formData.backgroundMusic) return;
    
    const url = formData.backgroundMusic === 'custom_url'
      ? formData.customMusicUrl
      : MUSIC_URLS[formData.backgroundMusic];

    if (!url) {
      alert("Please paste a valid audio URL first!");
      return;
    }

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(url);
    } else if (previewAudioRef.current.src !== url) {
      previewAudioRef.current.pause();
      previewAudioRef.current.src = url;
    }

    // Set up audio events for loading state
    previewAudioRef.current.onwaiting = () => setIsAudioLoading(true);
    previewAudioRef.current.onloadstart = () => setIsAudioLoading(true);
    
    previewAudioRef.current.onplaying = () => {
      setIsAudioLoading(false);
      setIsPreviewPlaying(true);
    };

    previewAudioRef.current.onended = () => {
      setIsPreviewPlaying(false);
      setIsAudioLoading(false);
    };

    previewAudioRef.current.onerror = () => {
      setIsAudioLoading(false);
      setIsPreviewPlaying(false);
      alert("Could not play this audio. Please check the URL format (must be a direct audio link like .mp3).");
    };

    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
      setIsAudioLoading(false);
    } else {
      setIsAudioLoading(true);
      previewAudioRef.current.play().catch(err => {
        console.log('Play failed:', err);
        setIsAudioLoading(false);
        setIsPreviewPlaying(false);
      });
    }
  };

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 5;

  // Input change handler
  const handleChange = (field: string, value: any) => {
    if (field.startsWith('socialMedia.')) {
      const subField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: { ...prev.socialMedia, [subField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Photo upload
  const handlePhotoUpload = (files: FileList | null) => {
    if (!files) return;
    if (photos.length >= 5) {
      alert("Your photo upload limit has been reached (max 5 photos).");
      return;
    }
    const totalSelected = photos.length + files.length;
    if (totalSelected > 5) {
      alert(`You can only upload up to 5 photos. We added ${5 - photos.length} photos to reach your limit.`);
    }
    const newFiles = Array.from(files).slice(0, 5 - photos.length);
    const newPhotos = [...photos, ...newFiles].slice(0, 5);
    setPhotos(newPhotos);
    const previews = newPhotos.map(f => URL.createObjectURL(f));
    setPhotoPreviews(previews);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  // Video upload
  const handleVideoUpload = (files: FileList | null) => {
    if (!files) return;
    if (videos.length >= 1) {
      alert("Your video upload limit has been reached (max 1 video).");
      return;
    }
    const newFiles = Array.from(files).slice(0, 1 - videos.length);
    const newVideos = [...videos, ...newFiles].slice(0, 1);
    setVideos(newVideos);
    const previews = newVideos.map(f => URL.createObjectURL(f));
    setVideoPreviews(previews);

    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  // Cover photo
  const handleCoverUpload = (files: FileList | null) => {
    if (!files || !files[0]) return;
    setCoverPhoto(files[0]);
    setCoverPreview(URL.createObjectURL(files[0]));
  };

  // Thumbnail
  const handleThumbUpload = (files: FileList | null) => {
    if (!files || !files[0]) return;
    setThumbnail(files[0]);
    setThumbPreview(URL.createObjectURL(files[0]));
  };

  // Remove media
  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
    setVideoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeCover = () => {
    setCoverPhoto(null);
    setCoverPreview('');
  };

  const removeThumb = () => {
    setThumbnail(null);
    setThumbPreview('');
  };

  // Drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files) {
      const imageFiles: File[] = [];
      const videoFiles: File[] = [];
      Array.from(files).forEach(f => {
        if (f.type.startsWith('image/')) imageFiles.push(f);
        if (f.type.startsWith('video/')) videoFiles.push(f);
      });
      if (imageFiles.length) handlePhotoUpload(createFileList(imageFiles));
      if (videoFiles.length) handleVideoUpload(createFileList(videoFiles));
    }
  }, [photos, videos]);

  // AI Wishes
  const fetchAIWishes = async () => {
    if (!formData.occasion) return;
    try {
      const res = await fetch(`${API_BASE}/stories/ai-wishes?occasion=${encodeURIComponent(formData.occasion)}`);
      const data = await res.json();
      setAiWishes(data);
    } catch {
      // Fallback local wishes
      setAiWishes({
        wishes: `Wishing you the most wonderful ${formData.occasion} celebration! May this special day bring you joy, love, and unforgettable memories. ✨`,
        hashtags: [`#${formData.occasion.replace(/\s/g, '')}`, '#GENZRoyalHampers', '#CelebrateLife'],
        giftSuggestions: ['Premium Gift Hamper', 'Luxury Celebration Box']
      });
    }
  };

  // Submit
  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      // Upload media files first
      const mediaUrls: { photos: string[]; videos: string[]; coverPhoto?: string; thumbnail?: string } = {
        photos: [], videos: []
      };

      const allFiles = [
        ...photos.map(f => ({ file: f, type: 'photo' as const })),
        ...videos.map(f => ({ file: f, type: 'video' as const })),
        ...(coverPhoto ? [{ file: coverPhoto, type: 'cover' as const }] : []),
        ...(thumbnail ? [{ file: thumbnail, type: 'thumb' as const }] : []),
      ];

      if (allFiles.length > 0) {
        const formDataUpload = new FormData();
        allFiles.forEach(({ file }) => formDataUpload.append('media', file));

        const uploadRes = await fetch(`${API_BASE}/stories/upload-media`, {
          method: 'POST',
          body: formDataUpload
        });
        const uploadData = await uploadRes.json();

        if (uploadData.files) {
          let idx = 0;
          photos.forEach(() => {
            if (uploadData.files[idx]) mediaUrls.photos.push(uploadData.files[idx].url);
            idx++;
          });
          videos.forEach(() => {
            if (uploadData.files[idx]) mediaUrls.videos.push(uploadData.files[idx].url);
            idx++;
          });
          if (coverPhoto && uploadData.files[idx]) {
            mediaUrls.coverPhoto = uploadData.files[idx].url;
            idx++;
          }
          if (thumbnail && uploadData.files[idx]) {
            mediaUrls.thumbnail = uploadData.files[idx].url;
          }
        }
      }

      // Submit story
      const storyPayload = {
        ...formData,
        brideName: ['Anniversary', 'Wedding', 'Proposal'].includes(formData.occasion) ? formData.brideName : '',
        groomName: ['Anniversary', 'Wedding', 'Proposal'].includes(formData.occasion) ? formData.groomName : '',
        backgroundMusic: formData.backgroundMusic === 'custom_url' ? formData.customMusicUrl : formData.backgroundMusic,
        photos: mediaUrls.photos,
        videos: mediaUrls.videos,
        coverPhoto: mediaUrls.coverPhoto || '',
        thumbnail: mediaUrls.thumbnail || '',
        hashtags: formData.hashtags.split(',').map(t => t.trim()).filter(Boolean),
        celebrationDate: formData.celebrationDate ? new Date(formData.celebrationDate).toISOString() : new Date().toISOString(),
        publishTime: formData.publishTime ? new Date(formData.publishTime).toISOString() : (formData.celebrationDate ? new Date(formData.celebrationDate).toISOString() : new Date().toISOString()),
      };

      const res = await fetch(`${API_BASE}/stories/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyPayload)
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Failed to submit story.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Validation
  const isStepValid = (s: number) => {
    switch (s) {
      case 1: return formData.customerName && formData.email && formData.mobile;
      case 2:
        if (!formData.occasion) return false;
        if (['Anniversary', 'Wedding', 'Proposal'].includes(formData.occasion)) {
          return !!(formData.brideName && formData.groomName);
        }
        return true;
      case 3: return true; // Media is optional
      case 4: return formData.title && formData.celebrationDate && formData.publishTime;
      case 5: return true;
      default: return true;
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-luxury-cream to-celebration-soft-pink-light/30">
        <motion.div
          className="max-w-md w-full luxury-glass rounded-3xl p-8 text-center shadow-celebration"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          >
            🎉
          </motion.div>
          <h2 className="text-2xl font-serif font-bold celebration-text-gradient mb-3">
            Story Submitted!
          </h2>
          <p className="text-luxury-black-light/70 text-sm leading-relaxed mb-6">
            Your celebration story has been submitted successfully! Our team will review it and publish it on your chosen date. You'll receive an email notification once it's approved. ✨
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.href = '/'}
              className="btn-celebration rounded-full py-3 px-6 text-sm font-semibold"
            >
              Back to Home
            </button>
            <button
              onClick={() => { setSubmitted(false); setStep(1); setFormData(prev => ({ ...prev, customerName: '', email: '', title: '' })); }}
              className="text-sm text-celebration-rose-gold hover:text-luxury-gold transition-colors"
            >
              Submit Another Story
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream via-white to-celebration-soft-pink-light/20 py-8 px-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-celebration-gold-light/50 border border-luxury-gold/20 mb-4"
        >
          <Sparkles className="w-4 h-4 text-luxury-gold" />
          <span className="text-xs font-semibold text-luxury-gold">GENZ Royal Hampers</span>
        </motion.div>
        <motion.h1
          className="text-3xl sm:text-4xl font-serif font-bold celebration-text-gradient mb-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Share Your Celebration Story ✨
        </motion.h1>
        <motion.p
          className="text-sm text-luxury-black-light/60 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Celebrate your special moments with the world. Your story will be published on our website after approval.
        </motion.p>
      </div>

      {/* Progress Steps */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-luxury-gold/10">
            <div
              className="h-full bg-gradient-to-r from-luxury-gold to-celebration-rose-gold transition-all duration-500"
              style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>
          {['Personal', 'Occasion', 'Media', 'Details', 'Review'].map((label, i) => (
            <button
              key={label}
              onClick={() => { if (i + 1 <= step) setStep(i + 1); }}
              className={`relative z-10 flex flex-col items-center gap-1.5 transition-all ${
                i + 1 <= step ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i + 1 < step
                  ? 'bg-gradient-to-br from-luxury-gold to-celebration-rose-gold text-white shadow-gold-glow'
                  : i + 1 === step
                    ? 'bg-gradient-to-br from-celebration-royal-purple to-celebration-rose-gold text-white shadow-celebration'
                    : 'bg-white border-2 border-luxury-gold/20 text-luxury-gold/50'
              }`}>
                {i + 1 < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-[10px] font-semibold text-luxury-black-light/60 hidden sm:block">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="luxury-glass rounded-2xl p-6 sm:p-8 shadow-celebration"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            {/* ═══ STEP 1: Personal Info ═══ */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-6">
                  <User className="w-5 h-5 text-luxury-gold" />
                  <h2 className="text-lg font-serif font-bold text-luxury-black-light">Your Details</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField icon={<User className="w-4 h-4" />} label="Full Name *" value={formData.customerName} onChange={v => handleChange('customerName', v)} placeholder="Your name" />
                  <InputField icon={<Mail className="w-4 h-4" />} label="Email *" type="email" value={formData.email} onChange={v => handleChange('email', v)} placeholder="your@email.com" />
                  <InputField icon={<Phone className="w-4 h-4" />} label="Mobile *" value={formData.mobile} onChange={v => handleChange('mobile', v)} placeholder="+91 XXXXX XXXXX" />
                  <InputField icon={<MapPin className="w-4 h-4" />} label="City" value={formData.city} onChange={v => handleChange('city', v)} placeholder="Mumbai" />
                  <InputField icon={<MapPin className="w-4 h-4" />} label="State" value={formData.state} onChange={v => handleChange('state', v)} placeholder="Maharashtra" />
                  <InputField icon={<Globe className="w-4 h-4" />} label="Country" value={formData.country} onChange={v => handleChange('country', v)} placeholder="India" />
                </div>
              </div>
            )}

            {/* ═══ STEP 2: Occasion ═══ */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-6">
                  <Heart className="w-5 h-5 text-celebration-rose-gold" />
                  <h2 className="text-lg font-serif font-bold text-luxury-black-light">Select Occasion</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {OCCASIONS.map(occ => (
                    <motion.button
                      key={occ}
                      onClick={() => { handleChange('occasion', occ); fetchAIWishes(); }}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        formData.occasion === occ
                          ? 'border-luxury-gold bg-celebration-gold-light/30 shadow-gold-glow'
                          : 'border-luxury-gold/10 hover:border-luxury-gold/30 bg-white/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-xl">{occasionEmoji[occ]}</span>
                      <span className="block text-xs font-semibold text-luxury-black-light mt-1">{occ}</span>
                    </motion.button>
                  ))}
                </div>

                {['Anniversary', 'Wedding', 'Proposal'].includes(formData.occasion) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gradient-to-r from-rose-50/50 to-pink-50/50 border border-pink-100 animate-fade-in">
                    <InputField
                      icon={<User className="w-4 h-4" />}
                      label="Bride's Name *"
                      value={formData.brideName || ''}
                      onChange={v => handleChange('brideName', v)}
                      placeholder="Bride's Name"
                    />
                    <InputField
                      icon={<User className="w-4 h-4" />}
                      label="Groom's Name *"
                      value={formData.groomName || ''}
                      onChange={v => handleChange('groomName', v)}
                      placeholder="Groom's Name"
                    />
                  </div>
                )}

                {formData.occasion === 'Custom Occasion' && (
                  <InputField
                    icon={<Sparkles className="w-4 h-4" />}
                    label="Custom Occasion Name"
                    value={formData.customOccasion}
                    onChange={v => handleChange('customOccasion', v)}
                    placeholder="Enter your occasion"
                  />
                )}

                {/* AI Generated Wishes Preview */}
                {aiWishes && (
                  <motion.div
                    className="p-4 rounded-xl bg-gradient-to-r from-celebration-gold-light/40 to-celebration-soft-pink-light/40 border border-luxury-gold/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-luxury-gold" />
                      <span className="text-xs font-bold text-luxury-gold">AI-Generated Wishes ✨</span>
                    </div>
                    <p className="text-sm text-luxury-black-light/80 leading-relaxed italic">{aiWishes.wishes}</p>
                    {aiWishes.giftSuggestions.length > 0 && (
                      <div className="mt-3">
                        <span className="text-[10px] font-bold text-celebration-rose-gold uppercase">Gift Ideas:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {aiWishes.giftSuggestions.map((g, i) => (
                            <span key={i} className="text-[10px] bg-white/60 text-luxury-black-light/70 rounded-full px-2 py-0.5 border border-luxury-gold/10">
                              🎁 {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* ═══ STEP 3: Media Upload ═══ */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-6">
                  <Camera className="w-5 h-5 text-celebration-royal-purple" />
                  <h2 className="text-lg font-serif font-bold text-luxury-black-light">Upload Media</h2>
                </div>

                {/* Drag & Drop Zone */}
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                    dragActive
                      ? 'border-luxury-gold bg-celebration-gold-light/20 scale-[1.02]'
                      : 'border-luxury-gold/20 hover:border-luxury-gold/40'
                  }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-10 h-10 text-luxury-gold/50 mx-auto mb-3" />
                  <p className="text-sm text-luxury-black-light/60 mb-1">
                    Drag & drop your photos and videos here
                  </p>
                  <p className="text-[10px] text-luxury-black-light/40 mb-4">
                    Max 5 photos • Max 1 video • JPG, PNG, GIF, MP4, MOV
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-luxury-gold/10 to-celebration-rose-gold/10 border border-luxury-gold/20 text-xs font-semibold text-luxury-gold hover:shadow-gold-glow transition-all"
                    >
                      <Image className="w-3.5 h-3.5" />
                      Photos ({photos.length}/5)
                    </button>
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-celebration-royal-purple/10 to-celebration-rose-gold/10 border border-celebration-royal-purple/20 text-xs font-semibold text-celebration-royal-purple hover:shadow-celebration transition-all"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Videos ({videos.length}/1)
                    </button>
                  </div>
                </div>

                <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotoUpload(e.target.files)} />
                <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime,video/*,.mp4,.mov" className="hidden" onChange={e => handleVideoUpload(e.target.files)} />
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleCoverUpload(e.target.files)} />
                <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleThumbUpload(e.target.files)} />

                {/* Photo Previews */}
                {photoPreviews.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-luxury-black-light/60 mb-2 block">Photos</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {photoPreviews.map((url, i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden aspect-square border border-luxury-gold/10">
                          <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removePhoto(i)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video Previews */}
                {videoPreviews.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-luxury-black-light/60 mb-2 block">Videos</label>
                    <div className="grid grid-cols-2 gap-2">
                      {videoPreviews.map((url, i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden aspect-video border border-luxury-gold/10">
                          <video src={url} className="w-full h-full object-cover" muted />
                          <button
                            onClick={() => removeVideo(i)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                          <div className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                            <Video className="w-2.5 h-2.5 inline mr-0.5" />Video
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover & Thumbnail */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-luxury-black-light/60 mb-2 block">Cover Photo</label>
                    <div className="relative group rounded-xl overflow-hidden aspect-video border border-luxury-gold/10 bg-white">
                      {coverPreview ? (
                        <>
                          <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => coverInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-full bg-white/95 text-[10px] font-bold text-[#b32454] shadow-md hover:scale-105 transition-all"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeCover(); }}
                              className="px-3 py-1.5 rounded-full bg-red-600/95 text-[10px] font-bold text-white shadow-md hover:scale-105 transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          className="w-full h-full flex flex-col items-center justify-center text-center hover:bg-rose-50/10 transition-all"
                        >
                          <Camera className="w-5 h-5 text-luxury-gold/40 mx-auto" />
                          <span className="text-[10px] text-luxury-gold/40 block mt-1">Upload Cover Photo</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-luxury-black-light/60 mb-2 block">Thumbnail</label>
                    <div className="relative group rounded-xl overflow-hidden aspect-video border border-celebration-rose-gold/10 bg-white">
                      {thumbPreview ? (
                        <>
                          <img src={thumbPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => thumbInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-full bg-white/95 text-[10px] font-bold text-[#b32454] shadow-md hover:scale-105 transition-all"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeThumb(); }}
                              className="px-3 py-1.5 rounded-full bg-red-600/95 text-[10px] font-bold text-white shadow-md hover:scale-105 transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => thumbInputRef.current?.click()}
                          className="w-full h-full flex flex-col items-center justify-center text-center hover:bg-rose-50/10 transition-all"
                        >
                          <Eye className="w-5 h-5 text-celebration-rose-gold/40 mx-auto" />
                          <span className="text-[10px] text-celebration-rose-gold/40 block mt-1">Story Thumbnail</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview draft button in step 3 */}
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPreviewingStory(true)}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full border border-[#b32454] text-xs font-bold text-[#b32454] hover:bg-rose-50/50 transition-all shadow-md"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview Story Draft 👁️
                  </button>
                </div>
              </div>
            )}

            {/* ═══ STEP 4: Details & Schedule ═══ */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="w-5 h-5 text-luxury-gold" />
                  <h2 className="text-lg font-serif font-bold text-luxury-black-light">Celebration Details</h2>
                </div>

                <InputField icon={<Sparkles className="w-4 h-4" />} label="Title *" value={formData.title} onChange={v => handleChange('title', v)} placeholder="Happy 25th Birthday Priya! 🎂" />
                <InputField icon={<MessageSquare className="w-4 h-4" />} label="Short Caption" value={formData.caption} onChange={v => handleChange('caption', v)} placeholder="A celebration to remember..." />

                <div>
                  <label className="text-xs font-bold text-luxury-black-light/60 mb-1.5 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-celebration-rose-gold" /> Personal Message
                  </label>
                  <textarea
                    value={formData.personalMessage}
                    onChange={e => handleChange('personalMessage', e.target.value)}
                    placeholder="Write your heartfelt message here..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-luxury-gold/15 bg-white/50 text-sm text-luxury-black-light placeholder:text-luxury-black-light/30 focus:outline-none focus:border-luxury-gold/50 focus:shadow-gold-glow transition-all resize-none"
                  />
                </div>

                <InputField icon={<Gift className="w-4 h-4" />} label="Gift Message (optional)" value={formData.giftMessage} onChange={v => handleChange('giftMessage', v)} placeholder="A special gift just for you..." />
                <InputField icon={<Hash className="w-4 h-4" />} label="Hashtags (comma-separated)" value={formData.hashtags} onChange={v => handleChange('hashtags', v)} placeholder="#HappyBirthday, #CelebrateLife, #GENZRoyalHampers" />

                <div>
                  <label className="text-xs font-bold text-luxury-black-light/60 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-luxury-gold" /> Background Music
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select
                        value={formData.backgroundMusic}
                        onChange={e => handleChange('backgroundMusic', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-luxury-gold/15 bg-white/50 text-sm text-luxury-black-light appearance-none focus:outline-none focus:border-luxury-gold/50 focus:shadow-gold-glow transition-all"
                      >
                        {MUSIC_OPTIONS.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-luxury-black-light/50" />
                      </div>
                    </div>
                    {formData.backgroundMusic && (
                      <button
                        type="button"
                        onClick={togglePreview}
                        disabled={isAudioLoading}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-luxury-gold/10 to-celebration-rose-gold/10 border border-luxury-gold/20 text-xs font-semibold text-luxury-gold hover:shadow-gold-glow transition-all flex items-center gap-1.5 min-w-[100px] justify-center"
                      >
                        {isAudioLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-luxury-gold" />
                        ) : isPreviewPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        {isAudioLoading ? 'Loading...' : isPreviewPlaying ? 'Pause' : 'Pre-listen'}
                      </button>
                    )}
                  </div>

                  {/* Custom URL Input Field */}
                  {formData.backgroundMusic === 'custom_url' && (
                    <div className="mt-3 animate-fade-in">
                      <input
                        type="text"
                        placeholder="Paste direct audio URL (e.g. https://example.com/song.mp3)"
                        value={formData.customMusicUrl}
                        onChange={e => handleChange('customMusicUrl', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-luxury-gold/15 bg-white/50 text-sm text-[#3d3d3d] focus:outline-none focus:border-luxury-gold/50 focus:shadow-gold-glow transition-all"
                      />
                      <span className="text-[10px] text-gray-500 mt-1 block">
                        Tip: You can use direct MP3 links from royalty-free catalogs or audio hosting platforms.
                      </span>
                    </div>
                  )}
                </div>

                {/* Schedule */}
                <div className="pt-4 border-t border-luxury-gold/10">
                  <h3 className="text-sm font-serif font-bold text-luxury-black-light mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-celebration-royal-purple" /> Schedule
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField icon={<Calendar className="w-4 h-4" />} label="Celebration Date *" type="date" value={formData.celebrationDate} onChange={v => handleChange('celebrationDate', v)} />
                    <InputField icon={<Clock className="w-4 h-4" />} label="Publish Time *" type="datetime-local" value={formData.publishTime} onChange={v => handleChange('publishTime', v)} />
                  </div>
                  <div className="mt-4">
                    <label className="text-xs font-bold text-luxury-black-light/60 mb-2 block">Story Duration</label>
                    <div className="flex flex-wrap gap-2">
                      {DURATION_OPTIONS.map(d => (
                        <button
                          key={d.value}
                          onClick={() => handleChange('storyDuration', d.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            formData.storyDuration === d.value
                              ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold shadow-gold-glow'
                              : 'border-luxury-gold/15 text-luxury-black-light/50 hover:border-luxury-gold/30'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                    {formData.storyDuration === 'custom' && (
                      <div className="mt-2">
                        <InputField icon={<Clock className="w-4 h-4" />} label="Custom Duration (hours)" type="number" value={String(formData.customDurationHours)} onChange={v => handleChange('customDurationHours', parseInt(v) || 24)} placeholder="24" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Media */}
                <div className="pt-4 border-t border-luxury-gold/10">
                  <h3 className="text-sm font-serif font-bold text-luxury-black-light mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-celebration-rose-gold" /> Social Media (Optional)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InputField icon={<Instagram className="w-4 h-4" />} label="Instagram" value={formData.socialMedia.instagram} onChange={v => handleChange('socialMedia.instagram', v)} placeholder="@username" />
                    <InputField icon={<Facebook className="w-4 h-4" />} label="Facebook" value={formData.socialMedia.facebook} onChange={v => handleChange('socialMedia.facebook', v)} placeholder="facebook.com/..." />
                    <InputField icon={<Youtube className="w-4 h-4" />} label="YouTube" value={formData.socialMedia.youtube} onChange={v => handleChange('socialMedia.youtube', v)} placeholder="youtube.com/..." />
                    <InputField icon={<ExternalLink className="w-4 h-4" />} label="Website" value={formData.socialMedia.website} onChange={v => handleChange('socialMedia.website', v)} placeholder="https://..." />
                  </div>
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showSocialMedia}
                      onChange={e => handleChange('showSocialMedia', e.target.checked)}
                      className="w-4 h-4 rounded border-luxury-gold/30 text-luxury-gold focus:ring-luxury-gold"
                    />
                    <span className="text-xs text-luxury-black-light/60">Display social media on my story</span>
                  </label>
                </div>
              </div>
            )}

            {/* ═══ STEP 5: Privacy & Review ═══ */}
            {step === 5 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-6">
                  <Eye className="w-5 h-5 text-celebration-royal-purple" />
                  <h2 className="text-lg font-serif font-bold text-luxury-black-light">Review & Submit</h2>
                </div>

                {/* Privacy */}
                <div className="p-4 rounded-xl bg-white/50 border border-luxury-gold/10">
                  <h3 className="text-xs font-bold text-luxury-black-light/60 mb-3 uppercase">Privacy Settings</h3>
                  <div className="flex gap-3 mb-3">
                    <button
                      onClick={() => handleChange('visibility', 'public')}
                      className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        formData.visibility === 'public'
                          ? 'border-luxury-gold bg-luxury-gold/5'
                          : 'border-luxury-gold/10 hover:border-luxury-gold/20'
                      }`}
                    >
                      <Globe className="w-4 h-4 text-luxury-gold" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-luxury-black-light block">Public</span>
                        <span className="text-[10px] text-luxury-black-light/40">Visible to everyone</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleChange('visibility', 'private')}
                      className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        formData.visibility === 'private'
                          ? 'border-celebration-royal-purple bg-celebration-royal-purple/5'
                          : 'border-luxury-gold/10 hover:border-luxury-gold/20'
                      }`}
                    >
                      <Lock className="w-4 h-4 text-celebration-royal-purple" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-luxury-black-light block">Private</span>
                        <span className="text-[10px] text-luxury-black-light/40">Only with link</span>
                      </div>
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!formData.hideComments} onChange={e => handleChange('hideComments', !e.target.checked)} className="w-4 h-4 rounded border-luxury-gold/30 text-luxury-gold focus:ring-luxury-gold" />
                      <span className="text-xs text-luxury-black-light/60">Allow comments</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.allowSharing} onChange={e => handleChange('allowSharing', e.target.checked)} className="w-4 h-4 rounded border-luxury-gold/30 text-luxury-gold focus:ring-luxury-gold" />
                      <span className="text-xs text-luxury-black-light/60">Allow sharing</span>
                    </label>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-celebration-gold-light/20 to-celebration-soft-pink-light/20 border border-luxury-gold/10">
                  <h3 className="text-xs font-bold text-luxury-gold mb-3 uppercase">Story Summary</h3>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    <SummaryItem label="Name" value={formData.customerName} />
                    {['Anniversary', 'Wedding', 'Proposal'].includes(formData.occasion) && (
                      <>
                        <SummaryItem label="Bride's Name" value={formData.brideName || '—'} />
                        <SummaryItem label="Groom's Name" value={formData.groomName || '—'} />
                      </>
                    )}
                    <SummaryItem label="Email" value={formData.email} />
                    <SummaryItem label="Occasion" value={`${occasionEmoji[formData.occasion] || ''} ${formData.occasion}`} />
                    <SummaryItem label="Title" value={formData.title} />
                    <SummaryItem label="Date" value={formData.celebrationDate} />
                    <SummaryItem label="Duration" value={DURATION_OPTIONS.find(d => d.value === formData.storyDuration)?.label || ''} />
                    <SummaryItem label="Music" value={MUSIC_OPTIONS.find(m => m.value === formData.backgroundMusic)?.label || 'None'} />
                    <SummaryItem label="Photos" value={`${photos.length} uploaded`} />
                    <SummaryItem label="Videos" value={`${videos.length} uploaded`} />
                    <SummaryItem label="Visibility" value={formData.visibility} />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-4 border-t border-luxury-gold/10">
              <div className="flex gap-2">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-5 py-2.5 rounded-full border border-luxury-gold/20 text-sm font-semibold text-luxury-black-light/60 hover:border-luxury-gold/40 hover:text-luxury-gold transition-all"
                  >
                    Back
                  </button>
                )}
                {step === 5 && (
                  <button
                    type="button"
                    onClick={() => setIsPreviewingStory(true)}
                    className="px-5 py-2.5 rounded-full border border-[#b32454] text-sm font-semibold text-[#b32454] hover:bg-rose-50/50 transition-all flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Story
                  </button>
                )}
              </div>

              {step < totalSteps ? (
                <button
                  onClick={() => { if (isStepValid(step)) setStep(step + 1); }}
                  disabled={!isStepValid(step)}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    isStepValid(step)
                      ? 'btn-celebration'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-celebration px-8 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Story ✨
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Story Viewer Live Mockup Preview Overlay */}
      {isPreviewingStory && (
        <StoryViewer
          stories={[{
            _id: 'draft',
            customerName: formData.customerName || 'Your Name',
            occasion: formData.occasion || 'Celebration',
            title: formData.title || 'My Celebration Story',
            caption: formData.caption || '',
            coverPhoto: coverPreview || '',
            thumbnail: thumbPreview || '',
            brideName: ['Anniversary', 'Wedding', 'Proposal'].includes(formData.occasion) ? formData.brideName : '',
            groomName: ['Anniversary', 'Wedding', 'Proposal'].includes(formData.occasion) ? formData.groomName : '',
            photos: photoPreviews,
            videos: videoPreviews,
            personalMessage: formData.personalMessage || '',
            giftMessage: formData.giftMessage || '',
            celebrationDate: formData.celebrationDate || new Date().toISOString(),
            backgroundMusic: formData.backgroundMusic === 'custom_url' ? formData.customMusicUrl : formData.backgroundMusic,
            reactions: [],
            isVerified: true
          }]}
          initialIndex={0}
          onClose={() => setIsPreviewingStory(false)}
        />
      )}

      {/* GENZ Branding Footer */}
      <div className="max-w-2xl mx-auto mt-6 text-center">
        <div className="flex items-center justify-center gap-2 text-[10px] text-luxury-black-light/30">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-luxury-gold to-celebration-rose-gold flex items-center justify-center">
            <span className="text-[6px] font-bold text-white">GZ</span>
          </div>
          Powered by GENZ Royal Hampers • Celebrating Life's Best Moments
        </div>
      </div>
    </div>
  );
};

// ── Reusable Input Component ──
const InputField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
}> = ({ icon, label, value, onChange, placeholder, type = 'text' }) => (
  <div>
    <label className="text-xs font-bold text-luxury-black-light/60 mb-1.5 flex items-center gap-1.5">
      <span className="text-luxury-gold">{icon}</span> {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border border-luxury-gold/15 bg-white/50 text-sm text-luxury-black-light placeholder:text-luxury-black-light/30 focus:outline-none focus:border-luxury-gold/50 focus:shadow-gold-glow transition-all"
    />
  </div>
);

// ── Summary Item ──
const SummaryItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <span className="text-luxury-black-light/40">{label}:</span>{' '}
    <span className="text-luxury-black-light/80 font-medium">{value || '—'}</span>
  </div>
);

// ── Helper ──
function createFileList(files: File[]): FileList {
  const dt = new DataTransfer();
  files.forEach(f => dt.items.add(f));
  return dt.files;
}

export default SubmitStory;
