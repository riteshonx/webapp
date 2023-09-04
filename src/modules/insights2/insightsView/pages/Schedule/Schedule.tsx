import React, { useContext, useEffect, useState } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import './Schedule.scss';

import { stateContext } from '../../../../root/context/authentication/authContext';
import { client } from 'src/services/graphql';
import { Schedule } from 'src/modules/insights2/models/insights';
import LoadingCard from '../../components/LoadingCard/LoadingCard';
import ScheduleCard from '../../components/ScheduleCard/ScheduleCard';
import EmptyCard from '../../components/EmptyCard/EmptyCard';
import {
  LOAD_DETAIL_SCHEDULE,
  LOAD_LATEST_SCHEDULE_TIMESTAMP,
  LOAD_SCHEDULE_LIST,
} from 'src/modules/insights2/graphql/queries/schedule';
import ScheduleDetails from '../../components/ScheduleDetails/ScheduleDetails';

export default (): React.ReactElement => {
  const { state, dispatch }: any = useContext(stateContext);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [scheduleList, setScheduleList] = useState<Array<Schedule>>([]);
  const [scheduleSelected, setScheduleSelected] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('')
  const [scheduleDetail, setScheduleDetail] = useState<Schedule>(
    {} as Schedule
  );

  useEffect(() => {
    loadScheduleList();
  }, []);

  useEffect(() => {
    loadScheduleList();
  }, [searchKeyword]);

  const loadScheduleList = async () => {
    try {
      setLoadingList(true);
      /*
       * first queries the maximum schedule timestamp from the database.
       */
      const latestTimeStamp = await client.query({
        query: LOAD_LATEST_SCHEDULE_TIMESTAMP,
        fetchPolicy: 'network-only',
        context: {
          role: 'viewMasterPlan',
          token: state?.selectedProjectToken,
        },
      });
      const createdAt = latestTimeStamp.data.projectInsights[0].createdAt;

      /**
       *  calculate (maximum - 5min) timestamp.
       */
      const gtCreatedAt = new Date(
        new Date(createdAt).valueOf() - 100
      ).toISOString();

      /*
       * Load all projectInsights with createdAt > (maximum - 5min)
       */
      const scheduleList = await client.query({
        query: LOAD_SCHEDULE_LIST,
        variables: {
          gt: gtCreatedAt,
          searchKeyword: `%${searchKeyword}%`,
        },
        fetchPolicy: 'network-only',
        context: {
          role: 'viewMasterPlan',
          token: state?.selectedProjectToken,
        },
      });

      const projectInsights = scheduleList.data.projectInsights.filter(
        (projectInsight: Schedule) => projectInsight.title
      );

      setScheduleList(projectInsights || []);
      if (projectInsights?.length) {
        let index = projectInsights.findIndex(
          (item: Schedule) => item.id === scheduleSelected
        );
        if (index === -1) {
          index = 0;
        }
        setScheduleSelected(projectInsights[index].id);
        loadDetailSchedule(projectInsights[index].id);
      } else {
        setScheduleDetail({} as Schedule)
      }
      setLoadingList(false);
    } catch (error) {
      setLoadingList(false);
    }
  };

  const loadDetailSchedule = async function name(id: string) {
    try {
      setLoadingDetail(true)
      setScheduleSelected(id)
      const loadDetailSchedule = await client.query({
        query: LOAD_DETAIL_SCHEDULE,
        variables: { id },
        fetchPolicy: 'network-only',
        context: { role: 'viewMasterPlan', token: state?.selectedProjectToken },
      });
      const detailInsight = JSON.parse(
        JSON.stringify(loadDetailSchedule.data.projectInsights[0])
      );
      if (detailInsight.component === 'ScheduleImpact') {
        const taskList = detailInsight.tasks;
        detailInsight.tasks = {
          tasks: taskList,
        };
      }
      setScheduleDetail(detailInsight)
      setLoadingDetail(false)
    } catch (error) {
      setLoadingDetail(false)
    }
  };

  return (
    <div className="v2-schedule">
      <div className="v2-schedule-nav">
        <div className="v2-schedule-nav__search">
          <label>
            <SearchIcon />
          </label>
          <input onChange={e => setSearchKeyword(e.target.value)} />
        </div>
      </div>
      <div className="v2-schedule-container">
        <div className="v2-schedule-container-card">
          {loadingList ? (
            <LoadingCard />
          ) : scheduleList.length ? (
            scheduleList.map((schedule: Schedule) => {
              return (
                <ScheduleCard
                  key={schedule.id}
                  data={schedule}
                  open={scheduleSelected === schedule.id}
                  onClick={() => {
                    loadDetailSchedule(schedule.id);
                  }}
                />
              );
            })
          ) : (
            <EmptyCard msg="No Insight Found"></EmptyCard>
          )}
        </div>
        <div className="v2-schedule-container-detail">
        {loadingDetail ? (
            <LoadingCard />
          ) : scheduleDetail.id ? (
              <ScheduleDetails
                detailSchedule={scheduleDetail}
              />
            ) : (
            <EmptyCard msg="No Insight Selected"></EmptyCard>
          )}
        </div>
      </div>
    </div>
  );
};
