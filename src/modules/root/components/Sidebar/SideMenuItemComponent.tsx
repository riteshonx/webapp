import React, { forwardRef, ReactElement } from "react";
import ListItem from "@material-ui/core/ListItem";
import { NavLink } from "react-router-dom";

interface SideMenuItemComponentProps {
  handleListItem: (ev: any, parent: any) => void;
  link: string;
  className: string;
  onClick: () => void;
  children: React.ReactNode;
  parent: string;
  disable: boolean;
}

const SideMenuItemComponent = (
  props: SideMenuItemComponentProps
): ReactElement => {
  const { className, onClick, link, children, handleListItem, parent } = props;

  // If link is not set return the orinary ListItem
  if (!link || typeof link !== "string") {
    return (
      <ListItem
        button
        autoFocus={true}
        className={className}
        children={children}
        onClick={(ev: any) =>
          parent === "Micro" ? handleListItem(ev, parent) : onClick()
        }
        disabled={props.disable}
      />
    );
  }

  return (
    <ListItem
      button
      className={className}
      children={children}
      component={forwardRef((props: any, ref) => (
        <NavLink exact {...props} innerRef={ref} />
      ))} // eslint-disable-line no-shadow
      to={link !== "none" ? link : ""}
      onClick={(ev: any) => handleListItem(ev, parent)}
      disabled={props.disable}
    />
  );
};

export default SideMenuItemComponent;
