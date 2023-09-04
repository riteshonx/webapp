import { Dispatch, createContext } from "react";
import { PunchListAction, PunchListState } from "./reducer";

export type PunchListType = Partial<PunchListState>;

export interface PunchListContextProps {
  punchListState: PunchListType;
  punchListDispatch: Dispatch<PunchListAction>;
}

export const punchListContext = createContext<PunchListContextProps>({
  punchListState: {},
  punchListDispatch: () => {
    //empty function
  },
});

export const projectContext = createContext({});

export const formStateContext = createContext({});

export const locationTreeContext = createContext({});
