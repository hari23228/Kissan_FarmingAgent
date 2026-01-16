# 🚀 Quick Start Guide - Project Kisan

## What You Have Now

### ✅ Frontend (Enhanced with Animations)
- **Location**: `/frontend` folder
- **Framework**: Next.js 16 + React 19
- **Animations**: Framer Motion installed and configured
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui components

### ✅ Backend (API Server)
- **Location**: `/backend` folder
- **Framework**: Express.js + Node.js
- **Database**: MongoDB (models ready)
- **APIs**: RESTful endpoints defined

---

## 🎯 Quick Setup (5 Minutes)

### Option 1: Install All Dependencies at Once (Recommended)
```bash
# From root directory
npm run install:all
```

### Option 2: Install Separately

**Step 1: Install Frontend Dependencies**
```bash
cd frontend
npm install
```

**Step 2: Install Backend Dependencies**
```bash
cd ../backend
npm install
```

### Step 3: Configure Environment Variables

**Frontend (.env.local in frontend/):**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local and add your Supabase and Groq API keys
```

**Backend (.env in backend/):**
```bash
cd backend
cp .env.example .env
# Edit .env and add your MongoDB URI, JWT secret, and Groq API key
```

### Step 4: Run the Application

**Option A: Run Both Together (from root directory)**
```bash
npm run dev:all
```

**Option B: Run Separately**

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend runs on: http://localhost:3000

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend runs on: http://localhost:5000

**Option C: Run Frontend Only (from root)**
```bash
npm run dev
```

---

## 🎨 What You Can See Now

### Enhanced Screens with Animations:

1. **Language Selection Screen** ✨
   - Open http://localhost:3000
   - See smooth fade-in animations
   - Click language cards (notice scale effect)
   - Watch checkmark appear

2. **Home Dashboard** ✨
   - After selecting language
   - Notice header slide-in
   - Hover over feature cards (they lift!)
   - See pulsing mic button

---

## 📁 File Locations

### Frontend Enhanced Files
```
frontend/
├── components/screens/
│   ├── language-screen.tsx    ← ENHANCED ✨
│   ├── home-screen.tsx         ← ENHANCED ✨
│   ├── disease-screen.tsx      (ready to enhance)
│   ├── prices-screen.tsx       (ready to enhance)
│   └── ...more screens
├── lib/
│   ├── animations.ts           ← NEW: Reusable animations
│   ├── api.ts                  ← NEW: API integration
│   └── translations.ts         ← NEW: Multilingual support
```

### Backend Files
```
backend/
├── api/
│   ├── auth.js        ← Authentication
│   ├── disease.js     ← Disease detection
│   ├── prices.js      ← Market prices
│   ├── schemes.js     ← Gov schemes
│   └── assistant.js   ← AI chat
├── models/
│   ├── User.js
│   └── DiseaseHistory.js
└── server.js          ← Main server
```

---

## 🎭 Animation Examples You Can Use

### 1. Fade In (Page Entry)
```tsx
import { motion } from "framer-motion"

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Your content
</motion.div>
```

### 2. Button Hover Effect
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click Me
</motion.button>
```

### 3. Staggered List
```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    {item.content}
  </motion.div>
))}
```

### 4. Card Hover Lift
```tsx
<motion.div
  whileHover={{ scale: 1.02, y: -4 }}
  transition={{ type: "spring" }}
>
  <Card>...</Card>
</motion.div>
```

### 5. Pulse Animation
```tsx
<motion.div
  animate={{
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1]
  }}
  transition={{
    duration: 2,
    repeat: Infinity
  }}
>
  Pulsing element
</motion.div>
```

---

## 🔌 Connect Frontend to Backend

### In Any Component:
```tsx
import { api } from '@/lib/api'

// Example: Disease diagnosis
const handleDiagnose = async () => {
  const formData = new FormData()
  formData.append('image', imageFile)
  formData.append('cropType', 'tomato')
  
  try {
    const result = await api.diagnoseCropDisease(formData)
    console.log(result)
  } catch (error) {
    console.error(error)
  }
}
```

---

## 📚 Documentation Files

1. **ENHANCED_FRONTEND_README.md**
   - Complete design system
   - All animation patterns
   - Screen-by-screen guide

2. **PROJECT_SUMMARY.md**
   - What's been done
   - Statistics
   - Next steps

3. **backend/README.md**
   - API documentation
   - Setup instructions
   - Deployment guide

---

## 🎯 Next Tasks (Choose What You Want)

### Easy Tasks (15-30 min each)
- [ ] Add more animations to Login screen
- [ ] Enhance Profile Setup screen
- [ ] Add loading skeletons
- [ ] Customize color scheme

### Medium Tasks (1-2 hours each)
- [ ] Complete Disease Diagnosis animations
- [ ] Add Price screen animations
- [ ] Implement voice recording UI
- [ ] Add camera integration

### Advanced Tasks (2-4 hours each)
- [ ] Connect all APIs
- [ ] Add database integration
- [ ] Implement AI chat
- [ ] Create PWA features

---

## 💡 Pro Tips

### 1. Test Animations
```tsx
// Add this to any component to test
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 2, repeat: Infinity }}
>
  Test
</motion.div>
```

### 2. Debug Mode
```bash
# In frontend terminal
npm run dev -- --turbo
```

### 3. Check for Errors
- Frontend: Check browser console (F12)
- Backend: Check terminal output

### 4. Auto Format
```bash
# Format all files
cd frontend
npx prettier --write .
```

---

## 🆘 Common Issues & Fixes

### Issue: Animations not working
**Fix:**
```bash
cd frontend
npm install framer-motion
```

### Issue: Backend not starting
**Fix:**
```bash
cd backend
npm install express cors dotenv
```

### Issue: Port already in use
**Fix:**
```bash
# Kill process on port 3000 (frontend)
npx kill-port 3000

# Kill process on port 5000 (backend)
npx kill-port 5000
```

### Issue: Module not found
**Fix:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🎓 Learn More

### Framer Motion Tutorials
- https://www.youtube.com/watch?v=2V1WK-3HQNk
- https://blog.maximeheckel.com/posts/framer-motion-layout-animations/

### Tailwind CSS
- https://tailwindcss.com/docs/installation
- https://tailwindui.com/components

### Next.js
- https://nextjs.org/learn
- https://nextjs.org/docs/app/building-your-application

---

## ✅ Checklist for Your Project

- [x] Frontend folder created
- [x] Backend folder created  
- [x] Framer Motion installed
- [x] 2 screens enhanced with animations
- [x] API service created
- [x] Backend APIs defined
- [x] Documentation complete
- [ ] All screens animated
- [ ] Backend connected
- [ ] Database configured
- [ ] Testing complete

---

## 🎉 You're Ready!

Everything is set up. Just run the commands and start developing!

```bash
# Start coding!
cd frontend
npm run dev
```

Happy Coding! 🚀🌱
