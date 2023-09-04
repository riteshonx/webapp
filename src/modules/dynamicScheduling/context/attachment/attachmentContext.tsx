import { createContext } from "react";

type AttachmentContextInterface = {
    attachedFile: any;
    allUploadedFiles: any;
    getAttchedFiles: (taskId: any) => any;
    saveAttchedFiles: (file: any, taskId: any) => any;
    deleteAttachedFile: (id: any, taskId: any) => any;
    setAllUploadedFiles: (uploadedFiles: any) => any;
};

const attachmentContextDefaultValues: AttachmentContextInterface = {
    attachedFile: [],
    allUploadedFiles: [],

    getAttchedFiles: (taskId: any) => {
      // do nothing.
    },

    saveAttchedFiles: (file: any, taskId: any) => {
      // do nothing.
    },

    deleteAttachedFile: (id: any, taskId: any) => {
      // do nothing.
    },

    setAllUploadedFiles: (uploadedFiles: any) => {
      // do nothing.
    },
};
  
const AttachmentContext = createContext<AttachmentContextInterface>(
  attachmentContextDefaultValues
);
  

export default AttachmentContext;
