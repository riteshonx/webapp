import { FetchPolicy } from "@apollo/client";
import { client } from "src/services/graphql";
import ResponseCode from "./errorCodeForMessage";

export const getUniqueName=(argNames:Array<string>): string=>{
    const copied: any = {};
    const target = (currentName: string, count: number) => currentName + "-copy(" + count + ")";
    
    const returnValue= argNames.map((currentName: string)=> {
      let count = copied[currentName] || 0;
      
      copied[currentName] = count + 1;
  
      if(!count)
        return currentName;
      
      while(copied[target(currentName, count)])
      count++;
      
      copied[target(currentName, count)] = 1;
      return target(currentName, count);
    });
    return returnValue[returnValue.length-1]
}

// almost same function. but generates name in the format: <sourcename>[unique-index]
export const getUniqueRecipeName=(argNames:Array<string>): string=>{
  const copied: any = {};
  const target = (currentName: string, count: number) => currentName + "[" + count + "]";
  
  const returnValue= argNames.map((currentName: string)=> {
    let count = copied[currentName] || 0;
    
    copied[currentName] = count + 1;

    if(!count)
      return currentName;
    
    while(copied[target(currentName, count)])
    count++;
    
    copied[target(currentName, count)] = 1;
    return target(currentName, count);
  });
  return returnValue[returnValue.length-1]
}
export type Order = 'asc' | 'desc';

export const descendingComparator=(a: any, b: any, orderBy: keyof any):any =>{
    if(typeof a[orderBy] === 'number'){
      if (b[orderBy] < a[orderBy]) {
        return -1;
      }
      if (b[orderBy] > a[orderBy]) {
        return 1;
      }
    } else if(typeof a[orderBy] === 'object'){
        if (new Date(b[orderBy]) < new Date(a[orderBy])) {
            return -1;
          }
          if (new Date(b[orderBy]) > new Date(a[orderBy])) {
            return 1;
          }
    }else{
      if (b[orderBy]?.toString().toLocaleLowerCase() < a[orderBy]?.toString().toLocaleLowerCase()) {
        return -1;
      }
      if (b[orderBy]?.toString().toLocaleLowerCase() > a[orderBy]?.toString().toLocaleLowerCase()) {
        return 1;
      }
    }
  
    return 0;
  }

export function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function stableSort<T>(array: any[], comparator: (a: any, b: any) => number): Array<any> {
  const stabilizedThis = array.map((el, index) => [el, index] as [any, any]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}


export function validateTableCell(argVal : any) {
  if(argVal === null || argVal == "" || argVal == " " || argVal === undefined){
    return "--"
  }else {
    return argVal
  }
}


export function truncate(input : string) {
  if (input.length > 5) {
     return input.substring(0, 5) + '...';
  }
  return input;
}

export function truncateLongString(input: string){
  if (input.length > 11) {
    return input.substring(0, 11) + '...';
 }
 return input;
}


export function truncateSpecHeadingString(input: string){
  if (input.length > 11) {
    return input.substring(0, 45) + '...';
 }
 return input;
}

export function getResponseMessage(argCode: any){
  if(ResponseCode[argCode]){
    return ResponseCode[argCode].DESCRIPTION;
  }else
  return 'Something went wrong';
}


export async function fetchData(query: any, variables: any, token: any, role: string, fetchPolicy: FetchPolicy = 'network-only'): Promise<{data: any, error: string | null}> {
  const response = { data: null, error: null };
  try {
    const responseData = await client.query({
      query: query,
      variables: variables,
      fetchPolicy: fetchPolicy,
      context: { role: role, token: token }
    });
    response.data = (responseData?.data) ? responseData.data : null;
  } catch (error: any) {
    response.error = error.message;
  } finally {
    return response;
  }
}

export async function graphqlMutation(query: any, variable: any, role: any, token: any) {
  const response = { data: null, error: null };
  try {
    const responseData = await client.mutate({
      mutation: query,
      variables: variable,
      context: { role: role, token: token }
    })
    response.data = (responseData?.data) ? responseData.data : null;
  } catch (error: any) {
    response.error = error.message;
  } finally {
    return response;
  }
}