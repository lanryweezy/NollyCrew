import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LandingPage from '../components/LandingPage';

// Mock wouter
const mockSetLocation = vi.fn();
vi.mock('wouter', () => ({
  useLocation: () => [null, mockSetLocation]
}));

// Mock components that might cause issues
vi.mock('../components/Hero', () => ({
  default: () => <div data-testid="hero">Hero Component</div>
}));

vi.mock('../components/Navigation', () => ({
  default: () => <div data-testid="navigation">Navigation Component</div>
}));

vi.mock('../components/ThemeToggle', () => ({
  default: () => <div data-testid="theme-toggle">Theme Toggle</div>
}));

vi.mock('../components/ProfileCard', () => ({
  default: ({ name }: { name: string }) => <div data-testid="profile-card">{name}</div>
}));

vi.mock('../components/JobCard', () => ({
  default: ({ title }: { title: string }) => <div data-testid="job-card">{title}</div>
}));

vi.mock('../components/ProjectCard', () => ({
  default: ({ title }: { title: string }) => <div data-testid="project-card">{title}</div>
}));

// Mock responsive components
vi.mock('../components/ResponsiveSection', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-section">{children}</div>
}));

vi.mock('../components/ResponsiveTypography', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-typography">{children}</div>
}));

vi.mock('../components/ResponsiveButton', () => ({
  default: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button data-testid="responsive-button" onClick={onClick}>
      {children}
    </button>
  )
}));

vi.mock('../components/ResponsiveGrid', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-grid">{children}</div>
}));

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the landing page with all main sections', () => {
    render(<LandingPage />);
    
    // Check if main components are rendered
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    
    // Check if main sections are rendered
    expect(screen.getByText('Demo Application')).toBeInTheDocument();
    expect(screen.getByText(/Everything You Need for/)).toBeInTheDocument();
    expect(screen.getByText('Discover Amazing Talent & Projects')).toBeInTheDocument();
    expect(screen.getByText('What Industry Leaders Say')).toBeInTheDocument();
    expect(screen.getByText(/Ready to Transform/)).toBeInTheDocument();
  });

  it('should switch tabs when clicking on tab buttons', () => {
    render(<LandingPage />);
    
    // Initially should show actors
    expect(screen.getByText('Funke Akindele')).toBeInTheDocument();
    
    // Click on crew tab
    const crewTab = screen.getByTestId('tab-crew');
    fireEvent.click(crewTab);
    
    // Should now show crew member
    expect(screen.getByText('Tunde Cinematography')).toBeInTheDocument();
    
    // Click on producers tab
    const producersTab = screen.getByTestId('tab-producers');
    fireEvent.click(producersTab);
    
    // Should now show producer
    expect(screen.getByText('Kemi Adebayo')).toBeInTheDocument();
  });

  it('should navigate to dashboard when clicking demo button', () => {
    
    render(<LandingPage />);
    
    const demoButton = screen.getByText('Demo Application');
    fireEvent.click(demoButton);
    
    expect(mockSetLocation).toHaveBeenCalledWith('/dashboard');
  });

  it('should render all features', () => {
    render(<LandingPage />);
    
    expect(screen.getByText('Connect & Collaborate')).toBeInTheDocument();
    expect(screen.getByText('AI-Powered Matching')).toBeInTheDocument();
    expect(screen.getByText('Complete Project Management')).toBeInTheDocument();
    expect(screen.getByText('Secure Payments')).toBeInTheDocument();
    expect(screen.getByText('Global Reach')).toBeInTheDocument();
    expect(screen.getByText('Industry Tools')).toBeInTheDocument();
  });

  it('should render testimonials', () => {
    render(<LandingPage />);
    
    expect(screen.getByText('Kemi Adetiba')).toBeInTheDocument();
    expect(screen.getByText('Richard Mofe-Damijo')).toBeInTheDocument();
    expect(screen.getByText('Jade Osiberu')).toBeInTheDocument();
  });
});