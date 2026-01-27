-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard -> SQL Editor
-- 2. Run this script to re-assign data from your OLD email to your NEW email.
-- PLEASE REPLACE 'old_email@example.com' AND 'new_email@gmail.com' WITH ACTUAL EMAILS

DO $$
DECLARE
    old_user_id uuid;
    new_user_id uuid;
BEGIN
    -- 1. Get the IDs based on emails
    SELECT id INTO old_user_id FROM auth.users WHERE email = 'old_email@example.com';
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'new_email@gmail.com';

    -- Check if both users exist
    IF old_user_id IS NULL THEN
        RAISE NOTICE 'Old user not found!';
        RETURN;
    END IF;

    IF new_user_id IS NULL THEN
        RAISE NOTICE 'New user not found! Please Login/Register first.';
        RETURN;
    END IF;

    -- 2. Update 'plans' table
    UPDATE public.plans
    SET user_id = new_user_id
    WHERE user_id = old_user_id;

    -- 3. Update 'stat_definitions' table
    UPDATE public.stat_definitions
    SET user_id = new_user_id
    WHERE user_id = old_user_id;

    -- 4. Update 'daily_stat_values' table
    UPDATE public.daily_stat_values
    SET user_id = new_user_id
    WHERE user_id = old_user_id;

    -- 5. (Optional) Check for other tables (e.g. checklists if they exist)
    -- UPDATE public.checklists SET user_id = new_user_id WHERE user_id = old_user_id;

    RAISE NOTICE 'Data migration completed successfully from % to %', old_user_id, new_user_id;
END $$;
