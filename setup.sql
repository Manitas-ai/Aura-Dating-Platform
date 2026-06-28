-- ============================================================
-- AURA DATING PLATFORM — Database Setup v2.0
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Drop everything cleanly ──────────────────────────────────
DROP TABLE IF EXISTS messages         CASCADE;
DROP TABLE IF EXISTS flirts           CASCADE;
DROP TABLE IF EXISTS flirt_proposals  CASCADE;
DROP TABLE IF EXISTS observations     CASCADE;
DROP TABLE IF EXISTS questionnaires   CASCADE;
DROP TABLE IF EXISTS profile_photos   CASCADE;
DROP TABLE IF EXISTS profiles         CASCADE;

DROP FUNCTION IF EXISTS create_match_if_mutual() CASCADE;

-- ── profiles ─────────────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  age_group   TEXT,
  gender      TEXT,
  looking_for TEXT,
  region      TEXT,
  about_me    TEXT,
  interests   TEXT[]  DEFAULT '{}',
  photo_url   TEXT,
  status      TEXT    NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── profile_photos ───────────────────────────────────────────
CREATE TABLE profile_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url   TEXT NOT NULL,
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  sort_order  INT     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── questionnaires ───────────────────────────────────────────
CREATE TABLE questionnaires (
  profile_id              UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  q_visibility            JSONB NOT NULL DEFAULT '{}',

  q_existing_kids         BOOLEAN,
  q_kids_living_with      TEXT,
  q_wish_kids             TEXT,
  q_religion              TEXT,
  q_relocation            TEXT,
  q_employment            TEXT,
  q_desired_relationship  TEXT,
  q_languages             TEXT[] DEFAULT '{}',

  q_appearance_attitude   TEXT,
  q_body_type             TEXT,
  q_height                TEXT,
  q_fitness_level         TEXT,
  q_personal_style        TEXT,

  q_saturday_alone        TEXT[] DEFAULT '{}',
  q_saturday_kids         TEXT[] DEFAULT '{}',
  q_vacation_alone        TEXT[] DEFAULT '{}',
  q_vacation_kids         TEXT[] DEFAULT '{}',

  q_values                TEXT[] DEFAULT '{}',
  q_partnership_priorities TEXT[] DEFAULT '{}',
  q_life_vision           TEXT[] DEFAULT '{}',
  q_mind_occupiers        TEXT[] DEFAULT '{}',

  q_smoking               TEXT,
  q_alcohol               TEXT,
  q_diet                  TEXT,
  q_pets                  TEXT,

  q_about_intellectual    TEXT,
  q_quote_1               TEXT,
  q_quote_2               TEXT,
  q_quote_3               TEXT,

  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── observations ─────────────────────────────────────────────
CREATE TABLE observations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  observed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(observer_id, observed_id)
);

-- ── flirt_proposals ──────────────────────────────────────────
CREATE TABLE flirt_proposals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message     TEXT,
  attempt     INT  NOT NULL DEFAULT 1,
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── flirts ───────────────────────────────────────────────────
CREATE TABLE flirts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_1_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_2_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_1_id, profile_2_id)
);

-- ── messages ─────────────────────────────────────────────────
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flirt_id    UUID NOT NULL REFERENCES flirts(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── feedback ──────────────────────────────────────────────────
CREATE TABLE feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  username    TEXT,
  category    TEXT NOT NULL DEFAULT 'general',
  rating      INT,
  feedback    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Row Level Security (permissive for PoC) ──────────────────
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_photos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires   ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE flirt_proposals  ENABLE ROW LEVEL SECURITY;
ALTER TABLE flirts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_profiles"        ON profiles         FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_photos"          ON profile_photos   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_questionnaires"  ON questionnaires   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_observations"    ON observations     FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_proposals"       ON flirt_proposals  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_flirts"          ON flirts           FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_messages"        ON messages         FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_feedback"        ON feedback         FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── Storage: allow anon to upload/read profile photos ────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "anon_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "anon_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "anon_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "anon_storage_delete" ON storage.objects;

CREATE POLICY "anon_storage_select" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'profile-photos');
CREATE POLICY "anon_storage_insert" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'profile-photos');
CREATE POLICY "anon_storage_update" ON storage.objects FOR UPDATE TO anon USING (bucket_id = 'profile-photos');
CREATE POLICY "anon_storage_delete" ON storage.objects FOR DELETE TO anon USING (bucket_id = 'profile-photos');

-- ============================================================
-- SEED DATA
-- ============================================================
DO $$
DECLARE
  id_alex    UUID;
  id_sara    UUID;
  id_lena    UUID;
  id_marco   UUID;
  id_julia   UUID;
  id_thomas  UUID;
  id_nina    UUID;
  id_felix   UUID;
  id_claire  UUID;
  id_stefan  UUID;
  id_miriam  UUID;
  id_david   UUID;
  id_anna    UUID;
  id_tobias  UUID;
  id_katrin  UUID;
  id_lukas   UUID;
  id_sophie  UUID;
  id_erik    UUID;
  id_vera    UUID;
  id_florian UUID;
  id_flirt1  UUID;
  id_flirt2  UUID;
  id_flirt3  UUID;
BEGIN

-- ── Profiles ───────────────────────────────────────────────────

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('alex', 'sun42', '40–44', 'man', 'a woman', 'Bayern',
  'Entrepreneur, trail runner, amateur cook. Looking for depth — someone curious about the world and honest about themselves.',
  ARRAY['Trail running','Cooking','Philosophy','AI & society','Books'],
  'https://randomuser.me/api/portraits/men/32.jpg')
RETURNING id INTO id_alex;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('sara', 'wave7', '35–39', 'woman', 'a man', 'Berlin',
  'Art director by day, reader by night. I believe a good meal and an honest conversation can fix most things.',
  ARRAY['Reading','Art & culture','Cooking','Travel','Yoga'],
  'https://randomuser.me/api/portraits/women/44.jpg')
