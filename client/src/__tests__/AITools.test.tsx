import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AITools from '../pages/AITools';

// Mock dependencies
vi.mock('wouter', () => ({
  useLocation: () => [null, vi.fn()]
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
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-grid">{children}</div>
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

describe('AITools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the AI tools page with all main components', () => {
    render(<AITools />);
    
    // Check if main components are rendered
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-section')).toBeInTheDocument();
    
    // Check if page title is rendered
    expect(screen.getByRole('heading', { name: /Intelligence Center/i })).toBeInTheDocument();
    expect(screen.getByText('The algorithmic heart of your next blockbuster.')).toBeInTheDocument();
  }, 10000);

  it('should render all AI tool tabs', () => {
    render(<AITools />);
    
    // Check if all tabs are rendered in the sidebar
    expect(screen.getByText('Script')).toBeInTheDocument();
    expect(screen.getByText('Casting')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  }, 10000);

  it('should switch between different AI tools', async () => {
    render(<AITools />);
    
    // Check if default tab (Script Analysis) content is shown
    expect(screen.getByText('Script Analysis')).toBeInTheDocument();
    
    // Switch to Casting tab via Sidebar
    const castingTool = screen.getByText('Casting');
    fireEvent.click(castingTool);
    
    // Check if Casting tab content is shown (Placeholder for now since it shows upgraded polish message)
    expect(screen.getByText(/This module is receiving the final cinematic polish/)).toBeInTheDocument();
  }, 10000);

  it('should handle script analysis functionality', () => {
    render(<AITools />);
    
    // Fill in script text
    const scriptTextarea = screen.getByPlaceholderText(/Paste your script text here/) as HTMLTextAreaElement;
    fireEvent.change(scriptTextarea, { target: { value: 'This is a test script for analysis.' } });
    
    // Click analyze button
    const analyzeButton = screen.getByText('Execute Intelligence');
    fireEvent.click(analyzeButton);
    
    // Check if analysis started (button should show loading state)
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  }, 10000);

  it('should render AI tools sidebar with all tools', () => {
    render(<AITools />);
    
    // Check if AI tools are listed in sidebar using labels
    expect(screen.getByText('Script')).toBeInTheDocument();
    expect(screen.getByText('Director')).toBeInTheDocument();
    expect(screen.getByText('Casting')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
  }, 10000);

  it('should render credits and tokens info', () => {
    render(<AITools />);
    
    // Check if credits section is rendered
    expect(screen.getByText('Credits Available')).toBeInTheDocument();
    expect(screen.getByText('750 / 1000 tokens remaining')).toBeInTheDocument();
  }, 10000);
});