import type { ElementType, PropsWithChildren } from "react";
import type { PolymorphicComponentProps } from "~/utils";
import { cn } from "./classnames";

export function buttonClassName(variant: ButtonVariant = "secondary") {
  return cn(
    "inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto",
    {
      "border-transparent bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-600":
        variant === "primary",
      "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-white":
        variant === "secondary",
    }
  );
}

export function Button<T extends ElementType>({
  as,
  variant = "secondary",
  children,
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || "button";
  return (
    <Component
      className={cn(buttonClassName(variant), className)}
      {...(Component === "button" ? { type: "button" } : {})}
      {...props}
    >
      {children}
    </Component>
  );
}

export type ButtonProps<T extends ElementType> = PropsWithChildren<
  PolymorphicComponentProps<T> & {
    variant?: ButtonVariant;
  }
>;

type ButtonVariant = "primary" | "secondary";
