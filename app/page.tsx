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
  const [hasSessionToken, setHasSessionToken] = useState(false);
  const [message, setMessage] = useState("Preparing your app link...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [handoffRequested, setHandoffRequested] = useState(false);
  const [linkingStarted, setLinkingStarted] = useState(false);
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionToken = params.get("session_token");

    setHasSessionToken(Boolean(sessionToken));

    if (!sessionToken) {
      return;
    }

    let cancelled = false;
    let startTimeout: number | null = null;
    let countdownInterval: number | null = null;

    const linkSession = async () => {
      try {
        setLinkingStarted(true);
        setMessage("Linking your browser to the current session...");

        const installationId = ensureInstallationId() ?? readInstallationId();
        if (!installationId) {
          throw new Error("Unable to access this browser installation identity.");
        }

        const session = await claimSessionLink(sessionToken, installationId);
        if (!session) {
          throw new Error("The session link did not return a linked session.");
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
          setMessage("Unable to link this browser right now.");
          setErrorMessage(error instanceof Error ? error.message : "Unexpected link failure.");
        }
      }
    };

    countdownInterval = window.setInterval(() => {
      setCountdown((current) => (current > 1 ? current - 1 : 1));
    }, 1000);

    startTimeout = window.setTimeout(() => {
      if (!handoffRequested && !linkingStarted) {
        void linkSession();
      }
    }, 4000);

    return () => {
      cancelled = true;
      if (startTimeout !== null) {
        window.clearTimeout(startTimeout);
      }
      if (countdownInterval !== null) {
        window.clearInterval(countdownInterval);
      }
    };
  }, [handoffRequested, linkingStarted]);

  const openInBrowser = () => {
    setHandoffRequested(true);
    setErrorMessage(null);
    setMessage("Switch to your regular browser to continue linking there.");
    window.open(window.location.href, "_blank", "noopener,noreferrer");
  };

  const continueHere = () => {
    if (linkingStarted) {
      return;
    }

    setCountdown(1);
    setLinkingStarted(true);
    setErrorMessage(null);
    setMessage("Linking your browser to the current session...");

    const params = new URLSearchParams(window.location.search);
    const sessionToken = params.get("session_token");

    if (!sessionToken) {
      setMessage("This link is missing a session token.");
      return;
    }

    const run = async () => {
      try {
        const installationId = ensureInstallationId() ?? readInstallationId();
        if (!installationId) {
          throw new Error("Unable to access this browser installation identity.");
        }

        const session = await claimSessionLink(sessionToken, installationId);
        if (!session) {
          throw new Error("The session link did not return a linked session.");
        }

        const resolvedState = getResolvedSessionState(session);

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
        setMessage("Unable to link this browser right now.");
        setErrorMessage(error instanceof Error ? error.message : "Unexpected link failure.");
      }
    };

    void run();
  };

  if (hasSessionToken) {
    return (
      <div className="page-container">
        <h3 className="title-text">Solar-Powered Charging Station</h3>
        <p className="description-text">{message}</p>

        <div className="info-container">
          <p className="info-text">
            If this opened inside the captive portal browser, open it in your regular browser first so
            you can add the PWA to your home screen.
          </p>
        </div>

        {!linkingStarted ? (
          <>
            <button className="dashboard-button" onClick={openInBrowser}>
              Open in Safari / Browser
            </button>

            <button
              className="dashboard-button"
              onClick={continueHere}
              style={{ marginTop: "16px", background: "#321E12", color: "#F1E8E8" }}
            >
              Continue Here ({countdown})
            </button>
          </>
        ) : null}

        {handoffRequested ? (
          <div className="info-container">
            <p className="info-text">
              If your regular browser does not open automatically, use your phone&apos;s browser menu
              to open this page in Safari or your default browser.
            </p>
          </div>
        ) : null}

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
