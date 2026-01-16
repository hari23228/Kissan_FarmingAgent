-- ============================================
-- Kisan AI Assistant - Supabase Database Schema
-- ============================================
-- This SQL file creates all the necessary tables for the Kisan AI Assistant app
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- ============================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- ============================================
-- This table stores additional user profile information
-- The id references auth.users(id) from Supabase Auth

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT UNIQUE,
  language TEXT NOT NULL DEFAULT 'en',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. DISEASE HISTORY TABLE
-- ============================================
-- Stores all disease diagnosis queries and results

CREATE TABLE IF NOT EXISTS public.disease_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  symptoms TEXT[] NOT NULL,
  diagnosis TEXT NOT NULL,
  confidence NUMERIC(5,2), -- Confidence percentage (0-100)
  treatment TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_disease_history_user_id ON public.disease_history(user_id);
CREATE INDEX IF NOT EXISTS idx_disease_history_created_at ON public.disease_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disease_history_crop ON public.disease_history(crop);

-- ============================================
-- 3. PRICES TABLE
-- ============================================
-- Stores market prices for various crops

CREATE TABLE IF NOT EXISTS public.prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop TEXT NOT NULL,
  market TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'quintal',
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_prices_crop ON public.prices(crop);
CREATE INDEX IF NOT EXISTS idx_prices_date ON public.prices(date DESC);
CREATE INDEX IF NOT EXISTS idx_prices_market ON public.prices(market);
CREATE INDEX IF NOT EXISTS idx_prices_state_district ON public.prices(state, district);

-- ============================================
-- 4. SCHEMES TABLE
-- ============================================
-- Stores government schemes and benefits information

CREATE TABLE IF NOT EXISTS public.schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  benefits TEXT NOT NULL,
  how_to_apply TEXT NOT NULL,
  link TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_schemes_language ON public.schemes(language);
CREATE INDEX IF NOT EXISTS idx_schemes_category ON public.schemes(category);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_schemes_updated_at 
  BEFORE UPDATE ON public.schemes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ASSISTANT QUERIES TABLE
-- ============================================
-- Stores AI assistant conversation history

CREATE TABLE IF NOT EXISTS public.assistant_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_assistant_queries_user_id ON public.assistant_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_queries_created_at ON public.assistant_queries(created_at DESC);

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Sample schemes data (Hindi and English)
INSERT INTO public.schemes (title, description, eligibility, benefits, how_to_apply, link, language, category) 
VALUES 
  (
    'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    'Income support scheme providing ₹6000 per year to farmers',
    'All landholding farmers across India',
    '₹2000 every 4 months (3 installments per year)',
    'Register through local revenue officer or online at pmkisan.gov.in',
    'https://pmkisan.gov.in/',
    'en',
    'financial'
  ),
  (
    'पीएम-किसान (प्रधानमंत्री किसान सम्मान निधि)',
    'किसानों को प्रति वर्ष ₹6000 की आय सहायता प्रदान करने वाली योजना',
    'भारत भर के सभी भूमिधारक किसान',
    'हर 4 महीने में ₹2000 (प्रति वर्ष 3 किस्तें)',
    'स्थानीय राजस्व अधिकारी के माध्यम से या pmkisan.gov.in पर ऑनलाइन पंजीकरण करें',
    'https://pmkisan.gov.in/',
    'hi',
    'financial'
  ),
  (
    'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    'Crop insurance scheme to protect farmers against crop loss',
    'All farmers including sharecroppers and tenant farmers',
    'Coverage against natural calamities, pests, and diseases',
    'Apply through banks, CSCs, or insurance companies during crop season',
    'https://pmfby.gov.in/',
    'en',
    'insurance'
  ),
  (
    'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
    'फसल नुकसान से किसानों की सुरक्षा के लिए फसल बीमा योजना',
    'बटाईदार और किरायेदार किसानों सहित सभी किसान',
    'प्राकृतिक आपदाओं, कीटों और बीमारियों से सुरक्षा',
    'फसल के मौसम में बैंकों, सीएससी या बीमा कंपनियों के माध्यम से आवेदन करें',
    'https://pmfby.gov.in/',
    'hi',
    'insurance'
  );

-- Sample price data
INSERT INTO public.prices (crop, market, state, district, price, unit, date) 
VALUES 
  ('Wheat', 'Azadpur Mandi', 'Delhi', 'New Delhi', 2150.00, 'quintal', CURRENT_DATE),
  ('Rice', 'Azadpur Mandi', 'Delhi', 'New Delhi', 3200.00, 'quintal', CURRENT_DATE),
  ('Tomato', 'Vashi Mandi', 'Maharashtra', 'Mumbai', 1800.00, 'quintal', CURRENT_DATE),
  ('Onion', 'Lasalgaon Mandi', 'Maharashtra', 'Nashik', 1500.00, 'quintal', CURRENT_DATE),
  ('Potato', 'Azadpur Mandi', 'Delhi', 'New Delhi', 1200.00, 'quintal', CURRENT_DATE);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE public.users IS 'Extended user profile information linked to Supabase Auth';
COMMENT ON TABLE public.disease_history IS 'Disease diagnosis history for each user';
COMMENT ON TABLE public.prices IS 'Market prices for agricultural commodities';
COMMENT ON TABLE public.schemes IS 'Government schemes and benefits information';
COMMENT ON TABLE public.assistant_queries IS 'AI assistant conversation history';
