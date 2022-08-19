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

export function NavBarLink({ children, ...props }: RemixLinkProps) {
  return (
    <RemixLink
      {...props}
      className="inline-block rounded-lg py-1 px-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </RemixLink>
  );
}
