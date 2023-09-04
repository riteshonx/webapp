import drawerImage from "../../../../assets/images/sidemenu-bg.png";
import bottombarImage from "../../../../assets/images/bottom-bar.png";
import menuBgImage from "../../../../assets/images/menu-bg.png";
const drawerWidth = 250;
import { createStyles } from "@material-ui/core/styles";
import bgImage from "../../../../assets/images/bg-5.png";
import src_image_1 from "../../../../assets/images/bgNav.png";

const styles = (theme: any) =>
  createStyles({
    // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    root: {
      display: "flex",
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      paddingLeft: "10px",
      background: " #171d25 !important",
      // backgroundImage: "url(" + bgImage + ")",
      // backgroundRepeat: 'no-repeat',
      // backgroundSize: "100% 100%",
      // background:
      //   "linear-gradient(180deg, #1D3A40 8.35%, rgba(29, 58, 64, 0.739583) 182%, rgba(29, 58, 64, 0) 0.73%)",
      // backgroundColor: 'rgba(29, 58, 64, 0.739583)',
      // boxShadow: "none",
      maxHeight: "58px",
    },
    appBarSlate: {
      zIndex: theme.zIndex.drawer + 1,
      paddingLeft: "10px",
      // backgroundImage: "url(" + bgImage + ")",
      // backgroundRepeat: 'no-repeat',
      // backgroundSize: "100% 100%",
      // backgroundColor: "#171d25  !important" ,
      // backgroundColor: 'rgba(29, 58, 64, 0.739583)',
      // boxShadow: "none",
      maxHeight: "58px",
    },
    appBarClassic: {
      boxShadow: "none",
    },
    appBarOnx: {
      zIndex: theme.zIndex.drawer + 1,
      paddingLeft: "10px",
      backgroundImage: `url(${src_image_1})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "100%",
      backgroundPosition: "100% 92%",
    },
    appBarHeader: {
      zIndex: theme.zIndex.drawer + 1,
      paddingLeft: "10px",

      // background:
      //   "linear-gradient(to bottom, rgba(34, 66, 72, 1), rgba(34, 66, 72, 1) 0%, rgba(4, 69, 76, 1) 100%, rgba(4, 69, 76, 1))",
    },
    tooltipStyle: {
      background: "linear-gradient(0deg, #13223D, #234f70 100%) no-repeat",
      color: "#fcc200",
    },
    appBarShift: {
      marginLeft: drawerWidth,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    toolbarHeight: {
      minHeight: "54px !important",
    },
    menuButton: {
      marginLeft: 12,
      marginRight: 36,
    },
    menuButtonIconClosed: {
      transition: theme.transitions.create(["transform"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      transform: "rotate(0deg)",
    },
    menuButtonIconOpen: {
      transition: theme.transitions.create(["transform"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      transform: "rotate(180deg)",
    },
    hide: {
      display: "none",
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: "nowrap",
    },
    drawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginTop: theme.spacing(1 * 5.75 + 1),
      backgroundImage:
        "linear-gradient(to bottom, rgba(34, 66, 72, 1), rgba(34, 66, 72, 1) 0%, rgba(4, 69, 76, 1) 100%, rgba(4, 69, 76, 1))",
      // backgroundImage:
      //   theme.palette.type === "light" ? "url(" + drawerImage + ")" : "",
      // backgroundImage: "var(--onx-linear-grad)",
    },
    drawerClose: {
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: "hidden",
      width: theme.spacing(1 * 7 + 1),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(1 * 8 + 1),
      },
      // background: "var(--onx-linear-grad)",
      // background: '#1D3A40',
      // backgroundImage:
      //   "linear-gradient(to bottom, rgba(34, 66, 72, 1), rgba(34, 66, 72, 1) 0%, rgba(4, 69, 76, 1) 100%, rgba(4, 69, 76, 1))",
      background: "#171d25",
      // backgroundImage: "var(--onx-linear-grad)",
      // backgroundImage:
      //   theme.palette.type === "light" ? "url(" + drawerImage + ")" : "",
    },
    microMenuOpen: {
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: "hidden",
      width: 0,
    },
    microMenuClose: {
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: "hidden",
      width: "100px",
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
    slateContent: {
      marginTop: "-54px",
    },
    grow: {
      flexGrow: 1,
    },
    bottomBar: {
      justifyContent: "space-between",
      padding: "0.2rem calc((100vw - 1000px) / 2)",
      backgroundColor: theme.palette.type === "dark" ? "#424242" : "",
      width: "100%",
      boxShadow:
        "0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)",
      backgroundImage:
        theme.palette.type === "light" ? "var(--onx-linear-grad)" : "",
      bottom: "0px",
      color: "#fff !important",
      position: "fixed",
      backgroundRepeat: "no-repeat",
      backgroundSize: "100%",
      zIndex: 1,
    },
    topBar: {
      justifyContent: "space-between",
      padding: "0.2rem calc((100vw - 1000px) / 2)",
      backgroundColor: theme.palette.type === "dark" ? "#424242" : "",
      width: "100%",
      boxShadow:
        "0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)",
      backgroundImage:
        theme.palette.type === "light" ? "var(--onx-linear-grad)" : "",
      top: "64px",
      color: "#fff !important",
      position: "fixed",
      backgroundRepeat: "no-repeat",
      backgroundSize: "100%",
      zIndex: 1,
    },
    fullWidth: {
      width: "100%",
    },
    secondState: {
      minHeight: "64px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    paddingLeft: {
      paddingLeft: "15px",
    },
    imgWidth: {
      width: "70px",
    },
    backButton: {
      textAlign: "right",
    },
    forwardButton: {
      textAlign: "left",
      padding: "10px 0",
      marginTop: "-0.8rem",
    },
    colorWhite: {
      color: "#fff !important",
    },
    arrowColor: {
      color: "#8EB2AE !important",
    },
    colorYellow: {
      color: "#ffc107 !important",
    },
    paper: {
      // backgroundImage:
      //   theme.palette.type === "light" ? "url(" + menuBgImage + ")" : "",
      // backgroundImage:
      //   "linear-gradient(to bottom, rgba(34, 66, 72, 1), rgba(34, 66, 72, 1) 0%, rgba(4, 69, 76, 1) 100%, rgba(4, 69, 76, 1))",
      color: "#8eb2ae !important",
      // backgroundImage:
      // theme.palette.type === "light" ? "var(--onx-linear-grad)" : "",
      background: "rgba(29, 58, 64, 0.739583)",
      animation: "fadeIn 0.5s ease-in-out",
    },
    paperOnx: {
      backgroundImage: `url(${src_image_1})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "100%",
      animation: "fadeIn 0.5s ease-in-out",
      color: "#fff",
    },
    paperTransparent: {
      background: "transparent",
      color: "#ffc107 !important",
      boxShadow:
        "0px 5px 1px -1px rgb(0 0 0 / 28%), 0px 1px 1px 0px rgb(0 0 0 / 16%), 0px 1px 3px 0px rgb(0 0 0 / 11%)",
    },
    miniPaper: {
      width: "0.8rem",
      // backgroundImage:
      //   theme.palette.type === "light" ? "url(" + menuBgImage + ")" : "",
      // backgroundImage:
      //   "linear-gradient(to bottom, rgba(34, 66, 72, 1), rgba(34, 66, 72, 1) 0%, rgba(4, 69, 76, 1) 100%, rgba(4, 69, 76, 1))",
      // color: "#fff !important",
      // color: "#8EB2AE !important",
      // animation: "fadeIn 0.5s ease-in-out",
      borderRadius: 4,
      // marginLeft: "-0.2rem",
      padding: "0.5rem",
      // height: "1.2rem",
      background: "#8eb2ae",
      boxShadow: "0 -2px 10px rgba(0, 0, 0, 1) !important",
      // backgroundImage:
      //   theme.palette.type === "light" ? "var(--onx-linear-grad)" : "",
      // padding: 0rem !important;
      // transition: "all 0.2s ease-in-out",
    },
    miniPaperAfterExpand: {
      // width: "0.8rem",
      // backgroundImage:
      //   theme.palette.type === "light" ? "var(--onx-linear-grad)" : "",
      // color: "#ffc107 !important",
      // color: "#8EB2AE",
      animation: "fadeIn 0.5s ease-in-out",
      // borderRadius: 0,
      // marginLeft: "-0.2rem",
      padding: "0.5rem",
      position: "absolute",
      top: theme.spacing(1 * 8 + 1),
      left: 0,
    },
    paddingTop: {
      paddingTop: "7%",
    },
    rightPannel: {
      backgroundImage: "var(--onx-linear-grad)",
      color: "#ffc107 !important",
      position: "fixed",
      right: "0px",
      writingMode: "vertical-rl",
      height: "100vh",
      textAlign: "center",
      lineHeight: "0.6",
      fontSize: "18px",
      cursor: "pointer",
      fontWeight: 700,
      zIndex: 1,
    },
    rightDrawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    rightDrawerClose: {
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: "hidden",
      width: theme.spacing(1 * 7 + 1),
      [theme.breakpoints.up("xs")]: {
        width: theme.spacing(1 * 8 + 1),
      },
    },
    weatherIcon: {
      width: "34px",
    },
    accountIcon: {
      color: "#fff",
    },
    accountIconSlate: {
      color: "rgb(247, 176, 71)",
      // marginRight: "1rem",
    },
    microDrawer: {
      minHeight: "100vh",
      position: "fixed",
      top: "0px",
      width: "0px",
    },
    notchedOutline: {
      border: "none !important",
      boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)",
    },
    slateLogo: {
      // width: "6rem",
      height: "3.5rem",
      padding: "0.2rem 0.5rem",
      cursor: "pointer",
    },
    popoverPaper: {
      width: "60% !important",
    },
    tenantHeader: {
      background: "transparent",
    },
    tenantHeaderOnx: {
      background: "transparent",
      boxShadow:
        "0px 2px 4px -1px rgb(0, 0, 0 / 20%), 0px 4px 5px 0px rgb(0, 0, 0 / 14%), 0px 1px 10px 0px rgb(0, 0, 0 / 12%)",
    },
    factoryHeader: {
      background: "grey",
      boxShadow:
        "0px 2px 4px -1px rgb(0, 0, 0 / 20%), 0px 4px 5px 0px rgb(0, 0, 0 / 14%), 0px 1px 10px 0px rgb(0, 0, 0 / 12%)",
    },

    menuPaper: {
      color: "#fff !important",
      padding: "1.5rem !important",
      background:
        "linear-gradient(0deg, #13223D, #234f70 100%) no-repeat !important",
    },
    dockPaper: {
      color: "#fcc200 !important",
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
  });

export default styles;
