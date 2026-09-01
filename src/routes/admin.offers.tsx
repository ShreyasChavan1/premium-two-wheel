import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { offersQuery, type Offer } from "@/lib/catalogue";

export const Route = createFileRoute("/admin/offers")({
  component: AdminOffers,
});

type Draft = {
  id?: string;
  title: string;
  description: string;
  applicable_vehicles: string;
  benefit: string;
  valid_until: string;
  is_active: boolean;
  sort_order: string;
};

const EMPTY: Draft = {
  title: "",
  description: "",
  applicable_vehicles: "",
  benefit: "",
  valid_until: "",
  is_active: true,
  sort_order: "0",
};

const toDraft = (offer: Offer): Draft => ({
  id: offer.id,
  title: offer.title,
  description: offer.description,
  applicable_vehicles: offer.applicable_vehicles,
  benefit: offer.benefit,
  valid_until: offer.valid_until ?? "",
  is_active: offer.is_active,
  sort_order: String(offer.sort_order),
});

function AdminOffers() {
  const { data, isLoading, isError } = useQuery(offersQuery);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["offers"] });

  const save = useMutation({
    mutationFn: async (values: Draft) => {
      const payload = {
        title: values.title,
        description: values.description,
        applicable_vehicles: values.applicable_vehicles,
        benefit: values.benefit,
        valid_until: values.valid_until || null,
        is_active: values.is_active,
        sort_order: Number(values.sort_order) || 0,
      };
      const query = values.id
        ? supabase.from("offers").update(payload).eq("id", values.id)
        : supabase.from("offers").insert(payload);
      const { error: saveError } = await query;
      if (saveError) throw new Error(saveError.message);
    },
    onSuccess: () => {
      setDraft(null);
      setError(null);
      void invalidate();
    },
    onError: (e: Error) => setError(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async (offer: Offer) => {
      const { error: e } = await supabase
        .from("offers")
        .update({ is_active: !offer.is_active })
        .eq("id", offer.id);
      if (e) throw new Error(e.message);
    },
    onSuccess: () => void invalidate(),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error: e } = await supabase.from("offers").delete().eq("id", id);
      if (e) throw new Error(e.message);
    },
    onSuccess: () => void invalidate(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-tight">Offers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create promotions and switch them on or off for the public website.
          </p>
        </div>
        <Button onClick={() => setDraft({ ...EMPTY })}>
          <Plus /> Add offer
        </Button>
      </div>

      {isLoading && <Skeleton className="h-52 w-full rounded-xl" />}
      {isError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-muted-foreground">
          Could not load offers. Please refresh the page.
        </p>
      )}

      {draft && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate(draft);
          }}
          className="space-y-4 rounded-xl border border-primary/40 bg-card p-6"
        >
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
            {draft.id ? "Edit offer" : "Add an offer"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="title">Offer title</Label>
              <Input
                id="title"
                required
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">Short description</Label>
              <Textarea
                id="description"
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vehicles">Applicable vehicles</Label>
              <Input
                id="vehicles"
                placeholder="Activa 6G, Dio"
                value={draft.applicable_vehicles}
                onChange={(e) => setDraft({ ...draft, applicable_vehicles: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="benefit">Benefit / discount</Label>
              <Input
                id="benefit"
                placeholder="Up to ₹5,000 benefits"
                value={draft.benefit}
                onChange={(e) => setDraft({ ...draft, benefit: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="valid">Valid until</Label>
              <Input
                id="valid"
                type="date"
                value={draft.valid_until}
                onChange={(e) => setDraft({ ...draft, valid_until: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order">Display order</Label>
              <Input
                id="order"
                inputMode="numeric"
                value={draft.sort_order}
                onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={draft.is_active}
                onCheckedChange={(checked) => setDraft({ ...draft, is_active: checked })}
              />
              <Label htmlFor="active">Show on website</Label>
            </div>
          </div>

          {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save offer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDraft(null);
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <ul className="space-y-3">
        {(data ?? []).map((offer) => (
          <li
            key={offer.id}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5"
          >
            <div className="min-w-48 flex-1">
              <p className="font-display text-xl font-bold uppercase tracking-wide">{offer.title}</p>
              <p className="text-sm text-muted-foreground">
                {offer.benefit || "No benefit set"} · {offer.applicable_vehicles || "Selected models"}
                {offer.valid_until ? ` · until ${offer.valid_until}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 pr-2">
                <Switch
                  id={`active-${offer.id}`}
                  checked={offer.is_active}
                  onCheckedChange={() => toggleActive.mutate(offer)}
                />
                <Label htmlFor={`active-${offer.id}`} className="text-xs">
                  Active
                </Label>
              </div>
              <Button size="sm" variant="outline" onClick={() => setDraft(toDraft(offer))}>
                <Pencil /> Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (window.confirm(`Delete the offer “${offer.title}”?`)) remove.mutate(offer.id);
                }}
              >
                <Trash2 /> Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {!isLoading && (data ?? []).length === 0 && (
        <p className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
          No offers yet. Add your first promotion to show it on the website.
        </p>
      )}
    </div>
  );
}
