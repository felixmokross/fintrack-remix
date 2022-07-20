import type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementType,
  PropsWithChildren,
} from "react";
import { forwardRef } from "react";
import { cn } from "./classnames";

export const Button = forwardRef(function Button<T extends ElementType>(
  { as, variant = "secondary", children, className, ...props }: ButtonProps<T>,
  ref?: ComponentPropsWithRef<T>["ref"]
) {
  const Component = as || "button";
  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto",
        {
          "border-transparent bg-indigo-600 text-white hover:bg-indigo-700":
            variant === "primary",
          "border-gray-300 bg-white text-gray-700 hover:bg-gray-50":
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

export type ButtonProps<T extends ElementType> = PropsWithChildren<{
  as?: T;
  variant?: "primary" | "secondary";
}> &
  ComponentPropsWithoutRef<T>;

export const ModalButton = forwardRef(function ModalButton<
  T extends ElementType
>(
  { className, ...props }: ButtonProps<T>,
  ref?: ComponentPropsWithRef<T>["ref"]
) {
  return (
    <Button
      className={cn(className, "w-full text-base sm:ml-3 sm:text-sm")}
      {...props}
      ref={ref}
    />
  );
});
