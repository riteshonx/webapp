import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  root: {
    marginTop: (props: any) => (props.collapseMargin ? 0 : "0.5rem"),
    fontSize: "1.2rem",
  },
});

interface TextContentProps {
  content: string;
  collapseMargin?: boolean;
  style?: React.CSSProperties;
}

const TextContent: React.VFC<TextContentProps> = ({
  content,
  collapseMargin = false,
  style,
}) => {
  const classes = useStyles({ collapseMargin });
  return (
    <Typography style={style} classes={{ root: classes.root }} variant="body1">
      {content}
    </Typography>
  );
};

export default TextContent;
