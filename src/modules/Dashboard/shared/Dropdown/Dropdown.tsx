import React, { useEffect, useContext, ReactElement } from "react";
import {
  makeStyles,
  createStyles,
  withStyles,
  Theme,
} from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import "./Dropdown.scss";
import axios from "axios";
import {
  Button,
  FormControlLabel,
  IconButton,
  List,
  Menu,
  MenuItem,
  Select,
} from "@material-ui/core";
import {
  decodeExchangeToken,
  getExchangeToken,
} from "../../../../services/authservice";
import FilterListRoundedIcon from "@material-ui/icons/RestoreTwoTone";
import WidgetsIcon from "@material-ui/icons/Tune";
import Switch, { SwitchClassKey, SwitchProps } from "@material-ui/core/Switch";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { setProjectSettings } from "src/modules/root/context/authentication/action";
import { useHistory } from "react-router-dom";

const DASHBOARD_URL: any = process.env["REACT_APP_DASHBOARD_URL"];

interface Styles extends Partial<Record<SwitchClassKey, string>> {
  focusVisible?: string;
}

interface Props extends SwitchProps {
  classes: Styles;
}

const currentYear = new Date().getFullYear();

const yearlyData = [
  { id: `y${currentYear}`, value: currentYear },
  { id: `y${currentYear - 1}`, value: currentYear - 1 },
  { id: `y${currentYear - 2}`, value: currentYear - 2 },
  { id: `y${currentYear - 3}`, value: currentYear - 3 },
];