RETURNING id INTO id_sara;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('lena', 'mint3', '40–44', 'woman', 'a man', 'Wien',
  'Researcher. Mother of two. I spend my free time in the mountains or in second-hand bookshops — often both.',
  ARRAY['Hiking','Books','Learning','Nature','Gardening'],
  'https://randomuser.me/api/portraits/women/68.jpg')
RETURNING id INTO id_lena;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('marco', 'fire9', '45–49', 'man', 'a woman', 'Zürich',
  'Finance. Weekend cyclist. I read too much geopolitics and not enough fiction — working on it.',
  ARRAY['Cycling','Geopolitics','Books','Travel','DIY'],
  'https://randomuser.me/api/portraits/men/75.jpg')
RETURNING id INTO id_marco;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('julia', 'sky11', '35–39', 'woman', 'a man', 'Nordrhein-Westfalen',
  'Architect. I design spaces for a living and prefer open ones for everything else. Terrible at small talk, great at long dinners.',
  ARRAY['Architecture','Design','Museum','Travel','Wine & food'],
  'https://randomuser.me/api/portraits/women/90.jpg')
RETURNING id INTO id_julia;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('thomas', 'oak55', '50–54', 'man', 'a woman', 'Hamburg',
  'Surgeon. I operate with precision and cook the same way. I find the sea more restorative than any therapist.',
  ARRAY['Sailing','Cooking','Medicine','Music','Running'],
  'https://randomuser.me/api/portraits/men/41.jpg')
RETURNING id INTO id_thomas;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('nina', 'rose4', '30–34', 'woman', 'a man', 'Baden-Württemberg',
  'Biologist turned science journalist. I explain complex things for a living — in conversation I try to do the opposite and just listen.',
  ARRAY['Science','Writing','Nature','Cycling','Theatre'],
  'https://randomuser.me/api/portraits/women/29.jpg')
RETURNING id INTO id_nina;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('felix', 'pine8', '35–39', 'man', 'a woman', 'Hessen',
  'Urban planner, amateur pianist, father of one. I care about cities, about how people move through space, and about getting the bread right.',
  ARRAY['Piano','Urban design','Running','Baking','Philosophy'],
  'https://randomuser.me/api/portraits/men/53.jpg')
RETURNING id INTO id_felix;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('claire', 'lake6', '40–44', 'woman', 'a man', 'Bern',
  'Secondary school teacher, mountaineer, mediocre watercolourist. I prefer honest awkwardness to polished performance.',
  ARRAY['Mountaineering','Painting','Teaching','Books','Skiing'],
  'https://randomuser.me/api/portraits/women/55.jpg')
RETURNING id INTO id_claire;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('stefan', 'clay2', '45–49', 'man', 'a woman', 'Steiermark',
  'Winemaker. I live between the vines and the cellar and find the same things interesting in both: patience, complexity, time.',
  ARRAY['Wine','Hiking','History','Cooking','Photography'],
  'https://randomuser.me/api/portraits/men/62.jpg')
RETURNING id INTO id_stefan;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('miriam', 'dew13', '35–39', 'woman', 'a man', 'Brandenburg',
  'Landscape architect. I like slow mornings, long walks, and conversations that outlast the wine.',
  ARRAY['Landscape design','Running','Books','Gardening','Travel'],
  'https://randomuser.me/api/portraits/women/37.jpg')
RETURNING id INTO id_miriam;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('david', 'iron7', '40–44', 'man', 'a woman', 'Salzburg',
  'Conductor. My work is about listening — really listening. I bring that everywhere.',
  ARRAY['Classical music','Conducting','Languages','Hiking','Literature'],
  'https://randomuser.me/api/portraits/men/28.jpg')
RETURNING id INTO id_david;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('anna', 'fern5', '30–34', 'woman', 'a man', 'Sachsen',
  'Software engineer with a weakness for good coffee, long novels, and weekend climbing trips. I code for a living and move for sanity.',
  ARRAY['Climbing','Coding','Reading','Coffee','Yoga'],
  'https://randomuser.me/api/portraits/women/15.jpg')
RETURNING id INTO id_anna;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('tobias', 'mist9', '50–54', 'man', 'a woman', 'Tirol',
  'Mountain guide and photographer. I spend more time above 2000m than below. Down here I''m learning to be more present.',
  ARRAY['Mountaineering','Photography','Skiing','Mindfulness','Books'],
  'https://randomuser.me/api/portraits/men/19.jpg')
RETURNING id INTO id_tobias;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('katrin', 'gold3', '45–49', 'woman', 'a man', 'Schleswig-Holstein',
  'Marine biologist. I have spent years studying what lies beneath the surface — in the ocean and in myself.',
  ARRAY['Sailing','Diving','Science','Yoga','Reading'],
  'https://randomuser.me/api/portraits/women/72.jpg')
RETURNING id INTO id_katrin;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('lukas', 'dusk6', '30–34', 'man', 'a woman', 'Rheinland-Pfalz',
  'Journalist and documentary filmmaker. I ask difficult questions professionally; personally I try to hold them a little more lightly.',
  ARRAY['Journalism','Film','Cycling','Photography','Politics'],
  'https://randomuser.me/api/portraits/men/47.jpg')
RETURNING id INTO id_lukas;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('sophie', 'lime2', '35–39', 'woman', 'a man', 'Niederösterreich',
  'Psychotherapist in training, former dancer, current reader of too many books at once. I think deeply and laugh easily.',
  ARRAY['Dancing','Psychology','Books','Theatre','Hiking'],
  'https://randomuser.me/api/portraits/women/82.jpg')
RETURNING id INTO id_sophie;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('erik', 'peak1', '40–44', 'man', 'a woman', 'Ostschweiz',
  'Structural engineer who builds bridges for work and tries to do the same in life. Mediocre chess player, excellent listener.',
  ARRAY['Engineering','Chess','Hiking','Cooking','Music'],
  'https://randomuser.me/api/portraits/men/88.jpg')
RETURNING id INTO id_erik;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('vera', 'moor8', '50–54', 'woman', 'a man', 'Hamburg',
  'Publisher. Thirty years of other people''s words — I still believe a good sentence changes everything.',
  ARRAY['Literature','Art','Opera','Travel','Gardening'],
  'https://randomuser.me/api/portraits/women/61.jpg')
