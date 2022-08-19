import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { cn } from "./classnames";

const baseStyles = {
  solid:
    "group inline-flex items-center justify-center rounded-full py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
  outline:
    "group inline-flex ring-1 items-center justify-center rounded-full py-2 px-4 text-sm focus:outline-none",
};

const variantStyles = {
  solid: {
    slate:
      "bg-slate-900 text-white hover:bg-slate-700 hover:text-slate-100 active:bg-slate-800 active:text-slate-300 focus-visible:outline-slate-900",
    sky: "bg-sky-600 text-white hover:text-slate-100 hover:bg-sky-500 active:bg-sky-800 active:text-sky-100 focus-visible:outline-sky-600",
    white:
      "bg-white text-slate-900 hover:bg-sky-50 active:bg-sky-200 active:text-slate-600 focus-visible:outline-white",
  },
  outline: {
    slate:
      "ring-slate-200 text-slate-700 hover:text-slate-900 hover:ring-slate-300 active:bg-slate-100 active:text-slate-600 focus-visible:outline-sky-600 focus-visible:ring-slate-300",
    sky: "",
    white:
      "ring-slate-700 text-white hover:ring-slate-500 active:ring-slate-700 active:text-slate-400 focus-visible:outline-white",
  },
};

export function NewButton({
  to,
  className,
  variant = "solid",
  color = "slate",
  children,
  type,
}: NewButtonProps) {
  className = cn(baseStyles[variant], variantStyles[variant][color], className);

  return to ? (
    <Link to={to} className={className}>
      {children}
    </Link>
  ) : (
    <button className={className} type={type}>
      {children}
    </button>
  );
}

type NewButtonProps = PropsWithChildren<{
  variant?: "solid" | "outline";
  color?: "slate" | "sky" | "white";
  className?: string;
  to?: string;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
}>;
