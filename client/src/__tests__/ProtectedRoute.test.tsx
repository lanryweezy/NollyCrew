import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../lib/auth';

// Mock the useAuth hook
vi.mock('../lib/auth', () => ({
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

    render(<ProtectedRoute>{mockChildren}</ProtectedRoute>);
    
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('should redirect to login when not authenticated and not loading', async () => {
    
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      loading: false,
      roles: []
    });

    render(<ProtectedRoute>{mockChildren}</ProtectedRoute>);
    
    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/login');
    });
  });

  it('should redirect to onboarding when authenticated but no roles', async () => {
    
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      loading: false,
      roles: []
    });

    render(<ProtectedRoute>{mockChildren}</ProtectedRoute>);
    
    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('should bypass authentication in demo mode', () => {
    // Temporarily set demo mode
    const originalEnv = process.env;
    process.env = { ...originalEnv, NODE_ENV: 'development' };
    
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      loading: false,
      roles: []
    });

    render(<ProtectedRoute>{mockChildren}</ProtectedRoute>);
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    
    // Restore environment
    process.env = originalEnv;
  });
});