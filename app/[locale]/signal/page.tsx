import { SignalPage } from "@/components/signal/signal-page";
import { routing } from "@/i18n/routing";
import { createMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

type Params = { locale: string };

export function generateStaticParams(): Params[] {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return createMetadata({
    title: t("signalTitle"),
    description: t("signalDescription"),
    path: `/${locale}/signal`,
  });
}

export default async function SignalRoute({
  params,
}: {
  params: Promise<Params>;
}): Promise<ReactNode> {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SignalPage />;
}
