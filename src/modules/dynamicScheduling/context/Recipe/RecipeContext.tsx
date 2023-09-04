import { createContext } from "react";

type RecipeContextInterface = {
    recipeDetails: any;
    currentTask: any;
    recipePlan: any;
    deletedTaskIds: any;
    recipeMetaData: any;
    cacheTasks: any;
    navigatingStatus: any;
    setRecipeDetails: (recipe: any) => any;
    setCurrentTask: (recipe: any) => any;
   // setRecipeTask: (recipe: any) => any;

    getRecipePlan: ( recipeSetId: any) => any;
    saveRecipePlan: (tasks: any, userId: any, recipeSetId: any, recipeName: any, description: any, recipeType: any) => any;
    refreshRecipePlan: (data: any) => any;
    getRecipeMetaData: (id: any) => any;
    deleteRecipeSet: (id: any) => any;
    editRecipeMetaData: (status: string, userId: string, id: any, recipeName?: any, description?: any, recipeType?: any) => any;
    setNavigatingBack: (status: boolean) => any;
    deleteTasks: (ids: any) => any;
};

const recipeContextDefaultValues: RecipeContextInterface = {
    recipeDetails: null,
    currentTask: null,
    recipePlan: {},
    recipeMetaData: {},
    cacheTasks: {},
    deletedTaskIds: [],
    navigatingStatus: false,
    setRecipeDetails: () => {
      // do nothing.
    },

    setCurrentTask: () => {
      // do nothing.
    },
    deleteRecipeSet: () => {
      // do nothing.
    },
    // deleteRecipeSet: () => {
    //   // do nothing.
    // },

    getRecipePlan: () => {
      // do nothing.
    },

    saveRecipePlan: () => {
      // do nothing.
    },

    refreshRecipePlan: () => {
      // do nothing.
    },

    getRecipeMetaData: () => {
      // do nothing.
    },

    editRecipeMetaData: () => {
      // do nothing.
    },
    setNavigatingBack: () => {
      // do nothing.
    },
    deleteTasks: () => {
      // do nothing.
    },
};
  
const RecipeDetailsContext = createContext<RecipeContextInterface>(
    recipeContextDefaultValues
);
  

export default RecipeDetailsContext;
