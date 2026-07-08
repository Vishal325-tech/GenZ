import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, Image, Video, Camera, Calendar, Clock, Globe, Lock,
  Send, Sparkles, Heart, Hash, MessageSquare, Gift, User, Mail,
  Phone, MapPin, Instagram, Facebook, Youtube, Linkedin, ExternalLink,
  ChevronDown, Eye, Trash2, AlertCircle, CheckCircle2, Play, Pause, Loader2
} from 'lucide-react';
import StoryViewer from '../components/StoryViewer';
import { compressImage } from '../utils/imageCompression';

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

interface ImageEditorModalProps {
  file: File;
  defaultAspect: '1:1' | '9:16' | '16:9' | 'free';
  onClose: () => void;
  onSave: (editedFile: File) => void;
}

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ file, defaultAspect, onClose, onSave }) => {
  const [aspectRatio, setAspectRatio] = useState(defaultAspect);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [filterType, setFilterType] = useState('none');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load file into image object
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.src = url;
    img.onload = () => {
      imgRef.current = img;
      drawPreview();
    };
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const getCanvasFilter = (filter: string) => {
    switch (filter) {
      case 'warm': return 'sepia(25%) saturate(130%) contrast(105%)';
      case 'cool': return 'contrast(105%) brightness(100%) hue-rotate(15deg) saturate(110%)';
      case 'grayscale': return 'grayscale(100%)';
      case 'sepia': return 'sepia(100%)';
      case 'vintage': return 'sepia(35%) contrast(135%) saturate(85%) brightness(95%)';
      case 'brighten': return 'brightness(125%) contrast(105%)';
      case 'vivid': return 'saturate(165%) contrast(110%)';
      default: return 'none';
    }
  };

  // Redraw canvas preview
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on aspect ratio preset
    let outWidth = 500;
    let outHeight = 500;
    if (aspectRatio === '9:16') {
      outWidth = 450;
      outHeight = 800;
    } else if (aspectRatio === '16:9') {
      outWidth = 800;
      outHeight = 450;
    } else if (aspectRatio === 'free') {
      // Fit to image's aspect ratio
      const imgAspect = img.width / img.height;
      if (imgAspect > 1) {
        outWidth = 600;
        outHeight = 600 / imgAspect;
      } else {
        outHeight = 600;
        outWidth = 600 * imgAspect;
      }
    }

    canvas.width = outWidth;
    canvas.height = outHeight;

    ctx.clearRect(0, 0, outWidth, outHeight);

    // Apply Filter
    ctx.filter = getCanvasFilter(filterType);

    // Target Aspect
    const targetAspect = outWidth / outHeight;
    let sWidth = img.width;
    let sHeight = img.height;

    if (img.width / img.height > targetAspect) {
      sWidth = img.height * targetAspect;
    } else {
      sHeight = img.width / targetAspect;
    }

    // Apply zoom
    sWidth = sWidth / zoom;
    sHeight = sHeight / zoom;

    // Pan max delta
    const maxDeltaX = (img.width - sWidth) / 2;
    const maxDeltaY = (img.height - sHeight) / 2;

    const offsetX = ((img.width - sWidth) / 2) + (panX / 100) * maxDeltaX;
    const offsetY = ((img.height - sHeight) / 2) + (panY / 100) * maxDeltaY;

    ctx.drawImage(img, offsetX, offsetY, sWidth, sHeight, 0, 0, outWidth, outHeight);
  }, [aspectRatio, zoom, panX, panY, filterType]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview, aspectRatio, zoom, panX, panY, filterType]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) {
        const editedFile = new File([blob], file.name, { type: 'image/jpeg' });
        onSave(editedFile);
      }
    }, 'image/jpeg', 0.9);
  };

  const FILTERS = [
    { value: 'none', label: 'Original' },
    { value: 'warm', label: 'Warm' },
    { value: 'cool', label: 'Cool' },
    { value: 'grayscale', label: 'Grayscale' },
    { value: 'sepia', label: 'Sepia' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'brighten', label: 'Brighten' },
    { value: 'vivid', label: 'Vivid' },
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="max-w-lg w-full bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
          <h3 className="font-serif font-bold text-neutral-800 dark:text-neutral-200">Edit & Filter Photo</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Preview canvas */}
          <div className="flex justify-center bg-neutral-100 dark:bg-neutral-950 p-4 rounded-xl max-h-[300px] overflow-hidden items-center relative">
            <canvas ref={canvasRef} className="max-w-full max-h-[260px] object-contain shadow rounded border border-neutral-200 dark:border-neutral-800" />
          </div>

          {/* Aspect ratios */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Aspect Ratio</label>
            <div className="flex flex-wrap gap-2">
              {[
                { val: 'free', label: 'Free' },
                { val: '1:1', label: 'Square (1:1)' },
                { val: '9:16', label: 'Story (9:16)' },
                { val: '16:9', label: 'Landscape' }
              ].map(a => (
                <button
                  key={a.val}
                  type="button"
                  onClick={() => { setAspectRatio(a.val as any); setZoom(1); setPanX(0); setPanY(0); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    aspectRatio === a.val
                      ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-500 font-bold">
              <span>Zoom</span>
              <span>{zoom.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="0.1"
              value={zoom}
              onChange={e => setZoom(parseFloat(e.target.value))}
              className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-luxury-gold"
            />
          </div>

          {/* Pan X and Y sliders */}
          {zoom > 1 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-500 uppercase">Pan Horizontally (X)</span>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={panX}
                  onChange={e => setPanX(parseInt(e.target.value))}
                  className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-luxury-gold"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-500 uppercase">Pan Vertically (Y)</span>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={panY}
                  onChange={e => setPanY(parseInt(e.target.value))}
                  className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-luxury-gold"
                />
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Filters</label>
            <div className="flex gap-2 overflow-x-auto pb-1 max-w-full scrollbar-thin">
              {FILTERS.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilterType(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border shrink-0 transition-all ${
                    filterType === f.value
                      ? 'border-celebration-rose-gold bg-celebration-rose-gold/10 text-celebration-rose-gold'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-xl btn-celebration text-xs font-semibold transition-all shadow-md"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
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

  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null, null, null]);
  const [videos, setVideos] = useState<(File | null)[]>([null, null]);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>(['', '', '', '', '']);
  const [videoPreviews, setVideoPreviews] = useState<string[]>(['', '']);
  const [coverPreview, setCoverPreview] = useState('');
  const [thumbPreview, setThumbPreview] = useState('');
  const [editingImage, setEditingImage] = useState<{
    type: 'photo' | 'cover' | 'thumbnail';
    index?: number;
    file: File;
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSaveEditedImage = (editedFile: File) => {
    if (!editingImage) return;

    const { type, index } = editingImage;
    if (type === 'cover') {
      setCoverPhoto(editedFile);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverPreview(URL.createObjectURL(editedFile));
    } else if (type === 'thumbnail') {
      setThumbnail(editedFile);
      if (thumbPreview) URL.revokeObjectURL(thumbPreview);
      setThumbPreview(URL.createObjectURL(editedFile));
    } else if (type === 'photo' && index !== undefined) {
      setPhotos(prev => {
        const next = [...prev];
        next[index] = editedFile;
        return next;
      });
      setPhotoPreviews(prev => {
        const next = [...prev];
        if (next[index]) URL.revokeObjectURL(next[index]);
        next[index] = URL.createObjectURL(editedFile);
        return next;
      });
    }

    setEditingImage(null);
  };
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
  
  const slotPhotoInputRef = useRef<HTMLInputElement>(null);
  const slotVideoInputRef = useRef<HTMLInputElement>(null);
  const activeSlotIndex = useRef<number | null>(null);
  const activeSlotType = useRef<'photo' | 'video' | null>(null);

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

  // Click slot to trigger file selector
  const handleSlotClick = (type: 'photo' | 'video', index: number) => {
    activeSlotIndex.current = index;
    activeSlotType.current = type;
    if (type === 'photo') {
      slotPhotoInputRef.current?.click();
    } else {
      slotVideoInputRef.current?.click();
    }
  };

  // Upload to specific Photo slot
  const uploadPhotoToSlot = (index: number, file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      alert("Photo file is too large (max 15MB).");
      return;
    }
    
    setPhotos(prev => {
      const next = [...prev];
      next[index] = file;
      return next;
    });

    setPhotoPreviews(prev => {
      const next = [...prev];
      if (next[index]) URL.revokeObjectURL(next[index]);
      next[index] = URL.createObjectURL(file);
      return next;
    });
  };

  // Upload to specific Video slot
  const uploadVideoToSlot = (index: number, file: File) => {
    if (!file.type.startsWith('video/') && !file.name.endsWith('.mp4') && !file.name.endsWith('.mov')) {
      alert("Please select a valid video file (MP4, MOV, etc.).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert("Video file size exceeds 15MB limit. Please compress the video or select a smaller clip to prevent upload failures on mobile data.");
      return;
    }

    setVideos(prev => {
      const next = [...prev];
      next[index] = file;
      return next;
    });

    setVideoPreviews(prev => {
      const next = [...prev];
      if (next[index]) URL.revokeObjectURL(next[index]);
      next[index] = URL.createObjectURL(file);
      return next;
    });
  };

  // Bulk Photo upload (filling first empty slots)
  const handleBulkPhotoUpload = (files: FileList | null) => {
    if (!files) return;
    const fileList = Array.from(files);
    
    setPhotos(prev => {
      const next = [...prev];
      let fileIdx = 0;
      for (let i = 0; i < 5; i++) {
        if (!next[i] && fileList[fileIdx]) {
          if (fileList[fileIdx].size <= 15 * 1024 * 1024) {
            next[i] = fileList[fileIdx];
          } else {
            alert(`Photo "${fileList[fileIdx].name}" exceeds 15MB and was skipped.`);
          }
          fileIdx++;
        }
      }
      if (fileIdx < fileList.length) {
        alert("Some photos were ignored because the limit of 5 photos has been reached.");
      }
      return next;
    });

    setPhotoPreviews(prev => {
      const next = [...prev];
      let fileIdx = 0;
      for (let i = 0; i < 5; i++) {
        if (!photos[i] && fileList[fileIdx]) {
          if (fileList[fileIdx].size <= 15 * 1024 * 1024) {
            if (next[i]) URL.revokeObjectURL(next[i]);
            next[i] = URL.createObjectURL(fileList[fileIdx]);
          }
          fileIdx++;
        }
      }
      return next;
    });

    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  // Bulk Video upload (filling first empty slots)
  const handleBulkVideoUpload = (files: FileList | null) => {
    if (!files) return;
    const fileList = Array.from(files);

    const validVideos = fileList.filter(file => {
      if (!file.type.startsWith('video/') && !file.name.endsWith('.mp4') && !file.name.endsWith('.mov')) {
        alert(`File "${file.name}" is not a valid video.`);
        return false;
      }
      if (file.size > 15 * 1024 * 1024) {
        alert(`Video "${file.name}" exceeds 15MB limit. Please compress it or select a smaller clip.`);
        return false;
      }
      return true;
    });

    setVideos(prev => {
      const next = [...prev];
      let fileIdx = 0;
      for (let i = 0; i < 2; i++) {
        if (!next[i] && validVideos[fileIdx]) {
          next[i] = validVideos[fileIdx];
          fileIdx++;
        }
      }
      if (fileIdx < validVideos.length) {
        alert("Some videos were ignored because the limit of 2 videos has been reached.");
      }
      return next;
    });

    setVideoPreviews(prev => {
      const next = [...prev];
      let fileIdx = 0;
      for (let i = 0; i < 2; i++) {
        if (!videos[i] && validVideos[fileIdx]) {
          if (next[i]) URL.revokeObjectURL(next[i]);
          next[i] = URL.createObjectURL(validVideos[fileIdx]);
          fileIdx++;
        }
      }
      return next;
    });

    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  // Cover photo
  const handleCoverUpload = (files: FileList | null) => {
    if (!files || !files[0]) return;
    if (files[0].size > 15 * 1024 * 1024) {
      alert("Cover photo is too large (max 15MB).");
      return;
    }
    setCoverPhoto(files[0]);
    setCoverPreview(URL.createObjectURL(files[0]));
  };

  // Thumbnail
  const handleThumbUpload = (files: FileList | null) => {
    if (!files || !files[0]) return;
    if (files[0].size > 15 * 1024 * 1024) {
      alert("Thumbnail photo is too large (max 15MB).");
      return;
    }
    setThumbnail(files[0]);
    setThumbPreview(URL.createObjectURL(files[0]));
  };

  // Remove slot-specific media
  const removePhotoFromSlot = (index: number) => {
    setPhotos(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setPhotoPreviews(prev => {
      const next = [...prev];
      if (next[index]) URL.revokeObjectURL(next[index]);
      next[index] = '';
      return next;
    });
  };

  const removeVideoFromSlot = (index: number) => {
    setVideos(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setVideoPreviews(prev => {
      const next = [...prev];
      if (next[index]) URL.revokeObjectURL(next[index]);
      next[index] = '';
      return next;
    });
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
      if (imageFiles.length) handleBulkPhotoUpload(createFileList(imageFiles));
      if (videoFiles.length) handleBulkVideoUpload(createFileList(videoFiles));
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

      const activePhotos = photos.filter((f): f is File => !!f);
      const activeVideos = videos.filter((f): f is File => !!f);

      const compressedPhotos = await Promise.all(activePhotos.map(f => compressImage(f)));
      const compressedCover = coverPhoto ? await compressImage(coverPhoto) : undefined;
      const compressedThumb = thumbnail ? await compressImage(thumbnail) : undefined;

      const allFiles = [
        ...compressedPhotos.map(f => ({ file: f, type: 'photo' as const })),
        ...activeVideos.map(f => ({ file: f, type: 'video' as const })),
        ...(compressedCover ? [{ file: compressedCover, type: 'cover' as const }] : []),
        ...(compressedThumb ? [{ file: compressedThumb, type: 'thumb' as const }] : []),
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
          activePhotos.forEach(() => {
            if (uploadData.files[idx]) mediaUrls.photos.push(uploadData.files[idx].url);
            idx++;
          });
          activeVideos.forEach(() => {
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
          <p className="text-luxury-black-light/70 text-sm leading-relaxed mb-4">
            Your celebration story has been submitted successfully! Please wait for story approval, otherwise contact the approval manager. ✨
          </p>
          
          <div className="flex flex-col gap-3 items-center w-full">
            <a
              href="https://wa.me/919108531238?text=Hello%20Approval%20Manager,%20I%20have%20submitted%20my%20celebration%20story%20and%20would%20like%20to%20request%20approval.%20Please%20let%20me%20know%20how%20to%20proceed!"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-sm font-semibold shadow-md transition-all hover:scale-[1.02]"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.574 3.97 14.101 2.945 11.48 2.945c-5.437 0-9.862 4.371-9.865 9.801-.001 1.77.468 3.498 1.357 5.03L1.93 21.056l3.882-.996c1.55.932 3.125 1.353 4.835 1.354zm8.252-6.965c-.247-.123-1.463-.722-1.69-.804-.226-.082-.391-.123-.556.124-.165.247-.641.804-.785.965-.145.166-.29.186-.537.063-.247-.123-1.045-.385-1.99-1.229-.735-.656-1.232-1.465-1.377-1.712-.145-.247-.015-.38.109-.502.112-.11.247-.29.37-.435.124-.145.165-.247.247-.412.083-.166.042-.31-.02-.435-.062-.124-.556-1.341-.762-1.838-.2-.486-.421-.42-.556-.427-.124-.007-.267-.008-.41-.008-.144 0-.38.054-.578.273-.198.219-.757.74-.757 1.804s.774 2.087.88 2.228c.107.145 1.524 2.327 3.69 3.262.516.222.918.355 1.232.456.52.165.992.142 1.364.086.415-.062 1.463-.598 1.67-1.175.206-.578.206-1.072.144-1.175-.062-.103-.227-.165-.474-.288z" />
              </svg>
              Contact Approval Manager
            </a>
            
            <button
              onClick={() => window.location.href = '/'}
              className="btn-celebration rounded-full py-3 px-6 text-sm font-semibold w-full"
            >
              Back to Home
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
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="w-5 h-5 text-celebration-royal-purple" />
                  <h2 className="text-lg font-serif font-bold text-luxury-black-light">Upload Media</h2>
                </div>

                <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-orange-800 dark:text-orange-300">File Limits & Guidelines</h5>
                    <p className="text-[10px] text-orange-700/80 dark:text-orange-400/80 mt-0.5 leading-relaxed">
                      To prevent timeouts and failures on mobile networks, photos will be compressed automatically. 
                      <strong> Videos must be under 15MB each</strong>. Please select shorter video clips or compress them beforehand.
                    </p>
                  </div>
                </div>

                {/* Drag & Drop Zone */}
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    dragActive
                      ? 'border-luxury-gold bg-celebration-gold-light/20 scale-[1.02]'
                      : 'border-luxury-gold/20 hover:border-luxury-gold/40'
                  }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 text-luxury-gold/50 mx-auto mb-2" />
                  <p className="text-xs text-luxury-black-light/60 mb-1">
                    Drag & drop your files here, or use the buttons below
                  </p>
                  <p className="text-[9px] text-luxury-black-light/40 mb-3">
                    Max 5 photos • Max 2 videos • JPG, PNG, GIF, MP4, MOV (max 15MB per video)
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-luxury-gold/10 to-celebration-rose-gold/10 border border-luxury-gold/20 text-[10px] font-semibold text-luxury-gold hover:shadow-gold-glow transition-all"
                    >
                      <Image className="w-3 h-3" />
                      Bulk Photos ({photos.filter(Boolean).length}/5)
                    </button>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-celebration-royal-purple/10 to-celebration-rose-gold/10 border border-celebration-royal-purple/20 text-[10px] font-semibold text-celebration-royal-purple hover:shadow-celebration transition-all"
                    >
                      <Video className="w-3 h-3" />
                      Bulk Videos ({videos.filter(Boolean).length}/2)
                    </button>
                  </div>
                </div>

                <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleBulkPhotoUpload(e.target.files)} />
                <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime,video/*,.mp4,.mov" multiple className="hidden" onChange={e => handleBulkVideoUpload(e.target.files)} />
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleCoverUpload(e.target.files)} />
                <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleThumbUpload(e.target.files)} />
                
                <input ref={slotPhotoInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
                  if (activeSlotIndex.current !== null && e.target.files?.[0]) {
                    uploadPhotoToSlot(activeSlotIndex.current, e.target.files[0]);
                  }
                  e.target.value = '';
                }} />
                <input ref={slotVideoInputRef} type="file" accept="video/mp4,video/quicktime,video/*,.mp4,.mov" className="hidden" onChange={e => {
                  if (activeSlotIndex.current !== null && e.target.files?.[0]) {
                    uploadVideoToSlot(activeSlotIndex.current, e.target.files[0]);
                  }
                  e.target.value = '';
                }} />

                {/* Cover & Thumbnail Grid */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-luxury-black-light/60 uppercase tracking-wider">Story Listing Assets (Cover & Icon)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-luxury-black-light/40 mb-1.5 block">1. Cover Photo (Full Screen Banner)</label>
                      <div className="relative group rounded-xl overflow-hidden aspect-video border border-luxury-gold/15 bg-white dark:bg-neutral-800 flex items-center justify-center">
                        {coverPreview ? (
                          <>
                            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => coverInputRef.current?.click()}
                                className="px-2 py-1 rounded-full bg-white text-[9px] font-bold text-[#b32454] shadow-md hover:scale-105 transition-all"
                              >
                                Change
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingImage({ type: 'cover', file: coverPhoto! })}
                                className="px-2 py-1 rounded-full bg-amber-500 text-white text-[9px] font-bold shadow-md hover:scale-105 transition-all"
                              >
                                Crop/Edit
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeCover(); }}
                                className="px-2 py-1 rounded-full bg-red-600 text-[9px] font-bold text-white shadow-md hover:scale-105 transition-all"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => coverInputRef.current?.click()}
                            className="w-full h-full flex flex-col items-center justify-center text-center p-2 hover:bg-rose-50/10 transition-all"
                          >
                            <Camera className="w-5 h-5 text-luxury-gold/40 mx-auto" />
                            <span className="text-[10px] text-luxury-gold/40 block mt-1">Upload Cover Photo</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-luxury-black-light/40 mb-1.5 block">2. Story Thumbnail (Circle Icon)</label>
                      <div className="relative group rounded-xl overflow-hidden aspect-video border border-celebration-rose-gold/15 bg-white dark:bg-neutral-800 flex items-center justify-center">
                        {thumbPreview ? (
                          <>
                            <img src={thumbPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => thumbInputRef.current?.click()}
                                className="px-2 py-1 rounded-full bg-white text-[9px] font-bold text-[#b32454] shadow-md hover:scale-105 transition-all"
                              >
                                Change
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingImage({ type: 'thumbnail', file: thumbnail! })}
                                className="px-2 py-1 rounded-full bg-amber-500 text-white text-[9px] font-bold shadow-md hover:scale-105 transition-all"
                              >
                                Crop/Edit
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeThumb(); }}
                                className="px-2 py-1 rounded-full bg-red-600 text-[9px] font-bold text-white shadow-md hover:scale-105 transition-all"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => thumbInputRef.current?.click()}
                            className="w-full h-full flex flex-col items-center justify-center text-center p-2 hover:bg-rose-50/10 transition-all"
                          >
                            <Eye className="w-5 h-5 text-celebration-rose-gold/40 mx-auto" />
                            <span className="text-[10px] text-celebration-rose-gold/40 block mt-1">Story Thumbnail</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slides Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-luxury-black-light/60 uppercase tracking-wider">Story Slides (Slideshow Elements)</h3>
                  
                  {/* Photo Slides Grid */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-luxury-black-light/40 block">Photo Slides (Max 5)</span>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden aspect-[3/4] border border-luxury-gold/15 bg-white dark:bg-neutral-800 flex flex-col items-center justify-center">
                          {photoPreviews[i] ? (
                            <>
                              <img src={photoPreviews[i]} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingImage({ type: 'photo', index: i, file: photos[i]! })}
                                  className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow hover:scale-110 transition-all"
                                  title="Crop/Edit Photo"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removePhotoFromSlot(i)}
                                  className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow hover:scale-110 transition-all"
                                  title="Delete"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[8px] px-1 rounded">Slide {i + 1}</span>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSlotClick('photo', i)}
                              className="w-full h-full flex flex-col items-center justify-center p-2 text-neutral-400 dark:text-neutral-500 hover:text-luxury-gold hover:bg-rose-50/10 transition-all"
                            >
                              <Image className="w-5 h-5 mb-1" />
                              <span className="text-[8px] font-bold uppercase tracking-wider">Add Photo {i + 1}</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Video Slides Grid */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-luxury-black-light/40 block">Video Slides (Max 2 • Max 15MB each)</span>
                    <div className="grid grid-cols-2 gap-4">
                      {[0, 1].map((i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden aspect-video border border-celebration-royal-purple/15 bg-white dark:bg-neutral-800 flex flex-col items-center justify-center">
                          {videoPreviews[i] ? (
                            <>
                              <video src={videoPreviews[i]} className="w-full h-full object-cover" muted />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => removeVideoFromSlot(i)}
                                  className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow hover:scale-110 transition-all"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <span className="absolute bottom-1 left-1.5 bg-black/60 text-white text-[8px] px-1 rounded">Video {i + 1}</span>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSlotClick('video', i)}
                              className="w-full h-full flex flex-col items-center justify-center p-2 text-neutral-400 dark:text-neutral-500 hover:text-celebration-royal-purple hover:bg-purple-50/10 transition-all"
                            >
                              <Video className="w-5 h-5 mb-1" />
                              <span className="text-[9px] font-bold uppercase tracking-wider">Add Video {i + 1}</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview Draft Button */}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs">
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
                    <SummaryItem label="Photos" value={`${photos.filter(Boolean).length} uploaded`} />
                    <SummaryItem label="Videos" value={`${videos.filter(Boolean).length} uploaded`} />
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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-4 border-t border-luxury-gold/10">
              <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start">
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
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
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
                  className="btn-celebration w-full sm:w-auto px-8 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2"
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
            photos: photoPreviews.filter(Boolean),
            videos: videoPreviews.filter(Boolean),
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

      {editingImage && (
        <ImageEditorModal
          file={editingImage.file}
          defaultAspect={editingImage.type === 'photo' ? '9:16' : '1:1'}
          onClose={() => setEditingImage(null)}
          onSave={handleSaveEditedImage}
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