RETURNING id INTO id_vera;

INSERT INTO profiles (username, password, age_group, gender, looking_for, region, about_me, interests, photo_url)
VALUES ('florian', 'echo4', '30–34', 'man', 'a woman', 'Kärnten',
  'Chef and forager. I source everything locally and think sourcing matters in relationships too — proximity, honesty, no shortcuts.',
  ARRAY['Cooking','Foraging','Hiking','Wine','Sustainability'],
  'https://randomuser.me/api/portraits/men/36.jpg')
RETURNING id INTO id_florian;

-- ── Profile photos ──────────────────────────────────────────────

INSERT INTO profile_photos (profile_id, photo_url, is_primary, sort_order) VALUES
  (id_alex,    'https://randomuser.me/api/portraits/men/32.jpg',    true, 0),
  (id_sara,    'https://randomuser.me/api/portraits/women/44.jpg',  true, 0),
  (id_lena,    'https://randomuser.me/api/portraits/women/68.jpg',  true, 0),
  (id_marco,   'https://randomuser.me/api/portraits/men/75.jpg',    true, 0),
  (id_julia,   'https://randomuser.me/api/portraits/women/90.jpg',  true, 0),
  (id_thomas,  'https://randomuser.me/api/portraits/men/41.jpg',    true, 0),
  (id_nina,    'https://randomuser.me/api/portraits/women/29.jpg',  true, 0),
  (id_felix,   'https://randomuser.me/api/portraits/men/53.jpg',    true, 0),
  (id_claire,  'https://randomuser.me/api/portraits/women/55.jpg',  true, 0),
  (id_stefan,  'https://randomuser.me/api/portraits/men/62.jpg',    true, 0),
  (id_miriam,  'https://randomuser.me/api/portraits/women/37.jpg',  true, 0),
  (id_david,   'https://randomuser.me/api/portraits/men/28.jpg',    true, 0),
  (id_anna,    'https://randomuser.me/api/portraits/women/15.jpg',  true, 0),
  (id_tobias,  'https://randomuser.me/api/portraits/men/19.jpg',    true, 0),
  (id_katrin,  'https://randomuser.me/api/portraits/women/72.jpg',  true, 0),
  (id_lukas,   'https://randomuser.me/api/portraits/men/47.jpg',    true, 0),
  (id_sophie,  'https://randomuser.me/api/portraits/women/82.jpg',  true, 0),
  (id_erik,    'https://randomuser.me/api/portraits/men/88.jpg',    true, 0),
  (id_vera,    'https://randomuser.me/api/portraits/women/61.jpg',  true, 0),
  (id_florian, 'https://randomuser.me/api/portraits/men/36.jpg',    true, 0);

