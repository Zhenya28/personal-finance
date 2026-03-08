import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive transition-[color,box-shadow,background-color,border-color] overflow-hidden tracking-[0.02em]",
  {
    variants: {
      variant: {
        default: "border-indigo-400/55 bg-indigo-500/20 text-indigo-100 [a&]:hover:bg-indigo-500/28",
        secondary:
          "border-white/12 bg-white/[0.06] text-white/80 [a&]:hover:bg-white/10",
        destructive:
          "border-red-500/40 bg-destructive/20 text-red-300 [a&]:hover:bg-destructive/30 focus-visible:ring-destructive/20",
        outline:
          "border-white/16 bg-black/15 text-white/70 [a&]:hover:bg-white/[0.06]",
        ghost: "[a&]:hover:bg-white/[0.06] [a&]:hover:text-white",
        link: "text-indigo-400 underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
