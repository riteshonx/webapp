import React from 'react';
import { render, screen } from '@testing-library/react';
import FormsLanding from './FormsList';

test('Renders Open Forms', () => {
  render(<FormsLanding />);
  const linkElement = screen.getByText(/Open Forms/i);
  expect(linkElement).toBeInTheDocument();
});