-- ── Questionnaires ──────────────────────────────────────────────

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_vacation_alone, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_alex, false, NULL, 'Open to it', 'Agnostic', 'Open to same city / region', 'Business owner / Entrepreneur', 'Long-term partnership leading to marriage', ARRAY['German','English'],
  'I take reasonable care of myself. Health and appearance are priorities, though not above everything else.',
  'Athletic and toned', '181–185 cm', 'Regularly active — several times a week', 'Smart casual',
  ARRAY['Trail running','Cooking / baking','Reading','Podcast / audiobooks','Gym / weight training'],
  ARRAY['City break (culture, food, architecture)','Countryside / nature retreat','Hotel (4-5 stars)'],
  ARRAY['Personal growth & self-knowledge','Health & Wellbeing','Career & professional achievement','Freedom & autonomy','Learning & intellectual development'],
  ARRAY['Intellectual stimulation — someone who challenges how I think','Deep trust and honesty','Companionship — simply enjoying each other''s company','Shared values and worldview','Humour and lightness'],
  ARRAY['Build or grow a business','Focus on personal growth and self-discovery'],
  ARRAY['AI and what it means for society','Starting or growing a business','Books and literature'],
  'Never acceptable', 'Occasional drinking fine', 'No restrictions', 'Fine',
  'Thinking Fast and Slow — Kahneman. Sapiens — Harari. Lex Fridman podcast.',
  '"The obstacle is the way." — Marcus Aurelius');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_vacation_alone, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_sara, false, NULL, 'Probably not', 'Spiritual but not religious', 'No — I am settled here', 'Employed full-time', 'Long-term partnership without necessarily marrying', ARRAY['German','English','French'],
  'I invest significantly in myself — fitness, nutrition, appearance. I know I look good and that matters to me.',
  'Slim', '166–170 cm', 'Regularly active — several times a week', 'Elegant / refined',
  ARRAY['Reading','Museum / gallery','Yoga / Pilates','Cooking / baking','Theatre / opera / concert'],
  ARRAY['City break (culture, food, architecture)','Rented villa or apartment','Wellness / spa retreat'],
  ARRAY['Art & culture','Creativity & self-expression','Personal growth & self-knowledge','Authenticity','Freedom & autonomy'],
  ARRAY['Intellectual stimulation — someone who challenges how I think','Emotional intimacy and vulnerability','Shared values and worldview','Humour and lightness','A quiet, stable everyday life'],
  ARRAY['Focus on personal growth and self-discovery','Own and restore a home or property'],
  ARRAY['Art and creativity','Books and literature','Mental health'],
  'Never acceptable', 'Occasional drinking fine', 'Vegetarian', 'Love them — have some',
  'Jenny Offill — Dept. of Speculation. Rachel Cusk — Outline trilogy. On Being podcast.',
  '"In the middle of difficulty lies opportunity." — Einstein');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_saturday_kids, q_vacation_alone, q_vacation_kids, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_lena, true, 'Shared custody (roughly half the time)', 'Definitely no', 'Catholic', 'Open to same city / region', 'Academic / Researcher', 'Long-term partnership leading to marriage', ARRAY['German','English'],
  'I take reasonable care of myself. Health and appearance are priorities, though not above everything else.',
  'Average / medium build', '161–165 cm', 'Moderately active — I move, but not consistently', 'Classic / timeless',
  ARRAY['Hiking / trekking','Reading','Gardening','Studying / online courses','Meditation / prayer alone'],
  ARRAY['Hiking','Nature walk / forest','Reading together','Board games / family games','Cooking / baking together'],
  ARRAY['Countryside / nature retreat','Camping','Adventure / trekking holiday'],
  ARRAY['Hiking','Camping','Nature / national park'],
  ARRAY['Existing Children','Health & Wellbeing','Learning & intellectual development','Nature & the environment','Spirituality & faith'],
  ARRAY['Deep trust and honesty','Shared parenting — co-raising children well','Shared values and worldview','Support during difficulty and crisis','Physical affection and closeness'],
  ARRAY['Be the best possible parent to my existing children','Deepen my spiritual or philosophical life'],
  ARRAY['Parenting challenges','Books and literature','Climate and environment'],
  'Never acceptable', 'Teetotal preferred', 'No restrictions', 'Love them — have some',
  'Bessel van der Kolk — The Body Keeps the Score. Gabor Maté. Johann Hari — Lost Connections.',
  '"It takes a village to raise a child." — African proverb');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_vacation_alone, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_marco, true, 'Shared custody (occasionally)', 'Definitely no', 'Agnostic', 'Open to anywhere in this country', 'Employed full-time', 'Long-term partnership without necessarily marrying', ARRAY['German','English','Italian'],
  'I am comfortable in my skin. My focus is elsewhere and I make no apology for that.',
  'Stocky / broad', '176–180 cm', 'Regularly active — several times a week', 'Smart casual',
  ARRAY['Cycling','Podcast / audiobooks','Reading','DIY / home projects','Cooking / baking'],
  ARRAY['City break (culture, food, architecture)','Road trip','Hotel (2-3 stars)'],
  ARRAY['Financial security','Career & professional achievement','Freedom & autonomy','Health & Wellbeing','Existing Children'],
  ARRAY['Companionship — simply enjoying each other''s company','Mutual respect for each other''s independence','Deep trust and honesty','Humour and lightness','Financial alignment and shared goals'],
  ARRAY['Achieve financial independence','Travel extensively and freely'],
  ARRAY['Geopolitical situation','Finances and economic uncertainty','AI and what it means for society'],
  'Acceptable if outdoors only', 'Regular drinking fine', 'No restrictions', 'Prefer a home without them',
  'Ray Dalio — Principles. Peter Zeihan. Acquired podcast. Stratechery.',
  '"First, do no harm." — Hippocratic oath');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_vacation_alone, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_julia, false, NULL, 'Open to it', 'Spiritual but not religious', 'Open to relocating abroad', 'Employed full-time', 'Long-term partnership leading to marriage', ARRAY['German','English','Spanish'],
  'I invest significantly in myself — fitness, nutrition, appearance. I know I look good and that matters to me.',
  'Slim', '171–175 cm', 'Regularly active — several times a week', 'Elegant / refined',
  ARRAY['Museum / gallery','Theatre / opera / concert','Solo travel / day trip','Wine / food exploration','Cycling'],
  ARRAY['City break (culture, food, architecture)','Hotel (4-5 stars)','Cultural immersion (language, cooking school)'],
  ARRAY['Creativity & self-expression','Art & culture','Personal growth & self-knowledge','Travel & exploration','Authenticity'],
  ARRAY['Intellectual stimulation — someone who challenges how I think','Adventure and shared experiences','Emotional intimacy and vulnerability','Shared values and worldview','Building something together (home, project, business, family)'],
  ARRAY['Live abroad','Build or grow a business'],
  ARRAY['Architecture and design','Art and creativity','Travel and exploration'],
  'Never acceptable', 'Occasional drinking fine', 'Flexitarian', 'Fine',
  'Rem Koolhaas — S,M,L,XL. Alain de Botton — The Architecture of Happiness. 99% Invisible podcast.',
  '"Less is more." — Mies van der Rohe');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_vacation_alone, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_thomas, true, 'Shared custody (most of the time)', 'Definitely no', 'Protestant Christian', 'No — I am settled here', 'Employed full-time', 'Long-term partnership leading to marriage', ARRAY['German','English'],
  'I take reasonable care of myself. Health and appearance are priorities, though not above everything else.',
  'Athletic and toned', '181–185 cm', 'Very active — training is a core part of my life', 'Classic / timeless',
  ARRAY['Running','Sailing','Cooking / baking','Reading','Podcast / audiobooks'],
  ARRAY['Countryside / nature retreat','Hotel (4-5 stars)','Road trip'],
  ARRAY['Health & Wellbeing','Existing Children','Freedom & autonomy','Authenticity','Contributing to something larger than myself'],
  ARRAY['Deep trust and honesty','Shared parenting — co-raising children well','Physical affection and closeness','Companionship — simply enjoying each other''s company','Support during difficulty and crisis'],
  ARRAY['Be the best possible parent to my existing children','Slow down and be more present'],
  ARRAY['Health and the body','Parenting challenges','Philosophy and meaning of life'],
  'Never acceptable', 'Occasional drinking fine', 'No restrictions', 'Fine',
  'Paul Kalanithi — When Breath Becomes Air. Atul Gawande — Being Mortal. Medicine podcasts.',
  '"Do what you can, with what you have, where you are." — Theodore Roosevelt');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_vacation_alone, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_nina, false, NULL, 'Definitely yes', 'Agnostic', 'Open to same city / region', 'Employed full-time', 'Long-term partnership leading to marriage', ARRAY['German','English','French'],
  'I take reasonable care of myself. Health and appearance are priorities, though not above everything else.',
  'Slim', '166–170 cm', 'Regularly active — several times a week', 'Smart casual',
  ARRAY['Cycling','Reading','Theatre / opera / concert','Writing / journaling','Hiking / trekking'],
  ARRAY['Countryside / nature retreat','City break (culture, food, architecture)','Adventure / trekking holiday'],
  ARRAY['Learning & intellectual development','Nature & the environment','Creativity & self-expression','Personal growth & self-knowledge','Community & belonging'],
  ARRAY['Intellectual stimulation — someone who challenges how I think','Shared values and worldview','Humour and lightness','Emotional intimacy and vulnerability','Adventure and shared experiences'],
  ARRAY['Build a new family','Change career direction'],
  ARRAY['Climate and environment','Science and research','Books and literature'],
  'Never acceptable', 'Occasional drinking fine', 'Flexitarian', 'Love them — have some',
  'Robert Sapolsky — Behave. Carl Sagan — Pale Blue Dot. Radiolab podcast. Nature journal.',
  '"The cosmos is within us." — Carl Sagan');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_saturday_kids, q_vacation_alone, q_vacation_kids, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_felix, true, 'Shared custody (roughly half the time)', 'Definitely no', 'Agnostic', 'Open to same city / region', 'Employed full-time', 'Long-term partnership without necessarily marrying', ARRAY['German','English'],
  'I take reasonable care of myself. Health and appearance are priorities, though not above everything else.',
  'Average / medium build', '176–180 cm', 'Moderately active — I move, but not consistently', 'Smart casual',
  ARRAY['Music — playing an instrument','Running','Reading','Cooking / baking','Studying / online courses'],
  ARRAY['Creative workshop (art, pottery, cooking)','Day trip / mini adventure','Cooking / baking together','Board games / family games','Cinema'],
  ARRAY['City break (culture, food, architecture)','Rented villa or apartment','Countryside / nature retreat'],
  ARRAY['City break (family-friendly)','Rented house / apartment','Cultural trip'],
  ARRAY['Existing Children','Community & belonging','Personal growth & self-knowledge','Creativity & self-expression','Stability & predictability'],
  ARRAY['Deep trust and honesty','Shared parenting — co-raising children well','Companionship — simply enjoying each other''s company','Humour and lightness','Building something together (home, project, business, family)'],
  ARRAY['Be the best possible parent to my existing children','Own and restore a home or property'],
  ARRAY['Parenting challenges','Architecture and design','Music'],
  'Never acceptable', 'Occasional drinking fine', 'No restrictions', 'Fine',
  'Jane Jacobs — The Death and Life of Great American Cities. Henri Lefebvre. 99% Invisible podcast.',
  '"Cities have the capability of providing something for everybody, only because, and only when, they are created by everybody." — Jane Jacobs');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_vacation_alone, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_claire, false, NULL, 'Open to it', 'Protestant Christian', 'Open to same city / region', 'Employed full-time', 'Long-term partnership leading to marriage', ARRAY['German','English','French'],
  'I have been less disciplined than I would like recently — life got in the way. I am working on it.',
  'Average / medium build', '166–170 cm', 'Regularly active — several times a week', 'Classic / timeless',
  ARRAY['Hiking / trekking','Painting / drawing','Reading','Skiing / snowboarding','Cooking / baking'],
  ARRAY['Adventure / trekking holiday','Countryside / nature retreat','Camping'],
  ARRAY['Nature & the environment','Authenticity','Personal growth & self-knowledge','Health & Wellbeing','Community & belonging'],
  ARRAY['Deep trust and honesty','Shared values and worldview','Physical affection and closeness','Humour and lightness','Adventure and shared experiences'],
  ARRAY['Move closer to nature / the countryside','Focus on personal growth and self-discovery'],
  ARRAY['Climate and environment','Parenting challenges','Philosophy and meaning of life'],
  'Never acceptable', 'Occasional drinking fine', 'No restrictions', 'Love them — have some',
  'Robert Macfarlane — The Mountains of the Mind. Nan Shepherd — The Living Mountain. Mountains without Handrails.',
  '"Not all those who wander are lost." — Tolkien');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_vacation_alone, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_stefan, false, NULL, 'Probably not', 'Catholic', 'No — I am settled here', 'Self-employed / Freelancer', 'Long-term partnership without necessarily marrying', ARRAY['German','English','Italian'],
  'I am comfortable in my skin. My focus is elsewhere and I make no apology for that.',
  'Average / medium build', '176–180 cm', 'Moderately active — I move, but not consistently', 'Classic / timeless',
  ARRAY['Hiking / trekking','Cooking / baking','Photography','Reading','Wine / food exploration'],
  ARRAY['Rented villa or apartment','Countryside / nature retreat','City break (culture, food, architecture)'],
  ARRAY['Nature & the environment','Authenticity','Health & Wellbeing','Art & culture','Stability & predictability'],
  ARRAY['Companionship — simply enjoying each other''s company','Shared values and worldview','Deep trust and honesty','Physical affection and closeness','A quiet, stable everyday life'],
  ARRAY['Continue and deepen my current life','Own and restore a home or property'],
  ARRAY['History','Gardening and land','Wine and food culture'],
  'Acceptable if outdoors only', 'Regular drinking fine', 'No restrictions', 'Fine',
  'Hugh Johnson — A Life Uncorked. Jancis Robinson. The Oxford Companion to Wine. Terroir books.',
  '"Wine is bottled poetry." — Robert Louis Stevenson');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_vacation_alone, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_miriam, false, NULL, 'Definitely yes', 'Spiritual but not religious', 'Open to same city / region', 'Self-employed / Freelancer', 'Long-term partnership leading to marriage', ARRAY['German','English'],
  'I take reasonable care of myself. Health and appearance are priorities, though not above everything else.',
  'Slim', '161–165 cm', 'Regularly active — several times a week', 'Bohemian / artistic',
  ARRAY['Running','Reading','Gardening','Writing / journaling','Solo travel / day trip'],
  ARRAY['Countryside / nature retreat','Rented villa or apartment','Adventure / trekking holiday'],
  ARRAY['Nature & the environment','Personal growth & self-knowledge','Creativity & self-expression','Freedom & autonomy','Authenticity'],
  ARRAY['Deep trust and honesty','Emotional intimacy and vulnerability','Shared values and worldview','Adventure and shared experiences','Building something together (home, project, business, family)'],
  ARRAY['Build a new family','Move closer to nature / the countryside'],
  ARRAY['Climate and environment','Books and literature','Gardening and land'],
  'Never acceptable', 'Occasional drinking fine', 'Vegetarian', 'Love them — have some',
  'Robin Wall Kimmerer — Braiding Sweetgrass. Robert Macfarlane. Oliver Rackham. Landscape writing broadly.',
  '"In every walk with nature, one receives far more than he seeks." — Muir');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_vacation_alone, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_david, false, NULL, 'Open to it', 'Jewish', 'Open to anywhere in this country', 'Self-employed / Freelancer', 'Long-term partnership leading to marriage', ARRAY['German','English','French','Italian'],
  'I invest significantly in myself — fitness, nutrition, appearance. I know I look good and that matters to me.',
  'Slim', '176–180 cm', 'Regularly active — several times a week', 'Elegant / refined',
  ARRAY['Music — playing an instrument','Reading','Hiking / trekking','Theatre / opera / concert','Studying / online courses'],
  ARRAY['City break (culture, food, architecture)','Hotel (4-5 stars)','Cultural immersion (language, cooking school)'],
  ARRAY['Art & culture','Learning & intellectual development','Personal growth & self-knowledge','Creativity & self-expression','Spirituality & faith'],
  ARRAY['Intellectual stimulation — someone who challenges how I think','Emotional intimacy and vulnerability','Shared values and worldview','Deep trust and honesty','A rich, alive sexual connection'],
  ARRAY['Focus on personal growth and self-discovery','Deepen my spiritual or philosophical life'],
  ARRAY['Music','Philosophy and meaning of life','Books and literature'],
  'Never acceptable', 'Occasional drinking fine', 'No restrictions', 'Fine',
  'Thomas Mann — The Magic Mountain. Stefan Zweig. Leonard Bernstein lectures. Music theory.',
  '"Music gives a soul to the universe." — Plato');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_vacation_alone, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_anna, false, NULL, 'Definitely yes', 'Agnostic', 'Open to same city / region', 'Employed full-time', 'Long-term partnership leading to marriage', ARRAY['German','English'],
  'I take reasonable care of myself. Health and appearance are priorities, though not above everything else.',
  'Athletic and toned', '166–170 cm', 'Very active — training is a core part of my life', 'Sporty / athleisure',
  ARRAY['Climbing','Yoga / Pilates','Reading','Coding / tech projects','Running'],
  ARRAY['Adventure / trekking holiday','Camping','Backpacking'],
  ARRAY['Health & Wellbeing','Personal growth & self-knowledge','Freedom & autonomy','Learning & intellectual development','Adventure & new experience'],
  ARRAY['Intellectual stimulation — someone who challenges how I think','Physical affection and closeness','Adventure and shared experiences','Humour and lightness','Mutual respect for each other''s independence'],
  ARRAY['Build a new family','Travel extensively and freely'],
  ARRAY['Technology and digital transformation','Health and the body','Books and literature'],
  'Never acceptable', 'Occasional drinking fine', 'Flexitarian', 'Fine',
  'Douglas Hofstadter — Gödel, Escher, Bach. Neal Stephenson. Hacker News. Various tech newsletters.',
  '"The best way to predict the future is to invent it." — Kay');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_vacation_alone, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_tobias, true, 'Shared custody (occasionally)', 'Definitely no', 'Catholic', 'No — I am settled here', 'Self-employed / Freelancer', 'Long-term partnership without necessarily marrying', ARRAY['German','English','Italian'],
  'I am comfortable in my skin. My focus is elsewhere and I make no apology for that.',
  'Athletic and toned', '181–185 cm', 'Very active — training is a core part of my life', 'Sporty / athleisure',
  ARRAY['Hiking / trekking','Photography','Skiing / snowboarding','Meditation / prayer alone','Reading'],
  ARRAY['Adventure / trekking holiday','Camping','Glamping'],
  ARRAY['Nature & the environment','Health & Wellbeing','Freedom & autonomy','Authenticity','Solitude & inner peace'],
  ARRAY['Mutual respect for each other''s independence','Physical affection and closeness','Deep trust and honesty','Adventure and shared experiences','Companionship — simply enjoying each other''s company'],
  ARRAY['Move closer to nature / the countryside','Slow down and be more present'],
  ARRAY['Mountain biking / endurance sport','Philosophy and meaning of life','Climate and environment'],
  'Never acceptable', 'Occasional drinking fine', 'No restrictions', 'Fine',
  'Jon Krakauer — Into Thin Air. Reinhold Messner. Robert Macfarlane. Mountain photography books.',
  '"The mountains are calling and I must go." — Muir');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_vacation_alone, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_katrin, false, NULL, 'Probably not', 'Agnostic', 'No — I am settled here', 'Academic / Researcher', 'Long-term partnership without necessarily marrying', ARRAY['German','English'],
  'I take reasonable care of myself. Health and appearance are priorities, though not above everything else.',
  'Slim', '166–170 cm', 'Very active — training is a core part of my life', 'Smart casual',
  ARRAY['Yoga / Pilates','Reading','Swimming','Podcast / audiobooks','Studying / online courses'],
  ARRAY['Wellness / spa retreat','Countryside / nature retreat','Adventure / trekking holiday'],
  ARRAY['Nature & the environment','Learning & intellectual development','Health & Wellbeing','Contributing to something larger than myself','Freedom & autonomy'],
  ARRAY['Intellectual stimulation — someone who challenges how I think','Deep trust and honesty','Mutual respect for each other''s independence','Shared values and worldview','Companionship — simply enjoying each other''s company'],
  ARRAY['Focus on personal growth and self-discovery','Continue and deepen my current life'],
  ARRAY['Science and research','Climate and environment','Health and the body'],
  'Never acceptable', 'Occasional drinking fine', 'Flexitarian', 'Fine',
  'Rachel Carson — The Sea Around Us. Sylvia Earle. David Attenborough. Ocean science broadly.',
  '"We are as much ocean as we are land." — personal');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_vacation_alone, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_lukas, false, NULL, 'Open to it', 'Agnostic', 'Open to same city / region', 'Self-employed / Freelancer', 'Long-term partnership leading to marriage', ARRAY['German','English','Spanish'],
  'I take reasonable care of myself. Health and appearance are priorities, though not above everything else.',
  'Average / medium build', '181–185 cm', 'Moderately active — I move, but not consistently', 'Smart casual',
  ARRAY['Cycling','Photography','Reading','Writing / journaling','Cinema'],
  ARRAY['Road trip','City break (culture, food, architecture)','Backpacking'],
  ARRAY['Freedom & autonomy','Justice & fairness','Authenticity','Personal growth & self-knowledge','Contributing to something larger than myself'],
  ARRAY['Intellectual stimulation — someone who challenges how I think','Deep trust and honesty','Adventure and shared experiences','Humour and lightness','Emotional intimacy and vulnerability'],
  ARRAY['Write a book or create something lasting','Change career direction'],
  ARRAY['Geopolitical situation','Politics and society','Books and literature'],
  'Never acceptable', 'Regular drinking fine', 'Flexitarian', 'Fine',
  'Hannah Arendt — The Origins of Totalitarianism. Timothy Snyder. Sebastian Haffner. Long-form journalism.',
  '"The most radical act is still to think for yourself."');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_vacation_alone, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_sophie, false, NULL, 'Definitely yes', 'Spiritual but not religious', 'Open to same city / region', 'Student / Further education', 'Long-term partnership leading to marriage', ARRAY['German','English','French'],
  'I take reasonable care of myself. Health and appearance are priorities, though not above everything else.',
  'Slim', '161–165 cm', 'Regularly active — several times a week', 'Bohemian / artistic',
  ARRAY['Theatre / opera / concert','Reading','Yoga / Pilates','Writing / journaling','Hiking / trekking'],
  ARRAY['City break (culture, food, architecture)','Wellness / spa retreat','Rented villa or apartment'],
  ARRAY['Personal growth & self-knowledge','Creativity & self-expression','Authenticity','Community & belonging','Relationships'],
  ARRAY['Emotional intimacy and vulnerability','Deep trust and honesty','Intellectual stimulation — someone who challenges how I think','Physical affection and closeness','Humour and lightness'],
  ARRAY['Focus on personal growth and self-discovery','Build a new family'],
  ARRAY['Mental health','Relationships and love','Books and literature'],
  'Never acceptable', 'Occasional drinking fine', 'Vegetarian', 'Love them — have some',
  'Irvin Yalom. Esther Perel — Mating in Captivity. Attachment theory. Podcast: Where Should We Begin?',
  '"To love at all is to be vulnerable." — C.S. Lewis');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_vacation_alone, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_erik, false, NULL, 'Open to it', 'Agnostic', 'Open to same city / region', 'Employed full-time', 'Long-term partnership without necessarily marrying', ARRAY['German','English','Swedish'],
  'I am comfortable in my skin. My focus is elsewhere and I make no apology for that.',
  'Average / medium build', '186–190 cm', 'Moderately active — I move, but not consistently', 'Smart casual',
  ARRAY['Hiking / trekking','Music — playing an instrument','Cooking / baking','Reading','Board games / strategy games'],
  ARRAY['Countryside / nature retreat','Rented villa or apartment','Adventure / trekking holiday'],
  ARRAY['Stability & predictability','Health & Wellbeing','Family','Authenticity','Contributing to something larger than myself'],
  ARRAY['Deep trust and honesty','Companionship — simply enjoying each other''s company','Humour and lightness','Physical affection and closeness','A quiet, stable everyday life'],
  ARRAY['Own and restore a home or property','Continue and deepen my current life'],
  ARRAY['Engineering and design','Philosophy and meaning of life','Music'],
  'Never acceptable', 'Occasional drinking fine', 'No restrictions', 'Fine',
  'Robert Pirsig — Zen and the Art of Motorcycle Maintenance. Bill Bryson. Popular science broadly.',
  '"An engineer''s first problem is finding out what the problem is." — personal');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_vacation_alone, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_vera, false, NULL, 'Definitely no', 'Jewish', 'No — I am settled here', 'Employed full-time', 'Long-term partnership without necessarily marrying', ARRAY['German','English','French'],
  'I invest significantly in myself — fitness, nutrition, appearance. I know I look good and that matters to me.',
  'Slim', '166–170 cm', 'Moderately active — I move, but not consistently', 'Elegant / refined',
  ARRAY['Reading','Theatre / opera / concert','Museum / gallery','Gardening','Cooking / baking'],
  ARRAY['City break (culture, food, architecture)','Hotel (4-5 stars)','Rented villa or apartment'],
  ARRAY['Art & culture','Learning & intellectual development','Authenticity','Freedom & autonomy','Creativity & self-expression'],
  ARRAY['Intellectual stimulation — someone who challenges how I think','Deep trust and honesty','Emotional intimacy and vulnerability','Shared values and worldview','A quiet, stable everyday life'],
  ARRAY['Continue and deepen my current life','Write a book or create something lasting'],
  ARRAY['Books and literature','Art and creativity','History'],
  'Never acceptable', 'Regular drinking fine', 'No restrictions', 'Love them — have some',
  'W.G. Sebald. Marilynne Robinson — Gilead. Karl Ove Knausgård. The Paris Review. Books broadly.',
  '"A reader lives a thousand lives before he dies." — George R.R. Martin');

