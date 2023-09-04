import { FC } from "react";
import { Box, IconButton } from "@material-ui/core";
import { ArrowBackIos as BackArrow } from "@material-ui/icons";

interface HeaderProps {
  heading: string;
}

const Header: FC<HeaderProps> = ({ heading }) => {
  return (
    <Box
      padding="1.5rem"
      boxShadow="#f1f1f1 0px 3px 2px 0px"
      display="flex"
      alignItems="center"
    >
      <IconButton>
        <BackArrow />
      </IconButton>
      <h2>{heading}</h2>
    </Box>
  );
};

export default Header;
