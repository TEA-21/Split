-- ==============================================================================
-- Split (Tinder for Roommates) - Initial Production Schema & Spatial RPC
-- Migration: 20261109000000_init_split.sql
-- ==============================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT,
  avatar_url TEXT NOT NULL,
  photos TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT,
  user_mode TEXT NOT NULL CHECK (user_mode IN ('have_room', 'need_room')),
  budget_min INTEGER NOT NULL,
  budget_max INTEGER NOT NULL,
  move_in_date DATE NOT NULL,
  lease_duration_months INTEGER DEFAULT 12,
  cleanliness_level INTEGER CHECK (cleanliness_level BETWEEN 1 AND 5),
  sleep_schedule TEXT CHECK (sleep_schedule IN ('early_bird', 'night_owl', 'flexible')),
  work_style TEXT CHECK (work_style IN ('wfh', 'office', 'hybrid', 'student')),
  pet_policy TEXT CHECK (pet_policy IN ('has_pets', 'pet_friendly', 'no_pets')),
  smoking_policy TEXT CHECK (smoking_policy IN ('non_smoker', 'smoker', 'outside_only')),
  guest_policy TEXT CHECK (guest_policy IN ('rarely', 'weekends', 'flexible')),
  dietary_pref TEXT,
  target_location GEOMETRY(Point, 4326),
  target_location_name TEXT,
  search_radius_km INTEGER DEFAULT 25,
  verified_email BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial GiST Index on Profile Coordinates
CREATE INDEX idx_profiles_target_location ON public.profiles USING GIST ((target_location::geography));

-- 3. Rooms Table (Enforces UNIQUE owner_id to guarantee 1-to-1 relationship per profile)
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  rent_monthly INTEGER NOT NULL,
  deposit INTEGER,
  private_bath BOOLEAN DEFAULT FALSE,
  utilities_included BOOLEAN DEFAULT FALSE,
  has_laundry BOOLEAN DEFAULT TRUE,
  has_parking BOOLEAN DEFAULT FALSE,
  photos TEXT[] NOT NULL DEFAULT '{}',
  location GEOMETRY(Point, 4326),
  address_masked TEXT,
  available_from DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_rooms_owner_id UNIQUE (owner_id)
);

-- Spatial GiST Index on Room Coordinates
CREATE INDEX idx_rooms_location ON public.rooms USING GIST ((location::geography));

-- 4. Swipes Table
CREATE TABLE public.swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  swiper_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('like', 'pass', 'superlike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(swiper_id, target_id)
);

-- 5. Matches Table (Canonical ordering user_a < user_b prevents reciprocal duplicates)
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (user_a < user_b),
  UNIQUE(user_a, user_b)
);

-- 6. Messages Table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. User Reports & Blocks Table
CREATE TABLE public.user_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  is_block BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- AUTOMATED TRIGGERS & BUSINESS LOGIC
-- ==============================================================================

-- Trigger A: Match Automation on Swipe Upsert (SECURITY DEFINER prevents client swipe leakage)
CREATE OR REPLACE FUNCTION handle_swipe_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_first UUID;
  v_second UUID;
  v_reciprocal_exists BOOLEAN;
BEGIN
  IF NEW.direction IN ('like', 'superlike') THEN
    SELECT EXISTS (
      SELECT 1 FROM public.swipes
      WHERE swiper_id = NEW.target_id
        AND target_id = NEW.swiper_id
        AND direction IN ('like', 'superlike')
    ) INTO v_reciprocal_exists;

    IF v_reciprocal_exists THEN
      v_first := LEAST(NEW.swiper_id, NEW.target_id);
      v_second := GREATEST(NEW.swiper_id, NEW.target_id);

      INSERT INTO public.matches (user_a, user_b)
      VALUES (v_first, v_second)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_swipe_upserted
AFTER INSERT OR UPDATE ON public.swipes
FOR EACH ROW EXECUTE FUNCTION handle_swipe_match();

