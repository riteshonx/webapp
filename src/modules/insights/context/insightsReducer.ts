import {
    SCHEDULE_TAB,
    LESSONS_LEARNED_STATUS_ACTED,
    LESSONS_LEARNED_STATUS_IGNORED,
    LESSONS_LEARNED_STATUS_SHARED,
    LESSONS_LEARNED_STATUS_NEW,
    SCHEDULE_IMPACT_TYPES
    
} from '../constant/index'
import {
    SETLESSONSLEARNEDLIST,
    SETOPENTAB,
    SETLESSONSLEARNEDSEARCHKEYWORD,
    SETSCHEDULESEARCHKEYWORD,
    SETSCHEDULEIMPACTSEARCHKEYWORD,
    SETSCHEDULELIST,
    SETSCHEDULEIMPACTLIST,
    SETOPENINSIGHT,
    SETDETAILSCHEDULE,
    SETDETAILLESSONSLEARNED,
    SETLESSONSLEARNEDFILTERCOUNT,
    SETLESSONSLEARNEDFILTER,
    SETLESSONSLEARNEDSORTBY,
    SETSCHEDULEIMPACTSORTBY,
    SETDETAILSCHEDULEIMPACT,
    SETSCHEDULEIMPACTFILTER
} from './insightsAction';
import { Action } from '../../../models/context';

import { Insights, Schedule, LessonsLearned, SortByObject, ScheduleImpactTask } from '../models/insights'
import { scheduleImpactSortFilterAndSearch } from './scheduleImpactSortAndFilter';

export const insightsInitialState: Insights = {
    lessonsLearnedList: [],
    scheduleList: [],
    openTab: SCHEDULE_TAB,
    openInsight: '',
    scheduleSearchKeyword: '',
    scheduleImpactSearchKeyword: '',
    lessonsLearnedsearchKeyword: '',
    detailSchedule: {} as Schedule,
    detailLessonsLearned: {} as LessonsLearned,
    lessonsLearnedFiltersCount: 0,
    scheduleImpactList: [],
    filterdScheduleImpactList: [],
    detailScheduleImpact: {} as ScheduleImpactTask,
    lessonsLearnedFilters: [
        {
            name: 'Status',
            options: [
                {
                    name: LESSONS_LEARNED_STATUS_NEW,
                    type: 'boolean',
                    value: true
                },
                {
                    name: LESSONS_LEARNED_STATUS_ACTED,
                    type: 'boolean',
                    value: false
                },
                {
                    name: LESSONS_LEARNED_STATUS_IGNORED,
                    type: 'boolean',
                    value: false
                },
                {
                    name: LESSONS_LEARNED_STATUS_SHARED,
                    type: 'boolean',
                    value: false
                }
            ]
        }
    ],
    lessonsLearnedSortBy: [
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
    ],
    scheduleImpactSortBy: [
        {
            name: 'Priority High to Low',
            query: 'priority 1',
            value: false
        },
        {
            name: 'Priority Low to High',
            query: 'priority -1',
            value: false
        },
        {
            name: 'Start Date High to Low',
            query: 'plannedStartDate 1',
            value: false
        },
        {
            name: 'Start Date Low to High',
            query: 'plannedStartDate -1',
            value: false
        }
    ],
    scheduleImpactFilters: [
        {
            name: 'Status',
            options: [
                {
                    name: SCHEDULE_IMPACT_TYPES.RFI,
                    type: 'boolean',
                    value: false
                },
                {
                    name: SCHEDULE_IMPACT_TYPES.DAILY_LOGS,
                    type: 'boolean',
                    value: false
                },
                {
                    name: SCHEDULE_IMPACT_TYPES.WEATHER,
                    type: 'boolean',
                    value: false
                },
                {
                    name: SCHEDULE_IMPACT_TYPES.MATERIAL,
                    type: 'boolean',
                    value: false
                },
                {
                    name: SCHEDULE_IMPACT_TYPES.CONSTRAINT_LOGS,
                    type: 'boolean',
                    value: false
                }
            ]
        }
    ]
}

