import { FC, ChangeEvent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Select from "@material-ui/core/Select";
import { MenuItem } from "@material-ui/core";
import { IStatusListOptions } from "../../pages/EditRfi/EditRfiTypes";

const useStyles = makeStyles((theme) => ({
  select: {
    padding: "5px 12px",
    maxWidth: "120px",
  },
  disabledSelect: {
    "&.MuiSelect-outlined.MuiSelect-outlined": {
      paddingRight: "12px",
    },
  },
  notchedOutline: {
    "&.MuiSelect-root ~ fieldset.MuiOutlinedInput-notchedOutline": {
      border: "1px solid #171d25",
    },
    "&.Mui-disabled ~ fieldset.MuiOutlinedInput-notchedOutline": {
      border: "1px solid #00000042",
    },
  },
  menu: {
    background: "#e7eef0",
    borderRadius: "4px",
    border: "1px solid #171d25",
    borderTop: "none",
  },
  menuList: {
    padding: 0,
  },
  menuItem: {
    fontSize: "1.4rem",
    borderTop: "1px solid #171d25",
  },
  hiddenMenuItem: {
    display: "none",
  },
}));

interface StatusChangeProps {
  status: string;
  statusOptions?: Array<IStatusListOptions>;
  disabled?: boolean;
  handleStatusChange?: (e: ChangeEvent<any>) => void;
}

const StatusChange: FC<StatusChangeProps> = ({
  status,
  statusOptions,
  disabled = false,
  handleStatusChange,
}) => {
  const classes = useStyles();

  let icon = {};
  if (disabled)
    icon = {
      IconComponent: () => null,
    };

  return (
    <div>
      <Select
        disabled={disabled}
        classes={{
          outlined: classes.select,
          root: classes.notchedOutline,
          disabled: classes.disabledSelect,
        }}
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={status}
        onChange={handleStatusChange}
        variant="outlined"
        {...icon}
        MenuProps={{
          anchorOrigin: { vertical: "bottom", horizontal: "left" },
          getContentAnchorEl: null,
          classes: { paper: classes.menu, list: classes.menuList },
        }}
      >
        <MenuItem
          classes={{ root: classes.hiddenMenuItem }}
          key={999}
          value="DRAFT"
        >
          DRAFT
        </MenuItem>
        {statusOptions?.map((option: any) => (
          <MenuItem
            disabled={option?.disabled}
            classes={{ root: classes.menuItem }}
            key={option.id}
            value={option.status}
          >
            {option.status}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

export default StatusChange;
