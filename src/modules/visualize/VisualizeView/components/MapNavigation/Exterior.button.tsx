import { Button } from '@material-ui/core';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
    button: {
        color: 'black !important',
        borderRadius: '0 !important',
        fontWeight: '400 !important',
        fontSize: '20px !important',

        '& .MuiButton-startIcon': {
            marginRight: '4px !important',
        },
    },

    bolded: {
        fontWeight: '700',
    },

    label: {
        fontSize: '14px',
    },
}));

interface ExteriorButtonProps {
    onClick: () => void;
    selected: boolean;
}

export function ExteriorButton({onClick, selected}: ExteriorButtonProps) {
    const classes = useStyles();

    return (
        <Button
            className={classes.button}
            style={{textTransform: 'none'}}
            onClick={onClick}
        >
            <span className={`${selected && classes.bolded} ${classes.label}`}>Exterior</span>
        </Button>
    );
}