import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Vehicle = {
  id: string;
  slug: string;
  name: string;
  category: string;
  short_description: string;
  description: string;
  price_from: number | null;
  image_url: string;
  gallery: string[];
  variants: string[];
  colors: string[];
  specs: Record<string, string>;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
};

export type Offer = {
  id: string;
  title: string;
  description: string;
  applicable_vehicles: string;
  benefit: string;
  valid_until: string | null;
  is_active: boolean;
  sort_order: number;
};

export type Enquiry = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  vehicle_interest: string | null;
  message: string;
  status: string;
  created_at: string;
};

export type VariantColour = {
  id: string;
  variant_id: string;
  name: string;
  images: string[];
  sort_order: number;
};

export type VehicleVariant = {
  id: string;
  vehicle_id: string;
  name: string;
  price: number | null;
  specs: Record<string, string>;
  is_available: boolean;
  sort_order: number;
  colours: VariantColour[];
};

const asVehicle = (row: Record<string, unknown>): Vehicle => ({
  ...(row as unknown as Vehicle),
  price_from: row["price_from"] == null ? null : Number(row["price_from"]),
  specs: (row["specs"] ?? {}) as Record<string, string>,
});

const asVariant = (row: Record<string, unknown>): VehicleVariant => ({
  ...(row as unknown as VehicleVariant),
  price: row["price"] == null ? null : Number(row["price"]),
  specs: (row["specs"] ?? {}) as Record<string, string>,
  colours: ((row["variant_colours"] ?? []) as Record<string, unknown>[])
    .map((colour) => colour as unknown as VariantColour)
    .sort((a, b) => a.sort_order - b.sort_order),
});

export const variantsQuery = (vehicleId: string | undefined) =>
  queryOptions({
    queryKey: ["variants", vehicleId ?? "none"],
    enabled: Boolean(vehicleId),
    queryFn: async (): Promise<VehicleVariant[]> => {
      if (!vehicleId) return [];
      const { data, error } = await supabase
        .from("vehicle_variants")
        .select("*, variant_colours(*)")
        .eq("vehicle_id", vehicleId)
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []).map(asVariant);
    },
  });


export const vehiclesQuery = queryOptions({
  queryKey: ["vehicles"],
  queryFn: async (): Promise<Vehicle[]> => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(asVehicle);
  },
});

export const vehicleQuery = (slug: string) =>
  queryOptions({
    queryKey: ["vehicle", slug],
    queryFn: async (): Promise<Vehicle | null> => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ? asVehicle(data) : null;
    },
  });

export const offersQuery = queryOptions({
  queryKey: ["offers"],
  queryFn: async (): Promise<Offer[]> => {
    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Offer[];
  },
});

export const enquiriesQuery = queryOptions({
  queryKey: ["enquiries"],
  queryFn: async (): Promise<Enquiry[]> => {
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Enquiry[];
  },
});
