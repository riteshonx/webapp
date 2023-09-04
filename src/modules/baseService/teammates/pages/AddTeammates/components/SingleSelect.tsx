import { useEffect, useState } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Controller } from "react-hook-form";
import FormHelperText from "@material-ui/core/FormHelperText";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    customLabel: {
      color: "black",
      fontSize: "1.1rem",
    },
    greyOut: {
      color: "#bcbcbc",
      cursor: "not-allowed",
      "&:focus": {
        backgroundColor: "transparent",
      },
    },
    formControl: {
      margin: theme.spacing(1),
      width: 150,
      height: 60,
    },
  })
);

export default function SingleSelect({
  label,
  options,
  control,
  name,
  readOnly,
  error,
  noDataFoundMessage,
}: any) {
  const classes = useStyles();

  const [displayOptions, setDisplayOptions] = useState(options);
  useEffect(() => {
    if (!options.length) {
      setDisplayOptions([{ role: noDataFoundMessage, id: -1, disabled: true }]);
    } else {
      setDisplayOptions(options);
    }
  }, [options]);

  return (
    <div>
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
                {!field.value && label}
              </InputLabel>

              <Select
                readOnly={readOnly}
                {...field}
                value={field.value || ""}
                classes={{ root: readOnly && classes.greyOut }}
                disableUnderline={readOnly}
                displayEmpty={true}
              >
                {displayOptions.map((option: any) => (
                  <MenuItem
                    key={option.id}
                    value={option.id}
                    disabled={option.disabled}
                  >
                    {option.role}
                  </MenuItem>
                ))}
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
    </div>
  );
}
