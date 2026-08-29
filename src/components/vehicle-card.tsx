import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AvailabilityBadge } from "@/components/availability-badge";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/lib/catalogue";
import { categoryLabel, formatPrice } from "@/lib/showroom";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link
        to="/vehicles/$slug"
        params={{ slug: vehicle.slug }}
        className="relative block aspect-4/3 overflow-hidden bg-secondary"
      >
        <img
          src={vehicle.image_url}
          alt={`Honda ${vehicle.name} ${categoryLabel(vehicle.category).toLowerCase()}`}
          loading="lazy"
          width={1200}
          height={900}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-2.5 py-1 font-display text-xs font-semibold uppercase tracking-wide text-ink-foreground">
          {categoryLabel(vehicle.category)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl font-bold uppercase leading-none tracking-wide">
            {vehicle.name}
          </h3>
        </div>
        <AvailabilityBadge available={vehicle.is_available} className="self-start" />
        <p className="line-clamp-2 text-sm text-muted-foreground">{vehicle.short_description}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Starting from
            </p>
            <p className="font-display text-xl font-bold">{formatPrice(vehicle.price_from)}</p>
          </div>
          <Button asChild size="sm">
            <Link to="/vehicles/$slug" params={{ slug: vehicle.slug }}>
              View Details <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
