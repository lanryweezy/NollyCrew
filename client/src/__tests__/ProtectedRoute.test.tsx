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

  it('should render loading spinner when loading', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      loading: true,
      roles: []
    });

    const { container } = render(<ProtectedRoute>{mockChildren}</ProtectedRoute>);
    
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated and not loading', async () => {
    const originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: '' };

    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      loading: false,
      roles: []
    });

    render(<ProtectedRoute>{mockChildren}</ProtectedRoute>);
    
    await waitFor(() => {
      expect(window.location.href).toBe('/login');
    });

    (window as any).location = originalLocation;
  });

  });
