import { FC } from "react";
import { makeStyles, createStyles } from "@material-ui/styles";
import { useForm, Controller } from "react-hook-form";
import { FormControlLabel, Checkbox, IconButton, Box } from "@material-ui/core";

const useStyles = makeStyles(() =>
  createStyles({
    checkBox: {
      color: "#171d25",
      padding: 0,
      "&.Mui-checked": {
        color: "#105c6b",
      },
      "&.Mui-checked.Mui-disabled": {
        color: "lightgrey",
      },
    },
    checkboxLabel: {
      fontWeight: 500,
      marginLeft: "1rem",
      fontSize: "1.4rem",
    },
  })
);

interface StatusListProjectSettingItemType {
  id: number;
  status: string;
  openStatus: boolean;
  control: any;
  disabled: boolean;
}

const StatusListProjectSettingItem: FC<StatusListProjectSettingItemType> = ({
  id,
  status,
  openStatus,
  control,
  disabled,
}) => {
  const classes = useStyles();
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      padding="1rem 2rem"
      marginTop="2rem"
      border="1px solid lightgrey"
      borderRadius="3px"
    >
      <Box display="flex" alignItems="center">
        <Controller
          name={`checkbox-${id}`}
          control={control}
          render={({ field }) => (
            <FormControlLabel
              disabled={disabled}
              classes={{ label: classes.checkboxLabel }}
              control={
                <Checkbox
                  classes={{
                    root: classes.checkBox,
                  }}
                  {...field}
                  checked={field.value || disabled}
                />
              }
              label={status}
            />
          )}
        />
      </Box>
      {openStatus ? <p style={{ color: "#105c6b" }}>Open</p> : <p>Closed</p>}
    </Box>
  );
};

export default StatusListProjectSettingItem;
