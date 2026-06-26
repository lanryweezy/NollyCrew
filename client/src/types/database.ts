export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  phone: string | null;
  website: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'actor' | 'crew' | 'producer';
  specialties: string[] | null;
  experience: string | null;
  hourly_rate: number | null;
  availability: 'available' | 'busy' | 'unavailable';
  portfolio: any[];
  skills: string[] | null;
  languages: string[] | null;
  awards: any[];
  credits: any[];
  is_active: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  genre: string;
  type: 'feature' | 'short' | 'series' | 'commercial' | 'documentary';
  status: 'pre-production' | 'production' | 'post-production' | 'completed' | 'cancelled';
  budget: number | null;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  poster: string | null;
  trailer: string | null;
  script: string | null;
  script_breakdown: any;
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  type: 'casting' | 'crew' | 'project';
  category: string;
  project_id: string | null;
  posted_by_id: string;
  location: string;
  budget: number | null;
  currency: string;
  payment_type: string | null;
  duration: string | null;
  requirements: string[] | null;
  skills: string[] | null;
  experience: string | null;
  deadline: string | null;
  is_urgent: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  poster?: Profile;
  application_count?: number;
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  cover_letter: string | null;
  portfolio: any;
  proposed_rate: number | null;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected';
  applied_at: string;
  reviewed_at: string | null;
  review_notes: string | null;
  // Joined
  applicant?: Profile;
  job?: Job;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string | null;
  content: string;
  is_read: boolean;
  thread_id: string | null;
  attachments: any[];
  sent_at: string;
  // Joined
  sender?: Profile;
  recipient?: Profile;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  project_id: string | null;
  rating: number;
  comment: string | null;
  is_public: boolean;
  created_at: string;
  // Joined
  reviewer?: Profile;
}

export interface EscrowTransaction {
  id: string;
  project_id: string | null;
  job_id: string | null;
  sender_id: string;
  recipient_id: string;
  amount: number;
  currency: string;
  status: 'escrow' | 'released' | 'disputed' | 'refunded';
  paystack_reference: string | null;
  release_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  project_id: string | null;
  subject: string;
  description: string;
  type: 'dispute' | 'bug' | 'feature_request' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata: any;
  created_at: string;
  updated_at: string;
}
