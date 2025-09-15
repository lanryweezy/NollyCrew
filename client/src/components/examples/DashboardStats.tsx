import DashboardStats, { getStatsForRole } from '../DashboardStats';

export default function DashboardStatsExample() {
  return (
    <div className="space-y-8 p-4">
      {/* Actor Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Actor Dashboard Stats</h3>
        <DashboardStats 
          userRole="actor" 
          stats={getStatsForRole("actor")} 
        />
      </div>
      
      {/* Crew Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Crew Dashboard Stats</h3>
        <DashboardStats 
          userRole="crew" 
          stats={getStatsForRole("crew")} 
        />
      </div>
      
      {/* Producer Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Producer Dashboard Stats</h3>
        <DashboardStats 
          userRole="producer" 
          stats={getStatsForRole("producer")} 
        />
      </div>
    </div>
  );
}