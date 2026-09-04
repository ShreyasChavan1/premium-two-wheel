ALTER TABLE public.vehicle_variants
  ADD COLUMN IF NOT EXISTS ex_showroom_price numeric,
  ADD COLUMN IF NOT EXISTS on_road_price numeric,
  ADD COLUMN IF NOT EXISTS emi_options jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.vehicle_variants
SET ex_showroom_price = COALESCE(ex_showroom_price, price),
    on_road_price = COALESCE(on_road_price, ROUND(COALESCE(price, 0) * 1.14));

UPDATE public.vehicle_variants
SET emi_options = '[{"months":12,"rate":9.5},{"months":24,"rate":10},{"months":36,"rate":10.5},{"months":48,"rate":11}]'::jsonb
WHERE emi_options = '[]'::jsonb;