import { NextResponse } from "next/server";
import { Resend } from "resend";

import { siteLinks } from "@/lib/site";

export const runtime = "nodejs";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValid(payload: ContactPayload): payload is {
  name: string;
  email: string;
  message: string;
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
    console.warn("[contact] RESEND_API_KEY is not set; cannot send email.");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { name, email, message } = payload;
  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      // Uses Resend's shared sender until a verified domain is connected.
      from: process.env.RESEND_FROM ?? "Portfolio <onboarding@resend.dev>",
      to: siteLinks.email,
      replyTo: email,
      subject: `Portfolio contact — ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    if (error) {
      console.error("[contact] Resend error:", error);
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
