-- Add policies to allow unauthenticated users to create churches
-- This is needed because the app doesn't require authentication for basic functionality

-- Allow anyone to insert churches (for church creation)
CREATE POLICY "Enable church creation for all users"
ON public.churches
FOR INSERT
WITH CHECK (true);

-- Allow anyone to select churches (for joining)
CREATE POLICY "Enable church access for all users"
ON public.churches
FOR SELECT
USING (true);

-- Allow anyone to insert cameras (when creating a church)
CREATE POLICY "Enable camera creation for all users"
ON public.cameras
FOR INSERT
WITH CHECK (true);

-- Allow anyone to select cameras
CREATE POLICY "Enable camera access for all users"
ON public.cameras
FOR SELECT
USING (true);

-- Allow anyone to insert logs
CREATE POLICY "Enable log creation for all users"
ON public.logs
FOR INSERT
WITH CHECK (true);

-- Allow anyone to select logs
CREATE POLICY "Enable log access for all users"
ON public.logs
FOR SELECT
USING (true);

-- Allow anyone to manage saved codes
CREATE POLICY "Enable saved codes access for all users"
ON public.saved_codes
FOR ALL
USING (true)
WITH CHECK (true);
