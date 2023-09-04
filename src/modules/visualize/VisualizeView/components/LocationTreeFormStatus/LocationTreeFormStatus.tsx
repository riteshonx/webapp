import { styled, useTheme } from '@mui/styles';
import { useEffect, useState } from 'react';
import { Theme } from 'src/modules/visualize/theme';

import { LocationFormStatusFilters } from './LocationFormStatusFilters';
import { StatusButton } from './StatusButton';

const StatusContainer = styled('div')(({theme}: {theme: Theme}) => ({
    backgroundColor: 'white',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'row',
    boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
    padding: '8px 12px',
    alignItems: 'center',
    pointerEvents: 'all',
    
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',

        '& .locationTreeStatusLabel': {
            marginBottom: '3px',
        },
    },
}));

const ButtonsContainer = styled('div')({
    display: 'flex',
    flexDirection: 'row',
});

interface LocationTreeFormStatusProps {
    onActiveStatusSwitch: (formStatusFilter: LocationFormStatusFilters) => void;
}

export function LocationTreeFormStatus({onActiveStatusSwitch}: LocationTreeFormStatusProps) {
    const theme = useTheme<Theme>();

    const [openActive, setOpenActive] = useState<boolean>(true);
    const [closedActive, setClosedActive] = useState<boolean>(true);

    useEffect(() => {
        if (openActive && closedActive) {
            onActiveStatusSwitch(LocationFormStatusFilters.Mixed);
            return;
        }

        if (openActive) {
            onActiveStatusSwitch(LocationFormStatusFilters.Open);
            return;
        }

        if (closedActive) {
            onActiveStatusSwitch(LocationFormStatusFilters.Closed);
            return;
        }

        onActiveStatusSwitch(LocationFormStatusFilters.None);
    }, [openActive, closedActive]);

    return (
        <StatusContainer data-testid={'Status-Bar'}>
            <div style={{marginRight: '15px'}} className='locationTreeStatusLabel'>
                Status
            </div>

            <ButtonsContainer>
                <div style={{marginRight: '10px'}}>
                    <StatusButton
                        checked={openActive}
                        label='Open'
                        color={theme.colors.openStatusColor!}
                        onChange={setOpenActive}
                    />
                </div>

                <div style={{marginRight: '10px'}}>
                    <StatusButton
                        checked={closedActive}
                        label='Closed'
                        color={theme.colors.closedStatusColor!}
                        onChange={setClosedActive}
                        datatestid={'Closed-Status'}
                    />
                </div>

                <div style={{width: '146px'}}>
                    <StatusButton
                        label='Open and Closed'
                        color={theme.colors.mixedStatusColor!}
                        disabled={!(openActive && closedActive)}
                        hasBorder={false}
                    />
                </div>
            </ButtonsContainer>
        </StatusContainer>
    );
}