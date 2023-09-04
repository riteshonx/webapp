import React, { ReactElement } from "react";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import "../TaskAndNewsCard/TaskAndNewsCard.scss";

interface Props {
  item: any;
  handleTaskUpdate: any;
  status: string;
}

const MenuComponent = (props: Props): ReactElement => {
  const [menuEl, setMenuEl] = React.useState(null);
  const { item, handleTaskUpdate, status } = props;

  const handleClick = (event: any) => {
    setMenuEl(event.currentTarget);
  };

  const handleClose = () => {
    setMenuEl(null);
  };

  const handleStatusUpdate = (itemVal: any, statusVal: any) => {
    handleClose();
    handleTaskUpdate(itemVal, statusVal);
  };

  return (
    <>
      <MoreVertIcon
        aria-controls="status-menu"
        aria-haspopup="true"
        onClick={handleClick}
        className={"icon-button"}
      />
      <Menu
        id="status-menu"
        anchorEl={menuEl}
        open={Boolean(menuEl)}
        onClose={handleClose}
        keepMounted
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {status !== "To-Do" && status !== "Complete" && (
          <MenuItem onClick={() => handleStatusUpdate(item, "To-Do")}>
            To-Do
          </MenuItem>
        )}
        {status !== "In-Progress" && (
          <MenuItem onClick={() => handleStatusUpdate(item, "In-Progress")}>
            In-Progress
          </MenuItem>
        )}
        {status !== "Complete" && status !== "To-Do" && (
          <MenuItem onClick={() => handleStatusUpdate(item, "Complete")}>
            Complete
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default MenuComponent;
