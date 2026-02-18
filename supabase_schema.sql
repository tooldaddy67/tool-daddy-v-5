-- Profiles Table
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY, -- Firebase UID
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Feedback Table
CREATE TABLE public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT, -- Firebase UID
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'pending',
  admin_reply TEXT,
  admin_reply_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Votes Table
CREATE TABLE public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Firebase UID
  feedback_id UUID REFERENCES public.feedback ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, feedback_id)
);

-- Tool Usage (Quotas) Table
CREATE TABLE public.tool_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Firebase UID
  tool_id TEXT NOT NULL,
  usage_date DATE DEFAULT CURRENT_DATE NOT NULL,
  usage_count INTEGER DEFAULT 1 NOT NULL,
  UNIQUE(user_id, tool_id, usage_date)
);

-- System Config Table
CREATE TABLE public.system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Basic Policies
-- (Adjusted for Firebase Auth - we use service role or public with checks if possible)
-- Since we are not using Supabase Auth, we can't easily use auth.uid() in RLS.
-- For now, we will allow read access to everyone and write access will be managed by the app logic
-- or we can use custom claims if we were using Supabase Auth.
-- Since we used 'anon' key, we will allow basic operations but warn about RLS.

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public feedback is viewable by everyone" ON public.feedback FOR SELECT USING (true);
CREATE POLICY "Anyone can post feedback" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Public votes are viewable by everyone" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Anyone can vote" ON public.votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Usage is viewable by everyone" ON public.tool_usage FOR SELECT USING (true);

-- RPC for incrementing tool usage
CREATE OR REPLACE FUNCTION increment_tool_usage(p_user_id TEXT, p_tool_id TEXT, p_date DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.tool_usage (user_id, tool_id, usage_date, usage_count)
  VALUES (p_user_id, p_tool_id, p_date, 1)
  ON CONFLICT (user_id, tool_id, usage_date)
  DO UPDATE SET usage_count = public.tool_usage.usage_count + 1;
END;
$$ LANGUAGE plpgsql;
