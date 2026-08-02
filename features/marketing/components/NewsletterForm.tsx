"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

/**
 * There's no newsletter/email-list backend in this project — signing up here
 * opens the visitor's mail client addressed to the salon with their address
 * pre-filled, rather than pretending to submit to a list that doesn't exist.
 */
export function NewsletterForm({ contactEmail }: { contactEmail?: string }) {
  const [email, setEmail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contactEmail || !email) return;
    const subject = encodeURIComponent("Newsletter signup");
    const body = encodeURIComponent(`Please add me to the newsletter: ${email}`);
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xs gap-2">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Your email address"
        className="placeholder:text-cream-200/50 focus-visible:ring-olive-300 min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus-visible:ring-2"
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className="bg-olive-500 hover:bg-olive-400 flex size-10 shrink-0 items-center justify-center rounded-full text-white transition-colors"
      >
        <Send className="size-4" aria-hidden />
      </button>
    </form>
  );
}
