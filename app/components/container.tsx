import type { PropsWithChildren } from "react";
import { cn } from "./classnames";

export function Container({
  className,
  children,
}: PropsWithChildren<ContainerProps>) {
  return (
    <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

type ContainerProps = { className?: string };
