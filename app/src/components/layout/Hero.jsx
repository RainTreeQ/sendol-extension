import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Coins, Crown, Globe, HandHeart, Languages, MoonStar, ShieldCheck, Sparkles, SunMoon, Wallet } from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings";

const COPY = {
  "zh-CN": {
    heroBadge: "Chrome / Edge 浏览器扩展",
    title1: "一次输入，",
    title2: "同时对比不同 AI 的回答",
    subtitle:
      "Sendol 帮你把多个 AI 输入聚合在一个弹窗中。只需输入一次，即可一键多发，同时支持自动发送与开启新对话。",
    ctaPricing: "查看收费方案",
    ctaSupport: "支持项目",
    ctaInstall: "安装与使用指南",
    statPlatforms: "支持平台",
    statMode: "发送模式",
    statDraft: "草稿保护",
    statModeValue: "手动/自动/新对话",
    statDraftValue: "意外关闭自动恢复",
    popupScreenshotAlt: "Sendol 扩展弹窗演示",
    featureTitle: "核心功能",
    featureDesc: "化繁为简：输入、勾选、发送，就这么简单。",
    featureOneTitle: "一次输入，多端同步",
    featureOneBody: "告别在多个 AI 平台间的繁琐复制粘贴，让提问更高效。",
    featureTwoTitle: "状态可视，发送无忧",
    featureTwoBody: "智能识别当前已打开的 AI 标签页，并清晰展示发送状态及错误提示。",
    featureThreeTitle: "草稿保护，内容不丢",
    featureThreeBody: "即使弹窗意外关闭或发生中断，未发送的草稿也会被优先恢复。",
    pricingTitle: "免费可用，灵活升级",
    pricingDesc: "社区版即可满足日常核心需求，Pro 版为您解锁更强大的效率工具。",
    communityTitle: "社区版",
    communityDesc: "完全免费 / 核心开源",
    communityBody1: "包含基础广播、自动发送及草稿保护功能。",
    communityBody2: "满足个人轻量化、高频次的提问需求。",
    communityBtn: "查看开源代码",
    proTitle: "专业版",
    proDesc: "预计定价: ¥19/月 或 ¥149/年",
    proBody1: "即将推出：提示词模板、内容整理笔记、历史记录、自定义规则、以上支持本地保存。",
    proBody2: "享受平台改版的优先适配服务，确保工作流不中断。",
    proBtn: "加入 Pro 候补名单",
    sponsorTitle: "赞助支持",
    sponsorDesc: "用爱发电 / 支持独立开发者",
    sponsorBody1: "如果您觉得这个工具对您有帮助，欢迎以赞助的方式支持项目维护。",
    sponsorBody2: "您的支持将成为产品持续迭代的最大动力。",
    sponsorBtn: "前往赞助页面",
    languageTitle: "多语言与深色模式",
    languageDesc: "界面提供中英双语，支持自动跟随系统切换深浅色模式。",
    languagePractice1: "初次使用会自动匹配您的浏览器语言设置。",
    languagePractice2: "可通过顶部菜单手动切换语言，偏好会自动保存。",
    languagePractice3: "如果遇到暂未翻译的语种，将自动回退为英文。",
    languagePractice4: "界面和演示截图均支持 System / Light / Dark 模式实时切换。",
    roadmapTitle: "计划支持的语言",
    roadmapDesc: "当前优先打磨中文与英文体验，后续将逐步扩展更多语种。",
    supportTitle: "适用场景",
    supportDesc: "专为需要同时向多个 AI 提问的高效工作者设计。",
    supportBody1: "极具竞争力的工具，适用于写作、研发、运营等多平台并行提问。",
    supportBody2: "快速将同一个问题发给多个大模型，直观对比并获取最佳回答。",
    supportCtaTitle: "即刻开始",
    supportCtaDesc: "零配置上手：安装扩展后，只需打开所需的 AI 页面即可使用。",
    supportCtaBody1: "建议先用社区版体验流畅工作流，如有进阶需求再考虑升级。",
    supportCtaBody2: "随时欢迎通过反馈或赞助来支持我们的持续迭代。",
  },
  en: {
    heroBadge: "Chrome / Edge Extension",
    title1: "Type Once,",
    title2: "Ask Every AI Instantly",
    subtitle:
      "Sendol brings your favorite AI tabs into one unified popup. Write your prompt once and broadcast it everywhere, with optional auto-send and new chat features.",
    ctaPricing: "View Pricing",
    ctaSupport: "Support the Creator",
    ctaInstall: "Install Guide",
    statPlatforms: "Supported Platforms",
    statMode: "Send Modes",
    statDraft: "Draft Protection",
    statModeValue: "Manual/Auto/New",
    statDraftValue: "Auto-restores on close",
    popupScreenshotAlt: "Sendol extension popup interface",
    featureTitle: "Core Features",
    featureDesc: "Keeping it beautifully simple: write, select, and send.",
    featureOneTitle: "One Prompt, Multiple AI",
    featureOneBody: "Stop copying and pasting across tabs. Broadcast your message to multiple AI platforms instantly.",
    featureTwoTitle: "Clear Sending Status",
    featureTwoBody: "Automatically detects your open AI tabs and provides transparent status and error feedback.",
    featureThreeTitle: "Reliable Draft Recovery",
    featureThreeBody: "Accidentally closed the popup? Your unsent drafts are automatically saved and restored.",
    pricingTitle: "Free Core, Pro Options",
    pricingDesc: "The Community version covers all your essential needs. Upgrade to Pro for advanced productivity.",
    communityTitle: "Community",
    communityDesc: "Free / Open Source",
    communityBody1: "Includes core broadcasting, auto-send, and reliable draft saving.",
    communityBody2: "Perfect for personal, lightweight, and high-frequency usage.",
    communityBtn: "View on GitHub",
    proTitle: "Pro",
    proDesc: "Expected: $5/mo or $49/yr",
    proBody1: "Coming soon: Template library, notes, history panel, and custom rules. All saved locally.",
    proBody2: "Priority updates to adapt to AI platform UI changes, minimizing disruptions.",
    proBtn: "Join Pro Waitlist",
    sponsorTitle: "Sponsor",
    sponsorDesc: "Back the Developer",
    sponsorBody1: "Love the tool? Direct sponsorship helps maintain and improve the project.",
    sponsorBody2: "Ideal for long-term users who want to ensure continuous active development.",
    sponsorBtn: "Sponsor this Project",
    languageTitle: "Languages & Themes",
    languageDesc: "Enjoy a consistent experience with EN/CN support and automatic Light/Dark mode.",
    languagePractice1: "Automatically defaults to your browser's preferred language.",
    languagePractice2: "Easily switch languages in the header, and we'll remember your choice.",
    languagePractice3: "Seamlessly falls back to English for unsupported languages.",
    languagePractice4: "Full support for System / Light / Dark themes, complete with synchronized screenshots.",
    roadmapTitle: "Upcoming Languages",
    roadmapDesc: "Focusing on top-tier English and Chinese experiences first before expanding.",
    supportTitle: "Perfect For...",
    supportDesc: "Designed for power users who consult multiple AI models simultaneously.",
    supportBody1: "Ideal for coding, writing, and research tasks requiring parallel AI assistance.",
    supportBody2: "Easily compare responses from different models to find the absolute best answer.",
    supportCtaTitle: "Get Started",
    supportCtaDesc: "Zero setup required: Just install the extension and open your favorite AI tabs.",
    supportCtaBody1: "Try the free Community version first to see how it transforms your workflow.",
    supportCtaBody2: "Feel free to support our ongoing development via feedback or sponsorship.",
  },
};