-- Trigger B: Swipe Rewind Cleanup (Deletes reciprocal match if user immediately undos swipe)
CREATE OR REPLACE FUNCTION handle_swipe_rewind()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_first UUID;
  v_second UUID;
BEGIN
  v_first := LEAST(OLD.swiper_id, OLD.target_id);
  v_second := GREATEST(OLD.swiper_id, OLD.target_id);

  DELETE FROM public.matches
  WHERE user_a = v_first AND user_b = v_second;

  RETURN OLD;
END;
$$;

CREATE TRIGGER on_swipe_deleted
AFTER DELETE ON public.swipes
FOR EACH ROW EXECUTE FUNCTION handle_swipe_rewind();

-- Trigger C: Update Match Last Interaction on Message Sent
CREATE OR REPLACE FUNCTION handle_message_sent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  UPDATE public.matches
  SET last_interaction_at = NOW()
  WHERE id = NEW.match_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_inserted
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION handle_message_sent();

-- Trigger D: Purge Matches on Block
CREATE OR REPLACE FUNCTION handle_block_cleanup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  IF NEW.is_block = true THEN
    DELETE FROM public.matches
    WHERE (user_a = NEW.reporter_id AND user_b = NEW.reported_id)
       OR (user_a = NEW.reported_id AND user_b = NEW.reporter_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_blocked
AFTER INSERT OR UPDATE ON public.user_reports
FOR EACH ROW EXECUTE FUNCTION handle_block_cleanup();

-- ==============================================================================
-- SPATIAL DISCOVERY FEED RPC
-- ==============================================================================

CREATE OR REPLACE FUNCTION get_roommate_feed(
  current_user_id UUID,
  ref_lat DOUBLE PRECISION,
  ref_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 25.0,
  filter_mode TEXT DEFAULT 'all',
  budget_min_filter INTEGER DEFAULT 0,
  budget_max_filter INTEGER DEFAULT 99999,
  cleanliness_min INTEGER DEFAULT 1,
  pet_friendly_only BOOLEAN DEFAULT FALSE,
  non_smoker_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  avatar_url TEXT,
  photos TEXT[],
  bio TEXT,
  user_mode TEXT,
  budget_min INTEGER,
  budget_max INTEGER,
  move_in_date DATE,
  lease_duration_months INTEGER,
  cleanliness_level INTEGER,
  sleep_schedule TEXT,
  work_style TEXT,
  pet_policy TEXT,
  smoking_policy TEXT,
  guest_policy TEXT,
  dietary_pref TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  target_location_name TEXT,
  verified_email BOOLEAN,
  distance_km DOUBLE PRECISION,
  room_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  -- Security guard: Prevent identity spoofing and unauthenticated enumeration
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required';
  END IF;
  IF current_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Caller identity mismatch';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.age,
    p.gender,
    p.avatar_url,
    p.photos,
    p.bio,
    p.user_mode,
    p.budget_min,
    p.budget_max,
    p.move_in_date,
    p.lease_duration_months,
    p.cleanliness_level,
    p.sleep_schedule,
    p.work_style,
    p.pet_policy,
    p.smoking_policy,
    p.guest_policy,
    p.dietary_pref,
    ST_Y(p.target_location::geometry) AS latitude,
    ST_X(p.target_location::geometry) AS longitude,
    p.target_location_name,
    p.verified_email,
    ROUND((ST_Distance(p.target_location::geography, ST_SetSRID(ST_MakePoint(ref_lng, ref_lat), 4326)::geography) / 1000.0)::numeric, 1)::DOUBLE PRECISION AS distance_km,
    CASE 
      WHEN r.id IS NOT NULL THEN jsonb_build_object(
        'id', r.id,
        'ownerId', r.owner_id,
        'title', r.title,
        'description', r.description,
        'rentMonthly', r.rent_monthly,
        'deposit', r.deposit,
        'privateBath', r.private_bath,
        'utilitiesIncluded', r.utilities_included,
        'hasLaundry', r.has_laundry,
        'hasParking', r.has_parking,
        'photos', r.photos,
        'addressMasked', r.address_masked,
        'availableFrom', r.available_from,
        'createdAt', r.created_at
      )
      ELSE NULL
    END AS room_data
  FROM public.profiles p
  LEFT JOIN public.rooms r ON r.owner_id = p.id
  WHERE p.id != current_user_id
    -- Exclude already swiped profiles
    AND p.id NOT IN (
      SELECT target_id FROM public.swipes WHERE swiper_id = current_user_id
    )
    -- Exclude ANY profile reported by the caller
    AND p.id NOT IN (
      SELECT reported_id FROM public.user_reports WHERE reporter_id = current_user_id
    )
    -- Exclude targets where caller was blocked by target
    AND p.id NOT IN (
      SELECT reporter_id FROM public.user_reports WHERE reported_id = current_user_id AND is_block = true
    )
    -- Candidate user mode filter
    AND (filter_mode = 'all' OR p.user_mode = filter_mode)
    -- Budget overlap
    AND p.budget_max >= budget_min_filter
    AND p.budget_min <= budget_max_filter
    -- Cleanliness minimum
    AND (p.cleanliness_level IS NULL OR p.cleanliness_level >= cleanliness_min)
    -- Pet policy
    AND (NOT pet_friendly_only OR p.pet_policy IN ('has_pets', 'pet_friendly'))
    -- Smoking policy
    AND (NOT non_smoker_only OR p.smoking_policy = 'non_smoker')
    -- Spatial radius
    AND (
      p.target_location IS NULL 
      OR ST_DWithin(
        p.target_location::geography,
        ST_SetSRID(ST_MakePoint(ref_lng, ref_lat), 4326)::geography,
        radius_km * 1000.0
      )
    )
  ORDER BY 
    CASE WHEN p.target_location IS NOT NULL THEN 0 ELSE 1 END,
    ST_Distance(p.target_location::geography, ST_SetSRID(ST_MakePoint(ref_lng, ref_lat), 4326)::geography) ASC;
END;
$$;

-- Security guard: Revoke public execution and grant strictly to authenticated users
REVOKE EXECUTE ON FUNCTION get_roommate_feed FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_roommate_feed TO authenticated;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- Profiles: insert own profile, read all public, update own profile
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Public profiles readable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Rooms: read all public rooms, manage own room (insert, update, delete)
CREATE POLICY "Rooms readable by authenticated" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own room" ON public.rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users update own room" ON public.rooms FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Users delete own room" ON public.rooms FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Swipes: insert, read, update (upsert), and delete (rewind)
CREATE POLICY "Users can insert own swipes" ON public.swipes FOR INSERT TO authenticated WITH CHECK (auth.uid() = swiper_id);
CREATE POLICY "Users can read own swipes" ON public.swipes FOR SELECT TO authenticated USING (auth.uid() = swiper_id);
CREATE POLICY "Users can update own swipes" ON public.swipes FOR UPDATE TO authenticated USING (auth.uid() = swiper_id) WITH CHECK (auth.uid() = swiper_id);
CREATE POLICY "Users can delete own swipes" ON public.swipes FOR DELETE TO authenticated USING (auth.uid() = swiper_id);

-- Matches: read matches where user is a participant
CREATE POLICY "Users can view matches they are part of" ON public.matches FOR SELECT TO authenticated 
USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Messages: read, insert, and update (mark read) by match participants
CREATE POLICY "Match participants can read messages" ON public.messages FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id AND (m.user_a = auth.uid() OR m.user_b = auth.uid())));

CREATE POLICY "Match participants can insert messages" ON public.messages FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id AND (m.user_a = auth.uid() OR m.user_b = auth.uid())));

CREATE POLICY "Recipients can mark messages read" ON public.messages FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id AND (m.user_a = auth.uid() OR m.user_b = auth.uid())) AND auth.uid() != sender_id)
WITH CHECK (EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id AND (m.user_a = auth.uid() OR m.user_b = auth.uid())));

-- Reports: insert reports
CREATE POLICY "Users can insert reports" ON public.user_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

