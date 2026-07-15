"use client";

import { useState, useEffect } from "react";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { tokenStorage, StoredUserInfo } from "@/lib/token-storage";
import { authService } from "@/features/auth";
import {
    Menu,
    X,
    LogIn,
    LogOut,
    ArrowRight,
    LayoutDashboard,
} from "lucide-react";

export function SiteHeader() {
    const t = useTranslations('Navigation');
    const headerT = useTranslations('Dashboard.Header');
    const router = useRouter();
    const pathname = usePathname();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [userInfo, setUserInfo] = useState<StoredUserInfo | null>(null);

    const getInitials = (name: string) =>
        name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase() || "U";

    const isVerified = userInfo?.status === "ACTIVE" && userInfo?.kycLevel !== "NONE";

    // Scroll-aware background
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const tokens = tokenStorage.get();
        setIsAuthenticated(!!tokens?.accessToken);
        setUserInfo(tokenStorage.getUser());
        setIsLoading(false);
    }, []);

    const handleLogout = async () => {
        await authService.logout();
        setIsAuthenticated(false);
        router.push('/');
    };

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const menuItems = [
        { label: t('services'),      href: '/services' },
        { label: t('pricing'),       href: '/pricing' },
        { label: t('try_it'),        href: '/try' },
        { label: t('documentation'), href: '/docs' },
        { label: t('about'),         href: '/about' },
    ];

    const isActive = (href: string) =>
        pathname === href || (href !== '/' && pathname.startsWith(href));

    return (
        <>
            {/* Backdrop overlay - closes mobile menu on outside click */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />
            )}

            {/* Fond opaque : le HeroBackground contient un orbe animé qui transparaissait
                à travers un header semi-transparent et en faisait dériver la teinte. */}
            <header className={cn(
                "fixed top-0 left-0 right-0 z-50 bg-background border-b border-border transition-shadow duration-300",
                isScrolled
                    ? "shadow-md dark:shadow-black/40"
                    : "shadow-sm"
            )}>
                <div className="container">
                    <div className="h-16 flex items-center justify-between gap-4">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0">
                            <div className="relative h-8 w-8">
                                <Image
                                    src="/images/logo_sharepay_bg_remove_svg.svg"
                                    alt="SharePay Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <span className="font-bold text-xl text-primary">SharePay</span>
                        </Link>

                        {/* Desktop Nav - pleine hauteur pour ancrer l'indicatif actif sur la bordure basse */}
                        <nav className="hidden lg:flex items-center h-16">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "relative h-full flex items-center px-3 text-sm font-medium transition-colors whitespace-nowrap",
                                        isActive(item.href)
                                            ? "text-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {item.label}
                                    {isActive(item.href) && (
                                        <span className="absolute inset-x-3 bottom-0 h-0.5 bg-primary rounded-full" />
                                    )}
                                </Link>
                            ))}
                        </nav>

                        {/* Right actions */}
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

                            {/* Theme + Language - dès lg, sinon inaccessible entre lg et xl */}
                            <div className="hidden lg:flex items-center gap-0 border rounded-full pl-1 pr-2 py-0.5 bg-background/50 hover:border-primary/50 transition-colors">
                                <ThemeToggle />
                                <div className="h-4 w-px bg-border mx-1" />
                                <LanguageSwitcher />
                            </div>

                            {/* Auth actions - chaque élément a son propre breakpoint */}
                            {isLoading ? (
                                <div className="hidden sm:flex h-9 w-32 animate-pulse bg-muted rounded-full" />
                            ) : isAuthenticated ? (
                                <>
                                    {/* Dashboard - hidden below lg */}
                                    <div className="hidden lg:flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="font-medium rounded-full gap-1.5" asChild>
                                            <Link href="/merchant/dashboard">
                                                <LayoutDashboard className="h-4 w-4" />
                                                {t('dashboard')}
                                            </Link>
                                        </Button>
                                        <div className="h-6 w-px bg-border" />
                                    </div>
                                    {/* Avatar - hidden below sm */}
                                    <div className="hidden sm:flex">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-full" suppressHydrationWarning>
                                                    <div className="relative">
                                                        <Avatar className={`h-8 w-8 transition-colors ${isVerified ? "outline outline-2 outline-green-500 outline-offset-2" : "border border-primary/20 hover:border-primary/40"}`}>
                                                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                                                                {getInitials(userInfo?.fullName ?? "U")}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuLabel
                                                    className="font-semibold cursor-pointer hover:bg-muted/60 rounded-sm transition-colors"
                                                    onClick={() => router.push('/merchant/profile')}
                                                >
                                                    <p>{userInfo?.fullName ?? "-"}</p>
                                                    <p className="text-xs text-muted-foreground font-normal truncate">{userInfo?.email ?? ""}</p>
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => router.push('/merchant/account')}>
                                                    <Image src="/icons/user.png" alt="" width={16} height={16} className="mr-2 dark:invert dark:opacity-90" />
                                                    {headerT('account')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                    onClick={handleLogout}
                                                >
                                                    <LogOut className="h-4 w-4 mr-2" />
                                                    {headerT('logout')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Login - hidden below lg */}
                                    <div className="hidden lg:flex">
                                        <Button variant="ghost" size="sm" className="font-medium rounded-full gap-1.5" asChild>
                                            <Link href="/merchant/login">
                                                <LogIn className="h-4 w-4" />
                                                {t('login')}
                                            </Link>
                                        </Button>
                                    </div>
                                    {/* Get Started - hidden below sm (CTA prioritaire) */}
                                    <div className="hidden sm:flex">
                                        <Button size="sm" asChild className="font-semibold rounded-full gap-1.5 shadow-md hover:shadow-lg transition-all">
                                            <Link href="/merchant/register">
                                                {t('register')}
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            )}

                            {/* Hamburger - hidden at lg+ */}
                            <button
                                className="lg:hidden p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Toggle menu"
                                aria-expanded={isMobileMenuOpen}
                            >
                                {isMobileMenuOpen
                                    ? <X className="h-5 w-5" />
                                    : <Menu className="h-5 w-5" />
                                }
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu - panneau pleine largeur sous la barre */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t bg-background max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                        <div className="container py-5">

                            {/* Nav links */}
                            <nav className="flex flex-col gap-1 mb-4">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                                            isActive(item.href)
                                                ? "bg-primary/10 text-primary"
                                                : "text-foreground hover:bg-muted/60 hover:text-primary"
                                        )}
                                        onClick={closeMobileMenu}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>

                            <div className="h-px bg-border w-full mb-4" />

                            {/* Theme + Language */}
                            <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl border mb-4">
                                <span className="text-sm font-medium text-muted-foreground">{headerT('settings')}</span>
                                <div className="flex items-center bg-background rounded-full border px-2 py-1">
                                    <ThemeToggle />
                                    <div className="h-4 w-px bg-border mx-1" />
                                    <LanguageSwitcher />
                                </div>
                            </div>

                            {/* Auth section */}
                            {isLoading ? (
                                <div className="h-20 w-full animate-pulse bg-muted rounded-xl" />
                            ) : isAuthenticated ? (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border">
                                        <div className="relative shrink-0">
                                            <Avatar className={`h-9 w-9 transition-colors ${isVerified ? "outline outline-2 outline-green-500 outline-offset-2" : "border border-primary/20"}`}>
                                                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                                                    {getInitials(userInfo?.fullName ?? "U")}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-semibold text-sm truncate">{userInfo?.fullName ?? "-"}</span>
                                            <span className="text-xs text-muted-foreground truncate">{userInfo?.email ?? ""}</span>
                                        </div>
                                    </div>
                                    <Button className="w-full h-11 rounded-xl gap-2" asChild>
                                        <Link href="/merchant/dashboard" onClick={closeMobileMenu}>
                                            <LayoutDashboard className="h-4 w-4" />
                                            {t('dashboard')}
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full h-11 rounded-xl gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                                        onClick={() => { closeMobileMenu(); handleLogout(); }}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        {headerT('logout')}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Button variant="outline" className="w-full h-11 rounded-xl gap-2" asChild>
                                        <Link href="/merchant/login" onClick={closeMobileMenu}>
                                            <LogIn className="h-4 w-4" />
                                            {t('login')}
                                        </Link>
                                    </Button>
                                    <Button className="w-full h-11 rounded-xl gap-2 shadow-lg" asChild>
                                        <Link href="/merchant/register" onClick={closeMobileMenu}>
                                            {t('register')}
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}
