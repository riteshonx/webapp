import { render, screen, cleanup } from "@testing-library/react";

import FieldType from "./FieldType";

test('Render FieldType component', () => {
    render(<FieldType />);
    const container = screen.getByTestId('create-FieldType');
    expect(container).toBeInTheDocument();
});
  