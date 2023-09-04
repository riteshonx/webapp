import { Switch as MuiSwitch, SwitchProps as MuiSwitchProps } from '@material-ui/core';
import { styled, useTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { InputHTMLAttributes, useState } from 'react';
import { Theme } from 'src/modules/visualize/theme';

import { InputElementAttributesWithDataTestId } from '../../InputElementAttributesWithDataTestId';

const StyledSwitch = styled((props: MuiSwitchProps) => (<MuiSwitch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />))(({ theme }: {theme: Theme}) => ({
    width: 48,
    height: 24,
    padding: 0,

    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 4,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(25px)',
            color: theme.colors.blueColor,

            '& + .MuiSwitch-track': {
                backgroundColor: theme.colors.blueColor,
                opacity: 1,
                border: `solid 2px ${theme.colors.blueColor}`,
            },

            '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
            },

            '& .MuiSwitch-thumb': {
                backgroundColor: '#fff',
            },
        },

        '&.Mui-disabled .MuiSwitch-thumb': {
            color: 'black',
        },

        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: 0.7
        },
    },

    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        backgroundColor: theme.colors.darkGrey,
        boxShadow: 'unset',
        width: 16,
        height: 16,
    },
    
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        border: `solid 2px ${theme.colors.darkGrey}`,
        backgroundColor: '#fff',
        opacity: 1,
        
        transition: theme.transitions.create(['background-color'], {
            duration: 300,
        }),
    },
}));

const useStyles = makeStyles(({
    switchContainer: {
        display: 'flex',
        flexDirection: 'row',
        cursor: 'pointer',
    },

    label: {
        marginLeft: '6px',
        fontSize: '14px',
    }
}));

interface SwitchProps {
    label?: string;
    onToggle?: (toggled: boolean) => void;
    datatestid?: string;
    defaultToggle?: boolean;
}

// eslint-disable-next-line
export function Switch({label, onToggle = () => {}, datatestid, defaultToggle = false}: SwitchProps) {
    const classes = useStyles();
    const theme = useTheme<Theme>();

    const [toggled, setToggled] = useState<boolean>(defaultToggle);

    function _onToggle(toggled: boolean) {
        setToggled(toggled);
        onToggle(toggled);
    }

    const dataTestIdAttribute: InputElementAttributesWithDataTestId = {'data-testid': datatestid};

    return (
        <div className={classes.switchContainer} onClick={() => _onToggle(!toggled)}>
            <StyledSwitch
                theme={theme}
                checked={toggled}
                inputProps={dataTestIdAttribute}
                onChange={(event) => _onToggle(event.target.checked)}
            />

            <div className={classes.label}>
                {label!}
            </div>
        </div>
    );
}