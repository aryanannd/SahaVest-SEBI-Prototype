import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pqqdkzdsnonlndgrfyfj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcWRremRzbm9ubG5kZ3JmeWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MDk1MjEsImV4cCI6MjEwMDQ4NTUyMX0.tLe02aR7IBZIZJQ-JUFaj65oVOfnE9wHjAOueeQ5aa0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getAuthSession(): Promise<{ access_token: string; user?: any } | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return session;
  } catch (err) {
    console.warn('Supabase getSession failed, falling back to local storage', err);
  }

  const demoSessionStr = localStorage.getItem('sahavest_demo_session');
  if (demoSessionStr) {
    try {
      const demoSession = JSON.parse(demoSessionStr);
      const userStr = localStorage.getItem('sahavest_user');
      if (userStr) {
        demoSession.user = JSON.parse(userStr);
      }
      return demoSession;
    } catch {
      return null;
    }
  }
  return null;
}

export async function getAuthToken(): Promise<string | null> {
  const session = await getAuthSession();
  return session?.access_token || null;
}
