import { Card, CardContent, CircularProgressProps } from "@material-ui/core";
import { CircularProgress } from "@mui/material";
import { styled } from "@mui/styles";

const LoadingSpinnerContainer = styled("div")({
  display: "flex",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
});

const StyledCardContent = styled(CardContent)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

type color =
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning"
  | "inherit";

export function LoadingSpinner({ color }: { color?: color }) {
  return (
    <LoadingSpinnerContainer>
      <CircularProgress color={color || "primary"} />
    </LoadingSpinnerContainer>
  );
}

export function LoadingSpinnerCard({
  className,
  contentStyle,
  color,
}: {
  className?: string;
  contentStyle?: Record<string, unknown>;
  color?: color;
}) {
  return (
    <Card className={className}>
      <StyledCardContent style={contentStyle}>
        <LoadingSpinner color={color} />
      </StyledCardContent>
    </Card>
  );
}