INSERT INTO questionnaires (profile_id, q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation, q_employment, q_desired_relationship, q_languages, q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style, q_saturday_alone, q_vacation_alone, q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers, q_smoking, q_alcohol, q_diet, q_pets, q_about_intellectual, q_quote_1)
VALUES (id_florian, false, NULL, 'Open to it', 'Catholic', 'No — I am settled here', 'Self-employed / Freelancer', 'Long-term partnership leading to marriage', ARRAY['German','English','Italian'],
  'I take reasonable care of myself. Health and appearance are priorities, though not above everything else.',
  'Athletic and toned', '181–185 cm', 'Regularly active — several times a week', 'Smart casual',
  ARRAY['Hiking / trekking','Cooking / baking','Gardening','Wine / food exploration','Foraging'],
  ARRAY['Countryside / nature retreat','Camping','Rented villa or apartment'],
  ARRAY['Nature & the environment','Health & Wellbeing','Authenticity','Community & belonging','Creativity & self-expression'],
  ARRAY['Shared values and worldview','Deep trust and honesty','Companionship — simply enjoying each other''s company','Physical affection and closeness','Building something together (home, project, business, family)'],
  ARRAY['Move closer to nature / the countryside','Build a new family'],
  ARRAY['Nutrition and biohacking','Gardening and land','Climate and environment'],
  'Never acceptable', 'Regular drinking fine', 'No restrictions', 'Love them — have some',
  'Michael Pollan — The Omnivore''s Dilemma. René Redzepi. Ferran Adrià. Slow food movement writing.',
  '"Tell me what you eat and I will tell you what you are." — Brillat-Savarin');

