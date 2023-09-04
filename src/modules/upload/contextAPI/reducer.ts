import {
  SET_UPLOAD_FILES,
  SET_UPLOAD_DATES,
  SET_TAGS_AND_DOCUMENT_TYPES,
} from "./action";

interface Upload {
  uploadFiles: any;
  uploadDates: any;
  tags: any;
  documentTypes: any;
  totalDocumentCount: number;
}

export const initialState: Upload = {
  uploadFiles: null,
  uploadDates: [],
  tags: [],
  documentTypes: [],
  totalDocumentCount: 0,
};

export const uploadReducer = (state: any = initialState, action: any): any => {
  switch (action.type) {
    case SET_UPLOAD_FILES:
      return {
        ...state,
        uploadFiles: action.payload.data,
        totalDocumentCount: action.payload.totalCount,
      };
    case SET_UPLOAD_DATES:
      return {
        ...state,
        uploadDates: action.payload,
      };
    case SET_TAGS_AND_DOCUMENT_TYPES:
      return {
        ...state,
        tags: action.payload.tags,
        documentTypes: action.payload.documentTypes,
      };

    default:
      return state;
  }
};
