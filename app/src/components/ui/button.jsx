/**
 * [INPUT]: variant, size, isLoading, leftIcon, rightIcon, asChild, className
 * [OUTPUT]: 统一风格按钮组件（popup 同款中性风格）
 * [POS]: UI基础层 - 核心交互原语
 */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap text-sm font-semibold",
    "rounded-xl",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-foreground text-background shadow-[0_6px_16px_-10px_rgba(0,0,0,0.55)] hover:-translate-y-0.5 hover:shadow-[0_10px_18px_-12px_rgba(0,0,0,0.65)]",
        primary: "bg-foreground text-background shadow-[0_6px_16px_-10px_rgba(0,0,0,0.55)] hover:-translate-y-0.5 hover:shadow-[0_10px_18px_-12px_rgba(0,0,0,0.65)]",
        destructive: "bg-destructive text-destructive-foreground shadow-[0_6px_16px_-10px_rgba(185,28,28,0.45)] hover:-translate-y-0.5",
        accent: "border border-border bg-card text-card-foreground shadow-[0_1px_0_rgba(255,255,255,0.72)_inset,0_10px_20px_-18px_rgba(0,0,0,0.62)] hover:bg-accent",
        secondary: "border border-border bg-secondary text-secondary-foreground shadow-[0_1px_0_rgba(255,255,255,0.72)_inset] hover:bg-muted",
        outline: "border border-border bg-card text-card-foreground shadow-[0_1px_0_rgba(255,255,255,0.72)_inset] hover:bg-muted",
        ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
        link: "p-0 h-auto rounded-none text-foreground underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-9 px-4",
        md: "h-10 px-5",
        lg: "h-11 px-6 text-base",
        xl: "h-12 px-7 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button"

  // Slot (asChild) 只接受单一子元素，不能包裹 leftIcon/children/rightIcon 多个节点
  const slotContent = asChild ? (
    children
  ) : (
    <>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </>
  )

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {slotContent}
    </Comp>
  )
})
Button.displayName = "Button"

export { Button }
