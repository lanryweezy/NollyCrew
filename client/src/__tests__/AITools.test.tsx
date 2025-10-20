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
    expect(screen.getByRole('heading', { name: /AI Tools Suite/i })).toBeInTheDocument();
    expect(screen.getByText('Leverage advanced AI and machine learning to enhance your film production workflow')).toBeInTheDocument();
  });

  it('should render all AI tool tabs', () => {
    render(<AITools />);
    
    // Check if all tabs are rendered
    expect(screen.getAllByText('Script Analysis')[0]).toBeInTheDocument();
    expect(screen.getByText('Casting')).toBeInTheDocument();
    expect(screen.getByText('Scheduling')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  });

  it('should switch between different AI tools', async () => {
    render(<AITools />);
    
    // Check if default tab (Script Analysis) content is shown
    expect(screen.getByText('Script Analysis Tool')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload Script')).toBeInTheDocument();
    expect(screen.getByLabelText('Script Text')).toBeInTheDocument();
    
    // Switch to Casting tab
    const castingTab = screen.getByText('Casting');
    fireEvent.click(castingTab);
    
    // Check if Casting tab content is shown
    expect(await screen.findByText('Casting Recommendations')).toBeInTheDocument();
    expect(await screen.findByPlaceholderText('e.g., Lead Actor, Cinematographer')).toBeInTheDocument();
    expect(await screen.findByLabelText('Role')).toBeInTheDocument();
    expect(await screen.findByLabelText('Requirements')).toBeInTheDocument();
  });

  it('should handle script analysis functionality', () => {
    render(<AITools />);
    
    // Fill in script text
    const scriptTextarea = screen.getByLabelText('Script Text') as HTMLTextAreaElement;
    fireEvent.change(scriptTextarea, { target: { value: 'This is a test script for analysis.' } });
    
    // Click analyze button
    const analyzeButton = screen.getByText('Analyze Script with AI');
    fireEvent.click(analyzeButton);
    
    // Check if analysis started (button should show loading state)
    expect(screen.getByText('Analyzing Script...')).toBeInTheDocument();
  });

  it('should render AI tools sidebar with all tools', () => {
    render(<AITools />);
    
    // Check if AI tools are listed in sidebar
    expect(screen.getAllByText('Script Analysis')[0]).toBeInTheDocument();
    expect(screen.getByText('Casting Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Schedule Optimization')).toBeInTheDocument();
    expect(screen.getByText('Marketing Content Generation')).toBeInTheDocument();
  });

  it('should switch tool view when clicking on sidebar items', () => {
    render(<AITools />);
    
    // Click on Casting Recommendations in sidebar
    const castingTool = screen.getAllByText('Casting Recommendations')[0];
    fireEvent.click(castingTool);
    
    // Check if Casting tab is now active
    expect(screen.getAllByText('Casting Recommendations')[0]).toBeInTheDocument();
  });

  it('should render key features section', () => {
    render(<AITools />);
    
    // Check if features section is rendered
    expect(screen.getByText('Key Features')).toBeInTheDocument();
    expect(screen.getByText('Advanced AI algorithms')).toBeInTheDocument();
    expect(screen.getByText('Bias detection and fairness')).toBeInTheDocument();
    expect(screen.getByText('Real-time processing')).toBeInTheDocument();
  });

  it('should render usage tips section', () => {
    render(<AITools />);
    
    // Check if usage tips section is rendered
    expect(screen.getByText('Usage Tips')).toBeInTheDocument();
    expect(screen.getByText('For Best Results')).toBeInTheDocument();
    expect(screen.getByText('Privacy Notice')).toBeInTheDocument();
    expect(screen.getByText('Need Help?')).toBeInTheDocument();
  });
});