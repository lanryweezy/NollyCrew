import { vi } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';
import './server/__tests__/setup';

global.React = React;

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver
});

// Mock framer-motion to avoid animation related test failures
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal() as any;
  const React = (await import('react')).default;
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: (props: any) => React.createElement('div', props),
      section: (props: any) => React.createElement('section', props),
      h1: (props: any) => React.createElement('h1', props),
      h2: (props: any) => React.createElement('h2', props),
      p: (props: any) => React.createElement('p', props),
    },
    AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
  };
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver
});