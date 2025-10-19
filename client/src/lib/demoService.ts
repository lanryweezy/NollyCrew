// Demo service for providing mock data in demo mode
export interface DemoUser {
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
}

export interface DemoUserRole {
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
}

export interface DemoJob {
  id: string;
  title: string;
  type: 'casting' | 'crew' | 'other';
  company: string;
  location: string;
  budget: string;
  duration: string;
  deadline: string;
  description: string;
  requirements: string[];
  applicants: number;
  isUrgent: boolean;
  isBookmarked: boolean;
}

export interface DemoProject {
  id: string;
  title: string;
  genre: string;
  status: 'pre-production' | 'production' | 'post-production' | 'completed';
  progress: number;
  budget: string;
  director: string;
  startDate: string;
  deadline: string;
  teamSize: number;
  description: string;
  isOwner: boolean;
}

export interface DemoProfile {
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
}

// Check if we're in demo mode
export const isDemoMode = () => {
  return process.env.NODE_ENV === 'development' || process.env.DEMO_MODE === 'true';
};

// Get demo user data
export const getDemoUser = (): { user: DemoUser; roles: DemoUserRole[] } => {
  return {
    user: {
      id: 'demo-user-id',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      location: 'Lagos, Nigeria',
      bio: 'This is a demo account showcasing the features of NollyCrewHub',
      isVerified: true,
    },
    roles: [
      {
        id: 'demo-role-1',
        userId: 'demo-user-id',
        role: 'actor',
        specialties: ['Drama', 'Comedy', 'Action'],
        experience: '5+ years',
        hourlyRate: '₦50,000',
        availability: 'Available',
        skills: ['Acting', 'Improvisation', 'Voice Over'],
        languages: ['English', 'Yoruba', 'Igbo'],
        isActive: true,
      },
      {
        id: 'demo-role-2',
        userId: 'demo-user-id',
        role: 'producer',
        specialties: ['Film Production', 'Script Development', 'Project Management'],
        experience: '3+ years',
        hourlyRate: '₦100,000',
        availability: 'Available',
        skills: ['Budgeting', 'Scheduling', 'Team Management'],
        languages: ['English'],
        isActive: true,
      }
    ]
  };
};

// Get demo jobs
export const getDemoJobs = (): DemoJob[] => {
  return [
    {
      id: 'demo-job-1',
      title: 'Lead Actor - Romantic Drama',
      type: 'casting',
      company: 'Trino Studios',
      location: 'Lagos, Nigeria',
      budget: '₦2M - ₦5M',
      duration: '6 weeks',
      deadline: 'Apply by Dec 30',
      description: 'We are seeking a talented lead actor for our upcoming romantic drama series. The role requires someone who can portray complex emotions and has experience in both dramatic and comedic scenes.',
      requirements: ['5+ years experience', 'Age 25-35', 'Lagos based', 'Fluent in English'],
      applicants: 45,
      isUrgent: true,
      isBookmarked: false,
    },
    {
      id: 'demo-job-2',
      title: 'Cinematographer',
      type: 'crew',
      company: 'KAP Motion Pictures',
      location: 'Abuja, Nigeria',
      budget: '₦1.5M - ₦3M',
      duration: '8 weeks',
      deadline: 'Apply by Jan 15',
      description: 'Looking for an experienced cinematographer for our upcoming action film. Candidate should have experience with drone shots and night filming.',
      requirements: ['3+ years experience', 'Portfolio required', 'Drone certification preferred'],
      applicants: 22,
      isUrgent: false,
      isBookmarked: true,
    },
    {
      id: 'demo-job-3',
      title: 'Makeup Artist',
      type: 'crew',
      company: 'Greoh Studios',
      location: 'Port Harcourt, Nigeria',
      budget: '₦800K - ₦1.2M',
      duration: '4 weeks',
      deadline: 'Apply by Jan 10',
      description: 'Seeking a skilled makeup artist for our period drama. Experience with traditional Nigerian makeup and special effects is required.',
      requirements: ['2+ years experience', 'Special effects experience', 'References required'],
      applicants: 18,
      isUrgent: true,
      isBookmarked: false,
    }
  ];
};

// Get demo projects
export const getDemoProjects = (): DemoProject[] => {
  return [
    {
      id: 'demo-project-1',
      title: 'Love in Lagos',
      genre: 'Romantic Drama',
      status: 'production',
      progress: 65,
      budget: '₦50M',
      director: 'Kemi Adetiba',
      startDate: 'Nov 2024',
      deadline: 'Mar 2025',
      teamSize: 45,
      description: 'A heartwarming story about finding love in the bustling city of Lagos. Follows two young professionals as they navigate career challenges and romantic entanglements.',
      isOwner: true,
    },
    {
      id: 'demo-project-2',
      title: 'The Set Up 2',
      genre: 'Action Thriller',
      status: 'post-production',
      progress: 90,
      budget: '₦80M',
      director: 'Jade Osiberu',
      startDate: 'Jun 2024',
      deadline: 'Dec 2024',
      teamSize: 62,
      description: 'The highly anticipated sequel to the blockbuster hit. More action, more intrigue, and higher stakes as our heroes face their greatest challenge yet.',
      isOwner: false,
    }
  ];
};

// Get demo profiles
export const getDemoProfiles = (): Record<string, DemoProfile[]> => {
  return {
    actors: [
      {
        id: 'demo-actor-1',
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
      },
      {
        id: 'demo-actor-2',
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
      }
    ],
    crew: [
      {
        id: 'demo-crew-1',
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
      },
      {
        id: 'demo-crew-2',
        name: 'Chika Sound',
        role: 'crew',
        location: 'Lagos, Nigeria',
        specialties: ['Sound Engineer', 'Music Composer', 'Foley Artist'],
        rating: 4.7,
        reviewCount: 76,
        experience: '10 years',
        recentProject: 'Citation',
        isVerified: true,
        isFollowing: true,
      }
    ],
    producers: [
      {
        id: 'demo-producer-1',
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
      },
      {
        id: 'demo-producer-2',
        name: 'Jade Osiberu',
        role: 'producer',
        location: 'Lagos, Nigeria',
        specialties: ['Producer', 'Director', 'Screenwriter'],
        rating: 4.8,
        reviewCount: 156,
        experience: '15 years',
        recentProject: 'The Set Up Series',
        isVerified: true,
        isFollowing: true,
      }
    ]
  };
};

// Get demo analytics data
export const getDemoAnalytics = () => {
  return {
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
    ]
  };
};