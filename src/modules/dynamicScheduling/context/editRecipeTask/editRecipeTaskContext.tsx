import { createContext } from 'react';

type EditRecipeTaskContext = {
  parentTasks: any;
  currentTaskMaterial: any;
  tenantMaterials: any;

  clearEditRecipeTaskState: () => any;
  updateParentTaskList: (id: any) => any;
  addBulkMaterialToRecipeTask: (material: any) => any;
  getRecipeTaskMaterial: (taskId: any) => any;
  deleteRecipeTaskMaterial: (id: any) => any;
  updateRecipeTaskMaterial: (material: any) => any;
  getTenantMaterials: () => any;
  clearTenantMaterials: () => any;
};

const editRecipeTaskContextDefaultValue: EditRecipeTaskContext = {
  parentTasks: [],
  currentTaskMaterial: [],
  tenantMaterials: null,

  clearEditRecipeTaskState: () => {
    //   do nothing
  },

  updateParentTaskList: (id: any) => {
    //    do nothing
  },

  addBulkMaterialToRecipeTask: (material: any) => {
    //  do nothing
  },
  getRecipeTaskMaterial: (taskId: any) => {
    //  do nothing
  },
  deleteRecipeTaskMaterial: (id: any) => {
    // do nothing
  },
  updateRecipeTaskMaterial: (material: any) => {
    // do nothing
  },
  getTenantMaterials: () => {
    //  do nothing
  },

  clearTenantMaterials: () => {
    //  do nothing
  },
};

const editRecipeTaskContext = createContext<EditRecipeTaskContext>(
  editRecipeTaskContextDefaultValue
);

export default editRecipeTaskContext;
