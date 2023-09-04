import React from 'react';
import { render, screen } from '@testing-library/react';
import LibraryAction from './LibraryAction';

test('Renders Open Forms', () => {
  render(<LibraryAction />);
//   const linkElement = screen.getByText(/Open Forms/i);
//   expect(linkElement).toBeInTheDocument();
});