-- ── Observations ────────────────────────────────────────────────

INSERT INTO observations (observer_id, observed_id) VALUES
  (id_alex,    id_sara),
  (id_alex,    id_julia),
  (id_alex,    id_nina),
  (id_marco,   id_sara),
  (id_marco,   id_katrin),
  (id_lena,    id_alex),
  (id_lena,    id_david),
  (id_julia,   id_marco),
  (id_julia,   id_felix),
  (id_thomas,  id_sophie),
  (id_thomas,  id_miriam),
  (id_nina,    id_lukas),
  (id_nina,    id_felix),
  (id_felix,   id_miriam),
  (id_claire,  id_tobias),
  (id_claire,  id_stefan),
  (id_stefan,  id_claire),
  (id_miriam,  id_florian),
  (id_david,   id_vera),
  (id_anna,    id_lukas),
  (id_tobias,  id_katrin),
  (id_katrin,  id_thomas),
  (id_lukas,   id_anna),
  (id_sophie,  id_david),
  (id_erik,    id_miriam),
  (id_vera,    id_david),
  (id_florian, id_claire);

-- ── Flirt proposals ─────────────────────────────────────────────

INSERT INTO flirt_proposals (from_id, to_id, message, attempt, status) VALUES
  (id_alex,    id_sara,    'I loved your reading list — Jenny Offill is underrated. Coffee?', 1, 'accepted'),
  (id_marco,   id_julia,   'Your spatial design work is fascinating. Would love to exchange perspectives.', 1, 'pending'),
  (id_lena,    id_marco,   'I noticed we both think about geopolitics a lot. Rare.', 1, 'accepted'),
  (id_thomas,  id_sophie,  'I think about the same things you do — just from the other end of the hospital corridor.', 1, 'accepted'),
  (id_nina,    id_lukas,   'Sapolsky and long-form journalism in the same profile — I had to say something.', 1, 'pending'),
  (id_claire,  id_tobias,  'Nan Shepherd and Reinhold Messner. We might have the same bookshelves.', 1, 'pending'),
  (id_stefan,  id_vera,    'You mentioned Sebald. That''s enough.', 1, 'accepted'),
  (id_anna,    id_lukas,   'Hannah Arendt and cycling. I have questions.', 1, 'pending');

