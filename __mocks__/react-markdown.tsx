import React from 'react';

// Mock ReactMarkdown component for Jest tests
const ReactMarkdown = ({ children }: { children: string }) => {
  return <div data-testid="mock-markdown">{children}</div>;
};

export default ReactMarkdown;
