export interface Profile {
  id:          string
  username:    string
  password:    string
  name:        string
  age:         number
  gender:      'man' | 'woman' | 'other'
  looking_for: 'men' | 'women' | 'everyone'
  location:    string
  occupation:  string | null
  bio:         string | null
  interests:   string[]
  photo_url:   string | null
  status:      'active' | 'suspended'
  created_at:  string
}

export interface ProfilePhoto {
  id:         string
  profile_id: string
  photo_url:  string
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface Like {
  id:         string
  from_id:    string
  to_id:      string
  created_at: string
}

export interface Match {
  id:           string
  profile_1_id: string
  profile_2_id: string
  created_at:   string
  // joined
  profile_1?:   Profile
  profile_2?:   Profile
}

export interface Message {
  id:         string
  match_id:   string
  sender_id:  string
  content:    string
  created_at: string
}

export interface MatchWithProfiles extends Match {
  profile_1: Profile
  profile_2: Profile
  messages:  Message[]
}
