import { useEffect, useContext } from "react";
import {
  decodeExchangeToken,
  decodeToken,
  decodeProjectExchangeToken,
  setExchangeToken,
  setToken,
  setProjectExchangeToken,
  getProjectExchangeToken,
} from "src/services/authservice";
import Worker from "worker-loader!../modules/authentication/utils/Worker";
import {
  ProjectExchangeToken,
  ExchangeToken,
  projectExchangeTokenFeatures,
  exchangeTokenFeatures,
} from "src/modules/authentication/utils";
import { postApi } from "src/services/api";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { projectFeatureAllowedRoles } from "src/utils/role";
import {
  setProjectPermissions,
  setProjectToken,
} from "src/modules/root/context/authentication/action";

const BUFFER_SECONDS = 300;
const PATH_PREFIX = "V1/user/login";

export default function useTokenRefreshWorker() {
  const { dispatch, state }: any = useContext(stateContext);

  const setProjectSpecificPermissions = (argToken: string) => {
    const { allowedRoles } = decodeProjectExchangeToken(argToken);
    const permissions: any = {};
    for (const [roleName, roleValue] of Object.entries(
      projectFeatureAllowedRoles
    )) {
      permissions[`can${roleName}`] = allowedRoles.indexOf(roleValue) > -1;
    }
    dispatch(setProjectPermissions(permissions));
  };

  useEffect(() => {
    const worker = new Worker();
    worker.onmessage = async (event) => {
      try {
        const { trigger } = event.data;
        if (trigger) {
          const { exp: exchangeTokenExpiry } = decodeExchangeToken();
          const { exp: tokenExpiry, tenantId } = decodeToken();
          const { exp: projectTokenExpiry } = decodeProjectExchangeToken();

          const currentEpoc = Math.trunc(new Date().getTime() / 1000);
          const lookAheadTime = currentEpoc + BUFFER_SECONDS;

          if (
            (lookAheadTime > exchangeTokenExpiry && exchangeTokenExpiry > -1) ||
            (lookAheadTime > tokenExpiry && tokenExpiry > -1) ||
            (lookAheadTime > projectTokenExpiry && projectTokenExpiry > -1)
          ) {
            console.info("MAIN: Auto refresh trigger condition met");
            const exchangeTokenBody: ExchangeToken = {
              tenantId: Number(tenantId),
              features: exchangeTokenFeatures,
            };
            const projectExchangeTokenBody: ProjectExchangeToken = {
              tenantId: Number(tenantId),
              projectId: state.currentProject.projectId,
              features: projectExchangeTokenFeatures,
            };

            const tokenPromise = postApi(`${PATH_PREFIX}/refresh`);
            const exchangeTokenPromise = postApi(
              `${PATH_PREFIX}/exchange`,
              exchangeTokenBody
            );
            let projectTokenPromise;
            if (Number(projectExchangeTokenBody.projectId)) {
              //NOTE: this is a stop gap solution to handle projectId '0'
              projectTokenPromise = postApi(
                `${PATH_PREFIX}/exchange`,
                projectExchangeTokenBody
              );
            } else {
              projectTokenPromise = Promise.resolve({
                success: getProjectExchangeToken(),
              });
            }
            const [exTokenResponse, tokenResponse, projectTokenResponse] =
              await Promise.all([
                exchangeTokenPromise,
                tokenPromise,
                projectTokenPromise,
              ]);
            const projectToken = projectTokenResponse.success;
            setExchangeToken(exTokenResponse.success, Number(tenantId));
            setToken(tokenResponse.success);
            setProjectExchangeToken(projectToken);
            setProjectSpecificPermissions(projectToken);
            dispatch(setProjectToken(projectToken));
          }
        }
      } catch (error) {
        console.error("MAIN: Error occurred while refreshing tokens: ", error);
      }
    };
    return () => {
      console.log(
        "MAIN: Unmounting App Component. Intimating worker thread to stop timer"
      );
      worker.postMessage({ stopTimer: true });
    };
  }, []);
}