function PlatformLogos() {
  const icons = [
    // OpenAI (ChatGPT)
    "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
    // Anthropic (Claude)
    "M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z",
    // Google Gemini
    "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81"
  ];

  return (
    <div className="mt-1 flex flex-wrap gap-x-1 gap-y-2">
      <div className="flex flex-wrap items-center [&>*:nth-child(n+2)]:-ml-1.5">
        {icons.map((path, i) => (
          <div
            key={i}
            className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted text-foreground ring-1 ring-border/20"
            style={{ zIndex: icons.length + 1 - i }}
          >
            <svg className="h-[14px] w-[14px]" viewBox="0 0 24 24" fill="currentColor">
              <path d={path} />
            </svg>
          </div>
        ))}
        {/* "5+" counter */}
        <div
          className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-background bg-background text-foreground ring-1 ring-border/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.05)]"
          style={{ zIndex: 0 }}
        >
          <span className="text-[10px] font-bold tracking-tighter">5+</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 首页：面向转化的落地页，视觉与 popup 一致。
 */
export function Hero() {
  const { locale, plannedLocales, resolvedTheme } = useSiteSettings();
  const copy = COPY[locale] || COPY.en;
  const screenshotSrc = resolvedTheme === "dark" ? "/screenshot-dark.png" : "/screenshot-light.png";

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
              {copy.heroBadge}
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl md:leading-[1.15]">
                {copy.title1}
                <span className="mt-1 block bg-linear-to-br from-foreground to-foreground/50 bg-clip-text text-transparent md:mt-2">
                  {copy.title2}
                </span>
              </h1>
              <p className="max-w-xl text-[15px] leading-7 text-muted-foreground md:text-base">
                {copy.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <a href="#pricing">{copy.ctaPricing}</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#support">
                  {copy.ctaSupport}
                  <HandHeart className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <a href="https://github.com/RainTreeQ/sendol-extension#-installation--安装" target="_blank" rel="noreferrer">
                  {copy.ctaInstall}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card variant="inset" className="rounded-2xl min-w-0">
                <CardHeader className="space-y-1 p-4">
                  <CardDescription className="text-[11px] uppercase tracking-[0.12em] wrap-break-word">{copy.statPlatforms}</CardDescription>
                  <PlatformLogos />
                </CardHeader>
              </Card>
              <Card variant="inset" className="rounded-2xl">
                <CardHeader className="space-y-1 p-4">
                  <CardDescription className="text-[11px] uppercase tracking-[0.12em]">{copy.statMode}</CardDescription>
                  <CardTitle className="text-xl">{copy.statModeValue}</CardTitle>
                </CardHeader>
              </Card>
              <Card variant="inset" className="rounded-2xl">
                <CardHeader className="space-y-1 p-4">
                  <CardDescription className="text-[11px] uppercase tracking-[0.12em]">{copy.statDraft}</CardDescription>
                  <CardTitle className="text-xl">{copy.statDraftValue}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="group relative max-w-[380px] overflow-hidden rounded-[24px] shadow-[0_30px_60px_-35px_rgba(0,0,0,0.65)] ring-1 ring-border/50 transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_45px_75px_-30px_rgba(0,0,0,0.8)] hover:ring-border/80">
              {/* 微拟物：顶部光泽遮罩，悬浮时稍微加强 */}
              <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-b from-white/10 to-transparent opacity-40 mix-blend-overlay transition-opacity duration-700 group-hover:opacity-70 dark:from-white/5" />
              <img
                src={screenshotSrc}
                alt={copy.popupScreenshotAlt}
                className="block h-auto w-full transition-transform duration-700 group-hover:scale-[1.015]"
                loading="eager"
              />
            </div>
          </div>
        </div>

        <section id="features" aria-labelledby="features-heading" className="mt-24 space-y-6 md:mt-32 md:space-y-8">
          <div className="flex flex-col items-center text-center gap-3">
            <h2 id="features-heading" className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{copy.featureTitle}</h2>
            <p className="text-sm text-muted-foreground md:text-base">{copy.featureDesc}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card variant="default" className="group relative overflow-hidden transition-colors hover:border-foreground/20">
              <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-foreground/5 blur-2xl transition-all duration-500 group-hover:bg-foreground/10" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Wallet className="h-4 w-4" /> {copy.featureOneTitle}</CardTitle>
              </CardHeader>
              <CardContent className="text-[15px] text-foreground/80">
                <p>{copy.featureOneBody}</p>
              </CardContent>
            </Card>
            <Card variant="default" className="group relative overflow-hidden transition-colors hover:border-foreground/20">
              <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-foreground/5 blur-2xl transition-all duration-500 group-hover:bg-foreground/10" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4" /> {copy.featureTwoTitle}</CardTitle>
              </CardHeader>
              <CardContent className="text-[15px] text-foreground/80">
                <p>{copy.featureTwoBody}</p>
              </CardContent>
            </Card>
            <Card variant="default" className="group relative overflow-hidden transition-colors hover:border-foreground/20">
              <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-foreground/5 blur-2xl transition-all duration-500 group-hover:bg-foreground/10" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4" /> {copy.featureThreeTitle}</CardTitle>
              </CardHeader>
              <CardContent className="text-[15px] text-foreground/80">
                <p>{copy.featureThreeBody}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="pricing" aria-labelledby="pricing-heading" className="mt-24 space-y-6 md:mt-32 md:space-y-8">
          <div className="flex flex-col items-center text-center gap-3">
            <h2 id="pricing-heading" className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{copy.pricingTitle}</h2>
            <p className="text-sm text-muted-foreground md:text-base">
              {copy.pricingDesc}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card variant="default" className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Coins className="h-4 w-4" /> {copy.communityTitle}</CardTitle>
                <CardDescription>{copy.communityDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-[15px] text-foreground/80">
                <p>{copy.communityBody1}</p>
                <p>{copy.communityBody2}</p>
                <Button asChild variant="outline" className="mt-3 w-full">
                  <a href="https://github.com/RainTreeQ/sendol-extension" target="_blank" rel="noreferrer">{copy.communityBtn}</a>
                </Button>
              </CardContent>
            </Card>

            <Card variant="raised" className="relative overflow-hidden rounded-2xl border-foreground/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-foreground/5 to-transparent mix-blend-overlay" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2 text-lg"><Crown className="h-4 w-4" /> {copy.proTitle}</CardTitle>
                <CardDescription>{copy.proDesc}</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-2 text-[15px] text-foreground/80">
                <p>{copy.proBody1}</p>
                <p>{copy.proBody2}</p>
                <Button asChild className="mt-3 w-full">
                  <a href="https://github.com/RainTreeQ/sendol-extension/issues" target="_blank" rel="noreferrer">{copy.proBtn}</a>
                </Button>
              </CardContent>
            </Card>

            <Card variant="default" className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><HandHeart className="h-4 w-4" /> {copy.sponsorTitle}</CardTitle>
                <CardDescription>{copy.sponsorDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-[15px] text-foreground/80">
                <p>{copy.sponsorBody1}</p>
                <p>{copy.sponsorBody2}</p>
                <Button asChild variant="secondary" className="mt-3 w-full">
                  <a href="https://github.com/sponsors" target="_blank" rel="noreferrer">{copy.sponsorBtn}</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="support" aria-labelledby="support-heading" className="mt-24 space-y-6 md:mt-32 md:space-y-8">
          <div className="flex flex-col items-center text-center gap-3">
            <h2 id="support-heading" className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{copy.ctaSupport}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card variant="inset" className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">{copy.supportTitle}</CardTitle>
                <CardDescription>{copy.supportDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-[15px] text-foreground/80">
                <p>{copy.supportBody1}</p>
                <p>{copy.supportBody2}</p>
              </CardContent>
            </Card>
            <Card variant="inset" className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">{copy.supportCtaTitle}</CardTitle>
                <CardDescription>{copy.supportCtaDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-[15px] text-foreground/80">
                <p>{copy.supportCtaBody1}</p>
                <p>{copy.supportCtaBody2}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button asChild size="sm">
                    <a href="https://github.com/RainTreeQ/sendol-extension#-installation--安装" target="_blank" rel="noreferrer">
                      {copy.ctaInstall}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a href="#pricing">{copy.ctaPricing}</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="language" aria-labelledby="language-heading" className="mt-24 space-y-6 md:mt-32 md:space-y-8">
          <div className="flex flex-col items-center text-center gap-3">
            <h2 id="language-heading" className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{copy.languageTitle}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card variant="inset" className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Languages className="h-4 w-4" /> {copy.languageTitle}</CardTitle>
                <CardDescription>{copy.languageDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-[15px] text-foreground/80">
                <p>{copy.languagePractice1}</p>
                <p>{copy.languagePractice2}</p>
                <p>{copy.languagePractice3}</p>
                <p className="flex items-center gap-2">
                  <SunMoon className="h-4 w-4" />
                  {copy.languagePractice4}
                </p>
              </CardContent>
            </Card>

            <Card variant="inset" className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Globe className="h-4 w-4" /> {copy.roadmapTitle}</CardTitle>
                <CardDescription>{copy.roadmapDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {plannedLocales.map((item) => (
                    <Badge key={item.code} variant="outline" className="px-3 py-1 text-[11px]">
                      {item.label}
                    </Badge>
                  ))}
                </div>
                <p className="flex items-center gap-2 text-[15px] text-foreground/80">
                  <MoonStar className="h-4 w-4" />
                  system/light/dark
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </section>
  );
}
