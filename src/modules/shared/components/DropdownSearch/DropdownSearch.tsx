import { makeStyles, TextField, Tooltip } from "@material-ui/core";
import { ReactElement } from "react";
import "./DropdownSearch.scss";
import { Autocomplete } from "@material-ui/lab";
import src_image_1 from "../../../../assets/images/3.png";

const activeTenantName = localStorage.getItem("activeTenantName");
const dashboardType = sessionStorage.getItem("dashboardType");

const useStyles = makeStyles(() => ({
  notchedOutline: {
    border: "none !important",
    boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)",
  },
  paperONX: {
    margin: 0,
    backgroundImage: `url(${src_image_1})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "50% 0%",
    color: "#fff",
    fontSize: "14px",
  },
  paper: {
    margin: 0,
    // background:
    //   dashboardType === "slate2.0" ? "#171D25" : "rgba(29, 58, 64, 0.739583)",
    // background: "rgba(23, 29, 27, 1)",
    background: "#171D25",
    color: "#fff",
  },
  paperTransparent: {
    margin: 0,
    background: "transparent",
    color: !activeTenantName?.toLocaleLowerCase()?.includes("onx")
      ? "#fff"
      : "#ffc107",
    fontSize: "14px",
    boxShadow:
      "0px 5px 1px -1px rgb(0 0 0 / 28%), 0px 1px 1px 0px rgb(0 0 0 / 16%), 0px 1px 3px 0px rgb(0 0 0 / 11%)",
  },
}));

function DropdownSearch({
  selectedValue,
  handleDropDownClick,
  options,
  optionLabel,
  handleDropdownSelectionChange,
  isDisabled,
  transparent,
  type,
  isOnxTenant,
}: any): ReactElement {
  const classes: any = useStyles();

  return (
    <div
      className={
        isDisabled
          ? "project-container project-container_disable"
          : "project-container"
      }
    >
      <div className={"project-container dropdown"}>
        {selectedValue && Object.keys(selectedValue).length > 0 && (
          <Autocomplete
            data-testid={`project-container-dropdown-input`}
            id="combo-box-demo"
            disabled={isDisabled}
            options={options}
            disablePortal
            renderOption={(option: any) => (
              <div>
                {option[optionLabel] ? (
                  option[optionLabel].length <= 18 ? (
                    option[optionLabel]
                  ) : (
                    <Tooltip
                      title={option[optionLabel]}
                      placement="right-start"
                    >
                      <span>
                        {option[optionLabel].slice(0, 18).trim() + "..."}
                      </span>
                    </Tooltip>
                  )
                ) : (
                  ""
                )}
              </div>
            )}
            getOptionSelected={(option: any, value: any) => {
              if (type === "portfolio") {
                return value?.portfolioName === option?.portfolioName;
              } else {
                return value?.projectName === option?.projectName;
              }
            }}
            // popupIcon={false}
            defaultValue={selectedValue}
            value={selectedValue}
            selectOnFocus
            classes={{
              paper: transparent
                ? classes.paperTransparent
                : isOnxTenant
                ? classes.paperONX
                : classes.paper,
            }}
            getOptionLabel={(option: any) =>
              option[optionLabel]
                ? option[optionLabel].length <= 18
                  ? option[optionLabel]
                  : option[optionLabel].slice(0, 18).trim() + "..."
                : ""
            }
            disableClearable
            noOptionsText={
              type === "portfolio" ? "No portfolios found" : "No projects found"
            }
            onChange={(e, value, reason) =>
              handleDropdownSelectionChange(value)
            }
            renderInput={(params: any) => (
              <TextField
                {...params}
                placeholder={"Search"}
                variant="outlined"
                // autoFocus
                // InputProps={{
                //   classes: {
                //     // notchedOutline: classes.notchedOutline,
                //   },
                // }}
                onBlur={() => handleDropDownClick()}
              />
            )}
          />
        )}
      </div>
    </div>
  );
}

export default DropdownSearch;
