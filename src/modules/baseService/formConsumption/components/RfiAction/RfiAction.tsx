import React, { ReactElement, useContext } from "react";
import SearchIcon from "@material-ui/icons/Search";
import "./RfiAction.scss";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import TuneOutlinedIcon from "@material-ui/icons/TuneOutlined";
import { Badge, IconButton, Tooltip } from "@material-ui/core";
import { projectContext } from "../../Context/projectContext";
import {
  setFilter,
  setFilterData,
  setFilterOptions,
} from "../../Context/projectActions";
import { FIXED_FIELDS, FormOptionType } from "../../../../../utils/constants";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import Checkbox from "@material-ui/core/Checkbox";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import { canViewTemplates } from "../../../forms/utils/permission";
import SettingsIcon from "@material-ui/icons/Settings";
import XLSIcon from "src/assets/images/xls-icon.svg";
import { featureFormRoles } from "src/utils/role";
import { postApiWithProjectExchange } from "src/services/api";
import { useState } from "react";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import ExportSuccessDialog from "../ExportSuccessDialog/ExportSuccessDialog";
import { decodeToken } from "src/services/authservice";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const userEmail = decodeToken().userEmail;
export interface Params {
  id: string;
  featureId: string;
}

export default function RfiAction(props: any): ReactElement {
  const history = useHistory();
  const pathMatch: match<Params> = useRouteMatch();
  const { projectState, projectDispatch }: any = useContext(projectContext);
  const { dispatch, state }: any = useContext(stateContext);

  const [isExportModalOpen, setExportModalOpen] = useState(false);

  async function triggerXLSExportApi() {
    const body: any = {
      input: {
        featureId: Number(pathMatch.params.featureId),
        source: "FORM_LIST",
        reportType: "EXCEL",
        fields: "ALL",
        processedFile: true,
      },
      session_variables: { "x-hasura-role": "viewForm" },
    };
    const filterPayload = props.getFilterPayload();
    if (filterPayload.length) body.input.filterData = filterPayload;
    try {
      dispatch(setIsLoading(true));
      await postApiWithProjectExchange("V1/data/export", body, null);
      setExportModalOpen(true);
    } catch (e) {
      console.error("Something went wrong while triggering export xls api", e);
      Notification.sendNotification(
        "Failed to export. Please try again.",
        AlertTypes.warn
      );
    } finally {
      dispatch(setIsLoading(false));
    }
  }

  const createRfi = () => {
    if (pathMatch.params.id) {
      history.push(
        `/base/projects/${Number(pathMatch.params.id)}/form/${Number(
          pathMatch.params.featureId
        )}/create`
      );
    }
  };

  const toggleFilter = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    projectDispatch(setFilter(true));
  };

  const clearFilter = () => {
    projectDispatch(setFilter(false));
    const targetList = [];
    if (props.name.trim()) {
      targetList.push(
        ...projectState.filterData.filter(
          (item: any) => item.elementId === FIXED_FIELDS.SUBJECT
        )
      );
    }
    if (props.formOptionType.length > 0) {
      props.formOptionType.forEach((valueItem: any) => {
        if (valueItem === FormOptionType.CREATEDBYME) {
          targetList.push(
            ...projectState.filterData.filter(
              (item: any) => item.elementId === FIXED_FIELDS.CREATED_BY
            )
          );
        }
        if (valueItem === FormOptionType.ASSIGNEdTOME) {
          targetList.push(
            ...projectState.filterData.filter(
              (item: any) => item.elementId === FIXED_FIELDS.ASSIGNEE
            )
          );
        }
      });
    }
    projectDispatch(setFilterData(targetList));
    const options = [...projectState.filterOptions];
    options.forEach((item: any) => {
      item.isOpen = false;
    });
    projectDispatch(setFilterOptions(options));
  };

  const checkBadgeOption = () => {
    if (props.optionsCount == 0) return true;
    else return false;
  };

  const changeInSearchText = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    props.changeInSearchName(event.target.value);
  };

  const handleChange = (event: any, value: any) => {
    props.changeInFormoptions(value);
  };

  const navigateToSettings = () => {
    if (pathMatch.params.featureId) {
      history.push(`/base/forms/${pathMatch.params.featureId}`);
    }
  };

  return (
    <div className="rfi-action">
      <div className="rfi-action__left">
        <div className="rfi-action__left__search">
          <TextField
            id="list-search-text"
            type="text"
            value={props.name}
            fullWidth
            placeholder="Search Subject"
            autoComplete="off"
            variant="outlined"
            onChange={(e) => changeInSearchText(e)}
          />
          <SearchIcon className="rfi-action__left__search__icon" />
        </div>
        <div className="rfi-action__left__selectBox">
          <Autocomplete
            className="rfi-action__left__autoComplete"
            multiple
            size="small"
            id="checkboxes-tags-demo"
            options={[FormOptionType.ASSIGNEdTOME, FormOptionType.CREATEDBYME]}
            disableCloseOnSelect
            onChange={handleChange}
            getOptionLabel={(option) =>
              option === FormOptionType.ASSIGNEdTOME
                ? "Assigned to me"
                : option === FormOptionType.CREATEDBYME
                ? "Created by me"
                : ""
            }
            renderOption={(option, { selected }) => (
              <React.Fragment>
                <Checkbox
                  color="default"
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                <span className="mat-menu-item-sm">
                  {option === FormOptionType.ASSIGNEdTOME
                    ? "Assigned to me"
                    : option === FormOptionType.CREATEDBYME
                    ? "Created by me"
                    : ""}
                </span>
              </React.Fragment>
            )}
            renderInput={(params) => (
              <TextField
                placeholder={
                  props.formOptionType.length > 0
                    ? ""
                    : "Assigned / Created by me"
                }
                {...params}
                variant="outlined"
              />
            )}
          />
        </div>
        <div className={`${projectState?.currentFeature?.count?"rfi-action__left__filter":""}`}>
          <Tooltip title="Filter">
            <Badge
              badgeContent={props.optionsCount > 0 ? props.optionsCount : 0}
              color="primary"
              overlap="circle"
              invisible={checkBadgeOption()}
            >
              <IconButton 
                onClick={(e) => toggleFilter(e)}
                disabled={!projectState?.currentFeature?.count}
              >
                <TuneOutlinedIcon data-testid={"filter-rfi"} />
              </IconButton>
            </Badge>
          </Tooltip>
          {props.optionsCount > 0 && projectState.showFilter ? (
            <Button
              data-testid={"create-form-template"}
              variant="outlined"
              className="rfi-action__left__filter__btn btn-secondary"
              onClick={clearFilter}
            >
              Clear All
            </Button>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className="rfi-action__right">
        <div className="rfi-action__right__create">
          {canViewTemplates && (
            <Button
              data-testid={"create-form-template"}
              variant="outlined"
              className="btn-secondary"
              onClick={navigateToSettings}
            >
              <SettingsIcon /> &nbsp; Form Settings
            </Button>
          )}
          {projectState?.featureRoles.includes(featureFormRoles.viewForm) && (
            <Button
              data-testid={"create-form-template"}
              variant="outlined"
              className="btn-secondary"
              onClick={triggerXLSExportApi}
              disabled={!projectState?.currentFeature?.count}
            >
              <img className="rfi-action_excelIcon" src={XLSIcon} /> &nbsp;
              Export to Excel
            </Button>
          )}
          {projectState?.featurePermissions?.canCreateForm && (
            <Button
              data-testid={"create-form-template"}
              variant="outlined"
              className="btn-primary"
              onClick={createRfi}
            >
              Create
            </Button>
          )}
        </div>
        <ExportSuccessDialog
          isOpen={isExportModalOpen}
          footer="Kindly note that it can sometimes take a while before it reaches your
          inbox."
          heading={`We have exported the ${
            projectState?.currentFeature?.count > 1 ? "forms" : "form"
          } to your registered email id:`}
          listOfData={[userEmail]}
          handleOnOkClick={() => setExportModalOpen(false)}
        />
      </div>
    </div>
  );
}
