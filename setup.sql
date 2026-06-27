-- ============================================================
-- AURA DATING PLATFORM — DATABASE SETUP
-- Paste into Supabase SQL Editor and click Run
-- ============================================================

-- 1. PROFILES TABLE
create table if not exists profiles (
  id           uuid primary key default gen_random_uuid(),
  username     text not null unique,
  password     text not null,
  name         text not null,
  age          integer not null,
  gender       text not null check (gender in ('man', 'woman', 'other')),
  looking_for  text not null check (looking_for in ('men', 'women', 'everyone')),
  location     text not null,
  occupation   text,
  bio          text,
  interests    text[] default '{}',
  photo_url    text,
  status       text not null default 'active' check (status in ('active', 'suspended')),
  created_at   timestamptz default now()
);

-- 2. PROFILE PHOTOS TABLE
create table if not exists profile_photos (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid references profiles(id) on delete cascade,
  photo_url   text not null,
  is_primary  boolean default false,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

-- 3. LIKES TABLE
create table if not exists likes (
  id          uuid primary key default gen_random_uuid(),
  from_id     uuid references profiles(id) on delete cascade,
  to_id       uuid references profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(from_id, to_id)
);

-- 4. MATCHES TABLE
create table if not exists matches (
  id            uuid primary key default gen_random_uuid(),
  profile_1_id  uuid references profiles(id) on delete cascade,
  profile_2_id  uuid references profiles(id) on delete cascade,
  created_at    timestamptz default now(),
  unique(profile_1_id, profile_2_id)
);

-- 5. MESSAGES TABLE
create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid references matches(id) on delete cascade,
  sender_id   uuid references profiles(id) on delete cascade,
  content     text not null,
  created_at  timestamptz default now()
);

-- 6. AUTO-MATCH TRIGGER
create or replace function create_match_if_mutual()
returns trigger as $$
begin
  if exists (
    select 1 from likes
    where from_id = new.to_id and to_id = new.from_id
  ) then
    insert into matches (profile_1_id, profile_2_id)
    values (least(new.from_id, new.to_id), greatest(new.from_id, new.to_id))
    on conflict do nothing;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_like_created
after insert on likes
for each row execute function create_match_if_mutual();

-- 7. ENABLE ROW LEVEL SECURITY
alter table profiles       enable row level security;
alter table profile_photos enable row level security;
alter table likes          enable row level security;
alter table matches        enable row level security;
alter table messages       enable row level security;

-- 8. PERMISSIVE POLICIES (PoC — open access via anon key)
create policy "anon_all_profiles"       on profiles       for all to anon using (true) with check (true);
create policy "anon_all_profile_photos" on profile_photos for all to anon using (true) with check (true);
create policy "anon_all_likes"          on likes          for all to anon using (true) with check (true);
create policy "anon_all_matches"        on matches        for all to anon using (true) with check (true);
create policy "anon_all_messages"       on messages       for all to anon using (true) with check (true);

