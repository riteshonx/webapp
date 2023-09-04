export interface RfiInfo {
	subjectLabel:string,
	subjectValue:string,
	statusLabel:string,
	statusValue:string,
	rfiTypeLabel:string,
	rfiTypeValue:string,
	responsibleContractorLabel:string,
	responsibleContractorValue:string,
	scheduleImpactLabel:string,
	scheduleImpactValue:any,
	costImpactLabel:string,
	costImpactValue:any,
	dueDateLabel:string,
	dueDateValue:string,
	assigneeLabel:string,
	assigneeValue:string,
	formTaskLinks:any,
	attachmentList:any,
  }

export  const RfiFormField ={
	subjectLabel: '',
	subjectValue: '',
	statusLabel: '',
	statusValue: '',
	rfiTypeLabel: '',
	rfiTypeValue: '',
	responsibleContractorLabel: '',
	responsibleContractorValue: '',
	scheduleImpactLabel: '',
	scheduleImpactValue: '',
	costImpactLabel: '',
	costImpactValue: '',
	dueDateLabel: '',
	dueDateValue: '',
	assigneeLabel: '',
	assigneeValue: '',
	formTaskLinks:[],
	attachmentList:[],
}