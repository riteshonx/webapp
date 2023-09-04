import React, { ReactElement, useState } from "react";
import { Drawer, Grid, IconButton } from "@material-ui/core";
import classNames from "classnames";
import SideMenu from "../Sidebar/SideMenu";
import { ArrowLeft as ArrowLeftIcon } from "@material-ui/icons";
import MicroDrawer from "./MicroDrawer";
import "../Sidebar/SideMenu.scss";

interface LeftDrawerProps {
  handleListItem: (ev: any, parent: any) => void;
  handleDrawerOpen: (val: any, openDrawer: any) => void;
  getProjects: () => void;
  getPortfolios: () => void;
  open: boolean;
  state: string;
  selectedMenu: string;
  productionCenterEnabled: boolean;
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
    rightDrawerClose: string;
    rightDrawerOpen: string;
    rightPannel: string;
    root: string;
    secondState: string;
    toolbar: string;
    topBar: string;
    weatherIcon: string;
    position: "absolute";
    miniPaperAfterExpand: string;
  };
}

const LeftDrawer = ({
  classes,
  open,
  state,
  handleListItem,
  handleDrawerOpen,
  selectedMenu,
  getPortfolios,
  getProjects,
  productionCenterEnabled,
}: LeftDrawerProps): ReactElement => {
  return (
    <div className={"leftDrawer-main"}>
      <Drawer
        variant="permanent"
        className={classNames(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: classNames({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
        open={open}
      >
        <Grid container className={classes.secondState}>
          <Grid item xs={open ? 8 : 2}></Grid>
          <Grid item xs={4}></Grid>
        </Grid>
        {state === "third" && (
          <div className={classes.forwardButton}>
            <IconButton
              className={"forward-arrow"}
              aria-label="Open drawer-t3"
              onClick={() => handleDrawerOpen("fourth", true)}
              size="small"
            >
              <ArrowLeftIcon />
            </IconButton>
          </div>
        )}
        {/* {state !== "fourth" && (
          <MicroDrawer
            stateView={state}
            classes={classes}
            handleDrawerOpen={handleDrawerOpen}
          />
        )} */}
        <SideMenu
          handleListItem={(item: any, parent: any) =>
            handleListItem(item, parent)
          }
          openDrawer={open}
          productionCenterEnabled={productionCenterEnabled}
          selectedMenu={selectedMenu}
          getPortfolios={getPortfolios}
          getProjects={getProjects}
        />
      </Drawer>
    </div>
  );
};

export default LeftDrawer;
