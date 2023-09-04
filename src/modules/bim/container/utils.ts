import { client } from '../../../services/graphql'
import {FETCH_BIM_ELEMENT_NAME} from '../graphql/bimQuery';

export function loadScript(url: any) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    })
}
  
export const pluginLoader = (url: any) => {
    const loadPlugin: any = memoize(loadScript)
   return (name: any) => loadPlugin(`${url}/${name}.js`).then(() => window[name])
  
}
  
  
export const memoize = (f: any) => {
    const cache: any = {};
    return (...args: any) => {
      const argStr = JSON.stringify(args);
      cache[argStr] = cache[argStr] || f(...args);
      return cache[argStr];
    };
};

export const rgbToHex = (hex: number[]) => {

  return "#" + ((1 << 24) + (Math.round(hex[0]) << 16) + (Math.round(hex[1]) << 8) + Math.round(hex[2])).toString(16).slice(1);
}

export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if(result){
    const r= parseInt(result[1], 16);
    const g= parseInt(result[2], 16);
    const b= parseInt(result[3], 16);
    return [r, g, b];
  } 
  return null;
}

export const  createFilterList = (filters: any[], validList = <null | string[]>null) => {
  const newFilter = filters.reduce((result, filter) => {
      if (validList && !validList.includes(filter.bimFilter.id)) {
        return result;
      }
      result.push({
          id: filter.bimFilter.id,
          title: filter.bimFilter.filterName,
          color: [filter.bimFilter.colorStyleR, filter.bimFilter.colorStyleG, filter.bimFilter.colorStyleB],
          queryIds: filter.bimFilter.querId,
          handleIds: filter.queryResult,
          isNewFilter: false,
          queryParams: filter.bimFilter.bimQuery.queryParams,
          queryName: filter.bimFilter.bimQuery.queryname,
          queryType: filter.bimFilter.bimQuery.queryType,
          isMaterialUpdated: filter.isMaterialUpdated
      })
      return result
  }, [] as any) 
  return newFilter;
}

export const generateGraphqlModelCondBkp = (queryOptions: any) => {
  const and: string[] = ["{modelId: {_eq: $_eq}}"];
  const or: string[] = [];
  if(queryOptions.length === 1) {
    if(queryOptions[0].type === "spatial"){
      and.push(`{${queryOptions[0].attribute.value}: {${queryOptions[0].attributeOperator.value}: [${queryOptions[0].handleIds.join(",")}]}}`)
    }else{
      and.push(`{${queryOptions[0].attribute.parent}: {${queryOptions[0].attribute.value}: {${queryOptions[0].attributeOperator.value}: "${queryOptions[0].values}"}}}`)
    }
    return `where: { _and: [${and.join(',')}] }`
  } else {
    const promises = queryOptions.map(async (query: any, index: number) => {    
      if(index === 0 && query.type !== "spatial") {
        query.joinOperator = queryOptions[1].joinOperator;
      }
      if(query.type === "spatial"){
        if(query.joinOperator === 'and') {
          and.push(`{${query.attribute.value}: {${query.attributeOperator.value}: [${query.handleIds.join(",")}]}}`)
        } else if(query.joinOperator === 'or') {
          or.push(`{${query.attribute.value}: {${query.attributeOperator.value}: [${query.handleIds.join(",")}]}}`)
        }
      }else{
        if(query.joinOperator === 'and') {
          and.push(`{${query.attribute.parent}: {${query.attribute.value}: {${query.attributeOperator.value}: "${query.values}"}}}`)
        } else if(query.joinOperator === 'or') {
          or.push(`{${query.attribute.parent}: {${query.attribute.value}: {${query.attributeOperator.value}: "${query.values}"}}}`)
        }
      }
      return true;
    })
    return Promise.all(promises).then(()=> {
      if(or.length > 0) {
        and.push(`{ _or: [${or.join(',')}] }`)
      }
      return `where: { _and: [${and.join(',')}] }`
    })
  }
}


