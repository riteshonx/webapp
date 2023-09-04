import { Select, OutlinedInput, MenuItem } from "@material-ui/core";
import { Box } from "@mui/system";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import { useEffect, useState } from "react";
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { makeStyles, styled, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const MaterialMasterSupplier = ({
  allSuppliers,
  params,
  updateSelectedSupplier,
  hasEditAccess,
}: any) => {
  const { value } = params;
  const [selected, setSelected] = useState<any[]>([]);

  useEffect(() => {
    setSelected(value);
  }, [value, setSelected]);

  
const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: '#212121',
    // boxShadow: ,
    boxShadow: theme.shadows[1],
    fontSize: 11,
    border: '1px solid #212121',
    borderRadius: '0px',
  },
}));

  return (
    
    // <LightTooltip title={selected.join(",")} aria-label="material supplier" followCursor leaveDelay={0}>
    <Select
      style={{ top: "initial" }}
      labelId="demo-multiple-name-label"
      id="demo-multiple-name"
      multiple
      renderValue={(val: any) => (val && val.length > 0) ? val.join(", ") : "Select Supplier"}
      value={selected}
      fullWidth
      title={selected.join(",")}
      disableUnderline
      disabled={!hasEditAccess}
      onChange={(event) => {
        setSelected(event.target.value as any[]);
      }}
      onClose={() => {
        updateSelectedSupplier(selected, params.row);
      }}
      displayEmpty
      input={<OutlinedInput label="Name" />}
      placeholder="Select Supplier"
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
    >
      {allSuppliers.map((elem: any, index: any) => {
        return (
          <MenuItem
            key={`${elem}${index}`}
            value={elem}
            style={{
              padding: "0px",
            }}
          >
            <Box
              width="100%"
              justifyContent="space-between"
              display="flex"
              style={{
                padding: "6px 16px 0px 16px",
              }}
            >
              <span style={{ marginRight: "10px" }}>{elem}</span>
              <span>
                {selected.includes(elem) ? (
                  <CheckCircleIcon />
                ) : (
                  <AddCircleOutlineIcon />
                )}
              </span>
            </Box>
          </MenuItem>
        );
      })}
    </Select>
    // </LightTooltip>
  );
};

export default MaterialMasterSupplier;
