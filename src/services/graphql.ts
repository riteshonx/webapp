import {
  getExchangeToken,
  getProjectExchangeToken,
  logout,
} from "./authservice";
import Notification, {
  AlertTypes,
} from "../modules/shared/components/Toaster/Toaster";
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  split,
  HttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import jwtDecode from "jwt-decode";

const httpLink = createHttpLink({
  uri: process.env["REACT_APP_GRAPHQL_URL"], //http link uri
});

const authLink = setContext((operation, context) => {
  let token = getExchangeToken();
  if (context.token) {
    token = context.token;
  }

  if (token === null) {
    return {};
  } else {
    const headers = {
      Authorization: `Bearer ${token}`,
      "x-hasura-role": context.role,
    };

    return {
      headers,
      ...context,
    };
  }
});

const url: string = process.env["REACT_APP_GRAPHQL_URL"] || "";

const wsLink = new WebSocketLink({
  uri: `wss://${url.replace(/^https?:\/\//, "")}`,
  options: {
    reconnect: true,
    lazy: true,
    connectionParams: () => {
      const targetRole = JSON.parse(
        sessionStorage.getItem("X-Hasura-Role") || ""
      );
      let hasuraRole;
      let token;
      if (targetRole?.project) {
        token = getProjectExchangeToken();
        hasuraRole = targetRole.project;
      } else {
        token = getExchangeToken();
        hasuraRole = targetRole.tenant;
      }

      if (!token || !hasuraRole) {
        console.warn("ProjectExchangeToken or TenantToken hasn't set yet");
        return "";
      }
      return {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Hasura-Role": hasuraRole,
        },
      };
    },
  },
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ extensions }) => {
      switch (extensions?.code) {
        case "access-denied":
          Notification.sendNotification(`Access denied`, AlertTypes.warn);
          break;
        case "not-found":
          Notification.sendNotification(`Not found`, AlertTypes.warn);
          break;
        case "validation-failed": {
          Notification.sendNotification(`Validation failed`, AlertTypes.warn);
          break;
        }
        case "invalid-jwt": {
          logout();
          break;
        }
      }
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${JSON.stringify(networkError)}`);
  }
});

export const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(splitLink)),
  cache: new InMemoryCache(),
});
