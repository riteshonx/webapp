export abstract class FieldTypes {
    static modelName = 'fieldTypes';
    static selector = {
      id: 'id',
      fieldType: 'fieldType',
      dataType: 'dataType',
      caption:'caption',
      enabled:'enabled'
    };
    static relation= {
     
    };
  }