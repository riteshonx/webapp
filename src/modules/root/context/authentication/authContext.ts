import { createContext, Dispatch } from "react";
import { Action } from "src/models/context";
import { Authentication } from "./reducer";

export type AuthState = Authentication | Partial<Authentication>;

export interface stateContextProps {
  state: AuthState;
  dispatch: Dispatch<Action>;
}

export const stateContext = createContext<stateContextProps>({
  state: {},
  dispatch: () => {
    // do nothing
  },
});
