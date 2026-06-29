import JobCard from '../JobCard';
import type { Job } from '@/types/database';

const DEMO_JOBS: Job[] = [
  {
    id: "1",
    title: "Lead Actor - Romantic Drama",
    type: "casting",
    category: "lead-actor",
    description: "We are seeking a talented lead actor for our upcoming romantic drama series. This is a career-defining role that requires emotional depth and strong chemistry with co-stars.",
    location: "Lagos, Nigeria",
    budget: 5000000,
    currency: "NGN",
    duration: "6 weeks",
    deadline: "2026-12-30",
    is_urgent: true,
    is_active: true,
    posted_by_id: "demo",
    project_id: null,
    payment_type: "project",
    requirements: ["5+ years experience", "Age 25-35", "Lagos based"],
    skills: ["Acting", "Drama"],
    experience: "senior",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Cinematographer - Feature Film",
    type: "crew",
    category: "cinematographer",
    description: "Looking for an experienced cinematographer for our upcoming feature film. Must have experience with Red cameras and expertise in color grading.",
    location: "Abuja, Nigeria",
    budget: 2000000,
    currency: "NGN",
    duration: "8 weeks",
    deadline: "2026-01-15",
    is_urgent: false,
    is_active: true,
    posted_by_id: "demo",
    project_id: null,
    payment_type: "project",
    requirements: ["Red camera experience", "10+ years"],
    skills: ["Cinematography"],
    experience: "expert",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function JobCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
      {DEMO_JOBS.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
