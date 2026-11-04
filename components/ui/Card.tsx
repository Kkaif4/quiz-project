import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  tilt?: "none" | "left" | "right";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, active, tilt = "none", children, ...props }, ref) => {
    const tiltClasses = {
      none: "",
      left: "sticker-tilt-left",
      right: "sticker-tilt-right",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "card-surface rounded-3xl p-6 sm:p-8 transition-all duration-150",
          active && "border-[#FFB830] ring-2 ring-[#FFB830]/30",
          tiltClasses[tilt],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
