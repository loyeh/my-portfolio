"use client";

import { startTransition, useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { submitContact, type ContactFormState } from "@/app/actions/contact";

const INITIAL_STATE: ContactFormState = { status: "idle" };

// Wraps the Server Action so a thrown error (network failure, or a stale action ID
// after a deploy) becomes a form error instead of hitting the error boundary.
async function submitContactSafely(
  previous: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  try {
    return await submitContact(previous, formData);
  } catch {
    return { status: "error", error: "Something went wrong. Please refresh and try again." };
  }
}

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot, kept empty by real users
  const [state, formAction, pending] = useActionState(submitContactSafely, INITIAL_STATE);

  const canSubmit = name.trim() && email.trim() && message.trim() && !pending;

  // Dispatch manually instead of <form action>: React resets forms after an action,
  // which would wipe the visitor's text when sending fails.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    const formData = new FormData(e.currentTarget);
    startTransition(() => formAction(formData));
  }

  const inputClasses =
    "w-full rounded-md border border-line bg-card px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brass";

  if (state.status === "sent") {
    return (
      <p className="rounded-md border border-line bg-card px-4 py-3 text-sm text-ink-soft">
        Thanks — your message is on its way. I&apos;ll get back to you soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink-soft">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClasses}
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink-soft">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink-soft">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputClasses}
          placeholder="What are you building, and how can I help?"
        />
      </div>

      <input
        type="text"
        name="company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {state.status === "error" && (
        <p className="font-mono text-xs text-red-500">{state.error}</p>
      )}

      <Button type="submit" disabled={!canSubmit} className="disabled:opacity-40">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
