-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. churches table
CREATE TABLE public.churches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  shared_password TEXT NOT NULL DEFAULT '',
  admin_password TEXT NOT NULL DEFAULT 'admin',
  mixer_password TEXT NOT NULL DEFAULT 'mixer',
  logo_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. cameras table
CREATE TABLE public.cameras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'SINGLE' CHECK (type IN ('SINGLE', 'DUAL')),
  status TEXT NOT NULL DEFAULT 'NOT_READY' CHECK (status IN ('READY', 'NOT_READY', 'LIVE', 'SWITCH_NOW', 'HOLD')),
  current_operators JSONB DEFAULT '[]',
  shift_end_time BIGINT,
  is_shift_active BOOLEAN DEFAULT false,
  is_paused BOOLEAN DEFAULT false,
  paused_remaining_time BIGINT,
  is_attention_needed BOOLEAN DEFAULT false,
  default_shift_duration INTEGER DEFAULT 60,
  access_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. logs table
CREATE TABLE public.logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'INFO' CHECK (type IN ('INFO', 'ALERT', 'STATUS_CHANGE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. saved_codes table
CREATE TABLE public.saved_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- 1. churches policies
CREATE POLICY "Enable read access for church members" 
ON public.churches 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.church_members 
  WHERE church_members.church_id = churches.id 
  AND church_members.user_id = auth.uid()
));

-- 2. cameras policies
CREATE POLICY "Church members can view cameras"
ON public.cameras
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.church_members
    WHERE church_members.church_id = cameras.church_id
    AND church_members.user_id = auth.uid()
  )
);

CREATE POLICY "Church members can update cameras"
ON public.cameras
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.church_members
    WHERE church_members.church_id = cameras.church_id
    AND church_members.user_id = auth.uid()
  )
);

CREATE POLICY "Church members can insert cameras"
ON public.cameras
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.church_members
    WHERE church_members.church_id = cameras.church_id
    AND church_members.user_id = auth.uid()
  )
);

-- 3. logs policies
CREATE POLICY "Church members can view logs"
ON public.logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.church_members
    WHERE church_members.church_id = logs.church_id
    AND church_members.user_id = auth.uid()
  )
);

CREATE POLICY "Church members can insert logs"
ON public.logs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.church_members
    WHERE church_members.church_id = logs.church_id
    AND church_members.user_id = auth.uid()
  )
);

-- 4. saved_codes policies
CREATE POLICY "Church members can view saved codes"
ON public.saved_codes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.church_members
    WHERE church_members.church_id = saved_codes.church_id
    AND church_members.user_id = auth.uid()
  )
);

CREATE POLICY "Church members can manage saved codes"
ON public.saved_codes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.church_members
    WHERE church_members.church_id = saved_codes.church_id
    AND church_members.user_id = auth.uid()
  )
);

-- Enable Realtime for tables that need it
ALTER PUBLICATION supabase_realtime ADD TABLE public.cameras;
ALTER PUBLICATION supabase_realtime ADD TABLE public.logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_codes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.churches;

-- Create indexes for better performance
CREATE INDEX idx_cameras_church_id ON public.cameras(church_id);
CREATE INDEX idx_logs_church_id ON public.logs(church_id);
CREATE INDEX idx_logs_created_at ON public.logs(created_at DESC);
CREATE INDEX idx_saved_codes_church_id ON public.saved_codes(church_id);
