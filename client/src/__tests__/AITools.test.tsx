import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AITools from '../pages/AITools';
import * as api from '../lib/api';

// Mock the API tools
vi.mock('../lib/api', () => ({
  aiTools: {
    analyzeScript: vi.fn(),
    generateCastingRecommendations: vi.fn(),
    optimizeSchedule: vi.fn(),
    generateMarketingContent: vi.fn(),
    directorChat: vi.fn(),
    translateScript: vi.fn()
  },
  queryClient: {
    invalidateQueries: vi.fn()
  }
}));

// Mock the toast component
vi.mock('../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock window.scroll
Object.defineProperty(window, 'scroll', {
  value: vi.fn(),
  writable: true
});

describe('AITools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all AI tools cards', () => {
    render(<AITools />);
    
    expect(screen.getByText('Script Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Casting AI')).toBeInTheDocument();
    expect(screen.getByText('Schedule Optimizer')).toBeInTheDocument();
    expect(screen.getByText('Marketing Content')).toBeInTheDocument();
    expect(screen.getByText('Virtual Director')).toBeInTheDocument();
    expect(screen.getByText('Script Translator')).toBeInTheDocument();
  });

  it('should switch between different AI tools', async () => {
    render(<AITools />);
    
    // Default tab might require clicking to show inputs, or they are shown immediately.
    // The previous test suite had a problem finding the placeholder. Let's click the card first.
    const scriptCard = screen.getByText('Script Breakdown');
    fireEvent.click(scriptCard);
    
    // Check if default tool (Script Breakdown) inputs are shown
    expect(screen.getByPlaceholderText(/Paste your full script here/)).toBeInTheDocument();
    
    // Click on Casting AI card
    const castingCard = screen.getByText('Casting AI');
    fireEvent.click(castingCard);
    
    // Check if Casting tool inputs are shown
    expect(screen.getByPlaceholderText(/e.g. Lead/)).toBeInTheDocument();
  });

  it('should handle script analysis functionality', async () => {
    const mockAnalysisResult = {
      scenes: 10,
      characters: ['John', 'Jane'],
      sceneList: []
    };
    
    (api.aiTools.analyzeScript as any).mockResolvedValue(mockAnalysisResult);
    
    render(<AITools />);
    
    // Click on Script Breakdown card to ensure it's active
    const scriptCard = screen.getByText('Script Breakdown');
    fireEvent.click(scriptCard);
    
    // Enter script text
    const textarea = screen.getByPlaceholderText(/Paste your full script here/);
    fireEvent.change(textarea, { target: { value: 'INT. COFFEE SHOP - DAY' } });

    // Click analyze
    const analyzeBtn = screen.getByText('Run Full Breakdown');
    fireEvent.click(analyzeBtn);

    // Check if API was called
    await waitFor(() => {
      expect(api.aiTools.analyzeScript).toHaveBeenCalledWith('INT. COFFEE SHOP - DAY');
    });
  });
});
