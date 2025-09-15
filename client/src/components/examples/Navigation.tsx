import Navigation from '../Navigation';

export default function NavigationExample() {
  return (
    <div className="space-y-8">
      {/* Authenticated State */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Authenticated User</h3>
        <Navigation 
          isAuthenticated={true}
          userRole="producer"
          userName="Kemi Adebayo"
          notifications={3}
          messages={5}
        />
      </div>
      
      {/* Unauthenticated State */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Guest User</h3>
        <Navigation isAuthenticated={false} />
      </div>
    </div>
  );
}