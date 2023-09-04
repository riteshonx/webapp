import {
  Button,
  FormControl,
  IconButton,
  makeStyles,
  Select,
  Tooltip,
} from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import { gantt } from 'dhtmlx-gantt';
import React, {
  Fragment,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useHistory } from 'react-router-dom';
import AutoScheduleImg from '../../../../../../assets/images/auto-schedule.svg';
import CollapseImage from '../../../../../../assets/images/collapse_svg.svg';
import ExpandImage from '../../../../../../assets/images/expand_svg.svg';
import XerImage from '../../../../../../assets/images/xer_image.svg';
import XmlImage from '../../../../../../assets/images/xml-file.svg';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import ProjectPlanContext from '../../../../context/projectPlan/projectPlanContext';
import {
  weekScaleTemplate,
  weekScaleTemplateWithoutMonth,
} from '../../../../utils/ganttConfig';
import LookAheadPlan from '../../../LookAheadPlan/LookAheadPlan';
import CriticalPath from '../CriticalPath/CriticalPath';
import FileImport from '../FileImport/FileImport';
import PullPlanActions from '../PullPlanActions/PullPlanActions';
import ViewScheduleUpdate from '../ViewScheduleUpdate/ViewScheduleUpdate';
import './ProjectPlanHeader.scss';

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 120,
    height: 20,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  menuPaper: {
    maxHeight: 100,
  },
}));
function ProjectPlanHeader(props: any): ReactElement {
  const classes = useStyles();
  const {
    projectMetaData,
    editProjectPlan,
    lookAheadStatus,
    setLookAheadView,
    openImport,
    setOpenImport,
    acceptChanges,
    partialUpdateTasks,
    discardChanges,
    canImport,
    getProjectPlanAllTaskAndParse,
    setAutoScheduleWaitPopup,
    autoSchedule,
    projectScheduleMetadata,
    recjectedChanges,
    SaveOpenTaskView,
    setOpenBaselinePopup,
    setViewVersion,
    currentGanttView,
    viewScheduleUpdate,
    setViewScheduleUpdate,
    onVersionChange,
    setSelectedVersion,
    selectedVersion,
    setScale,
    scale,
    expandAll,
    collapseAll,
    setCurrentGanttView,
    showSheduleTask,
    expandAllButtonFlag,
  } = props;

  const projectPlanContext = useContext(ProjectPlanContext);

  const {
    currentView,
    currentScale,
    setCurrentView,
    setLookAheadStatus,
    setCurrentScale,
    getVersions,
    currentVersionList,
    getProjectPlan,
  } = projectPlanContext;

  const { state: authState, dispatch }: any = useContext(stateContext);
  const [importAnchorEl, setImportAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [exportAnchorEl, setExportAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [menuAnchorEl, setMenuAnchorE1] =
    React.useState<null | HTMLElement>(null);
  const [editSaveMenuAnchorEl, setEditSaveMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [openImportDialog, setOpenImportDialog] = React.useState(false);
  const [fileType, setFileType] = React.useState('');
  const [fileImage, setFileImage] = React.useState<any | null>(null);
  const [toolTip, setToolTip] = React.useState(false);
  const [exporttoolTip, setExportToolTip] = React.useState(false);
  const [acceptChangesNotification, setAcceptChangesNotification] =
    React.useState(false);
  const [activeLookAheadView, setActiveLookAheadView] = React.useState('');
  const [pullPlanInProgress, setPullPlanInProgress] = React.useState(false);

  const [inactiveBtn, setInactiveBtn] = React.useState(false);
  const [expandCollapseFlag, setExpandCollapseFlag] = useState('expand');
  const [count, setCount] = React.useState<{ [key: string]: number }>({
    total: 0,
    manual: 0,
  });
  const saveProjectPlan = () => {
    setInactiveBtn(true);
    props.saveProjectPlan();
  };

  useEffect(() => {
    return () => setInactiveBtn(false);
  }, [inactiveBtn]);
  const [view, setView] = useState('gantt'); // values default, lookahead, weekly plan

  const menuOpen = Boolean(menuAnchorEl);
  const editSaveMenuOpen = Boolean(editSaveMenuAnchorEl);
  const history = useHistory();

  useEffect(() => {
    if (currentView === 'gantt') {
      setScale('week');
      setView('gantt');
      setCurrentScale('week');
    } else if (currentView === 'lookahead') {
      setScale('default');
      setCurrentScale('default');
      setView('lookahead');
    } else {
      setView('weekly');
      setScale('default');
      setCurrentScale('default');
    }
  }, [currentView]);

  useEffect(() => {
    if (currentView.includes('gantt')) {
      if (scale === 'week') {
        gantt.config.min_column_width = 40;
        gantt.config.scales = [
          {
            unit: 'week',
            step: 1,
            format: weekScaleTemplate,
            css: function (date: Date) {
              return 'gantt_scale_cell_style';
            },
          },
          {
            unit: 'day',
            step: 1,
            date: '%d',
            css: function (date: Date) {
              if (!gantt.isWorkTime(date)) {
                return 'weekend';
              }
              return '';
            },
          },
        ];
      }
      if (scale === 'month') {
        gantt.config.min_column_width = 60;
        gantt.config.scales = [
          {
            unit: 'month',
            step: 1,
            date: '%M - %Y',
            css: function (date: Date) {
              return 'gantt_scale_cell_style';
            },
          },
          { unit: 'week', format: weekScaleTemplateWithoutMonth },
        ];
      }

      if (scale === 'year') {
        gantt.config.min_column_width = 40;
        gantt.config.scales = [
          {
            unit: 'year',
            step: 1,
            date: '%Y',
            css: function (date: Date) {
              return 'gantt_scale_cell_style';
            },
          },
          {
            unit: 'month',
            step: 1,
            date: '%M',
            css: function (date: Date) {
              return 'gantt_secondary_scale';
            },
          },
        ];
      }
    }

    if (currentView.includes('lookahead')) {
      if (scale === 'default') {
        gantt.config.min_column_width = 40;
        gantt.config.scales = [
          {
            unit: 'week',
            step: 1,
            format: weekScaleTemplate,
            css: function (date: Date) {
              return 'gantt_scale_cell_style';
            },
          },
          {
            unit: 'day',
            step: 1,
            date: '%d',
            css: function (date: Date) {
              if (!gantt.isWorkTime(date)) {
                return 'weekend';
              }
              return '';
            },
          },
        ];
      }
    }

    gantt.config.work_time = true;

    gantt.templates.timeline_cell_class = (task: any, date: Date) => {
      if (
        !gantt.isWorkTime({ task: task, date: date }) &&
        (scale == 'week' || scale == 'default')
      ) {
        return 'weekend';
      }
      return '';
    };

    gantt.render();
  }, [scale]);

  const importHandleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setImportAnchorEl(event.currentTarget);
  };

  const importHandleClose = (event: any) => {
    setImportAnchorEl(null);
  };
  const exportHandleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const exportHandleClose = () => {
    setExportAnchorEl(null);
  };
  const handleExport = (operation: string) => {
    setExportAnchorEl(null);
    props.exportOperation(operation);
  };
  const handleImport = (fileType: string) => {
    setFileType(fileType);
    switch (fileType) {
      case 'MSP':
      case 'P6':
        setFileImage(XmlImage);
        break;
      case 'xer':
        setFileImage(XerImage);
        break;
      default:
        console.log('Invalid file');
    }
    setImportAnchorEl(null);
    setOpenImportDialog(true);
  };

  const handleClose = (files: any) => {
    setOpenImportDialog(false);
    setOpenImport(false);
    props.importOperation(files[0], fileType);
  };

  const handleDiscard = () => {
    setOpenImportDialog(false);
    setOpenImport(false);
  };

  const handleToopTip = (bool: boolean) => {
    setToolTip(bool);
  };

  const exporthandleToopTip = (bool: boolean) => {
    setExportToolTip(bool);
  };

  const sLookAheadView = (value: string) => {
    setLookAheadView(value);
    setActiveLookAheadView(value);
  };

  const startPullPlan = () => {
    if (currentGanttView == 'baseline') {
      getProjectPlan();
      setCurrentGanttView('gantt');
    }
    setSelectedVersion('current');
    history.push(
      `/scheduling/project-plan/${authState.currentProject.projectId}`
    );
    setPullPlanInProgress(true);
    editProjectPlan();
  };

  const stopPullPlan = () => {
    setPullPlanInProgress(false);
    saveProjectPlan();
  };

  useEffect(() => {
    if (openImport) {
      setOpenImportDialog(true);
    }
  }, [openImport]);

  const hideAcceptChangeNotification = () => {
    setTimeout(() => {
      setAcceptChangesNotification(false);
    }, 10000);
  };

  // const onScaleChange = (e: any) => {
  //   setScale(e.target.value);
  //   setCurrentScale(e.target.value);
  // };
  const handleZoomIn = (e: any) => {
    e.preventDefault();
    if (currentView === 'gantt' && scale === 'year') {
      setScale('month');
      // setCurrentScale('month');
    } else if (currentView === 'gantt' && scale === 'month') {
      setScale('week');
      setCurrentScale('week');
    } else if (currentView === 'lookahead' && scale === 'default') {
      setScale('week');
      setCurrentScale('week');
    }
  };
  const handleZoomOut = (e: any) => {
    e.preventDefault();
    if (currentView === 'gantt' && scale === 'week') {
      setScale('month');
      // setCurrentScale('month');
    } else if (currentView === 'gantt' && scale === 'month') {
      setScale('year');
      // setCurrentScale('year');
    } else if (currentView === 'lookahead' && scale === 'week') {
      setScale('default');
      setCurrentScale('default');
    }
  };

  const onViewChange = (e: any) => {
    setCurrentView(e.target.value);
    if (e.target.value.includes('lookahead')) {
      setLookAheadStatus(true);
    } else {
      setLookAheadStatus(false);
    }

    setView(e.target.value);
  };

  const onMenuItemClick = (event: any) => {
    setMenuAnchorE1(event.currentTarget);
  };

  const onEditSaveMenuItemClick = (event: any) => {
    setEditSaveMenuAnchorEl(event.currentTarget);
  };
  const onEditSaveMenuItemClose = () => {
    setEditSaveMenuAnchorEl(null);
  };

  const onMenuItemClose = (e: any) => {
    setMenuAnchorE1(null);
  };

  const exportData = (exportType: string) => {
    handleExport(exportType);
    setMenuAnchorE1(null);
  };

  const importData = (fileType: string) => {
    handleImport(fileType);
    setMenuAnchorE1(null);
  };

  const onDiscardVersionClick = () => {
    discardChanges();
    onEditSaveMenuItemClose();
  };

  const onSaveVersionClick = () => {
    onEditSaveMenuItemClose();

    setOpenBaselinePopup(true);
  };

  const today = () => {
    gantt.showDate(new Date());
  };

  // const onVersionChange = (e: any) => {
  //   console.log('e: ', e.target.value);
  // };

  return (
    <Fragment>
      {acceptChangesNotification && (
        <div className="accept-changes-notification">
          <span>
            ⚠️ Please accept the task changes to continue to edit mode
          </span>
        </div>
      )}

      {projectScheduleMetadata.status === 'published' && (
        <div className="projectPlanHeader__version">
          <FormControl className={classes.formControl}>
            {/* <Select
            className="projectPlanHeader__version__select"
            data-testid="version-select-dropdown"
            value={selectedVersion}
            onChange={onVersionChange}
          >
            <MenuItem key="current-0" value="current">
              Current Version
            </MenuItem>

            {currentVersionList.map((version: any) => (
              <MenuItem key={version.id} value={version.id}>
                {version.baselineName}
              </MenuItem>
            ))}
          </Select> */}

            <select
              value={selectedVersion}
              onChange={(e: any) => {
                onVersionChange(e);
                setSelectedVersion(e.target.value);
              }}
              name="version"
              onFocus={(e: any) => (e.size = 5)}
              className="projectPlanHeader__version__select"
            >
              <option
                value=""
                key="currentVersion-0"
                className="projectPlanHeader__version__select__option"
              >
                Current Version
              </option>

              {currentVersionList.map((version: any) => (
                <Tooltip title={version.baselineName}>
                  <option
                    key={version.id}
                    value={version.id}
                    className="projectPlanHeader__version__select__option"
                  >
                    {version?.baselineName?.length > 15
                      ? version.baselineName.slice(0, 15) + '...'
                      : version?.baselineName}
                  </option>
                </Tooltip>
              ))}
            </select>
          </FormControl>
        </div>
      )}

      {!projectMetaData.is_Editable &&
        projectScheduleMetadata.status === 'draft' &&
        projectMetaData.message &&
        currentGanttView == 'gantt' && (
          <div className="edited-by-other-user-notification">
            <span>{`⚠️ ${projectMetaData?.message}`}</span>
          </div>
        )}

      <div className="projectPlanHeader">
        <div className="projectPlanHeader__leftAction">
          <FileImport
            open={openImportDialog}
            handleImportClose={(files: any) => handleClose(files)}
            handleDiscard={handleDiscard}
            fileType={fileType == 'MSP' ? ['.xml', '.mpp'] : ['.xml', '.xer']}
            supportedExt={fileType == 'MSP' ? `.xml,.mpp` : `.xml,.xer`}
            fileImage={fileImage}
          />
          {/* {authState.projectFeaturePermissons?.cancreateMasterPlan &&
          projectMetaData.status === 'draft' &&
          projectMetaData.is_Editable &&
          canImport ? (
            <Tooltip
              title={'Import Data'}
              aria-label="Import Data"
              open={toolTip}
            >
              <div
                onMouseEnter={() => handleToopTip(true)}
                onMouseLeave={() => handleToopTip(false)}
                onClick={() => handleToopTip(false)}
              >
                <Button
                  variant="outlined"
                  data-testid={`Import data`}
                  size="small"
                  className="btn-secondary"
                  startIcon={<ImportExportIcon />}
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                  onClick={importHandleClick}
                >
                  {' '}
                  Import Data
                  <img
                    src={ArrowDown}
                    style={{ paddingLeft: '5px' }}
                    alt="arrow-down"
                  />
                </Button>

                <Menu
                  id="simple-menu"
                  anchorEl={importAnchorEl}
                  keepMounted
                  open={Boolean(importAnchorEl)}
                  onClose={importHandleClose}
                  getContentAnchorEl={null}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                  <MenuItem onClick={() => handleImport('xml')}>
                    Microsoft Project
                  </MenuItem>
                  <MenuItem onClick={() => handleImport('xer')}>
                    Primavera P6
                  </MenuItem>
                </Menu>
              </div>
            </Tooltip>
          ) : (
            ''
          )} */}
          {/* <Tooltip
            title={'Export Data'}
            aria-label="Export Data"
            open={exporttoolTip}
          >
            <div
              onMouseEnter={() => exporthandleToopTip(true)}
              onMouseLeave={() => exporthandleToopTip(false)}
              onClick={() => exporthandleToopTip(false)}
            >
              {!lookAheadStatus && !props.weeklyPlanStatus && (
                <Button
                  variant="outlined"
                  data-testid={`export data`}
                  size="small"
                  className="btn-secondary"
                  startIcon={<ImportExportIcon />}
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                  onClick={exportHandleClick}
                >
                  {' '}
                  Export Data
                </Button>
              )}
              <Menu
                id="simple-menu"
                anchorEl={exportAnchorEl}
                keepMounted
                open={Boolean(exportAnchorEl)}
                onClose={exportHandleClose}
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              >
                <MenuItem onClick={() => handleExport('xml')}>
                  Export XML
                </MenuItem>
              </Menu>
            </div>
          </Tooltip> */}

          {!lookAheadStatus && !props.weeklyPlanStatus ? (
            <PullPlanActions
              projectMetaData={projectMetaData}
              lookAheadStatus={lookAheadStatus}
              onStartPullPlan={startPullPlan}
              onStopPullPlan={stopPullPlan}
              partialUpdateTasksCount={partialUpdateTasks.length}
              currentGanttView={currentGanttView}
            />
          ) : (
            ''
          )}

          {expandCollapseFlag == 'expand' && (
            <Tooltip title={'Expand'} aria-label="expand">
              <Button
                variant="outlined"
                data-testid={`expand`}
                size="small"
                className="btn-primary"
                onClick={() => {
                  gantt.ext.inlineEditors.hide();
                  setExpandCollapseFlag('collapse');
                  expandAll();
                }}
                disabled={
                  props.partialUpdateTasksCount > 0 || !expandAllButtonFlag
                }
              >
                <img
                  src={ExpandImage}
                  alt="expand"
                  className="projectPlanHeader__leftAction__expand-image"
                ></img>{' '}
                Expand
              </Button>
            </Tooltip>
          )}

          {expandCollapseFlag == 'collapse' && (
            <Tooltip title={'Collapse'} aria-label="collapse">
              <Button
                variant="outlined"
                data-testid={`collapse`}
                size="small"
                className="btn-primary"
                onClick={() => {
                  gantt.ext.inlineEditors.hide();
                  collapseAll();
                  setExpandCollapseFlag('expand');
                }}
                disabled={
                  props.partialUpdateTasksCount > 0 || !expandAllButtonFlag
                }
              >
                <img
                  src={CollapseImage}
                  alt="collapse"
                  className="projectPlanHeader__leftAction__collapse-image"
                ></img>{' '}
                Collapse
              </Button>
            </Tooltip>
          )}

          {authState.projectFeaturePermissons?.cancreateMasterPlan &&
            projectMetaData.status === 'draft' &&
            currentGanttView == 'gantt' &&
            projectMetaData.is_Editable &&
            projectScheduleMetadata.importType !== 'MSP' &&
            projectScheduleMetadata.importType !== 'P6' && (
              <React.Fragment>
                {/* <Tooltip
                  title={`${count.total}(${count.manual} manual) changes done since last save`}
                  aria-label="X changes done since last save"
                > */}
                <img
                  src={AutoScheduleImg}
                  alt="AutoSchedule"
                  className="projectPlanHeader__leftAction_auto-schedule"
                  onClick={autoSchedule}
                />
                {/* </Tooltip> */}
                {/* <ChangeInfo getCount={(value) => setCount(value)} /> */}
              </React.Fragment>
            )}
          {authState.projectFeaturePermissons?.cancreateMasterPlan &&
            partialUpdateTasks.length > 0 &&
            (projectMetaData.status === 'published' ||
              (!projectMetaData.is_Editable &&
                projectMetaData.status === 'draft')) &&
            currentView == 'gantt' && (
              <>
                <a
                  className={`projectPlanHeader__leftAction__accept-changes ${
                    !projectMetaData.is_Editable &&
                    projectMetaData.status === 'draft'
                      ? 'projectPlanHeader__leftAction__accept-changes-disable'
                      : ''
                  }`}
                  onClick={() => {
                    if (
                      !projectMetaData.is_Editable &&
                      projectMetaData.status === 'draft'
                    ) {
                      return;
                    }
                    setViewScheduleUpdate(!viewScheduleUpdate);
                    SaveOpenTaskView();
                    //getProjectPlanAllTaskAndParse();
                  }}
                >
                  <span>Accept Changes</span>
                  <span className="projectPlanHeader__leftAction__accept-changes-count">
                    {partialUpdateTasks.length}
                  </span>
                </a>
                {viewScheduleUpdate && (
                  <ViewScheduleUpdate
                    acceptChanges={(selectedTaskUpdates: Array<any>) => {
                      setAutoScheduleWaitPopup(true);
                      setTimeout(() => {
                        acceptChanges(selectedTaskUpdates);
                      }, 1000);
                    }}
                    recjectedChanges={(selectedTaskUpdates: Array<any>) => {
                      recjectedChanges(selectedTaskUpdates);
                    }}
                    partialUpdateTasks={partialUpdateTasks}
                    hidePanel={() => setViewScheduleUpdate(false)}
                    showSheduleTask={showSheduleTask}
                  />
                )}
              </>
            )}
        </div>
        <div className="projectPlanHeader__centerAction">
          {!props.weeklyPlanStatus && projectMetaData.status === 'published' ? (
            <LookAheadPlan activeLookAheadView={currentScale} />
          ) : (
            ''
          )}
          {/* {!lookAheadStatus && projectMetaData.status === 'published' ? (
            <Tooltip title={'Weekly plan'} aria-label="Weekly plan">
              <Button
                variant="outlined"
                data-testid={`WeekPlan`}
                className={`${
                  props.weeklyPlanStatus ? 'activeview' : ''
                } btn-secondary`}
                size="small"
                onClick={props.setWeeklyPlan}
              >
                {' '}
                WeeklyPlan
              </Button>
            </Tooltip>
          ) : (
            ''
          )} */}

          <Button
            variant="outlined"
            data-testid="today"
            className="projectPlanHeader__centerAction__today btn-secondary"
            size="small"
            onClick={today}
          >
            Today
          </Button>
        </div>
        <div className="projectPlanHeader__rightAction">
          <div className="projectPlanHeader__rightAction__viewScale">
            {projectMetaData.status === 'published' && (
              <div className="projectPlanHeader__rightAction__viewScale-view">
                <label className="projectPlanHeader__rightAction__viewScale-view-label">
                  Views
                </label>
                <Select
                  className="projectPlanHeader__rightAction__viewScale-view-select"
                  data-testid="views-select-dropdown"
                  variant="outlined"
                  value={view}
                  onChange={onViewChange}
                >
                  <MenuItem key="default-view" value="gantt">
                    Default
                  </MenuItem>
                  <MenuItem key="lookahead-view" value="lookahead">
                    Lookahead
                  </MenuItem>
                  <MenuItem key="weekly-plan-view" value="weekly">
                    Weekly Plan
                  </MenuItem>
                </Select>
              </div>
            )}
            {/* <div className="projectPlanHeader__rightAction__viewScale-scale">
              <label className="projectPlanHeader__rightAction__viewScale-scale-label">
                Scale
              </label>
              <Select
                className="projectPlanHeader__rightAction__viewScale-scale-select"
                data-testid="scale-select-dropdown"
                variant="outlined"
                value={scale}
                onChange={onScaleChange}
              >
                {(currentView === 'lookahead' || currentView === 'weekly') && (
                  <MenuItem key="scale-default" value="default">
                    Default
                  </MenuItem>
                )}

                {(currentView === 'gantt' || currentView === 'lookahead') && (
                  <MenuItem key="scale-week" value="week">
                    Weekly
                  </MenuItem>
                )}

                {currentView === 'gantt' && (
                  <MenuItem key="scale-month" value="month">
                    Monthly
                  </MenuItem>
                )}

                {currentView === 'gantt' && (
                  <MenuItem key="scale-year" value="year">
                    Yearly
                  </MenuItem>
                )}
              </Select>
            </div> */}

            {/* {!props.weeklyPlanStatus && (
              <GanttView
                lookAheadStatus={lookAheadStatus}
                setLookAheadView={sLookAheadView}
              />
            )} */}
          </div>
          <div className="projectPlanHeader__rightAction__zoomaction">
            {currentView === 'gantt' || currentView === 'lookahead' ? (
              <>
                <Tooltip title="Click to view a smaller timeline">
                  <IconButton
                    onClick={handleZoomIn}
                    disabled={scale === 'week'}
                  >
                    <ZoomInIcon className="projectPlanHeader__rightAction__zoomaction-zoom" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Click to view a larger timeline">
                  <IconButton
                    onClick={handleZoomOut}
                    disabled={scale === 'year' || currentScale === 'default'}
                  >
                    <ZoomOutIcon className="projectPlanHeader__rightAction__zoomaction-zoom" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              ''
            )}
          </div>
          {authState.projectFeaturePermissons?.cancreateMasterPlan &&
          currentView.includes('gantt') &&
          !lookAheadStatus &&
          !props.weeklyPlanStatus ? (
            <CriticalPath
              cpCalculation={props.cpCalculation}
              setCpCalculation={props.setCpCalculation}
            />
          ) : (
            ''
          )}
          {/* {authState.projectFeaturePermissons?.cancreateMasterPlan &&
            !lookAheadStatus &&
            !props.weeklyPlanStatus &&
            projectMetaData.status === 'draft' &&
            projectMetaData.is_Editable &&
            !pullPlanInProgress && (
              <Tooltip title={'Discard'} aria-label="discard">
                <Button
                  variant="outlined"
                  data-testid="discard-plan"
                  onClick={discardChanges}
                  className="btn-secondary projectPlanHeader__rightAction-discard"
                  size="small"
                >
                  {' '}
                  Discard
                </Button>
              </Tooltip>
            )} */}

          {authState.projectFeaturePermissons?.cancreateMasterPlan &&
          !lookAheadStatus &&
          !props.weeklyPlanStatus &&
          projectMetaData.status === 'draft' &&
          projectMetaData.is_Editable &&
          currentGanttView == 'gantt' &&
          !pullPlanInProgress ? (
            <div className="projectPlanHeader__rightAction__save">
              <Tooltip title={'Save Plan'} aria-label="Save Plan">
                <Button
                  variant="outlined"
                  data-testid={`save plan`}
                  onClick={() => saveProjectPlan()}
                  className="btn-primary projectPlanHeader__rightAction__save-button"
                  size="small"
                >
                  Save Plan
                </Button>
              </Tooltip>
              <Button
                aria-label="more"
                aria-controls="edit-save-mode"
                aria-haspopup="true"
                onClick={onEditSaveMenuItemClick}
                className=" btn-primary projectPlanHeader__rightAction__save__down-arrow"
                size="small"
                disabled={inactiveBtn}
              >
                <ArrowDropDownIcon className="" />
              </Button>
              <Menu
                id="edit-save-mode"
                anchorEl={editSaveMenuAnchorEl}
                open={editSaveMenuOpen}
                onClose={onEditSaveMenuItemClose}
              >
                <MenuItem
                  key="edit-menu-item-save-version"
                  onClick={onSaveVersionClick}
                >
                  Save version
                </MenuItem>
                <MenuItem
                  key="edit-menu-item-discard-version"
                  onClick={onDiscardVersionClick}
                >
                  Discard changes
                </MenuItem>
              </Menu>
            </div>
          ) : authState.projectFeaturePermissons?.cancreateMasterPlan &&
            !lookAheadStatus &&
            currentView.includes('gantt') &&
            !props.weeklyPlanStatus &&
            currentGanttView == 'gantt' &&
            !pullPlanInProgress ? (
            <Tooltip title={'Edit Plan'} aria-label="Edit Plan">
              <Button
                variant="outlined"
                data-testid="edit-plan"
                onClick={() => {
                  if (partialUpdateTasks.length > 0) {
                    setAcceptChangesNotification(true);
                    hideAcceptChangeNotification();
                    return;
                  }
                  editProjectPlan();
                }}
                className="btn-primary"
                size="small"
                disabled={
                  !projectMetaData?.is_Editable &&
                  projectMetaData.status === 'draft'
                }
              >
                Edit Plan
              </Button>
            </Tooltip>
          ) : (
            ''
          )}

          {currentView == 'gantt' && (
            <div className="projectPlanHeader__rightAction__menu">
              <IconButton
                data-testid="three-dot-button"
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={onMenuItemClick}
                className="projectPlanHeader__rightAction__menu_icon"
              >
                <MoreVertIcon className="projectPlanHeader__rightAction__menu_icon-morevert" />
              </IconButton>
              <Menu
                id="long-menu"
                anchorEl={menuAnchorEl}
                open={menuOpen}
                onClose={onMenuItemClose}
              >
                <MenuItem
                  data-testid="view-version-option"
                  key="menu-item-view-version"
                  onClick={() => {
                    setViewVersion(true);
                    setMenuAnchorE1(null);
                    getVersions();
                  }}
                >
                  View versions
                </MenuItem>

                <MenuItem
                  data-testid="export-plan-option"
                  key="menu-item-export-data-msp"
                  onClick={() => exportData('msp')}
                >
                  Export MSP
                </MenuItem>
                <MenuItem
                  data-testid="export-plan-option"
                  key="menu-item-export-data-p6"
                  onClick={() => exportData('p6')}
                >
                  Export P6
                </MenuItem>
                {authState.projectFeaturePermissons?.cancreateMasterPlan &&
                  projectMetaData.status === 'draft' &&
                  projectMetaData.is_Editable &&
                  currentGanttView == 'gantt' && (
                    // canImport &&
                    <MenuItem
                      data-testid="import-msp-plan-option"
                      key="menu-item-import-msp-data"
                      onClick={() => {
                        importData('MSP');
                      }}
                    >
                      Import MSP
                    </MenuItem>
                  )}
                {authState.projectFeaturePermissons?.cancreateMasterPlan &&
                  projectMetaData.status === 'draft' &&
                  projectMetaData.is_Editable &&
                  currentGanttView == 'gantt' && (
                    // canImport &&
                    <MenuItem
                      data-testid="import-p6-plan-option"
                      key="menu-item-import-p6-data"
                      onClick={() => {
                        importData('P6');
                      }}
                    >
                      Import P6
                    </MenuItem>
                  )}
                {/* <MenuItem key="menu-item-reports" onClick={onMenuItemClose}>
                  Reports
                </MenuItem> */}
              </Menu>
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
}

export default ProjectPlanHeader;
