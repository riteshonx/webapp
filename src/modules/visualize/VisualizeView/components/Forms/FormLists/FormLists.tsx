import { useEffect, useMemo, useState } from 'react';

import { Tab, Tabs } from '../../../controls/Tabs';
import { Form } from '../../../models/form';
import { FormType } from '../../../models/formType';
import { SmartNodes } from '../../../models/SmartNodes';
import { FormList } from './FormList';

interface FormListsProps {
    formsWithLocation: Form[];
    formsWithOutLocation: Form[];
    selectedMapNode: SmartNodes;
    loading: boolean;
    onFormClick: (form: Form) => void;
    noFormTypesSelected: boolean;
    doFormsExistForAnyFeatureType: boolean;
    activeFormTypes: FormType[];
    missingFormTypes: FormType[];
}

export function FormLists({formsWithLocation, formsWithOutLocation, selectedMapNode, doFormsExistForAnyFeatureType, loading, onFormClick, noFormTypesSelected, activeFormTypes, missingFormTypes}: FormListsProps) {
    const formsWithLocationList =
        <FormList
            loading={loading}
            noFormTypesSelected={noFormTypesSelected}
            forms={formsWithLocation}
            selectedMapNode={selectedMapNode}
            doFormsExistForAnyFeatureType={doFormsExistForAnyFeatureType}
            onFormClick={onFormClick}
            activeFormTypes={activeFormTypes}
            missingFormTypes={missingFormTypes}
        />

    const formsWithOutLocationList =
        <FormList
            loading={loading}
            noFormTypesSelected={noFormTypesSelected}
            forms={formsWithOutLocation}
            doFormsExistForAnyFeatureType={doFormsExistForAnyFeatureType}
            onFormClick={onFormClick}
        />

    const hasLocationCountLabel = !loading ? `(${formsWithLocation.length})` : '';
    const noLocationCountLabel = !loading ? `(${formsWithOutLocation.length})` : '';
    
    const tabs: Tab[] = [
        {label: `Has a Location ${hasLocationCountLabel}`, panel: formsWithLocationList},
        {label: `No Location ${noLocationCountLabel}`, panel: formsWithOutLocationList}
    ];

    return (
        <Tabs tabs={tabs} />
    )
}