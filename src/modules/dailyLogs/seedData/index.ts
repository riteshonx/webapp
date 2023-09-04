import { DailyLogReducerState } from "../reducer/DailyLogReducer";

export const initialDailyLogReducerState: DailyLogReducerState = {
  listView: {
    pagination: { page: 1, limit: 10 },
    totalRecords: 0,
    filters: {
      filterList: {
        User: {
          options: [],
        },
        Date: {
          options: [],
        },
      },
      triggerFetch: true,
    },
  },
  formId: -1,
  globalDailyLogId: 0,
  featureId: 1,
  customList: [],
  constraintList: [],
};

export const dummyData = {
  data: {
    forms: [
      {
        createdAt: "2022-05-20T14:28:22.760137+00:00",
        createdByUser: {
          firstName: "Admin",
          lastName: null,
        },
      },
      {
        createdAt: "2022-05-21T14:28:22.760137+00:00",
        createdByUser: {
          firstName: "Admin Vishakha",
          lastName: null,
        },
      },
      {
        createdAt: "2022-05-22T14:28:22.760137+00:00",
        createdByUser: {
          firstName: "Sudarshan K J",
          lastName: null,
        },
      },
    ],
  },
};
