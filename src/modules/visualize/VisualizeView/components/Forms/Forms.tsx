import { MenuItem, Select } from '@material-ui/core';
import { makeStyles } from '@mui/styles';
import { SmartProjectSite } from 'location-intelligence-viewer';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LocationIntelligenceRouteParams } from 'src/modules/visualize/VisualizeRouting';

import { useForms } from '../../hooks/useForms';
import { Form } from '../../models/form';
import { FormType } from '../../models/formType';
import { LocationTree } from '../../models/locationTree';
import { ProjectTreeAndSmartObjectNodeMap } from '../../models/projectTreeAndSmartObjectNodeMap';
import { SmartNodes } from '../../models/SmartNodes';
import { useAnalytics } from '../../utils/analytics';
import { useDataMode } from '../../utils/DataMode';
import { LocationFormStatusFilters } from '../LocationTreeFormStatus/LocationFormStatusFilters';
import { FilteredForms } from './filteredForms';
import { FormDetail } from './FormDetail';
import { FormLists } from './FormLists';
import { FormSyncStatusMessage, useFormSyncStatus } from './FormSyncStatus';
import { FormTypeSelector } from './FormTypeSelector';
import { FormTypeGroup } from './groupingWhiteList/FormTypeGroup';
import { useFeatureTypeGroupingWhiteList } from './groupingWhiteList/useFeatureTypeGroupingWhiteList';
import { SortedForms } from './sortedForms';
import { useBimFeatureTypes } from './useBimFeatureTypes';
import { useFeatureTypes } from './useFeatureTypes';
import { useMissingFormTypes } from './useMissingFormTypes';

const oldDataAgeInHours = 12;

const formTypeSelectorHeight = 78;
const syncDetailsHeight = 50;

const msToHours = 36e5;

interface StylesProps {
    hasFormSyncStatus: boolean,
}

const useStyles = makeStyles(({
    forms: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },

    formListsContainer: {
        height: ({hasFormSyncStatus}: StylesProps) => `calc(100% - ${formTypeSelectorHeight}px - ${formTypeSelectorHeight}px - ${hasFormSyncStatus ? syncDetailsHeight : 0}px)`,
    },

    hidden: {
        visibility: 'hidden',
        width: '0 !important',
        height: '0 !important',
        padding: '0 !important',
    },

    formTemplateSelectorContainer: {
        height: `${formTypeSelectorHeight}px`,
        width: '100%',
        padding: ({hasFormSyncStatus}: StylesProps) => `${hasFormSyncStatus ? '0px' : '14px'} 12px 6px 12px`,
    },

    formTypesSelectorContainer: {
        height: `${formTypeSelectorHeight}px`,
        padding: ({hasFormSyncStatus}: StylesProps) => `${hasFormSyncStatus ? '0px' : '14px'} 12px 14px 12px`,
    },

    formSyncStatusContainer: {
        padding: '12px',
        height: `${syncDetailsHeight}px`,
    },
}));

interface FormsProps {
    selectedForm: Form;
    setSelectedForm: (form?: Form) => void;
    selectedMapNode: SmartNodes;
    projectTreeAndSmartNodeMap: ProjectTreeAndSmartObjectNodeMap;
    projectSite: SmartProjectSite;
    locationTree: LocationTree;
    formStatusFilter: LocationFormStatusFilters;
    formSearchKey: string;
    onActiveFeatureTypesChanged: (formType: FormType[]) => void;
    onActiveTemplateChanged: (formType: FormType[]) => void;
    onBackButtonClick: () => void;
    allowDrafts: boolean;
    setFeatureTypeGroups: (featureTypeGroups: FormTypeGroup[]) => void;
}

