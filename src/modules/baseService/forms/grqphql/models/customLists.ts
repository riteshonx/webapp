export abstract class ConfigurationLists {
    static modelName = 'configurationLists';
    static selector = {
      id: 'id',
      name: 'name',
      dataType: 'dataType'
    }  
}

export abstract class ConfigurationValues {
    static modelName = 'configurationValues';
    static selector = {
      id: 'id',
      configListId: 'configListId',
      nodeName : 'nodeName',
      parentId: 'parentId'
    };
}