import { IconButton as MuiIconButton, styled } from '@mui/material';
import { Theme } from 'src/modules/visualize/theme';

const IconButtonStyles = (theme: Theme) => ({
    root: {
        backgroundColor: 'white !important',
        border: `solid 1px ${theme.colors.lightGrey} !important`,
        borderRadius: '0px !important'
    }
});


export const IconButton = styled(MuiIconButton)(IconButtonStyles);