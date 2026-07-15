"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Facebook, Linkedin, Github, CheckCircle2, Mail, ArrowRight, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { tokenStorage } from "@/lib/token-storage";

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.494h2.039L6.486 3.24H4.298l13.311 17.407z" />
  </svg>
);

export function SiteFooter() {
  const t = useTranslations('Footer');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAuthenticated(!!tokenStorage.get()?.accessToken);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialLinks = [
    { icon: XIcon, href: "#", label: "X" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Facebook, href: "#", label: "Facebook" },
  ];

  const footerLinks = {
    product: [
      { name: t('services'), href: "/services" },
      { name: t('pricing'), href: "/pricing" },
      { name: t('try_it'), href: "/try" },
      { name: t('api'), href: "/docs" },
    ],
    company: [
      { name: t('about'), href: "/about" },
      { name: t('faq'), href: "/faq" },
      { name: t('contact'), href: "/contact" },
    ],
    legal: [
      { name: t('privacy'), href: "/legal/privacy" },
      { name: t('terms'), href: "/legal/terms" },
      { name: t('security'), href: "/legal/security" },
      { name: t('cookies'), href: "/legal/cookies" },
    ]
  };

  return (
    <footer className="relative bg-[#fcfcfd] dark:bg-[#030711] border-t border-border/40 pt-16 pb-8 overflow-hidden">
      {/* Subtile top line gradient */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        
        {/* --- SECTION PRINCIPALE --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Marque & Actions (Prend 2 colonnes sur grand écran) */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3 w-fit">
              <Image 
                src="/images/logo_sharepay_bg_remove_svg.svg" 
                alt="SharePay Logo" 
                width={32} 
                height={32} 
                className="object-contain"
              />
              <span className="font-semibold text-xl tracking-tight text-primary">
                SharePay
              </span>
            </Link>
            
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {t('tagline')}
            </p>

            {/* Boutons d'action subtils */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isAuthenticated === false && (
                <Button asChild size="sm" className="rounded-full shadow-none hover:bg-primary/90">
                  <Link href="/merchant/register">
                    {t('preStartCTA')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="sm" className="rounded-full bg-transparent hover:bg-muted">
                <Link href="/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  {t('contactBtn')}
                </Link>
              </Button>
            </div>
          </div>

          {/* Liens de navigation */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">{t('product')}</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">{t('company')}</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">{t('legal')}</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* --- SECTION INFÉRIEURE --- */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6" suppressHydrationWarning>
          <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
            <p className="text-sm text-muted-foreground" suppressHydrationWarning>
              {t('copyright')}
            </p>
            <span className="hidden md:inline text-border/50">•</span>
            
            {/* Crédit TEASEA Incubator */}
            <p className="text-sm text-muted-foreground" suppressHydrationWarning>
              {t('developedBy')}{' '}
              <a 
                href="https://www.te-sea.com" /* Remplace par le vrai lien si différent */
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium hover:text-primary transition-colors duration-200"
              >
                TE-SEA Incubator
              </a>
            </p>

            <span className="hidden md:inline text-border/50">•</span>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20" suppressHydrationWarning>
              <CheckCircle2 className="h-3 w-3" />
              <span>{t('systemStatus')}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a 
                key={social.label}
                href={social.href} 
                target="_blank" 
                rel="noreferrer"
                aria-label={social.label}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
            
            <div className="h-6 w-px bg-border/50 mx-2 hidden sm:block" />
            
            <Button 
                variant="default" 
                size="icon" 
                onClick={scrollToTop}
                className="h-10 w-10 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all group bg-primary hover:bg-primary/90"
                title="Scroll to top"
            >
                <ArrowUp className="h-5 w-5 group-hover:-translate-y-1 transition-transform text-primary-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}