import React, { useContext, useReducer } from 'react';
import { client } from '../../../../services/graphql';
import { setIsLoading } from '../../../root/context/authentication/action';
import { stateContext } from '../../../root/context/authentication/authContext';
import Notification, {
  AlertTypes,
} from '../../../shared/components/Toaster/Toaster';

import  AttachmentContext  from './attachmentContext';
import AttachementReducer from './attachmentReducer';
import {
  SET_ATTCHED_FILES,
  SET_ALL_UPLOADED_FILES
} from './type';
import { deleteApiWithEchange } from '../../../../services/api';
import { projectFeatureAllowedRoles } from '../../../../utils/role';
import {  GET_ATTCHED_FILES, 
          SAVE_ATTCHED_FILES, 
          DELETE_ATTCHED_FILE  } from '../../graphql/queries/attachment';
import { useHistory } from 'react-router-dom';
import { priorityPermissions } from '../../permission/scheduling';

const AttachmentState = (props: any) => {
    const initialState = {
        attachedFile: [],
        allUploadedFiles: []
    };

    const [state, dispatch] = useReducer(AttachementReducer, initialState);
    const authContext: any = useContext(stateContext);
  
    const getAttchedFiles = async (taskId: any) => {
      try {
        dispatch({ type: SET_ATTCHED_FILES, payload: { data: [] } });
        const res = await client.query({
          query: GET_ATTCHED_FILES,
          variables: {taskId: taskId},
          fetchPolicy: 'network-only',
          context: {
            role: priorityPermissions('view'),
            token: authContext.state.selectedProjectToken,
          },
        });

        dispatch({ type: SET_ATTCHED_FILES, payload: res.data.attachments });

    } catch (err) {
      Notification.sendNotification(err.message, AlertTypes.error);
    }
    };
  
    const saveAttchedFiles = async (files: any, taskId: any) => {
      try {
        const res = await client.mutate({
          mutation: SAVE_ATTCHED_FILES,
          variables: {
            objects: files
          },
          context: {
            role: priorityPermissions('create'),
            token: authContext.state.selectedProjectToken,
          },
        });
        getAttchedFiles(taskId);
        Notification.sendNotification(
          'File(s) attached successfully',
          AlertTypes.success
        );

    } catch (err) {
      Notification.sendNotification(err?.message, AlertTypes.error);
    }
    }

    const deleteAttachedFile = async (id: any, taskId: any) => {
      try {
        const res = await client.mutate({
          mutation: DELETE_ATTCHED_FILE,
          variables: { id: id },
          context: {  
             role: priorityPermissions('delete'),
            token: authContext.state.selectedProjectToken, },
        });
        getAttchedFiles(taskId);

        Notification.sendNotification(
          'Deleted  successfully',
          AlertTypes.success
        );
      } catch (error) {
        Notification.sendNotification(error?.message, AlertTypes.error);
      }
    };

    const setAllUploadedFiles = async (uploadedFiles: any) => {
      dispatch({ type: SET_ALL_UPLOADED_FILES, payload: uploadedFiles });
    }

    return (
        <AttachmentContext.Provider
          value={{
            attachedFile: state.attachedFile,
            allUploadedFiles: state.allUploadedFiles,
            getAttchedFiles,
            saveAttchedFiles,
            deleteAttachedFile,
            setAllUploadedFiles
          }}
        >
          {props.children}
        </AttachmentContext.Provider>
      );
};

export default AttachmentState;
