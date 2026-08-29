import { Link } from "@tanstack/react-router";
import { Dumbbell, Home, LineChart, Settings } from "lucide-react";

const items = [
  { to: "/", label: "Hjem", icon: Home },
  { to: "/plan", label: "Plan", icon: Dumbbell },
  { to: "/historikk", label: "Utvikling", icon: LineChart },
  { to: "/innstillinger", label: "Innstillinger", icon: Settings },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold"
            >
              <Icon className="size-5" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
