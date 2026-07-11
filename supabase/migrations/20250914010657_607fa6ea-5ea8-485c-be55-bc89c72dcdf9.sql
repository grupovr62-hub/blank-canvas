-- Create production_orders table
CREATE TABLE public.production_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  model TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL,
  fabric_id UUID REFERENCES public.fabrics(id),
  fabric_name TEXT,
  deadline DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
  status TEXT NOT NULL DEFAULT 'piloto_tecido' CHECK (status IN ('piloto_tecido', 'corte', 'faccao', 'lavanderia', 'acabamento', 'fotos', 'concluido')),
  destination_faction TEXT,
  observations TEXT,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all production orders" 
ON public.production_orders 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create production orders" 
ON public.production_orders 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update production orders" 
ON public.production_orders 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete production orders" 
ON public.production_orders 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('admin', 'manager')
));

-- Create trigger for updated_at
CREATE TRIGGER update_production_orders_updated_at
BEFORE UPDATE ON public.production_orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for better performance
CREATE INDEX idx_production_orders_status ON public.production_orders(status);
CREATE INDEX idx_production_orders_deadline ON public.production_orders(deadline);
CREATE INDEX idx_production_orders_created_by ON public.production_orders(created_by);