import { client } from "../../../services/graphql";

export const graphQLCall = async (
  mutationType: any,
  variables: any,
  role: any
) => {
  const data = await client.mutate({
    mutation: mutationType,
    variables: variables,
    context: { role: role },
  });
  return data;
};
