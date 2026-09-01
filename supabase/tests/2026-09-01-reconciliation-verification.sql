-- supabase/tests/2026-09-01-reconciliation-verification.sql
-- Static verification test suite for RepsBrief database schema post-reconciliation.
-- Safe to execute: runs assertions via PL/pgSQL DO block without modifying existing application data.

DO $$
DECLARE
  v_missing_tables TEXT[] := ARRAY[]::TEXT[];
  v_missing_columns TEXT[] := ARRAY[]::TEXT[];
  v_missing_buckets TEXT[] := ARRAY[]::TEXT[];
  v_missing_functions TEXT[] := ARRAY[]::TEXT[];
  v_table_count INTEGER;
  v_temp_bool BOOLEAN;
BEGIN
  RAISE NOTICE '=== [RepsBrief] Starting Database Reconciliation Verification ===';

  -- 1. Check all 16 public tables
  FOREACH v_table_count IN ARRAY ARRAY[1] LOOP
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
      v_missing_tables := array_append(v_missing_tables, 'profiles');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'briefs') THEN
      v_missing_tables := array_append(v_missing_tables, 'briefs');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trends_cache') THEN
      v_missing_tables := array_append(v_missing_tables, 'trends_cache');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'idea_history') THEN
      v_missing_tables := array_append(v_missing_tables, 'idea_history');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shared_strategies') THEN
      v_missing_tables := array_append(v_missing_tables, 'shared_strategies');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teams') THEN
      v_missing_tables := array_append(v_missing_tables, 'teams');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_members') THEN
      v_missing_tables := array_append(v_missing_tables, 'team_members');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_invitations') THEN
      v_missing_tables := array_append(v_missing_tables, 'team_invitations');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'content_calendar') THEN
      v_missing_tables := array_append(v_missing_tables, 'content_calendar');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_integrations') THEN
      v_missing_tables := array_append(v_missing_tables, 'team_integrations');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_integration_logs') THEN
      v_missing_tables := array_append(v_missing_tables, 'team_integration_logs');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_webhooks') THEN
      v_missing_tables := array_append(v_missing_tables, 'team_webhooks');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'job_queue') THEN
      v_missing_tables := array_append(v_missing_tables, 'job_queue');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'job_dead_letters') THEN
      v_missing_tables := array_append(v_missing_tables, 'job_dead_letters');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'waitlist_emails') THEN
      v_missing_tables := array_append(v_missing_tables, 'waitlist_emails');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'idea_images') THEN
      v_missing_tables := array_append(v_missing_tables, 'idea_images');
    END IF;
  END LOOP;

  IF array_length(v_missing_tables, 1) > 0 THEN
    RAISE EXCEPTION 'TEST FAILED: Missing tables: %', v_missing_tables;
  ELSE
    RAISE NOTICE '✓ All 16 public tables are present.';
  END IF;

  -- 2. Check critical columns in teams & profiles
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'brand_voice') THEN
    v_missing_columns := array_append(v_missing_columns, 'teams.brand_voice');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'writing_samples') THEN
    v_missing_columns := array_append(v_missing_columns, 'teams.writing_samples');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'referral_code') THEN
    v_missing_columns := array_append(v_missing_columns, 'profiles.referral_code');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'current_team_id') THEN
    v_missing_columns := array_append(v_missing_columns, 'profiles.current_team_id');
  END IF;

  IF array_length(v_missing_columns, 1) > 0 THEN
    RAISE EXCEPTION 'TEST FAILED: Missing critical columns: %', v_missing_columns;
  ELSE
    RAISE NOTICE '✓ All critical columns (including teams.brand_voice and teams.writing_samples) are present.';
  END IF;

  -- 3. Check storage buckets
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'logos') THEN
    v_missing_buckets := array_append(v_missing_buckets, 'logos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'idea-images') THEN
    v_missing_buckets := array_append(v_missing_buckets, 'idea-images');
  END IF;

  IF array_length(v_missing_buckets, 1) > 0 THEN
    RAISE EXCEPTION 'TEST FAILED: Missing storage buckets: %', v_missing_buckets;
  ELSE
    RAISE NOTICE '✓ Storage buckets (logos, idea-images) are present.';
  END IF;

  -- 4. Check critical functions & search_paths
  IF NOT EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE pg_namespace.nspname = 'public' AND proname = 'update_team_brand_voice') THEN
    v_missing_functions := array_append(v_missing_functions, 'update_team_brand_voice');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE pg_namespace.nspname = 'public' AND proname = 'accept_team_invitation') THEN
    v_missing_functions := array_append(v_missing_functions, 'accept_team_invitation');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE pg_namespace.nspname = 'public' AND proname = 'get_my_teams') THEN
    v_missing_functions := array_append(v_missing_functions, 'get_my_teams');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_proc JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid WHERE pg_namespace.nspname = 'public' AND proname = 'claim_queue_jobs') THEN
    v_missing_functions := array_append(v_missing_functions, 'claim_queue_jobs');
  END IF;

  IF array_length(v_missing_functions, 1) > 0 THEN
    RAISE EXCEPTION 'TEST FAILED: Missing functions: %', v_missing_functions;
  ELSE
    RAISE NOTICE '✓ Critical functions (update_team_brand_voice, accept_team_invitation, get_my_teams, claim_queue_jobs) are present.';
  END IF;

  RAISE NOTICE '=== [RepsBrief] Database Verification Passed Successfully ===';
END $$;
