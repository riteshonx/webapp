export const LESSONS_LEARNED_STATUS_NEW = 'New';
export const LESSONS_LEARNED_STATUS_IGNORED = 'Ignored';
export const LESSONS_LEARNED_STATUS_SHARED = 'Shared';
export const LESSONS_LEARNED_STATUS_ACTED = 'Acted';
export const LESSONS_LEARNED_STATUS_DELETED = 'Deleted';

export interface IScheduleTableObject {
  title: string;
  key: string;
  hasLink: boolean;
  id: string;
  width: string;
  externalId: string | number;
}

export interface IScheduleTable {
  [key: string]: Array<IScheduleTableObject>;
}

export const SCHEDULE_TASK_TABLE = {
  Tasks_With_Missing_Relationships: [
    {
      externalId: 'externalId',
      title: 'Activity Name',
      key: 'Activity Name',
      hasLink: true,
      id: 'id',
    },
    {
      title: 'Activity Type',
      key: 'Activity Type',
    },
    {
      title: 'External Id',
      key: 'externalId',
    },
  ],
  Relationships_Lead_Lag_LT_30days: [
    {
      externalId: 'externalId_predecessor',
      title: 'Preceding Task',
      key: 'Preceeding task',
      hasLink: true,
      id: 'id_predecessor',
    },
    {
      externalId: 'externalId_successor',
      title: 'Succeeding Task',
      key: 'Succeeding task',
      hasLink: true,
      id: 'id_sucessor',
    },
    {
      title: 'Lag/Lead',
      key: 'Lag/Lead',
    },
  ],
  Relationship_Leads_EQ_0: [
    {
      externalId: 'externalId_predecessor',
      title: 'Preceding Task',
      key: 'Preceeding task',
      hasLink: true,
      id: 'id_predecessor',
    },
    {
      externalId: 'externalId_successor',
      title: 'Succeeding Task',
      key: 'Succeeding task',
      hasLink: true,
      id: 'id_sucessor',
    },
    {
      title: 'Lead',
      key: 'Lead',
    },
  ],
  Relationship_Lags_Total_LT_1: [
    {
      externalId: 'externalId_predecessor',
      title: 'Preceding Task',
      key: 'Preceeding task',
      hasLink: true,
      id: 'id_predecessor',
    },
    {
      externalId: 'externalId_successor',
      title: 'Succeeding Task',
      key: 'Succeeding task',
      hasLink: true,
      id: 'id_sucessor',
    },
    {
      title: 'Lag',
      key: 'Lag',
    },
  ],
  Relationships_Lags_LT_5: [
    {
      externalId: 'externalId_predecessor',
      title: 'Preceding Task',
      key: 'Preceeding task',
      hasLink: true,
      id: 'id_predecessor',
    },
    {
      externalId: 'externalId_successor',
      title: 'Succeeding Task',
      key: 'Succeeding task',
      hasLink: true,
      id: 'id_sucessor',
    },
    {
      title: 'Lag',
      key: 'Lag',
    },
  ],
  Relationship_FS_GT_90: [
    {
      externalId: 'externalId_predecessor',
      title: 'Preceding Task',
      key: 'Preceeding task',
      hasLink: true,
      id: 'id_predecessor',
    },
    {
      externalId: 'externalId_successor',
      title: 'Succeeding Task',
      key: 'Succeeding task',
      hasLink: true,
      id: 'id_sucessor',
    },
    {
      title: 'Relationship Type',
      key: 'Relationship Type',
    },
  ],
  Same_Recipe_Varying_Duration: [
    {
      externalId: 'externalId',
      title: 'Activity 1 Name',
      key: 'Activity 1 Name',
      hasLink: true,
      id: 'Id1',
    },
    {
      title: 'Activity 2 Name',
      key: 'Activity 2 Name',
      hasLink: true,
      id: 'Id2',
    },
    {
      title: 'Variation',
      key: 'Variation',
    },
  ],
  High_Duration_Tasks: [
    {
      externalId: 'externalId',
      title: 'Activity Name',
      key: 'Activity Name',
      hasLink: true,
      id: 'id',
    },
    {
      title: 'Duration',
      key: 'Duration',
    },
  ],
  Task_Float_LT_44Days: [
    {
      externalId: 'externalId',
      title: 'Activity Name',
      key: 'Activity Name',
      hasLink: true,
      id: 'id',
    },
    {
      title: 'Float',
      key: 'Float',
    },
  ],
  Task_Float_GT_44Days_LT_5: [
    {
      externalId: 'externalId',
      title: 'Activity Name',
      key: 'Activity Name',
      hasLink: true,
      id: 'id',
    },
    {
      title: 'Float',
      key: 'Float',
    },
  ],
  Task_Duration_GT_10days: [
    {
      externalId: 'externalId',
      title: 'Activity Name',
      key: 'Activity Name',
      hasLink: true,
      id: 'id',
    },
    {
      title: 'Duration',
      key: 'Duration',
    },
  ],
} as unknown as IScheduleTable;
