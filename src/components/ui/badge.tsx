import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  // Colț mic și mono, ca etichetele hărții. Pastila plină rotundă era
  // semnătura stilului dinaintea plăcii.
  "num inline-flex items-center rounded-sm border px-2 py-0.5 text-[0.63rem] uppercase tracking-[0.14em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-gilt/40 bg-gilt-soft text-gilt",
        secondary: "border-line text-muted-foreground",
        destructive: "border-crit/40 text-crit",
        outline: "border-line text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
