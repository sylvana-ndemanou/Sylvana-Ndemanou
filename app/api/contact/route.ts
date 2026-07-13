import { NextResponse } from "next/server";
import { Resend } from "resend";

import {
  renderContactConfirmation,
  renderContactNotification,
} from "@/emails/contact-emails";
import { siteLinks } from "@/lib/site";

export const runtime = "nodejs";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  locale?: unknown;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValid(payload: ContactPayload): payload is {
  name: string;
  email: string;
  message: string;
  locale?: string;
} {
  return (
    typeof payload.name === "string" &&
    payload.name.trim().length > 0 &&
    typeof payload.email === "string" &&
    EMAIL_RE.test(payload.email) &&
    typeof payload.message === "string" &&
    payload.message.trim().length > 0
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isValid(payload)) {
    return NextResponse.json({ error: "invalid_input" }, { status: 422 });
  }

  const apiKey =
    process.env.RESEND_API_KEY_PORTFOLIO ?? process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Not configured yet — fail clearly so the UI can suggest the mailto fallback.
    console.warn("[contact] Resend API key is not set; cannot send email.");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { name, email, message } = payload;
  const locale = payload.locale === "fr" ? "fr" : "en";
  const from = process.env.RESEND_FROM ?? "Portfolio <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  // Primary: notify Sylvana. Its failure surfaces to the UI (mailto fallback).
  try {
    const notification = await renderContactNotification({
      name,
      email,
      message,
    });
    const { error } = await resend.emails.send({
      from,
      to: siteLinks.email,
      replyTo: email,
      subject: `Portfolio contact — ${name}`,
      html: notification.html,
      text: notification.text,
    });

    if (error) {
      console.error("[contact] Resend notification error:", error);
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  // Best-effort: send a localized confirmation to the sender. Failing here
  // (e.g. Resend sandbox without a verified domain) must not fail the request.
  try {
    const confirmation = await renderContactConfirmation({
      name,
      message,
      locale,
    });
    const { error } = await resend.emails.send({
      from,
      to: email,
      subject:
        locale === "fr"
          ? "Merci pour votre message — Sylvana Ndemanou"
          : "Thanks for reaching out — Sylvana Ndemanou",
      html: confirmation.html,
      text: confirmation.text,
    });
    if (error) {
      console.warn("[contact] Confirmation email not sent:", error);
    }
  } catch (err) {
    console.warn("[contact] Confirmation email failed (non-fatal):", err);
  }

  return NextResponse.json({ ok: true });
}
