import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import EnhancedDashboard from '../components/EnhancedDashboard';
import { useAuth } from '../lib/auth-context';

// Mock the useAuth hook
vi.mock('../lib/auth-context', () => ({
  useAuth: vi.fn()
}));

// Mock the queryClient
vi.mock('../lib/api', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockReturnValue({
    data: null,
    isLoading: false,
    error: null
  }),
  useMutation: vi.fn().mockReturnValue({
    mutate: vi.fn(),
    isPending: false
  })
}));

// Mock wouter
const mockSetLocation = vi.fn();
vi.mock('wouter', () => ({
  useLocation: () => ['/', mockSetLocation],
  Link: ({ children }: any) => <a>{children}</a>
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    h1: ({ children, className, ...props }: any) => <h1 className={className} {...props}>{children}</h1>,
    p: ({ children, className, ...props }: any) => <p className={className} {...props}>{children}</p>,
    section: ({ children, className, ...props }: any) => <section className={className} {...props}>{children}</section>,
    button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock UI components
vi.mock('../components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => <div className={`card ${className}`} {...props}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={`card-header ${className}`}>{children}</div>,
  CardTitle: ({ children, className }: any) => <h3 className={`card-title ${className}`}>{children}</h3>,
  CardDescription: ({ children, className }: any) => <p className={`card-description ${className}`}>{children}</p>,
  CardContent: ({ children, className }: any) => <div className={`card-content ${className}`}>{children}</div>,
  CardFooter: ({ children, className }: any) => <div className={`card-footer ${className}`}>{children}</div>,
}));

vi.mock('../components/ui/button', () => ({
  Button: ({ children, className, onClick, ...props }: any) => (
    <button className={`button ${className}`} onClick={onClick} {...props}>{children}</button>
  )
}));

vi.mock('../components/ui/badge', () => ({
  Badge: ({ children, className }: any) => <span className={`badge ${className}`}>{children}</span>
}));

// Mock lucide icons - Using Proxy to mock all possible icons to avoid missing exports
vi.mock('lucide-react', () => {
  const React = require('react');
  return new Proxy({}, {
    get: function(target, prop) {
      if (prop === '__esModule') return true;
      if (prop === '$$typeof') return undefined; // Need to handle React internals like forwardRef correctly but simply ignoring $$typeof is enough here
      return () => <div data-testid={`icon-${String(prop).toLowerCase()}`} />;
    }
  });
});

describe('EnhancedDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default to producer role for most tests
    (useAuth as any).mockReturnValue({
      user: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        role: 'producer'
      },
      roles: ['producer'],
      logout: vi.fn()
    });
  });

  it('should render the dashboard structure', () => {
    render(<EnhancedDashboard />);
    
    // Check if main sections are rendered
    expect(screen.getByTestId('responsive-section')).toBeInTheDocument();
    expect(screen.getByText(/Commanding the production pipeline/)).toBeInTheDocument();
  });
});
