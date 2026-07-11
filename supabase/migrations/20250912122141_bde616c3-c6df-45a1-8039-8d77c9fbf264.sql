-- Create profiles table for user management
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create fabrics table
CREATE TABLE public.fabrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  color text NOT NULL,
  weight text NOT NULL,
  supplier text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  unit text DEFAULT 'metros' NOT NULL,
  min_stock integer NOT NULL DEFAULT 0,
  price_per_meter decimal(10,2) NOT NULL,
  last_purchase date,
  status text DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'baixo', 'esgotado')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on fabrics
ALTER TABLE public.fabrics ENABLE ROW LEVEL SECURITY;

-- Create policies for fabrics
CREATE POLICY "Users can view all fabrics" ON public.fabrics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create fabrics" ON public.fabrics
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update fabrics" ON public.fabrics
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admins can delete fabrics" ON public.fabrics
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_fabrics_updated_at BEFORE UPDATE ON public.fabrics
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();