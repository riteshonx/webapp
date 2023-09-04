import { useState, forwardRef } from "react";
import "./SideMenu.scss";
import {
  Menu,
  MenuItem,
  List,
  ListItem,
  Typography,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@material-ui/core";
import SideMenuItemComponent from "./SideMenuItemComponent";
import classNames from "classnames";
import { useHistory } from "react-router-dom";

import {
  ExpandMore as IconExpandMore,
  NavigateNext as NavigateNextIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowRight as ArrowRightIcon,
} from "@material-ui/icons/";

import { makeStyles } from "@material-ui/core/styles";
import SubMenuItem from "./SideSubMenuItem";

const useStyles = makeStyles(() => ({
  popover: {
    pointerEvents: "none",
  },
  paper: {
    pointerEvents: "auto",
    // backgroundImage:
    //   "linear-gradient(to bottom, rgba(34, 66, 72, 1), rgba(34, 66, 72, 1) 0%, rgba(4, 69, 76, 1) 100%, rgba(4, 69, 76, 1))",
    background:"#171d25"
  },
  menuName: {
    fontSize: "1rem",
    whiteSpace: "normal",
    textAlign: "center",
    margin: 0,
    padding: 0,
  },
}));

interface SideMenuItemProps {
  handleListItem: (ev: any, parent: any) => void;
  link: string;
  name: string;
  Icon: string;
  show: boolean;
  items: {
    name: string;
    link: string;
    level: number;
  }[];
  level: number;
  openDrawer: boolean;
  selectedMenu: string;
  parent: string;
  disable: boolean;
  childIcon: string;
}

const SideMenuItem = forwardRef((props: SideMenuItemProps, ref) => {
  // eslint-disable-line @typescript-eslint/no-unused-vars
  const classes = useStyles();
  const history = useHistory();
  const {
    name,
    link,
    Icon,
    items = [],
    handleListItem,
    openDrawer,
    level,
    selectedMenu,
    parent,
    show,
    disable,
    childIcon,
  } = props;
  const isExpandable = items && items.length > 0;
  const [open, setOpen] = useState(false);
  const [menuEl, setMenuEl] = useState(null);

  const handleClick = () => {
    setOpen(!open);
  };

  const handleLink = (ev: any, link: any, parent: any) => {
    handleListItem(ev, parent);
    history.push(link);
  };

  const handleOpen = (e: any) => {
    if (!openDrawer && !show) setMenuEl(e.currentTarget);
  };

  const handleClose = () => {
    setMenuEl(null);
  };
  const MenuItemRoot = (
    <SideMenuItemComponent
      link={link}
      parent={parent}
      onClick={handleClick}
      handleListItem={handleListItem}
      className={level > 1 ? "list-item" : "level-one"}
      disable={disable}
    >
      {/* Display an icon if any */}
      {!!Icon && (
        <>
          <ListItemIcon
            className={classNames({
              "icon-color": true,
              "min-width-40": openDrawer,
            })}
          >
            <Icon />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                className={classNames({
                  icon: true,
                })}
              >
                {name}
              </Typography>
            }
            inset={!Icon}
          />
          {isExpandable && !open && <NavigateNextIcon className="icon" />}
          {isExpandable && open && <IconExpandMore className="icon" />}
        </>
      )}

      {/* Display the expand menu if the item has children and drawer is closed */}
      {!openDrawer && !Icon && (
        <>
          {childIcon && <SubMenuItem Icon={childIcon} />}
          <MenuItem onClick={handleClose}>{name}</MenuItem>
        </>
      )}

      {/* Display the expand menu if the item has children */}
      {!Icon && openDrawer && (
        <ListItem
          className="padding-none"
          disableGutters={items.length === 0 && level === 2}
          component="div"
        >
          <ListItemIcon
            className={classNames({
              "min-width-40": openDrawer,
            })}
          >
            {isExpandable && !open && <ArrowRightIcon />}
            {isExpandable && open && <ArrowDropDownIcon />}
          </ListItemIcon>
          <ListItemText
            disableTypography
            primary={
              <Typography
                className={classNames({
                  "padding-left-15": items.length === 0 && link,
                })}
              >
                {name}
              </Typography>
            }
          />
        </ListItem>
      )}
    </SideMenuItemComponent>
  );

  const MenuItemChildrenForDrawerOpened = isExpandable ? (
    <Collapse in={open} timeout="auto" component="div" unmountOnExit>
      <List component="div" disablePadding>
        {items.map((item: any, index: number) => (
          <SideMenuItem
            {...item}
            key={index}
            selectedMenu={selectedMenu}
            handleListItem={handleListItem}
            openDrawer={openDrawer}
          />
        ))}
      </List>
    </Collapse>
  ) : null;

  const MenuItemChildrenForDrawerClosed = isExpandable ? (
    <Menu
      id="sample-menu"
      anchorEl={menuEl}
      open={Boolean(menuEl)}
      keepMounted
      className={classes.popover}
      classes={{
        paper: classes.paper,
      }}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      getContentAnchorEl={null}
      MenuListProps={{ onMouseLeave: handleClose, onClick: handleClose }}
      onClose={handleClose}
    >
      {items.map((item: any, index: number) => (
        <SideMenuItem
          {...item}
          key={index}
          selectedMenu={selectedMenu}
          handleListItem={handleListItem}
          openDrawer={openDrawer}
        />
      ))}
    </Menu>
  ) : null;

  return (
    <div
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      className={classNames({
        "sidemenu-container": true,
        "icon-name": !!Icon && !openDrawer,
        "selected-menu": selectedMenu && selectedMenu.split(",")[0] === name,
        "level-one":
          !openDrawer &&
          level === 1 &&
          selectedMenu &&
          selectedMenu.split(",")[0] === name,
        "hide-menu": show || disable,
        hoverHighlight: "hoverHighlight",
      })}
      data-testid = {name}
    >
      {MenuItemRoot}
      {!!Icon && !openDrawer && (
        <div
          className={classes.menuName}
          style={{
            display: show ? "none" : "block",
            opacity: disable ? 0.5 : 1,
          }}
          onClick={(ev) => (!disable ? handleLink(ev, link, parent) : "")}
        >
          {name}
        </div>
      )}
      {openDrawer
        ? MenuItemChildrenForDrawerOpened
        : MenuItemChildrenForDrawerClosed}
    </div>
  );
});

export default SideMenuItem;
