import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

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
  const location = useLocation();
  const isDesignSystem = location.pathname.startsWith("/design-system");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background shadow-[0_8px_16px_-12px_rgba(0,0,0,0.75)] [--logo-divider:#000] dark:[--logo-divider:theme(colors.zinc.100)]">
            <LogoIcon className="h-4 w-4" />
          </span>
          <span className="text-base tracking-tight">SendAll</span>
        </Link>

        <nav className="flex items-center gap-1.5">
          <Button asChild variant={location.pathname === "/" ? "secondary" : "ghost"} size="sm">
            <Link to="/">Landing</Link>
          </Button>
          <Button
            asChild
            variant={isDesignSystem ? "secondary" : "ghost"}
            size="sm"
          >
            <Link to="/design-system">System</Link>
          </Button>
          <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
            <a href="https://github.com/RainTreeQ/sendall-extension" target="_blank" rel="noreferrer">
              GitHub
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </Button>
          <Button asChild variant="default" size="sm" className="hidden md:inline-flex">
            <a href="/#pricing">Pro</a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
