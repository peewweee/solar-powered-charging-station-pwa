"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ensureInstallationId, readInstallationId } from "../lib/installation-id";
import { getSupabaseEnvErrorMessage, hasSupabaseEnv } from "../lib/supabase";
import { getResolvedSessionState } from "../lib/session";
import { claimSessionLink } from "../lib/session-backend";

export default function DashboardLinkClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Linking your browser to the current session...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sessionToken = useMemo(() => searchParams.get("session_token"), [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const linkSession = async () => {
      if (!sessionToken) {
        setMessage("This link is missing a session token.");
        return;
      }

      try {
        const installationId = ensureInstallationId() ?? readInstallationId();
        if (!installationId) {
          throw new Error("Unable to access this browser installation identity.");
        }

        const session = await claimSessionLink(sessionToken, installationId);
        const resolvedState = getResolvedSessionState(session);

        if (cancelled) {
          return;
        }

        setMessage(
          resolvedState.isConnected
            ? "Link complete. Redirecting to your app..."
            : "Link complete. Redirecting to the app...",
        );

        window.setTimeout(() => {
          router.replace("/");
        }, 1200);
      } catch (error) {
        console.error("Failed to link session", error);

        if (!cancelled) {
          setMessage("Unable to link this browser right now.");
          setErrorMessage(error instanceof Error ? error.message : "Unexpected link failure.");
        }
      }
    };

    void linkSession();

    return () => {
      cancelled = true;
    };
  }, [router, sessionToken]);

  return (
    <div className="page-container">
      <h3 className="title-text">Solar-Powered Charging Station</h3>
      <p className="description-text">{message}</p>

      <div className="info-container">
        <p className="info-text">
          If the redirect does not continue automatically, open the app root again after linking.
        </p>
      </div>

      {errorMessage ? (
        <div className="info-container">
          <p className="info-text">{errorMessage}</p>
        </div>
      ) : null}

      {!hasSupabaseEnv() ? (
        <div className="info-container">
          <p className="info-text">{getSupabaseEnvErrorMessage()}</p>
        </div>
      ) : null}
    </div>
  );
}
