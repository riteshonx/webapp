import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import {
  makeStyles,
  styled,
  MuiThemeProvider,
  createMuiTheme,
} from "@material-ui/core/styles";

interface Props {
  element: string;
  className?: string;
  textLength?: number;
  customStyle?:any
}

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "#212121",
    boxShadow: theme.shadows[1],
    fontSize: 11,
    border: "1px solid #212121",
    borderRadius: "0px",
  },
}));
const CustomTooltip: React.FC<Props> = (props) => {
    const {element, className, textLength, customStyle} = props;
  return (
    <LightTooltip
      title={element}
      aria-label="material name"
      followCursor
      leaveDelay={0}
    >
      <div className={className} style={customStyle}>
        {textLength && ( element.length > textLength
          ? element?.slice(0, textLength) + ". . ."
          : element)} 

      </div>
    </LightTooltip>
  );
};

export default CustomTooltip;
