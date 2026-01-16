# Kisan AI Assistant - Supabase Setup Guide

## 🚀 Quick Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - **Name**: Kisan AI Assistant
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., Mumbai for India)
5. Wait for the project to be created (~2 minutes)

### Step 2: Get API Keys

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`) - **Keep this secret!**

### Step 3: Configure Environment Variables

1. Open `frontend/.env.local` (already created)
2. Replace the placeholder values with your actual keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Run Database Migrations

1. Go to your Supabase dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `supabase/migrations/01_schema.sql`
5. Paste into the SQL editor
6. Click **Run** (bottom right)
7. Repeat for `supabase/migrations/02_rls_policies.sql`

### Step 5: Set Up Storage (Optional - for disease image uploads)

1. In Supabase dashboard, go to **Storage**
2. Click **Create a new bucket**
3. Name it: `disease-images`
4. Set **Public bucket**: OFF (we'll use signed URLs)
5. Click **Create bucket**

### Step 6: Enable Authentication

1. Go to **Authentication** > **Providers**
2. Email is already enabled by default
3. (Optional) Configure social logins if needed

### Step 7: Test the Setup

Run the frontend:

```bash
cd frontend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and try:
- Registering a new user
- Logging in
- Checking if the database tables are being populated

---

## 📊 Database Schema Overview

### Tables Created:

1. **users** - User profiles
2. **disease_history** - Disease diagnosis records
3. **prices** - Market prices for crops
4. **schemes** - Government schemes
5. **assistant_queries** - AI assistant chat history

### Sample Data:

The schema includes seed data for:
- 4 government schemes (2 in Hindi, 2 in English)
- 5 sample crop prices

---

## 🔒 Security Features

### Row Level Security (RLS)

All tables have RLS enabled:
- Users can only view/edit their own data
- Prices and schemes are public (read-only)
- Authentication is required for all operations

### Auto-Generated User Profiles

When a user signs up via Supabase Auth, a profile is automatically created in the `users` table using a database trigger.

---

## 🛠️ Advanced Configuration

### Generate TypeScript Types (Recommended)

To get auto-generated types from your database:

```bash
npx supabase gen types typescript --project-id <your-project-id> > frontend/lib/supabase/types.ts
```

Replace `<your-project-id>` with your actual project ID from the URL.

### Enable Realtime (Optional)

For real-time price updates:

1. Go to **Database** > **Replication**
2. Enable replication for the `prices` table
3. In your code, use:

```typescript
const channel = supabase
  .channel('prices-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'prices' }, (payload) => {
    console.log('Price updated:', payload)
  })
  .subscribe()
```

---

## 🎨 API Routes Created

All API routes are in `frontend/app/api/`:

- **Authentication**:
  - `POST /api/auth/register` - Register new user
  - `POST /api/auth/login` - Login
  - `POST /api/auth/logout` - Logout

- **Profile**:
  - `GET /api/profile` - Get user profile
  - `PUT /api/profile` - Update profile

- **Disease**:
  - `POST /api/disease` - Submit diagnosis
  - `GET /api/disease` - Get diagnosis history

- **Prices**:
  - `GET /api/prices?crop=wheat` - Get crop prices

- **Schemes**:
  - `GET /api/schemes?language=hi` - Get schemes

- **Assistant**:
  - `POST /api/assistant` - Send chat query
  - `GET /api/assistant` - Get chat history

---

## 🧪 Testing

### Test Authentication:

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123',
})
```

### Test Database Query:

```javascript
const { data, error } = await supabase
  .from('prices')
  .select('*')
  .limit(5)
```

---

## 📝 Next Steps

1. ✅ Set up Supabase project
2. ✅ Run database migrations
3. ✅ Configure environment variables
4. 🔲 Integrate AI models for disease diagnosis
5. 🔲 Add real market price data source
6. 🔲 Implement voice recognition
7. 🔲 Add multilingual AI assistant

---

## 🆘 Troubleshooting

### "Invalid API key"
- Check if you copied the correct keys from Settings > API
- Make sure you're using the `anon public` key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "Row Level Security policy violation"
- Make sure you ran `02_rls_policies.sql`
- Check if the user is authenticated before making requests

### "Table does not exist"
- Make sure you ran `01_schema.sql` first
- Check the SQL editor for any errors

### CORS errors
- Supabase allows all origins by default for the anon key
- If using service role key, add your domain to the allowed list

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

---

**Your Supabase backend is now ready! 🎉**
