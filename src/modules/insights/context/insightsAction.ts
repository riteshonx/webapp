import { Action } from '../../../models/context';
import { LessonsLearned, Schedule, FilterGroup, SortByObject, ScheduleImpactTask } from '../models/insights'

export const SETLESSONSLEARNEDLIST = "SETCOUNTER";
export const SETOPENTAB = "SETOPENTAB";
export const SETLESSONSLEARNEDSEARCHKEYWORD = "SETLESSONSLEARNEDSEARCHKEYWORD";
export const SETSCHEDULESEARCHKEYWORD = "SETSCHEDULESEARCHKEYWORD";
export const SETSCHEDULELIST = "SETSCHEDULELIST";
export const SETOPENINSIGHT = "SETOPENINSIGHT";
export const SETDETAILSCHEDULE = "SETDETAILSCHEDULE";
export const SETDETAILLESSONSLEARNED = "SETDETAILLESSONSLEARNED"
export const SETLESSONSLEARNEDFILTER = "SETLESSONSLEARNEDFILTER"
export const SETLESSONSLEARNEDSORTBY = "SETLESSONSLEARNEDSORTBY"
export const SETLESSONSLEARNEDFILTERCOUNT = "SETLESSONSLEARNEDFILTERCOUNT"
export const SETSCHEDULEIMPACTLIST = "SETSCHEDULEIMPACTLIST"
export const SETSCHEDULEIMPACTSEARCHKEYWORD = "SETSCHEDULEIMPACTSEARCHKEYWORD"
export const SETSCHEDULEIMPACTSORTBY = "SETSCHEDULEIMPACTSORTBY"
export const SETSCHEDULEIMPACTFILTER = "SETSCHEDULEIMPACTFILTER"
export const SETDETAILSCHEDULEIMPACT = "SETDETAILSCHEDULEIMPACT"

export const setLessonsLearnedList = (payload: Array<LessonsLearned>): Action => {
    return {
        type: SETLESSONSLEARNEDLIST,
        payload
    }
}

export const setOpenTab = (payload: string): Action => {
    return {
        type: SETOPENTAB,
        payload
    }
}

export const setLessonsLearnedSearchKeyword = (payload: string): Action => {
    return {
        type: SETLESSONSLEARNEDSEARCHKEYWORD,
        payload
    }
}

export const setScheduleSearchKeyword = (payload: string): Action => {
    return {
        type: SETSCHEDULESEARCHKEYWORD,
        payload
    }
}

export const setScheduleImpactSearchKeyword = (payload: string): Action => {
    return {
        type: SETSCHEDULEIMPACTSEARCHKEYWORD,
        payload
    }
}

export const setScheduleList = (payload: Array<Schedule>): Action => {
    return {
        type: SETSCHEDULELIST,
        payload
    }
}

export const setScheduleImpactList = (payload: Array<ScheduleImpactTask>): Action => {
    return {
        type: SETSCHEDULEIMPACTLIST,
        payload
    }
}

export const setOpenInsight = (payload: string): Action => {
    return {
        type: SETOPENINSIGHT,
        payload
    }
}

export const setDetailSchedule = (payload: Schedule): Action => {
    return {
        type: SETDETAILSCHEDULE,
        payload
    }
}

export const setDetailLessonsLearned = (payload: LessonsLearned): Action => {
    return {
        type: SETDETAILLESSONSLEARNED,
        payload
    }
}

export const setDetailScheduleImpact = (payload: ScheduleImpactTask): Action => {
    return {
        type: SETDETAILSCHEDULEIMPACT,
        payload
    }
}

export const setLessonsLearnedFilterCount = (payload: number): Action => {
    return {
        type: SETLESSONSLEARNEDFILTERCOUNT,
        payload
    }
}

export const setLessonsLearnedFilter = (payload: Array<FilterGroup>): Action => {
    return {
        type: SETLESSONSLEARNEDFILTER,
        payload
    }
}

export const setLessonsLearnedSortBy = (payload: Array<SortByObject>): Action => {
    return {
        type: SETLESSONSLEARNEDSORTBY,
        payload
    }
}

export const setScheduleImpactSortBy = (payload: Array<SortByObject>): Action => {
    return {
        type: SETSCHEDULEIMPACTSORTBY,
        payload
    }
}

export const setScheduleImpactFilter = (payload: Array<SortByObject>): Action => {
    return {
        type: SETSCHEDULEIMPACTFILTER,
        payload
    }
}