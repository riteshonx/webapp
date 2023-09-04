import { makeStyles } from '@mui/styles';

import { Checkbox } from '../../../controls/Checkbox/Checkbox';
import { SelectableFormType } from './selectableFormTypes';

const useStyles = makeStyles(({
    container: {
        display: 'flex',
        flexDirection: 'column',
    },
})); 

interface FormTypeCheckBoxListProps {
    selectableFormTypes: SelectableFormType[];
    setSelecteableFormTypes: (formTypes: SelectableFormType[]) => void;
}

export function FormTypeCheckBoxList({selectableFormTypes: formTypes, setSelecteableFormTypes: setFormTypes}: FormTypeCheckBoxListProps) {
    const classes = useStyles();

    function onchange(checked: boolean, formType: SelectableFormType) {
        formType.selected = checked;

        setFormTypes([...formTypes]);
    }

    return (
        <div className={classes.container} data-testid={'Form-Type-Selector-Parent'}>
            {
                formTypes.map((formType) => 
                    <Checkbox
                        key={`form_type_${formType.selectableFormTypeId}`}
                        checked={formType.selected}
                        onChange={(event) => onchange(event.target.checked, formType)}
                        label={formType.formTypeName}
                        checkboxcolor={'black'}
                    />
                )
            }
        </div>
    );
}