import { FETCH_PROJECT_NAMES } from "src/graphhql/queries/projects";
import { getExchangeToken } from "./authservice";
import { client } from "./graphql";


export async function genFetchProjectNames(projectIds: [number], token?: string) {
  return await client.query({
    query: FETCH_PROJECT_NAMES,
    fetchPolicy: "network-only",
    context: {
      role: "viewMyProjects",
      token: token || getExchangeToken(),
    },
    variables: {
      // @todo should use projectIds on variables
      projectId: projectIds,
    },
  })
}