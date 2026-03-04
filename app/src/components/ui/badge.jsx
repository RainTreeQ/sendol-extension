/**
 * [INPUT]: variant, className
 * [OUTPUT]: 统一风格徽标组件（popup 同款中性风格）
 * [POS]: UI基础层 - 数据展示原语
 */
import * as React from "react"
import { cva } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-border bg-card text-card-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant = "default", style, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      className={cn(
        badgeVariants({ variant }),
        variant !== "outline" && "shadow-[0_1px_0_rgba(255,255,255,0.24)_inset]",
        className
      )}
      style={style}
      {...props}
    />
  )
}

export { Badge }
