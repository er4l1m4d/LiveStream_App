-- Update churches table to use TEXT ID instead of UUID for shorter church IDs
-- This will change the ID format from UUID to "FirstLetter + 5 numbers" (e.g., "A12345")

-- First, drop ALL existing RLS policies
DROP POLICY IF EXISTS "Enable church creation for all users" ON public.churches;
DROP POLICY IF EXISTS "Enable church access for all users" ON public.churches;
DROP POLICY IF EXISTS "Enable read access for church members" ON public.churches;
DROP POLICY IF EXISTS "Enable camera creation for all users" ON public.cameras;
DROP POLICY IF EXISTS "Enable camera access for all users" ON public.cameras;
DROP POLICY IF EXISTS "Church members can view cameras" ON public.cameras;
DROP POLICY IF EXISTS "Church members can insert cameras" ON public.cameras;
DROP POLICY IF EXISTS "Church members can update cameras" ON public.cameras;
DROP POLICY IF EXISTS "Church members can delete cameras" ON public.cameras;
DROP POLICY IF EXISTS "Enable log creation for all users" ON public.logs;
DROP POLICY IF EXISTS "Enable log access for all users" ON public.logs;
DROP POLICY IF EXISTS "Church members can view logs" ON public.logs;
DROP POLICY IF EXISTS "Church members can insert logs" ON public.logs;
DROP POLICY IF EXISTS "Enable saved codes access for all users" ON public.saved_codes;
DROP POLICY IF EXISTS "Church members can view saved codes" ON public.saved_codes;
DROP POLICY IF EXISTS "Church members can insert saved codes" ON public.saved_codes;
DROP POLICY IF EXISTS "Church members can update saved codes" ON public.saved_codes;
DROP POLICY IF EXISTS "Church members can delete saved codes" ON public.saved_codes;
DROP POLICY IF EXISTS "Church members can manage saved_codes" ON public.saved_codes;
DROP POLICY IF EXISTS "Users can view their church members" ON public.church_members;
DROP POLICY IF EXISTS "Users can insert their church members" ON public.church_members;
DROP POLICY IF EXISTS "Users can update their church members" ON public.church_members;
DROP POLICY IF EXISTS "Users can delete their church members" ON public.church_members;

-- Disable RLS temporarily
ALTER TABLE public.churches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cameras DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_members DISABLE ROW LEVEL SECURITY;

-- Drop foreign key constraints from other tables
ALTER TABLE public.cameras DROP CONSTRAINT IF EXISTS cameras_church_id_fkey;
ALTER TABLE public.church_members DROP CONSTRAINT IF EXISTS church_members_church_id_fkey;
ALTER TABLE public.logs DROP CONSTRAINT IF EXISTS logs_church_id_fkey;
ALTER TABLE public.saved_codes DROP CONSTRAINT IF EXISTS saved_codes_church_id_fkey;

-- Update churches table ID column from UUID to TEXT
ALTER TABLE public.churches DROP CONSTRAINT IF EXISTS churches_pkey;
ALTER TABLE public.churches ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE public.churches ADD PRIMARY KEY (id);

-- Update foreign key columns in other tables to TEXT
ALTER TABLE public.cameras ALTER COLUMN church_id TYPE TEXT USING church_id::TEXT;
ALTER TABLE public.church_members ALTER COLUMN church_id TYPE TEXT USING church_id::TEXT;
ALTER TABLE public.logs ALTER COLUMN church_id TYPE TEXT USING church_id::TEXT;
ALTER TABLE public.saved_codes ALTER COLUMN church_id TYPE TEXT USING church_id::TEXT;

-- Recreate foreign key constraints
ALTER TABLE public.cameras ADD CONSTRAINT cameras_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE CASCADE;
ALTER TABLE public.church_members ADD CONSTRAINT church_members_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE CASCADE;
ALTER TABLE public.logs ADD CONSTRAINT logs_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE CASCADE;
ALTER TABLE public.saved_codes ADD CONSTRAINT saved_codes_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE CASCADE;

-- Re-enable RLS
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_members ENABLE ROW LEVEL SECURITY;

-- Recreate essential RLS policies
CREATE POLICY "Enable church creation for all users"
ON public.churches
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable church access for all users"
ON public.churches
FOR SELECT
USING (true);
