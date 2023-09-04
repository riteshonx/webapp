import { SmartProjectSite } from 'location-intelligence-viewer';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import './formSections.scss';
import { FormTemplateSelector } from './formTemplateSelector';
import { FormTabs } from 'src/version2.0_temp/components/visualize/visualizeSideBar/Components/formSections/formTabs';
import { ProjectTreeAndSmartObjectNodeMap } from 'src/modules/visualize/VisualizeView/models/projectTreeAndSmartObjectNodeMap';
import { LocationFormStatusFilters } from 'src/modules/visualize/VisualizeView/components/LocationTreeFormStatus/LocationFormStatusFilters';
import { SmartNodes } from 'src/modules/visualize/VisualizeView/models/SmartNodes';
import { LocationTree } from 'src/modules/visualize/VisualizeView/models/locationTree';
import { Form } from 'src/modules/visualize/VisualizeView/models/form';
import { FormType } from 'src/modules/visualize/VisualizeView/models/formType';
import { FilteredForms } from 'src/modules/visualize/VisualizeView/components/Forms/filteredForms';
import { SortedForms } from 'src/modules/visualize/VisualizeView/components/Forms/sortedForms';
import { useProjectId } from 'src/modules/visualize/VisualizeView/hooks/useProjectId';
import { useForms } from 'src/modules/visualize/VisualizeView/hooks/useForms';
import { useBimFeatureTypes } from 'src/modules/visualize/VisualizeView/components/Forms/useBimFeatureTypes';
import { useFeatureTypeGroupingWhiteList } from 'src/modules/visualize/VisualizeView/components/Forms/groupingWhiteList/useFeatureTypeGroupingWhiteList';
import { useDataMode } from 'src/modules/visualize/VisualizeView/utils/DataMode';
import { useAnalytics } from 'src/modules/visualize/VisualizeView/utils/analytics';
import { FormDetail } from './formDetailPage';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { useAssigneeTypes } from 'src/modules/visualize/VisualizeView/components/Forms/useAssigneeTypes';
import { useFeatureTypes as useFeatureTemplates } from 'src/modules/visualize/VisualizeView/components/Forms/useFeatureTypes';
import { useModelStatusColors } from 'src/modules/visualize/VisualizeView/hooks/useModelStatusColors';
import { IssueTypes, useIssueTypes } from 'src/modules/visualize/VisualizeView/components/Forms/useIssueTypes';

interface FormSectionsProps {
  projectLocationTree: LocationTree | undefined;
  projectSite: SmartProjectSite | undefined;
  selectedMapNode: SmartNodes | undefined;
  formStatusFilter: LocationFormStatusFilters[];
  formSearchKey: string;
  projectTreeAndSmartNodeMap: ProjectTreeAndSmartObjectNodeMap;
  selectedForm: Form;
  setSelectedForm: (form?: Form) => void;
  onActiveTemplateChanged: () => void;
  onBackButtonClick: () => void;
  onUpdateSelectedRoomLabel: () => void;
}

