import React from "react";
import CheckCircle from "@material-ui/icons/CheckCircle";

export const CheckCircleIcon = ({
  disabled = false,
  style,
}: {
  disabled?: boolean;
  style?: React.CSSProperties;
}) => {
  return (
    <CheckCircle
      style={{
        fontSize: "1.6rem",
        fill: disabled ? "#b7c0c6" : "#105c6b",
        ...style,
      }}
    />
  );
};
