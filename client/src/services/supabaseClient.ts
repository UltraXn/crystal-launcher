import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://demo-project.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "demo-anon-key";

const getSupabaseKey = (): string => {
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envKey) {
    if (envKey.startsWith("eyJ")) return envKey;
    try { return atob(envKey); } catch { return envKey; }
  }
  return DEFAULT_SUPABASE_ANON_KEY;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = getSupabaseKey();

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
