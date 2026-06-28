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

-- ── Row Level Security (permissive for PoC) ──────────────────
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_photos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires   ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE flirt_proposals  ENABLE ROW LEVEL SECURITY;
ALTER TABLE flirts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_profiles"        ON profiles         FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_photos"          ON profile_photos   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_questionnaires"  ON questionnaires   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_observations"    ON observations     FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_proposals"       ON flirt_proposals  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_flirts"          ON flirts           FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_messages"        ON messages         FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- SEED DATA
-- ============================================================
DO $$
DECLARE
  id_alex   UUID;
  id_sara   UUID;
  id_lena   UUID;
  id_marco  UUID;
  id_julia  UUID;
  id_flirt1 UUID;
  id_flirt2 UUID;
BEGIN

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

INSERT INTO profile_photos (profile_id, photo_url, is_primary, sort_order) VALUES
  (id_alex,  'https://randomuser.me/api/portraits/men/32.jpg',   true, 0),
  (id_sara,  'https://randomuser.me/api/portraits/women/44.jpg', true, 0),
  (id_lena,  'https://randomuser.me/api/portraits/women/68.jpg', true, 0),
  (id_marco, 'https://randomuser.me/api/portraits/men/75.jpg',   true, 0),
  (id_julia, 'https://randomuser.me/api/portraits/women/90.jpg', true, 0);

INSERT INTO questionnaires (
  profile_id,
  q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation,
  q_employment, q_desired_relationship, q_languages,
  q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style,
  q_saturday_alone, q_vacation_alone,
  q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers,
  q_smoking, q_alcohol, q_diet, q_pets,
  q_about_intellectual, q_quote_1
) VALUES (
  id_alex,
  false, NULL, 'Open to it', 'Agnostic', 'Open to same city / region',
  'Business owner / Entrepreneur', 'Long-term partnership leading to marriage', ARRAY['German','English'],
  'I take reasonable care of myself. Health and appearance are priorities, though not above everything else.',
  'Athletic and toned', '181–185 cm', 'Regularly active — several times a week', 'Smart casual',
  ARRAY['Trail running','Cooking / baking','Reading','Podcast / audiobooks','Gym / weight training'],
  ARRAY['City break (culture, food, architecture)','Countryside / nature retreat','Hotel (4-5 stars)'],
  ARRAY['Personal growth & self-knowledge','Health & Wellbeing','Career & professional achievement','Freedom & autonomy','Learning & intellectual development'],
  ARRAY['Intellectual stimulation — someone who challenges how I think','Deep trust and honesty','Companionship — simply enjoying each other''s company','Shared values and worldview','Humour and lightness'],
  ARRAY['Build or grow a business','Focus on personal growth and self-discovery'],
  ARRAY['AI and what it means for society','Starting or growing a business','Books and literature'],
  'Never acceptable', 'Occasional drinking fine', 'No restrictions', 'Fine',
  'Thinking Fast and Slow — Kahneman. Sapiens — Harari. Lex Fridman podcast. Tim Ferriss. The Diary of a CEO.',
  '"The obstacle is the way." — Marcus Aurelius'
);

INSERT INTO questionnaires (
  profile_id,
  q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation,
  q_employment, q_desired_relationship, q_languages,
  q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style,
  q_saturday_alone, q_vacation_alone,
  q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers,
  q_smoking, q_alcohol, q_diet, q_pets,
  q_about_intellectual, q_quote_1
) VALUES (
  id_sara,
  false, NULL, 'Probably not', 'Spiritual but not religious', 'No — I am settled here',
  'Employed full-time', 'Long-term partnership without necessarily marrying', ARRAY['German','English','French'],
  'I invest significantly in myself — fitness, nutrition, appearance. I know I look good and that matters to me.',
  'Slim', '166–170 cm', 'Regularly active — several times a week', 'Elegant / refined',
  ARRAY['Reading','Museum / gallery','Yoga / Pilates','Cooking / baking','Theatre / opera / concert'],
  ARRAY['City break (culture, food, architecture)','Rented villa or apartment','Wellness / spa retreat'],
  ARRAY['Art & culture','Creativity & self-expression','Personal growth & self-knowledge','Authenticity','Freedom & autonomy'],
  ARRAY['Intellectual stimulation — someone who challenges how I think','Emotional intimacy and vulnerability','Shared values and worldview','Humour and lightness','A quiet, stable everyday life'],
  ARRAY['Focus on personal growth and self-discovery','Own and restore a home or property'],
  ARRAY['Art and creativity','Books and literature','Mental health'],
  'Never acceptable', 'Occasional drinking fine', 'Vegetarian', 'Love them — have some',
  'Jenny Offill — Dept. of Speculation. Rachel Cusk — Outline trilogy. On Being podcast. The New Yorker Fiction.',
  '"In the middle of difficulty lies opportunity." — Einstein'
);

