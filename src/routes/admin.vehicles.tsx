import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { AvailabilityBadge } from "@/components/availability-badge";
import { ImageManager } from "@/components/image-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import {
  variantsQuery,
  vehiclesQuery,
  type Vehicle,
  type VehicleVariant,
  type VariantColour,
} from "@/lib/catalogue";
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
  images: string[];
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
  images: [],
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
  images: [vehicle.image_url, ...vehicle.gallery].filter(Boolean),
  is_available: vehicle.is_available,
  is_featured: vehicle.is_featured,
  sort_order: String(vehicle.sort_order),
});

export const parseSpecs = (value: string) => {
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

const specsToText = (specs: Record<string, string>) =>
  Object.entries(specs)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function AdminVehicles() {
  const { data, isLoading, isError } = useQuery(vehiclesQuery);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [openVariants, setOpenVariants] = useState<string | null>(null);
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
        image_url: values.images[0] ?? "",
        gallery: values.images.slice(1),
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
            Add models, then manage their variants, colours and gallery images.
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
          <li key={vehicle.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-4">
              <img
                src={vehicle.image_url}
                alt={vehicle.name}
                loading="lazy"
                className="h-20 w-28 rounded-lg object-cover"
              />
              <div className="min-w-40 flex-1">
                <p className="font-display text-xl font-bold uppercase tracking-wide">
                  {vehicle.name}
                </p>
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
                <Button
                  size="sm"
                  variant={openVariants === vehicle.id ? "default" : "outline"}
                  onClick={() =>
                    setOpenVariants(openVariants === vehicle.id ? null : vehicle.id)
                  }
                >
                  <Layers /> Variants
                </Button>
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
            </div>

            {openVariants === vehicle.id && <VariantsPanel vehicle={vehicle} />}
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
  const set = (key: keyof Draft, value: string | boolean | string[]) =>
    onChange({ ...draft, [key]: value });

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
        <div className="sm:col-span-2">
          <ImageManager
            label="Main vehicle images"
            hint="The first image is used on cards and as the default gallery image."
            images={draft.images}
            onChange={(images) => set("images", images)}
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
      <p className="text-xs text-muted-foreground">
        Variants, variant prices, specifications and colour galleries are managed with the “Variants”
        button on the model below.
      </p>
    </form>
  );
}

/* ------------------------------- Variants ------------------------------- */

function VariantsPanel({ vehicle }: { vehicle: Vehicle }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(variantsQuery(vehicle.id));

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["variants", vehicle.id] });
    void queryClient.invalidateQueries({ queryKey: ["vehicle"] });
  };

  const addVariant = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("vehicle_variants").insert({
        vehicle_id: vehicle.id,
        name: "New variant",
        price: vehicle.price_from,
        specs: {},
        is_available: true,
        sort_order: data?.length ?? 0,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
  });

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-border bg-secondary/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Variants of {vehicle.name}
        </p>
        <Button size="sm" onClick={() => addVariant.mutate()} disabled={addVariant.isPending}>
          <Plus /> Add variant
        </Button>
      </div>

      {isLoading && <Skeleton className="h-24 w-full rounded-lg" />}

      {(data ?? []).map((variant) => (
        <VariantCard key={variant.id} variant={variant} onChanged={invalidate} />
      ))}

      {!isLoading && (data ?? []).length === 0 && (
        <p className="text-sm text-muted-foreground">
          No variants yet. Add one to set variant prices, specifications and colours.
        </p>
      )}
    </div>
  );
}

type EmiDraft = { months: string; rate: string };

