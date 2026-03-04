/**
 * [INPUT]: variant, className
 * [OUTPUT]: 统一风格卡片组件（popup 同款分层变体）
 * [POS]: UI基础层 - 核心布局原语
 */
import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-3xl border transition-all duration-300",
  {
    variants: {
      variant: {
        default: [
          "bg-card border-border/90",
          "shadow-[0_1px_0_rgba(255,255,255,0.64)_inset,0_14px_24px_-22px_rgba(0,0,0,0.55)]",
        ].join(" "),
        raised: [
          "bg-card border-border/90",
          "shadow-[0_1px_0_rgba(255,255,255,0.72)_inset,0_20px_34px_-24px_rgba(0,0,0,0.72)]",
          "hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.72)_inset,0_24px_38px_-24px_rgba(0,0,0,0.78)]",
        ].join(" "),
        inset: [
          "bg-muted/65 border-border/70",
          "shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),inset_0_0_0_1px_rgba(0,0,0,0.03)]",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Card = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, className }))}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
