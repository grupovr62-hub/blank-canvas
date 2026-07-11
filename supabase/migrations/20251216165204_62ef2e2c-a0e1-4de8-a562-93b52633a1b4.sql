-- Drop the restrictive delete policy
DROP POLICY IF EXISTS "Admins can delete production orders" ON public.production_orders;

-- Create a permissive delete policy for open system
CREATE POLICY "Anyone can delete production orders"
ON public.production_orders
FOR DELETE
USING (true);