export const FormSections = ({ projectLocationTree, projectSite, selectedMapNode, formSearchKey, formStatusFilter, projectTreeAndSmartNodeMap, selectedForm, setSelectedForm, onActiveTemplateChanged, onBackButtonClick, onUpdateSelectedRoomLabel }: FormSectionsProps): React.ReactElement => {
  const { dispatch, state }: any = useContext(stateContext);
  const { dataMode } = useDataMode();
  const {track} = useAnalytics();
  const projectId = useProjectId();
  const { forms, formsLoading } = useForms(projectSite!);
  const [selectedFormTypes, setSelectedFormTypes] = useState<FormType[]>([]);
  const [selectedFormTemplate, setSelectedFormTemplate] = useState<FormType[]>([]);
  const [selectedAssigneToFormTypes, setSelectedAssigneToFormTypes] = useState<string[]>([]);
  const [selectedIssueTypes, setSelectedIssueTypes] = useState<string[]>([]);

  const _templateTypes: FormType[] = useFeatureTemplates();
  const filteredForms = useMemo(() => new FilteredForms(forms!, selectedFormTemplate!, selectedFormTypes!, selectedAssigneToFormTypes!, selectedIssueTypes!,  selectedMapNode!, projectTreeAndSmartNodeMap, formStatusFilter, formSearchKey, dataMode).value, [forms, selectedFormTemplate, selectedFormTypes, selectedAssigneToFormTypes, selectedMapNode, projectTreeAndSmartNodeMap, formStatusFilter, formSearchKey, dataMode, selectedIssueTypes]);
  const sortedFilteredForms = useMemo(() => new SortedForms(filteredForms, projectLocationTree!, selectedMapNode).value, [filteredForms, projectLocationTree]);
  const _bimFeatureTypes = useBimFeatureTypes(forms!, _templateTypes!);
  const _assignedToTypes: Map<string, string[]> = useAssigneeTypes(forms!, _templateTypes!);
  const _issueTypes: IssueTypes[] = useIssueTypes(forms!, _templateTypes!);

  const featureTypes = useMemo(() => {
    setSelectedFormTypes([])
    const featureTypes = _bimFeatureTypes || [];
    featureTypes.sort((featureTypeA, featureTypeB) => featureTypeA.formType.localeCompare(featureTypeB.formType));
    return featureTypes;
  }, [_bimFeatureTypes]);

  const featureTypeGroups = useFeatureTypeGroupingWhiteList(featureTypes);
  const featureTypeTasks = useMemo(() => featureTypeGroups.map((group) => group.featureTypeTasks).flat(), [featureTypeGroups]);

  const noFormTypesSelected = useMemo(() => !Boolean((selectedFormTypes?.length && (dataMode === 'All' || dataMode === 'Checklist')) || ((selectedAssigneToFormTypes.length || selectedIssueTypes.length) && (dataMode === 'All' || dataMode === 'Issues'))), [selectedAssigneToFormTypes, selectedFormTypes, dataMode, selectedIssueTypes]);
  const doFormsExistForAnyFeatureType = useMemo(() => {
    return Boolean(selectedFormTypes?.find((featureType) => {
      const hasExistingForm = Boolean(forms?.find((form) => (form.sourceTemplateId || form.bimTemplateId || form.featureId) === featureType.formTypeId));
      return hasExistingForm;
    }));
  }, [forms, selectedFormTypes]);

  const formsWithLocation = useMemo(() => sortedFilteredForms.filter((form) => form.isLinkedToLocation), [sortedFilteredForms]);
  const formsWithOutLocation = useMemo(() => sortedFilteredForms.filter((form) => !form.isLinkedToLocation), [sortedFilteredForms]);

  useModelStatusColors(forms, projectTreeAndSmartNodeMap!, projectLocationTree!, projectSite!, formStatusFilter, selectedMapNode!, selectedFormTypes!, selectedForm!, featureTypeTasks!, selectedFormTemplate!, selectedAssigneToFormTypes, selectedIssueTypes, onUpdateSelectedRoomLabel);

  useEffect(() => {
    dispatch(setIsLoading(formsLoading));
  }, [formsLoading, state.isLoading]);

  function _setSelectedFormTypes(formTypes: FormType[]) {
    setSelectedFormTypes(formTypes);
  }

  function _setSelectedFormTemplate(formTypes: FormType[]) {
    setSelectedFormTemplate(formTypes);
    onActiveTemplateChanged();
  }

  function _setSelectedAssigneToFormTypes(assigneeTypes: string[]) {
    setSelectedAssigneToFormTypes(assigneeTypes);
  }

  function _setSelectedIssueTypes(assigneeTypes: string[]) {
    setSelectedIssueTypes(assigneeTypes);
  }

  function onFormClick(form: Form) {
    setSelectedForm(form);

    track('Form-Selected', {
      name: form.subject,
      featureType: form.featureName,
      formId: form.formId,
      slateFormId: form.slateFormId,
      featureTypeId: form.featureId,
      projectId: projectId,
    });
  }

  function _onBackButtonClick() {
    onBackButtonClick();
    setSelectedForm(undefined);
  }

  return (
    <div className="v2-visualize-formsection">
      <div className="v2-visualize-formsection-header">
        <FormTemplateSelector templateTypes={_templateTypes} setSelectedFormTemplate={_setSelectedFormTemplate} />
      </div>
      <div className="v2-visualize-formsection-content">
        <FormTabs
          formTypeGroups={dataMode || dataMode !== undefined ? featureTypeGroups : undefined}
          setSelectedFormTypes={_setSelectedFormTypes}
          assignedToTypes={_assignedToTypes}
          issueTypes={_issueTypes}
          setSelectedAssigneToFormTypes={_setSelectedAssigneToFormTypes}
          setSelectedIssueTypes={_setSelectedIssueTypes}
          loading={formsLoading}
          noFormTypesSelected={noFormTypesSelected}
          formsWithLocation={formsWithLocation}
          formsWithOutLocation={formsWithOutLocation}
          selectedMapNode={selectedMapNode!}
          doFormsExistForAnyFeatureType={doFormsExistForAnyFeatureType}
          onFormClick={onFormClick}
          selectedFormTemplate={selectedFormTemplate}
          selectedForm={selectedForm}
        />
        {
          Boolean(selectedForm) && <FormDetail form={selectedForm!} onBackButtonClick={_onBackButtonClick} />
        }
      </div>
    </div>
  );
};