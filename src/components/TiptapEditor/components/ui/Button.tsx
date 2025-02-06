import React, { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline';
}

const Button = ({ className, variant = 'solid', ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        "rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variant === 'solid' && "bg-blue-600 text-white hover:bg-blue-700",
        variant === 'outline' && "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800",
        className
      )}
      {...props}
    />
  );
};

export default Button;
