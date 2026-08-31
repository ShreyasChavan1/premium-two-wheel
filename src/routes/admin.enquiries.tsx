import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { enquiriesQuery, type Enquiry } from "@/lib/catalogue";

export const Route = createFileRoute("/admin/enquiries")({
  component: AdminEnquiries,
});

const STATUSES = ["new", "contacted", "closed"] as const;

function AdminEnquiries() {
  const { data, isLoading, isError } = useQuery(enquiriesQuery);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["enquiries"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight">Enquiries</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enquiries submitted through the website contact and vehicle pages.
        </p>
      </div>

      {isLoading && <Skeleton className="h-64 w-full rounded-xl" />}
      {isError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-muted-foreground">
          Could not load enquiries. Please refresh the page.
        </p>
      )}

      {!isLoading && (data ?? []).length === 0 && (
        <p className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
          No enquiries yet. They will appear here as soon as a customer submits the form.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <ul className="space-y-3">
          {(data ?? []).map((enquiry) => (
            <li key={enquiry.id}>
              <button
                type="button"
                onClick={() => setSelected(enquiry)}
                className={
                  "w-full rounded-xl border bg-card p-5 text-left transition-colors " +
                  (selected?.id === enquiry.id ? "border-primary" : "border-border hover:border-primary")
                }
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-xl font-bold uppercase tracking-wide">
                    {enquiry.name}
                  </p>
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                    {enquiry.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {enquiry.phone}
                  {enquiry.vehicle_interest ? ` · Interested in ${enquiry.vehicle_interest}` : ""}
                </p>
                <p className="mt-2 line-clamp-2 text-sm">{enquiry.message || "No message"}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(enquiry.created_at).toLocaleString("en-IN")}
                </p>
              </button>
            </li>
          ))}
        </ul>

        {selected && (
          <aside className="h-fit rounded-xl border border-border bg-card p-6 lg:sticky lg:top-6">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
              {selected.name}
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Phone" value={selected.phone} />
              <Row label="Email" value={selected.email ?? "—"} />
              <Row label="Interested in" value={selected.vehicle_interest ?? "Not specified"} />
              <Row label="Received" value={new Date(selected.created_at).toLocaleString("en-IN")} />
            </dl>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Message</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{selected.message || "No message"}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <a href={`tel:${selected.phone}`}>
                  <Phone /> Call
                </a>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <a
                  href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle /> WhatsApp
                </a>
              </Button>
              {selected.email && (
                <Button asChild size="sm" variant="outline">
                  <a href={`mailto:${selected.email}`}>
                    <Mail /> Email
                  </a>
                </Button>
              )}
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Status</p>
              <div className="mt-2 flex gap-2">
                {STATUSES.map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={selected.status === status ? "default" : "outline"}
                    disabled={updateStatus.isPending}
                    onClick={() => {
                      updateStatus.mutate({ id: selected.id, status });
                      setSelected({ ...selected, status });
                    }}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
