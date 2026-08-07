import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pqqdkzdsnonlndgrfyfj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcWRremRzbm9ubG5kZ3JmeWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MDk1MjEsImV4cCI6MjEwMDQ4NTUyMX0.tLe02aR7IBZIZJQ-JUFaj65oVOfnE9wHjAOueeQ5aa0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
