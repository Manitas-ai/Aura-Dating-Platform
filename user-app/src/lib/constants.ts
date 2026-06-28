// ── DACH Regions ─────────────────────────────────────────────

export const DACH_REGIONS = [
  // Germany
  'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen',
  'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen',
  'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
  'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen',
  // Austria
  'Burgenland', 'Kärnten', 'Niederösterreich', 'Oberösterreich',
  'Salzburg', 'Steiermark', 'Tirol', 'Vorarlberg', 'Wien',
  // Switzerland
  'Zürich', 'Bern', 'Basel', 'Ostschweiz', 'Zentralschweiz',
  'Westschweiz (Romandie)', 'Tessin', 'Graubünden',
]

export const AGE_GROUPS = [
  '18–24', '25–29', '30–34', '35–39', '40–44',
  '45–49', '50–54', '55–59', '60–65', '65+',
]

// ── Questionnaire options ─────────────────────────────────────

export const Q_KIDS_LIVING_WITH = [
  'Full-time',
  'Shared custody (roughly half the time)',
  'Shared custody (most of the time)',
  'Shared custody (occasionally)',
]

export const Q_WISH_KIDS = [
  'Definitely yes', 'Open to it', 'Undecided', 'Probably not', 'Definitely no',
]

export const Q_RELIGION = [
  'Agnostic', 'Atheist', 'Buddhist', 'Catholic', 'Christian (Protestant)',
  'Eastern Orthodox', 'Hindu', 'Jewish', 'Muslim',
  'Spiritual but not religious', 'Taoist / Zen', 'Other', 'Prefer not to say',
]

export const Q_RELOCATION = [
  'No — I am settled here',
  'Open to same city / region',
  'Open to anywhere in this country',
  'Open to relocating abroad',
  'Already have ideas to relocate',
]

export const Q_EMPLOYMENT = [
  'Employed full-time', 'Employed part-time', 'Self-employed / Freelancer',
  'Business owner / Entrepreneur', 'Academic / Researcher', 'On parental leave',
  'Career break / Sabbatical', 'Student / Further education', 'Retired',
  'Other', 'Prefer not to say',
]

export const Q_DESIRED_RELATIONSHIP = [
  'Long-term partnership leading to marriage',
  'Long-term partnership without necessarily marrying',
  'Primarily companionship / deep friendship with romantic dimension',
  'Casual — seeing what develops',
  'Not sure yet',
]

export const Q_LANGUAGES = [
  'German', 'English', 'French', 'Spanish', 'Italian', 'Portuguese',
  'Dutch', 'Polish', 'Russian', 'Turkish', 'Arabic', 'Mandarin',
  'Japanese', 'Hindi', 'Other',
]

export const Q_APPEARANCE_ATTITUDE = [
  'I invest significantly in myself — fitness, nutrition, appearance. I know I look good and that matters to me.',
  'I take reasonable care of myself. Health and appearance are priorities, though not above everything else.',
  'I have been less disciplined than I would like recently — life got in the way. I am working on it.',
  'I am comfortable in my skin. My focus is elsewhere and I make no apology for that.',
  'The whole concept feels irrelevant to me. I am operating on a different plane entirely.',
]

export const Q_BODY_TYPE = [
  'Very slim', 'Slim', 'Athletic and toned', 'Average / medium build',
  'Curvy', 'Full-figured', 'Stocky / broad', 'Heavyset',
  'Changes with the seasons — let\'s be honest',
]

export const Q_HEIGHT = [
  'Under 155 cm', '155–160 cm', '161–165 cm', '166–170 cm', '171–175 cm',
  '176–180 cm', '181–185 cm', '186–190 cm', 'Over 190 cm',
]

export const Q_FITNESS_LEVEL = [
  'Very active — training is a core part of my life',
  'Regularly active — several times a week',
  'Moderately active — I move, but not consistently',
  'Mostly sedentary — working on changing this',
  'Not a priority for me right now',
]

export const Q_PERSONAL_STYLE = [
  'Classic / timeless', 'Smart casual', 'Business professional',
  'Sporty / athleisure', 'Elegant / refined', 'Bohemian / artistic',
  'Eclectic and hard to label', 'Minimal / understated',
  'Changes depending on mood and situation',
]

export const Q_SATURDAY_ALONE = [
  'Hiking / trekking', 'Running', 'Cycling', 'Swimming', 'Gym / weight training',
  'Yoga / Pilates', 'Team sport', 'Martial arts', 'Climbing', 'Water sports',
  'Skiing / snowboarding', 'Reading', 'Writing / journaling', 'Studying / online courses',
  'Language learning', 'Coding / tech projects', 'Painting / drawing', 'Photography',
  'Music — playing an instrument', 'Singing / choir', 'Crafts / making things',
  'DIY / home projects', 'Gardening', 'Cooking / baking', 'Wine / food exploration',
  'Museum / gallery', 'Theatre / opera / concert', 'Cinema', 'Watching a favourite series',
  'Podcast / audiobooks', 'Board games / strategy games', 'Gaming (video)',
  'Volunteering / community work', 'Church / spiritual gathering', 'Meditation / prayer alone',
  'Spa / wellness / sauna', 'Shopping', 'Visiting a market / flea market', 'Friends',
  'Family', 'Solo travel / day trip', 'Sightseeing', 'Doing nothing — deliberately', 'Other',
]

