"use client";

import { useEffect } from "react";

// src/app/manifest.ts declares this site as an installable web app (name,
// icons, display: "standalone") so its own icon renders correctly when
// pinned to a home screen or tab-group, and so Android tints its address
// bar with the theme color - not because there's an actual app to install.
// That manifest alone is enough for Chrome/Android to surface its native
// "Install app" / "Add to Home screen" banner unprompted. There's nothing
// for a visitor to install, so swallow the event before the browser shows it.
export default function SuppressInstallPrompt() {
  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => e.preventDefault();
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  return null;
}
