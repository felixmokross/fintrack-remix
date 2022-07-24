import type {
  ComponentPropsWithRef,
  ElementType,
  PropsWithChildren,
} from "react";
import { forwardRef } from "react";
import { cn } from "./classnames";
import type { PolymorphicComponentProps } from "./util";

export const Button = forwardRef(function Button<T extends ElementType>(
  { as, variant = "secondary", children, className, ...props }: ButtonProps<T>,
  ref?: ComponentPropsWithRef<T>["ref"]
) {
  const Component = as || "button";
  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto",
        {
          "border-transparent bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-600":
            variant === "primary",
          "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-white":
            variant === "secondary",
        },
        className
      )}
      {...props}
      ref={ref}
    >
      {children}
    </Component>
  );
});

export type ButtonProps<T extends ElementType> = PropsWithChildren<
  PolymorphicComponentProps<T> & {
    variant?: "primary" | "secondary";
  }
>;
