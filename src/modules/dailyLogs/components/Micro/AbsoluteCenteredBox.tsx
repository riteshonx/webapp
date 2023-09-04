import React from "react";
import Box from "@material-ui/core/Box";

const AbsoluteCenteredBox = ({
  color,
  children,
  style,
}: {
  color?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <Box
    color={color}
    position="absolute"
    textAlign="center"
    top="50%"
    left="50%"
    style={{ transform: "translate(-50%, 25%)", ...style }}
  >
    {children}
  </Box>
);

export default AbsoluteCenteredBox;
