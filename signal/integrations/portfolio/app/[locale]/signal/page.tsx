import { SignalFrame } from "@/components/signal/signal-frame";
import { createMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return createMetadata({
    title: t("signalTitle"),
    description: t("signalDescription"),
    path: `/${locale}/signal`,
  });
}

export default async function SignalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<ReactNode> {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main id="main-content" className="relative flex flex-1 flex-col pt-[5.75rem]">
      <SignalFrame />
    </main>
  );
}
