-- ================================================
-- Supabase RLS Policies for LinkSnapper
-- ================================================
-- This script sets up Row Level Security policies for the links table
-- Run this in Supabase SQL Editor to enable CRUD operations

-- Enable RLS on the links table
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Enable read access for all users" ON links;
DROP POLICY IF EXISTS "Enable insert access for all users" ON links;
DROP POLICY IF EXISTS "Enable update access for all users" ON links;
DROP POLICY IF EXISTS "Enable delete access for all users" ON links;

-- Create SELECT policy (read access)
CREATE POLICY "Enable read access for all users"
ON links
FOR SELECT
TO public, anon, authenticated
USING (true);

-- Create INSERT policy (create new links)
CREATE POLICY "Enable insert access for all users"
ON links
FOR INSERT
TO public, anon, authenticated
WITH CHECK (true);

-- Create UPDATE policy (edit existing links)
CREATE POLICY "Enable update access for all users"
ON links
FOR UPDATE
TO public, anon, authenticated
USING (true)
WITH CHECK (true);

-- Create DELETE policy (delete links)
CREATE POLICY "Enable delete access for all users"
ON links
FOR DELETE
TO public, anon, authenticated
USING (true);

-- Verify policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'links'
ORDER BY policyname;
