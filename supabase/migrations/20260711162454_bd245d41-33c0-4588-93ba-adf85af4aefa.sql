
-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- FABRICS
CREATE TABLE public.fabrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  weight TEXT,
  supplier TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'metros',
  min_stock INTEGER NOT NULL DEFAULT 0,
  price_per_meter NUMERIC(10,2) NOT NULL DEFAULT 0,
  last_purchase DATE,
  status TEXT NOT NULL DEFAULT 'disponivel',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fabrics TO anon, authenticated;
GRANT ALL ON public.fabrics TO service_role;

ALTER TABLE public.fabrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view fabrics" ON public.fabrics FOR SELECT USING (true);
CREATE POLICY "Public can insert fabrics" ON public.fabrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update fabrics" ON public.fabrics FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete fabrics" ON public.fabrics FOR DELETE USING (true);

CREATE TRIGGER update_fabrics_updated_at
  BEFORE UPDATE ON public.fabrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PRODUCTION ORDERS
CREATE TABLE public.production_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  model TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  fabric_name TEXT,
  deadline DATE,
  priority TEXT NOT NULL DEFAULT 'media',
  status TEXT NOT NULL DEFAULT 'piloto_tecido',
  destination_faction TEXT,
  observations TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.production_orders TO anon, authenticated;
GRANT ALL ON public.production_orders TO service_role;

ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view production_orders" ON public.production_orders FOR SELECT USING (true);
CREATE POLICY "Public can insert production_orders" ON public.production_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update production_orders" ON public.production_orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete production_orders" ON public.production_orders FOR DELETE USING (true);

CREATE TRIGGER update_production_orders_updated_at
  BEFORE UPDATE ON public.production_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
