// Comprehensive mock data for demo mode
export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  phone?: string | null;
  website?: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockUserRole {
  id: string;
  userId: string;
  role: 'actor' | 'crew' | 'producer';
  specialties?: string[] | null;
  experience?: string | null;
  hourlyRate?: string | null;
  availability?: string | null;
  portfolio?: any;
  skills?: string[] | null;
  languages?: string[] | null;
  awards?: any;
  credits?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockJob {
  id: string;
  title: string;
  type: 'casting' | 'crew' | 'other';
  category?: string;
  description: string;
  requirements: string[];
  company: string;
  location: string;
  budget: string;
  duration: string;
  deadline: string;
  isActive: boolean;
  postedById: string;
  applicantsCount: number;
  isBookmarked: boolean;
  isUrgent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockProject {
  id: string;
  title: string;
  genre: string;
  description: string;
  status: 'pre-production' | 'production' | 'post-production' | 'completed';
  progress: number;
  budget: string;
  director: string;
  producerId: string;
  startDate: string;
  deadline: string;
  teamSize: number;
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockProfile {
  id: string;
  name: string;
  role: 'actor' | 'crew' | 'producer';
  location: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  experience: string;
  recentProject: string;
  isVerified: boolean;
  isFollowing: boolean;
  avatar?: string | null;
  bio?: string | null;
}

export interface MockNotification {
  id: string;
  type: 'job_application' | 'project_update' | 'connection' | 'message' | 'payment';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  relatedId?: string;
}

export interface MockMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface MockAnalytics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalEarnings: string;
  monthlyEarnings: string;
  projectCompletionRate: number;
  clientSatisfaction: number;
  recentActivity: Array<{
    id: number;
    action: string;
    time: string;
  }>;
}

// Mock user data
export const mockUsers: MockUser[] = [
  {
    id: 'demo-user-1',
    email: 'demo@example.com',
    firstName: 'Demo',
    lastName: 'User',
    location: 'Lagos, Nigeria',
    bio: 'This is a demo account showcasing the features of NollyCrewHub. I am an experienced actor and producer passionate about creating compelling content.',
    isVerified: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-06-20T14:45:00Z'
  },
  {
    id: 'demo-user-2',
    email: 'funke@example.com',
    firstName: 'Funke',
    lastName: 'Akindele',
    location: 'Lagos, Nigeria',
    bio: 'Award-winning actress and producer with over 20 years of experience in Nollywood. Known for powerful dramatic performances.',
    isVerified: true,
    createdAt: '2023-05-10T09:15:00Z',
    updatedAt: '2024-06-25T16:20:00Z'
  },
  {
    id: 'demo-user-3',
    email: 'kemi@example.com',
    firstName: 'Kemi',
    lastName: 'Adetiba',
    location: 'Lagos, Nigeria',
    bio: 'Director and producer of critically acclaimed films. Specializes in high-budget productions with international appeal.',
    isVerified: true,
    createdAt: '2022-11-22T11:45:00Z',
    updatedAt: '2024-06-28T10:30:00Z'
  }
];

// Mock user roles
export const mockUserRoles: MockUserRole[] = [
  {
    id: 'demo-role-1',
    userId: 'demo-user-1',
    role: 'actor',
    specialties: ['Drama', 'Comedy', 'Action'],
    experience: '5+ years',
    hourlyRate: '₦50,000',
    availability: 'Available',
    skills: ['Acting', 'Improvisation', 'Voice Over'],
    languages: ['English', 'Yoruba', 'Igbo'],
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-06-20T14:45:00Z'
  },
  {
    id: 'demo-role-2',
    userId: 'demo-user-1',
    role: 'producer',
    specialties: ['Film Production', 'Script Development', 'Project Management'],
    experience: '3+ years',
    hourlyRate: '₦100,000',
    availability: 'Available',
    skills: ['Budgeting', 'Scheduling', 'Team Management'],
    languages: ['English'],
    isActive: true,
    createdAt: '2024-03-10T09:20:00Z',
    updatedAt: '2024-06-22T11:15:00Z'
  },
  {
    id: 'demo-role-3',
    userId: 'demo-user-2',
    role: 'actor',
    specialties: ['Drama', 'Action', 'Character Actor'],
    experience: '20+ years',
    hourlyRate: '₦200,000',
    availability: 'Limited',
    skills: ['Method Acting', 'Stunt Work', 'Voice Acting'],
    languages: ['English', 'Yoruba'],
    isActive: true,
    createdAt: '2023-05-10T09:15:00Z',
    updatedAt: '2024-06-25T16:20:00Z'
  },
  {
    id: 'demo-role-4',
    userId: 'demo-user-3',
    role: 'producer',
    specialties: ['Feature Films', 'International Distribution', 'Financing'],
    experience: '15+ years',
    hourlyRate: '₦300,000',
    availability: 'Available',
    skills: ['Fundraising', 'Distribution', 'Marketing'],
    languages: ['English', 'French'],
    isActive: true,
    createdAt: '2022-11-22T11:45:00Z',
    updatedAt: '2024-06-28T10:30:00Z'
  }
];

// Mock jobs
export const mockJobs: MockJob[] = [
  {
    id: 'demo-job-1',
    title: 'Lead Actor - Romantic Drama',
    type: 'casting',
    category: 'lead-actor',
    description: 'We are seeking a talented lead actor for our upcoming romantic drama series. The role requires someone who can portray complex emotions and has experience in both dramatic and comedic scenes.',
    requirements: ['5+ years experience', 'Age 25-35', 'Lagos based', 'Fluent in English'],
    company: 'Trino Studios',
    location: 'Lagos, Nigeria',
    budget: '₦2M - ₦5M',
    duration: '6 weeks',
    deadline: '2024-12-30',
    isActive: true,
    postedById: 'demo-user-3',
    applicantsCount: 45,
    isBookmarked: false,
    isUrgent: true,
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-06-20T14:30:00Z'
  },
  {
    id: 'demo-job-2',
    title: 'Cinematographer',
    type: 'crew',
    category: 'cinematography',
    description: 'Looking for an experienced cinematographer for our upcoming action film. Candidate should have experience with drone shots and night filming.',
    requirements: ['3+ years experience', 'Portfolio required', 'Drone certification preferred'],
    company: 'KAP Motion Pictures',
    location: 'Abuja, Nigeria',
    budget: '₦1.5M - ₦3M',
    duration: '8 weeks',
    deadline: '2025-01-15',
    isActive: true,
    postedById: 'demo-user-3',
    applicantsCount: 22,
    isBookmarked: true,
    isUrgent: false,
    createdAt: '2024-06-05T11:30:00Z',
    updatedAt: '2024-06-22T09:15:00Z'
  },
  {
    id: 'demo-job-3',
    title: 'Makeup Artist',
    type: 'crew',
    category: 'makeup',
    description: 'Seeking a skilled makeup artist for our period drama. Experience with traditional Nigerian makeup and special effects is required.',
    requirements: ['2+ years experience', 'Special effects experience', 'References required'],
    company: 'Greoh Studios',
    location: 'Port Harcourt, Nigeria',
    budget: '₦800K - ₦1.2M',
    duration: '4 weeks',
    deadline: '2025-01-10',
    isActive: true,
    postedById: 'demo-user-2',
    applicantsCount: 18,
    isBookmarked: false,
    isUrgent: true,
    createdAt: '2024-06-10T14:20:00Z',
    updatedAt: '2024-06-25T16:45:00Z'
  },
  {
    id: 'demo-job-4',
    title: 'Sound Engineer',
    type: 'crew',
    category: 'sound',
    description: 'Experienced sound engineer needed for post-production work on our feature film. Must have experience with Dolby Atmos mixing.',
    requirements: ['5+ years experience', 'Dolby Atmos certification', 'Portfolio required'],
    company: 'FilmOne Productions',
    location: 'Lagos, Nigeria',
    budget: '₦2M - ₦4M',
    duration: '10 weeks',
    deadline: '2025-02-01',
    isActive: true,
    postedById: 'demo-user-3',
    applicantsCount: 12,
    isBookmarked: true,
    isUrgent: false,
    createdAt: '2024-06-15T09:45:00Z',
    updatedAt: '2024-06-28T11:20:00Z'
  }
];

// Mock projects
export const mockProjects: MockProject[] = [
  {
    id: 'demo-project-1',
    title: 'Love in Lagos',
    genre: 'Romantic Drama',
    description: 'A heartwarming story about finding love in the bustling city of Lagos. Follows two young professionals as they navigate career challenges and romantic entanglements.',
    status: 'production',
    progress: 65,
    budget: '₦50M',
    director: 'Kemi Adetiba',
    producerId: 'demo-user-3',
    startDate: '2024-11-01',
    deadline: '2025-03-31',
    teamSize: 45,
    isOwner: true,
    createdAt: '2024-05-15T10:30:00Z',
    updatedAt: '2024-06-25T14:20:00Z'
  },
  {
    id: 'demo-project-2',
    title: 'The Set Up 3',
    genre: 'Action Thriller',
    description: 'The highly anticipated sequel to the blockbuster hit. More action, more intrigue, and higher stakes as our heroes face their greatest challenge yet.',
    status: 'pre-production',
    progress: 25,
    budget: '₦80M',
    director: 'Niyi Akinmolayan',
    producerId: 'demo-user-3',
    startDate: '2025-02-01',
    deadline: '2025-06-30',
    teamSize: 62,
    isOwner: false,
    createdAt: '2024-04-20T09:15:00Z',
    updatedAt: '2024-06-28T10:30:00Z'
  },
  {
    id: 'demo-project-3',
    title: 'Battle on Buka Street',
    genre: 'Comedy Drama',
    description: 'A hilarious yet touching story about family dynamics in a bustling Lagos neighborhood. Explores themes of tradition vs. modernity.',
    status: 'completed',
    progress: 100,
    budget: '₦30M',
    director: 'Funke Akindele',
    producerId: 'demo-user-2',
    startDate: '2023-09-01',
    deadline: '2024-01-31',
    teamSize: 35,
    isOwner: true,
    createdAt: '2023-08-10T11:45:00Z',
    updatedAt: '2024-02-15T16:30:00Z'
  }
];

// Mock profiles
export const mockProfiles: MockProfile[] = [
  {
    id: 'demo-profile-1',
    name: 'Funke Akindele',
    role: 'actor',
    location: 'Lagos, Nigeria',
    specialties: ['Comedy', 'Drama', 'Lead Roles'],
    rating: 4.8,
    reviewCount: 127,
    experience: '15+ years',
    recentProject: 'Battle on Buka Street',
    isVerified: true,
    isFollowing: false,
    bio: 'Award-winning actress and producer with over 20 years of experience in Nollywood.',
    avatar: null
  },
  {
    id: 'demo-profile-2',
    name: 'Richard Mofe-Damijo',
    role: 'actor',
    location: 'Lagos, Nigeria',
    specialties: ['Drama', 'Action', 'Character Actor'],
    rating: 4.9,
    reviewCount: 203,
    experience: '30+ years',
    recentProject: 'Osuofia in London',
    isVerified: true,
    isFollowing: true,
    bio: 'Veteran actor with decades of experience in Nigerian cinema.',
    avatar: null
  },
  {
    id: 'demo-profile-3',
    name: 'Tunde Cinematography',
    role: 'crew',
    location: 'Abuja, Nigeria',
    specialties: ['Cinematographer', 'Director of Photography', 'Drone Pilot'],
    rating: 4.6,
    reviewCount: 89,
    experience: '8 years',
    recentProject: 'The Set Up 2',
    isVerified: true,
    isFollowing: false,
    bio: 'Professional cinematographer specializing in action sequences and drone work.',
    avatar: null
  },
  {
    id: 'demo-profile-4',
    name: 'Kemi Adebayo',
    role: 'producer',
    location: 'Port Harcourt, Nigeria',
    specialties: ['Executive Producer', 'Line Producer', 'Post-Production'],
    rating: 4.9,
    reviewCount: 203,
    experience: '12 years',
    recentProject: 'Citation',
    isVerified: true,
    isFollowing: false,
    bio: 'Award-winning producer known for high-budget productions with international appeal.',
    avatar: null
  }
];

// Mock notifications
export const mockNotifications: MockNotification[] = [
  {
    id: 'demo-notification-1',
    type: 'job_application',
    title: 'New application received',
    message: 'John Doe applied for Lead Actor position',
    time: '2 hours ago',
    isRead: false,
    relatedId: 'demo-job-1'
  },
  {
    id: 'demo-notification-2',
    type: 'project_update',
    title: 'Project milestone completed',
    message: 'Love in Lagos - Production phase 65% complete',
    time: '1 day ago',
    isRead: true,
    relatedId: 'demo-project-1'
  },
  {
    id: 'demo-notification-3',
    type: 'connection',
    title: 'New connection request',
    message: 'Funke Akindele wants to connect',
    time: '2 days ago',
    isRead: false,
    relatedId: 'demo-user-2'
  },
  {
    id: 'demo-notification-4',
    type: 'message',
    title: 'New message',
    message: 'Kemi Adetiba: Let\'s schedule a meeting for next week',
    time: '3 days ago',
    isRead: true,
    relatedId: 'demo-user-3'
  },
  {
    id: 'demo-notification-5',
    type: 'payment',
    title: 'Payment received',
    message: 'Payment of ₦500,000 received for The Set Up 2',
    time: '1 week ago',
    isRead: true,
    relatedId: 'demo-project-2'
  }
];

// Mock messages
export const mockMessages: MockMessage[] = [
  {
    id: 'demo-message-1',
    senderId: 'demo-user-2',
    senderName: 'Funke Akindele',
    content: 'Hi there! I\'m interested in the Lead Actor position for your romantic drama. When can we schedule a callback?',
    timestamp: '2024-06-28T10:30:00Z',
    isRead: true
  },
  {
    id: 'demo-message-2',
    senderId: 'demo-user-3',
    senderName: 'Kemi Adetiba',
    content: 'Great work on the latest script revisions. Let\'s schedule a production meeting for next week to discuss the shooting schedule.',
    timestamp: '2024-06-27T15:45:00Z',
    isRead: true
  },
  {
    id: 'demo-message-3',
    senderId: 'demo-user-2',
    senderName: 'Funke Akindele',
    content: 'I\'ve reviewed the cinematography requirements. I can recommend an excellent DP for this project.',
    timestamp: '2024-06-26T09:20:00Z',
    isRead: false
  }
];

// Mock analytics
export const mockAnalytics: MockAnalytics = {
  totalProjects: 12,
  activeProjects: 3,
  completedProjects: 9,
  totalEarnings: '₦12.5M',
  monthlyEarnings: '₦1.2M',
  projectCompletionRate: 75,
  clientSatisfaction: 4.8,
  recentActivity: [
    { id: 1, action: 'Applied to Lead Actor role', time: '2 hours ago' },
    { id: 2, action: 'Project "Love in Lagos" updated', time: '1 day ago' },
    { id: 3, action: 'New message from Kemi Adetiba', time: '2 days ago' },
    { id: 4, action: 'Payment received for "The Set Up 2"', time: '3 days ago' },
    { id: 5, action: 'Connection request from Funke Akindele', time: '1 week ago' }
  ]
};

// Helper functions to get mock data
export const getMockUser = (userId: string): MockUser | undefined => {
  return mockUsers.find(user => user.id === userId);
};

export const getMockUserRoles = (userId: string): MockUserRole[] => {
  return mockUserRoles.filter(role => role.userId === userId);
};

export const getMockJobs = (filters?: { type?: string; location?: string }): MockJob[] => {
  let filteredJobs = [...mockJobs];
  
  if (filters?.type) {
    filteredJobs = filteredJobs.filter(job => job.type === filters.type);
  }
  
  if (filters?.location) {
    filteredJobs = filteredJobs.filter(job => 
      job.location.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }
  
  return filteredJobs;
};

export const getMockJob = (jobId: string): MockJob | undefined => {
  return mockJobs.find(job => job.id === jobId);
};

export const getMockProjects = (filters?: { status?: string }): MockProject[] => {
  let filteredProjects = [...mockProjects];
  
  if (filters?.status) {
    filteredProjects = filteredProjects.filter(project => project.status === filters.status);
  }
  
  return filteredProjects;
};

export const getMockProject = (projectId: string): MockProject | undefined => {
  return mockProjects.find(project => project.id === projectId);
};

export const getMockProfiles = (filters?: { role?: string; location?: string }): MockProfile[] => {
  let filteredProfiles = [...mockProfiles];
  
  if (filters?.role) {
    filteredProfiles = filteredProfiles.filter(profile => profile.role === filters.role);
  }
  
  if (filters?.location) {
    filteredProfiles = filteredProfiles.filter(profile => 
      profile.location.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }
  
  return filteredProfiles;
};

export const getMockProfile = (profileId: string): MockProfile | undefined => {
  return mockProfiles.find(profile => profile.id === profileId);
};

export const getMockNotifications = (limit?: number): MockNotification[] => {
  const notifications = [...mockNotifications];
  return limit ? notifications.slice(0, limit) : notifications;
};

export const getMockMessages = (limit?: number): MockMessage[] => {
  const messages = [...mockMessages];
  return limit ? messages.slice(0, limit) : messages;
};

export const getMockAnalyticsData = (): MockAnalytics => {
  return { ...mockAnalytics };
};