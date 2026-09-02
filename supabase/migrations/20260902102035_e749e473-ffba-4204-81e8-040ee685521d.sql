CREATE TABLE public.vehicle_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric,
  specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_available boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.vehicle_variants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_variants TO authenticated;
GRANT ALL ON public.vehicle_variants TO service_role;

ALTER TABLE public.vehicle_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Variants are publicly viewable" ON public.vehicle_variants FOR SELECT USING (true);
CREATE POLICY "Admins manage variants" ON public.vehicle_variants FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER vehicle_variants_touch BEFORE UPDATE ON public.vehicle_variants
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX vehicle_variants_vehicle_id_idx ON public.vehicle_variants(vehicle_id);

CREATE TABLE public.variant_colours (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id uuid NOT NULL REFERENCES public.vehicle_variants(id) ON DELETE CASCADE,
  name text NOT NULL,
  images text[] NOT NULL DEFAULT '{}'::text[],
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.variant_colours TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.variant_colours TO authenticated;
GRANT ALL ON public.variant_colours TO service_role;

ALTER TABLE public.variant_colours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Colours are publicly viewable" ON public.variant_colours FOR SELECT USING (true);
CREATE POLICY "Admins manage colours" ON public.variant_colours FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER variant_colours_touch BEFORE UPDATE ON public.variant_colours
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX variant_colours_variant_id_idx ON public.variant_colours(variant_id);

-- Migrate existing demo data: one variant row per existing variant name
INSERT INTO public.vehicle_variants (vehicle_id, name, price, specs, is_available, sort_order)
SELECT v.id, x.name, v.price_from, v.specs, v.is_available, x.ord - 1
FROM public.vehicles v
CROSS JOIN LATERAL unnest(
  CASE WHEN array_length(v.variants, 1) IS NULL THEN ARRAY['Standard'] ELSE v.variants END
) WITH ORDINALITY AS x(name, ord);

-- Migrate existing colours under every variant of the vehicle
INSERT INTO public.variant_colours (variant_id, name, images, sort_order)
SELECT vv.id, c.name, '{}'::text[], c.ord - 1
FROM public.vehicle_variants vv
JOIN public.vehicles v ON v.id = vv.vehicle_id
CROSS JOIN LATERAL unnest(v.colors) WITH ORDINALITY AS c(name, ord);