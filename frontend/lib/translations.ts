// Translation utilities for multilingual support

export type Language = 'en' | 'hi' | 'ta';

export const translations = {
  en: {
    // Common
    continue: 'Continue',
    back: 'Back',
    cancel: 'Cancel',
    save: 'Save',
    submit: 'Submit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Language Screen
    selectLanguage: 'Select Your Language',
    languageName: 'English',
    
    // Login
    login: 'Login',
    signup: 'Sign Up',
    phone: 'Phone Number',
    enterOTP: 'Enter OTP',
    verifyOTP: 'Verify OTP',
    
    // Home
    greeting: 'Hello',
    dashboard: 'Dashboard',
    
    // Features
    diseaseHelp: 'Crop Disease Help',
    marketPrices: 'Market Prices',
    govSchemes: 'Government Schemes',
    assistant: 'Ask Assistant',
    
    // Disease
    takePicture: 'Take Picture',
    uploadPhoto: 'Upload Photo',
    selectCrop: 'Select Crop',
    analyze: 'Analyze',
    diagnosis: 'Diagnosis',
    remedy: 'Remedy',
    
    // Profile
    profile: 'Profile',
    editProfile: 'Edit Profile',
    logout: 'Logout',
    settings: 'Settings',
  },
  
  hi: {
    // Common
    continue: 'जारी रखें',
    back: 'वापस',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    submit: 'जमा करें',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    
    // Language Screen
    selectLanguage: 'अपनी भाषा चुनें',
    languageName: 'हिन्दी',
    
    // Login
    login: 'लॉगिन',
    signup: 'साइन अप',
    phone: 'फोन नंबर',
    enterOTP: 'OTP दर्ज करें',
    verifyOTP: 'OTP सत्यापित करें',
    
    // Home
    greeting: 'नमस्ते',
    dashboard: 'डैशबोर्ड',
    
    // Features
    diseaseHelp: 'फसल रोग सहायता',
    marketPrices: 'बाजार मूल्य',
    govSchemes: 'सरकारी योजनाएं',
    assistant: 'सहायक से पूछें',
    
    // Disease
    takePicture: 'तस्वीर लें',
    uploadPhoto: 'फोटो अपलोड करें',
    selectCrop: 'फसल चुनें',
    analyze: 'विश्लेषण करें',
    diagnosis: 'निदान',
    remedy: 'उपचार',
    
    // Profile
    profile: 'प्रोफ़ाइल',
    editProfile: 'प्रोफ़ाइल संपादित करें',
    logout: 'लॉगआउट',
    settings: 'सेटिंग्स',
  },
  
  ta: {
    // Common
    continue: 'தொடரவும்',
    back: 'பின்செல்',
    cancel: 'ரத்து',
    save: 'சேமி',
    submit: 'சமர்ப்பிக்கவும்',
    loading: 'ஏற்றுகிறது...',
    error: 'பிழை',
    success: 'வெற்றி',
    
    // Language Screen
    selectLanguage: 'உங்கள் மொழியை தேர்ந்தெடுக்கவும்',
    languageName: 'தமிழ்',
    
    // Login
    login: 'உள்நுழைக',
    signup: 'பதிவு',
    phone: 'தொலைபேசி எண்',
    enterOTP: 'OTP உள்ளிடவும்',
    verifyOTP: 'OTP சரிபார்க்கவும்',
    
    // Home
    greeting: 'வணக்கம்',
    dashboard: 'முகப்பு',
    
    // Features
    diseaseHelp: 'பயிர் நோய் உதவி',
    marketPrices: 'சந்தை விலைகள்',
    govSchemes: 'அரசு திட்டங்கள்',
    assistant: 'உதவியாளரிடம் கேளுங்கள்',
    
    // Disease
    takePicture: 'புகைப்படம் எடுக்கவும்',
    uploadPhoto: 'புகைப்படம் பதிவேற்றவும்',
    selectCrop: 'பயிரை தேர்ந்தெடுக்கவும்',
    analyze: 'பகுப்பாய்வு',
    diagnosis: 'நோய் கண்டறிதல்',
    remedy: 'தீர்வு',
    
    // Profile
    profile: 'சுயவிவரம்',
    editProfile: 'சுயவிவரத்தைத் திருத்து',
    logout: 'வெளியேறு',
    settings: 'அமைப்புகள்',
  },
};

export function getTranslation(language: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

export function t(language: Language) {
  return (key: string) => getTranslation(language, key);
}
