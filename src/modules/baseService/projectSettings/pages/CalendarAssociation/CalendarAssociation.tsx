import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
} from '@material-ui/core';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { match, useRouteMatch } from 'react-router-dom';
import { GET_PROJECT_IMPORT_TYPE } from 'src/modules/dynamicScheduling/graphql/queries/projectPlan';
import WarningIcon from '../../../../../assets/images/warning.svg';
import { client } from '../../../../../services/graphql';
import { ProjectSetupRoles } from '../../../../../utils/role';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { stateContext } from '../../../../root/context/authentication/authContext';
import NoDataMessage from '../../../../shared/components/NoDataMessage/NoDataMessage';
import Notification, {
  AlertTypes,
} from '../../../../shared/components/Toaster/Toaster';
import { CustomPopOver } from '../../../../shared/utils/CustomPopOver';
import { projectDetailsContext } from '../../../projects/Context/ProjectDetailsContext';
import ProjectSettingsHeader from '../../components/ProjectSettingsHeader/ProjectSettingsHeader';
import {
  DELETE_ASSOCIATE_CALENDAR,
  GET_CALENDAR,
  GET_PROJECT_ASSOCIATED_CALENDAR,
  SET_PROJECT_ASSOCIATED,
  UPDATE_PROJECT_SCHEDULE_METADATA,
  UPDATE_PROJECT_TASK,
} from '../../graphql/queries/calendarAssociation';
import './CalendarAssociation.scss';

export interface Params {
  projectId: string;
}

export const header = 'Calendar Association';
export const noPermissionMessage =
  "You don't have permission to view project calendar settings";