export function Forms({selectedForm, setSelectedForm, selectedMapNode, projectTreeAndSmartNodeMap, projectSite, locationTree, formStatusFilter, formSearchKey, onActiveFeatureTypesChanged, onBackButtonClick, allowDrafts, setFeatureTypeGroups, onActiveTemplateChanged}: FormsProps) {
    const {track} = useAnalytics();
    const {projectId} = useParams<LocationIntelligenceRouteParams>();

    const {formSyncStatus, formSyncStatusLoading} = useFormSyncStatus();
    const [selectedAssigneToFormTypes, setSelectedAssigneToFormTypes] = useState<string[]>([]);

    const {forms, formsLoading} = useForms(projectSite);

    //const hasBimData = useMemo(() => forms?.some((form) => form.isBimForm), [forms]);
    // TODO - this is temporary, in the future the data mode of the site probably needs to be set via feature flags.
    const {setDataMode, dataMode} = useDataMode();
    const inBim360Mode = dataMode === 'BIM360';

    // useEffect(() => {
    //     if (hasBimData) {
    //         setDataMode('BIM360');
    //     }
    // }, [hasBimData]);

    const [selectedFormTypes, setSelectedFormTypes] = useState<FormType[]>([]);
    const [selectedFormTemplate, setSelectedFormTemplate] = useState<FormType[]>();

    const filteredForms = useMemo(() => new FilteredForms(forms!, selectedFormTemplate!, selectedFormTypes!, selectedAssigneToFormTypes, selectedMapNode, projectTreeAndSmartNodeMap, formStatusFilter, formSearchKey, dataMode).value, [forms, selectedFormTemplate, selectedFormTypes, selectedMapNode, projectTreeAndSmartNodeMap, formStatusFilter, formSearchKey, dataMode]);
    const sortedFilteredForms = useMemo(() => new SortedForms(filteredForms, locationTree).value, [filteredForms, locationTree]);

    const _templateTypes: FormType[] = useFeatureTypes();
    const _bimFeatureTypes = useBimFeatureTypes(forms!, selectedFormTemplate!);

    const featureTypes = useMemo(() => {
        setSelectedFormTypes([])
        const featureTypes = inBim360Mode ? _bimFeatureTypes : [];
        featureTypes.sort((featureTypeA, featureTypeB) => featureTypeA.formType.localeCompare(featureTypeB.formType));

        return featureTypes;
    }, [_bimFeatureTypes, inBim360Mode]);

    const featureTypeGroups = useFeatureTypeGroupingWhiteList(featureTypes);
    const flatFeatureTypesFromGroups = useMemo(() => {
        if (Boolean(featureTypeGroups)) {
            return featureTypeGroups!.map((group) => group.featureTypes).flat();
        }
    }, [featureTypeGroups])

    useEffect(() => {
        if (Boolean(featureTypeGroups)) {
            setFeatureTypeGroups(featureTypeGroups!);
        }
    }, [featureTypeGroups]);

    const lastSyncDate = useMemo(() => {
        if (formSyncStatus && selectedFormTemplate && selectedFormTemplate.length > 0) {
          const sortedFormSyncStatus = formSyncStatus.sort((a, b) => b.updatedAt!.getTime() - a.updatedAt!.getTime());
          const lastFormSyncStatus = sortedFormSyncStatus?.find((syncLog) => selectedFormTemplate.find((template) => syncLog.featureId === template.formTypeId))
    
          if (lastFormSyncStatus?.updatedAt) {
            const lastSyncDateWithoutSeconds = new Date(lastFormSyncStatus?.updatedAt!.getTime());
            lastSyncDateWithoutSeconds.setSeconds(0);
    
            return lastSyncDateWithoutSeconds;
          }
        }
    }, [formSyncStatus, selectedFormTemplate])

    function _setSelectedFormTypes(formTypes: FormType[]) {
        setSelectedFormTypes(formTypes);
        onActiveFeatureTypesChanged(formTypes);
    }

    function _setSelectedFormTemplate(formType: FormType) {
        formType.formType === 'BIM360 Checklist' ? setDataMode('BIM360') : setDataMode(undefined);
        setSelectedFormTemplate([formType]);
        onActiveTemplateChanged([formType])
    }

    const noFormTypesSelected = useMemo(() => !Boolean(selectedFormTypes?.length), [selectedFormTypes]);
    const doFormsExistForAnyFeatureType = useMemo(() => {
        return Boolean(selectedFormTypes?.find((featureType) => {
            const hasExistingForm = Boolean(forms?.find((form) => (form.sourceTemplateId || form.bimTemplateId || form.featureId) === featureType.formTypeId));
            return hasExistingForm;
        }));
    }, [forms, selectedFormTypes]);

    const formsWithLocation = useMemo(() => sortedFilteredForms.filter((form) => form.isLinkedToLocation), [sortedFilteredForms]);
    const formsWithOutLocation = useMemo(() => sortedFilteredForms.filter((form) => !form.isLinkedToLocation), [sortedFilteredForms]);

    const missingFormTypes = useMissingFormTypes(selectedFormTypes!, selectedMapNode, formsWithLocation!);

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

    const classes = useStyles({hasFormSyncStatus: Boolean(inBim360Mode)});

    useEffect(() => {
        if (inBim360Mode && Boolean(forms) && Boolean(flatFeatureTypesFromGroups)) {
            const whiteListedForms = forms!.filter((form) => Boolean(flatFeatureTypesFromGroups!.find((featureType) => (form.sourceTemplateId || form.bimTemplateId || form.featureId) === featureType.formTypeId)));

            const formsAssignedToRootNode = whiteListedForms!.filter((form) => form.locations.some((location) => location.name.toLowerCase().includes('mills')));
            const formIdsAssignedToRootNode = formsAssignedToRootNode.map((form) => `{BimId: ${form.bimId}, SlateId: ${form.slateFormId}}`);

            console.log(`Forms Assigned To Root Node (${formIdsAssignedToRootNode.length})`, formIdsAssignedToRootNode.join(', \n'));

            
            const now = new Date().getTime();

            const formIdsWithSyncOlderThan12Hours = whiteListedForms!.filter((form) => {
                const hoursSinceFormLastSynced = (now - (form.bimLastSuccessfulSync?.getTime() ?? 0)) / msToHours;

                return hoursSinceFormLastSynced >= oldDataAgeInHours;
            }).map((form) => `{BimId: ${form.bimId}, SlateId: ${form.slateFormId}}`);

            console.log(`Forms with last sync > 12 h (${formIdsWithSyncOlderThan12Hours.length})`, formIdsWithSyncOlderThan12Hours.join(`, \n`));
        }
    }, [forms, inBim360Mode, flatFeatureTypesFromGroups]);

    return (
        <div className={classes.forms}>
            {
                !Boolean(selectedForm) &&
                    <div className={`${classes.formSyncStatusContainer}`}>
                        {
                            !formSyncStatusLoading &&
                                <FormSyncStatusMessage
                                    label={'Most recent full sync:'}
                                    lastSyncDate={lastSyncDate}
                                    oldDataAgeInHours={oldDataAgeInHours}
                                />
                        }
                    </div>
            }

            <div className={classes.formTemplateSelectorContainer}>
                <Select
                    id="form-template-slection"
                    name="templateId"
                    style={{ width: '100%' }}
                    variant='outlined'
                    onChange={(e)=> {_setSelectedFormTemplate(_templateTypes[e.target.value as number])}}
                    defaultValue={0}
                >
                    {_templateTypes.map((template: FormType, index: number) => (
                        <MenuItem key={template.formTypeId} value={index}>
                            {template.formType}
                        </MenuItem>
                    ))}
                </Select>
            </div>
            
            <div className={`${classes.formTypesSelectorContainer} ${Boolean(selectedForm) ? classes.hidden : ''}`}>
                <FormTypeSelector
                    formTypes={!inBim360Mode && inBim360Mode !== undefined ? featureTypes : undefined}
                    formTypeGroups={inBim360Mode || inBim360Mode !== undefined ? featureTypeGroups : undefined}
                    setSelectedFormTypes={_setSelectedFormTypes}
                />
            </div>
            
            <div className={`${classes.formListsContainer} ${Boolean(selectedForm) ? classes.hidden : ''}`}>
                <FormLists
                    loading={formsLoading}
                    noFormTypesSelected={noFormTypesSelected}
                    formsWithLocation={formsWithLocation}
                    formsWithOutLocation={formsWithOutLocation}
                    selectedMapNode={selectedMapNode}
                    doFormsExistForAnyFeatureType={doFormsExistForAnyFeatureType}
                    onFormClick={onFormClick}
                    activeFormTypes={selectedFormTypes}
                    missingFormTypes={missingFormTypes}
                />
            </div>

            {
                Boolean(selectedForm) && <FormDetail form={selectedForm!} onBackButtonClick={_onBackButtonClick} />
            }
        </div>
    )
}