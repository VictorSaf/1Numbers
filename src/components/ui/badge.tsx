import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  // Doar literă. Chenarul de 1px pe patru laturi în jurul a două cuvinte era
  // ultima cutie din sistem; înainte de el fusese pastila plină și rotundă.
  // Ce distinge o etichetă de textul din jur e corpul mic, spațierea și
  // culoarea -- nu o casetă.
  "num inline-flex items-center text-[0.63rem] uppercase tracking-[0.14em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "text-gilt",
        secondary: "text-muted-foreground",
        destructive: "text-tension",
        outline: "text-foreground",
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
