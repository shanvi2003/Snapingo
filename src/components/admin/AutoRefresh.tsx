"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Every panel page (leads inbox, dashboards, the sidebar's new-lead badge) is
// a Server Component reading straight from the DB - there's no push channel
// telling an open tab that a new lead just came in, so without this a staff
// member watching /staff/leads only sees it after a manual hard refresh.
// router.refresh() re-runs the current route's Server Components in place
// (no full reload, no lost scroll/client state), so a short poll here is a
// cheap stand-in for real-time updates without standing up a WebSocket/SSE
// channel. 20s balances "feels live" against extra DB load on every open tab.
const POLL_MS = 20_000;

export default function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), POLL_MS);
    return () => clearInterval(id);
  }, [router]);

  return null;
}
