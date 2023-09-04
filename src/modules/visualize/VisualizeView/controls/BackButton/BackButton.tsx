import ArrowBack from '@material-ui/icons/ArrowBackIos';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(({
    backButtonContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        cursor: 'pointer',
    }
}));

interface BackButtonProps {
    onClick: () => void;
}

export function BackButton({onClick}: BackButtonProps) {
    const classes = useStyles();

    return (
        <div className={classes.backButtonContainer} onClick={onClick}>
            <ArrowBack fontSize='small' /> <div style={{fontSize: '14px', marginLeft: '-5px'}}>Back</div>
        </div>
    );
}