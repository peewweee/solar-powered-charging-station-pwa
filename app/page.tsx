"use client";

import React, { useEffect, useState } from "react";
import InstallPrompt from "./components/InstallPrompt";
import { ensureInstallationId, readInstallationId } from "./lib/installation-id";
import { getSupabaseEnvErrorMessage, hasSupabaseEnv } from "./lib/supabase";
import { getResolvedSessionState } from "./lib/session";
import { claimSessionLink } from "./lib/session-backend";

function LandingPage() {
  const goToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="page-container">
      <InstallPrompt />
      <h3 className="title-text">Solar-Powered Charging Station</h3>
      <p className="description-text">
        The solar-powered charging station provides free device charging and Wi-Fi access,
        promoting sustainability, connectivity, and academic productivity
      </p>

      <button className="dashboard-button" onClick={goToDashboard}>
        Go to Dashboard
      </button>

      <div className="info-container">
        <p className="info-text">
          This application is part of the thesis project &lsquo;Integrating Renewable Energy
          Solutions in PUP-CEA: Solar-Powered Charging Station Offering Connectivity&rsquo;,
          developed by 4th Year Computer Engineering students of the Polytechnic University of
          the Philippines.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [isLinking, setIsLinking] = useState(false);
  const [message, setMessage] = useState("Linking your browser to the current session...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionToken = params.get("session_token");

    if (!sessionToken) {
      return;
    }

    let cancelled = false;
    setIsLinking(true);

    const linkSession = async () => {
      try {
        const installationId = ensureInstallationId() ?? readInstallationId();
        if (!installationId) {
          throw new Error("We could not open your app on this browser yet.");
        }

        const session = await claimSessionLink(sessionToken, installationId);
        if (!session) {
          throw new Error("We could not find a session to connect to right now.");
        }

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
          window.location.replace("/");
        }, 1200);
      } catch (error) {
        console.error("Failed to link session", error);

        if (!cancelled) {
          setMessage("We could not connect this browser right now.");
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Please try again by getting your unique app link.",
          );
        }
      }
    };

    void linkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLinking || errorMessage) {
    return (
      <div className="page-container">
        <h3 className="title-text">Solar-Powered Charging Station</h3>
        <p className="description-text">{message}</p>

        <div className="info-container">
          <p className="info-text">
            If the app does not continue automatically, open your unique app link again.
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

  return <LandingPage />;
}
