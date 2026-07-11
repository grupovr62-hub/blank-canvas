-- 1) Make Fabrics table fully open (no auth required)
DROP POLICY IF EXISTS "Admins can delete fabrics" ON public.fabrics;
DROP POLICY IF EXISTS "Users can create fabrics" ON public.fabrics;
DROP POLICY IF EXISTS "Users can update fabrics" ON public.fabrics;
DROP POLICY IF EXISTS "Users can view all fabrics" ON public.fabrics;

CREATE POLICY "Anyone can view fabrics"
ON public.fabrics
FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can create fabrics"
ON public.fabrics
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can update fabrics"
ON public.fabrics
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can delete fabrics"
ON public.fabrics
FOR DELETE
TO public
USING (true);

-- 2) Allow creating production orders without auth
DROP POLICY IF EXISTS "Users can create production orders" ON public.production_orders;

CREATE POLICY "Anyone can create production orders"
ON public.production_orders
FOR INSERT
TO public
WITH CHECK (true);

-- 3) Fix linter warnings: set stable search_path on functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;