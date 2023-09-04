import { getExchangeToken, logout } from "./authservice";
import { ApolloLink, InMemoryCache, split, from } from "@apollo/client";
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

export const webSocketgraphql = (context: any) =>  {
  let webSocketContext:any = context; 
  const url: string = process.env["REACT_APP_GRAPHQL_URL"] || '';

  const wsLink = new WebSocketLink({
    uri: `wss://${url.replace(/^https?:\/\//, '')}`,
    options: {
      reconnect: true,
      connectionParams: (argContext: any) => {
        return {
          headers: {
            Authorization: `Bearer ${webSocketContext.token}`,
            "X-Hasura-Role": webSocketContext.role
          },
        }
      }
    }
  });


  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink
  );

  const authMiddleware = new ApolloLink((operation: any, forward: any) => {
    // add the authorization to the headers
    const context = operation.getContext();
    let token = getExchangeToken();
    if (context.token) {
      token = context.token;
      webSocketContext = context;
      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...headers,
          Authorization: `Bearer ${token}`,
          "x-hasura-role": context.role,
        }
      }));
    }
    return forward(operation);
  })



  return {
    link: from([
    authMiddleware,
    splitLink
    ]),
    cache: new InMemoryCache(),
  }
};
