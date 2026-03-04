import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Coins, Crown, HandHeart, ShieldCheck, Sparkles, Wallet } from "lucide-react";

/**
 * 首页：面向转化的落地页，视觉与 popup 一致。
 */
export function Hero() {
  const sessionRows = [
    { name: "ChatGPT", title: "需求拆解草稿" },
    { name: "Claude", title: "实现方案 v2" },
    { name: "Gemini", title: "回归测试清单" },
    { name: "Doubao", title: "中文文案润色" },
  ];

  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-0 h-[520px]">
        <div className="absolute -left-36 top-4 h-72 w-72 rounded-full bg-foreground/8 blur-3xl" />
        <div className="absolute -right-32 top-20 h-72 w-72 rounded-full bg-foreground/6 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 pb-20 pt-12 md:px-6 md:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          <div className="space-y-7">
            <Badge variant="outline" className="px-3 py-1 text-[10px] uppercase tracking-[0.16em]">
              Open Source Core
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                你的 AI 广播中枢
                <span className="block text-muted-foreground">开源可用，收费可持续。</span>
              </h1>
              <p className="max-w-xl text-[15px] leading-7 text-muted-foreground md:text-base">
                SendAll 把多标签页 AI 会话变成一个工作台。你继续维护自己会用的工具，同时通过 Pro 能力和赞助获得稳定收益。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <a href="#pricing">查看收费方案</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#support">
                  接受捐赠
                  <HandHeart className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link to="/design-system">
                  对齐后的 Design System
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card variant="inset" className="rounded-2xl">
                <CardHeader className="space-y-1 p-4">
                  <CardDescription className="text-[11px] uppercase tracking-[0.12em]">支持平台</CardDescription>
                  <CardTitle className="text-xl">9+</CardTitle>
                </CardHeader>
              </Card>
              <Card variant="inset" className="rounded-2xl">
                <CardHeader className="space-y-1 p-4">
                  <CardDescription className="text-[11px] uppercase tracking-[0.12em]">产品路线</CardDescription>
                  <CardTitle className="text-xl">Core + Pro</CardTitle>
                </CardHeader>
              </Card>
              <Card variant="inset" className="rounded-2xl">
                <CardHeader className="space-y-1 p-4">
                  <CardDescription className="text-[11px] uppercase tracking-[0.12em]">护城河</CardDescription>
                  <CardTitle className="text-xl">维护速度</CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>

          <div className="surface-glass noise-grid relative rounded-[28px] p-4 sm:p-5">
            <div className="rounded-2xl border border-border/80 bg-card/90 p-3 shadow-[0_12px_28px_-20px_rgba(0,0,0,0.72)]">
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-foreground/85" />
                  <p className="text-sm font-semibold tracking-tight text-foreground">SendAll Popup</p>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">Live</span>
              </div>

              <div className="space-y-2.5">
                {sessionRows.map((row) => (
                  <div key={row.name} className="flex items-center gap-2 rounded-xl border border-border/80 bg-background px-2.5 py-2">
                    <span className={`platform-badge platform-${row.name} rounded-full px-2 py-0.5 text-[10px] font-semibold`}>
                      {row.name}
                    </span>
                    <span className="truncate text-xs font-medium text-muted-foreground">{row.title}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-2xl border border-border/90 bg-muted/70 p-3">
                <div className="mb-2 rounded-lg bg-card px-3 py-2.5 text-xs text-muted-foreground">
                  例如：把下面这段提示词同时发给全部已打开会话...
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex h-4 w-7 rounded-full bg-foreground" />
                    Auto Send
                  </div>
                  <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background shadow-[0_8px_20px_-10px_rgba(0,0,0,0.62)]">
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <Card variant="default">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Wallet className="h-4 w-4" /> 为什么需要落地页</CardTitle>
              <CardDescription>把“能用”转成“能卖”</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>明确价值边界：开源免费层 vs 收费 Pro 层。</p>
              <p>减少用户猜测成本，让定价和入口一眼可见。</p>
            </CardContent>
          </Card>
          <Card variant="default">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4" /> 开源下的护城河</CardTitle>
              <CardDescription>copy 代码不等于 copy 业务</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>你是官方发布者，商店信任和更新速度是核心壁垒。</p>
              <p>把付费点放在服务端和交付能力，而不是源码本体。</p>
            </CardContent>
          </Card>
          <Card variant="default">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4" /> 运营负担可控</CardTitle>
              <CardDescription>保持你“顺手维护”的节奏</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>先上轻量 Pro 功能，再做团队版和自动化账单。</p>
              <p>功能升级与 README/版本自动化同步，减少手工成本。</p>
            </CardContent>
          </Card>
        </div>

        <div id="pricing" className="mt-16 space-y-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">收费与开源并行</h2>
            <p className="text-sm text-muted-foreground md:text-base">
              建议从轻量分层开始：免费层保持强可用，Pro 提供可持续付费价值。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card variant="default" className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Coins className="h-4 w-4" /> Community</CardTitle>
                <CardDescription>免费 / 开源</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>基础广播、自动发送、草稿保留。</p>
                <p>持续公开迭代，吸引新用户进入漏斗。</p>
                <Button asChild variant="outline" className="mt-3 w-full">
                  <a href="https://github.com/RainTreeQ/sendall-extension" target="_blank" rel="noreferrer">继续开源</a>
                </Button>
              </CardContent>
            </Card>

            <Card variant="raised" className="rounded-2xl border-foreground/15">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Crown className="h-4 w-4" /> Pro</CardTitle>
                <CardDescription>建议: 19/月 或 149/年</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>模板库、历史面板、云同步、批量规则。</p>
                <p>优先适配页面改版，提供更稳定的升级体验。</p>
                <Button asChild className="mt-3 w-full">
                  <a href="https://github.com/RainTreeQ/sendall-extension/issues" target="_blank" rel="noreferrer">加入 Pro 等候</a>
                </Button>
              </CardContent>
            </Card>

            <Card variant="default" className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><HandHeart className="h-4 w-4" /> Sponsor</CardTitle>
                <CardDescription>捐赠 / 支持作者</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>不改变现有功能，也能直接支持维护成本。</p>
                <p>适合认可方向但暂不需要 Pro 的用户。</p>
                <Button asChild variant="secondary" className="mt-3 w-full">
                  <a href="https://github.com/sponsors" target="_blank" rel="noreferrer">添加捐赠入口</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div id="support" className="mt-16 grid gap-4 md:grid-cols-2">
          <Card variant="inset" className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">落地页结论</CardTitle>
              <CardDescription>要做，而且越早越好。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>没有落地页，用户只看见“工具”；有落地页，用户看见“产品与价值”。</p>
              <p>你的维护节奏本来就稳定，补上定价与支持入口后，转化率会比只放仓库链接更高。</p>
            </CardContent>
          </Card>
          <Card variant="inset" className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">下一步建议</CardTitle>
              <CardDescription>先最小可行，不追求一次到位。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>第一阶段: Pro 等候名单 + 捐赠入口 + 收费说明。</p>
              <p>第二阶段: 上线 1-2 个真正难复制的 Pro 功能。</p>
              <p>第三阶段: 团队版与年度订阅，形成稳定现金流。</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
