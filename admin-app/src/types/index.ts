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

export interface Flirt {
  id:            string
  profile_1_id:  string
  profile_2_id:  string
  created_at:    string
  profile_1?:    Profile
  profile_2?:    Profile
}

export interface Message {
  id:         string
  flirt_id:   string
  sender_id:  string
  content:    string
  created_at: string
}
