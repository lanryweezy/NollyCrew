import ProjectCard from '../ProjectCard';

export default function ProjectCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
      <ProjectCard
        id="1"
        title="Love in Lagos"
        genre="Romantic Drama"
        status="production"
        progress={65}
        budget="₦50M"
        director="Kemi Adetiba"
        startDate="Nov 2024"
        deadline="Mar 2025"
        teamSize={45}
        description="A heartwarming story about finding love in the bustling city of Lagos, exploring modern relationships and traditional values."
        isOwner={true}
      />
      <ProjectCard
        id="2"
        title="The Inspector"
        genre="Crime Thriller"
        status="pre-production"
        progress={25}
        budget="₦80M"
        director="Tunde Kelani"
        startDate="Jan 2025"
        deadline="Aug 2025"
        teamSize={32}
        description="A gripping crime thriller following a determined inspector uncovering corruption in high places while battling personal demons."
        isOwner={false}
      />
      <ProjectCard
        id="3"
        title="Village King"
        genre="Historical Drama"
        status="completed"
        progress={100}
        budget="₦120M"
        director="Biyi Bandele"
        startDate="Jan 2024"
        deadline="Dec 2024"
        teamSize={68}
        description="An epic tale of power, tradition, and change in pre-colonial Nigeria, showcasing rich cultural heritage and timeless human stories."
        isOwner={false}
      />
    </div>
  );
}