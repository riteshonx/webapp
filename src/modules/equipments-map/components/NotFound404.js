import { Typography } from "@mui/material";

export default function NotFound404() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Typography variant="h2">404</Typography>
      <Typography>Not Found</Typography>
    </div>
  );
}
