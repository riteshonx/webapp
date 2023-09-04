import { Theme } from '@material-ui/core';
import { makeStyles } from '@mui/styles';
import { useEffect } from 'react';

import { Checkbox as StyledCheckbox } from '../../controls/Checkbox';

interface StyleProps {
    color: string;
    disabled?: boolean;
    hasBorder: boolean;
}

const useStyles = makeStyles<Theme, StyleProps>(({
    statusButtonContainer: {
        backgroundColor: ({color}) => `${color} !important`,
        display: 'flex',
        flexDirection: 'row',
        border: ({hasBorder}) => hasBorder ? '2px solid black' : '',
        borderRadius: '4px',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '2px',
        paddingBottom: '2px',
        opacity: ({disabled}) => disabled ? .3 : 1,
    },

    checkbox: {
        '& .MuiButtonBase-root': {
            padding: '0px',
            paddingLeft: '16px',
        },
    },

    nonCheckboxButton: {
        fontSize: '14px',
        fontWeight: '600',
    },
}));

interface StatusButtonProps {
    checked?: boolean;
    label: string;
    color: string;
    disabled?: boolean;
    hasBorder?: boolean;
    onChange?: (checked: boolean) => void;
    datatestid?: string;
}

export function StatusButton({checked, label, color, hasBorder, disabled, onChange, datatestid}: StatusButtonProps) {
    const _hasBorder = hasBorder !== undefined ? hasBorder : true;
    const classes = useStyles({color, disabled, hasBorder: _hasBorder});

    return (
        <div className={classes.statusButtonContainer}>
            {
                Boolean(onChange) ?
                    <div className={classes.checkbox}>
                        <StyledCheckbox
                            label={label}
                            labelfontweight={'600'}
                            checkboxcolor={'black'}
                            checked={checked}
                            onChange={(event) => onChange!(event.target.checked)}
                            datatestid={datatestid}
                        />
                    </div> :
                    <div className={classes.nonCheckboxButton}>
                        {label}
                    </div>
            }
        </div>
    );
}