-- Add missing RLS policies after schema update
-- These policies allow unauthenticated users to create and access cameras

CREATE POLICY "Enable camera creation for all users"
ON public.cameras
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable camera access for all users"
ON public.cameras
FOR SELECT
USING (true);

CREATE POLICY "Enable camera updates for all users"
ON public.cameras
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable camera deletion for all users"
ON public.cameras
FOR DELETE
USING (true);

-- Also add policies for logs and saved codes
CREATE POLICY "Enable log creation for all users"
ON public.logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable log access for all users"
ON public.logs
FOR SELECT
USING (true);

CREATE POLICY "Enable saved codes access for all users"
ON public.saved_codes
FOR ALL
USING (true)
WITH CHECK (true);
