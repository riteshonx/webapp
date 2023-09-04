import React from "react";
import { render, screen } from "@testing-library/react";
import Login from "./Login";

test("Render Login Text", () => {
  render(<Login />);
  const loginText = screen.getByText(/login/i);
  expect(loginText).toBeInTheDocument();
});
