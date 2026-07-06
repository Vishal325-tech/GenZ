import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'kn' | 'hi';

type Translations = Record<string, string>;

const dictionaries: Record<Language, Translations> = {
  en: {
    title: "GenZ Royal Hampers",
    subtitle: "Ultra-Premium Luxury Gift Baskets & Hampers",
    home: "Home",
    shop: "Shop",
    categories: "Categories",
    occasions: "Occasions",
    gallery: "Gallery",
    blog: "Blog",
    cart: "Cart",
    wishlist: "Wishlist",
    login: "Login",
    register: "Register",
    profile: "Profile",
    admin: "Admin Panel",
    searchPlaceholder: "Search luxury gift hampers, chocolates, flowers...",
    searchBtn: "Search",
    featuredGifts: "Featured Royal Hampers",
    categoryTitle: "Curated Categories",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    sendAsGift: "Send as Gift",
    personalization: "Gift Personalization",
    selectWrap: "Choose Gift Wrap Style",
    selectRibbon: "Choose Ribbon Color",
    uploadPhoto: "Upload Photo Card",
    uploadVideo: "Upload Video Greeting",
    customMsg: "Greeting Card Message",
    checkout: "Secure Checkout",
    payment: "Simulated Payment",
    trackOrder: "Track Delivery Timeline",
    loading: "Preparing luxury gift box...",
    welcome: "Welcome"
  },
  kn: {
    title: "ಗಜಾನನ ರಾಯಲ್ ಹ್ಯಾಂಪರ್ಸ್",
    subtitle: "ಅಲ್ಟ್ರಾ-ಪ್ರೀಮಿಯಂ ಐಷಾರಾಮಿ ಉಡುಗೊರೆ ಬುಟ್ಟಿಗಳು ಮತ್ತು ಹ್ಯಾಂಪರ್ಸ್",
    home: "ಮುಖಪುಟ",
    shop: "ಖರೀದಿಸಿ",
    categories: "ವರ್ಗಗಳು",
    occasions: "ಸಂದರ್ಭಗಳು",
    gallery: "ಗ್ಯಾಲರಿ",
    blog: "ಬ್ಲಾಗ್",
    cart: "ಕಾರ್ಟ್",
    wishlist: "ಇಷ್ಟಪಟ್ಟಿ",
    login: "ಲಾಗಿನ್",
    register: "ನೋಂದಣಿ",
    profile: "ಪ್ರೊಫೈಲ್",
    admin: "ನಿರ್ವಾಹಕ ಪುಟ",
    searchPlaceholder: "ಐಷಾರಾಮಿ ಹ್ಯಾಂಪರ್‌ಗಳು, ಚಾಕೊಲೇಟ್‌ಗಳು, ಹೂವುಗಳನ್ನು ಹುಡುಕಿ...",
    searchBtn: "ಹುಡುಕು",
    featuredGifts: "ವೈಶಿಷ್ಟ್ಯಗೊಳಿಸಿದ ರಾಯಲ್ ಹ್ಯಾಂಪರ್ಸ್",
    categoryTitle: "ವಿಶೇಷ ವರ್ಗಗಳು",
    addToCart: "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
    buyNow: "ಈಗಲೇ ಖರೀದಿಸಿ",
    sendAsGift: "ಉಡುಗೊರೆಯಾಗಿ ಕಳುಹಿಸಿ",
    personalization: "ಉಡುಗೊರೆ ಗ್ರಾಹಕೀಕರಣ",
    selectWrap: "ಗಿಫ್ಟ್ ರಾಪ್ ಶೈಲಿ ಆರಿಸಿ",
    selectRibbon: "रिಬ್ಬನ್ ಬಣ್ಣ ಆರಿಸಿ",
    uploadPhoto: "ಫೋಟೋ ಕಾರ್ಡ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    uploadVideo: "ವಿಡಿಯೋ ಶುಭಾಶಯ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    customMsg: "ಶುಭಾಶಯ ಪತ್ರದ ಸಂದೇಶ",
    checkout: "ಸುರಕ್ಷಿತ ಚೆಕ್‌ಔಟ್",
    payment: "ಪಾವತಿ ವಿಧಾನ",
    trackOrder: "ವಿತರಣೆ ಟ್ರ್ಯಾಕಿಂಗ್",
    loading: "ಉಡುಗೊರೆ ಪೆಟ್ಟಿಗೆ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
    welcome: "ಸ್ವಾಗತ"
  },
  hi: {
    title: "गजानन रॉयल हैम्पर्स",
    subtitle: "अल्ट्रा-प्रीमियम लक्ज़री गिफ्ट बास्केट और हैम्पर्स",
    home: "मुख्यपृष्ठ",
    shop: "दुकान",
    categories: "श्रेणियाँ",
    occasions: "अवसर",
    gallery: "गैलरी",
    blog: "ब्लॉग",
    cart: "कार्ट",
    wishlist: "इच्छा-सूची",
    login: "लॉगिन",
    register: "पंजीकरण",
    profile: "प्रोफाइल",
    admin: "एडमिन पैनल",
    searchPlaceholder: "लक्ज़री हैम्पर्स, चॉकलेट, फूल खोजें...",
    searchBtn: "खोजें",
    featuredGifts: "विशेष रॉयल हैम्पर्स",
    categoryTitle: "क्यूरेटेड श्रेणियाँ",
    addToCart: "कार्ट में जोड़ें",
    buyNow: "अभी खरीदें",
    sendAsGift: "उपहार के रूप में भेजें",
    personalization: "उपहार वैयक्तिकरण",
    selectWrap: "उपहार लपेटने की शैली चुनें",
    selectRibbon: "रिबन का रंग चुनें",
    uploadPhoto: "फोटो कार्ड अपलोड करें",
    uploadVideo: "वीडियो संदेश अपलोड करें",
    customMsg: "ग्रीटिंग कार्ड संदेश",
    checkout: "सुरक्षित चेकआउट",
    payment: "भुगतान का विकल्प",
    trackOrder: "ऑर्डर ट्रैकिंग",
    loading: "उपहार बॉक्स तैयार किया जा रहा है...",
    welcome: "स्वागत"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('gift_movers_lang');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('gift_movers_lang', lang);
  };

  const t = (key: string): string => {
    return dictionaries[language][key] || dictionaries['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
