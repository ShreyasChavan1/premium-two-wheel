import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AvailabilityBadge } from "@/components/availability-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { vehiclesQuery, type Vehicle } from "@/lib/catalogue";
import { CATEGORIES, categoryLabel, formatPrice } from "@/lib/showroom";

export const Route = createFileRoute("/admin/vehicles")({
  component: AdminVehicles,
});

type Draft = {
  id?: string;
  slug: string;
  name: string;
  category: string;
  short_description: string;
  description: string;
  price_from: string;
  image_url: string;
  variants: string;
  colors: string;
  specs: string;
  is_available: boolean;
  is_featured: boolean;
  sort_order: string;
};

const EMPTY: Draft = {
  slug: "",
  name: "",
  category: "scooter",
  short_description: "",
  description: "",
  price_from: "",
  image_url: "",
  variants: "",
  colors: "",
  specs: "",
  is_available: true,
  is_featured: false,
  sort_order: "0",
};

const toDraft = (vehicle: Vehicle): Draft => ({
  id: vehicle.id,
  slug: vehicle.slug,
  name: vehicle.name,
  category: vehicle.category,
  short_description: vehicle.short_description,
  description: vehicle.description,
  price_from: vehicle.price_from == null ? "" : String(vehicle.price_from),
  image_url: vehicle.image_url,
  variants: vehicle.variants.join(", "),
  colors: vehicle.colors.join(", "),
  specs: Object.entries(vehicle.specs)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n"),
  is_available: vehicle.is_available,
  is_featured: vehicle.is_featured,
  sort_order: String(vehicle.sort_order),
});

const list = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseSpecs = (value: string) => {
  const specs: Record<string, string> = {};
  for (const line of value.split("\n")) {
    const index = line.indexOf(":");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const val = line.slice(index + 1).trim();
    if (key) specs[key] = val;
  }
  return specs;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function AdminVehicles() {
  const { data, isLoading, isError } = useQuery(vehiclesQuery);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    void queryClient.invalidateQueries({ queryKey: ["vehicle"] });
  };

  const save = useMutation({
    mutationFn: async (values: Draft) => {
      const payload = {
        slug: values.slug || slugify(values.name),
        name: values.name,
        category: values.category,
        short_description: values.short_description,
        description: values.description,
        price_from: values.price_from ? Number(values.price_from) : null,
        image_url: values.image_url,
        variants: list(values.variants),
        colors: list(values.colors),
        specs: parseSpecs(values.specs),
        is_available: values.is_available,
        is_featured: values.is_featured,
        sort_order: Number(values.sort_order) || 0,
      };
      const query = values.id
        ? supabase.from("vehicles").update(payload).eq("id", values.id)
        : supabase.from("vehicles").insert(payload);
      const { error: saveError } = await query;
      if (saveError) throw new Error(saveError.message);
    },
    onSuccess: () => {
      setDraft(null);
      setError(null);
      invalidate();
    },
    onError: (e: Error) => setError(e.message),
  });

  const toggleAvailability = useMutation({
    mutationFn: async (vehicle: Vehicle) => {
      const { error: e } = await supabase
        .from("vehicles")
        .update({ is_available: !vehicle.is_available })
        .eq("id", vehicle.id);
      if (e) throw new Error(e.message);
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error: e } = await supabase.from("vehicles").delete().eq("id", id);
      if (e) throw new Error(e.message);
    },
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-tight">Vehicles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add models, update prices, colours and showroom availability.
          </p>
        </div>
        <Button onClick={() => setDraft({ ...EMPTY })}>
          <Plus /> Add vehicle
        </Button>
      </div>

      {isLoading && <Skeleton className="h-64 w-full rounded-xl" />}
      {isError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-muted-foreground">
          Could not load vehicles. Please refresh the page.
        </p>
      )}

      {draft && (
        <VehicleForm
          draft={draft}
          onChange={setDraft}
          onCancel={() => {
            setDraft(null);
            setError(null);
          }}
          onSave={() => save.mutate(draft)}
          saving={save.isPending}
          error={error}
        />
      )}

      <ul className="space-y-3">
        {(data ?? []).map((vehicle) => (
          <li
            key={vehicle.id}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4"
          >
            <img
              src={vehicle.image_url}
              alt={vehicle.name}
              loading="lazy"
              className="h-20 w-28 rounded-lg object-cover"
            />
            <div className="min-w-40 flex-1">
              <p className="font-display text-xl font-bold uppercase tracking-wide">{vehicle.name}</p>
              <p className="text-sm text-muted-foreground">
                {categoryLabel(vehicle.category)} · {formatPrice(vehicle.price_from)}
                {vehicle.is_featured ? " · Featured" : ""}
              </p>
              <div className="mt-2">
                <AvailabilityBadge available={vehicle.is_available} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 pr-2">
                <Switch
                  id={`available-${vehicle.id}`}
                  checked={vehicle.is_available}
                  onCheckedChange={() => toggleAvailability.mutate(vehicle)}
                />
                <Label htmlFor={`available-${vehicle.id}`} className="text-xs">
                  In stock
                </Label>
              </div>
              <Button size="sm" variant="outline" onClick={() => setDraft(toDraft(vehicle))}>
                <Pencil /> Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (window.confirm(`Delete ${vehicle.name}? This cannot be undone.`)) {
                    remove.mutate(vehicle.id);
                  }
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
          No vehicles yet. Use “Add vehicle” to list your first model.
        </p>
      )}
    </div>
  );
}

