import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../lib/auth-context';

// Mock the useAuth hook
vi.mock('../lib/auth-context', () => ({
  useAuth: vi.fn()
}));

// Mock wouter
const mockSetLocation = vi.fn();
vi.mock('wouter', () => ({
  useLocation: () => [null, mockSetLocation]
}));

// Mock Skeleton component
vi.mock('../components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />
}));

describe('ProtectedRoute', () => {
  const mockChildren = <div data-testid="protected-content">Protected Content</div>;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when authenticated', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      loading: false,
      roles: []
    });

    render(<ProtectedRoute>{mockChildren}</ProtectedRoute>);
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should render skeleton when loading', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      loading: true,
      roles: []
    });

    const { container } = render(<ProtectedRoute>{mockChildren}</ProtectedRoute>);
    
    // Test the spinner elements instead of Skeleton mock
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated and not loading', async () => {
    
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      loading: false,
      roles: []
    });

    // Mock window.location.href
    const originalLocation = window.location;
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { ...originalLocation, href: '' } as any;

    render(<ProtectedRoute>{mockChildren}</ProtectedRoute>);
    
    expect(window.location.href).toBe('/login');

    // Restore window.location
    // @ts-ignore
    window.location = originalLocation;
  });

});
