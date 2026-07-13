"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent, type ReactNode } from "react";

import { siteLinks } from "@/lib/site";

type Status = "idle" | "submitting" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm(): ReactNode {
  const t = useTranslations("Contact.form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!name.trim() || !EMAIL_RE.test(email) || !message.trim()) {
      setStatus("error");
      setFeedback(t("invalid"));
      return;
    }

    setStatus("submitting");
    setFeedback(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      setStatus("success");
      setFeedback(t("success"));
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setFeedback(t("error"));
    }
  };

  const inputClass =
    "w-full rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-[15px] text-foreground outline-none transition-colors placeholder:text-foreground/40 focus:border-accent/60 focus-ring";

  const isSubmitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-name" className="text-[13px] font-medium tracking-tight text-foreground/70">
          {t("name")}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-email" className="text-[13px] font-medium tracking-tight text-foreground/70">
          {t("email")}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="text-[13px] font-medium tracking-tight text-foreground/70">
          {t("message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("messagePlaceholder")}
          className={`${inputClass} resize-y`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t("sending") : t("send")}
        </button>

        {feedback && (
          <p
            role="status"
            aria-live="polite"
            className={`text-[13px] tracking-tight ${
              status === "success" ? "text-accent" : "text-foreground/60"
            }`}
          >
            {status === "error" ? (
              <>
                {feedback}{" "}
                <a href={`mailto:${siteLinks.email}`} className="underline underline-offset-2">
                  {siteLinks.email}
                </a>
              </>
            ) : (
              feedback
            )}
          </p>
        )}
      </div>
    </form>
  );
}
