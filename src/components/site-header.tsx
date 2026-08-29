import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SHOWROOM } from "@/lib/showroom";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/vehicles", label: "Vehicles" },
  { to: "/offers", label: "Offers" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="hidden bg-ink text-ink-foreground md:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <p className="opacity-80">{SHOWROOM.tagline}</p>
          <div className="flex items-center gap-4">
            <a href={`tel:${SHOWROOM.phone}`} className="hover:text-primary">
              {SHOWROOM.phoneDisplay}
            </a>
            <span className="opacity-40">|</span>
            <span className="opacity-80">{SHOWROOM.hours[0].time} (Mon–Sat)</span>
          </div>
        </div>
      </div>

      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3" aria-label={`${SHOWROOM.name} home`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary font-display text-lg font-bold text-primary-foreground">
            H
          </span>
          <span className="leading-none">
            <span className="block font-display text-xl font-bold uppercase tracking-wide">
              {SHOWROOM.name}
            </span>
            <span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Two-Wheelers
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="rounded-md px-3 py-2 font-display text-[15px] font-semibold uppercase tracking-wide text-foreground/80 transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild>
            <a href={`tel:${SHOWROOM.phone}`}>
              <Phone /> Call Showroom
            </a>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background md:hidden" aria-label="Mobile navigation">
          <div className="container-page flex flex-col py-2">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary" }}
                className="border-b border-border/60 py-3.5 font-display text-lg font-semibold uppercase tracking-wide last:border-0"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
