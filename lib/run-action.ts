"use client";

import { toast } from "sonner";

/**
 * Next.js identifies each server action by a hash of the built code. Deploying
 * changes those hashes, so a page left open across a deploy posts an id the new
 * build has never heard of and the request 404s with this message. Reloading
 * fetches the current ids and the action works again.
 */
const STALE_DEPLOYMENT =
  /Failed to find Server Action|Connection closed|Failed to fetch|NetworkError|Load failed/i;

/**
 * Runs a server action without letting a failure take the page down.
 *
 * An unhandled rejection inside a transition escapes to the nearest error
 * boundary, which for this app means the full-page 500 screen — a lost form and
 * no explanation, for something as ordinary as a dropped connection. Every
 * failure is turned into a toast instead, with a Reload button so the user is
 * never stuck.
 *
 * @returns the action's result, or `undefined` if it failed.
 */
export async function runAction<T>(run: () => Promise<T>): Promise<T | undefined> {
  try {
    return await run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");

    if (STALE_DEPLOYMENT.test(message)) {
      toast.error("The site was updated. Reloading…");
      // Deliberately not instant: let the toast be read first.
      setTimeout(() => window.location.reload(), 1200);
      return undefined;
    }

    // Server errors are redacted in production, so log whatever we have for
    // support and show the user something actionable.
    console.error("Server action failed:", error);
    toast.error("Something went wrong. Please try again.", {
      action: { label: "Reload", onClick: () => window.location.reload() },
    });
    return undefined;
  }
}