export const insightsReducer = (state: Insights = insightsInitialState, action: Action): Insights => {
    switch (action.type) {
        case SETLESSONSLEARNEDLIST: {
            return {
                ...state,
                lessonsLearnedList: action.payload.filter(
                    (lessonsLearn: LessonsLearned) =>
                        lessonsLearn.lessonslearnedInsight.subject
                            .toLocaleLowerCase()
                            .includes(state.lessonsLearnedsearchKeyword
                                .toLocaleLowerCase())
                )
            }
        }
        case SETOPENTAB: {
            return {
                ...state,
                openTab: action.payload
            }
        }
        case SETOPENINSIGHT: {
            return {
                ...state,
                openInsight: action.payload
            }
        }
        case SETLESSONSLEARNEDSEARCHKEYWORD: {
            return {
                ...state,
                lessonsLearnedsearchKeyword: action.payload
            }
        }
        case SETSCHEDULESEARCHKEYWORD: {
            return {
                ...state,
                scheduleSearchKeyword: action.payload
            }
        }
        case SETSCHEDULEIMPACTSEARCHKEYWORD: {
            const query = state.scheduleImpactSortBy
                .find((element:SortByObject) => element.value)
                || {} as SortByObject
            return {
                ...state,
                scheduleImpactSearchKeyword: action.payload,
                filterdScheduleImpactList: scheduleImpactSortFilterAndSearch(
                    state.scheduleImpactList,
                    action.payload,
                    query,
                    state.scheduleImpactFilters
                )
            }
        }
        case SETSCHEDULELIST: {
            return {
                ...state,
                scheduleList: action.payload.filter(
                    (schedule: Schedule) =>
                        schedule.title.toLocaleLowerCase()
                            .includes(state.scheduleSearchKeyword
                                .toLocaleLowerCase())
                )
            }
        }
        case SETSCHEDULEIMPACTLIST: {
            return {
                ...state,
                scheduleImpactList: action.payload,
                filterdScheduleImpactList: action.payload
            }
        }
        case SETDETAILSCHEDULEIMPACT: {
            return {
                ...state,
                detailScheduleImpact: action.payload
            }
        }
        case SETDETAILSCHEDULE: {
            return {
                ...state,
                detailSchedule: action.payload
            }
        }
        case SETDETAILLESSONSLEARNED: {
            return {
                ...state,
                detailLessonsLearned: action.payload
            }
        }
        case SETLESSONSLEARNEDFILTERCOUNT: {
            return {
                ...state,
                lessonsLearnedFiltersCount: action.payload
            }
        }
        case SETLESSONSLEARNEDFILTER: {
            return {
                ...state,
                lessonsLearnedFilters: action.payload
            }
        }
        case SETLESSONSLEARNEDSORTBY: {
            return {
                ...state,
                lessonsLearnedSortBy: action.payload
            }
        }
        case SETSCHEDULEIMPACTSORTBY: {
            const query = action.payload
                .find((element:any) => element.value)
            return {
                ...state,
                scheduleImpactSortBy: action.payload,
                filterdScheduleImpactList: scheduleImpactSortFilterAndSearch(
                    state.scheduleImpactList,
                    state.scheduleImpactSearchKeyword,
                    query,
                    state.scheduleImpactFilters
                )
            }
        }
        case SETSCHEDULEIMPACTFILTER: {
            const query = state.scheduleImpactSortBy
                .find((element:SortByObject) => element.value)
                || {} as SortByObject
            return {
                ...state,
                scheduleImpactFilters: action.payload,
                filterdScheduleImpactList: scheduleImpactSortFilterAndSearch(
                    state.scheduleImpactList,
                    state.scheduleImpactSearchKeyword,
                    query,
                    action.payload
                )
            }
        }
        default: return state
    }
}