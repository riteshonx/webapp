// Constants with values

export const LandingPageLinks: LandingPageLinksType[] = [
  { label: 'Projects', subLabel: 'Analysis & Insights', path: '/v2'},
  { label: 'Insights', subLabel: 'Recommendation Simulation', path: '/v2/insights'},
  { label: 'Schedule', subLabel: 'Progress, Schedule & Planning', path: '/'}
]

// Below are declared types for constants used above

export interface LandingPageLinksType {
  label: string;
  subLabel: string;
  path: string;
}