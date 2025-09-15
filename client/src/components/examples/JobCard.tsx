import JobCard from '../JobCard';

export default function JobCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
      <JobCard
        id="1"
        title="Lead Actor - Romantic Drama"
        type="casting"
        company="Trino Studios"
        location="Lagos, Nigeria"
        budget="₦2M - ₦5M"
        duration="6 weeks"
        deadline="Apply by Dec 30"
        description="We are seeking a talented lead actor for our upcoming romantic drama series. This is a career-defining role that requires emotional depth and strong chemistry with co-stars. The character is a young entrepreneur facing life challenges."
        requirements={["5+ years experience", "Age 25-35", "Lagos based", "Strong emotional range"]}
        applicants={45}
        isUrgent={true}
        isBookmarked={false}
      />
      <JobCard
        id="2"
        title="Cinematographer - Feature Film"
        type="crew"
        company="Inkblot Productions"
        location="Abuja, Nigeria"
        budget="₦1.5M"
        duration="8 weeks"
        deadline="Jan 15, 2024"
        description="Looking for an experienced cinematographer for our upcoming feature film. Must have experience with Red cameras and expertise in color grading. The project involves both indoor and outdoor shooting with complex lighting setups."
        requirements={["Red camera experience", "10+ years", "Own equipment preferred", "Travel ready"]}
        applicants={23}
        isUrgent={false}
        isBookmarked={true}
      />
      <JobCard
        id="3"
        title="Executive Producer - Web Series"
        type="project"
        company="FilmOne Entertainment"
        location="Remote/Lagos"
        budget="₦50M - ₦100M"
        duration="1 year"
        deadline="Feb 1, 2024"
        description="Seeking an executive producer to oversee our new web series project. The role involves managing the entire production lifecycle, from pre-production planning to post-production delivery."
        requirements={["Executive producer experience", "Budget management", "Team leadership", "Distribution knowledge"]}
        applicants={12}
        isUrgent={false}
        isBookmarked={false}
      />
    </div>
  );
}