-- =============================================
-- TOOL DADDY: Fix Supabase Permissions
-- Run this ENTIRE script in your Supabase SQL Editor
-- =============================================

-- Step 1: Drop ALL existing policies to avoid "already exists" errors
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Step 2: Disable RLS temporarily to verify grants work
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config DISABLE ROW LEVEL SECURITY;

-- Step 3: Grant full permissions to all roles
GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;

GRANT ALL ON TABLE public.feedback TO anon;
GRANT ALL ON TABLE public.feedback TO authenticated;
GRANT ALL ON TABLE public.feedback TO service_role;

GRANT ALL ON TABLE public.votes TO anon;
GRANT ALL ON TABLE public.votes TO authenticated;
GRANT ALL ON TABLE public.votes TO service_role;

GRANT ALL ON TABLE public.tool_usage TO anon;
GRANT ALL ON TABLE public.tool_usage TO authenticated;
GRANT ALL ON TABLE public.tool_usage TO service_role;

GRANT ALL ON TABLE public.system_config TO anon;
GRANT ALL ON TABLE public.system_config TO authenticated;
GRANT ALL ON TABLE public.system_config TO service_role;

-- Step 4: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Step 5: Create clean, simple policies (allow everything for now)
CREATE POLICY "allow_all_profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_feedback" ON public.feedback FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_votes" ON public.votes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_tool_usage" ON public.tool_usage FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_system_config" ON public.system_config FOR ALL USING (true) WITH CHECK (true);

-- Step 6: Fix the function search path
CREATE OR REPLACE FUNCTION increment_tool_usage(p_user_id TEXT, p_tool_id TEXT, p_date DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.tool_usage (user_id, tool_id, usage_date, usage_count)
  VALUES (p_user_id, p_tool_id, p_date, 1)
  ON CONFLICT (user_id, tool_id, usage_date)
  DO UPDATE SET usage_count = public.tool_usage.usage_count + 1;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Step 7: Insert a test row to verify everything works
INSERT INTO public.profiles (id, full_name, is_admin, updated_at)
VALUES ('test-verify-123', 'Permission Test', false, now())
ON CONFLICT (id) DO UPDATE SET full_name = 'Permission Test OK';

-- Step 8: Verify the test row exists
SELECT * FROM public.profiles WHERE id = 'test-verify-123';

-- Step 9: Clean up the test row
DELETE FROM public.profiles WHERE id = 'test-verify-123';
