// @ts-nocheck
import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { AppChrome } from "@s/components/app-chrome";
import { PlayHoverRoot } from "@s/components/play-hover";
import { AudioRoot } from "@s/components/sound-toggle";
import { LocaleRoot } from "@s/lib/i18n";
import { LOCALE_BOOT } from "@s/lib/locale";
import { AUTHOR_NAME, PORTFOLIO_URL } from "@s/lib/site";
import { EMBED_BOOT } from "@s/lib/embed";
import { THEME_BOOT } from "@s/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  title: "Signal — jeux d’intelligence d’affaires et d’ingénierie data",
  description:
    "Mini-jeux d’œil, de schéma, de pipeline, de grain et de Snowflake : intelligence d’affaires, ingénierie des données, architecture, warehouses et Time Travel. Un projet personnel de Sylvana Ndemanou.",
  authors: [{ name: AUTHOR_NAME, url: PORTFOLIO_URL }],
  creator: AUTHOR_NAME,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} min-h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: THEME_BOOT + LOCALE_BOOT + EMBED_BOOT }}
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <AudioRoot />
        <LocaleRoot />
        <PlayHoverRoot>
          <AppChrome>{children}</AppChrome>
        </PlayHoverRoot>
      </body>
    </html>
  );
}
