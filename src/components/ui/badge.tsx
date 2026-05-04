import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        texto: "border-transparent bg-[hsl(var(--texto-color)/0.15)] text-[hsl(var(--texto-color))] [&>svg]:text-[hsl(var(--texto-color))]",
        image: "border-transparent bg-[hsl(var(--image-color)/0.15)] text-[hsl(var(--image-color))] [&>svg]:text-[hsl(var(--image-color))]",
        video: "border-transparent bg-[hsl(var(--video-color)/0.15)] text-[hsl(var(--video-color))] [&>svg]:text-[hsl(var(--video-color))]",
        audio: "border-transparent bg-[hsl(var(--audio-color)/0.15)] text-[hsl(var(--audio-color))] [&>svg]:text-[hsl(var(--audio-color))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
