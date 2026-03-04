/**
 * [INPUT]: type, className
 * [OUTPUT]: 统一风格输入框组件（popup 同款输入容器）
 * [POS]: UI基础层 - 核心表单原语
 */
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground",
        "shadow-[0_1px_0_rgba(255,255,255,0.75)_inset]",
        "transition-all duration-200",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
