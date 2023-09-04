import React from "react";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/styles";

interface LabelWithValueProps {
  label: string;
  value: string;
  strikeValue?: string;
  jumpValue?: string;
}

const useStyles = makeStyles({
  root: {
    fontSize: "1.2rem",
    marginTop: "1rem",
  },
  label: {
    color: "#898989",
  },
  labelValue: {
    marginLeft: "1rem",
  },
  strike: {
    textDecoration: "line-through",
    marginRight: "1.2rem",
  },
  jumpChar: {
    marginLeft: "1rem",
    fontSize: "1.5rem",
  },
});

const LabelWithValue: React.VFC<LabelWithValueProps> = ({
  label,
  value,
  strikeValue,
  jumpValue,
}) => {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <span className={classes.label}>{label}</span>
      {strikeValue ? (
        <>
          <span className={`${classes.labelValue} ${classes.strike}`}>
            {strikeValue}
          </span>
          <span className={classes.labelValue}>{value}</span>
        </>
      ) : jumpValue ? (
        <>
          <span className={classes.labelValue}>{jumpValue}</span>
          <span className={classes.jumpChar}>→</span>
          <span className={classes.labelValue}>{value}</span>
        </>
      ) : (
        <span className={classes.labelValue}>{value}</span>
      )}
    </Box>
  );
};

export default LabelWithValue;
