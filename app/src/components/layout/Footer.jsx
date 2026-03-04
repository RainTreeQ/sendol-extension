import { Link } from "react-router-dom";
import { Heart, Sparkles } from "lucide-react";

/**
 * 页脚。仅使用设计系统颜色与组件。
 */
export function Footer() {
  return (
    <footer className="w-full border-t border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="container flex flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row md:px-6">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          SendAll · Open Source Core + Pro Features
        </p>
        <nav className="flex gap-6">
          <Link
            to="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Landing
          </Link>
          <a
            href="/#pricing"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </a>
          <a
            href="/#support"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Support
            <Heart className="h-3.5 w-3.5" />
          </a>
          <Link
            to="/design-system"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            System
          </Link>
        </nav>
      </div>
    </footer>
  );
}
