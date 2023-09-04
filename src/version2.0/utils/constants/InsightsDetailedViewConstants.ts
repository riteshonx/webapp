export const DETAILEDVIEW_INSIGHTSTAB = {
	MYFEEDS: 'MYFEEDS',
	PINNED: 'PINNED',
	LESSONS: 'LESSONS',
	SCHEDULEDINSIGHTS: 'SCHEDULEDINSIGHTS',
	SCHEDULEDSTANDARD: 'SCHEDULEDSTANDARD',
};
export interface detailedInsight {
	id: number;
	heading: string;
	body: string;
}
export const insightsDetailData: detailedInsight[] = [
	{
		id: 0,
		heading: 'Exterior Painting at on Floor 2 might be delayed due to',
		body: 'Rain forecasted on Feb 15,16 (day 3 and 4)Per daily log, has not started and is delayed by 2 days already',
	},
	{
		id: 1,
		heading: 'Exterior Painting at on Floor 2 might be delayed due to',
		body: 'Rain forecasted on Feb 15,16 (day 3 and 4)Per daily log, has not started and is delayed by 2 days already',
	},
	{
		id: 2,
		heading: 'Exterior Painting at on Floor 2 might be delayed due to',
		body: 'Rain forecasted on Feb 15,16 (day 3 and 4)Per daily log, has not started and is delayed by 2 days already',
	},
];
