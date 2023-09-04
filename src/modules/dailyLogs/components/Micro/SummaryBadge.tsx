import React from "react";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/styles";

function ifSmallOr(value: string, option1: string, option2: string) {
  if (value === "s") {
    return option1 + "rem";
  }
  return option2 + "rem";
}

interface BadgeProps {
  value: string;
  size?: "s" | "m";
  style?: React.CSSProperties;
}

const useStyles = makeStyles({
  root: {
    background: "#ff6a3d",
    color: "#fff",
    textTransform: "uppercase",
    display: "inline-block",
    letterSpacing: "1px",
    fontWeight: (props: any) => (props.size === "s" ? "normal" : "bold"),
    fontSize: (props: any) => ifSmallOr(props.size, "0.6", "1.2"),
    padding: (props: any) => ifSmallOr(props.size, "0.2", "1"),
    borderRadius: (props: any) => ifSmallOr(props.size, "0.15", "0.5"),
  },
  nonCritical:{
    background: "#0D444B",
    color: "#fff",
    width: "50%",
    display: "inline-block",
    textAlign: 'center',
    fontWeight: (props: any) => (props.size === "s" ? "normal" : "bold"),
    fontSize: (props: any) => ifSmallOr(props.size, "0.6", "1.2"),
    padding: (props: any) => ifSmallOr(props.size, "0.2", "1"),
    borderRadius: (props: any) => ifSmallOr(props.size, "0.15", "0.5"),
  },
  hasValue:{
    width: "50%",
    display: "inline-block",
    textAlign: 'center',
    fontWeight: (props: any) => (props.size === "s" ? "normal" : "bold"),
    fontSize: (props: any) => ifSmallOr(props.size, "0.6", "1.2"),
    padding: (props: any) => ifSmallOr(props.size, "0.2", "1"),
    borderRadius: (props: any) => ifSmallOr(props.size, "0.15", "0.5"),
  }
  
});

const SummaryBadge: React.VFC<BadgeProps> = ({ style, value, size = "m" }) => {
  const classes = useStyles({ size });
  return (
    <>
        {value == 'Critical'?
        <Box style={style} className={classes.root}>
            {value}
          </Box>
        :(value == '--'?      
        <Box className={classes.nonCritical}>
             {value}
         </Box>
         :
         <Box className={classes.hasValue}>
         {value}
        </Box>)
        }
    </>
  );
};

export default SummaryBadge;
