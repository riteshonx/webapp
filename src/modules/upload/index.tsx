import { ReactElement, useReducer } from "react";
import { uploadContext } from "./contextAPI/context";
import { uploadReducer, initialState } from "./contextAPI/reducer";
import UploadView from "./uploadView/UploadView";

export default function Main(): ReactElement {
  const [uploadState, uploadDispatch] = useReducer(uploadReducer, initialState);
  return (
    <uploadContext.Provider value={{ uploadState, uploadDispatch }}>
      <UploadView />
    </uploadContext.Provider>
  );
}
