# 🌱 Project Kisan - AI Farming Assistant

> **Mobile-first farming assistant with beautiful animations and voice-enabled features**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-Latest-ff69b4)](https://www.framer.com/motion/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.18-green)](https://expressjs.com/)

---

## 📖 Overview

**Project Kisan** is an AI-powered farming assistant designed for small-scale farmers in India. It provides:

- 🌿 **Crop Disease Diagnosis** - Upload plant photos for instant disease detection
- 💰 **Market Prices** - Real-time mandi prices and selling recommendations  
- 📋 **Government Schemes** - Search and apply for farming subsidies with **Interactive AI Chat**
- 🎤 **Voice Assistant** - Multilingual AI chat for farming queries
- 🌍 **Multilingual** - English, Hindi (हिन्दी), Tamil (தமிழ்)

### ✨ Enhanced UI/UX Features
- **Smooth Animations** - Framer Motion powered interactions
- **Mobile-First** - Touch-optimized for farmers on the go
- **High Contrast** - Readable outdoors in bright sunlight
- **Large Buttons** - Easy for users with low digital literacy
- **Voice-First** - Minimal typing, maximum talking

### 🆕 NEW: Interactive Scheme AI Chat
- **Conversational AI** - Ask follow-up questions about government schemes
- **Personalized Guidance** - Tailored advice based on your state, crops, and land size
- **Step-by-Step Help** - Application process, eligibility, documents, and benefits
- **Context-Aware** - AI remembers conversation history for natural dialogue

👉 **[Learn more about Interactive Scheme Chat →](./SCHEME_CHAT_QUICKSTART.md)**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/project-kisan-ai-assistant.git
cd project-kisan-ai-assistant
```

2. **Install all dependencies**
```bash
npm run install:all
```

**OR install separately:**

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. **Setup Environment Variables**

Frontend (.env.local in frontend/):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key
```

Backend (.env in backend/):
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
PORT=5000
```

4. **Run the application**

```bash
# From root directory - Run frontend only
npm run dev

# Run backend only
npm run dev:backend

# Run both frontend and backend concurrently
npm run dev:all
```
✅ Frontend: http://localhost:3000

3. **Setup Backend** (in new terminal)
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
✅ Backend: http://localhost:5000

---

## 📁 Project Structure

```
project-kisan-ai-assistant/
│
├── frontend/                  # Next.js Frontend (Enhanced)
│   ├── app/                   # Next.js App Router
│   ├── components/
│   │   ├── screens/          # Main screen components
│   │   │   ├── language-screen.tsx       ✨ ENHANCED
│   │   │   ├── home-screen.tsx           ✨ ENHANCED
│   │   │   ├── disease-screen.tsx
│   │   │   ├── prices-screen.tsx
│   │   │   └── ...more
│   │   └── ui/               # shadcn/ui components
│   ├── lib/
│   │   ├── animations.ts     # Reusable Framer Motion variants
│   │   ├── api.ts            # Backend API integration
│   │   └── translations.ts   # i18n support
│   └── public/               # Static assets
│
├── backend/                   # Express.js Backend
│   ├── api/                   # Route handlers
│   │   ├── auth.js           # Authentication
│   │   ├── disease.js        # Disease detection
│   │   ├── prices.js         # Market prices
│   │   ├── schemes.js        # Government schemes
│   │   └── assistant.js      # AI chat
│   ├── models/               # Database models
│   │   ├── User.js
│   │   └── DiseaseHistory.js
│   └── server.js             # Main server
│
└── docs/                      # Documentation
    ├── QUICK_START.md        # ⭐ Start here!
    ├── PROJECT_SUMMARY.md    # What's been done
    └── ENHANCED_FRONTEND_README.md  # Design system
```

---

## 🎨 Design System

### Colors (Agriculture-Inspired)

#### Light Mode
- **Primary**: `#2d6a4f` - Forest Green (trust, growth)
- **Secondary**: `#f4a261` - Warm Amber (energy, warmth)
- **Accent**: `#95b8d1` - Sky Blue (clarity, peace)
- **Destructive**: `#d62828` - Alert Red

#### Dark Mode  
- **Primary**: `#52b788` - Light Green
- **Secondary**: `#d4a574` - Gold
- **Accent**: `#6ba3ba` - Blue

### Typography
- **Font**: Geist Sans (modern, readable)
- **Base Size**: 16px (mobile-friendly)
- **Headings**: 2xl to 5xl
- **Line Height**: 1.5-1.75 (readability)

---

## ✨ Animation Showcase

### Implemented Animations

#### Language Selection Screen
```tsx
✅ Logo fade-in with spring animation
✅ Rotating plant icon (subtle motion)
✅ Staggered language cards
✅ Hover scale effect (1.03x)
✅ Selection checkmark popup
✅ Gradient text animation
```

#### Home Dashboard
```tsx
✅ Header slide from top
✅ Feature cards staggered entrance
✅ Card lift on hover (-4px)
✅ Pulsing mic button glow
✅ Icon rotation on hover
✅ Bottom nav slide-up
```

### Animation Patterns Available
```tsx
// Page transitions
fadeIn, slideUp, slideInLeft, slideInRight

// Interactions
hoverScale, tapScale, cardHover

// Continuous
pulseAnimation, rotateIcon, glowEffect

// Lists
staggerContainer, staggerItem

// Loading
spinAnimation, dotAnimation
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Send OTP
- `POST /api/auth/verify-otp` - Verify and login

### Disease Detection
- `POST /api/disease/diagnose` - Upload image for diagnosis
- `GET /api/disease/history` - Get past diagnoses

### Market Prices
- `GET /api/prices/current` - Get current mandi prices
- `POST /api/prices/recommendation` - Get selling advice

### Government Schemes
- `GET /api/schemes/search` - Search schemes
- `GET /api/schemes/:id` - Get scheme details
- `POST /api/schemes/recommend` - Personalized recommendations

### AI Assistant
- `POST /api/assistant/chat` - Send text message
- `POST /api/assistant/voice` - Process voice input

---

## 🌍 Multilingual Support

### Languages
- **English** (en) - Default
- **हिन्दी** (hi) - Hindi
- **தமிழ்** (ta) - Tamil

### Usage
```tsx
import { t } from '@/lib/translations'

const translate = t(language)
const greeting = translate('greeting') // "Hello" / "नमस्ते" / "வணக்கம்"
```

---

## 🎯 Features Status

| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| Language Selection | ✅ Enhanced | - | Complete |
| Login/Signup | ✅ | ✅ | Complete |
| Profile Setup | ⏳ | ✅ | Backend Ready |
| Home Dashboard | ✅ Enhanced | ✅ | Complete |
| Disease Diagnosis | ⏳ | ✅ | Backend Ready |
| Market Prices | ⏳ | ✅ | Backend Ready |
| Gov Schemes | ✅ | ✅ | Complete |
| **Interactive Scheme Chat** | ✅ **NEW** | ✅ **NEW** | **Complete** |
| Voice Assistant | ⏳ | ✅ | Backend Ready |
| Profile Settings | ⏳ | ✅ | Backend Ready |

**Legend:**
- ✅ Complete with animations
- ⏳ Ready to enhance
- Backend Ready: API endpoints implemented

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.0 (App Router)
- **React**: 19.2
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **State**: React Hooks + LocalStorage
- **TypeScript**: Full type safety

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.18
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Upload**: Multer
- **HTTP Client**: Axios

---

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - ⭐ Start here for setup
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project status
- **[ENHANCED_FRONTEND_README.md](ENHANCED_FRONTEND_README.md)** - UI/UX guide
- **[backend/README.md](backend/README.md)** - Backend API docs

---

## 🎓 Learning Resources

### Framer Motion
- [Official Docs](https://www.framer.com/motion/)
- [Animation Examples](https://www.framer.com/motion/examples/)

### Next.js
- [Getting Started](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### Tailwind CSS
- [Documentation](https://tailwindcss.com/docs)
- [UI Components](https://ui.shadcn.com/)

---

## 🚧 Roadmap

### Phase 1: UI Enhancement (Current)
- [x] Setup project structure
- [x] Install Framer Motion
- [x] Enhance Language Selection
- [x] Enhance Home Dashboard
- [ ] Enhance remaining screens
- [ ] Add loading states
- [ ] Implement error handling

### Phase 2: Backend Integration
- [ ] Connect all APIs
- [ ] Add authentication flow
- [ ] Implement file uploads
- [ ] Add database queries
- [ ] Error handling

### Phase 3: Advanced Features
- [ ] PWA support
- [ ] Offline mode
- [ ] Push notifications
- [ ] Camera integration
- [ ] Voice recording
- [ ] Speech-to-text
- [ ] Text-to-speech

### Phase 4: Production
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Security hardening
- [ ] Testing (Unit + E2E)
- [ ] Deployment
- [ ] Monitoring

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Follow the animation guidelines
4. Test on mobile devices
5. Submit a pull request

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👥 Authors

- **Your Name** - Initial work and enhancements

---

## 🙏 Acknowledgments

- **Farmers of India** - Our inspiration
- **shadcn/ui** - Beautiful UI components
- **Framer Motion** - Smooth animations
- **Tailwind CSS** - Utility-first styling

---

## 📞 Support

- **Email**: support@projectkisan.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/project-kisan-ai-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/project-kisan-ai-assistant/discussions)

---

## 🌟 Show Your Support

If this project helps you, please ⭐ star this repository!

---

**Built with ❤️ for Indian Farmers | Made in India 🇮🇳**

*Empowering agriculture through technology*
