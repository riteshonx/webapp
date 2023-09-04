import React from 'react';
import { render, screen } from '@testing-library/react';
import Main from './Main';

test('Renders Open Forms', () => {
  render(<Main />);
//   const linkElement = screen.getByText(/Open Forms/i);
//   expect(linkElement).toBeInTheDocument();
});
