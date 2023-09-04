import CheckCircleOutlineIconBase from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIconBase from '@mui/icons-material/WarningAmber';
import { styled } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Theme } from 'src/modules/visualize/theme';

const InSyncIcon = styled(CheckCircleOutlineIconBase)(({theme}) => ({color: (theme as Theme).colors.mediumGrey}));
const OutOfSyncIcon = styled(WarningAmberIconBase)(({theme}) => ({color: (theme as Theme).colors.red}));

const useStyles = makeStyles(({
    syncMessageContainer: {
        display: 'flex',
        height: '100%',
        fontSize: '12px',
    },

    iconContainer: {
        height: '100%',
        marginRight: '4px',
    },
}));

interface FormStatusSyncMessageProps {
    label: string;
    lastSyncDate?: Date;
    oldDataAgeInHours: number;
}

const msInSecond = 1000;
const secondsInMinute = 60;
const minutesInHour = 60;

export function FormSyncStatusMessage({label, lastSyncDate, oldDataAgeInHours}: FormStatusSyncMessageProps) {
    const classes = useStyles();

    const _lastSyncDate = useMemo(() => {
        if (Boolean(lastSyncDate)) {
            const lastSyncDateWithoutSeconds = new Date(lastSyncDate!.getTime());
            lastSyncDateWithoutSeconds.setSeconds(0);
            
            return lastSyncDateWithoutSeconds;
        }
    }, [lastSyncDate]);

    const setNowInterval = useRef<number>();

    const [now, setNow] = useState<Date>(new Date());

    const syncAgeRoundedToMinutes = Math.floor((now.getTime() - (_lastSyncDate?.getTime() ?? 0)) / msInSecond / secondsInMinute);
    const syncAgeInHours = syncAgeRoundedToMinutes / minutesInHour;
    const syncAgeRoundedToHours = Math.floor(syncAgeInHours);
    const syncAgeInMinutesOverHours = syncAgeRoundedToMinutes % minutesInHour;
    const syncAgeInSecondsOverMinutes = now.getSeconds();

    const month = _lastSyncDate?.toLocaleString('en-US', { month: 'short' });
    const day = _lastSyncDate?.getDate();

    const time = _lastSyncDate?.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    const zone = new Date().toLocaleTimeString('en-US', {timeZoneName:'short'}).split(' ')[2];

    useEffect(() => {
        setNowInterval.current = +setInterval(() => setNow(new Date()), msInSecond);

        return () => clearInterval(setNowInterval.current);
    }, []);

    const Icon = () => 
        <>
            {
                Boolean(lastSyncDate) && (syncAgeInHours <= oldDataAgeInHours) ?
                    <InSyncIcon /> :
                    <OutOfSyncIcon />
            }
        </>


    return (
        <div className={classes.syncMessageContainer}>
            <div className={classes.iconContainer}>
                <Icon />
            </div>

            {
                Boolean(lastSyncDate) ?
                    <>
                        {label}&nbsp;
                        
                        {
                            syncAgeRoundedToHours > 0 &&
                                <>
                                    {syncAgeRoundedToHours}h&nbsp;
                                </>
                        }

                        {
                            syncAgeInMinutesOverHours > 0 &&
                                <>
                                    {syncAgeInMinutesOverHours}m&nbsp;
                                </>
                        }

                        {
                            syncAgeRoundedToHours === 0 && syncAgeRoundedToMinutes === 0 && syncAgeInSecondsOverMinutes > 0 &&
                                <>
                                    {syncAgeInMinutesOverHours}s&nbsp;
                                </>
                        }

                        ago&nbsp;
                        ({month} {day} at {time} {zone})
                    </> :
                    <>
                        A full sync has not yet occurred
                    </>
            }
            
        </div>
    )
}