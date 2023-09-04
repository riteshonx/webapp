import { Box } from '@mui/system';
import React, { useContext, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { projectDetailsContext } from 'src/modules/baseService/projects/Context/ProjectDetailsContext';
import { GET_CHANGE_ORDER } from 'src/modules/dynamicScheduling/graphql/queries/changeOrder';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import NoDataMessage from 'src/modules/shared/components/NoDataMessage/NoDataMessage';
import Notification, {
  AlertTypes,
} from 'src/modules/shared/components/Toaster/Toaster';
import { postSchedulerApiWithProjectExchange } from 'src/services/api';
import { client } from 'src/services/graphql';
import { ProjectSetupRoles } from '../../../../../utils/role';
import ChangeOrderTable from '../../components/ChangeOrderTable/ChangeOrderTable';
import MaterialHeader from '../../components/ProjectMaterialMaster/MaterialHeader';
import './ChangeOrder.scss';

interface Params {
  projectId: string;
}

export const noPermissionMessage =
  "You don't have permission to view change order";

const ChangeOrder = () => {
  const authContext: any = useContext(stateContext);
  const [changeOrder, setChangeOrder] = useState<any>({});
  const [searchChangeOrder, setSearchChangeOrder] = useState<any>([]);
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
      getChangeOrder();
    }
  }, [projectDetailsState.projectToken]);

  useEffect(() => {
    if (searchText.length > 0) {
      searchChangeOrders(searchText);
    }
  }, [searchText]);

  const getChangeOrder = async () => {
    try {
      authContext.dispatch(setIsLoading(true));

      const res = await client.query({
        query: GET_CHANGE_ORDER,
        variables: {},
        fetchPolicy: 'network-only',
        context: {
          role: ProjectSetupRoles.viewProjectMaterial,
          token: projectDetailsState.projectToken,
        },
      });
      setChangeOrder(res.data.changeOrder);
    } catch (err) {
      setChangeOrder([]);

      // Notification.sendNotification(
      //   'An error occured while fetching Change order',
      //   AlertTypes.warn
      // );
    } finally {
      authContext.dispatch(setIsLoading(false));
    }
  };

  const searchChangeOrders = (searchText: string) => {
    const tempChangeOrder: any = [];
    changeOrder.forEach((element: any) => {
      if (
        element.title.toLowerCase().includes(searchText.trim().toLowerCase())
      ) {
        tempChangeOrder.push(element);
      }
    });
    setSearchChangeOrder(tempChangeOrder);
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
      formData.append('changeOrder', file);

      const response = await postSchedulerApiWithProjectExchange(
        'V1/changeOrder/import',
        formData,
        projectDetailsState.projectToken
      );

      getChangeOrder();
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
            title="Change Order"
            searchText={searchText}
            onChange={(e) => {
              setSearchText(e.target.value.trim());
            }}
            onUpload={open}
            searchPlaceHolder="Search by Title"
          />
          <ChangeOrderTable
            changeOrder={
              searchText.length > 0 ? searchChangeOrder : changeOrder
            }
          />
        </>
      ) : (
        <div className="noCreatePermission-change-order">
          <div className="no-permission-change-order">
            <NoDataMessage message={noPermissionMessage} />
          </div>
        </div>
      )}
    </Box>
  );
};

export default ChangeOrder;
