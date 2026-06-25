"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTransition } from "react";
import { Check, Languages, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const languages = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
  ];

  function onSelect(nextLocale: string) {
    if (nextLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          suppressHydrationWarning
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground outline-none cursor-pointer transition-colors hover:text-primary px-2 py-1.5 rounded-lg border-none bg-transparent"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Languages className="h-4 w-4" />
          )}

          <span className="uppercase font-semibold">{locale}</span>
          <ChevronDown className="h-3 w-3 opacity-50 transition-transform duration-300" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40 p-1">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            disabled={isPending}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
              locale === lang.code
                ? "font-semibold text-primary bg-primary/5 focus:bg-primary/10"
                : "text-foreground focus:bg-muted"
            )}
          >
            <span>{lang.label}</span>

            {locale === lang.code && (
              <Check className="h-3.5 w-3.5 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}