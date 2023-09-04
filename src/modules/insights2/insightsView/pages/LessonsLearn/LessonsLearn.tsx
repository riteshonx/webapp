import React, { useContext, useEffect, useState } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import './LessonsLearn.scss';
import {
  ADD_ACTIVITY,
  LOAD_LESSONS_LEARNED_LIST_WITH_SORT,
  UPDATE_STATUS,
} from 'src/modules/insights2/graphql/queries/lessonsLearned';
import { client } from 'src/services/graphql';
import Notification, {
  AlertTypes,
} from '../../../../shared/components/Toaster/Toaster';

import { stateContext } from '../../../../root/context/authentication/authContext';
import { LessonsLearned } from '../../../models/insights';
import LessonsLearnedCard from '../../components/LessonsLearnedCard/LessonsLearnedCard';
import {
  LOAD_ATTACHMENTS,
  LOAD_DETAILED_LESSONS_LEARNED,
} from 'src/modules/insights2/graphql/queries/lessonsLearned';
import LessonsLearnedDetails from '../../components/LessonsLearnedDetails/LessonsLearnedDetails';
import AddActivities from '../../components/AddActivities/AddActivities';
import EmptyCard from '../../components/EmptyCard/EmptyCard';
import LoadingCard from '../../components/LoadingCard/LoadingCard';
import {
  LESSONS_LEARNED_STATUS_IGNORED,
  LESSONS_LEARNED_STATUS_ACTED,
  LESSONS_LEARNED_STATUS_NEW,
  LESSONS_LEARNED_STATUS_SHARED,
  LESSONS_LEARNED_STATUS_DELETED,
} from 'src/modules/insights2/constant';
import { FilterListSharp } from '@material-ui/icons';
import { Button, Checkbox, FormControlLabel } from '@material-ui/core';
import OutsideClickHandler from 'react-outside-click-handler';