-- ── Flirts (accepted proposals → active chats) ──────────────────

INSERT INTO flirts (profile_1_id, profile_2_id)
VALUES (LEAST(id_alex, id_sara), GREATEST(id_alex, id_sara))
RETURNING id INTO id_flirt1;

INSERT INTO flirts (profile_1_id, profile_2_id)
VALUES (LEAST(id_lena, id_marco), GREATEST(id_lena, id_marco))
RETURNING id INTO id_flirt2;

INSERT INTO flirts (profile_1_id, profile_2_id)
VALUES (LEAST(id_thomas, id_sophie), GREATEST(id_thomas, id_sophie))
RETURNING id INTO id_flirt3;

-- Stefan ↔ Vera: accepted but no chat yet (intentional — shows empty state)
INSERT INTO flirts (profile_1_id, profile_2_id)
VALUES (LEAST(id_stefan, id_vera), GREATEST(id_stefan, id_vera));

-- ── Messages ────────────────────────────────────────────────────

INSERT INTO messages (flirt_id, sender_id, content, created_at) VALUES
  (id_flirt1, id_alex, 'Hey — glad you accepted. Your comment about Offill made me smile. Are you in Berlin this weekend?',    now() - interval '2 days'),
  (id_flirt1, id_sara, 'Yes! Though I''m at an opening Friday evening. Saturday afternoon could work — Mitte or Prenzlberg?', now() - interval '2 days' + interval '1 hour'),
  (id_flirt1, id_alex, 'Prenzlberg. There''s a place called Buchhandlung (it''s a bar, confusingly). Good coffee, good light.', now() - interval '1 day'),
  (id_flirt1, id_sara, 'A bookshop-bar. Perfect. Saturday at 15h then.',                                                       now() - interval '1 day' + interval '30 minutes'),
  (id_flirt2, id_lena,  'I''ve been reading Zeihan — your thoughts on the deglobalisation thesis?',                            now() - interval '3 days'),
  (id_flirt2, id_marco, 'Provocative but probably right directionally. The supply chain data is hard to argue with.',          now() - interval '3 days' + interval '2 hours'),
  (id_flirt2, id_lena,  'Also working through Tooze''s Crashed for historical context. Sobering combination.',                now() - interval '2 days'),
  (id_flirt2, id_marco, 'Tooze is essential. If you want to continue this properly — call or meet? Too good for a chat window.', now() - interval '1 day'),
  (id_flirt3, id_thomas, 'I read your quote about vulnerability. Strange coming from a surgeon but — I recognise it.',         now() - interval '1 day'),
  (id_flirt3, id_sophie, 'Not strange at all. The OR is one of the few places where uncertainty is honest.',                   now() - interval '1 day' + interval '3 hours'),
  (id_flirt3, id_thomas, 'That''s a more interesting observation than most things I''ve heard this year.',                    now() - interval '12 hours'),
  (id_flirt3, id_sophie, 'I''m full of them. You''ll have to meet me to find out.',                                           now() - interval '6 hours');

END $$;

-- ============================================================
-- AFTER RUNNING: create the storage bucket manually:
--   Supabase Dashboard → Storage → New bucket
--   Name: profile-photos  |  Public: ON
-- ============================================================
