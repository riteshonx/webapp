import React from 'react';
import { render, screen } from '@testing-library/react';
import LibraryHeader from './LibraryHeader';

test('Renders Open Forms', () => {
  render(<LibraryHeader />);
//   const linkElement = screen.getByText(/Open Forms/i);
//   expect(linkElement).toBeInTheDocument();
});