import { ChangeEvent } from "react";
import TableCell from "@material-ui/core/TableCell";
import Input from "@material-ui/core/Input";
import { Controller } from "react-hook-form";
import FormHelperText from "@material-ui/core/FormHelperText";
import InputAdornment from "@material-ui/core/InputAdornment";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import { IconButton } from "@material-ui/core";

const useStyles = makeStyles(() =>
  createStyles({
    dullColor: {
      color: "#bcbcbc",
    },
  })
);

const InputTableCell = ({
  handleChange = () => "",
  handleBlur = () => "",
  readOnly = false,
  control,
  name,
  error,
  adornment = { has: false, activate: false, message: "" },
}: any) => {
  const classes = useStyles();

  return (
    <TableCell>
      <Controller
        name={name}
        control={control}
        render={({ field }: any) => (
          <>
            <Input
              {...field}
              fullWidth
              variant="outlined"
              readOnly={readOnly}
              onBlur={() => {
                field.onBlur();
                handleBlur();
              }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                field.onChange(e);
                handleChange(e);
              }}
              value={field.value || ""}
              classes={{ root: readOnly && classes.dullColor }}
              disableUnderline={
                readOnly && field.value !== undefined && field.value !== ""
              }
              endAdornment={
                adornment.has &&
                adornment.activate && (
                  <InputAdornment position="end">
                    <Tooltip title={adornment.message} arrow>
                      <IconButton>
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }
            />
            {error && (
              <FormHelperText style={{ position: "absolute" }} error>
                {error}
              </FormHelperText>
            )}
          </>
        )}
      />
    </TableCell>
  );
};

export default InputTableCell;