const IOSSwitch = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 42,
      height: 26,
      padding: 0,
      margin: theme.spacing(1),
    },
    switchBase: {
      padding: 1,
      "&$checked": {
        transform: "translateX(16px)",
        color: theme.palette.common.white,
        "& + $track": {
          backgroundColor: "#1D3A40",
          opacity: 1,
          border: "none",
        },
      },
      "&$focusVisible $thumb": {
        color: "#52d869",
        border: "6px solid #fff",
      },
    },
    thumb: {
      width: 24,
      height: 24,
    },
    track: {
      borderRadius: 26 / 2,
      border: `1px solid ${theme.palette.grey[400]}`,
      backgroundColor: theme.palette.grey[50],
      opacity: 1,
      transition: theme.transitions.create(["background-color", "border"]),
    },
    checked: {},
    focusVisible: {},
  })
)(({ classes, ...props }: Props) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

const useStyles = makeStyles(() => ({
  formControl: {
    margin: "0 1rem",
    minWidth: "9rem",
    borderRadius: 20,
    background: "beige",
  },
  selectEmpty: {},
  radio: {
    "&$checked": {
      color: "#1D3A40",
    },
  },
  checked: {},
  paper: {
    borderRadius: "3rem",
  },
  input: {
    padding: "0 !important",
  },
}));

interface DropdownProps {
  menuEl: any;
  handleClick: any;
  handleClose: any;
  currentMenu: any;
  handleFilterChange: any;
  handleListItemClick: any;
  handleFilterApply: any;
  selectedIndex: number;
  savedValue: any;
  currentMenuType: any;
  currentLevel: string;
  selectedYearIndex: number;
  handleYearFilterClick: any;
}

const Dropdown = ({
  menuEl,
  currentMenu,
  handleFilterChange,
  handleListItemClick,
  handleFilterApply,
  selectedIndex,
  savedValue,
  currentMenuType,
  handleClick,
  handleClose,
  currentLevel,
  selectedYearIndex,
  handleYearFilterClick,
}: DropdownProps): ReactElement => {
  const classes = useStyles();
  const [widgetEl, setWidgetMenuEl] = React.useState(null);
  const { dispatch, state }: any = useContext(stateContext);
  const history = useHistory();

  const defaultObj: any = {
    progress: true,
    budget: true,
    rfi: true,
    milestone: true,
    status: true,
    ahead: true,
    ontime: true,
    behind: true,
    tmr: true,
    ppc: true,
    variances: true,
    constraints: true,
    carbonfootprint: true,
    carbondata: true,
    carbon: true,
    productivity: true,
    noncompliance: true,
    onsite: true,
    timeandstatus: true,
    health: true,
    spi: true,
  };
  const [setting, setSettings] = React.useState({
    budget: true,
    rfi: true,
    milestone: true,
    status: true,
    ahead: true,
    ontime: true,
    behind: true,
    tmr: true,
    ppc: true,
    variances: true,
    constraints: true,
    carbonfootprint: true,
    carbondata: true,
    carbon: true,
    productivity: true,
    noncompliance: true,
    onsite: true,
    timeandstatus: true,
    health: true,
    spi: true,
  });

  useEffect(() => {
    setSettings(state?.projectWidgetSettings || defaultObj);
  }, [state.projectWidgetSettings]);

  const savePreference = async (data: any) => {
    const payload = {
      tenantId: Number(decodeExchangeToken().tenantId),
      userId: decodeExchangeToken().userId,
      preferencesJson: { ...state?.selectedPreference, widgets: data },
    };
    const token = getExchangeToken();
    try {
      const response = await axios.post(
        `${DASHBOARD_URL}dashboard/savePreferences`,
        payload,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.status === 200) {
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (event: any) => {
    setSettings({ ...setting, [event.target.name]: event.target.checked });
    sessionStorage.setItem(
      "projectWidgetSettings",
      JSON.stringify({ ...setting, [event.target.name]: event.target.checked })
    );
    savePreference({ ...setting, [event.target.name]: event.target.checked });
    dispatch(
      setProjectSettings({
        ...setting,
        [event.target.name]: event.target.checked,
      })
    );
  };

  const handleWidgetOptions = (event: any) => {
    setWidgetMenuEl(event.currentTarget);
  };

  const handleCloseWidgetOptions = () => {
    setWidgetMenuEl(null);
  };

  return (
    <div className={"dropdown1-container"}>
      <div className="filter">
        {savedValue?.type === "select"
          ? savedValue?.year
          : savedValue?.value
          ? savedValue?.value + ", " + savedValue?.year
          : savedValue?.year}
      </div>
      <>
        <IconButton onClick={handleClick} className={"filterButton__style"}>
          <FilterListRoundedIcon
            aria-controls="status-menu"
            aria-haspopup="true"
            className={"filterButton__style__icon"}
          />
        </IconButton>
        <IconButton
          className={"filterButton__style"}
          onClick={handleWidgetOptions}
        >
          <WidgetsIcon
            aria-controls="status-menu"
            aria-haspopup="true"
            className={"filterButton__style__icon"}
          />
        </IconButton>
        <Menu
          id="status-menu"
          anchorEl={widgetEl}
          open={Boolean(widgetEl)}
          onClose={handleCloseWidgetOptions}
          keepMounted
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          classes={{
            paper: classes.paper,
          }}
          className={"widget1-container"}
        >
          <div className={"widget1-container__main"}>
            <div className={"widget1-container__main__container"}>
              <div>
                <p className={"title"}>Widget selection</p>
                <p className={"sub"}>Select the widgets to include.</p>
              </div>
              <Divider />
              <FormControl component="fieldset">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        checked={setting.tmr}
                        onChange={handleChange}
                        name="tmr"
                      />
                    }
                    labelPlacement="start"
                    label="TMR"
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        checked={setting.ppc}
                        onChange={handleChange}
                        name="ppc"
                      />
                    }
                    labelPlacement="start"
                    label="PPC"
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        checked={setting.variances}
                        onChange={handleChange}
                        name="variances"
                      />
                    }
                    labelPlacement="start"
                    label="Variances"
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        checked={setting.constraints}
                        onChange={handleChange}
                        name="constraints"
                      />
                    }
                    labelPlacement="start"
                    label="Constraints"
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        checked={setting.carbonfootprint}
                        onChange={handleChange}
                        name="carbonfootprint"
                      />
                    }
                    labelPlacement="start"
                    label="Carbon Footprint"
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        checked={setting.rfi}
                        onChange={handleChange}
                        name="rfi"
                      />
                    }
                    labelPlacement="start"
                    label="RFI’s"
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        checked={setting.milestone}
                        onChange={handleChange}
                        name="milestone"
                      />
                    }
                    labelPlacement="start"
                    label="Milestone"
                  />
                  <Divider />
                  {currentLevel === "project" && (
                    <>
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            checked={setting.carbondata}
                            onChange={handleChange}
                            name="carbondata"
                          />
                        }
                        labelPlacement="start"
                        label="Carbon Data"
                      />
                    </>
                  )}
                  <Divider />
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        checked={setting.budget}
                        onChange={handleChange}
                        name="budget"
                      />
                    }
                    labelPlacement="start"
                    label="Budget"
                  />
                  <Divider />
                  {history.location.pathname.includes("/productionCenter") && (
                    <>
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            checked={setting.productivity}
                            onChange={handleChange}
                            name="productivity"
                          />
                        }
                        labelPlacement="start"
                        label="Productivity"
                      />
                      <Divider />
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            checked={setting.noncompliance}
                            onChange={handleChange}
                            name="noncompliance"
                          />
                        }
                        labelPlacement="start"
                        label="Non Compliance"
                      />
                      <Divider />
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            checked={setting.onsite}
                            onChange={handleChange}
                            name="onsite"
                          />
                        }
                        labelPlacement="start"
                        label="Who's on site"
                      />
                      <Divider />
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            checked={setting.health}
                            onChange={handleChange}
                            name="health"
                          />
                        }
                        labelPlacement="start"
                        label="Health"
                      />
                      <Divider />
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            checked={setting.timeandstatus}
                            onChange={handleChange}
                            name="timeandstatus"
                          />
                        }
                        labelPlacement="start"
                        label="Time & Status"
                      />
                      <Divider />
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            checked={setting.spi}
                            onChange={handleChange}
                            name="spi"
                          />
                        }
                        labelPlacement="start"
                        label="SPI"
                      />
                      <Divider />
                    </>
                  )}
                  {currentLevel === "project" && (
                    <>
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            checked={setting.status}
                            onChange={handleChange}
                            name="status"
                          />
                        }
                        labelPlacement="start"
                        label="Project Status"
                      />
                      <Divider />
                    </>
                  )}
                  {currentLevel === "portfolio" && (
                    <>
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            checked={setting.carbon}
                            onChange={handleChange}
                            name="carbon"
                          />
                        }
                        labelPlacement="start"
                        label="Carbon"
                      />
                      <Divider />
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            checked={setting.ontime}
                            onChange={handleChange}
                            name="ontime"
                          />
                        }
                        labelPlacement="start"
                        label="On Time"
                      />
                      <Divider />
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            checked={setting.ahead}
                            onChange={handleChange}
                            name="ahead"
                          />
                        }
                        labelPlacement="start"
                        label="Ahead"
                      />
                      <Divider />
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            checked={setting.behind}
                            onChange={handleChange}
                            name="behind"
                          />
                        }
                        labelPlacement="start"
                        label="behind"
                      />
                      <Divider />
                    </>
                  )}
                </FormGroup>
              </FormControl>
            </div>
          </div>
        </Menu>
        <Menu
          id="status-menu"
          anchorEl={menuEl}
          open={Boolean(menuEl)}
          onClose={handleClose}
          keepMounted
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          classes={{
            paper: classes.paper,
          }}
          className={"menu1-container"}
        >
          <div className={"menu1-container__main"}>
            <div className={"menu1-container__main__container"}>
              <div className={"menu1-container__main__container__year"}>
                {currentMenuType.year}
              </div>

              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={currentMenuType?.type}
                  label="Age"
                  onChange={handleFilterChange}
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
                  <MenuItem value={"select"}>Select</MenuItem>
                  <MenuItem value={"quarterly"}>Quarterly</MenuItem>
                  <MenuItem value={"monthly"}>Monthly</MenuItem>
                  <MenuItem value={"weekly"}>Weekly</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className={"menu1-list__yearContainer"}>
              <div
                className={
                  currentMenuType?.type === "select"
                    ? "menu1-list menu1-list__yearContainer__innerContainerFlex"
                    : "menu1-list menu1-list__yearContainer__innerContainer"
                }
              >
                <List
                  component="nav"
                  aria-label="main mailbox folders"
                  className="list"
                >
                  {yearlyData?.map((item: any, i: number) => (
                    <ListItem
                      key={i}
                      button
                      selected={selectedYearIndex === i}
                      onClick={() => handleYearFilterClick(item, i)}
                    >
                      <ListItemText primary={item?.value} />
                    </ListItem>
                  ))}
                </List>
              </div>
              {currentMenuType?.type !== "select" && (
                <div
                  className={
                    "menu1-list menu1-list__yearContainer__innerContainerFlex"
                  }
                >
                  <List
                    component="nav"
                    aria-label="main mailbox folders"
                    className="list"
                  >
                    {currentMenu?.map((item: any, i: number) => (
                      <ListItem
                        key={i}
                        button
                        selected={selectedIndex === i}
                        onClick={() => handleListItemClick(item, i)}
                      >
                        <ListItemText primary={item?.value} />
                      </ListItem>
                    ))}
                  </List>
                </div>
              )}
            </div>
          </div>
          <div className={"menu1-list__buttonContainer"}>
            <Button
              className={"cancel"}
              variant={"contained"}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              className={"apply-filter"}
              variant={"contained"}
              onClick={handleFilterApply}
              disabled={savedValue.id === currentMenuType.id}
            >
              Apply
            </Button>
          </div>
        </Menu>
      </>
    </div>
  );
};

export default Dropdown;
