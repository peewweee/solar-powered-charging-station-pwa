"use client";

import { useEffect } from "react";
import { ensureInstallationId } from "../lib/installation-id";

export default function InstallationIdentityBootstrap() {
  useEffect(() => {
    ensureInstallationId();

    const path = window.location.pathname;
    const shouldNudgeScroll = path === "/" || path === "/dashboard";

    if (!shouldNudgeScroll || window.scrollY > 0) {
      return;
    }

    const nudgeScroll = () => {
      if (window.scrollY === 0) {
        window.scrollTo(0, 1);
      }
    };

    const animationFrame = window.requestAnimationFrame(nudgeScroll);
    const timeout = window.setTimeout(nudgeScroll, 150);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(timeout);
    };
  }, []);

  return null;
}
