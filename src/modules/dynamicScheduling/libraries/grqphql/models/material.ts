export interface MaterialListItem {
  id: number;
  category: string;
  customColumns: null;
  materialGroup: string;
  materialId: string;
  materialName: string;
  materialType: string;
  supplier: Array<any>;
  unit: string;
  quantityRequired: number;
  quantityAvailable: number;
  quantityAllocated: number;
  quantityConsumed: number;
  color: string;
  carbonCategory?: CarbonCategory;
}

export interface CarbonCategoryList {
  carbonCategory: Array<CarbonCategory>
}

export interface CarbonCategory {
  id: number,
  unit: string,
  name: string,
  description: string,
  baselineValue: number
}
  
  export abstract class MaterialLibrary {
    static modelName = 'scheduleMaterialSet';
    static selector = {
      duration: 'duration',
      materialName: 'materialName',
      materialType: 'materialType',
      customId: 'customId',
      classification: 'classification',
      description: 'description',
      tag: 'tag',
      id: 'id',
      createdBy: 'createdBy',
      createdAt: 'createdAt',
      updatedBy: 'updatedBy',
      tenantAssociation: 'tenantAssociation',
      user: 'user',
      firstName: 'firstName',
      lastName: 'lastName',
      userId: 'id'
    };
    static relation = {
    };
  }
  