import { Tab } from '@material-ui/core';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import React, { useEffect } from 'react';
import { FormTypeGroup } from 'src/modules/visualize/VisualizeView/components/Forms/groupingWhiteList/FormTypeGroup';
import { Form } from 'src/modules/visualize/VisualizeView/models/form';
import { FormType } from 'src/modules/visualize/VisualizeView/models/formType';
import { SmartNodes } from 'src/modules/visualize/VisualizeView/models/SmartNodes';
import { useDataMode } from 'src/modules/visualize/VisualizeView/utils/DataMode';
import { SyncInfo } from '../../../visualizeHeader/components/syncInfo';
import { FormList } from './formList';
import { FormAllTypeSelector } from './formAllTypeSelector';
import { IssueTypes } from 'src/modules/visualize/VisualizeView/components/Forms/useIssueTypes';

interface FormTabsProps {
	formTypeGroups?: FormTypeGroup[];
	setSelectedFormTypes: (selcetedFormTypes: FormType[]) => void;
	assignedToTypes: Map<string, string[]>;
	issueTypes: IssueTypes[];
	setSelectedAssigneToFormTypes: (selcetedAssigneToFormTypes: string[]) => void;
	setSelectedIssueTypes: (selectedIssueTypes: string[]) => void;
	formsWithLocation: Form[];
	formsWithOutLocation: Form[];
	selectedMapNode: SmartNodes;
	loading: boolean;
	onFormClick: (form: Form) => void;
	noFormTypesSelected: boolean;
	doFormsExistForAnyFeatureType: boolean;
	selectedFormTemplate: FormType[];
	selectedForm: Form;
}

export const FormTabs = ({ formTypeGroups, setSelectedFormTypes, selectedFormTemplate, formsWithLocation, formsWithOutLocation, selectedMapNode, doFormsExistForAnyFeatureType, loading, onFormClick, noFormTypesSelected, assignedToTypes, setSelectedAssigneToFormTypes, issueTypes, setSelectedIssueTypes, selectedForm}: FormTabsProps): React.ReactElement => {
	const { dataMode } = useDataMode();
	const bim360Mode = dataMode === 'BIM360' || dataMode === 'Checklist';
	const [value, setValue] = React.useState('1');

	useEffect(()=> {
		selectedMapNode && setValue('1')
	}, [selectedMapNode])

	const handleChange = (event: React.SyntheticEvent<any>, newValue: string) => {
		setValue(newValue);
	};

	return (
		<div className={!selectedForm ? "v2-visualize-formTabs" : "v2-visualize-formTabs-hide"}>
			<TabContext value={value}>
				<TabList onChange={handleChange} variant="fullWidth">
					<Tab label={`Has Location (${formsWithLocation.length})`} value="1" tabIndex={0} />
					<Tab label={`No Location (${formsWithOutLocation.length})`} value="2" tabIndex={0} />
				</TabList>
				<SyncInfo selectedFormTemplate={selectedFormTemplate}/>
				<FormAllTypeSelector 
					formTypeGroups={formTypeGroups}
					setSelectedFormTypes={setSelectedFormTypes}
					assignedToTypes={assignedToTypes}
					setSelectedAssigneToFormTypes={setSelectedAssigneToFormTypes}
					issueTypes={issueTypes}
					setSelectedIssueTypes={setSelectedIssueTypes}
				/>
				<TabPanel value="1" className={bim360Mode ? '' : 'issue-tab' }>
					<FormList
						loading={loading}
						noFormTypesSelected={noFormTypesSelected}
						forms={formsWithLocation}
						selectedMapNode={selectedMapNode}
						doFormsExistForAnyFeatureType={doFormsExistForAnyFeatureType}
						onFormClick={onFormClick}
					/>
				</TabPanel>
				<TabPanel value="2" className={bim360Mode ? '' : 'issue-tab' }>
					<FormList
						loading={loading}
						noFormTypesSelected={noFormTypesSelected}
						forms={formsWithOutLocation}
						doFormsExistForAnyFeatureType={doFormsExistForAnyFeatureType}
						onFormClick={onFormClick}
					/>
				</TabPanel>
			</TabContext>
		</div>
	);
};