import { CSSProperties } from "react";
import { List, ListItemButton } from "@mui/material";
import { Container, ListItemIcon, ListItemText } from "@material-ui/core";
import ProjectIcon from '@material-ui/icons/Business';
import AssignmentIcon from '@material-ui/icons/Assignment';
import BuildIcon from '@material-ui/icons/Build';
import AssistantPhotoIcon from '@material-ui/icons/AssistantPhoto';
import BusinessIcon from '@material-ui/icons/Business';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import { MarkerType } from "src/modules/equipments-map/FullMapViewContainer";

type ListItem = {
  primary: string,
  type: MarkerType
}

export default function SimpleButtonListView({
  style,
  onItemClick,
  items,
  selectedIndex = 0,
}: {
  style?: CSSProperties;
  onItemClick: (idx: number) => void;
  selectedIndex: number;
  items: ListItem[];
}) {
  const typeIcon = {
    [MarkerType.EQUIPMENT]: <BuildIcon />,
    [MarkerType.PROJECT]: <BusinessIcon />
  }

  return (
    <div style={style} className="simple-button-list-view">
      {items && items.length ? (
        <List>
          {items.map(({primary, type}, idx) => (
            <ListItemButton
              selected={selectedIndex === idx}
              key={idx}
              onClick={() => onItemClick(idx)}
            >
              <ListItemIcon>
                {typeIcon[type] || <LocationOnIcon />}
              </ListItemIcon>
              <ListItemText primary={primary} />
            </ListItemButton>
          ))}
        </List>
      ) : (
        <Container style={{ marginTop: "20px" }}>Empty Content</Container>
      )}
    </div>
  );
}
