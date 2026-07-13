import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

import { siteLinks } from "@/lib/site";

type Locale = "en" | "fr";

const BRAND = {
  bg: "#f4f2ee",
  card: "#ffffff",
  ink: "#141414",
  muted: "#6b6b6b",
  border: "#e6e2da",
  accent: "#9a7b43",
};

const main = {
  backgroundColor: BRAND.bg,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: "24px 0",
};

const container = {
  backgroundColor: BRAND.card,
  border: `1px solid ${BRAND.border}`,
  borderRadius: "14px",
  margin: "0 auto",
  maxWidth: "560px",
  overflow: "hidden",
};

const headerBar = {
  backgroundColor: BRAND.ink,
  borderBottom: `3px solid ${BRAND.accent}`,
  padding: "20px 32px",
};

const wordmark = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: 600,
  letterSpacing: "0.02em",
  margin: 0,
};

const kicker = {
  color: BRAND.accent,
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
};

const contentPad = { padding: "28px 32px" };
const heading = {
  color: BRAND.ink,
  fontSize: "22px",
  fontWeight: 600,
  lineHeight: "1.25",
  margin: "0 0 16px",
};
const paragraph = {
  color: BRAND.ink,
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 12px",
};
const label = {
  color: BRAND.muted,
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase" as const,
  margin: "0 0 2px",
};
const messageBox = {
  backgroundColor: BRAND.bg,
  border: `1px solid ${BRAND.border}`,
  borderRadius: "10px",
  color: BRAND.ink,
  fontSize: "15px",
  lineHeight: "1.6",
  padding: "16px 18px",
  whiteSpace: "pre-wrap" as const,
};
const hr = { borderColor: BRAND.border, margin: "24px 0" };
const footer = {
  color: BRAND.muted,
  fontSize: "12px",
  lineHeight: "1.5",
  margin: 0,
};
const linkStyle = { color: BRAND.accent, textDecoration: "none" };

function Shell({
  preview,
  children,
}: {
  preview: string;
  children: ReactElement | ReactElement[];
}): ReactElement {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerBar}>
            <Text style={wordmark}>Sylvana Ndemanou</Text>
          </Section>
          <Section style={contentPad}>{children}</Section>
        </Container>
      </Body>
    </Html>
  );
}

/** Sent to Sylvana when someone submits the contact form. */
export function ContactNotificationEmail({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}): ReactElement {
  return (
    <Shell preview={`New portfolio message from ${name}`}>
      <Text style={kicker}>New message</Text>
      <Heading style={heading}>Someone reached out via your portfolio</Heading>

      <Text style={label}>From</Text>
      <Text style={paragraph}>
        {name} &middot;{" "}
        <Link href={`mailto:${email}`} style={linkStyle}>
          {email}
        </Link>
      </Text>

      <Text style={label}>Message</Text>
      <Text style={messageBox}>{message}</Text>

      <Hr style={hr} />
      <Text style={footer}>
        Reply directly to this email to respond to {name}.
      </Text>
    </Shell>
  );
}

const CONFIRMATION_COPY: Record<
  Locale,
  {
    preview: string;
    kicker: string;
    heading: string;
    greeting: (name: string) => string;
    intro: string;
    yourMessage: string;
    outro: string;
    signoff: string;
    footer: string;
  }
> = {
  en: {
    preview: "Thanks for reaching out — I’ll get back to you soon.",
    kicker: "Message received",
    heading: "Thanks for reaching out!",
    greeting: (name) => `Hi ${name},`,
    intro:
      "Thanks for your message — it landed safely and I’ll get back to you as soon as I can. Here’s a copy of what you sent:",
    yourMessage: "Your message",
    outro:
      "In the meantime, feel free to book a quick intro call if that’s easier.",
    signoff: "Talk soon,\nSylvana Ndemanou · BI & Data Consultant",
    footer: "You’re receiving this because you contacted me via my portfolio.",
  },
  fr: {
    preview: "Merci pour votre message — je vous réponds bientôt.",
    kicker: "Message reçu",
    heading: "Merci pour votre message !",
    greeting: (name) => `Bonjour ${name},`,
    intro:
      "Merci pour votre message — il m’est bien parvenu et je vous réponds dès que possible. Voici une copie de ce que vous avez envoyé :",
    yourMessage: "Votre message",
    outro:
      "En attendant, n’hésitez pas à réserver un court appel découverte si c’est plus simple.",
    signoff: "À bientôt,\nSylvana Ndemanou · Consultante BI & Data",
    footer:
      "Vous recevez ce courriel car vous m’avez contactée via mon portfolio.",
  },
};

/** Auto-reply sent to the person who submitted the form (localized). */
export function ContactConfirmationEmail({
  name,
  message,
  locale,
}: {
  name: string;
  message: string;
  locale: Locale;
}): ReactElement {
  const t = CONFIRMATION_COPY[locale] ?? CONFIRMATION_COPY.en;
  return (
    <Shell preview={t.preview}>
      <Text style={kicker}>{t.kicker}</Text>
      <Heading style={heading}>{t.heading}</Heading>
      <Text style={paragraph}>{t.greeting(name)}</Text>
      <Text style={paragraph}>{t.intro}</Text>

      <Text style={label}>{t.yourMessage}</Text>
      <Text style={messageBox}>{message}</Text>

      <Text style={paragraph}>
        {t.outro}{" "}
        <Link href={`https://cal.com/${siteLinks.calLink}`} style={linkStyle}>
          cal.com/{siteLinks.calLink}
        </Link>
      </Text>

      <Hr style={hr} />
      <Text style={{ ...paragraph, whiteSpace: "pre-line" }}>{t.signoff}</Text>
      <Text style={footer}>{t.footer}</Text>
    </Shell>
  );
}

export async function renderContactNotification(props: {
  name: string;
  email: string;
  message: string;
}): Promise<{ html: string; text: string }> {
  const el = <ContactNotificationEmail {...props} />;
  return {
    html: await render(el),
    text: await render(el, { plainText: true }),
  };
}

export async function renderContactConfirmation(props: {
  name: string;
  message: string;
  locale: Locale;
}): Promise<{ html: string; text: string }> {
  const el = <ContactConfirmationEmail {...props} />;
  return {
    html: await render(el),
    text: await render(el, { plainText: true }),
  };
}