export default (): React.ReactElement => {
  const { state, dispatch }: any = useContext(stateContext);
  const [addActivities, setAddActivities] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [lessonsLearnedList, setLessonsLearnedList] = useState<
    Array<LessonsLearned>
  >([]);
  const [searchKeyword, setSearchKeyword] = useState('')
  const [lessonsLearnedSelected, setLessonsLearnedSelected] =
    useState<string>('');
  const [lessonsLearnedDetail, setLessonsLearnedDetail] =
    useState<LessonsLearned>({} as LessonsLearned);
  const [filterList, setFilterList] = useState([
    {
      name: LESSONS_LEARNED_STATUS_NEW,
      value: true,
    },
    {
      name: LESSONS_LEARNED_STATUS_ACTED,
      value: false,
    },
    {
      name: LESSONS_LEARNED_STATUS_IGNORED,
      value: false,
    },
    {
      name: LESSONS_LEARNED_STATUS_SHARED,
      value: false,
    },
  ]);
  const [filterPopover, setFilterPopoover] = useState(false);

  const [sortByList, setSortByList] = useState([
    {
        name: 'Rank High to Low',
        query: 'rank: asc_nulls_last',
        value: true
    },
    {
        name: 'Rank Low to High',
        query: 'rank: desc_nulls_last',
        value: false
    },
    {
        name: 'Status New to Old',
        query: 'status: asc_nulls_last',
        value: false
    },
    {
        name: 'Status Old to New',
        query: 'status: desc_nulls_last',
        value: false
    },
    {
        name: 'Updated At',
        query: 'updatedAt: asc_nulls_last',
        value: false
    }
])
const [sortByPopover, setSortByPopover] = useState(false)


  useEffect(() => {
    loadLessonsLearnedList();
  }, []);

  useEffect(() => {
    loadLessonsLearnedList();
  }, [searchKeyword]);

  const loadLessonsLearnedList = async () => {
    try {
      setLoadingList(true);
      const sortBy = sortByList.find(item => item.value)
      const res = await client.query({
        query: LOAD_LESSONS_LEARNED_LIST_WITH_SORT(sortBy?.query || 'rank: asc_nulls_last'),
        fetchPolicy: 'network-only',
        variables: {
          searchKeyword: `%${searchKeyword}%`,
        },
        context: { role: 'viewMasterPlan', token: state?.selectedProjectToken },
      });
      const lessonsLearnedListTemp = res.data.lessonslearnedProjectInsights;
      const nonDeletedList = lessonsLearnedListTemp.filter(
        (item: LessonsLearned) =>
          !item.status.includes(LESSONS_LEARNED_STATUS_DELETED)
      );

      const filtersStatusList = filterList
        .filter((item) => item.value)
        .map((item) => item.name);

      let filterdLessonsLearnList = nonDeletedList;
      if (filtersStatusList.length !== 0) {
        filterdLessonsLearnList = nonDeletedList.filter(
          (item: LessonsLearned) => {
            const status = item.status;
            if (
              status.length === 0 &&
              filtersStatusList.includes(LESSONS_LEARNED_STATUS_NEW)
            ) {
              return true;
            }
            for (let i = 0; i < status.length; i++) {
              if (filtersStatusList.includes(status[i])) {
                return true;
              }
            }
            return false;
          }
        );
      }

      setLessonsLearnedList(filterdLessonsLearnList || []);
      if (filterdLessonsLearnList?.length) {
        let index = filterdLessonsLearnList.findIndex(
          (item: LessonsLearned) => item.id === lessonsLearnedSelected
        );
        if (index === -1) {
          index = 0;
        }
        setLessonsLearnedSelected(filterdLessonsLearnList[index].id);
        loadDetailLessonsLearned(filterdLessonsLearnList[index].id);
      } else {
        setLessonsLearnedDetail({} as LessonsLearned)
      }
      setLoadingList(false);
    } catch {
      setLoadingList(false);
    }
  };

  const loadDetailLessonsLearned = async function name(id: string) {
    try {
      setLoadingDetail(true);
      setLessonsLearnedSelected(id);
      const loadDetailSchedule = JSON.parse(
        JSON.stringify(
          await client.query({
            query: LOAD_DETAILED_LESSONS_LEARNED,
            variables: { id },
            fetchPolicy: 'network-only',
            context: {
              role: 'viewMasterPlan',
              token: state?.selectedProjectToken,
            },
          })
        )
      );
      const form =
        loadDetailSchedule.data.lessonslearnedProjectInsights[0]
          .lessonslearnedInsight.form;

      if (form) {
        const loadAttachments = await client.query({
          query: LOAD_ATTACHMENTS,
          variables: {
            formId: form.id,
          },
          fetchPolicy: 'network-only',
          context: {
            role: 'viewForm',
            token: state?.selectedProjectToken,
          },
        });
        form.attachments = loadAttachments.data.attachments;
      }
      setLessonsLearnedDetail(
        loadDetailSchedule.data.lessonslearnedProjectInsights[0]
      );
      setLoadingDetail(false);
    } catch (error) {
      setLoadingDetail(false);
    }
  };

  const addActivitiesToLesson = async (taskIds: Array<string>) => {
    taskIds.forEach(async (taskId) => {
      try {
        const updateStatus = await client.mutate({
          mutation: ADD_ACTIVITY,
          variables: {
            action: 'None',
            taskId: taskId,
            projectInsightId: lessonsLearnedSelected,
            updatedAt: new Date()
              .toISOString()
              .replace('T', ' ')
              .replace('Z', ''),
            createdAt: new Date(),
          },
          context: {
            role: 'updateMasterPlan',
            token: state?.selectedProjectToken,
          },
        });
      } catch (e) {
        console.log(e);
      }
    });
    if (!lessonsLearnedDetail.status.includes(LESSONS_LEARNED_STATUS_ACTED)) {
      try {
        const updateStatus = await client.mutate({
          mutation: UPDATE_STATUS,
          variables: {
            id: lessonsLearnedDetail.id,
            status: `{${[
              ...lessonsLearnedDetail.status,
              LESSONS_LEARNED_STATUS_ACTED,
            ].join()}}`,
          },
          context: {
            role: 'updateMasterPlan',
            token: state?.selectedProjectToken,
          },
        });
      } catch (e) {
        console.log(e);
      }
    }
    setAddActivities(false);
    setTimeout(() => {
      loadDetailLessonsLearned(lessonsLearnedSelected);
    }, 1000);
  };

  const setIgnored = async (id: string, value: boolean) => {
    try {
      const status = value
        ? [...lessonsLearnedDetail.status, LESSONS_LEARNED_STATUS_IGNORED]
        : lessonsLearnedDetail.status.filter(
            (state: string) => state !== LESSONS_LEARNED_STATUS_IGNORED
          );

      const updateStatus = await client.mutate({
        mutation: UPDATE_STATUS,
        variables: {
          id,
          status: `{${status.join()}}`,
        },
        context: {
          role: 'updateMasterPlan',
          token: state?.selectedProjectToken,
        },
      });
      Notification.sendNotification(
        value ? 'Insight status set to Ignored' : 'Insight status set to New',
        AlertTypes.success
      );
      loadLessonsLearnedList();
    } catch (error) {}
  };

  const toggleFilter = (index: number) => {
    const filterItem = filterList[index];
    filterList.splice(index, 1, {
      name: filterItem.name,
      value: !filterItem.value,
    });
    setFilterList([...filterList]);
    loadLessonsLearnedList();
  };

  const setSortBy = (index: number) => {
    const sortByListTemp: React.SetStateAction<{ name: string; query: string; value: boolean; }[]> = []
    sortByList.forEach((item, i) => {
      item.value = index === i
      sortByListTemp.push(item)
    })
    setSortByList(sortByListTemp)
    loadLessonsLearnedList()
  }

  return (
    <div className="v2-lessons-learned">
      <div className="v2-lessons-learned-nav">
        <div className="v2-lessons-learned-nav__search">
          <label>
            <SearchIcon />
          </label>
          <input onChange={e => setSearchKeyword(e.target.value)}/>
        </div>
        <OutsideClickHandler
          onOutsideClick={() => {
            setFilterPopoover(false);
          }}
        >
          <div className="v2-lessons-learned-nav-popover">
            <Button
              className="insight-filter__button"
              variant="contained"
              startIcon={<FilterListSharp />}
              onClick={() => setFilterPopoover(!filterPopover)}
            >
              Filter
              {filterList.filter((item) => item.value).length ? <div className="badge">
                {filterList.filter((item) => item.value).length}
              </div> : <></>}
            </Button>
            {filterPopover ? (
              <div className="v2-lessons-learned-nav-popover-container">
                {filterList.map((filterItem: any, index: number) => {
                  return (
                    <FormControlLabel
                      control={
                        <Checkbox
                          onClick={() => toggleFilter(index)}
                          checked={filterItem.value}
                        />
                      }
                      label={filterItem.name}
                    />
                  );
                })}
              </div>
            ) : (
              <></>
            )}
          </div>
        </OutsideClickHandler>
        <OutsideClickHandler
          onOutsideClick={() => {
            setSortByPopover(false);
          }}
        >
          <div className="v2-lessons-learned-nav-popover">
            <Button
              className="insight-filter__button"
              variant="contained"
              startIcon={<FilterListSharp />}
              onClick={() => setSortByPopover(!sortByPopover)}
            >
              Sort By
            </Button>
            {sortByPopover ? (
              <div className="v2-lessons-learned-nav-popover-container">
                {sortByList.map((item: any, index: number) => {
                  return (
                    <FormControlLabel
                      control={
                        <Checkbox
                          onClick={() => setSortBy(index)}
                          checked={item.value}
                        />
                      }
                      label={item.name}
                    />
                  );
                })}
              </div>
            ) : (
              <></>
            )}
          </div>
        </OutsideClickHandler>
      </div>
      <div className="v2-lessons-learned-container">
        <div className="v2-lessons-learned-container-card">
          {loadingList ? (
            <LoadingCard />
          ) : lessonsLearnedList.length ? (
            lessonsLearnedList.map((lessonsLearn: LessonsLearned) => {
              return (
                <LessonsLearnedCard
                  key={lessonsLearn.id}
                  data={lessonsLearn}
                  open={lessonsLearnedSelected === lessonsLearn.id}
                  onClick={() => {
                    loadDetailLessonsLearned(lessonsLearn.id);
                  }}
                />
              );
            })
          ) : (
            <EmptyCard msg="No Insight Found"></EmptyCard>
          )}
        </div>
        <div className="v2-lessons-learned-container-detail">
          {loadingDetail ? (
            <LoadingCard />
          ) : lessonsLearnedDetail.id ? (
            addActivities ? (
              <AddActivities
                onCancel={() => {
                  setAddActivities(false);
                }}
                addActivity={addActivitiesToLesson}
                lessonslearnedTaskInsights={
                  lessonsLearnedDetail.lessonslearnedTaskInsights
                }
              />
            ) : (
              <LessonsLearnedDetails
                detailLessonsLearned={lessonsLearnedDetail}
                loadDetailLessonsLearned={() => {
                  loadDetailLessonsLearned(lessonsLearnedSelected);
                }}
                setAddActivities={() => {
                  setAddActivities(true);
                }}
                setIgnored={setIgnored}
              />
            )
          ) : (
            <EmptyCard msg="No Insight Selected"></EmptyCard>
          )}
        </div>
      </div>
    </div>
  );
};
