import type {
  ComponentPropsWithoutRef,
  ElementType,
  PropsWithChildren,
} from "react";
import { cn } from "./classnames";

export function Button<T extends ElementType>({
  as,
  children,
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || "button";
  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export type ButtonProps<T extends ElementType> = PropsWithChildren<{
  as?: T;
}> &
  ComponentPropsWithoutRef<T>;
