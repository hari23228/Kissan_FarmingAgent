-- ============================================
-- Kisan AI Assistant - Row Level Security (RLS) Policies
-- ============================================
-- This SQL file sets up Row Level Security to protect user data
-- Run this AFTER running the schema.sql file

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_queries ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- DISEASE HISTORY TABLE POLICIES
-- ============================================

-- Users can view their own disease history
CREATE POLICY "Users can view own disease history"
  ON public.disease_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own disease history
CREATE POLICY "Users can insert own disease history"
  ON public.disease_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own disease history
CREATE POLICY "Users can update own disease history"
  ON public.disease_history
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own disease history
CREATE POLICY "Users can delete own disease history"
  ON public.disease_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PRICES TABLE POLICIES
-- ============================================

-- Anyone (authenticated) can view prices (public data)
CREATE POLICY "Anyone can view prices"
  ON public.prices
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert prices (use service role key)
-- This is handled via service role, not RLS

-- ============================================
-- SCHEMES TABLE POLICIES
-- ============================================

-- Anyone (authenticated) can view schemes (public data)
CREATE POLICY "Anyone can view schemes"
  ON public.schemes
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert/update schemes (use service role key)
-- This is handled via service role, not RLS

-- ============================================
-- ASSISTANT QUERIES TABLE POLICIES
-- ============================================

-- Users can view their own assistant queries
CREATE POLICY "Users can view own assistant queries"
  ON public.assistant_queries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own assistant queries
CREATE POLICY "Users can insert own assistant queries"
  ON public.assistant_queries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own assistant queries
CREATE POLICY "Users can delete own assistant queries"
  ON public.assistant_queries
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STORAGE POLICIES (for image uploads)
-- ============================================
-- If you're using Supabase Storage for disease diagnosis images:

-- Create a storage bucket for disease images
-- INSERT INTO storage.buckets (id, name, public) VALUES ('disease-images', 'disease-images', false);

-- Allow authenticated users to upload images
-- CREATE POLICY "Users can upload disease images"
--   ON storage.objects
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'disease-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own images
-- CREATE POLICY "Users can view own disease images"
--   ON storage.objects
--   FOR SELECT
--   TO authenticated
--   USING (bucket_id = 'disease-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own images
-- CREATE POLICY "Users can delete own disease images"
--   ON storage.objects
--   FOR DELETE
--   TO authenticated
--   USING (bucket_id = 'disease-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- HELPFUL FUNCTIONS
-- ============================================

-- Function to automatically create a user profile when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, language)
  VALUES (NEW.id, NEW.email, 'en');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON POLICY "Users can view own profile" ON public.users IS 'Users can only view their own profile data';
COMMENT ON POLICY "Anyone can view prices" ON public.prices IS 'Market prices are public data accessible to all authenticated users';
COMMENT ON POLICY "Anyone can view schemes" ON public.schemes IS 'Government schemes are public data accessible to all authenticated users';