INSERT INTO questionnaires (
  profile_id,
  q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation,
  q_employment, q_desired_relationship, q_languages,
  q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style,
  q_saturday_alone, q_saturday_kids, q_vacation_alone, q_vacation_kids,
  q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers,
  q_smoking, q_alcohol, q_diet, q_pets,
  q_about_intellectual, q_quote_1
) VALUES (
  id_lena,
  true, 'Shared custody (roughly half the time)', 'Definitely no', 'Catholic', 'Open to same city / region',
  'Academic / Researcher', 'Long-term partnership leading to marriage', ARRAY['German','English'],
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
  'Bessel van der Kolk — The Body Keeps the Score. Gabor Maté — In the Realm of Hungry Ghosts. Johann Hari — Lost Connections.',
  '"It takes a village to raise a child." — African proverb'
);

INSERT INTO questionnaires (
  profile_id,
  q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation,
  q_employment, q_desired_relationship, q_languages,
  q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style,
  q_saturday_alone, q_vacation_alone,
  q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers,
  q_smoking, q_alcohol, q_diet, q_pets,
  q_about_intellectual, q_quote_1
) VALUES (
  id_marco,
  true, 'Shared custody (occasionally)', 'Definitely no', 'Agnostic', 'Open to anywhere in this country',
  'Employed full-time', 'Long-term partnership without necessarily marrying', ARRAY['German','English','Italian'],
  'I am comfortable in my skin. My focus is elsewhere and I make no apology for that.',
  'Stocky / broad', '176–180 cm', 'Regularly active — several times a week', 'Smart casual',
  ARRAY['Cycling','Podcast / audiobooks','Reading','DIY / home projects','Cooking / baking'],
  ARRAY['City break (culture, food, architecture)','Road trip','Hotel (2-3 stars)'],
  ARRAY['Financial security','Career & professional achievement','Freedom & autonomy','Health & Wellbeing','Existing Children'],
  ARRAY['Companionship — simply enjoying each other''s company','Mutual respect for each other''s independence','Deep trust and honesty','Humour and lightness','Financial alignment and shared goals'],
  ARRAY['Achieve financial independence','Travel extensively and freely'],
  ARRAY['Geopolitical situation','Finances and economic uncertainty','AI and what it means for society'],
  'Acceptable if outdoors only', 'Regular drinking fine', 'No restrictions', 'Prefer a home without them',
  'Ray Dalio — Principles. Peter Zeihan — The End of the World Is Just the Beginning. Acquired podcast. Stratechery.',
  '"First, do no harm." — Hippocratic oath'
);