function VariantCard({
  variant,
  onChanged,
}: {
  variant: VehicleVariant;
  onChanged: () => void;
}) {
  const [name, setName] = useState(variant.name);
  const [price, setPrice] = useState(
    variant.ex_showroom_price == null ? "" : String(variant.ex_showroom_price),
  );
  const [onRoad, setOnRoad] = useState(
    variant.on_road_price == null ? "" : String(variant.on_road_price),
  );
  const [emi, setEmi] = useState<EmiDraft[]>(
    variant.emi_options.map((option) => ({
      months: String(option.months),
      rate: String(option.rate),
    })),
  );
  const [specs, setSpecs] = useState(specsToText(variant.specs));
  const [available, setAvailable] = useState(variant.is_available);
  const [error, setError] = useState<string | null>(null);

  const setEmiField = (index: number, key: keyof EmiDraft, value: string) =>
    setEmi(emi.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  const moveEmi = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= emi.length) return;
    const next = [...emi];
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row!);
    setEmi(next);
  };

  const save = useMutation({
    mutationFn: async () => {
      const emiOptions = emi
        .map((row) => ({ months: Number(row.months) || 0, rate: Number(row.rate) || 0 }))
        .filter((row) => row.months > 0);
      const exShowroom = price ? Number(price) : null;
      const { error: e } = await supabase
        .from("vehicle_variants")
        .update({
          name,
          price: exShowroom,
          ex_showroom_price: exShowroom,
          on_road_price: onRoad ? Number(onRoad) : null,
          emi_options: emiOptions,
          specs: parseSpecs(specs),
          is_available: available,
        })
        .eq("id", variant.id);
      if (e) throw new Error(e.message);
    },
    onSuccess: () => {
      setError(null);
      onChanged();
    },
    onError: (e: Error) => setError(e.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error: e } = await supabase.from("vehicle_variants").delete().eq("id", variant.id);
      if (e) throw new Error(e.message);
    },
    onSuccess: onChanged,
  });

  const addColour = useMutation({
    mutationFn: async () => {
      const { error: e } = await supabase.from("variant_colours").insert({
        variant_id: variant.id,
        name: "New colour",
        images: [],
        sort_order: variant.colours.length,
      });
      if (e) throw new Error(e.message);
    },
    onSuccess: onChanged,
  });

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`vname-${variant.id}`}>Variant name</Label>
          <Input
            id={`vname-${variant.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Standard, Deluxe, DLX…"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`vprice-${variant.id}`}>Variant price (₹)</Label>
          <Input
            id={`vprice-${variant.id}`}
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`vspecs-${variant.id}`}>
            Specifications (one per line, e.g. Engine: 110 cc)
          </Label>
          <Textarea
            id={`vspecs-${variant.id}`}
            rows={5}
            value={specs}
            onChange={(e) => setSpecs(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id={`vavail-${variant.id}`}
            checked={available}
            onCheckedChange={setAvailable}
          />
          <Label htmlFor={`vavail-${variant.id}`}>Available at showroom</Label>
        </div>
      </div>

      {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save variant"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => addColour.mutate()}>
          <Plus /> Add colour
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (window.confirm(`Delete variant “${variant.name}” and its colours?`)) {
              remove.mutate();
            }
          }}
        >
          <Trash2 /> Delete variant
        </Button>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Colours
        </p>
        {variant.colours.map((colour) => (
          <ColourCard key={colour.id} colour={colour} onChanged={onChanged} />
        ))}
        {variant.colours.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No colours yet for this variant. Use “Add colour”.
          </p>
        )}
      </div>
    </div>
  );
}

function ColourCard({ colour, onChanged }: { colour: VariantColour; onChanged: () => void }) {
  const [name, setName] = useState(colour.name);
  const [images, setImages] = useState<string[]>(colour.images);

  const save = useMutation({
    mutationFn: async (next?: string[]) => {
      const { error: e } = await supabase
        .from("variant_colours")
        .update({ name, images: next ?? images })
        .eq("id", colour.id);
      if (e) throw new Error(e.message);
    },
    onSuccess: onChanged,
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error: e } = await supabase.from("variant_colours").delete().eq("id", colour.id);
      if (e) throw new Error(e.message);
    },
    onSuccess: onChanged,
  });

  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-48 flex-1 space-y-1.5">
          <Label htmlFor={`cname-${colour.id}`}>Colour name</Label>
          <Input
            id={`cname-${colour.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Pearl White"
          />
        </div>
        <Button size="sm" onClick={() => save.mutate(undefined)} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save colour"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (window.confirm(`Delete colour “${colour.name}”?`)) remove.mutate();
          }}
        >
          <Trash2 /> Delete
        </Button>
      </div>

      <ImageManager
        label="Gallery images for this colour"
        hint="Shown when a visitor selects this variant and colour."
        images={images}
        folder="variants"
        onChange={(next) => {
          setImages(next);
          save.mutate(next);
        }}
      />
    </div>
  );
}
