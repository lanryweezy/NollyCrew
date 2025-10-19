import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../lib/auth';

// Mock the useAuth hook
vi.mock('../lib/auth', () => ({
  useAuth: vi.fn()
}));

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: () => [null, vi.fn()]
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
    
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated and not loading', async () => {
    const mockSetLocation = vi.fn();
    vi.mock('wouter', () => ({
      useLocation: () => [null, mockSetLocation]
    }));
    
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
    const mockSetLocation = vi.fn();
    vi.mock('wouter', () => ({
      useLocation: () => [null, mockSetLocation]
    }));
    
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