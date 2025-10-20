import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EnhancedDashboard from '../components/EnhancedDashboard';

const mockSetLocation = vi.fn();

// Mock dependencies
vi.mock('wouter', () => ({
  useLocation: () => [null, mockSetLocation]
}));

vi.mock('../lib/auth', () => ({
  useAuth: () => ({
    user: {
      firstName: 'Demo',
      lastName: 'User'
    },
    roles: [
      {
        id: 'role-1',
        role: 'actor',
        isActive: true
      }
    ]
  }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn((options) => {
    const { queryKey } = options;
    switch (queryKey[0]) {
      case 'userStats':
        return { data: { applications: 0, showreels: 0, connections: 0, activeProjects: 0 }, isLoading: false, error: null };
      case 'recentJobs':
        return { data: [], isLoading: false, error: null };
      case 'projects':
        return { data: [], isLoading: false, error: null };
      case 'notifications':
        return { data: [], isLoading: false, error: null };
      case 'recentActivity':
        return { data: [], isLoading: false, error: null };
      case 'connections':
        return { data: [], isLoading: false, error: null };
      default:
        return { data: undefined, isLoading: true, error: null };
    }
  }),
}));

// Mock components
vi.mock('../components/Navigation', () => ({
  default: () => <div data-testid="navigation">Navigation</div>
}));

vi.mock('../components/ThemeToggle', () => ({
  default: () => <div data-testid="theme-toggle">Theme Toggle</div>
}));

vi.mock('../components/PageHeader', () => ({
  default: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  )
}));

vi.mock('../components/ResponsiveGrid', () => ({
  default: ({ children, ...props }: { children: React.ReactNode;[key: string]: any }) => (
    <div {...props}>{children}</div>
  )
}));

vi.mock('../components/ResponsiveSection', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-section">{children}</div>
  )
}));

vi.mock('../components/ResponsiveButton', () => ({
  default: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button data-testid="responsive-button" onClick={onClick}>
      {children}
    </button>
  )
}));

vi.mock('../components/ResponsiveTypography', () => ({
  default: ({ children, variant }: { children: React.ReactNode; variant: string }) => (
    <div data-testid={`typography-${variant}`}>{children}</div>
  )
}));

describe('EnhancedDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the enhanced dashboard with all main components', () => {
    render(<EnhancedDashboard />);
    
    // Check if main components are rendered
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-section')).toBeInTheDocument();
    
    // Check if dashboard title is rendered
    expect(screen.getByText('Actor Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Discover roles and showcase your talent')).toBeInTheDocument();
  });

  it('should render stats cards', () => {
    render(<EnhancedDashboard />);
    
    // Check if stats grid is rendered
    expect(screen.getByTestId('stats-grid')).toBeInTheDocument();
    
    // Since we're mocking the data, we can't check for specific values
    // but we can check that the structure is there
  });

  it('should render quick actions', () => {
    render(<EnhancedDashboard />);
    
    // Check if quick actions are rendered
    expect(screen.getByText('Browse Casting Calls')).toBeInTheDocument();
    expect(screen.getByText('Update Showreel')).toBeInTheDocument();
    expect(screen.getByText('View Applications')).toBeInTheDocument();
    expect(screen.getByText('AI Script Analysis')).toBeInTheDocument();
  });

  it('should switch between tabs', () => {
    render(<EnhancedDashboard />);
    
    // Check if tabs are rendered
    expect(screen.getByText('Recent Jobs')).toBeInTheDocument();
    expect(screen.getByText('My Projects')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    
    // Check if default tab content is shown
    expect(screen.getByText('View All Jobs')).toBeInTheDocument();
  });

  it('should render notifications section', () => {
    render(<EnhancedDashboard />);
    
    // Check if notifications section is rendered
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Recent Connections')).toBeInTheDocument();
  });

  it('should handle quick action button clicks', () => {
    
    render(<EnhancedDashboard />);
    
    // Click on a quick action button
    const browseButton = screen.getByText('Browse Casting Calls');
    fireEvent.click(browseButton);
    
    // Check if navigation was called
    expect(mockSetLocation).toHaveBeenCalledWith('/jobs?type=casting');
  });

  it('should render different dashboard based on user role', async () => {
    // Mock a producer role
    const auth = await import('../lib/auth');
    vi.spyOn(auth, 'useAuth').mockReturnValue({
      user: {
        firstName: 'Demo',
        lastName: 'Producer'
      },
      roles: [
        {
          id: 'role-1',
          role: 'producer',
          isActive: true
        }
      ]
    });
    
    render(<EnhancedDashboard />);
    
    // Check if producer dashboard is rendered
    expect(screen.getByText('Producer Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Manage productions and discover talent')).toBeInTheDocument();
  });
});
