export const projectType = [
  { id: 1, type: 'Commercial' },
  { id: 2, type: 'Residential' },
  { id: 3, type: 'Government' },
  { id: 4, type: 'Infrastructure' },
  { id: 5, type: 'Institutional' },
];

export const projectStage = [
  { id: 1, stage: 'Pre-construction' },
  { id: 2, stage: 'Post-Construction' },
  { id: 3, stage: 'Construction' },
];

export const projectTemprature = [
  { id: 1, temp: 'Celsius' },
  { id: 2, temp: 'Fahrenheit' },
];

export const projectMeasurement = [
  { id: 1, measurement: 'Imperial' },
  { id: 2, measurement: 'Metrics' },
];

export const projectCurrency = [
  { id: 1, currency: 'INR' },
  { id: 2, currency: 'USD' },
  { id: 3, currency: 'GBP' },
];

export const projectTrades = [
  { id: 1, trades: 'Electrician' },
  { id: 2, trades: 'General Contractor' },
  { id: 3, trades: 'Heavy Equipment Operator' },
  { id: 4, trades: 'HVAC Technician' },
  { id: 5, trades: 'Landscaper' },
  { id: 6, trades: 'Mason' },
  { id: 7, trades: 'Painter' },
];

export const navSettings: Array<any> = [
  {
    name: 'Details',
    isActive: false,
    isHover: false,
    route: 'details',
  },
  {
    name: 'Teams',
    isActive: false,
    isHover: false,
    route: 'teams',
  },
  {
    name: 'Form Association',
    isActive: false,
    isHover: false,
    route: 'form-association',
  },
  {
    name: 'Location Management',
    isActive: false,
    isHover: false,
    route: 'location-management',
  },
  {
    name: 'Custom List',
    isActive: false,
    isHover: false,
    route: 'custom-lists',
  },
  {
    name: 'User Group Setup',
    isActive: true,
    isHover: false,
    route: 'user-groups',
  },
  {
    name: 'Calendar Association',
    isActive: false,
    isHover: false,
    route: 'calendar-association',
  },
  {
    name: 'Project Material Master',
    isActive: false,
    isHover: false,
    route: 'project-material',
  },
  // {
  //   name: 'Project Association',
  //   isActive: false,
  //   isHover: false,
  //   route: 'project-association'
  // },
  {
    name: 'Project Equipment Master',
    isActive: false,
    isHover: false,
    route: 'project-equipment',
  },
  {
    name: 'Insights Settings',
    isActive: false,
    isHover: false,
    route: 'insights-settings',
  },
  {
    name: 'Classification Code',
    isActive: false,
    isHover: false,
    route: 'classification-code',
  },
  {
    name: 'Project Budget',
    isActive: false,
    isHover: false,
    route: 'project-budget',
  },
  {
    name: 'Change Order',
    isActive: false,
    isHover: false,
    route: 'change-order',
  },
];
