import { Box } from '@mui/system';
import React, { useContext, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { projectDetailsContext } from 'src/modules/baseService/projects/Context/ProjectDetailsContext';
import { GET_PROJECT_BUDGET } from 'src/modules/dynamicScheduling/graphql/queries/projectBudget';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import NoDataMessage from 'src/modules/shared/components/NoDataMessage/NoDataMessage';
import Notification, {
  AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';
import { postSchedulerApiWithProjectExchange } from 'src/services/api';
import { client } from 'src/services/graphql';
import { ProjectSetupRoles } from '../../../../../utils/role';
import ProjectBudgetTable from '../../components/ProjectBudgetTable/ProjectBudgetTable';
import MaterialHeader from '../../components/ProjectMaterialMaster/MaterialHeader';
import './ProjectBudget.scss';

interface Params {
  projectId: string;
}

export const noPermissionMessage =
  "You don't have permission to view project budget";
const ProjectBudget = () => {
  const authContext: any = useContext(stateContext);
  const [projectBudget, setProjectBudget] = useState<any>({});
  const [searchProjectBudget, setSearchProjectBudget] = useState<any>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<any>('');
  const { projectDetailsState }: any = useContext(projectDetailsContext);

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: `.xlsx`,
    noClick: true,
    noKeyboard: true,
    onDrop: (acceptedFiles: any) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        setFiles(
          acceptedFiles.map((file: any) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          )
        );
      } else {
        Notification.sendNotification(
          'Maximum file size allowed is 5MB',
          AlertTypes.warn
        );
        setFiles([]);
      }
    },
  });

  useEffect(() => {
    if (files.length > 0) {
      uploadFiles(files[0]);
    }
  }, [files]);

  useEffect(() => {
    if (
      projectDetailsState.projectPermission?.canViewProjectCalendarAssociation
    ) {
      getProjectBudget();
    }
  }, [projectDetailsState.projectToken]);

  useEffect(() => {
    if (searchText.length > 0) {
      searchProjectBudgets(searchText);
    }
  }, [searchText]);

  const getProjectBudget = async () => {
    try {
      authContext.dispatch(setIsLoading(true));

      const res = await client.query({
        query: GET_PROJECT_BUDGET,
        variables: {},
        fetchPolicy: 'network-only',
        context: {
          role: ProjectSetupRoles.viewProjectMaterial,
          token: projectDetailsState.projectToken,
        },
      });
      setProjectBudget(res.data.projectBudget);
    } catch (err) {
      setProjectBudget([]);

      // Notification.sendNotification(
      //   'An error occured while fetching project budget',
      //   AlertTypes.warn
      // );
    } finally {
      authContext.dispatch(setIsLoading(false));
    }
  };

  const searchProjectBudgets = (searchText: string) => {
    const tempProjectBudget: any = [];
    projectBudget.forEach((element: any) => {
      if (
        element.budgetLineItemTitle
          .toLowerCase()
          .includes(searchText.trim().toLowerCase())
      ) {
        tempProjectBudget.push(element);
      }
    });
    setSearchProjectBudget(tempProjectBudget);
  };

  interface SelectionType {
    all: boolean;
    selected: Array<number>;
  }

  const [selection, setSelection] = useState<SelectionType>({
    all: false,
    selected: [],
  });

  const uploadFiles = async (file: any) => {
    try {
      setSearchText('');
      authContext.dispatch(setIsLoading(true));
      const headers = {
        'content-type': 'multipart/form-data',
      };
      const formData = new FormData();
      formData.append('budgetLineItems', file);

      const response = await postSchedulerApiWithProjectExchange(
        'V1/projectBudgetLineItems/import',
        formData,
        projectDetailsState.projectToken
      );

      getProjectBudget();
      Notification.sendNotification(response.message, AlertTypes.success);
      authContext.dispatch(setIsLoading(false));
    } catch (err: any) {
      authContext.dispatch(setIsLoading(false));
      console.log('err: ', err);
      Notification.sendNotification(err, AlertTypes.warn);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="3%"
      width="100%"
      sx={{ height: 'calc(100vh - 130px)' }}
    >
      <input {...getInputProps()} />
      {projectDetailsState.projectPermission
        ?.canViewProjectCalendarAssociation ? (
        <>
          <MaterialHeader
            SearchVisible={true}
            deleteButtonVisible={false}
            addButtonVisible={false}
            uploadButtonVisible={true}
            title="Project Budget "
            searchText={searchText}
            onChange={(e) => {
              setSearchText(e.target.value.trim());
            }}
            onUpload={open}
            searchPlaceHolder="Search by Budget Title"
          />
          <ProjectBudgetTable
            projectBudget={
              searchText.length > 0 ? searchProjectBudget : projectBudget
            }
          />
        </>
      ) : (
        <div className="noCreatePermission-project-budget">
          <div className="no-permission-project-budget">
            <NoDataMessage message={noPermissionMessage} />
          </div>
        </div>
      )}
    </Box>
  );
};

export default ProjectBudget;
