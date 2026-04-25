"use client";

import { useEffect } from "react";
import { ensureInstallationId } from "../lib/installation-id";

export default function InstallationIdentityBootstrap() {
  useEffect(() => {
    ensureInstallationId();
  }, []);

  return null;
}
