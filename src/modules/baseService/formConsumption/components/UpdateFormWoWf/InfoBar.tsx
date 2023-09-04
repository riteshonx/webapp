import { FC } from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Add as PlusIcon } from "@material-ui/icons";

const DARK_GREEN = "#171d25";

const useStyles = makeStyles(() => ({
  itemLabel: {
    fontSize: "1.4rem",
    fontWeight: "bold",
  },
  itemValue: {
    color: DARK_GREEN,
    fontSize: "1.4rem",
    fontWeight: "bold",
  },
  followerText: {
    fontSize: "1.1rem",
    textDecoration: "underline",
    color: "grey",
  },
}));

interface InfoBarPropsType {
  createdAt: string;
  createdBy: string;
  status: string;
  isImported:boolean;
}

interface InfoBarItemPropsType {
  label: string;
  component: React.ReactElement;
}

const InfoBarItem: FC<InfoBarItemPropsType> = ({ label, component }) => {
  const classes = useStyles();
  return (
    <Box display="flex" alignItems="center" marginLeft="3rem">
      <Typography variant="h3" classes={{ h3: classes.itemLabel }}>
        {label}
      </Typography>
      <Box marginLeft="0.8rem">{component}</Box>
    </Box>
  );
};

const InfoBar: FC<InfoBarPropsType> = ({ createdAt, createdBy, status,isImported }) => {
  const classes = useStyles();
  return (
    <Box
      padding="2rem 3rem 2rem 0"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box display="flex">
        <InfoBarItem
          label="Date created:"
          component={
            <Typography variant="h3" classes={{ h3: classes.itemValue }}>
              {createdAt}
            </Typography>
          }
        />
       {!isImported &&         
       <InfoBarItem
          label="Created by:"
          component={
            <Typography variant="h3" classes={{ h3: classes.itemValue }}>
              {createdBy}
            </Typography>
          }
        />}
        <InfoBarItem
          label=""
          component={
            <Box
              color="#fff"
              padding="0.3rem 1.1rem"
              borderRadius="2rem"
              bgcolor={DARK_GREEN}
            >
              {status}
            </Box>
          }
        />
      </Box>
      {/* <Box display="flex" alignItems="center">
        <PlusIcon style={{ fontSize: "1rem", color: "grey" }} />
        <Typography variant="h5" classes={{ h5: classes.followerText }}>
          Add Followers
        </Typography>
      </Box> */}
    </Box>
  );
};

export default InfoBar;
