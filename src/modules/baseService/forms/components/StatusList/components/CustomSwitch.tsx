import Switch from "@material-ui/core/Switch";
import { withStyles } from "@material-ui/core/styles";

const CustomSwitch = withStyles(() => ({
  root: {
    width: 36,
    height: 18,
    padding: 0,
    display: "flex",
  },
  switchBase: {
    padding: 2,
    color: "var(--onx-text-black)",
    "&$disabled": {
      color: "#a8a8a8",
      "& + $track": {
        border: `1px solid #d6d6d6`,
        opacity: 1,
        backgroundColor: "#d6d6d6",
      },
    },
    "&$checked": {
      transform: "translateX(18px)",
      color: "#fff",
      "& + $track": {
        opacity: 1,
        backgroundColor: "var(--onx-text-black)",
      },
    },
  },
  thumb: {
    width: 14,
    height: 14,
    boxShadow: "none",
  },
  track: {
    border: `1px solid var(--onx-text-black)`,
    borderRadius: 18 / 2,
    opacity: 1,
    backgroundColor: "#fff",
  },
  disabled: {},
  checked: {},
}))(Switch);

export default CustomSwitch;
