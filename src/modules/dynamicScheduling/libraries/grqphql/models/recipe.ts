export interface RecipeListItem {
  id: number;
  createdBy: string;
  recipeName: string;
  recipeType: string;
  description: string;
  duration: number;
  updatedBy: string;
  projects: any;
  createdByUserFullName: string;
}

export abstract class RecipeLibrary {
  static modelName = 'scheduleRecipeSet';
  static selector = {
    duration: 'duration',
    recipeName: 'recipeName',
    recipeType: 'recipeType',
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
