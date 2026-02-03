-- Add role column to users table for admin functionality
-- Run this in Supabase SQL Editor

-- Step 1: Add role column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' 
CHECK (role IN ('user', 'admin', 'moderator'));

-- Step 2: Add ban-related columns (optional, for future use)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP DEFAULT NULL;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS ban_reason TEXT DEFAULT NULL;

-- Step 3: Update demochef to admin
UPDATE users 
SET role = 'admin' 
WHERE username = 'demochef';

-- Step 4: Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Step 5: Verify changes
SELECT id, username, email, role, created_at 
FROM users 
ORDER BY created_at DESC;
