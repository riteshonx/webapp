import { createStyles } from "@material-ui/core/styles";

const styles = (theme: any) =>
  createStyles({
    // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    root: {
      display: "flex",
    },
    slateLogo: {
      // width: "6rem",
      height: "3.5rem",
      padding: "0.2rem 0.5rem",
      cursor: "pointer",
    },
    menuPaper: {
      color: "#fff !important",
      padding: "1.5rem !important",
      background:
        "linear-gradient(0deg, #13223D, #234f70 100%) no-repeat !important",
    },
    menuItemRoot: {
      fontFamily: "Poppins !important",
      fontSize: "1.2rem !important",
      display: "grid !important",
      justifyContent: "center !important",
      alignItems: "center !important",
      color: "#e1ad21 !important",
    },
    svgIcon: {
      fontSize: "3rem !important",
      color: "#fcc200 !important",
      margin: "0 auto !important",
    },
    toolbarHeight: {
      minHeight: "54px !important",
    },
    fullWidth: {
      width: "100%",
    },
    paddingTop: {
      paddingTop: "7%",
    },
    toolbar: {
      display: "flex",
      alignItems: "center",
      // marginTop: theme.spacing(1),
      justifyContent: "flex-end",
      padding: "0 8px",
      minHeight: "54px !important",
      // ...theme.mixins.toolbar,
    },
    content: {
      flexGrow: 1,
      height: "calc(100vh - 54px)",
    },
    grow: {
      flexGrow: 1,
    },
  });

export default styles;
