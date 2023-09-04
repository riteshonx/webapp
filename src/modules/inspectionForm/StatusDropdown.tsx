import { FormControl, makeStyles, MenuItem, Select } from "@material-ui/core";
import React, { useEffect, useState } from "react";

const useStyles = makeStyles({
  formControl: {
    minWidth: 150,
  },
});

const StatusDropdown = ({ value, handleChange, statusList }: any) => {
  const classes = useStyles();
  const [currentVal, setCurrentVal] = useState(value);
  useEffect(() => {
    setCurrentVal(value);
  }, [value]);
  return (
    <FormControl
      variant="outlined"
      style={{ padding: 0 }}
      className={classes.formControl}
    >
      <Select
        labelId="demo-simple-select-outlined-label"
        id="demo-simple-select-outlined"
        onChange={handleChange}
        defaultValue={currentVal}
        value={currentVal}
        style={{
          fontWeight: "bold",
          height: "4rem",
          backgroundColor:
            currentVal === "OPEN"
              ? "bisque"
              : currentVal === "IN PROGRESS"
              ? "lightblue"
              : currentVal === "PENDING PARTS"
              ? "yellow"
              : "lightgreen",
        }}
        MenuProps={{
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
          transformOrigin: {
            vertical: "top",
            horizontal: "left",
          },
          getContentAnchorEl: null,
        }}
        disabled={currentVal === "CLOSED"}
      >
        {statusList?.map((val: any) => (
          <MenuItem
            key={val?.id}
            value={val?.status}
            style={{
              backgroundColor:
                val?.status === "OPEN"
                  ? "bisque"
                  : val?.status === "IN PROGRESS"
                  ? "lightblue"
                  : val?.status === "PENDING PARTS"
                  ? "yellow"
                  : "lightgreen",
              margin:
                val?.status !== "CLOSED" ? "0 1rem 1rem" : "1rem 1rem 0 1rem",
              fontSize: "1.4rem",
              boxShadow:
                " 0 4px 4px 0 rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.19)",
            }}
          >
            {val?.status}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default StatusDropdown;
