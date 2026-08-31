import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgePercent, Bike, CheckCircle2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { enquiriesQuery, offersQuery, vehiclesQuery } from "@/lib/catalogue";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const vehicles = useQuery(vehiclesQuery);
  const offers = useQuery(offersQuery);
  const enquiries = useQuery(enquiriesQuery);

  const stats = [
    {
      label: "Vehicles listed",
      value: vehicles.data?.length,
      icon: Bike,
    },
    {
      label: "Available now",
      value: vehicles.data?.filter((v) => v.is_available).length,
      icon: CheckCircle2,
    },
    {
      label: "Active offers",
      value: offers.data?.filter((o) => o.is_active).length,
      icon: BadgePercent,
    },
    {
      label: "Enquiries received",
      value: enquiries.data?.length,
      icon: Inbox,
    },
  ];

  const recent = (enquiries.data ?? []).slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you change here updates the public website immediately.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <stat.icon className="size-5 text-primary" />
            {stat.value === undefined ? (
              <Skeleton className="mt-3 h-9 w-16" />
            ) : (
              <p className="mt-3 font-display text-4xl font-bold">{stat.value}</p>
            )}
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink to="/admin/vehicles" label="Manage vehicles" description="Add models, update prices and availability." />
        <QuickLink to="/admin/offers" label="Manage offers" description="Create, edit or deactivate promotions." />
        <QuickLink to="/admin/enquiries" label="View enquiries" description="See what customers have asked for." />
      </div>

      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-4 border-b border-border p-5">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
            Latest enquiries
          </h2>
          <Button asChild size="sm" variant="outline">
            <Link to="/admin/enquiries">
              View all <ArrowRight />
            </Link>
          </Button>
        </div>
        {enquiries.isLoading && <div className="p-5"><Skeleton className="h-24 w-full" /></div>}
        {!enquiries.isLoading && recent.length === 0 && (
          <p className="p-5 text-sm text-muted-foreground">No enquiries yet.</p>
        )}
        <ul className="divide-y divide-border">
          {recent.map((enquiry) => (
            <li key={enquiry.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-semibold">{enquiry.name}</p>
                <p className="text-sm text-muted-foreground">
                  {enquiry.phone}
                  {enquiry.vehicle_interest ? ` · ${enquiry.vehicle_interest}` : ""}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(enquiry.created_at).toLocaleString("en-IN")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function QuickLink({
  to,
  label,
  description,
}: {
  to: "/admin/vehicles" | "/admin/offers" | "/admin/enquiries";
  label: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
    >
      <p className="font-display text-xl font-bold uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Open <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}
