import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300 shadow-sm shadow-emerald-900/10",
  secondary: "bg-white text-stone-700 border border-stone-300 hover:bg-stone-50 disabled:opacity-50",
  ghost: "text-stone-500 hover:text-stone-900 hover:bg-stone-100",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/** One styled button for the whole app, so sign-in/sign-out/nav all look consistent. */
export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