export default function CalendarAssociation(): ReactElement {
  const pathMatch: match<Params> = useRouteMatch();
  const [calendarTemplate, setCalendarTemplate] = useState<any>([]);
  const [currentCalendar, setCurrentCalendar] = useState<any>([]);
  const [projectCalendar, setProjectCalendar] = useState<any>([]);
  const [projectImportType, setProjectImportType] = useState<string>('');
  const [tenantCalendar, setTenantCalendar] = useState<any>([]);
  const [defaultIndex, setDefaultIndex] = useState<any>(0);
  const classes = CustomPopOver();
  const globalContext: any = useContext(stateContext);
  const { projectDetailsState }: any = useContext(projectDetailsContext);
  useEffect(() => {
    if (projectDetailsState.projectToken) {
      getProjectCalendar(Number(pathMatch.params.projectId));
      getProjectImportType(Number(pathMatch.params.projectId));
      getTenantCalendar();
    }
  }, [projectDetailsState.projectToken]);

  useEffect(() => {
    if (tenantCalendar && tenantCalendar?.length > 0 && projectCalendar?.data) {
      const tempCalendar: any = [];
      if (
        tenantCalendar &&
        tenantCalendar?.length > 0 &&
        projectCalendar?.data
      ) {
        for (let i = 0; i < tenantCalendar?.length; i++) {
          let associated = false;
          projectCalendar.data?.projectCalendarAssociation.forEach(
            (item: any) => {
              let data = {};
              if (item.calendarId == tenantCalendar[i].id) {
                associated = true;
                data = {
                  calendarName: tenantCalendar[i].calendarName,
                  createdAt: tenantCalendar[i].createdAt,
                  createdBy: tenantCalendar[i].createdBy,
                  description: tenantCalendar[i].description,
                  holidayList: tenantCalendar[i].holidayList,
                  calendarId: tenantCalendar[i].id,
                  isEditable: tenantCalendar[i].isEditable,
                  tenantAssociation: tenantCalendar[i].tenantAssociation,
                  tenantId: tenantCalendar[i].tenantId,
                  updatedAt: tenantCalendar[i].updatedAt,
                  updatedBy: tenantCalendar[i].updatedBy,
                  workingDays: tenantCalendar[i].workingDays,
                  workingHours: tenantCalendar[i].workingHours,
                  externalCalendar: tenantCalendar[i].externalCalendar,
                  __typename: tenantCalendar[i].__typename,
                  isProjectAssociated: true,
                  isDefault: item.isDefault,
                  defaultIndex: i,
                  id: item.id,
                };

                tempCalendar[i] = data;
              }
            }
          );

          if (!associated) {
            let data = {};
            data = {
              calendarName: tenantCalendar[i].calendarName,
              createdAt: tenantCalendar[i].createdAt,
              createdBy: tenantCalendar[i].createdBy,
              description: tenantCalendar[i].description,
              holidayList: tenantCalendar[i].holidayList,
              calendarId: tenantCalendar[i].id,
              isEditable: tenantCalendar[i].isEditable,
              tenantAssociation: tenantCalendar[i].tenantAssociation,
              tenantId: tenantCalendar[i].tenantId,
              updatedAt: tenantCalendar[i].updatedAt,
              updatedBy: tenantCalendar[i].updatedBy,
              workingDays: tenantCalendar[i].workingDays,
              workingHours: tenantCalendar[i].workingHours,
              externalCalendar: tenantCalendar[i].externalCalendar,
              __typename: tenantCalendar[i].__typename,
              defaultIndex: i,
            };
            tempCalendar[i] = data;
          }
        }
      }

      const tempCurrentCalendar = tempCalendar.filter(
        (item: any) => item.isProjectAssociated == true
      );
      setDefaultIndex(tempCurrentCalendar[0].defaultIndex);

      // tempCurrentCalendar[0].calendarName = tempCurrentCalendar[0].calendarName;

      setCurrentCalendar(tempCurrentCalendar);
      setCalendarTemplate(tempCalendar);
    }
  }, [tenantCalendar, projectCalendar]);

  const handleChange = (item: any) => {
    let deletingCalendar: any = [];
    deletingCalendar = calendarTemplate.filter(
      (item: any) => item.isProjectAssociated == true
    );
    if (item.calendarId == deletingCalendar[0].calendarId) {
      return;
    }
    const dataDefault: any = [];
    dataDefault.push(item);
    setCurrentCalendar(dataDefault);

    if (deletingCalendar.length > 0) {
      deleteAssociateCalendar(
        deletingCalendar[0].id,
        Number(pathMatch.params.projectId)
      );
      setProjectAssociated(item.calendarId, Number(pathMatch.params.projectId));
      updateProjectTask(item.calendarId, Number(pathMatch.params.projectId));
      updateProjectScheduleMetadata(Number(pathMatch.params.projectId));
    }
  };

  const getProjectCalendar = async (projectId: any = '') => {
    if (
      projectDetailsState.projectPermission.canViewProjectCalendarAssociation
    ) {
      try {
        globalContext.dispatch(setIsLoading(true));
        const res: any = await client.query({
          query: GET_PROJECT_ASSOCIATED_CALENDAR,
          fetchPolicy: 'network-only',
          variables: { projectId: `${projectId}` },
          context: {
            role: ProjectSetupRoles.viewProjectCalendarAssociation,
            token: projectDetailsState.projectToken,
          },
        });
        globalContext.dispatch(setIsLoading(false));

        setProjectCalendar(res);
      } catch (error) {
        globalContext.dispatch(setIsLoading(false));
      }
    }
  };

  const getTenantCalendar = async (searchText: any = '') => {
    if (
      projectDetailsState.projectPermission.canViewProjectCalendarAssociation
    ) {
      try {
        globalContext.dispatch(setIsLoading(true));
        const res = await client.query({
          query: GET_CALENDAR,
          fetchPolicy: 'network-only',
          variables: { calendarName: `%${searchText}%` || null },
          context: {
            role: ProjectSetupRoles.viewProjectCalendarAssociation,
            token: projectDetailsState.projectToken,
          },
        });
        globalContext.dispatch(setIsLoading(false));
        setTenantCalendar(res.data.calendars);
      } catch (error) {
        globalContext.dispatch(setIsLoading(false));
      }
    }
  };

  const setProjectAssociated = async (calendarId: any, projectId: any) => {
    try {
      globalContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: SET_PROJECT_ASSOCIATED,
        variables: {
          calendarId: `${+calendarId}`,
          projectId: `${+projectId}`,
          isDefault: true,
        },
        context: {
          role: ProjectSetupRoles.createProjectCalendarAssociation,
          token: projectDetailsState.projectToken,
        },
      });
      globalContext.dispatch(setIsLoading(false));
      getProjectCalendar(projectId);
      getTenantCalendar();
      Notification.sendNotification(
        'Calendar Associated successfully',
        AlertTypes.success
      );
    } catch (error) {
      globalContext.dispatch(setIsLoading(false));
    }
  };

  const deleteAssociateCalendar = async (id: any, projectId: any) => {
    try {
      globalContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: DELETE_ASSOCIATE_CALENDAR,
        variables: { id: id },
        context: {
          role: ProjectSetupRoles.createProjectCalendarAssociation,
          token: projectDetailsState.projectToken,
        },
      });
      globalContext.dispatch(setIsLoading(false));
      getProjectCalendar(projectId);
      getTenantCalendar();
    } catch (error) {
      globalContext.dispatch(setIsLoading(false));
    }
  };

  const updateProjectScheduleMetadata = async (projectId: any) => {
    try {
      globalContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: UPDATE_PROJECT_SCHEDULE_METADATA,
        variables: { projectId: projectId },
        context: {
          role: ProjectSetupRoles.createProjectCalendarAssociation,
          token: projectDetailsState.projectToken,
        },
      });
      globalContext.dispatch(setIsLoading(false));
    } catch (error) {
      globalContext.dispatch(setIsLoading(false));
    }
  };

  const updateProjectTask = async (calendarId: any, projectId: any) => {
    try {
      globalContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: UPDATE_PROJECT_TASK,
        variables: { calendarId: calendarId, projectId: projectId },
        context: {
          role: ProjectSetupRoles.createProjectCalendarAssociation,
          token: projectDetailsState.projectToken,
        },
      });
      globalContext.dispatch(setIsLoading(false));
    } catch (error) {
      globalContext.dispatch(setIsLoading(false));
    }
  };

  const getProjectImportType = async (projectId: any) => {
    try {
      const res = await client.query({
        query: GET_PROJECT_IMPORT_TYPE,
        variables: { projectId: projectId },
        context: {
          role: ProjectSetupRoles.createProjectCalendarAssociation,
          token: projectDetailsState.projectToken,
        },
      });
      setProjectImportType(res.data.projectScheduleMetadata[0].importType);
    } catch (error) {
      console.log('error: ', error);
    }
  };

  const getWorkingDays = (dates: any) => {
    const workingDays: any = { dates: [] };
    Object.keys(dates).forEach((day: any, index: any) => {
      switch (index) {
        case 0: {
          if (dates[day]) {
            workingDays.dates.push('Sun');
            workingDays.hours = dates[day][1] - dates[day][0];
            if (dates[day].length > 2) {
              workingDays.hours += dates[day][3] - dates[day][2];
            }
          }
          return;
        }
        case 1: {
          if (dates[day]) {
            workingDays.dates.push('Mon');
            workingDays.hours = dates[day][1] - dates[day][0];
            if (dates[day].length > 2) {
              workingDays.hours += dates[day][3] - dates[day][2];
            }
          }
          return;
        }
        case 2: {
          if (dates[day]) {
            workingDays.dates.push('Tue');
            workingDays.hours = dates[day][1] - dates[day][0];
            if (dates[day].length > 2) {
              workingDays.hours += dates[day][3] - dates[day][2];
            }
          }
          return;
        }
        case 3: {
          if (dates[day]) {
            workingDays.dates.push('Wed');
            workingDays.hours = dates[day][1] - dates[day][0];
            if (dates[day].length > 2) {
              workingDays.hours += dates[day][3] - dates[day][2];
            }
          }
          return;
        }
        case 4: {
          if (dates[day]) {
            workingDays.dates.push('Thu');
            workingDays.hours = dates[day][1] - dates[day][0];
            if (dates[day].length > 2) {
              workingDays.hours += dates[day][3] - dates[day][2];
            }
          }
          return;
        }
        case 5: {
          if (dates[day]) {
            workingDays.dates.push('Fri');
            workingDays.hours = dates[day][1] - dates[day][0];
            if (dates[day].length > 2) {
              workingDays.hours += dates[day][3] - dates[day][2];
            }
          }
          return;
        }
        case 6: {
          if (dates[day]) {
            workingDays.dates.push('Sat');
            workingDays.hours = dates[day][1] - dates[day][0];
            if (dates[day].length > 2) {
              workingDays.hours += dates[day][3] - dates[day][2];
            }
          }
          return;
        }
        default: {
          return;
        }
      }
    });
    return workingDays;
  };
  return (
    <div className="calendar-association">
      <ProjectSettingsHeader header={header} />
      {projectDetailsState.projectPermission
        ?.canViewProjectCalendarAssociation ? (
        <>
          <div className="calendar-association__top">
            <InputLabel id="label" className="calendar-association__top__label">
              Select a template for your team
            </InputLabel>
            <FormControl variant="outlined" fullWidth>
              {/* {
                  currentCalendar.map((item: any, index: number)=>( */}
              <Select
                name="calendarTemplate"
                className="calendar-association__top__dropdown calendarAssociationdropdown"
                id="demo-simple-select-outlined"
                value={defaultIndex}
                disabled={
                  !projectDetailsState.projectPermission
                    ?.canCreateProjectCalendarAssociation ||
                  (projectImportType == 'MSP' || projectImportType == 'P6'
                    ? true
                    : false)
                }
                MenuProps={{
                  classes: { paper: classes.root },
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                  getContentAnchorEl: null,
                }}
              >
                {calendarTemplate &&
                  calendarTemplate.map((item: any, index: any) => (
                    <MenuItem
                      className={`${
                        item.isProjectAssociated
                          ? 'iscalendar-association__top__checkIcon'
                          : ''
                      }`}
                      value={index}
                      onClick={() => handleChange(item)}
                    >
                      {item.calendarName}
                    </MenuItem>
                  ))}
              </Select>
              {/* ))*/}
            </FormControl>
          </div>

          <div className="calendar-association__middleLabel">
            <InputLabel
              id="label"
              className="calendar-association__middleLabel__label"
            >
              Selected Calendar
            </InputLabel>
          </div>
          <div className="calendar-association__calendar__card__container">
            {currentCalendar.map((calendar: any, index: any) => (
              <div
                className="calendar-association__middle"
                key={calendar.calendarId}
              >
                <div className="calendar-association__middle__header"></div>
                <div className="calendar-association__middle__description">
                  <div className="calendar-association__middle__description__templateName">
                    {' '}
                    {calendar?.calendarName}
                  </div>
                  <div className="calendar-association__middle__description__days">
                    {' '}
                    {(projectImportType != 'MSP' &&
                      projectImportType != 'P6') ||
                    calendar.isDefault
                      ? calendar?.workingDays
                          .map((x: any) => x.substring(0, 3))
                          .join(', ')
                      : ''}
                    {(projectImportType == 'MSP' ||
                      projectImportType == 'P6') &&
                    !calendar.isDefault
                      ? getWorkingDays(
                          calendar?.externalCalendar?.dates
                        ).dates.join(', ')
                      : ''}
                  </div>
                  <div className="calendar-association__middle__description__workingHours">
                    {(projectImportType != 'MSP' &&
                      projectImportType != 'P6') ||
                    calendar.isDefault
                      ? calendar?.workingDays.length
                      : getWorkingDays(calendar?.externalCalendar?.dates).dates
                          .length}{' '}
                    Days,{' '}
                    {(projectImportType != 'MSP' &&
                      projectImportType != 'P6') ||
                    calendar.isDefault
                      ? calendar?.workingHours
                      : getWorkingDays(calendar?.externalCalendar?.dates)
                          .hours}{' '}
                    Hours
                  </div>
                </div>
                {currentCalendar &&
                  calendar?.holidayList &&
                  calendar?.holidayList.map(
                    (item: any, index: any) =>
                      new Date(item.date).getFullYear() ==
                        new Date().getFullYear() && (
                        <Tooltip
                          title={item.holidayName}
                          style={{ display: 'flex' }}
                          aria-label="caption"
                        >
                          <div className="calendar-association__middle__holidays">
                            <div className="calendar-association__middle__holidays__day">
                              {item.holidayName.length > 15
                                ? item.holidayName.slice(0, 15) + '. . .'
                                : item.holidayName}
                            </div>
                            <div className="calendar-association__middle__holidays__date">
                              {new Date(item.date).toDateString().slice(4)}
                            </div>
                          </div>
                        </Tooltip>
                      )
                  )}
              </div>
            ))}
          </div>
          <div className="calendar-association__bottom__warningMessageContainer">
            <div style={{ display: 'flex' }}>
              <img
                className="img-responsive calendar-association__bottom__warningMessageContainer__warningIcon"
                src={WarningIcon}
                alt="success"
              />
              <p className="calendar-association__bottom__warningMessageContainer__warningMessage">
                This calendar association will only apply to <b>due date</b>{' '}
                calculation in dynamic scheduler.
              </p>
            </div>
          </div>
        </>
      ) : !globalContext.state.isLoading ? (
        <div className="noCreatePermission">
          <div className="no-permission">
            <NoDataMessage message={noPermissionMessage} />
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  );
}