INSERT INTO questionnaires (
  profile_id,
  q_existing_kids, q_kids_living_with, q_wish_kids, q_religion, q_relocation,
  q_employment, q_desired_relationship, q_languages,
  q_appearance_attitude, q_body_type, q_height, q_fitness_level, q_personal_style,
  q_saturday_alone, q_vacation_alone,
  q_values, q_partnership_priorities, q_life_vision, q_mind_occupiers,
  q_smoking, q_alcohol, q_diet, q_pets,
  q_about_intellectual, q_quote_1
) VALUES (
  id_julia,
  false, NULL, 'Open to it', 'Spiritual but not religious', 'Open to another country',
  'Employed full-time', 'Long-term partnership leading to marriage', ARRAY['German','English','Spanish'],
  'I invest significantly in myself — fitness, nutrition, appearance. I know I look good and that matters to me.',
  'Slim', '171–175 cm', 'Regularly active — several times a week', 'Elegant / refined',
  ARRAY['Museum / gallery','Theatre / opera / concert','Travelling','Wine / food exploration','Cycling'],
  ARRAY['City break (culture, food, architecture)','Hotel (4-5 stars)','Cultural immersion (language, cooking school)'],
  ARRAY['Creativity & self-expression','Art & culture','Personal growth & self-knowledge','Travel & exploration','Authenticity'],
  ARRAY['Intellectual stimulation — someone who challenges how I think','Adventure and shared experiences','Emotional intimacy and vulnerability','Shared values and worldview','Building something together (home, project, business, family)'],
  ARRAY['Live abroad','Build or grow a business'],
  ARRAY['Architecture and design','Art and creativity','Travel and exploration'],
  'Never acceptable', 'Occasional drinking fine', 'Flexitarian', 'Fine',
  'Rem Koolhaas — S,M,L,XL. Alain de Botton — The Architecture of Happiness. 99% Invisible podcast. Dezeen.',
  '"Less is more." — Mies van der Rohe'
);

INSERT INTO observations (observer_id, observed_id) VALUES
  (id_alex,  id_sara),
  (id_alex,  id_julia),
  (id_marco, id_sara),
  (id_lena,  id_alex),
  (id_julia, id_marco);

INSERT INTO flirt_proposals (from_id, to_id, message, attempt, status) VALUES
  (id_alex,  id_sara,  'I loved your reading list — Jenny Offill is underrated. Coffee?', 1, 'accepted'),
  (id_marco, id_julia, 'Your spatial design work is fascinating. Would love to exchange perspectives.', 1, 'pending'),
  (id_lena,  id_marco, 'I noticed we both think about geopolitics a lot. Rare.', 1, 'accepted');

INSERT INTO flirts (profile_1_id, profile_2_id)
VALUES (LEAST(id_alex, id_sara), GREATEST(id_alex, id_sara))
RETURNING id INTO id_flirt1;

INSERT INTO flirts (profile_1_id, profile_2_id)
VALUES (LEAST(id_lena, id_marco), GREATEST(id_lena, id_marco))
RETURNING id INTO id_flirt2;

INSERT INTO messages (flirt_id, sender_id, content, created_at) VALUES
  (id_flirt1, id_alex, 'Hey — glad you accepted. Your comment about Offill made me smile. Are you in Berlin this weekend?',    now() - interval '2 days'),
  (id_flirt1, id_sara, 'Yes! Though I''m at an opening Friday evening. Saturday afternoon could work — Mitte or Prenzlberg?', now() - interval '2 days' + interval '1 hour'),
  (id_flirt1, id_alex, 'Prenzlberg. There''s a place called Buchhandlung (it''s a bar, confusingly). Good coffee, good light.', now() - interval '1 day'),
  (id_flirt1, id_sara, 'A bookshop-bar. Perfect. Saturday at 15h then.',                                                       now() - interval '1 day' + interval '30 minutes'),
  (id_flirt2, id_lena,  'I''ve been reading Zeihan — your thoughts on the deglobalisation thesis?',                            now() - interval '3 days'),
  (id_flirt2, id_marco, 'Provocative but probably right directionally. The supply chain data is hard to argue with.',          now() - interval '3 days' + interval '2 hours'),
  (id_flirt2, id_lena,  'Also working through Tooze''s Crashed for historical context. Sobering combination.',                now() - interval '2 days'),
  (id_flirt2, id_marco, 'Tooze is essential. If you want to continue this properly — call or meet? Too good for a chat window.', now() - interval '1 day');

END $$;

-- ============================================================
-- AFTER RUNNING: create the storage bucket manually:
--   Supabase Dashboard → Storage → New bucket
--   Name: profile-photos  |  Public: ON
-- ============================================================
