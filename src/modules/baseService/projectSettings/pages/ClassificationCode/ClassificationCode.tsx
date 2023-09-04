import { Box } from '@mui/system';
import React, { useContext, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { projectDetailsContext } from 'src/modules/baseService/projects/Context/ProjectDetailsContext';
import { GET_CLASSIFICATION_CODE } from 'src/modules/dynamicScheduling/graphql/queries/projectProductivity';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import NoDataMessage from 'src/modules/shared/components/NoDataMessage/NoDataMessage';
import Notification, {
  AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';
import { postSchedulerApiWithProjectExchange } from 'src/services/api';
import { client } from 'src/services/graphql';
import { ProjectSetupRoles } from '../../../../../utils/role';
import ClassificationCodeTable from '../../components/ClassificationCodeTable/ClassificationCodeTable';
import MaterialHeader from '../../components/ProjectMaterialMaster/MaterialHeader';
import './ClassificationCode.scss';

interface Params {
  projectId: string;
}

export const noPermissionMessage =
  "You don't have permission to view project classification code settings";

const ClassificationCode = () => {
  const authContext: any = useContext(stateContext);
  const [classificationCode, setClassificationCode] = useState<any>({});
  const [searchClassificationCode, setSearchClassificationCode] = useState<any>(
    []
  );
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
      getClassificationCode();
    }
  }, [projectDetailsState.projectToken]);

  useEffect(() => {
    if (searchText.length > 0) {
      searchClassificationCodes(searchText);
    }
  }, [searchText]);

  const getClassificationCode = async () => {
    try {
      authContext.dispatch(setIsLoading(true));

      const res = await client.query({
        query: GET_CLASSIFICATION_CODE,
        variables: {},
        fetchPolicy: 'network-only',
        context: {
          role: ProjectSetupRoles.viewProjectCalendarAssociation,
          token: projectDetailsState.projectToken,
        },
      });
      setClassificationCode(res.data.classificationCodes);
    } catch (err) {
      setClassificationCode([]);

      // Notification.sendNotification(
      //   'An error occured while fetching Classification code',
      //   AlertTypes.warn
      // );
    } finally {
      authContext.dispatch(setIsLoading(false));
    }
  };

  const searchClassificationCodes = (searchText: string) => {
    const tempClassificationCode: any = [];
    classificationCode.forEach((element: any) => {
      if (
        element.classificationCode
          .toLowerCase()
          .includes(searchText.trim().toLowerCase()) ||
        element.classificationCodeName
          .toLowerCase()
          .includes(searchText.trim().toLowerCase())
      ) {
        tempClassificationCode.push(element);
      }
    });
    setSearchClassificationCode(tempClassificationCode);
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
      formData.append('cost_code', file);

      const response = await postSchedulerApiWithProjectExchange(
        'V1/classificationCodes/import',
        formData,
        projectDetailsState.projectToken
      );

      getClassificationCode();
      Notification.sendNotification(response.message, AlertTypes.success);
      authContext.dispatch(setIsLoading(false));
    } catch (err: any) {
      authContext.dispatch(setIsLoading(false));
      console.log('err: ', err);
      Notification.sendNotification(err, AlertTypes.warn);
    }
  };

  return (
    //added fixed height to make the table scrollable
    //Height calculated by factoring in "Header" - 80px, padding of project__rightside settings - 30px, Margin of Root component body  - 20px
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
            title="Classification Code"
            onChange={(e) => {
              setSearchText(e.target.value.trim());
            }}
            searchText={searchText}
            onUpload={open}
            searchPlaceHolder="Search by Name, Code"
          />
          <ClassificationCodeTable
            classificationCodes={
              searchText.length > 0
                ? searchClassificationCode
                : classificationCode
            }
          />
        </>
      ) : (
        <div className="noCreatePermission-classification">
          <div className="no-permission-classification">
            <NoDataMessage message={noPermissionMessage} />
          </div>
        </div>
      )}
    </Box>
  );
};

export default ClassificationCode;
