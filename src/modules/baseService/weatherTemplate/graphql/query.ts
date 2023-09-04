import { gql } from "@apollo/client";

export const GET_WEATHER_CONSTRAINT_TEMPLATE = gql`
query getTenantWeatherConstraintTemplate{
  weatherConstraintTemplate{
    id
    name
    parameter
  }
}`

export const UPDATE_WEATHER_CONSTRAINT_TEMPLATE = gql `
mutation updateWeatherConstraintTemplate($name: String, $parameter: jsonb) {
  update_weatherConstraintTemplate(where: {name: {_eq: $name}}, _set: {parameter: $parameter}){
    returning{
      id
      name
      parameter
    }
  }
}`