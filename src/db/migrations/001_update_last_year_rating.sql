-- Update last_year_rating column type
ALTER TABLE engineers 
ALTER COLUMN last_year_rating TYPE VARCHAR(50);

-- Add check constraint for valid values
ALTER TABLE engineers 
ADD CONSTRAINT check_last_year_rating 
CHECK (last_year_rating IN ('Below Expectations', 'Meets Expectations', 'Exceed Expectations')); 