-- 9. SEED PROFILES (10 demo accounts)
insert into profiles (username, password, name, age, gender, looking_for, location, occupation, bio, interests, photo_url) values
  ('alex',  'sun42', 'Alexander M.', 28, 'man',   'women',   'Berlin',      'Architect',
   'I design spaces during the day and explore them at night. Passionate about Bauhaus, good wine, and honest conversations over a slow dinner.',
   array['Architecture','Contemporary Art','Wine','Jazz','Photography','Hiking'],
   'https://randomuser.me/api/portraits/men/1.jpg'),

  ('sara',  'wave7', 'Sara K.',      25, 'woman', 'men',     'Munich',      'Art Curator',
   'Searching for someone who can match my enthusiasm for modern art and slow Sunday mornings at the farmers market. Beauty is in the details.',
   array['Contemporary Art','Yoga','Literature','Film','Gastronomy','Travel'],
   'https://randomuser.me/api/portraits/women/1.jpg'),

  ('lena',  'mint3', 'Lena B.',      31, 'woman', 'men',     'Hamburg',     'Journalist',
   'I write about cities and the people who shape them. Fluent in three languages. Looking for wit, warmth, and the kind of adventure that starts with a good map.',
   array['Writing','Urban Culture','Sailing','Tennis','Classical Music','Philosophy'],
   'https://randomuser.me/api/portraits/women/2.jpg'),

  ('marco', 'fire9', 'Marco F.',     29, 'man',   'women',   'Cologne',     'Film Director',
   'Telling stories through a lens. When not on set you will find me at a rooftop bar or discovering new vinyl in the back of a record shop.',
   array['Cinema','Vinyl','Travel','Gastronomy','Photography','Architecture'],
   'https://randomuser.me/api/portraits/men/2.jpg'),

  ('julia', 'sky11', 'Julia W.',     27, 'woman', 'men',     'Frankfurt',   'Investment Analyst',
   'Numbers by day, poetry by night. I believe the best conversations happen over a second bottle of Burgundy and a long walk home.',
   array['Finance','Poetry','Skiing','Yoga','Wine','Jazz'],
   'https://randomuser.me/api/portraits/women/3.jpg'),

  ('tom',   'rain5', 'Thomas A.',    33, 'man',   'women',   'Stuttgart',   'Surgeon',
   'Medicine is my craft, but music is my language. Passionate about string quartets, trail running through the Black Forest, and Italian cuisine.',
   array['Classical Music','Running','Gastronomy','Literature','Travel','Art'],
   'https://randomuser.me/api/portraits/men/3.jpg'),

  ('nina',  'rose2', 'Nina V.',      26, 'woman', 'men',     'Düsseldorf',  'Fashion Designer',
   'I create garments that tell stories. Searching for a partner who appreciates craft, beauty, and the kind of details most people walk past.',
   array['Fashion','Art','Design','Photography','Ballet','Travel'],
   'https://randomuser.me/api/portraits/women/4.jpg'),

  ('felix', 'moon8', 'Felix R.',     30, 'man',   'women',   'Leipzig',     'Jazz Musician',
   'Life is an improvisation. I play piano, collect first-edition books, and make a risotto that has been described as life-changing. Let us create something unexpected.',
   array['Jazz','Literature','Cooking','Cycling','Philosophy','Film Noir'],
   'https://randomuser.me/api/portraits/men/4.jpg'),

  ('mia',   'star4', 'Mia C.',       24, 'woman', 'everyone','Dresden',     'Sommelier',
   'I speak the language of terroir and can identify a grape by its whisper. Looking for someone curious, unhurried, and unafraid of a good conversation.',
   array['Wine','Gastronomy','Art','Philosophy','Yoga','Travel'],
   'https://randomuser.me/api/portraits/women/5.jpg'),

  ('david', 'blue6', 'David L.',     35, 'man',   'women',   'Nuremberg',   'Entrepreneur',
   'I build companies but my real passion is sailing the Adriatic and collecting contemporary photography. Substance always over style.',
   array['Sailing','Photography','Entrepreneurship','Architecture','Wine','Skiing'],
   'https://randomuser.me/api/portraits/men/5.jpg');

-- 10. SEED LIKES + MATCHES + MESSAGES
do $$
declare
  alex_id  uuid; sara_id  uuid; lena_id  uuid; marco_id uuid;
  julia_id uuid; tom_id   uuid; nina_id  uuid; felix_id uuid;
  mia_id   uuid; david_id uuid;
  m_alex_sara   uuid; m_marco_lena  uuid; m_tom_julia   uuid;
  m_felix_mia   uuid; m_david_nina  uuid;