function VehicleForm({
  draft,
  onChange,
  onCancel,
  onSave,
  saving,
  error,
}: {
  draft: Draft;
  onChange: (draft: Draft) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  error: string | null;
}) {
  const set = (key: keyof Draft, value: string | boolean) => onChange({ ...draft, [key]: value });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
      className="space-y-4 rounded-xl border border-primary/40 bg-card p-6"
    >
      <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
        {draft.id ? `Edit ${draft.name}` : "Add a vehicle"}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Model name</Label>
          <Input id="name" required value={draft.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Web address (slug)</Label>
          <Input
            id="slug"
            value={draft.slug}
            placeholder={slugify(draft.name) || "activa-6g"}
            onChange={(e) => set("slug", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={draft.category}
            onChange={(e) => set("category", e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Starting price (₹)</Label>
          <Input
            id="price"
            inputMode="numeric"
            value={draft.price_from}
            onChange={(e) => set("price_from", e.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="image">Main image URL</Label>
          <Input
            id="image"
            value={draft.image_url}
            placeholder="/images/demo/activa-6g.jpg"
            onChange={(e) => set("image_url", e.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="short">Short description (shown on cards)</Label>
          <Input
            id="short"
            value={draft.short_description}
            onChange={(e) => set("short_description", e.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="description">Full description</Label>
          <Textarea
            id="description"
            rows={3}
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="variants">Variants (comma separated)</Label>
          <Input
            id="variants"
            value={draft.variants}
            onChange={(e) => set("variants", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="colors">Colours (comma separated)</Label>
          <Input id="colors" value={draft.colors} onChange={(e) => set("colors", e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="specs">Specifications (one per line, e.g. Engine: 110 cc)</Label>
          <Textarea id="specs" rows={5} value={draft.specs} onChange={(e) => set("specs", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sort">Display order</Label>
          <Input
            id="sort"
            inputMode="numeric"
            value={draft.sort_order}
            onChange={(e) => set("sort_order", e.target.value)}
          />
        </div>
        <div className="flex items-end gap-6">
          <div className="flex items-center gap-2">
            <Switch
              id="available"
              checked={draft.is_available}
              onCheckedChange={(checked) => set("is_available", checked)}
            />
            <Label htmlFor="available">Available at showroom</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="featured"
              checked={draft.is_featured}
              onCheckedChange={(checked) => set("is_featured", checked)}
            />
            <Label htmlFor="featured">Featured on home</Label>
          </div>
        </div>
      </div>

      {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save vehicle"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
