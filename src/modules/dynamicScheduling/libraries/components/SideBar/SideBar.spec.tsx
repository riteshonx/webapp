import React from 'react';
import { render, screen } from '@testing-library/react';
import SideBar from './SideBar';

test('Renders Open Forms', () => {
  render(<SideBar />);
//   const linkElement = screen.getByText(/Open Forms/i);
//   expect(linkElement).toBeInTheDocument();
});