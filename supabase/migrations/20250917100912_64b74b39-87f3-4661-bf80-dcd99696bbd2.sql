-- Create a security definer function to get user role without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Create a new policy using the security definer function
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Also check and fix the delete policy for production orders if needed
DROP POLICY IF EXISTS "Admins can delete production orders" ON public.production_orders;

CREATE POLICY "Admins can delete production orders" 
ON public.production_orders 
FOR DELETE 
USING (public.get_current_user_role() IN ('admin', 'manager'));