-- Fix the infinite recursion in the profiles policy
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Create a new policy without recursion
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM auth.users u 
    JOIN public.profiles p ON u.id = p.user_id 
    WHERE u.id = auth.uid() 
    AND p.role = 'admin'
  )
);