begin
  select id into alex_id  from profiles where username = 'alex';
  select id into sara_id  from profiles where username = 'sara';
  select id into lena_id  from profiles where username = 'lena';
  select id into marco_id from profiles where username = 'marco';
  select id into julia_id from profiles where username = 'julia';
  select id into tom_id   from profiles where username = 'tom';
  select id into nina_id  from profiles where username = 'nina';
  select id into felix_id from profiles where username = 'felix';
  select id into mia_id   from profiles where username = 'mia';
  select id into david_id from profiles where username = 'david';

  -- Mutual likes (trigger will auto-create matches)
  insert into likes (from_id, to_id) values (alex_id,  sara_id);
  insert into likes (from_id, to_id) values (sara_id,  alex_id);

  insert into likes (from_id, to_id) values (marco_id, lena_id);
  insert into likes (from_id, to_id) values (lena_id,  marco_id);

  insert into likes (from_id, to_id) values (tom_id,   julia_id);
  insert into likes (from_id, to_id) values (julia_id, tom_id);

  insert into likes (from_id, to_id) values (felix_id, mia_id);
  insert into likes (from_id, to_id) values (mia_id,   felix_id);

  insert into likes (from_id, to_id) values (david_id, nina_id);
  insert into likes (from_id, to_id) values (nina_id,  david_id);

  -- One-way likes (no match yet — good for demo)
  insert into likes (from_id, to_id) values (alex_id,  lena_id);
  insert into likes (from_id, to_id) values (alex_id,  julia_id);
  insert into likes (from_id, to_id) values (marco_id, julia_id);
  insert into likes (from_id, to_id) values (tom_id,   nina_id);
  insert into likes (from_id, to_id) values (felix_id, sara_id);
  insert into likes (from_id, to_id) values (david_id, lena_id);

  -- Fetch match IDs
  select id into m_alex_sara  from matches where profile_1_id = least(alex_id, sara_id)   and profile_2_id = greatest(alex_id, sara_id);
  select id into m_marco_lena from matches where profile_1_id = least(marco_id, lena_id)  and profile_2_id = greatest(marco_id, lena_id);
  select id into m_tom_julia  from matches where profile_1_id = least(tom_id, julia_id)   and profile_2_id = greatest(tom_id, julia_id);
  select id into m_felix_mia  from matches where profile_1_id = least(felix_id, mia_id)   and profile_2_id = greatest(felix_id, mia_id);
  select id into m_david_nina from matches where profile_1_id = least(david_id, nina_id)  and profile_2_id = greatest(david_id, nina_id);

  -- Seed messages: Alex & Sara
  insert into messages (match_id, sender_id, content, created_at) values
    (m_alex_sara, alex_id,  'Hello Sara. I came across your profile and was immediately drawn to your work in contemporary art. Are you currently curating anything?',
     now() - interval '2 days'),
    (m_alex_sara, sara_id,  'Alexander, what a lovely introduction. I am opening a group show next month — five artists exploring materiality and memory. Would love to tell you more over coffee.',
     now() - interval '2 days' + interval '1 hour'),
    (m_alex_sara, alex_id,  'I would be honoured to hear about it. Thursday afternoon — I know a quiet place in Mitte?',
     now() - interval '1 day'),
    (m_alex_sara, sara_id,  'Thursday works perfectly. I shall look forward to it.',
     now() - interval '20 hours');

  -- Seed messages: Marco & Lena
  insert into messages (match_id, sender_id, content, created_at) values
    (m_marco_lena, marco_id, 'Lena — your piece on urban transformation in Hamburg was extraordinary. The way you captured the tension between preservation and progress was quite masterful.',
     now() - interval '5 days'),
    (m_marco_lena, lena_id,  'Marco, that is incredibly kind. I spent three months embedded in the Hafencity for that piece. Are you working on something that touches those themes?',
     now() - interval '4 days'),
    (m_marco_lena, marco_id, 'My next documentary is set entirely in post-reunification Berlin. Architecture as autobiography. I think you would find it interesting.',
     now() - interval '3 days'),
    (m_marco_lena, lena_id,  'I would love to hear more. I am in Cologne next week — dinner?',
     now() - interval '2 days');

  -- Seed messages: Felix & Mia
  insert into messages (match_id, sender_id, content, created_at) values
    (m_felix_mia, mia_id,   'Felix — a jazz musician who reads and cooks. You might be a rare species.',
     now() - interval '1 day'),
    (m_felix_mia, felix_id, 'Rarer still, I have been told. Though I suspect a sommelier who studied philosophy is equally uncommon. What is your current obsession — the wine or the ideas?',
     now() - interval '23 hours'),
    (m_felix_mia, mia_id,   'At the moment, a Côte-Rôtie that tastes like a Coltrane solo. Come to the wine bar on Saturday and I shall pour you a glass.',
     now() - interval '22 hours');
end $$;
