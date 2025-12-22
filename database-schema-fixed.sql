-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. churches table (must be created first)
CREATE TABLE IF NOT EXISTS public.churches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  shared_password TEXT NOT NULL DEFAULT '',
  admin_password TEXT NOT NULL DEFAULT 'admin',
  mixer_password TEXT NOT NULL DEFAULT 'mixer',
  logo_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. church_members table (created after churches)
CREATE TABLE IF NOT EXISTS public.church_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- should match auth.uid() type (usually uuid)
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. cameras table
CREATE TABLE IF NOT EXISTS public.cameras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'SINGLE' CHECK (type IN ('SINGLE', 'DUAL')),
  status TEXT NOT NULL DEFAULT 'NOT_READY' CHECK (status IN ('READY', 'NOT_READY', 'LIVE', 'SWITCH_NOW', 'HOLD')),
  current_operators JSONB DEFAULT '[]'::jsonb,
  shift_end_time BIGINT,
  is_shift_active BOOLEAN DEFAULT false,
  is_paused BOOLEAN DEFAULT false,
  paused_remaining_time BIGINT,
  is_attention_needed BOOLEAN DEFAULT false,
  default_shift_duration INTEGER DEFAULT 60,
  access_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. logs table
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'INFO' CHECK (type IN ('INFO', 'ALERT', 'STATUS_CHANGE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. saved_codes table
CREATE TABLE IF NOT EXISTS public.saved_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- church_members policies
CREATE POLICY "Members_can_select_own_membership"
ON public.church_members
FOR SELECT
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Members_can_insert_own_membership"
ON public.church_members
FOR INSERT
WITH CHECK (user_id = (SELECT auth.uid()));

-- churches policies
CREATE POLICY "Enable read access for church members" 
ON public.churches 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.church_members 
  WHERE church_members.church_id = public.churches.id 
    AND church_members.user_id = (SELECT auth.uid())
));

-- cameras policies
CREATE POLICY "Church members can view cameras"
ON public.cameras
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.church_members
    WHERE church_members.church_id = public.cameras.church_id
      AND church_members.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Church members can update cameras"
ON public.cameras
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.church_members
    WHERE church_members.church_id = public.cameras.church_id
      AND church_members.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Church members can insert cameras"
ON public.cameras
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.church_members
    WHERE church_members.church_id = public.cameras.church_id
      AND church_members.user_id = (SELECT auth.uid())
  )
);

-- logs policies
CREATE POLICY "Church members can view logs"
ON public.logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.church_members
    WHERE church_members.church_id = public.logs.church_id
      AND church_members.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Church members can insert logs"
ON public.logs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.church_members
    WHERE church_members.church_id = public.logs.church_id
      AND church_members.user_id = (SELECT auth.uid())
  )
);

-- saved_codes policies
CREATE POLICY "Church members can view saved codes"
ON public.saved_codes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.church_members
    WHERE church_members.church_id = public.saved_codes.church_id
      AND church_members.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Church members can manage saved_codes"
ON public.saved_codes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.church_members
    WHERE church_members.church_id = public.saved_codes.church_id
      AND church_members.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.church_members
    WHERE church_members.church_id = public.saved_codes.church_id
      AND church_members.user_id = (SELECT auth.uid())
  )
);

-- Enable Realtime for tables that need it
-- First create the publication if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END
$$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.cameras;
ALTER PUBLICATION supabase_realtime ADD TABLE public.logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_codes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.churches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.church_members;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cameras_church_id ON public.cameras(church_id);
CREATE INDEX IF NOT EXISTS idx_logs_church_id ON public.logs(church_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_codes_church_id ON public.saved_codes(church_id);
CREATE INDEX IF NOT EXISTS idx_church_members_church_id ON public.church_members(church_id);
CREATE INDEX IF NOT EXISTS idx_church_members_user_id ON public.church_members(user_id);
