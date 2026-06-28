// ── Core entities ─────────────────────────────────────────────

export interface Profile {
  id:          string
  username:    string
  password:    string
  age_group:   string | null
  gender:      string | null
  looking_for: string | null
  region:      string | null
  about_me:    string | null
  interests:   string[]
  photo_url:   string | null
  status:      'active' | 'suspended'
  created_at:  string
}

export interface Questionnaire {
  profile_id:               string

  q_existing_kids:          boolean | null
  q_kids_living_with:       string | null
  q_wish_kids:              string | null
  q_religion:               string | null
  q_relocation:             string | null
  q_employment:             string | null
  q_desired_relationship:   string | null
  q_languages:              string[]

  q_appearance_attitude:    string | null
  q_body_type:              string | null
  q_height:                 string | null
  q_fitness_level:          string | null
  q_personal_style:         string | null

  q_saturday_alone:         string[]
  q_saturday_kids:          string[]
  q_vacation_alone:         string[]
  q_vacation_kids:          string[]

  q_values:                 string[]
  q_partnership_priorities: string[]
  q_life_vision:            string[]
  q_mind_occupiers:         string[]

  q_smoking:                string | null
  q_alcohol:                string | null
  q_diet:                   string | null
  q_pets:                   string | null

  q_about_intellectual:     string | null
  q_quote_1:                string | null
  q_quote_2:                string | null
  q_quote_3:                string | null

  updated_at:               string
}

export interface ProfilePhoto {
  id:         string
  profile_id: string
  photo_url:  string
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface Observation {
  id:          string
  observer_id: string
  observed_id: string
  created_at:  string
}

export interface FlirtProposal {
  id:            string
  from_id:       string
  to_id:         string
  message:       string | null
  attempt:       number
  status:        'pending' | 'accepted' | 'declined'
  created_at:    string
  from_profile?: Profile
  to_profile?:   Profile
}

export interface Flirt {
  id:            string
  profile_1_id:  string
  profile_2_id:  string
  created_at:    string
  profile_1?:    Profile
  profile_2?:    Profile
  last_message?: Message
}

export interface Message {
  id:         string
  flirt_id:   string
  sender_id:  string
  content:    string
  created_at: string
  sender?:    Pick<Profile, 'id' | 'username'>
}

export function otherProfile(flirt: Flirt, myId: string): Profile | undefined {
  return flirt.profile_1_id === myId ? flirt.profile_2 : flirt.profile_1
}
