import { NextResponse } from "next/server";

export async function GET() {
  const missingKeys = [
    !process.env.NEXT_PUBLIC_SUPABASE_URL ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
  ].filter(Boolean);

  return NextResponse.json({
    ok: missingKeys.length === 0,
    missingKeys,
    notes: [
      "Public Supabase config is required for /dashboard and /dashboard/link.",
      "This endpoint only reports readiness and does not expose secret values.",
    ],
  });
}
