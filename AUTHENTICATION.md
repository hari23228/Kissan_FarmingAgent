# Authentication System Documentation

## Overview

The Project Kisan application uses **Supabase Auth** with **phone number OTP authentication** for secure and passwordless login. This document outlines the complete authentication implementation.

## Architecture

### Technology Stack
- **Frontend**: Next.js 14+ (App Router)
- **Backend**: Supabase Auth
- **Authentication Method**: Phone OTP (SMS-based)
- **Session Management**: JWT tokens (handled by Supabase)

### Key Components

1. **Authentication API Routes** (`/frontend/app/api/auth/`)
   - `send-otp/route.ts` - Sends OTP to phone number
   - `verify-otp/route.ts` - Verifies OTP and creates session
   - `logout/route.ts` - Signs out user
   - `session/route.ts` - Gets current session
   - `login/route.ts` - Email/password login (legacy)
   - `register/route.ts` - Email/password signup (legacy)

2. **Authentication Context** (`/frontend/lib/auth-context.tsx`)
   - Global auth state management
   - Real-time session monitoring
   - Sign out functionality

3. **Authentication Hooks**
   - `useAuth()` - Access auth context
   - `useUserProfile()` - Fetch and update user profile

4. **UI Components**
   - `login-screen.tsx` - Login/Signup interface with OTP flow

5. **Middleware** (`/frontend/middleware.ts`)
   - Route protection
   - Session refresh
   - Automatic redirects

## Authentication Flow

### 1. Phone OTP Authentication (Primary Method)

#### **Step 1: Request OTP**
```typescript
// User enters phone number
POST /api/auth/send-otp
{
  "phone": "+919876543210"
}

// Response
{
  "success": true,
  "message": "OTP sent successfully to your phone"
}
```

#### **Step 2: Verify OTP**
```typescript
// User enters OTP received via SMS
POST /api/auth/verify-otp
{
  "phone": "+919876543210",
  "otp": "123456",
  "userData": {
    "name": "Farmer Name",
    "language": "en",
    "state": "Tamil Nadu",
    "district": "Coimbatore"
  }
}

// Response
{
  "success": true,
  "user": {
    "id": "uuid",
    "phone": "+919876543210",
    "name": "Farmer Name",
    "language": "en",
    "profileSetup": false
  },
  "session": { ... }
}
```

#### **Step 3: Session Management**
- JWT token stored in HTTP-only cookies
- Automatic session refresh via middleware
- Real-time auth state sync via Supabase listeners

### 2. Email/Password Authentication (Legacy)

#### **Signup**
```typescript
POST /api/auth/register
{
  "email": "farmer@example.com",
  "password": "securePassword123",
  "name": "Farmer Name",
  "phone": "+919876543210",
  "language": "en"
}
```

#### **Login**
```typescript
POST /api/auth/login
{
  "email": "farmer@example.com",
  "password": "securePassword123"
}
```

## Using Authentication in Your App

### 1. Wrap Your App with AuthProvider

```typescript
// app/layout.tsx
import { AuthProvider } from "@/lib/auth-context"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 2. Access Auth State in Components

```typescript
"use client"
import { useAuth } from "@/lib/auth-context"

export default function MyComponent() {
  const { user, session, loading, signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  
  if (!user) return <div>Please login</div>

  return (
    <div>
      <p>Welcome, {user.phone}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  )
}
```

### 3. Fetch User Profile

```typescript
"use client"
import { useAuth } from "@/lib/auth-context"
import { useUserProfile } from "@/hooks/use-user-profile"

export default function ProfileScreen() {
  const { user } = useAuth()
  const { profile, loading, updateProfile } = useUserProfile(user?.id || null)

  const handleUpdate = async () => {
    await updateProfile({ name: "New Name" })
  }

  return (
    <div>
      {profile && <p>Name: {profile.name}</p>}
      <button onClick={handleUpdate}>Update</button>
    </div>
  )
}
```

### 4. Protect Routes with Middleware

Routes starting with `/dashboard` are automatically protected:

```typescript
// middleware.ts
if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
  return NextResponse.redirect(new URL('/login', request.url))
}
```

To add more protected routes, modify the condition in `middleware.ts`.

## Supabase Configuration

### Required Environment Variables

Create `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Database Schema

The `users` table extends Supabase's `auth.users`:

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  name TEXT,
  phone TEXT UNIQUE,
  language TEXT NOT NULL DEFAULT 'en',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Enable Phone Auth in Supabase

1. Go to **Authentication** > **Providers** in Supabase Dashboard
2. Enable **Phone** provider
3. Configure SMS provider (Twilio, MessageBird, etc.)
4. Set up phone number verification templates

## Security Features

### 1. Row Level Security (RLS)
All tables have RLS policies to ensure users can only access their own data:

```sql
-- Example: Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

### 2. Session Security
- HTTP-only cookies prevent XSS attacks
- Automatic token refresh
- Secure session storage

### 3. Rate Limiting
Supabase provides built-in rate limiting for authentication endpoints.

## Utility Functions

Use these helper functions for common auth operations:

```typescript
import { 
  sendOTP, 
  verifyOTP, 
  signOut, 
  getSession, 
  getCurrentUser, 
  isAuthenticated 
} from "@/lib/auth-utils"

// Send OTP
const { success, error } = await sendOTP("+919876543210")

// Verify OTP
const { success, user } = await verifyOTP("+919876543210", "123456")

// Check authentication
const authenticated = await isAuthenticated()

// Sign out
await signOut()
```

## Testing Authentication

### 1. Local Testing
Supabase provides phone OTP test mode for development:
- Enable in Supabase Dashboard under Authentication > Phone Auth
- Use test phone numbers that don't send actual SMS

### 2. Production Setup
1. Configure production SMS provider
2. Verify phone numbers can receive OTP
3. Test full authentication flow
4. Monitor failed login attempts

## Common Issues & Solutions

### Issue: OTP not received
- **Solution**: Check SMS provider configuration in Supabase
- Verify phone number format (+91 for India)
- Check rate limits

### Issue: Session not persisting
- **Solution**: Ensure cookies are enabled
- Check middleware is running
- Verify NEXT_PUBLIC_SUPABASE_URL is correct

### Issue: User data not syncing
- **Solution**: Check RLS policies
- Verify user ID matches auth.users
- Ensure database triggers are active

## Next Steps

1. **Add Social Login**: Google, Facebook, etc.
2. **Implement MFA**: Multi-factor authentication
3. **Add Password Recovery**: For email/password users
4. **Session Management**: View active sessions, logout all devices
5. **Security Auditing**: Log authentication events

## API Reference

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/send-otp` | POST | Send OTP to phone |
| `/api/auth/verify-otp` | POST | Verify OTP and login |
| `/api/auth/logout` | POST | Sign out user |
| `/api/auth/session` | GET | Get current session |
| `/api/auth/login` | POST | Email/password login |
| `/api/auth/register` | POST | Email/password signup |

### React Hooks

| Hook | Description |
|------|-------------|
| `useAuth()` | Access authentication state |
| `useUserProfile(userId)` | Fetch and update user profile |

### Utility Functions

| Function | Description |
|----------|-------------|
| `sendOTP(phone)` | Send OTP to phone number |
| `verifyOTP(phone, otp, userData?)` | Verify OTP and authenticate |
| `signOut()` | Sign out current user |
| `getSession()` | Get current session |
| `getCurrentUser()` | Get current user object |
| `isAuthenticated()` | Check if user is logged in |

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Maintained by**: Project Kisan Team
