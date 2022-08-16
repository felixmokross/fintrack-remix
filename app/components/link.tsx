import type { LinkProps as RemixLinkProps } from "@remix-run/react";
import { Link as RemixLink } from "@remix-run/react";
import { cn } from "./classnames";

export function Link({ children, className, ...props }: RemixLinkProps) {
  return (
    <RemixLink
      {...props}
      className={cn("text-sky-600 hover:underline", className)}
    >
      {children}
    </RemixLink>
  );
}
