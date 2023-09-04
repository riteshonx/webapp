import { ReactText, FC } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  root: {
    fontSize: (props: any) => props.size,
    color: (props: any) => props.color,
    marginTop: (props: any) => (props.collapseMargin ? 0 : "0.8rem"),
    fontWeight: "bolder",
    // marginLeft: (props:any) => props.marginLeft
  },
});

interface BoldTextProps {
  size?: string;
  color?: string;
  collapseMargin?: boolean;
  children: ReactText;
  style?: React.CSSProperties;
  marginLeft?: string;
}

const BoldText: FC<BoldTextProps> = ({
  size = "1.8rem",
  color = "#000",
  marginLeft ="5rem",
  collapseMargin = false,
  style,
  children,
}) => {
  const classes = useStyles({ size, color, collapseMargin, marginLeft });
  return (
    <Typography style={style} variant="h5" classes={{ root: classes.root }}>
      {children}
    </Typography>
  );
};

export default BoldText;
