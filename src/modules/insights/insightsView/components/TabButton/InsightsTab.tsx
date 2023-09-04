import React, { ReactElement, useContext } from "react";
import { useHistory } from "react-router-dom";

// Context
import { insightsContext } from '../../../context/insightsContext'
import { setOpenTab } from '../../../context/insightsAction'
import { IInsightsContext } from "src/modules/insights/models/insights";

// Style
import './InsightsTab.scss'

// Constant
import { LESSONS_LEARNED_TAB, SCHEDULE_TAB, SCHEDULE_IMPACT_TAB } from '../../../constant/index'

function InsightsTab(props: any): ReactElement {

    const { insightsState, insightsDispatch } = useContext(insightsContext) as IInsightsContext
    const history = useHistory()

    const setTabName = (tabName: string) => {
        history.push(`/insights/projects/${props.projectId}/${tabName}`)
        insightsDispatch(setOpenTab(tabName))
    }

    return <div className="insights__tab">
        <button
            onClick={() => { setTabName(SCHEDULE_IMPACT_TAB) }}
            className={insightsState.openTab === SCHEDULE_IMPACT_TAB ? 'insights__tab__button active' : 'insights__tab__button'}>
            Schedule Insights
            <span className="insights__tab__button__count">{insightsState.filterdScheduleImpactList.length}</span>
        </button>
        <button
            onClick={() => { setTabName(LESSONS_LEARNED_TAB) }}
            className={insightsState.openTab === LESSONS_LEARNED_TAB ? 'insights__tab__button active' : 'insights__tab__button'}>
            Lessons Learned
            <span className="insights__tab__button__count">{insightsState.lessonsLearnedList.length}</span>
        </button>
        <button
            onClick={() => { setTabName(SCHEDULE_TAB) }}
            className={insightsState.openTab === SCHEDULE_TAB ? 'insights__tab__button active' : 'insights__tab__button'}>
            Scheduling Standards
            <span className="insights__tab__button__count">{insightsState.scheduleList.length}</span>
        </button>
    </div>

}

export default InsightsTab