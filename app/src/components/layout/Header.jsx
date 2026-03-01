import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

/**
 * 页面顶栏。仅使用设计系统颜色与组件。
 */
export function Header() {
  const location = useLocation();
  const isDesignSystem = location.pathname === "/design-system";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background">
            <Send className="h-3.5 w-3.5" strokeWidth={2.4} />
          </span>
          <span className="text-lg">AI Broadcast</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button
            asChild
            variant={isDesignSystem ? "secondary" : "ghost"}
            size="sm"
          >
            <Link to="/design-system">Design System</Link>
          </Button>
          <Button asChild variant={location.pathname === "/" ? "secondary" : "ghost"} size="sm">
            <Link to="/">Home</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
