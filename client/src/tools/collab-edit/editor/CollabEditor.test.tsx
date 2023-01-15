import React from 'react';
import { render, screen } from '@testing-library/react';
import CollabEditor from './CollabEditor';

test('renders learn react link', () => {
  render(<CollabEditor />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
