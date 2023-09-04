import { Box, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const DARK_GREEN = "#105c6b";
const DARK_GREEN_HOVER = "#17434c";

const useStyles = makeStyles(() => ({
  outlined: {
    padding: "0.5rem 1.7rem",
    fontSize: "1.4rem",
    color: DARK_GREEN,
    minWidth: "70px",
    textTransform: "none",
    border: `1px solid ${DARK_GREEN}`,
  },
  root: {
    padding: "0.5rem 1.7rem",
    fontSize: "1.4rem",
    color: "#fff",
    minWidth: "70px",
    background: DARK_GREEN,
    marginLeft: "3rem",
    textTransform: "none",
    "&:hover": { background: DARK_GREEN_HOVER },
  },
}));
const ActionBar = () => {
  const classes = useStyles();

  return (
    <Box
      position="absolute"
      bottom={0}
      right={0}
      padding="2.5rem"
      boxShadow="#e6e6e6 0px -1px 2px 0px"
      width="calc(100% - 72px)"
      display="flex"
      flexDirection="row-reverse"
    >
      <Button classes={{ root: classes.root }}>Update</Button>
      <Button variant="outlined" classes={{ outlined: classes.outlined }}>
        Cancel
      </Button>
    </Box>
  );
};

export default ActionBar;
