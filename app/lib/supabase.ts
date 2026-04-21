import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const config = getPublicSupabaseConfig();

  if (!config) {
    return null;
  }

  browserClient = createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return browserClient;
}

export function hasSupabaseEnv() {
  return Boolean(getPublicSupabaseConfig());
}

export function getSupabaseEnvErrorMessage() {
  const missingKeys = [
    !process.env.NEXT_PUBLIC_SUPABASE_URL ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
  ].filter(Boolean);

  return missingKeys.length
    ? `Missing ${missingKeys.join(" and ")}.`
    : "Supabase environment variables are missing.";
}
