import { Box, Stack } from '@mui/material';
import { DataGrid, GridCellParams, GridColDef } from '@mui/x-data-grid';
import React, { createContext, useContext, useState } from 'react';
import MenuListComposition from './MenuListComposition';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import {
  getSlateProjects,
  getSyncedProjectFromConnectors,
} from '../actions/actions';
import '../styles/styles.scss';
import {
  ProjectDataInterface,
  Project,
  ConnRowData,
  AgaveLinkType,
} from '../utils/types';
import { getSourceSystemLabel } from '../utils/helper';
import UploadFileModal from './UploadFileModal';
import SourceProjectDropDown from './SourceProjectDropDown';
import axios from 'axios';
import Notification, {
  AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';

const updateProjectLocationTree = async (data: any) => {
  const connectorToken = localStorage.getItem('connectorToken')
  try {
    const url = `${process.env.REACT_APP_CONNECTOR_URL}/locationTree`
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${connectorToken}`,
        'Content-Type': 'application/json',
      },
    });
    // console.log('res::;',response?.data)
    const { MESSAGE } = response?.data
    Notification.sendNotification(
      MESSAGE,
      AlertTypes.success
    );
  } catch (error) {
    console.log('err', error);
    Notification.sendNotification(
      'Cannot import location tree from a different source system',
      AlertTypes.warn
    );
  }
}
const columns: GridColDef[] = [
  {
    field: 'targetProjectName',
    headerName: 'Target project name',
    sortable: false,
    type: 'string',
    headerClassName: 'data-grid-column',
    cellClassName: 'data-grid-column',
  },
  {
    field: 'source',
    headerName: 'Source',
    sortable: false,
    minWidth: 50,
    type: 'string',
  },
  {
    field: 'sourceProject',
    headerName: 'Source project',
    sortable: false,
    headerClassName: 'data-grid-column',
    cellClassName: 'data-grid-column',
    renderCell: (params: GridCellParams) => {
      return <SourceProjectDropDown row={params.row as ConnRowData} />;
    },
  },
  {
    field: 'actions',
    headerName: 'Actions',
    sortable: false,
    headerClassName: 'data-grid-column2',
    cellClassName: 'data-grid-column2',
    renderCell: (params: GridCellParams) => {
      return (
        <Stack direction={'row'} justifyContent={'space-around'}>
          <MenuListComposition row={{ ...(params.row as ConnRowData) }} />
          <UploadFileModal
            row={{ ...(params.row as ConnRowData) }}
            updateLocationTree={updateProjectLocationTree}
          />
        </Stack>
      );
    },
  },
];

export const SelSourceProjectContext = createContext<{
  selSourceProjectState: [
    {
      [key: string]: { value: ProjectDataInterface | undefined; idx: number };
    },
    React.Dispatch<
      React.SetStateAction<{
        [key: string]: { value: ProjectDataInterface | undefined; idx: number };
      }>
    >
  ];
}>({
  selSourceProjectState: [
    {},
    () => {
      return;
    },
  ],
});
interface Props {
  fetchProjectState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}
export default function ThirdPartyProjects({
  fetchProjectState,
}: Props): React.ReactElement {
  const {
    dispatch,
    state: { sourceSystem },
  } = useContext(stateContext);
  const [projects, setProjects] = useState<{
    sourceProject: ProjectDataInterface[];
    targetProject: Array<ProjectDataInterface | Project>;
  }>({
    sourceProject: [],
    targetProject: [],
  });
  const [isRefetchProject, setRefetchProject] = fetchProjectState;
  const selSourceProjectState = useState<{
    [key: string]: { value: ProjectDataInterface | undefined; idx: number };
  }>({});
  const handleFetchProjects = async (): Promise<any> => {
    try {
      dispatch(setIsLoading(true));
      const { sourceProject, targetProject } = await getSlateProjects(
        sourceSystem
      );
      setProjects({ sourceProject, targetProject });
    } finally {
      dispatch(setIsLoading(false));
    }
  };
  React.useEffect(() => {
    async function apiCall() {
      await handleFetchProjects();
    }
    apiCall();
  }, []);

  React.useEffect(() => {
    async function apiCall() {
      await handleFetchProjects();
    }
    if (isRefetchProject) {
      apiCall();
      setRefetchProject(false);
    }
  }, [isRefetchProject]);

  React.useEffect(() => {
    async function apiCall() {
      try {
        dispatch(setIsLoading(true));
        const sourceProject = await getSyncedProjectFromConnectors(
          sourceSystem as AgaveLinkType
        );
        setProjects((prev) => ({
          ...prev,
          sourceProject,
        }));
        selSourceProjectState[1]({});
      } finally {
        dispatch(setIsLoading(false));
      }
    }
    if (sourceSystem) {
      apiCall();
    }
  }, [sourceSystem]);
  const rows = projects.targetProject.map((item) => {
    if ('id' in item) {
      return {
        id: item.id.toString(),
        projectId: item.id,
        targetProjectName: item.name,
        sourceProject: projects.sourceProject,
        source: 'Slate',
        metadata: {},
        agaveProjectId: '',
      };
    } else {
      const label = getSourceSystemLabel(item.metadata);
      return {
        id: `${item.projectId}__${label}`,
        projectId: item.projectId,
        sourceProject: projects.sourceProject,
        source: label,
        targetProjectName: item.project.name,
        metadata: item.metadata,
        agaveProjectId: item.agaveProjectId,
      };
    }
  });
  const isAutoHeight =
    projects.targetProject.length * 52 <= window.innerHeight - 225;
  return (
    <Box sx={{ height: 'calc(100vh - 170px)', width: '100%' }}>
      <SelSourceProjectContext.Provider
        value={{
          selSourceProjectState,
        }}
      >
        <DataGrid
          columns={columns}
          rows={rows}
          autoHeight={isAutoHeight}
          hideFooter
          disableColumnMenu
          classes={{
            cell: 'data-grid-cell',
            row: 'data-grid-row',
            columnHeader: 'data-grid-columnHeader',
          }}
        />
      </SelSourceProjectContext.Provider>
    </Box>
  );
}
