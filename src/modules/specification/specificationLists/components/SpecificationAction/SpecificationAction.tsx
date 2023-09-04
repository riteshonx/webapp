import React, { ReactElement, useContext, useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import SearchIcon from "@material-ui/icons/Search";
import "./SpecificationAction.scss";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import GetAppIcon from "@material-ui/icons/GetApp";
import TuneOutlinedIcon from "@material-ui/icons/TuneOutlined";
import AppsIcon from "@material-ui/icons/Apps";
import ViewListIcon from "@material-ui/icons/ViewList";
import Tooltip from "@material-ui/core/Tooltip";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import { SpecificationLibDetailsContext } from "../../context/SpecificationLibDetailsContext";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import { stateContext } from "../../../../root/context/authentication/authContext";
import {
  setConfirmBoxStatus,
  setSelectedSpecFilterData,
} from "../../context/SpecificationLibDetailsAction";
import { Badge } from "@material-ui/core";

export interface Params {
  projectId: string;
}
interface message {
  header: string;
  text: string;
  cancel: string;
  proceed: string;
}

const confirmMessage: message = {
  header: "Are you sure?",
  text: `If you delete these, all data related to these specifications will be lost.`,
  cancel: "Cancel",
  proceed: "Confirm",
};

export default function SpecificationAction(props: any): ReactElement {
  const history = useHistory();
  const { state }: any = useContext(stateContext);
  const pathMatch: match<Params> = useRouteMatch();
  const [enableIcons, setEnableIcons] = useState<boolean>(false);
  const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any =
    useContext(SpecificationLibDetailsContext);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isClearBtnEnable, setIsClearBtnEnable] = useState<boolean>(false);
  const [filterCount, setFilterCount] = useState(0);
  useEffect(() => {
    if (SpecificationLibDetailsState?.specificationLists.length > 0) {
      const isSelected =
        SpecificationLibDetailsState?.specificationLists.filter(
          (item: any) => item.isPartOf
        );
      if (isSelected?.length > 0) {
        setEnableIcons(true);
      } else {
        setEnableIcons(false);
      }
    } else {
      setEnableIcons(false);
    }
  }, [SpecificationLibDetailsState?.specificationLists]);

  useEffect(() => {
    if (SpecificationLibDetailsState.isConfirmOpen) {
      handleConfirmBoxClose();
    }
  }, [SpecificationLibDetailsState.isConfirmOpen]);

  useEffect(() => {
    if (SpecificationLibDetailsState.selectedSpecFilterData) {
      filerCount();
    }
  }, [SpecificationLibDetailsState.selectedSpecFilterData]);

  const filerCount = () => {
    let count: any = 0;

    if (
      SpecificationLibDetailsState.selectedSpecFilterData?.versionName?.length >
      0
    ) {
      count = count + 1;
    }
    if (
      SpecificationLibDetailsState.selectedSpecFilterData?.versionDate?.length >
      0
    ) {
      count = count + 1;
    }
    if (count) {
      setIsClearBtnEnable(true);
    } else {
      setIsClearBtnEnable(false);
    }

    setFilterCount(count);
  };

  const openSpecificationLibrary = () => {
    history.push(
      `/specifications/projects/${pathMatch.params.projectId}/library`
    );
  };

  const handleSearchChange = (value: string) => {
    props.searchTask(value);
  };

  const handleMultiDelete = () => {
    SpecificationLibDetailsDispatch(setConfirmBoxStatus(false));
    setConfirmOpen(true);
  };

  const handleConfirmBoxClose = () => {
    setConfirmOpen(false);
  };

  const deleteFileDoc = () => {
    props.multiDelete();
  };

  const handleMultiDownload = () => {
    props.multiDownload();
  };
  const handleFilterBar = () => {
    props.isFilterOpen(true, true);
  };

  const clearFilterBar = () => {
    clearFilter();
  };
  const clearFilter = async () => {
    const initialValues = {
      versionName: [],
      versionDate: [],
    };
    SpecificationLibDetailsDispatch(setSelectedSpecFilterData(initialValues));
    props.isFilterOpen(false);
  };
  return (
    <>
      <div className="specifications-action">
        <div className="specifications-action__middle">
          <div className="specifications-action__middle__search">
            <TextField
              value={props.searchText}
              id="specifications-lists-search-text"
              type="text"
              fullWidth
              placeholder="Search"
              autoComplete="search"
              variant="outlined"
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <SearchIcon className="specifications-action__middle__search__icon" />
            {/* <div className="drawings-action__middle__count">Showing 0 entries</div> */}
          </div>
          <div className="specifications-action__middle__icon">
            {!isClearBtnEnable ? (
              <Tooltip title={"Filter"} aria-label="first name">
                <label>
                  <IconButton
                    disabled={false}
                    color="primary"
                    aria-label="filter"
                    onClick={handleFilterBar}
                  >
                    <TuneOutlinedIcon
                      className={isClearBtnEnable ? "filter-icon" : ""}
                    />
                  </IconButton>
                </label>
              </Tooltip>
            ) : (
              <Badge badgeContent={filterCount} color="primary">
                <Button
                  data-testid={"clear-filter"}
                  variant="outlined"
                  className="btn btn-secondary"
                  onClick={clearFilterBar}
                  size="small"
                >
                  Clear Filter
                </Button>
              </Badge>
            )}
          </div>
          {/* <div className="specifications-action__middle__icon">
                        <Tooltip title={'List View'} aria-label="first name">
                            <label>
                                <IconButton color="primary" aria-label="list-view" onClick={() => toggleView('list')}>
                                    <ViewListIcon  className={viewType === 'gallery' ? 'inactive' : ''}/>
                                </IconButton>
                            </label>
                        </Tooltip>
                    </div> */}
          {/* <div className="specifications-action__middle__icon">
                        <Tooltip title={'Gallery View'} aria-label="first name">
                            <label>
                                <IconButton color="primary" aria-label="grid-view" onClick={() => toggleView('gallery')}>
                                    <AppsIcon className={viewType === 'list' ? 'inactive' : ''}/>
                                </IconButton>
                            </label>
                        </Tooltip>
                    </div> */}
        </div>
        <div className="specifications-action__right">
          {
            // viewType === 'list' && (
            <>
              {state?.projectFeaturePermissons?.candeleteSpecifications && (
                <div className="specifications-action__right__icon">
                  <Tooltip title={"Delete"} aria-label="first name">
                    <label>
                      <IconButton
                        color="primary"
                        aria-label="delete"
                        disabled={!enableIcons}
                        onClick={handleMultiDelete}
                      >
                        <DeleteIcon
                          className={enableIcons ? "" : "disable-icon"}
                        />
                      </IconButton>
                    </label>
                  </Tooltip>
                </div>
              )}
            </>
            // )
          }
          {state?.projectFeaturePermissons?.cancreateSpecifications && (
            <Button
              data-testid={"specification-library"}
              variant="outlined"
              className="btn-primary"
              onClick={openSpecificationLibrary}
            >
              Specification Management
            </Button>
          )}
        </div>
      </div>

      {confirmOpen ? (
        <ConfirmDialog
          open={confirmOpen}
          message={confirmMessage}
          close={handleConfirmBoxClose}
          proceed={deleteFileDoc}
        />
      ) : (
        ""
      )}
    </>
  );
}
