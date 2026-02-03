-- Add image support for recipe instruction steps
-- Run this migration to add image_url columns to recipe_instructions table

ALTER TABLE recipe_instructions 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_public_id VARCHAR(255);

-- Add comments for clarity
COMMENT ON COLUMN recipe_instructions.image_url IS 'Cloudinary URL for step image';
COMMENT ON COLUMN recipe_instructions.image_public_id IS 'Cloudinary public ID for deletion';

-- Verify changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'recipe_instructions' 
AND column_name IN ('image_url', 'image_public_id');
