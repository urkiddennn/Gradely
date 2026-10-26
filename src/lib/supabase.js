import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * PostgREST returns PGRST205 / 42P01 when a table has not been created yet.
 * We use this to show the friendly database setup screen instead of a raw error.
 */
export function isMissingTableError(error) {
  if (!error) return false;
  const code = error.code || "";
  const message = String(error.message || "").toLowerCase();
  return (
    code === "PGRST205" ||
    code === "42P01" ||
    error.status === 404 ||
    message.includes("could not find the table") ||
    message.includes("does not exist")
  );
}

export function friendlyAuthError(error) {
  const message = String(error?.message || "").toLowerCase();
  if (message.includes("invalid login credentials")) {
    return "That email and password combination doesn't match an account.";
  }
  if (message.includes("email not confirmed")) {
    return "Please confirm your email first. Check your inbox for the verification link.";
  }
  if (message.includes("user already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (message.includes("password should be at least")) {
    return "Use a password with at least 8 characters.";
  }
  if (message.includes("rate limit") || message.includes("too many")) {
    return "Too many attempts. Wait a moment and try again.";
  }
  if (message.includes("invalid email")) {
    return "Enter a valid email address.";
  }
  if (message.includes("same password")) {
    return "Your new password must be different from the old one.";
  }
  return error?.message || "Something went wrong. Please try again.";
}
