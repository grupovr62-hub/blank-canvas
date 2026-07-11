-- Add 'travete' status to production_orders status column
ALTER TABLE production_orders DROP CONSTRAINT IF EXISTS production_orders_status_check;

-- Add constraint with all valid status options including 'travete'
ALTER TABLE production_orders ADD CONSTRAINT production_orders_status_check 
CHECK (status IN ('piloto_tecido', 'corte', 'faccao', 'travete', 'lavanderia', 'acabamento', 'concluido'));