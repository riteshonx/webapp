import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFormSyncStatus } from 'src/modules/visualize/VisualizeView/components/Forms/FormSyncStatus';
import { FormType } from 'src/modules/visualize/VisualizeView/models/formType';

const msInSecond = 1000;
const secondsInMinute = 60;
const minutesInHour = 60;

interface SyncInfoProps {
  selectedFormTemplate: FormType[];
}

export const SyncInfo = ({ selectedFormTemplate }: SyncInfoProps): React.ReactElement => {
  const { formSyncStatus, formSyncStatusLoading } = useFormSyncStatus();

  const lastSyncDate = useMemo(() => {
    if (formSyncStatus && selectedFormTemplate.length > 0) {
      const sortedFormSyncStatus = formSyncStatus.sort((a, b) => b.updatedAt!.getTime() - a.updatedAt!.getTime());
      const lastFormSyncStatus = sortedFormSyncStatus?.find((syncLog) => selectedFormTemplate.find((template) => syncLog.featureId === template.formTypeId))

      if (lastFormSyncStatus?.updatedAt) {
        const lastSyncDateWithoutSeconds = new Date(lastFormSyncStatus?.updatedAt!.getTime());
        lastSyncDateWithoutSeconds.setSeconds(0);

        return lastSyncDateWithoutSeconds;
      }
    }
  }, [formSyncStatus, selectedFormTemplate])

  const setNowInterval = useRef<number>();

  const [now, setNow] = useState<Date>(new Date());

  const syncAgeRoundedToMinutes = Math.floor((now.getTime() - (lastSyncDate?.getTime() ?? 0)) / msInSecond / secondsInMinute);
  const syncAgeInHours = syncAgeRoundedToMinutes / minutesInHour;
  const syncAgeRoundedToHours = Math.floor(syncAgeInHours);
  const syncAgeInMinutesOverHours = syncAgeRoundedToMinutes % minutesInHour;
  const syncAgeInSecondsOverMinutes = now.getSeconds();

  const month = lastSyncDate?.toLocaleString('en-US', { month: 'short' });
  const day = lastSyncDate?.getDate();

  const time = lastSyncDate?.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  const zone = new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ')[2];

  useEffect(() => {
    setNowInterval.current = +setInterval(() => setNow(new Date()), msInSecond);

    return () => clearInterval(setNowInterval.current);
  }, []);


  return (
    <div className="v2-visualize-header-syncInfo">
      {!formSyncStatusLoading ?
        Boolean(lastSyncDate) ?
          <>
            Most recent sync:&nbsp;

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

            ago
            ({month} {day} at {time} {zone})
          </> :
          <>
            A full sync has not yet occurred
          </>
        : ''
      }
    </div>
  );
};