# Project Kisan - Project Structure

## 📁 Directory Structure

```
project-kisan-ai-assistant/
├── frontend/                   # Next.js Frontend Application
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API Routes (Serverless Functions)
│   │   │   ├── assistant/    # AI Assistant API
│   │   │   ├── auth/         # Authentication API
│   │   │   ├── disease/      # Disease Detection API
│   │   │   ├── prices/       # Market Prices API
│   │   │   ├── profile/      # User Profile API
│   │   │   └── schemes/      # Government Schemes API
│   │   ├── globals.css       # Global Styles
│   │   ├── layout.tsx        # Root Layout
│   │   └── page.tsx          # Home Page
│   ├── components/           # React Components
│   │   ├── screens/          # Screen Components
│   │   │   ├── assistant-screen.tsx
│   │   │   ├── disease-screen.tsx
│   │   │   ├── home-screen.tsx
│   │   │   ├── language-screen.tsx
│   │   │   ├── login-screen.tsx
│   │   │   ├── prices-screen.tsx
│   │   │   ├── profile-screen.tsx
│   │   │   ├── profile-setup-screen.tsx
│   │   │   └── schemes-screen.tsx
│   │   ├── ui/               # Reusable UI Components
│   │   └── theme-provider.tsx
│   ├── hooks/                # Custom React Hooks
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   ├── lib/                  # Utility Libraries
│   │   ├── services/         # API Service Layer
│   │   ├── supabase/         # Supabase Client & Auth
│   │   ├── animations.ts     # Framer Motion Configs
│   │   ├── api.ts           # API Client
│   │   ├── translations.ts   # i18n Translations
│   │   └── utils.ts         # Utility Functions
│   ├── public/              # Static Assets
│   ├── .env.example         # Environment Template
│   ├── .env.local           # Environment Variables (git-ignored)
│   ├── components.json      # shadcn/ui Config
│   ├── middleware.ts        # Next.js Middleware
│   ├── next.config.mjs      # Next.js Configuration
│   ├── package.json         # Frontend Dependencies
│   ├── postcss.config.mjs   # PostCSS Configuration
│   └── tsconfig.json        # TypeScript Configuration
│
├── backend/                  # Express.js Backend API
│   ├── api/                 # API Route Handlers
│   │   ├── assistant.js     # AI Assistant Logic
│   │   ├── auth.js          # Authentication
│   │   ├── disease.js       # Disease Detection
│   │   ├── prices.js        # Market Prices
│   │   └── schemes.js       # Government Schemes
│   ├── models/              # MongoDB Models
│   │   ├── DiseaseHistory.js
│   │   └── User.js
│   ├── services/            # Business Logic Services
│   │   ├── groqPriceService.js
│   │   └── pricesService.js
│   ├── utils/               # Utility Functions
│   ├── .env                 # Backend Environment (git-ignored)
│   ├── .env.example         # Backend Environment Template
│   ├── package.json         # Backend Dependencies
│   ├── README.md            # Backend Documentation
│   ├── server.js            # Express Server Entry
│   ├── setup-prices.js      # Database Setup Script
│   └── test-prices-api.js   # API Test Script
│
├── supabase/                # Supabase Configuration
│   └── migrations/          # Database Migrations
│
├── .gitignore               # Git Ignore Rules
├── package.json             # Root Package (Scripts)
├── QUICK_START.md           # Quick Start Guide
├── README.md                # Main Documentation
└── SUPABASE_SETUP.md        # Supabase Setup Guide
```

## 🔧 Configuration Files

### Frontend Configuration
- **tsconfig.json**: TypeScript configuration with path aliases (`@/*` → `./`)
- **next.config.mjs**: Next.js settings (image optimization, build configs)
- **postcss.config.mjs**: Tailwind CSS PostCSS configuration
- **components.json**: shadcn/ui component configuration

### Backend Configuration
- **server.js**: Express server with CORS, routes, and middleware
- **.env**: MongoDB URI, JWT secrets, API keys, port settings

### Root Configuration
- **package.json**: Workspace-level scripts for running frontend/backend together

## 🚀 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key
```

### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
PORT=5000
```

## 📦 Dependencies

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **Tailwind CSS 4**: Utility-first CSS
- **Framer Motion**: Animation library
- **Supabase**: Authentication & database
- **Groq SDK**: AI model integration
- **shadcn/ui**: Component library
- **Radix UI**: Accessible components

### Backend
- **Express**: Node.js web framework
- **MongoDB/Mongoose**: Database & ODM
- **JWT**: Authentication tokens
- **Groq SDK**: AI integration
- **Multer**: File upload handling
- **Axios**: HTTP client
- **CORS**: Cross-origin resource sharing

## 🎯 Key Features by Directory

### Frontend (`/frontend`)
- **App Router**: Modern Next.js routing with server/client components
- **API Routes**: Serverless functions for backend communication
- **Screens**: Full-page components for each app section
- **UI Components**: Reusable, accessible components from shadcn/ui
- **Services**: API client abstraction layer
- **Animations**: Smooth, mobile-optimized transitions

### Backend (`/backend`)
- **RESTful API**: Express routes for all features
- **Authentication**: JWT-based auth with bcrypt
- **Database Models**: Mongoose schemas for MongoDB
- **AI Services**: Groq integration for intelligent responses
- **Price Services**: Market data aggregation and processing

## 🔄 Development Workflow

1. **Start Frontend**: `cd frontend && npm run dev` (runs on http://localhost:3000)
2. **Start Backend**: `cd backend && npm run dev` (runs on http://localhost:5000)
3. **Start Both**: `npm run dev:all` (from root directory)

## 📝 Notes

- Frontend and backend are completely separate applications
- Frontend uses Next.js API routes for some serverless functions
- Backend provides REST API for complex operations (database, AI)
- All TypeScript configurations are in the frontend directory
- Environment variables are managed separately for each application
