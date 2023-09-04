import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Button, Grid } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import React, { useContext } from 'react';
import { SelSourceProjectContext } from './ThirdPartyProjects';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { importForms } from '../actions/actions';
import '../styles/styles.scss';
import { ProjectDataInterface, ConnRowData } from '../utils/types';
import { getSourceSystemLabel, getTransformAccountId } from '../utils/helper';
interface MenuListProps {
  row: ConnRowData;
}
export default function MenuListComposition({
  row,
}: MenuListProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const {
    dispatch,
    state: { sourceSystem },
  } = React.useContext(stateContext);
  const {
    selSourceProjectState: [selSourceProject],
  } = useContext(SelSourceProjectContext);
  const { projectId, id, targetProjectName } = row;
  let sourceProject = selSourceProject[id]?.value;
  if (!sourceProject) {
    sourceProject = row as unknown as ProjectDataInterface;
  }
  const localSourceSystem = getSourceSystemLabel(sourceProject?.metadata ?? {});
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const handleLoader = async (
    cb: (...rest: any[]) => Promise<any>,
    ...rest: any[]
  ) => {
    try {
      dispatch(setIsLoading(true));
      await cb(...rest);
    } finally {
      dispatch(setIsLoading(false));
    }
  };
  const menuItems = [
    {
      text: 'Procore RFI',
      call: () =>
        handleLoader(importForms, 'Procore RFI', targetProjectName, {
          sourceSystem: sourceSystem?.name,
          linkedProject: {
            agaveProjectId: sourceProject?.agaveProjectId,
            sourceProjectId: sourceProject?.metadata?.id,
          },
          featureName: 'RFI',
          projectId,
          initiator: 'client',
        }),
      id: 'rfi',
      disabled: ['BIM 360'].includes(localSourceSystem || ''),
    },
    {
      text: 'Manpower Log',
      call: () =>
        handleLoader(importForms, 'Manpower Log', targetProjectName, {
          sourceSystem: sourceSystem?.name,
          linkedProject: {
            agaveProjectId: sourceProject?.agaveProjectId,
            sourceProjectId: sourceProject?.metadata?.id,
          },
          featureName: 'Manpower Log',
          projectId,
          initiator: 'client',
        }),
      id: 'manpower-log',
      disabled: ['BIM 360'].includes(localSourceSystem || ''),
    },
    {
      text: 'Timecard Entries',
      call: () =>
        handleLoader(importForms, 'Timecard Entries', targetProjectName, {
          sourceSystem: sourceSystem?.name,
          linkedProject: {
            agaveProjectId: sourceProject?.agaveProjectId,
            sourceProjectId: sourceProject?.metadata?.id,
          },
          featureName: 'Timecard Entries',
          projectId,
          initiator: 'client',
        }),
      id: 'timecard-entries',
      disabled: ['BIM 360'].includes(localSourceSystem || ''),
    },
    {
      text: 'Productivity Log',
      call: () =>
        handleLoader(importForms, 'Productivity Log', targetProjectName, {
          sourceSystem: sourceSystem?.name,
          linkedProject: {
            agaveProjectId: sourceProject?.agaveProjectId,
            sourceProjectId: sourceProject?.metadata?.id,
          },
          featureName: 'Productivity Log',
          projectId,
          initiator: 'client',
        }),
      id: 'productivity-log',
      disabled: ['BIM 360'].includes(localSourceSystem || ''),
    },
    {
      text: 'Checklist',
      call: () =>
        handleLoader(importForms, 'Checklist', targetProjectName, {
          sourceSystem: sourceSystem?.name,
          linkedProject: {
            agaveProjectId: sourceProject?.agaveProjectId,
            sourceProjectId: sourceProject?.metadata?.id,
          },
          featureName: 'Checklist',
          projectId,
          initiator: 'client',
        }),
      id: 'checklist',
      disabled: ['Procore'].includes(localSourceSystem || ''),
    },
    {
      text: 'Issues',
      call: () =>
        handleLoader(importForms, 'Issues', targetProjectName, {
          sourceSystem: sourceSystem?.name,
          linkedProject: {
            agaveProjectId: sourceProject?.agaveProjectId,
            sourceProjectId: sourceProject?.metadata?.id,
          },
          featureName: 'Issue Log',
          projectId,
          initiator: 'client',
        }),
      id: 'issue-log',
      disabled: ['Procore'].includes(localSourceSystem || ''),
    },
    {
      text: 'BIM360 RFI',
      call: () =>
        handleLoader(importForms, 'BIM360 RFI', targetProjectName, {
          sourceSystem: sourceSystem?.name,
          linkedProject: {
            agaveProjectId: sourceProject?.agaveProjectId,
            sourceProjectId: sourceProject?.metadata?.id,
          },
          featureName: 'BIM360 RFI',
          projectId,
          initiator: 'client',
        }),
      id: 'bim360-rfi',
      disabled: ['Procore'].includes(localSourceSystem || ''),
    },
  ];
  const importFormCriteria =
    sourceSystem?.name === localSourceSystem &&
    sourceProject?.metadata?.accountId === getTransformAccountId(sourceSystem);
  return (
    <Grid item>
      <Button
        ref={anchorRef}
        id="composition-button"
        aria-controls={open ? 'composition-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        className="btn-primary button-size"
        endIcon={<KeyboardArrowDownIcon />}
        disabled={!sourceSystem || !importFormCriteria}
        data-testid="connectors-3rdpartyprojects-btn"
      >
        Import 3rd party forms
      </Button>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
        // sx={{ zIndex: 1, width: 180 }}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom-start' ? 'left top' : 'left bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="composition-menu"
                  aria-labelledby="composition-button"
                  onKeyDown={handleListKeyDown}
                >
                  {menuItems.map((item) => (
                    <MenuItem
                      onClick={(e) => {
                        item.call();
                        handleClose(e);
                      }}
                      data-testid={`connectors-3rdpartyprojects-menu-${item.id}`}
                      key={`${projectId}-${item.id}-menu-item`}
                      classes={{
                        root: 'menu-list-composition__menu-item',
                      }}
                      disabled={item.disabled}
                    >
                      {item.text}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Grid>
  );
}
