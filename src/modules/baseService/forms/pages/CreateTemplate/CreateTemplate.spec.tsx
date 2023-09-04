
import React from 'react';
import { render, screen } from '@testing-library/react';
import  CreateTemplate from './CreateTemplate';

test('Renders Create Template', () => {
  render(< CreateTemplate />);
  const linkElement = screen.getByText(/Create Template/i);
  expect(linkElement).toBeInTheDocument();
});
