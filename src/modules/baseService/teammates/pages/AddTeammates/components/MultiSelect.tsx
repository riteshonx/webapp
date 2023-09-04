import { useEffect, useState } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";
import CheckCircleFilled from "@material-ui/icons/CheckCircle";
import CheckBoxIcon from "@material-ui/icons/RadioButtonUnchecked";
import { Controller } from "react-hook-form";
import FormHelperText from "@material-ui/core/FormHelperText";

import ApplyToAll from "./ApplyToAll";
import Box from "@material-ui/core/Box";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    customLabel: {
      color: "black",
      fontSize: "1.1rem",
    },
    formControl: {
      margin: theme.spacing(1),
      width: 150,
      height: 60,
    },
    menuTag: {
      display: "flex",
      flexDirection: "column",
    },
    noLabel: {
      marginTop: theme.spacing(3),
    },
    greyOut: {
      color: "#bcbcbc",
      cursor: "not-allowed",
      "&:focus": {
        backgroundColor: "transparent",
      },
    },
  })
);

const ITEM_HEIGHT = 38;
const ITEM_PADDING_TOP = 20;
const MenuProps = {
  getContentAnchorEl: null,
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
      transofrmOrigin: "none",
      top: 0,
    },
  },
};

export default function MultiSelect({
  label,
  options,
  control,
  name,
  readOnly,
  error,
  handleApplyToAll,
  index,
  noDataFoundMessage,
  showApplyToAll,
}: any) {
  const classes = useStyles();

  const getOptionNameById = (id: any) => {
    return options.find((option: any) => parseInt(option.id) === parseInt(id));
  };

  const [displayOptions, setDisplayOptions] = useState<Array<any>>(options);

  useEffect(() => {
    if (!options.length) {
      setDisplayOptions([{ name: noDataFoundMessage, id: -1, disabled: true }]);
    } else {
      setDisplayOptions(options);
    }
  }, [options]);

  return (
    <Box display={"flex"} alignItems="center">
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          return (
            <FormControl className={classes.formControl}>
              <InputLabel
                classes={{
                  root: readOnly ? classes.greyOut : classes.customLabel,
                }}
                shrink={false}
              >
                {!field.value?.length && label}
              </InputLabel>

              <Select
                {...field}
                value={field.value || []}
                readOnly={readOnly}
                multiple
                fullWidth
                disableUnderline={readOnly}
                input={<Input />}
                classes={{ root: readOnly && classes.greyOut }}
                renderValue={(selected: any) => {
                  return (
                    <Tooltip
                      title={selected
                        .map((item: any) => getOptionNameById(item)?.name)
                        .join(", ")}
                    >
                      <Box
                        maxWidth="120px"
                        whiteSpace="noWrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                      >
                        {selected?.length > 0
                          ? getOptionNameById(selected[0])?.name ??
                            "Please wait..."
                          : label}
                        {selected.length > 1 && (
                          <p style={{ fontSize: "1rem" }}>
                            (+{selected?.length - 1} more)
                          </p>
                        )}
                      </Box>
                    </Tooltip>
                  );
                }}
                MenuProps={MenuProps}
              >
                {/* <OutlinedInput
                  onKeyDown={(e) => e.stopPropagation()}
                  value={"sudi"}
                  onChange={(e) => setSearchText(e.target.value)}
                  endAdornment={
                    <InputAdornment position="end">KK</InputAdornment>
                  }
                  labelWidth={0}
                /> */}

                {displayOptions.map((optionValue: any) => {
                  return (
                    <MenuItem
                      style={{ height: "38px" }}
                      key={optionValue.id}
                      value={optionValue.id}
                      disabled={optionValue.disabled}
                    >
                      {displayOptions.length && displayOptions[0].id !== -1 && (
                        <Checkbox
                          icon={<CheckBoxIcon />}
                          checkedIcon={<CheckCircleFilled />}
                          color="primary"
                          checked={field.value?.indexOf(optionValue.id) > -1}
                        />
                      )}
                      <p>{optionValue.name}</p>
                    </MenuItem>
                  );
                })}
              </Select>
              {error && (
                <FormHelperText style={{ position: "absolute" }} error>
                  {error}
                </FormHelperText>
              )}
            </FormControl>
          );
        }}
      />
      {!readOnly && showApplyToAll && (
        <ApplyToAll onClickApplyAll={() => handleApplyToAll(index)} />
      )}
    </Box>
  );
}
