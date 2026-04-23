"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "install_prompt_dismissed";

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithStandalone = window.navigator as NavigatorWithStandalone;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

/* ---------- Inline icons (stroke uses currentColor) ---------- */

const IconShare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3v13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 8l5-5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconMore = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPlusSquare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const IconKebab = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="5" r="1.6" fill="currentColor" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    <circle cx="12" cy="19" r="1.6" fill="currentColor" />
  </svg>
);

const IconHomeAdd = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="18" cy="7" r="3.2" fill="#262626" stroke="currentColor" strokeWidth="1.6" />
    <path d="M18 5.4v3.2M16.4 7h3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

export default function InstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isIosSafari, setIsIosSafari] = useState(false);
  const [isAndroidChrome, setIsAndroidChrome] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (isStandaloneMode()) {
      return;
    }

    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === "true") {
        return;
      }
    } catch {
      // Ignore storage access issues and continue showing the prompt.
    }

    const userAgent = window.navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/i.test(userAgent);
    const isSafari = /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const isChrome = /Chrome/i.test(userAgent) && !/Edg|OPR/i.test(userAgent);
    const isSupportedMobileBrowser = (isIos && isSafari) || (isAndroid && isChrome);

    if (!isSupportedMobileBrowser) {
      return;
    }

    setIsIosSafari(isIos && isSafari);
    setIsAndroidChrome(isAndroid && isChrome);
    setIsVisible(true);
  }, []);

  const dismissPrompt = () => {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // Ignore storage access issues when dismissing.
    }

    setIsClosing(true);
    window.setTimeout(() => setIsVisible(false), 220);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`install-prompt-overlay${isClosing ? " is-closing" : ""}`}
      onClick={dismissPrompt}
      role="presentation"
    >
      <div
        className="install-prompt-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-prompt-title"
      >
        <div className="install-prompt-grabber" aria-hidden="true" />

        <button className="install-prompt-close" onClick={dismissPrompt} aria-label="Close install prompt">
          <IconClose />
        </button>

        <p id="install-prompt-title" className="install-prompt-title">Add to Home Screen</p>

        <div className="install-prompt-app">
          <img
            className="install-prompt-app-icon"
            src="/icons/icon-192x192.png"
            alt="Solar Powered Charging Station icon"
          />
          <div>
            <p className="install-prompt-app-name">Solar Powered Charging Station</p>
            <p className="install-prompt-app-domain">spcs-v1.vercel.app</p>
          </div>
        </div>

        {isIosSafari ? (
          <ol className="install-prompt-steps">
            <li>
              Press{" "}
              <span className="step-pill"><IconShare /></span>{" "}
              in the browser toolbar.
            </li>
            <li>
              Tap{" "}
              <span className="step-pill">View more <IconMore /></span>{" "}
              to see all available actions.
            </li>
            <li>
              Select{" "}
              <span className="step-pill"><IconPlusSquare /> Add to Home Screen</span>
              .
            </li>
          </ol>
        ) : isAndroidChrome ? (
          <ol className="install-prompt-steps">
            <li>
              Press{" "}
              <span className="step-pill"><IconKebab /></span>{" "}
              in the top-right corner.
            </li>
            <li>
              Tap{" "}
              <span className="step-pill"><IconHomeAdd /> Add to Home screen</span>
              {" "}or{" "}
              <span className="step-pill">Install app</span>
              .
            </li>
            <li>Confirm the install prompt.</li>
          </ol>
        ) : (
          <ol className="install-prompt-steps">
            <li>
              Open the{" "}
              <span className="step-pill"><IconKebab /></span>{" "}
              browser menu or{" "}
              <span className="step-pill"><IconShare /></span>{" "}
              share actions.
            </li>
            <li>
              Look for{" "}
              <span className="step-pill"><IconHomeAdd /> Add to Home Screen</span>
              {" "}or{" "}
              <span className="step-pill">Install app</span>
              .
            </li>
            <li>Confirm to save the app to your home screen.</li>
          </ol>
        )}

        <button className="install-prompt-dismiss" onClick={dismissPrompt}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
