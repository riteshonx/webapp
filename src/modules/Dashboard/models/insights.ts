export interface IDetails {
	formId: string;
	datasource: string;
	materialId: string;
	dataSourceId: number;
	datasourceMsg: string;
	dataSourceName: string;
	forecastedDelay: number;
	subject: string;
}
export interface IInsight {
	id: number;
	messagesShortWeb: {
		msg: string;
	};
	messagesLongWeb: {
		msg: string;
		details: Array<IDetails>;
	};
}

export const DATA_SOURCE = {
	RFI_FORMS: 'RFI',
	BUDGET_CHANGE_ORDER_FORMS: 'ChangeOrders',
	ISSUE_FORMS: 'Issues',
	QC_CHECKLIST: 'Checklist',
	PROCORE_RFI:'PROCORE_RFI',
	PM4_RFI:'PM4_RFI',
	BIM360_RFI:'BIM360_RFI'
};
