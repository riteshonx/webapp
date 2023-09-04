import React from 'react';
import { render, screen } from '@testing-library/react';
import CreateTask from './CreateRecipeTask';

test('Renders Open Forms', () => {
  render(<CreateTask />);
//   const linkElement = screen.getByText(/Open Forms/i);
//   expect(linkElement).toBeInTheDocument();
});