import { makeStyles } from '@mui/styles';
import { useEffect, useMemo } from 'react';
import { Theme } from 'src/modules/visualize/theme';

import { FormStatuses } from '../../models/form/formStatuses';

const useStyles = makeStyles((theme: Theme) => ({
    statusCircleContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },

    label: {
        fontSize: '14px',
    },

    statusCircle: {
        borderRadius: '90px',
        height: '16px',
        minWidth: '16px',
        width: '16px',
        marginRight: '7px',
    },

    open: {
        backgroundColor: theme.colors.openStatusColor,
    },

    draft: {
        backgroundColor: theme.colors.openStatusColor,
    },

    overdue: {
        backgroundColor: theme.colors.openStatusColor,
    },

    closed: {
        backgroundColor: theme.colors.closedStatusColor,
    },

    notFound: {
        backgroundColor: theme.colors.notFoundStatusColor,
    },
}));

interface StatusCircleProps {
    status: FormStatuses;
}

export function StatusCircle({status}: StatusCircleProps) {
    const classes = useStyles();

    const statusColorClass = useMemo(() => {
        switch(status.toLowerCase()) {
            case FormStatuses.Closed.toLowerCase(): return classes.closed;
            case FormStatuses.Open.toLowerCase(): return classes.open;
            case FormStatuses.Overdue.toLowerCase(): return classes.overdue;
            case FormStatuses.Draft.toLowerCase(): return classes.draft;
            case FormStatuses.NotFound.toLowerCase(): return classes.notFound;
        }
    }, [status]);

    return (
        <div className={classes.statusCircleContainer}>
            <span className={`${classes.statusCircle} ${statusColorClass}`} />
            
            <div className={classes.label}>
                {status}
            </div>
        </div>
    );
}