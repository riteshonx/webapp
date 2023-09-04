import { Checkbox as MuiCheckbox, CheckboxProps as MuiCheckBoxProps, FormControlLabel, Theme } from '@material-ui/core';
import { makeStyles } from '@mui/styles';

import { InputElementAttributesWithDataTestId } from '../InputElementAttributesWithDataTestId';

interface StyleProps {
    checkboxcolor: string;
    labelfontweight?: string;
}

const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
    root: {
        '&.MuiCheckbox-root': {
            color: ({checkboxcolor}) => `${checkboxcolor} !important`,
        },
    },

    label: {
        fontSize: '14px',
        fontWeight: ({labelfontweight}) => Boolean(labelfontweight) ? labelfontweight : 'normal',
    }
}));

interface CheckboxProps extends MuiCheckBoxProps {
    label?: string;
    checkboxcolor: string;
    labelfontweight?: string;

    datatestid?: string;
}

export function Checkbox(props: CheckboxProps) {
    const {label, labelfontweight, checkboxcolor, datatestid} = props;

    const classes = useStyles({checkboxcolor, labelfontweight});

    const dataTestIdAttribute: InputElementAttributesWithDataTestId = {'data-testid': datatestid};

    return (
        <FormControlLabel
            control={
                <MuiCheckbox
                    inputProps={dataTestIdAttribute}
                    {...props}
                    className={classes.root}
                />
            }
            label={
                <span className={classes.label}>
                    {label}
                </span>
            }
        />
    );
}