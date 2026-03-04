import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ArrowUp, Check, RefreshCw } from "lucide-react";

/**
 * 设计系统展示页：对齐当前 popup 真实 UI。
 */
export function DesignSystem() {
  const tabs = [
    { platform: "ChatGPT", title: "项目方案评审" },
    { platform: "Claude", title: "代码重构建议" },
    { platform: "Gemini", title: "测试用例补全" },
    { platform: "Doubao", title: "中文文案优化" },
  ];

  const tokens = [
    { name: "background", className: "bg-background text-foreground border-border" },
    { name: "card", className: "bg-card text-card-foreground border-border" },
    { name: "primary", className: "bg-primary text-primary-foreground border-primary/20" },
    { name: "secondary", className: "bg-secondary text-secondary-foreground border-border" },
    { name: "muted", className: "bg-muted text-muted-foreground border-border" },
    { name: "destructive", className: "bg-destructive text-destructive-foreground border-destructive/20" },
  ];

  return (
    <div className="container mx-auto max-w-6xl space-y-10 px-4 py-10 md:px-6 md:py-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Design System</h1>
        <p className="text-muted-foreground">
          当前规范直接映射到 SendAll popup：中性黑白灰、圆角列表、底部悬浮输入区、低噪声动效。
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Color Tokens</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {tokens.map((token) => (
            <div key={token.name} className={`rounded-2xl border p-4 text-center text-xs font-semibold tracking-wide ${token.className}`}>
              {token.name}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card variant="raised" className="overflow-hidden">
          <div className="relative bg-background p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between border-b border-border/70 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-primary-foreground shadow-[0_8px_16px_-12px_rgba(0,0,0,0.65)]">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <p className="text-sm font-semibold tracking-tight text-foreground">Popup Shell</p>
              </div>
              <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {tabs.map((tab, index) => {
                const selected = index < 3;
                return (
                  <div key={tab.platform} className={`group flex items-center gap-2.5 rounded-xl px-3 py-2 transition ${selected ? "bg-card ring-1 ring-border shadow-[0_10px_22px_-20px_rgba(0,0,0,0.62)]" : "hover:bg-muted"}`}>
                    <div className={`flex h-4 w-4 items-center justify-center rounded-full ${selected ? "bg-foreground text-primary-foreground" : "border border-border bg-card"}`}>
                      {selected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                    </div>
                    <span className={`platform-badge platform-${tab.platform} rounded-full px-2 py-0.5 text-[10px] font-semibold`}>
                      {tab.platform}
                    </span>
                    <span className="truncate text-xs font-medium text-muted-foreground">{tab.title}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-border/90 bg-muted/75 p-3">
              <textarea
                className="h-20 w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none"
                defaultValue="把这个需求分解为 3 个里程碑，并给出风险项。"
                readOnly
              />
              <div className="mt-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Switch checked />
                    Auto Send
                  </div>
                  <div className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Switch />
                    New Chat
                  </div>
                </div>
                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-primary-foreground shadow-[0_10px_18px_-14px_rgba(0,0,0,0.82)]">
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Popup Metrics</CardTitle>
            <CardDescription>交互规范与状态反馈</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-xl border border-border bg-muted/55 p-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Size</p>
              <p className="mt-1 font-mono text-xs text-foreground">380 × 520 (min)</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/55 p-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Corner Radius</p>
              <p className="mt-1 font-mono text-xs text-foreground">container 16 / list 12 / button 9999</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/55 p-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Motion</p>
              <p className="mt-1 font-mono text-xs text-foreground">100-300ms, tiny scale + fade only</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/55 p-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Status Colors</p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                success
                <span className="ml-2 h-2 w-2 rounded-full bg-rose-500" />
                error
                <span className="ml-2 h-2 w-2 rounded-full bg-zinc-400" />
                pending
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Primitive Components</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-base">Buttons</CardTitle>
              <CardDescription>主按钮黑底，次按钮轻背景</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2.5">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </CardContent>
          </Card>

          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-base">Badges & Inputs</CardTitle>
              <CardDescription>平台标识与表单视觉</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <span className="platform-badge platform-ChatGPT rounded-full px-2 py-0.5 text-[10px] font-semibold">ChatGPT</span>
                <span className="platform-badge platform-Claude rounded-full px-2 py-0.5 text-[10px] font-semibold">Claude</span>
              </div>
              <Input placeholder="Popup 输入框样式" />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
