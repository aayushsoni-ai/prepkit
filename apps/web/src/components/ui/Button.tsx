import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, children, className = "", ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--accent)]";

    const sizes = {
      sm: "text-xs px-2.5 py-1.5 rounded",
      md: "text-sm px-4 py-2 rounded-md",
      lg: "text-base px-6 py-2.5 rounded-lg"
    };

    const variants = {
      primary: "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm",
      secondary: "bg-transparent border border-[var(--border-dark)] text-[var(--text)] hover:bg-[var(--subtle-bg)]",
      ghost: "bg-transparent text-[var(--text)] hover:bg-[var(--subtle-bg)]",
      danger: "bg-[#8A2B18] text-white hover:bg-[#722313]"
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
