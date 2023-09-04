import { FC } from "react";
import ArrowLeft from "@material-ui/icons/ArrowLeft";
import ArrowRight from "@material-ui/icons/ArrowRight";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import { Typography } from "@material-ui/core";
import TextContent from "../Micro/TextContent";

interface DateNavigatorProps {
  onNextDateClick: () => void;
  onPrevDateClick: () => void;
  dateValue: string;
}

const DateNavigator: FC<DateNavigatorProps> = ({
  onNextDateClick,
  onPrevDateClick,
  dateValue,
}) => {
  return (
    <Box display="flex" alignItems="center" marginLeft="1rem">
      {/* <IconButton onClick={onPrevDateClick}>
        <ArrowLeft style={{ fontSize: "3rem" }} />
      </IconButton> */}
      <Typography
        variant="h6"
        style={{
          fontWeight: "bold",
          fontSize: "1.8rem",
          color: "#797979",
          marginLeft: "2rem",
        }}
      >
        {dateValue} UTC
      </Typography>
      {/* <IconButton onClick={onNextDateClick}>
        <ArrowRight style={{ fontSize: "3rem" }} />
      </IconButton> */}
    </Box>
  );
};

export default DateNavigator;
