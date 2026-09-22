"use client";

import { createContext, useContext, type ReactNode } from "react";

// Whether a blob store is configured, made available to every client form in
// the panel.
//
// The alternative was threading an `uploadsEnabled` prop from each of the
// twelve pages that render a form containing an image field, down through the
// form, into the field - and remembering to do it again for every form added
// later. This is a single deploy-time fact that the panel layout already
// knows, so it is provided once at the top instead.
//
// It carries no secret: only whether uploads are available, never the token.
const UploadsContext = createContext(false);

export function UploadsProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  return <UploadsContext.Provider value={enabled}>{children}</UploadsContext.Provider>;
}

/**
 * Defaults to false, so a field rendered outside the panel (or before the
 * provider is added to a new layout) hides the upload option rather than
 * showing a button that can't work.
 */
export function useUploadsEnabled(): boolean {
  return useContext(UploadsContext);
}
