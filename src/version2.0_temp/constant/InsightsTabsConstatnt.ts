export const INSIGHTS_TAB = {
  INSIGHTS: 'INSIGHTS',
  PINNED_ITEMS: 'PINNED_ITEMS',
};

export interface Insight {
  id: number;
  content: string;
  title: string;
  subTitle: string;
  description: string;
  actions: string;
  pinned: boolean;
  descriptionLabel: string;
  actionLabel: string;
}

export interface Feed {
    id: number;
    content: string;
    title: string;
    subTitle: string;
    description: string;
    actions: string;
    pinned: boolean;
    descriptionLabel: string;
    actionLabel: string;
  }

// Insights Mock Data Needs to be delete later when Actual Insights come in

export const insightsArray: Insight[] = [
  {
    id: 0,
    content: 'Insight 1 displaying',
    title: 'Insight 1',
    subTitle: 'sub title of Insight 1',
    descriptionLabel: 'Recomendations',
    actionLabel: 'Actions',
    description:
      'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum',
    actions: 'Remind me | Enforce Changes |',
    pinned: false,
  },
  {
    id: 1,
    content: 'Insight 2 displaying',
    title: 'Insight 2',
    subTitle: 'sub title of Insight 2',
    descriptionLabel: 'Recomendations',
    actionLabel: 'Actions',
    description:
      'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum',
    actions: 'Remind me | Enforce Changes |',
    pinned: false,
  },
  {
    id: 2,
    content: 'Insight 3 displaying',
    title: 'feed 3',
    subTitle: 'sub title of Insight 3',
    descriptionLabel: 'Recomendations',
    actionLabel: 'Actions',
    description:
      'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum',
    actions: 'Remind me | Enforce Changes |',
    pinned: false,
  },
  {
    id: 3,
    content: 'Insight 4 displaying',
    title: 'Insight 4',
    subTitle: 'sub title of Insight 4',
    descriptionLabel: 'Recomendations',
    actionLabel: 'Actions',
    description:
      'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum',
    actions: 'Remind me | Enforce Changes |',
    pinned: false,
  },
  {
    id: 4,
    content: 'Insight 5 displaying',
    title: 'feed 5',
    subTitle: 'sub title of Insight 5',
    descriptionLabel: 'Recomendations',
    actionLabel: 'Actions',
    description:
      'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum',
    actions: 'Remind me | Enforce Changes |',
    pinned: false,
  },
];


export const feedsArray: Feed[] = [
    {
      id: 0,
      content: 'feeds 1 displaying',
      title: 'feed 1',
      subTitle: 'sub title of feed 1',
      descriptionLabel: 'Recomendations',
      actionLabel: 'Actions',
      description:
        'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum',
      actions: 'Remind me | Enforce Changes |',
      pinned: false,
    },
    {
      id: 1,
      content: 'feeds 2 displaying',
      title: 'feed 2',
      subTitle: 'sub title of feed 2',
      descriptionLabel: 'Recomendations',
      actionLabel: 'Actions',
      description:
        'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum',
      actions: 'Remind me | Enforce Changes |',
      pinned: false,
    },
    {
      id: 2,
      content: 'feeds 3 displaying',
      title: 'feed 3',
      subTitle: 'sub title of feed 3',
      descriptionLabel: 'Recomendations',
      actionLabel: 'Actions',
      description:
        'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum',
      actions: 'Remind me | Enforce Changes |',
      pinned: false,
    },
    {
      id: 3,
      content: 'feeds 4 displaying',
      title: 'feed 4',
      subTitle: 'sub title of feed 4',
      descriptionLabel: 'Recomendations',
      actionLabel: 'Actions',
      description:
        'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum',
      actions: 'Remind me | Enforce Changes |',
      pinned: false,
    },
    {
      id: 4,
      content: 'feeds 5 displaying',
      title: 'feed 5',
      subTitle: 'sub title of feed 5',
      descriptionLabel: 'Recomendations',
      actionLabel: 'Actions',
      description:
        'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum',
      actions: 'Remind me | Enforce Changes |',
      pinned: false,
    },
  ];