import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RealTimeChat from '../components/RealTimeChat';

// Mock the useWebSocket hook
vi.mock('../lib/websocket', () => ({
  useWebSocket: () => ({
    sendMessage: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    joinProject: vi.fn(),
    leaveProject: vi.fn(),
  }),
}));

describe('RealTimeChat', () => {
  const mockUsers = [
    { id: '1', name: 'John Doe', isOnline: true },
    { id: '2', name: 'Jane Smith', isOnline: true },
  ];

  it('should render the chat component', () => {
    render(
      <RealTimeChat 
        projectId="test-project" 
        users={mockUsers} 
      />
    );
    
    expect(screen.getByText('Team Chat')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });

  it('should display online user count', () => {
    render(
      <RealTimeChat 
        projectId="test-project" 
        users={mockUsers} 
      />
    );
    
    // Initially no users are online until WebSocket events
    expect(screen.getByText('0 online')).toBeInTheDocument();
  });

  it('should allow sending messages', () => {
    render(
      <RealTimeChat 
        projectId="test-project" 
        users={mockUsers} 
      />
    );
    
    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button');
    
    // Type a message
    fireEvent.change(input, { target: { value: 'Hello, world!' } });
    
    // Send button should be enabled
    expect(sendButton).not.toBeDisabled();
  });

  it('should handle empty messages', () => {
    render(
      <RealTimeChat 
        projectId="test-project" 
        users={mockUsers} 
      />
    );
    
    const sendButton = screen.getByRole('button');
    
    // Send button should be disabled when input is empty
    expect(sendButton).toBeDisabled();
  });
});