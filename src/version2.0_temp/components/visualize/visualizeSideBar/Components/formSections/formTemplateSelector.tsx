import React, { useEffect } from 'react';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import { FormType } from 'src/modules/visualize/VisualizeView/models/formType';
import { DataModes, useDataMode } from 'src/modules/visualize/VisualizeView/utils/DataMode';

interface FormTemplateSelectorProps {
    setSelectedFormTemplate: (formType: FormType[]) => void;
    templateTypes: FormType[];
}

export const FormTemplateSelector = ({templateTypes, setSelectedFormTemplate }: FormTemplateSelectorProps): React.ReactElement => {

    const [value, setValue] = React.useState<DataModes>('Checklist');
    const {setDataMode} = useDataMode();

    useEffect(() => {
        handleChange(null, 'Checklist')
    }, [templateTypes]);

    const handleChange = (event: React.ChangeEvent<any> | null, newValue: DataModes) => {
        setValue(newValue);
        if(newValue === 'All') {
            const selectedFormType = templateTypes.filter((formType) => formType.formType === 'Checklist' || formType.formType === 'Issues');
            setSelectedFormTemplate(selectedFormType);
            setDataMode('All')
        } else {
            const selectedFormType = templateTypes.find((formType) => formType.formType === newValue);
            if (selectedFormType) {
                setSelectedFormTemplate([selectedFormType]);
                setDataMode(newValue)
            }
        }
    };

    return (
        <BottomNavigation value={value} onChange={handleChange} showLabels={true} className="v2-visualize-form-type-selector">
            {/* <BottomNavigationAction label="All" value="All" /> */}
            <BottomNavigationAction label="Checklists" value="Checklist" />
            <BottomNavigationAction label="Issues" value="Issues" />
        </BottomNavigation>
    );
};