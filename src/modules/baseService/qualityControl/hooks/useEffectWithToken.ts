import { useEffect, useContext } from "react";
import { stateContext } from "src/modules/root/context/authentication/authContext";

export default function useEffectWithToken(
  callback: () => void,
  deps: Array<any>
) {
  const { state } = useContext(stateContext);
  useEffect(() => {
    if (state.selectedProjectToken) {
      callback();
    }
  }, [state.selectedProjectToken, ...deps]);
}
