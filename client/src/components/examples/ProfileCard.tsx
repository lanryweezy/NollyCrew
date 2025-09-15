import ProfileCard from '../ProfileCard';

export default function ProfileCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      <ProfileCard
        id="1"
        name="Funke Akindele"
        role="actor"
        location="Lagos, Nigeria"
        specialties={["Comedy", "Drama", "Lead Roles"]}
        rating={4.8}
        reviewCount={127}
        experience="15+ years"
        recentProject="Battle on Buka Street"
        isVerified={true}
        isFollowing={false}
      />
      <ProfileCard
        id="2"
        name="Tunde Cinematography"
        role="crew"
        location="Abuja, Nigeria"
        specialties={["Cinematographer", "Director of Photography", "Drone Pilot"]}
        rating={4.6}
        reviewCount={89}
        experience="8 years"
        recentProject="The Set Up 2"
        isVerified={true}
        isFollowing={true}
      />
      <ProfileCard
        id="3"
        name="Kemi Adebayo"
        role="producer"
        location="Port Harcourt, Nigeria"
        specialties={["Executive Producer", "Line Producer", "Post-Production"]}
        rating={4.9}
        reviewCount={203}
        experience="12 years"
        recentProject="Citation"
        isVerified={true}
        isFollowing={false}
      />
    </div>
  );
}