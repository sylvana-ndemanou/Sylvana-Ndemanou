import { StoryAudioProvider } from "@/components/story/story-audio";
import { StoryBook } from "@/components/story/story-book";
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
  const t = await getTranslations({ locale, namespace: "Story" });
  return createMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: `/${locale}/story`,
    // A quietly hidden, personal page — kept out of search indexes.
    noIndex: true,
  });
}

export default async function StoryPage({
  params,
}: {
  params: Promise<Params>;
}): Promise<ReactNode> {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <StoryAudioProvider>
      <StoryBook />
    </StoryAudioProvider>
  );
}
