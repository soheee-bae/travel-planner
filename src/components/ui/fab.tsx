import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Fab({
  href,
  label,
  children,
  className,
}: {
  href: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "absolute right-4 bottom-18 z-30 flex size-14 items-center justify-center rounded-full",
        "bg-primary text-primary-foreground shadow-lg",
        "active:scale-95 transition-transform",
        className,
      )}
    >
      {children}
    </Link>
  );
}
