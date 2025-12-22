import { createClient } from '@supabase/supabase-js';

// Temporarily hardcoded for testing
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tdyebiojyldywjtlkugl.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkeWViaW9qeWxkeXdqdGxrdWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MzE3OTcsImV4cCI6MjA4MTIwNzc5N30.uWHoQ5QE7gVTn2YXmk2L2yPigmeignPTJivX-509LqQ';

console.log('Supabase URL:', supabaseUrl);
console.log('Environment variables loaded:', {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? '***' : 'missing'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase credentials missing from environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);