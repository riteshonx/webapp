import { decodeExchangeToken } from 'src/services/authservice'
import userflow from 'userflow.js';

const USERFLOW_TOKEN_DEV = 'ct_l2dlnxstqjch7dnlqfg4xuc27y';
const USERFLOW_TOKEN_PROD = 'ct_aa6dpmo5drhrffrlbnz5bce3ve';

export const initializeUserflow = (portfolios: any[]) => {
    let token = null;
    const authURl = process.env["REACT_APP_AUTHENTICATION_URL"];
    if(authURl?.includes(".prod")){
      token = USERFLOW_TOKEN_PROD
    }else{
      token = USERFLOW_TOKEN_DEV
    }
    const user = decodeExchangeToken();
    let projects : any[] = [];
    portfolios.forEach((project:any[]) => {
      const keys = Object.keys(project);
      projects = [ ...projects, ...keys]
    })
    const projectIds = projects.join(",");
    if(user.userId){
      userflow.init(token)
      userflow.identify(user.userId, {
        user_id: user.userId,
        tenant_id: user.tenantId,
        project_id: projectIds
      })
    }
}
