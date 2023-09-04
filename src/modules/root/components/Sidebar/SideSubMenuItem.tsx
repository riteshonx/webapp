import { ListItemIcon } from "@material-ui/core";
import classNames from "classnames";
import "./SideMenu.scss";

interface TextContentProps {
  Icon: string;
}

const SubMenuItem: React.VFC<TextContentProps> = ({ Icon }) => {
  return (
    <ListItemIcon
      className={classNames({
        "icon-color": true,
        "min-width-30": true,
        "sub-menu-name": true,
      })}
    >
      <Icon />
    </ListItemIcon>
  );
};

export default SubMenuItem;
