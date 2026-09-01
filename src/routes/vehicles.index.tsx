import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileContactBar } from "@/components/mobile-contact-bar";
import { VehicleCard } from "@/components/vehicle-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { vehiclesQuery } from "@/lib/catalogue";
import { CATEGORIES, SHOWROOM } from "@/lib/showroom";

const TITLE = `Honda Vehicles & Prices — ${SHOWROOM.name}`;
const DESCRIPTION =
  "Browse Honda scooters and motorcycles at our showroom, with starting prices, variants and current availability for each model.";

type Search = { category?: string };

export const Route = createFileRoute("/vehicles/")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const category = typeof search["category"] === "string" ? search["category"] : undefined;
    return category && CATEGORIES.some((c) => c.value === category) ? { category } : {};
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VehiclesPage,
});

function VehiclesPage() {
  const { category } = Route.useSearch();
  const navigate = useNavigate({ from: "/vehicles/" });
  const { data, isLoading, isError } = useQuery(vehiclesQuery);

  const vehicles = (data ?? []).filter((v) => !category || v.category === category);
  const setCategory = (value?: string) =>
    navigate({ search: value ? { category: value } : {} });

  return (
    <div className="min-h-screen pb-14 md:pb-0">
      <SiteHeader />

      <main>
        <section className="border-b border-border bg-secondary py-12">
          <div className="container-page">
            <p className="eyebrow">Our catalogue</p>
            <h1 className="mt-2 font-display text-4xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
              Honda vehicles at our showroom
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Demo catalogue for development. Availability shown here is maintained manually by our
              showroom team — call us to confirm before you visit.
            </p>
          </div>
        </section>

        <section className="container-page py-10">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <FilterChip active={!category} onClick={() => setCategory(undefined)}>
              All Vehicles
            </FilterChip>
            {CATEGORIES.map((c) => (
              <FilterChip
                key={c.value}
                active={category === c.value}
                onClick={() => setCategory(c.value)}
              >
                {c.label}
              </FilterChip>
            ))}
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            {isLoading ? "Loading models…" : `${vehicles.length} model${vehicles.length === 1 ? "" : "s"} listed`}
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[26rem] rounded-xl" />
              ))}
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>

          {isError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
              <p className="font-display text-xl font-bold uppercase">Could not load the catalogue</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Please refresh the page or call the showroom for model details.
              </p>
            </div>
          )}

          {!isLoading && !isError && vehicles.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <p className="font-display text-xl font-bold uppercase">No vehicles in this category</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try another category or view the full catalogue.
              </p>
              <Button className="mt-6" onClick={() => setCategory(undefined)}>
                View all vehicles
              </Button>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
      <MobileContactBar />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "min-h-11 rounded-full border px-5 font-display text-sm font-semibold uppercase tracking-wide transition-colors " +
        (active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary hover:text-primary")
      }
    >
      {children}
    </button>
  );
}
