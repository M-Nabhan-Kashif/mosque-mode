import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase URL and Anon Key
const supabaseUrl = 'https://eimvlczjnukhanlogzwg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbXZsY3pqbnVraGFubG9nendnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzI3MTAsImV4cCI6MjA3OTg0ODcxMH0.4mUFxMGCnh4ITXpURPTJfa6aQVXD-wTv1cxiMoXc4ek';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