export const Q_SATURDAY_KIDS = [
  'Amusement park / theme park', 'Zoo', 'Aquarium', 'Science museum / discovery centre',
  'Nature walk / forest', 'Hiking', 'Cycling together', 'Swimming / water park',
  'Sports — watching or playing', 'Creative workshop (art, pottery, cooking)',
  'Reading together', 'Board games / family games', 'Cinema', 'Movie at home',
  'Cooking / baking together', 'Visiting grandparents / family', 'Day trip / mini adventure',
  'Beach / lake', 'Playground / park', 'Gardening together', 'DIY project at home',
  'Spiritual gathering as a family', 'Travelling', 'Camping', 'Other',
]

export const Q_VACATION_ALONE = [
  'Adventure / trekking holiday', 'City break (culture, food, architecture)',
  'Beach / sun holiday', 'Countryside / nature retreat', 'Road trip', 'Backpacking',
  'Budget hotel / hostel', 'Hotel (2-3 stars)', 'Hotel (4-5 stars)',
  'Rented villa or apartment', 'Camping', 'Glamping', 'Cruise', 'Wellness / spa retreat',
  'Cultural immersion (language, cooking school)', 'Volunteer / meaningful travel',
  'Whatever is cheapest that works', 'I rarely travel alone',
]

export const Q_VACATION_KIDS = [
  'Adventure family holiday', 'Beach resort', 'Countryside / farm stay',
  'City break (family-friendly)', 'Road trip', 'Camping', 'Glamping',
  'Rented house / apartment', 'Holiday club / all-inclusive', 'Cruise',
  'Nature / national park', 'Theme park holiday', 'Cultural trip',
  'Visiting family abroad', 'Depends entirely on the children\'s ages and wishes',
  'Adventure / trekking holiday', 'Hotel (2-3 stars)', 'Hotel (4-5 stars)',
]

export const Q_VALUES = [
  'Existing Family', 'Existing Children', 'Career & professional achievement',
  'Financial security', 'Freedom & autonomy', 'Health & Wellbeing',
  'Personal growth & self-knowledge', 'Creativity & self-expression',
  'Learning & intellectual development', 'Nature & the environment',
  'Spirituality & faith', 'Community & belonging', 'Justice & fairness',
  'Authenticity', 'Stability & predictability', 'Adventure & new experience',
  'Solitude & inner peace', 'Art & culture', 'Contributing to something larger than myself',
  'Travel & exploration', 'Sport & physical performance', 'Wellness', 'Other',
]

export const Q_PARTNERSHIP_PRIORITIES = [
  'Deep trust and honesty', 'Emotional intimacy and vulnerability',
  'A rich, alive sexual connection',
  'Intellectual stimulation — someone who challenges how I think',
  'Companionship — simply enjoying each other\'s company',
  'Shared values and worldview', 'Mutual respect for each other\'s independence',
  'Humour and lightness', 'Building something together (home, project, business, family)',
  'Shared spiritual or philosophical life', 'Support during difficulty and crisis',
  'Shared parenting — co-raising children well', 'Financial alignment and shared goals',
  'Physical affection and closeness', 'Adventure and shared experiences',
  'A quiet, stable everyday life', 'Everything — I want the whole person',
  'The children come first — everything else follows',
  'I am honestly still figuring this out',
]

export const Q_LIFE_VISION = [
  'Build a new family', 'Be the best possible parent to my existing children',
  'Travel extensively and freely', 'Live abroad', 'Move closer to nature / the countryside',
  'Own and restore a home or property', 'Build or grow a business',
  'Achieve financial independence', 'Change career direction',
  'Write a book or create something lasting', 'Focus on personal growth and self-discovery',
  'Deepen my spiritual or philosophical life', 'Care for aging parents',
  'Slow down and be more present', 'Continue and deepen my current life',
  'I genuinely do not know — and that is fine', 'Other',
]

export const Q_MIND_OCCUPIERS = [
  'Raising children', 'AI and what it means for society', 'Starting or growing a business',
  'Career transition', 'Finances and economic uncertainty', 'Geopolitical situation',
  'Climate and environment', 'Health and the body', 'Mental health',
  'Relationships and love', 'Loneliness', 'Philosophy and meaning of life',
  'History', 'Science and research', 'Technology and digital transformation',
  'Books and literature', 'Music', 'Photography', 'Architecture and design',
  'Art and creativity', 'Spirituality and faith', 'Parenting challenges',
  'Writing', 'Mountain biking / endurance sport', 'Gardening and land',
  'Nutrition and biohacking', 'Politics and society', 'Social justice',
  'Travel and exploration', 'The future in general',
]

export const Q_SMOKING = [
  'Never acceptable', 'Acceptable if outdoors only', 'Fine', 'I smoke myself',
]

export const Q_ALCOHOL = [
  'Teetotal preferred', 'Occasional drinking fine', 'Regular drinking fine', 'I drink regularly',
]

export const Q_DIET = [
  'Vegan', 'Vegetarian', 'Flexitarian', 'No restrictions', 'Halal', 'Kosher', 'Other',
]

export const Q_PETS = [
  'Love them — have some', 'Fine', 'Prefer a home without them', 'Allergic',
]
