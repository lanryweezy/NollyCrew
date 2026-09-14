import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../lib/auth-context';

// Mock the useAuth hook
vi.mock('../lib/auth-context', () => ({
  useAuth: vi.fn()
}));

describe('ProtectedRoute', () => {
  const mockChildren = <div data-testid="protected-content">Protected Content</div>;
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' } as any;
  });

  afterAll(() => {
    (window as any).location = originalLocation;
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
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated and not loading', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      loading: false,
      roles: []
    });

    render(<ProtectedRoute>{mockChildren}</ProtectedRoute>);
    expect(window.location.href).toBe('/login');
  });
});
