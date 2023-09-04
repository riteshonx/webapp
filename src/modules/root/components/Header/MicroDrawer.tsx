import React, { ReactElement, useState } from "react";
import { Grid, IconButton, Paper } from "@material-ui/core";
import {
  MoveToInbox as InboxIcon,
  Menu as MenuIcon,
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@material-ui/icons";
import "../Sidebar/SideMenu.scss";

interface MicroProps {
  handleDrawerOpen: (val: any, openDrawer: any) => void;
  classes: {
    accountIcon: string;
    appBar: string;
    appBarShift: string;
    appBarShiftClose: string;
    backButton: string;
    bottomBar: string;
    colorWhite: string;
    colorYellow: string;
    content: string;
    drawer: string;
    drawerClose: string;
    drawerOpen: string;
    forwardButton: string;
    fullWidth: string;
    grow: string;
    hide: string;
    imgWidth: string;
    menuButton: string;
    menuButtonIconClosed: string;
    menuButtonIconOpen: string;
    microDrawer: string;
    paddingLeft: string;
    paddingTop: string;
    paper: string;
    miniPaper?: string;
    rightDrawerClose: string;
    rightDrawerOpen: string;
    rightPannel: string;
    root: string;
    secondState: string;
    toolbar: string;
    topBar: string;
    weatherIcon: string;
    miniPaperAfterExpand?: string;
  };
  stateView: any;
}

const MicroDrawer = (props: MicroProps): ReactElement => {
  const { classes, handleDrawerOpen, stateView } = props;
  const [showMenu, setShowMenu] = useState(false);

  const handleOpenMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="flex-start"
        justify="center"
        className={`${classes.microDrawer} microDrawer-main`}
      >
        {/* {!showMenu && <Paper className={classes.miniPaper} onMouseOver={handleOpenMenu}>
                    <ArrowRightIcon />
                </Paper>} */}
        {
          <IconButton
            className={
              stateView === "fourth"
                ? `${classes.miniPaper} forward-arrow`
                : `${classes.miniPaperAfterExpand} forward-arrow`
            }
            size="small"
            // onMouseOver={handleOpenMenu}
            onClick={() =>
              handleDrawerOpen(
                stateView === "fourth"
                  ? "third"
                  : stateView === "second"
                  ? "third"
                  : "fourth",
                false
              )
            }
          >
            {stateView === "fourth" ? <ArrowRightIcon /> : <ArrowLeftIcon />}
          </IconButton>
        }

        {showMenu && (
          <Paper className={classes.paper} onMouseLeave={handleOpenMenu}>
            <Grid item xs={12}>
              <IconButton color="inherit" aria-label="Open drawer-t4">
                <InboxIcon />
              </IconButton>
            </Grid>
            <Grid item xs={12}>
              <IconButton
                color="inherit"
                aria-label="Open drawer-t5"
                onClick={() => handleDrawerOpen("third", false)}
              >
                <MenuIcon />
              </IconButton>
            </Grid>
            <Grid item xs={12}>
              <IconButton color="inherit" aria-label="Open drawer-t6">
                <InboxIcon />
              </IconButton>
            </Grid>
          </Paper>
        )}
      </Grid>
    </>
  );
};

export default MicroDrawer;
