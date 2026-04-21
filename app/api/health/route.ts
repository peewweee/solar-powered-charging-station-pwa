import { NextResponse } from "next/server";
import { getPublicSupabaseConfig } from "../../lib/supabase";

export async function GET() {
  const config = getPublicSupabaseConfig();

  return NextResponse.json({
    ok: Boolean(config),
    missingKeys: config ? [] : ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    notes: [
      "Public Supabase config is required for /dashboard and /dashboard/link.",
      "This endpoint only reports readiness and does not expose secret values.",
    ],
  });
}
