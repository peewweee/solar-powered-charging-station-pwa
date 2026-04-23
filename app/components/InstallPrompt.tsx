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

export default function InstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
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

    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="install-prompt-overlay">
      <div className="install-prompt-card">
        <button className="install-prompt-close" onClick={dismissPrompt} aria-label="Close install prompt">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M3 3L11 11M11 3L3 11"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <p className="install-prompt-title">Add to Home Screen</p>

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
            <li>Press the Share button in the browser toolbar.</li>
            <li>Scroll the actions list if needed.</li>
            <li>Select Add to Home Screen.</li>
          </ol>
        ) : isAndroidChrome ? (
          <ol className="install-prompt-steps">
            <li>Press the browser menu in the top-right corner.</li>
            <li>Tap Add to Home screen or Install app.</li>
            <li>Confirm the install prompt.</li>
          </ol>
        ) : (
          <ol className="install-prompt-steps">
            <li>Open the browser menu or share actions.</li>
            <li>Look for Add to Home Screen or Install app.</li>
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
