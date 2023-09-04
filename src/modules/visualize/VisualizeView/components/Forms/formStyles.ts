import { makeStyles } from '@mui/styles';
import { Theme } from 'src/modules/visualize/theme';

export const useFormStyles = makeStyles((theme: Theme) => ({
    formlistItem: {
        padding: '12px',
        borderBottom: `1px solid ${theme.colors.lightGrey}`,
        cursor: 'pointer',
    },

    formType: {
        fontSize: '14px',
        color: theme.colors.darkGrey,
    },

    subjectLine: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    subject: {
        fontSize: '18px',
        color: 'black',
    },

    status: {
        display: 'flex',
        flexDirection: 'row',
    },

    section: {
        marginTop: '6px',
        fontSize: '14px',
        wordBreak: 'break-word',
    },

    overdue: {
        color: theme.colors.red,
    },

    bimChecklistId: {
        fontWeight: '500',
        fontSize: '18px',
        color: theme.colors.darkGrey,
        wordBreak: 'keep-all',
    },

    noDataMessage: {
        fontSize: '18px',
        color: theme.colors.darkGrey,
    },
}));