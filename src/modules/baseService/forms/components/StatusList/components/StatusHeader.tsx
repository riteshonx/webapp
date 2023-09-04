import { FC } from "react";
import Box from "@material-ui/core/Box";

const HeaderText: FC = ({ children }) => (
  <Box fontSize="1.2rem" fontWeight="bold">
    {children}
  </Box>
);

const StatusHeader = () => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <HeaderText>Status</HeaderText>
      <HeaderText>Closed/Open</HeaderText>
      <HeaderText>Action</HeaderText>
    </Box>
  );
};

export default StatusHeader;
