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
      id: 'user-1',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      isVerified: true
    },
    roles: [
      {
        id: 'role-1',
        userId: 'user-1',
        role: 'actor',
        isActive: true
      }
    ],
    loading: false,
    isAuthenticated: true,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    addRole: vi.fn(),
    hasRole: vi.fn((role) => role === 'actor')
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
    expect(screen.getByTestId('responsive-section')).toBeInTheDocument();
    
    // Check if dashboard title is rendered (Role-specific badge)
    expect(screen.getByText('Artist Portal')).toBeInTheDocument();
    expect(screen.getByText('Orchestrating your next major performance.')).toBeInTheDocument();
  }, 10000);

  it('should render stats cards', () => {
    render(<EnhancedDashboard />);
    
    // Check if stats grid is rendered
    expect(screen.getByTestId('stats-grid')).toBeInTheDocument();
  }, 10000);

  it('should render quick actions in the Command Hub', () => {
    render(<EnhancedDashboard />);
    
    // Check if Command Hub title is there
    expect(screen.getByText('Command Hub')).toBeInTheDocument();
    
    // Check if quick actions are rendered (New labels)
    expect(screen.getByText('Find Castings')).toBeInTheDocument();
    expect(screen.getByText('Edit Showreel')).toBeInTheDocument();
    expect(screen.getByText('My Auditions')).toBeInTheDocument();
    expect(screen.getByText('AI Script Analysis')).toBeInTheDocument();
  }, 10000);

  it('should switch between tabs', () => {
    render(<EnhancedDashboard />);
    
    // Check if tabs are rendered (New labels)
    expect(screen.getByText('Recent Jobs')).toBeInTheDocument();
    expect(screen.getByText('My Projects')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    
    // Check if default tab content button is shown
    expect(screen.getByText('View All Jobs')).toBeInTheDocument();
  }, 10000);

  it('should render intelligence stream section', () => {
    render(<EnhancedDashboard />);
    
    // Check if Intelligence Stream section is rendered
    expect(screen.getByText('Intelligence Stream')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Recent Connections')).toBeInTheDocument();
  }, 10000);

  it('should handle quick action button clicks', () => {
    render(<EnhancedDashboard />);
    
    // Click on a quick action button (New label)
    const browseButton = screen.getByText('Find Castings');
    fireEvent.click(browseButton);
    
    // Check if navigation was called
    expect(mockSetLocation).toHaveBeenCalledWith('/jobs?type=casting');
  }, 10000);

  it('should render different dashboard based on user role', async () => {
    // Mock a producer role
    const auth = await import('../lib/auth');
    vi.spyOn(auth, 'useAuth').mockReturnValue({
      user: {
        id: 'user-2',
        email: 'producer@example.com',
        firstName: 'Demo',
        lastName: 'Producer',
        isVerified: true
      },
      roles: [
        {
          id: 'role-2',
          userId: 'user-2',
          role: 'producer',
          isActive: true
        }
      ],
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      addRole: vi.fn(),
      hasRole: vi.fn((role) => role === 'producer')
    } as any);
    
    render(<EnhancedDashboard />);
    
    // Check if producer dashboard is rendered
    expect(screen.getByText('Producer HQ')).toBeInTheDocument();
    expect(screen.getByText('Commanding the production pipeline.')).toBeInTheDocument();
  }, 10000);
});
