import { createContext } from "react";
export interface ImportRecipe {
    id: number;
    name: string;
    recipeType: string;
    tasktype: string;
    isOpen: boolean;
    nodeId: string;
    duration?: number;
    childnodes:Array<ImportRecipe>;
    recipeSetId: number;
    startDate: string;
  }
  export const RecipeContext = createContext({});