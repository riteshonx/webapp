import { makeStyles } from '@mui/styles';

import { Checkbox } from '../../../controls/Checkbox/Checkbox';
import { SelectableFormTypeGroup } from './selectableFormTypeGroup';
import { SelectableFormType } from './selectableFormTypes';

const useStyles = makeStyles(({
    container: {
        display: 'flex',
        flexDirection: 'column',
    },

    groupValues: {
        paddingLeft: '16px',
    }
})); 

interface FormTypeGroupCheckBoxListProps {
    selectableFormTypeGroups: SelectableFormTypeGroup[];
    setSelecteableFormTypeGroups: (formTypes: SelectableFormTypeGroup[]) => void;
}

export function FormTypeGroupCheckBoxList({selectableFormTypeGroups: formTypeGroups, setSelecteableFormTypeGroups: setFormTypeGroups}: FormTypeGroupCheckBoxListProps) {
    const classes = useStyles();

    function onGroupChange(checked: boolean, formTypeGroup: SelectableFormTypeGroup) {
        formTypeGroup.selected = checked;

        setFormTypeGroups([...formTypeGroups]);
    }

    function onFormTypeChanged(checked: boolean, formType: SelectableFormType) {
        formType.selected = checked;

        setFormTypeGroups([...formTypeGroups]);
    }

    return (
        <div className={classes.container} data-testid={'Form-Type-Selector-Parent'}>
            {
                formTypeGroups.map((formTypeGroup) => 
                    <div key={`form_type_${formTypeGroup.selectableFormTypeGroupId}_parent`}>
                        <Checkbox
                            key={`form_type_${formTypeGroup.selectableFormTypeGroupId}`}
                            checked={formTypeGroup.selected}
                            onChange={(event) => onGroupChange(event.target.checked, formTypeGroup)}
                            indeterminate={formTypeGroup.indeterminate}
                            label={formTypeGroup.name}
                            labelfontweight={'600'}
                            checkboxcolor={'black'}
                        />

                        <div className={classes.groupValues} key={`form_type_${formTypeGroup.selectableFormTypeGroupId}_children`}>
                            {
                                formTypeGroup.selectableFormTypes.map((selectableFormType) =>
                                <Checkbox
                                    key={`form_type_${selectableFormType.selectableFormTypeId}`}
                                    checked={selectableFormType.selected}
                                    onChange={(event) => onFormTypeChanged(event.target.checked, selectableFormType)}
                                    label={selectableFormType.formTypeName}
                                    checkboxcolor={'black'}
                                />
                                )
                            }
                        </div>
                    </div>
                )
            }
        </div>
    );
}