export const generateGraphqlModelCond = (queryOptions: any, checkHidden = false) => {
  const and: string[] = ["{modelId: {_in: $_in}}"];
  const or: string[] = [];
  const variable = {}
  
  if(queryOptions.length === 1) {
    queryOptions[0].joinOperator = 'and';
  } 


  const promises = queryOptions.map(async (query: any, index: number) => { 
    if(checkHidden && query.hidden) {
      return true;
    }
    
    if(index === 0 && query.type !== "spatial" && queryOptions.length > 1) {
      query.joinOperator = queryOptions[1].joinOperator;
    }

    if(query.type === "spatial"){
      and.push(`{${query.attribute.value}: {${query.attributeOperator.value}: [${query.handleIds.join(",")}]}}`)
    } else if(query.type === "non_priorty") {
      const nonPrirClause = (query.handleIds) ? `{sourceId: { _in: [${query.handleIds.join(",")}]}}`: generateAttrbuteClause(query, index, variable);
      (query.joinOperator === 'and') ?  and.push(nonPrirClause) : or.push(nonPrirClause);
    } else {
      const caluse = generateAttrbuteClause(query, index, variable);
      (query.joinOperator === 'and') ?  and.push(caluse) : or.push(caluse);
    }

    return true;
  })

  return Promise.all(promises).then(()=> {
    if(or.length > 0) {
      and.push(`{ _or: [${or.join(',')}] }`)
    }
    return [`where: { _and: [${and.join(',')}] }`, variable]
  })

}

function generateAttrbuteClause(query: any, index :number, variable: any ) {
  const values = (query.attributeOperator.value === '_in' || query.attributeOperator.value === '_nin' ) ?
    `["${query.values.map((str: string) => str.replace(/"/g, '\\"')).join('","')}"]` : `"${query.values.replace(/"/g, '\\"')}"`
  if(query.type === "non_priorty") {
    variable["_contains" + index] = JSON.parse(`{"${query.attribute.value}": ${values}}`)
    return `{sourceProperties : {_contains: $_contains${index}}}`
  } else if(query.attribute.parent === "bimElementProperties") {
    return `{${query.attribute.value}: {${query.attributeOperator.value}: ${values}}}`
  } else {
    return `{${query.attribute.parent}: {${query.attribute.value}: {${query.attributeOperator.value}: ${values}}}}`
  }
}

export const findAssmbyElmnt = (elementId: string, modelIds: [string]) => {
  const [modelIdIndex, elmntId] : any = elementId.split("_");
  return [elmntId, modelIds[modelIdIndex]]
}

export async  function iterrateOverElementsAssembly(operFun: any, viewer: any) {
  const numOfModels = viewer.activeView.numModels();
  for (let i = 0; i < numOfModels; i++) {
      const model = viewer.activeView.modelAt(i);
      for (const itr = model.getEntitiesIterator(); !itr.done(); itr.step()) {
        const entityId = itr.getEntity();
        const entity = (entityId.getType() === 1) ? entityId.openObject() : entityId.openObjectAsInsert();
        operFun(entityId, entity, null)
      }
  }
}

export async function iterrateOverElements(operFun: any, viewer: any) {
  const iter = viewer.getCDATreeIterator();
  const tree = iter.getCDATreeStorage().getTree();
  const node = tree.getDatabaseNode();
  const childrens = node.getChildren()

  async function findChildrens(childrens: any): Promise<any> {
      const promises = []
      for (let i = 0; i < childrens.length(); i++) {
          const child = childrens.get(i);
          const entityId = child.getTvEntityId(viewer.activeView);
          const entity = (entityId.getType() === 1) ? entityId.openObject() : entityId.openObjectAsInsert();
          operFun(entityId, entity, child)
          if (child.getChildren().length() > 0) {
              promises.push(findChildrens(child.getChildren()))
          }
      }
      return Promise.all(promises)
  }
  return findChildrens(childrens);
}


const fetchData = async (query: any, variables: any, token: any, role: any, fetchPolicy: any = 'network-only') => {
  let responseData;
  try {
      responseData = await client.query({
          query: query,
          variables: variables,
          fetchPolicy: fetchPolicy,
          context:{role: role, token: token}
      });
      
  } catch(error: any) {
      console.log(error)
  } finally {
      return (responseData?.data) ? responseData.data : null;
  }
}


export async function fetchElementName(token: any, role: any, modelIds: any) {
  return await fetchData(FETCH_BIM_ELEMENT_NAME, {
      "modelIds": modelIds,
  },token, role, 'cache-first').then(levelProp => {
      return levelProp?.bimElementProperties.reduce((elementNames: any, handleDetails: any) => {
          elementNames[handleDetails.sourceId] = `${handleDetails.bimFamilyProperty?.familyName || ''} - ${handleDetails.bimFamilyProperty?.type || ''}(${handleDetails.sourceId})`;
          return elementNames; 
      }, {})
  });
}