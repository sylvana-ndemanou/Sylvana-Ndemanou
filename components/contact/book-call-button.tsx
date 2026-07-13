"use client";

import { getCalApi } from "@calcom/embed-react";
import { CalendarClock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, type ReactNode } from "react";

import { siteLinks } from "@/lib/site";

export function BookCallButton(): ReactNode {
  const t = useTranslations("Contact");
  const locale = useLocale();

  useEffect(() => {
    void (async () => {
      const cal = await getCalApi();
      cal("ui", {
        theme: "auto",
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <button
      type="button"
      data-cal-link={siteLinks.calLink}
      data-cal-config={JSON.stringify({ layout: "month_view", theme: "auto" })}
      lang={locale}
      className="focus-ring group inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-5 text-sm font-medium text-foreground transition-colors hover:bg-accent/20"
    >
      <CalendarClock className="h-4 w-4 text-accent" aria-hidden="true" />
      {t("bookCall")}
    </button>
  );
}
