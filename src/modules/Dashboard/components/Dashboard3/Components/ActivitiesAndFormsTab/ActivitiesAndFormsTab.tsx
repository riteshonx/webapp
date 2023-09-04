import { CircularProgress } from "@material-ui/core";
import React, { ReactElement, useEffect, useState } from "react";
import FilterIcon from "@material-ui/icons/Tune";
import ActivityCard from "../../Shared/ActivityCard/ActivityCard";
import FormsCard from "../../Shared/FormsCard/FormsCard";
import { decodeExchangeToken } from "src/services/authservice";
import FilterPopup from "../FilterPopup/FilterPopup";
import "./ActivitiesAndFormsTab.scss";

interface ActivitiesAndFormsTab {
  projectUsers: any;
  tasks: any;
  forms: any;
  activityFilters: any;
  fetchAssignedActivities: any;
  handleFilterClick: any;
}

const ActivitiesAndFormsTab = ({
  projectUsers,
  tasks,
  forms,
  activityFilters,
  fetchAssignedActivities,
  handleFilterClick,
}: ActivitiesAndFormsTab): ReactElement => {
  const [isActiveTab, setIsActiveTab] = useState(true);
  const [isAssignedToMe, setIsAssignedToMe] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleActiveTabChange = (val: boolean) => {
    setIsActiveTab(val);
  };

  const handleAssignedToTab = (val: any) => {
    setIsAssignedToMe(val);
    val === true
      ? fetchAssignedActivities("assignedTo", decodeExchangeToken().userId)
      : fetchAssignedActivities("allItems", null);
  };

  const handleFilterPopupClose = () => {
    setAnchorEl(null);
  };

  const handleFilterPopupOpen = (ev: any) => {
    setAnchorEl(ev.currentTarget);
  };

  useEffect(() => {
    if (activityFilters?.assignedTo === decodeExchangeToken()?.userId) {
      setIsAssignedToMe(true);
    } else {
      setIsAssignedToMe(false);
    }
  }, [activityFilters]);

  return (
    <div className="activitiesAndFormsTab-main">
      <div className="activitiesAndFormsTab-main__activitiesAndFormsHeadContainer">
        <div
          className={
            isActiveTab
              ? "activitiesAndFormsTab-main__activitiesAndFormsHeadContainer__activitiesHeader activitiesAndFormsTab-main__activitiesAndFormsHeadContainer__isActive"
              : "activitiesAndFormsTab-main__activitiesAndFormsHeadContainer__activitiesHeader"
          }
          onClick={() => handleActiveTabChange(true)}
        >
          Activities
        </div>
        <div
          className={
            !isActiveTab
              ? "activitiesAndFormsTab-main__activitiesAndFormsHeadContainer__activitiesHeader activitiesAndFormsTab-main__activitiesAndFormsHeadContainer__isActive"
              : "activitiesAndFormsTab-main__activitiesAndFormsHeadContainer__activitiesHeader"
          }
          onClick={() => handleActiveTabChange(false)}
        >
          Forms
        </div>
      </div>
      <div className="activitiesAndFormsTab-main__filtersContainer">
        <span className="activitiesAndFormsTab-main__filtersContainer__allItemsAndAssignedToMeContainers">
          <span
            className={
              !isAssignedToMe
                ? "activitiesAndFormsTab-main__filtersContainer__allItemsAndAssignedToMeContainers__isAssigned"
                : "activitiesAndFormsTab-main__filtersContainer__allItemsAndAssignedToMeContainers__allItems"
            }
            onClick={() => handleAssignedToTab(false)}
          >
            All Items
          </span>
          <span
            className={
              isAssignedToMe
                ? "activitiesAndFormsTab-main__filtersContainer__allItemsAndAssignedToMeContainers__isAssigned"
                : "activitiesAndFormsTab-main__filtersContainer__allItemsAndAssignedToMeContainers__allItems"
            }
            onClick={() => handleAssignedToTab(true)}
          >
            Assigned to me
          </span>
        </span>
        <span
          className="activitiesAndFormsTab-main__filtersContainer__filterMenu"
          aria-owns={"filter-menu"}
          onClick={handleFilterPopupOpen}
        >
          Filters
          <FilterIcon className="activitiesAndFormsTab-main__filtersContainer__filterMenu__icon" />
        </span>
      </div>
      {isActiveTab && (
        <div className="activitiesAndFormsTab-main__tasksOrFormsContainer">
          {tasks === null && (
            <div className="activitiesAndFormsTab-main__circularProgressContainer">
              <CircularProgress className="activitiesAndFormsTab-main__circularProgressContainer__circularProgress" />
            </div>
          )}

          {tasks?.length > 0
            ? tasks.map((item: any, i: number) => (
                <ActivityCard key={i} data={item} />
              ))
            : tasks?.length === 0 && (
                <div className="activitiesAndFormsTab-main__noDataContainer">
                  No Tasks available!
                </div>
              )}
        </div>
      )}
      {!isActiveTab && (
        <div className="activitiesAndFormsTab-main__tasksOrFormsContainer">
          {forms === null && (
            <div className="activitiesAndFormsTab-main__circularProgressContainer">
              <CircularProgress className="activitiesAndFormsTab-main__circularProgressContainer__circularProgress" />
            </div>
          )}
          {forms?.length > 0
            ? forms.map((item: any, i: number) => (
                <FormsCard key={i} data={item} />
              ))
            : forms?.length === 0 && (
                <div className="activitiesAndFormsTab-main__noDataContainer">
                  No Forms available!
                </div>
              )}
        </div>
      )}
      <FilterPopup
        open={anchorEl}
        handleClose={handleFilterPopupClose}
        projectUsers={projectUsers}
        activityFilters={activityFilters}
        handleFilterClick={handleFilterClick}
        isActiveTab={isActiveTab}
      />
    </div>
  );
};

export default ActivitiesAndFormsTab;
