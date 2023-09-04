import { Button, Tooltip} from '@material-ui/core';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { gantt } from 'dhtmlx-gantt';
import React, { useContext, useEffect, useState } from 'react';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import './FloatingButton.scss';
import AddIcon from '@material-ui/icons/Add';

const FloatingButton = (props: any) => {
  const { projectMetaData } = props;
  const { state: authState, dispatch }: any = useContext(stateContext);

  useEffect(() => {
    let typeInfo: any = null;
    if (gantt.getSelectedId()) {
      typeInfo = gantt.getTask(gantt.getSelectedId());
    }

    switch (typeInfo?.type) {
      case 'project_phase': {
        const dataPhase: any = [
          { name: 'project_phase', label: 'Phase',  Disbaled: false },
          { name: 'wbs', label: 'Work Breakdown Structure',  Disbaled: false },
          { name: 'work_package', label: 'Work Package',  Disbaled: false },
          { name: 'task', label: 'Task',  Disbaled: false },
          { name: 'milestone', label: 'Milestone', Disbaled: true },
        ];
        setDefaultTypeDetails(dataPhase);
        return;
      }

      case 'project': {
        const dataProject: any = [
          { name: 'project_phase', label: 'Phase',  Disbaled: false },
          { name: 'wbs', label: 'Work Breakdown Structure',  Disbaled: false },
          { name: 'work_package', label: 'Work Package',  Disbaled: false },
          { name: 'task', label: 'Task',  Disbaled: false },
          { name: 'milestone', label: 'Milestone', Disbaled: false },
        ];
        setDefaultTypeDetails(dataProject);
        return;
      }

      case 'wbs': {
        const datawbs: any = [
          { name: 'wbs', label: 'Work Breakdown Structure', Disbaled: false },
          { name: 'work_package', label: 'Work Package', Disbaled: false },
          { name: 'task', label: 'Task', Disbaled: false },
        ];
        setDefaultTypeDetails(datawbs);
        return;
      }

      case 'work_package': {
        const datawp: any = [
          { name: 'work_package', label: 'Work Package', Disbaled: false },
          { name: 'task', label: 'Task', Disbaled: false },
        ];
        setDefaultTypeDetails(datawp);
        return;
      }

      case 'task': {
        const dataTask: any = [
          { name: 'task', label: 'Task', Disbaled: false },
        ];
        setDefaultTypeDetails(dataTask);
        return;
      }

      default: {
        const dataDefault: any = [
          { name: 'project_phase', label: 'Phase',  Disbaled: false },
          { name: 'wbs', label: 'Work Breakdown Structure',  Disbaled: false },
          { name: 'work_package', label: 'Work Package',  Disbaled: false },
          { name: 'task', label: 'Task',  Disbaled: false },
          { name: 'milestone', label: 'Milestone',  Disbaled: false },
        ];
        setDefaultTypeDetails(dataDefault);
      }
    }

    const data: any = [
      { name: 'project_phase', label: 'Phase',  Disbaled: false },
      { name: 'wbs', label: 'Work Breakdown Structure',  Disbaled: false },
      { name: 'work_package', label: 'Work Package',  Disbaled: false },
      { name: 'task', label: 'Task',  Disbaled: false },
      { name: 'milestone', label: 'Milestone', Disbaled: true },
    ];

    if(typeInfo?.text != 'Milestone' && typeInfo != null) {
      setDefaultTypeDetails(data);
    }
    //};
  }, [gantt.getSelectedId()]);

  useEffect(() => {

    switch (props.typeSelected) {
      case 'project_phase': {
        const dataPhase: any = [
          { name: 'project_phase', label: 'Phase',  Disbaled: false },
          { name: 'wbs', label: 'Work Breakdown Structure',  Disbaled: false },
          { name: 'work_package', label: 'Work Package',  Disbaled: false },
          { name: 'task', label: 'Task',  Disbaled: false },
          { name: 'milestone', label: 'Milestone', Disbaled: true },
        ];
        setDefaultTypeDetails(dataPhase);
        return;
      }

      case 'project': {
        const dataProject: any = [
          { name: 'project_phase', label: 'Phase',  Disbaled: false },
          { name: 'wbs', label: 'Work Breakdown Structure',  Disbaled: false },
          { name: 'work_package', label: 'Work Package',  Disbaled: false },
          { name: 'task', label: 'Task',  Disbaled: false },
          { name: 'milestone', label: 'Milestone', Disbaled: false },
        ];
        setDefaultTypeDetails(dataProject);
        return;
      }

      case 'wbs': {
        const datawbs: any = [
          { name: 'wbs', label: 'Work Breakdown Structure', Disbaled: false },
          { name: 'work_package', label: 'Work Package', Disbaled: false },
          { name: 'task', label: 'Task', Disbaled: false },
        ];
        setDefaultTypeDetails(datawbs);
        return;
      }

      case 'work_package': {
        const datawp: any = [
          { name: 'work_package', label: 'Work Package', Disbaled: false },
          { name: 'task', label: 'Task', Disbaled: false },
        ];
        setDefaultTypeDetails(datawp);
        return;
      }

      case 'task': {
        const dataTask: any = [
          { name: 'task', label: 'Task', Disbaled: false },
        ];
        setDefaultTypeDetails(dataTask);
        return;
      }

      default: {
        const dataDefault: any = [
          { name: 'project_phase', label: 'Phase',  Disbaled: false },
          { name: 'wbs', label: 'Work Breakdown Structure',  Disbaled: false },
          { name: 'work_package', label: 'Work Package',  Disbaled: false },
          { name: 'task', label: 'Task',  Disbaled: false },
          { name: 'milestone', label: 'Milestone',  Disbaled: false },
        ];
        setDefaultTypeDetails(dataDefault);
      }
    }

  }, [props.typeSelected]);

  const defaultType: any[] = [
    {
      label: 'Phase',
      name: 'project_phase',
      Disbaled: false,
    },
    {
      label: 'Milestone',
      name: 'milestone',
      Disbaled: false,
    },
    {
      label: 'Work Breakdown Structure',
      name: 'wbs',
      Disbaled: false,
    },
    {
      label: 'Work Package',
      name: 'work_package',
      Disbaled: false,
    },
    {
      label: 'Task',
      name: 'task',
      Disbaled: false,
    },
  ];

  const [DefaultTypeDetails, setDefaultTypeDetails] = useState(defaultType);
  //const [parentId, setParentId] = useState<number | string>('');

  const [anchorE2, setAnchorE2] =
    React.useState<HTMLButtonElement | null>(null);
  
  const floatBtnAddTask = (item: any, check?: any) => {
    handleCloseFloatBtn();
    const selectedParentId = gantt.getSelectedId();
    const typeInfo = selectedParentId != null ? gantt.getTask(gantt.getSelectedId()) : null;

    for (let i = 0; i < DefaultTypeDetails.length; i++) {
      if (item == DefaultTypeDetails[i].label) {
        const taskId = gantt.createTask(
          {
            text:
              'New' +
              ' ' +
              (item == 'Phase' ? 'Project Phase' : DefaultTypeDetails[i].label),
            //    start_date: new Date(),
            //     duration: item == "Task" || item == "Work Package" ? 1 : '',
            isFloated: true,
            //  end_date: item == "Phase" || item == "Work Breakdown Structure" ? new Date(new Date().setDate(new Date().getDate() + 1)) : '',
            // parent: gantt.getSelectedId() &&  item != "MileStone"  ? gantt.getSelectedId() : gantt?.getTaskByIndex(0)?.id,
            type: DefaultTypeDetails[i].name,
          },
          selectedParentId && item != 'Milestone' && typeInfo?.type != 'milestone'
            ? selectedParentId
            : gantt?.getTaskByIndex(0)?.id
        );
      }
    }
  };

  const handleCloseFloatBtn = () => {
    setAnchorE2(null);
  };

  const handleClickFloatBtn = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorE2(event.currentTarget);
  };

  const openFloatBtn = Boolean(anchorE2);
  const idFloatBtn = openFloatBtn ? 'simple-popover' : undefined;
  return (
    <div className={`${props.isMilestone ? 'floating_btn__columnName__disabledColumn' : ''}`}>
       {authState.projectFeaturePermissons?.cancreateMasterPlan &&
        projectMetaData.status === 'draft' &&
        projectMetaData.is_Editable ? (
          <Tooltip title={'Add activities'} aria-label="Add activities">
            <div className="floating_btn">
              <Button onClick={handleClickFloatBtn} data-testid="floating-btn">
                <AddIcon style={{
                  color: 'white',
                  position: 'absolute',
                  right: '26px',
                  top: '3px',
                  fontSize: '30px',
                }}/>
              </Button>
            </div>
          </Tooltip>
        ) : (
            ''
        )}

    { false ? (
      ''
    ) : (
      <Popover
        id={idFloatBtn}
        open={openFloatBtn}
        anchorEl={anchorE2}
        className="floating_btn__columnName"
        onClose={handleCloseFloatBtn}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <div>
          {DefaultTypeDetails &&
            DefaultTypeDetails.map((item: any) => (
              <Typography
                key={item.label}
                className={`floating_btn__columnName__typography ${item.Disbaled ? 'floating_btn__columnName__disabledColumn' : ''}`}
                onClick={() => floatBtnAddTask(item.label)}
              >
                {item.label}{' '}
              </Typography>
            ))}
        </div>
        </Popover>
      )}

      {false ? (
        ''
      ) : (
        <Popover
          id={idFloatBtn}
          open={openFloatBtn}
          anchorEl={anchorE2}
          className="floating_btn__columnName"
          onClose={handleCloseFloatBtn}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <div>
            {DefaultTypeDetails &&
              DefaultTypeDetails.map((item: any) => (
                <Typography
                  key={item.label}
                  className={`floating_btn__columnName__typography ${item.Disbaled ? 'floating_btn__columnName__disabledColumn' : ''}`}
                  onClick={() => floatBtnAddTask(item.label)}
                  data-testid={`floating-btn-create ${item.label}`}
                >
                  {item.label}{' '}
                </Typography>
              ))}
          </div>
        </Popover>
      )}
    </div>
  )
};

export default FloatingButton;
