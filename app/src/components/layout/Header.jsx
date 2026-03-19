import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ChevronDown, Globe, Monitor, Moon, Sun } from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings";

function LogoIcon({ className }) {
  const cx = 12;
  const cy = 12;
  const r = 10;
  const xLeft = cx - r / 3;
  const xRight = cx + r / 3;
  const dy = Math.sqrt(r * r - (r / 3) ** 2);
  const yTop = cy - dy;
  const yBottom = cy + dy;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
      <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />
      <line x1={xLeft} y1={yTop} x2={xLeft} y2={yBottom} stroke="var(--logo-divider, #000)" />
      <line x1={xRight} y1={yTop} x2={xRight} y2={yBottom} stroke="var(--logo-divider, #000)" />
    </svg>
  );
}

/**
 * 页面顶栏。仅使用设计系统颜色与组件。
 */
export function Header() {
  const { locale, setLocale, supportedLocales, themeMode, setThemeMode } = useSiteSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const TRANSLATIONS = {
    "zh-CN": {
      landing: "落地页", pro: "专业版", github: "GitHub", pricing: "定价", support: "支持", faq: "常见问题",
      mainNav: "主导航", language: "语言", theme: "主题", systemMode: "系统", lightMode: "浅色", darkMode: "深色",
    },
    "zh-TW": {
      landing: "登陸頁", pro: "專業版", github: "GitHub", pricing: "定價", support: "支援", faq: "常見問題",
      mainNav: "主導航", language: "語言", theme: "主題", systemMode: "系統", lightMode: "淺色", darkMode: "深色",
    },
    ja: {
      landing: "ランディング", pro: "Pro", github: "GitHub", pricing: "料金", support: "サポート", faq: "FAQ",
      mainNav: "メインナビゲーション", language: "言語", theme: "テーマ", systemMode: "システム", lightMode: "ライト", darkMode: "ダーク",
    },
    ko: {
      landing: "랜딩 페이지", pro: "Pro", github: "GitHub", pricing: "가격", support: "지원", faq: "FAQ",
      mainNav: "메인 내비게이션", language: "언어", theme: "테마", systemMode: "시스템", lightMode: "라이트", darkMode: "다크",
    },
    es: {
      landing: "Inicio", pro: "Pro", github: "GitHub", pricing: "Precios", support: "Soporte", faq: "FAQ",
      mainNav: "Navegación principal", language: "Idioma", theme: "Tema", systemMode: "Sistema", lightMode: "Claro", darkMode: "Oscuro",
    },
    de: {
      landing: "Startseite", pro: "Pro", github: "GitHub", pricing: "Preise", support: "Support", faq: "FAQ",
      mainNav: "Hauptnavigation", language: "Sprache", theme: "Theme", systemMode: "System", lightMode: "Hell", darkMode: "Dunkel",
    },
    fr: {
      landing: "Accueil", pro: "Pro", github: "GitHub", pricing: "Tarifs", support: "Support", faq: "FAQ",
      mainNav: "Navigation principale", language: "Langue", theme: "Thème", systemMode: "Système", lightMode: "Clair", darkMode: "Sombre",
    },
    en: {
      landing: "Landing", pro: "Pro", github: "GitHub", pricing: "Pricing", support: "Support", faq: "FAQ",
      mainNav: "Main Navigation", language: "Language", theme: "Theme", systemMode: "System", lightMode: "Light", darkMode: "Dark",
    }
  };
  const copy = TRANSLATIONS[locale] || TRANSLATIONS.en;

  const cycleThemeMode = () => {
    const order = ["system", "light", "dark"];
    const idx = order.indexOf(themeMode);
    setThemeMode(order[(idx + 1) % order.length]);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between gap-2 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background shadow-[0_8px_16px_-12px_rgba(0,0,0,0.75)] [--logo-divider:#000] dark:[--logo-divider:var(--color-zinc-100)]">
            <LogoIcon className="h-4 w-4" />
          </span>
          <span className="text-base tracking-tight">Sendol</span>
        </Link>

        <nav aria-label={copy.mainNav} className="flex items-center gap-1.5">
          <button
            type="button"
            title={copy.theme}
            aria-label={copy.theme}
            onClick={cycleThemeMode}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground lg:hidden"
          >
            {themeMode === "dark" ? <Moon className="h-3.5 w-3.5" /> : themeMode === "light" ? <Sun className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
          </button>

          <div className="hidden items-center gap-1 rounded-lg border border-border bg-card px-1 py-1 lg:inline-flex">
            <button
              type="button"
              title={copy.systemMode}
              aria-label={copy.systemMode}
              onClick={() => setThemeMode("system")}
              className={`inline-flex h-6 w-6 items-center justify-center rounded-md transition ${themeMode === "system" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title={copy.lightMode}
              aria-label={copy.lightMode}
              onClick={() => setThemeMode("light")}
              className={`inline-flex h-6 w-6 items-center justify-center rounded-md transition ${themeMode === "light" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title={copy.darkMode}
              aria-label={copy.darkMode}
              onClick={() => setThemeMode("dark")}
              className={`inline-flex h-6 w-6 items-center justify-center rounded-md transition ${themeMode === "dark" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>

          <label className="relative block">
            <Globe className="pointer-events-none absolute left-1/2 sm:left-3 top-1/2 h-4 w-4 sm:h-3.5 sm:w-3.5 -translate-x-1/2 sm:translate-x-0 -translate-y-1/2 text-muted-foreground" />
            <select
              aria-label={copy.language}
              value={locale}
              onChange={(event) => setLocale(event.target.value)}
              className="h-8 w-8 sm:h-8 sm:min-w-0 sm:w-auto sm:pl-8 sm:pr-8 cursor-pointer appearance-none rounded-xl border border-border bg-card text-card-foreground pl-8 pr-0 text-foreground text-xs font-semibold outline-none transition focus:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-[0_1px_0_rgba(255,255,255,0.72)_inset,0_10px_20px_-18px_rgba(0,0,0,0.62)] hover:bg-accent dark:shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_10px_20px_-18px_rgba(0,0,0,0.9)] [&>option]:text-foreground"
            >
              {supportedLocales.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground sm:block" />
          </label>

          <Button variant="ghost" size="sm" className="hidden md:inline-flex" onClick={(e) => handleScrollTo(e, "pricing")}>
            {copy.pricing}
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link to="/faq">{copy.faq}</Link>
          </Button>
          <Button variant="ghost" size="sm" className="hidden md:inline-flex" onClick={(e) => handleScrollTo(e, "support")}>
            {copy.support}
          </Button>
          <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
            <a href="https://github.com/RainTreeQ/sendol-extension" target="_blank" rel="noreferrer">
              {copy.github}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </Button>
          <Button variant="default" size="sm" className="hidden md:inline-flex" onClick={(e) => handleScrollTo(e, "pricing")}>
            {copy.pro}
          </Button>
        </nav>
      </div>
    </header>
  );
}
