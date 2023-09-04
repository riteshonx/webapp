export const SET_UPLOAD_FILES = "SET_UPLOAD_FILES";
export const SET_UPLOAD_DATES = "SET_UPLOAD_DATES";
export const SET_TAGS_AND_DOCUMENT_TYPES = "SET_TAGS_AND_DOCUMENT_TYPES";
// export const SET_DOCUMENT_TYPES = "SET_DOCUMENT_TYPES";
export const SET_SELECTED_DATE = "SET_SELECTED_DATE";

export const setUploadFiles = (payload: any) => {
  return {
    type: SET_UPLOAD_FILES,
    payload,
  };
};

export const setUploadDates = (payload: any) => {
  return {
    type: SET_UPLOAD_DATES,
    payload,
  };
};

export const setTagsAndDocumentTypes = (payload: any) => {
  return {
    type: SET_TAGS_AND_DOCUMENT_TYPES,
    payload,
  };
};

// export const setDocumentTypes = (payload: any) => {
//   return {
//     type: SET_DOCUMENT_TYPES,
//     payload,
//   };
// };

// export const setSelectedDate = (payload: any) => {
//   return {
//     type: SET_SELECTED_DATE,
//     payload,
//   };
// };
