import React, { ReactElement, useReducer, useState, useContext, useEffect } from "react";
import { match, useHistory, useRouteMatch } from "react-router-dom";

// Components 
import InsightsTab from "../../components/TabButton/InsightsTab";
import Filter from '../../components/Filter/Filter'
import ResizeWindow from "../../components/ResizeWindow/ResizeWindow";
import LessonsLearnedCard from '../../../../shared/components/LessonsLearnedCard/LessonsLearnedCard'
import ScheduleCard from '../../../../shared/components/ScheduleCard/ScheduleCard'
import ScheduleImpactCard from '../../../../shared/components/ScheduleImpactCard/ScheduleImpactCard'
import LessonsLearnedDetails from '../../components/LessonsLearnedDetails/LessonsLearnedDetails'
import ScheduleDetails from "../../components/ScheduleDetails/ScheduleDetails";
import AddActivities from '../../components/AddActivities/AddActivities'
import EmptyCard from '../../components/EmptyCard/EmptyCard'
import Notification, { AlertTypes } from "../../../../shared/components/Toaster/Toaster";

// GraphQL
import { client } from '../../../../../services/graphql';
import {
	LOAD_LESSONS_LEARNED_LIST_WITH_SORT,
	LOAD_DETAILED_LESSONS_LEARNED,
	UPDATE_STATUS, ADD_ACTIVITY,
	LOAD_ATTACHMENTS
} from '../../../graphql/queries/lessonsLearned'
import {
	LOAD_SCHEDULE_LIST,
	LOAD_IMPACTED_INSIGHT_LIST,
	LOAD_DETAIL_SCHEDULE,
	LOAD_LATEST_SCHEDULE_TIMESTAMP,
	LOAD_TASK_IMPACT_INSIGHT
} from '../../../graphql/queries/schedule'

// Context
import { insightsInitialState, insightsReducer } from '../../../context/insightsReducer'
import {
	setLessonsLearnedList,
	setScheduleList,
	setOpenTab,
	setOpenInsight,
	setDetailSchedule,
	setDetailLessonsLearned,
	setLessonsLearnedFilterCount,
	setScheduleImpactList,
	setDetailScheduleImpact,
	setScheduleImpactSearchKeyword
} from '../../../context/insightsAction'
import { insightsContext } from '../../../context/insightsContext'
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';


// Models
import {
	FilterGroup,
	FilterObject,
	LessonsLearned,
	ScheduleImpactMsgs,
	ScheduleImpactTask,
	ScheduleImpactType,
	ScheduleTask,
	SortByObject
} from '../../../models/insights'
import { Schedule } from '../../../models/insights'

// Constant
import {
	LESSONS_LEARNED_TAB,
	SCHEDULE_TAB,
	LESSONS_LEARNED_STATUS_IGNORED,
	LESSONS_LEARNED_STATUS_NEW,
	LESSONS_LEARNED_STATUS_ACTED,
	SCHEDULE_IMPACT_TAB
} from '../../../constant/index'

// Style
import './Main.scss'
import ScheduleImpactDetails from "../../components/ScheduleImpactDetails/ScheduleImpactDetails";
import { Button } from "@material-ui/core";
import InsightSendMail from "../../components/InsightSendMail/InsightSendMail";

export interface Params {
	id: string;
	tabName: string;
	projectId: string;
}

function Main(): ReactElement {
	const currentMatch: match<Params> = useRouteMatch();
	const history = useHistory();
	const [addActivities, setAddActivities] = useState(false)
	const [insightsState, insightsDispatch] = useReducer(insightsReducer, insightsInitialState);
	const { state, dispatch }: any = useContext(stateContext);
	const [initialLoad, setInitialLoad] = useState(true);
	const [shareAllModal, setShareAllModal] = useState(false)
	const params = currentMatch.params

	useEffect(() => {
		setInitialLoad(true)
		loadLessonsLearnedList()
		loadScheduleList()
		loadScheduleImpactList([])
	}, [])

	useEffect(() => {
		loadScheduleImpact(params.id)
	}, [insightsState.filterdScheduleImpactList])

	useEffect(() => {
		setAddActivities(false)
		if (params.id) {
			insightsDispatch(setOpenInsight(params.id))
		}
		insightsDispatch(setOpenTab(params.tabName))
		loadSummeryList()
	}, [
		insightsState.openTab,
		insightsState.scheduleSearchKeyword,
		insightsState.scheduleImpactSearchKeyword,
		insightsState.lessonsLearnedsearchKeyword,
		insightsState.lessonsLearnedFilters,
		insightsState.lessonsLearnedSortBy
	])

	/**
	 *
	 * Load currently open Tab list.
	 * @param {string} name : tab Name
	 * @param {string} searchKeyword
	*/
	const loadSummeryList = () => {
		if (params.tabName === LESSONS_LEARNED_TAB) {
			loadLessonsLearnedList()
		} else if (params.tabName === SCHEDULE_TAB) {
			loadScheduleList()
		} else if (params.tabName === SCHEDULE_IMPACT_TAB) {
			loadScheduleImpactList([])
		}
	}


	/*
	* This function is used to load the lessons learned list.
	* Open selected lessons learned recommendation in detail screen
	* byDefault 0th index will be open.
	*/
	const loadLessonsLearnedList = async () => {
		try {
			dispatch(setIsLoading(true))
			const sortBy = insightsState.lessonsLearnedSortBy
				.find((sortBy: SortByObject) => sortBy.value)

			const lessonsLearnedList = await client.query({
				query: LOAD_LESSONS_LEARNED_LIST_WITH_SORT(sortBy?.query || ''),
				fetchPolicy: 'network-only',
				variables: {
					searchKeyword: `%${insightsState.lessonsLearnedsearchKeyword}%`
				},
				context: { role: 'viewMasterPlan', token: state?.selectedProjectToken }
			});

			if (initialLoad) {
				lessonsLearnedList.data.lessonslearnedProjectInsights.forEach((insight: LessonsLearned) => {
					if (insight.id === params.id && !insight.status.includes('Deleted')) {
						const statusFilterIndex = insightsState.lessonsLearnedFilters
							.findIndex((filterGroup: FilterGroup) => filterGroup.name === 'Status')

						if (statusFilterIndex !== -1) {
							insightsState.lessonsLearnedFilters[statusFilterIndex].options
								.map((filter: FilterObject) => {
									if (insight.status.indexOf(filter.name) !== -1) {
										filter.value = true
									}
									return filter
								})
						}
					}
				})
				setInitialLoad(false)
			}

			/*
			* Filter on basis of in insight status
			*/
			let showNew = false;
			const statusFilter = (insightsState.lessonsLearnedFilters
				.find((filterGroup: FilterGroup) => filterGroup.name === 'Status')?.options || [])
				.map((filter: FilterObject) => {
					if (filter.name !== LESSONS_LEARNED_STATUS_NEW && filter.value) {
						return filter.name
					} if (filter.name === LESSONS_LEARNED_STATUS_NEW && filter.value) {
						showNew = true
						return ''
					} else {
						return ''
					}
				}).filter((filter: string) => filter !== '')

			insightsDispatch(setLessonsLearnedFilterCount(statusFilter.length + (showNew ? 1 : 0)))

			const lessonslearnedProjectInsights = lessonsLearnedList.data.lessonslearnedProjectInsights
				.filter((insight: LessonsLearned) => {

					if (insight.status.includes('Deleted')) {
						return false
					} else if (statusFilter.some((status: string) => insight.status.includes(status))) {
						return true
					} else if (showNew && !insight.status.length) {
						return true
					} else if (!showNew && !statusFilter.length) {
						return false
					} else {
						return false
					}
				})


			/*
			* It checks if the id parameter is present in the lessonslearnedProjectInsights array.
			* If not, it sets the id to the first insight in the lessonslearnedProjectInsights array.
			*/
			if (lessonslearnedProjectInsights.length) {
				let openInsight = lessonslearnedProjectInsights.find((insight: LessonsLearned) => insight.id === params.id)
				if (!openInsight) {
					openInsight = lessonslearnedProjectInsights.length && lessonslearnedProjectInsights[0]
				}
				params.tabName === LESSONS_LEARNED_TAB && openDetail(LESSONS_LEARNED_TAB, openInsight.id)
			} else {
				insightsDispatch(setDetailLessonsLearned({} as LessonsLearned))
			}
			insightsDispatch(setLessonsLearnedList(lessonslearnedProjectInsights));
			dispatch(setIsLoading(false))
		} catch (error) {
			console.log(error)
			dispatch(setIsLoading(false))
		}
	}

	const loadScheduleImpactList = async (_insights_archives: Array<any>) => {
		dispatch(setIsLoading(false))
		try {
			const impactedInsightList = await client.query({
				query: LOAD_IMPACTED_INSIGHT_LIST,
				fetchPolicy: 'network-only',
				context: {
					role: 'viewMasterPlan',
					token: state?.selectedProjectToken
				}
			})
			const taskImpactInsight = await client.query({
				query: LOAD_TASK_IMPACT_INSIGHT,
				fetchPolicy: 'network-only',
				context: {
					role: 'viewMasterPlan',
					token: state?.selectedProjectToken
				}
			});

			const insights_archives = _insights_archives.length
				? _insights_archives
				: state?.selectedPreference?.insights_archives
				|| []
			const impactedScheduleList = impactedInsightList.data.projectInsights[0]?.tasks || []
			const taskImpactInsightList = taskImpactInsight.data.projectScheduleImpactInsight || []
			const impactedScheduleListTemp = [] as Array<ScheduleImpactTask>

			impactedScheduleList.forEach((element: ScheduleImpactTask) => {
				if (!insights_archives.includes(element.taskId)) {
					const impactedScheduleObject = {} as ScheduleImpactTask
					impactedScheduleObject.floatValue = element.floatValue
					impactedScheduleObject.plannedStartDate = element.plannedStartDate
					impactedScheduleObject.priority = element.priority
					impactedScheduleObject.taskId = element.taskId
					impactedScheduleObject.taskName = element.taskName
					impactedScheduleObject.delay = element.delay
					impactedScheduleObject.early = element.early
					impactedScheduleObject.remainingFloat = element.remainingFloat
					impactedScheduleObject.msgs = []

					const taskImpactInsightListByTaskId = taskImpactInsightList
						.filter((impactInsight: any) => {
							return impactedScheduleObject.taskId === impactInsight.taskId
						})
					taskImpactInsightListByTaskId.forEach((impactInsight: any) => {
						const priority = impactInsight.priority
						const type = impactInsight
							.type as ScheduleImpactType
						const impactId = impactInsight.id
						const msgs = impactInsight
							.messages_web.msgs || []
						msgs.forEach((msg: string) => {
							if (!insights_archives.includes(impactId)) {
								impactedScheduleObject.msgs.push({
									impactId: impactId,
									msg: msg,
									priority: priority,
									type: type
								})
							}
						})
					})
					impactedScheduleListTemp.push(impactedScheduleObject)
				}
			});
			insightsDispatch(setScheduleImpactList(impactedScheduleListTemp))
			insightsDispatch(setScheduleImpactSearchKeyword(''))
		} catch (error) {
			console.log(error)
		}
		dispatch(setIsLoading(false))
	}

	const loadScheduleImpact = async (id: string) => {
		const detailScheduleImpact = insightsState
			.filterdScheduleImpactList
			.find((scheduleImpactTask: ScheduleImpactTask) => {
				return scheduleImpactTask.taskId === id
			})
		if (detailScheduleImpact) {
			insightsDispatch(setDetailScheduleImpact(detailScheduleImpact))
			insightsDispatch(setOpenInsight(detailScheduleImpact.taskId))
		} else if (insightsState.filterdScheduleImpactList.length) {
			insightsDispatch(setDetailScheduleImpact(insightsState.filterdScheduleImpactList[0]))
			insightsDispatch(setOpenInsight(insightsState.filterdScheduleImpactList[0].taskId))
		} else {
			insightsDispatch(setDetailScheduleImpact({} as ScheduleImpactTask))
		}
	}

	/*
	* This function is used to load the schedule list.
	* Open selected schedule recommendation in detail screen
	* byDefault 0th index will be open.
	*/
	const loadScheduleList = async () => {
		try {
			dispatch(setIsLoading(true))
			/*
			* first queries the maximum schedule timestamp from the database.
			*/
			const latestTimeStamp = await client.query({
				query: LOAD_LATEST_SCHEDULE_TIMESTAMP,
				fetchPolicy: 'network-only',
				context: {
					role: 'viewMasterPlan',
					token: state?.selectedProjectToken
				}
			});
			const createdAt = latestTimeStamp.data.projectInsights[0].createdAt

			/**
			 *  calculate (maximum - 5min) timestamp.
			 */
			const gtCreatedAt =
				new Date(new Date(createdAt).valueOf() - 100)
					.toISOString()

			/*
			* Load all projectInsights with createdAt > (maximum - 5min)
			*/
			const scheduleList = await client.query({
				query: LOAD_SCHEDULE_LIST,
				variables: {
					gt: gtCreatedAt,
					searchKeyword: `%${insightsState.scheduleSearchKeyword}%`
				},
				fetchPolicy: 'network-only',
				context: {
					role: 'viewMasterPlan',
					token: state?.selectedProjectToken
				}
			});

			const projectInsights = scheduleList.data.projectInsights
				.filter((projectInsight: Schedule) => (projectInsight.title))

			if (projectInsights.length) {
				let openInsight = projectInsights.find((insight: LessonsLearned) => insight.id === params.id)
				if (!openInsight) {
					openInsight = projectInsights.length && projectInsights[0]
				}
				params.tabName === SCHEDULE_TAB && openDetail(SCHEDULE_TAB, openInsight.id)
			} else {
				insightsDispatch(setDetailSchedule({} as Schedule))
			}
			insightsDispatch(setScheduleList(projectInsights));
			dispatch(setIsLoading(false))
		} catch (error) {
			console.log(error)
			dispatch(setIsLoading(false))
		}
	}

	const openDetail = (tabName: string, insightId: string) => {
		history.push(`/insights/projects/${params.projectId}/${tabName}/insight/${insightId}`)
		insightsDispatch(setOpenInsight(insightId))
		if (tabName === SCHEDULE_TAB) {
			loadDetailSchedule(insightId)
		} else if (tabName === LESSONS_LEARNED_TAB) {
			loadDetailLessonsLearned(insightId)
		} else if (tabName === SCHEDULE_IMPACT_TAB) {
			loadScheduleImpact(insightId)
		}
	}

	const loadDetailSchedule = async function name(id: string) {
		try {
			dispatch(setIsLoading(true))
			const loadDetailSchedule = await client.query({
				query: LOAD_DETAIL_SCHEDULE,
				variables: { id },
				fetchPolicy: 'network-only',
				context: { role: 'viewMasterPlan', token: state?.selectedProjectToken }
			});
			const detailInsight = JSON.parse(JSON.stringify(loadDetailSchedule.data.projectInsights[0]))
			if (detailInsight.component === 'ScheduleImpact') {
				const taskList = detailInsight.tasks
				detailInsight.tasks = {
					tasks: taskList
				}
			}
			insightsDispatch(setDetailSchedule(detailInsight))
			dispatch(setIsLoading(false))
		} catch (error) {
			console.log(error)
		}
	}

	const loadDetailLessonsLearned = async function name(id: string) {
		try {
			dispatch(setIsLoading(true))
			const loadDetailSchedule = JSON.parse(
				JSON.stringify(
					await client.query({
						query: LOAD_DETAILED_LESSONS_LEARNED,
						variables: { id },
						fetchPolicy: 'network-only',
						context: {
							role: 'viewMasterPlan',
							token: state?.selectedProjectToken
						}
					})));
			const form = loadDetailSchedule
				.data
				.lessonslearnedProjectInsights[0]
				.lessonslearnedInsight
				.form

			if (form) {
				const loadAttachments = await client.query({
					query: LOAD_ATTACHMENTS,
					variables: {
						formId: form.id
					},
					fetchPolicy: 'network-only',
					context: {
						role: 'viewForm',
						token: state?.selectedProjectToken
					}
				});
				form.attachments = loadAttachments.data.attachments
			}
			insightsDispatch(
				setDetailLessonsLearned(
					loadDetailSchedule.data.lessonslearnedProjectInsights[0]
				)
			)
			setAddActivities(false)
			dispatch(setIsLoading(false))
		} catch (error) {
			console.log(error)
		}
	}

	const setIgnored = async (id: string, value: boolean) => {
		try {
			dispatch(setIsLoading(true))
			const status = value ? [...insightsState.detailLessonsLearned.status, LESSONS_LEARNED_STATUS_IGNORED] :
				insightsState.detailLessonsLearned.status
					.filter(state => state !== LESSONS_LEARNED_STATUS_IGNORED)

			const updateStatus = await client.mutate({
				mutation: UPDATE_STATUS,
				variables: {
					id,
					status: `{${status.join()}}`
				},
				context: { role: 'updateMasterPlan', token: state?.selectedProjectToken }
			})
			dispatch(setIsLoading(false))
			Notification.sendNotification(value ?
				'Insight status set to Ignored'
				: 'Insight status set to New',
				AlertTypes.success)
			loadLessonsLearnedList()
		} catch (error) {
			console.log(error)
			dispatch(setIsLoading(false))
		}
	}

	const addActivitiesToLesson = async (taskIds: Array<string>) => {
		setIsLoading(true)
		taskIds.forEach(async (taskId) => {
			try {
				const updateStatus = await client.mutate({
					mutation: ADD_ACTIVITY,
					variables: {
						action: 'None',
						taskId: taskId,
						projectInsightId: insightsState.openInsight,
						updatedAt: new Date().toISOString().replace('T', ' ').replace('Z', ''),
						createdAt: new Date()
					},
					context: { role: 'updateMasterPlan', token: state?.selectedProjectToken }
				})
			} catch (e) {
				console.log(e)
			}
		})
		if (!insightsState.detailLessonsLearned.status.includes(LESSONS_LEARNED_STATUS_ACTED)) {
			try {
				const updateStatus = await client.mutate({
					mutation: UPDATE_STATUS,
					variables: {
						id: insightsState.detailLessonsLearned.id,
						status: `{${[...insightsState.detailLessonsLearned.status, LESSONS_LEARNED_STATUS_ACTED].join()}}`
					},
					context: { role: 'updateMasterPlan', token: state?.selectedProjectToken }
				})
			} catch (e) {
				console.log(e)
			}
		}
		setIsLoading(false)
		setAddActivities(false)
		setTimeout(() => {
			loadDetailLessonsLearned(insightsState.openInsight)
		}, 1000)
	}

	const getInsightCard = () => {
		if (insightsState.openTab === LESSONS_LEARNED_TAB && insightsState.lessonsLearnedList.length) {
			return insightsState.lessonsLearnedList.map((data: LessonsLearned) => {
				return <LessonsLearnedCard
					key={data.id}
					data={data}
					open={data.id === insightsState.openInsight}
					onClick={() => { openDetail(LESSONS_LEARNED_TAB, data.id) }}
				/>
			}
			)
		} else if (insightsState.openTab === SCHEDULE_TAB && insightsState.scheduleList.length) {
			return insightsState.scheduleList.map((data: Schedule) => {
				return <ScheduleCard
					key={data.id}
					data={data}
					open={data.id === insightsState.openInsight}
					onClick={() => { openDetail(SCHEDULE_TAB, data.id) }}
				/>
			})
		} else if (insightsState.openTab === SCHEDULE_IMPACT_TAB && insightsState.filterdScheduleImpactList.length) {
			return insightsState.filterdScheduleImpactList.map((data: ScheduleTask) => {
				return <ScheduleImpactCard
					key={data.taskId}
					data={data}
					open={data.taskId === insightsState.openInsight}
					onClick={() => { openDetail(SCHEDULE_IMPACT_TAB, data.taskId) }}
				/>
			})
		} else {
			return <EmptyCard msg="No Result Found" />
		}
	}

	const getInsightsDetail = () => {
		if (insightsState.openTab === LESSONS_LEARNED_TAB && insightsState.detailLessonsLearned.insightId) {
			return addActivities
				? <AddActivities
					onCancel={() => { setAddActivities(false) }}
					addActivity={addActivitiesToLesson}
					lessonslearnedTaskInsights={insightsState.detailLessonsLearned.lessonslearnedTaskInsights}
				/>
				: <LessonsLearnedDetails
					setAddActivities={() => { setAddActivities(true) }}
					loadDetailLessonsLearned={() => { loadDetailLessonsLearned(insightsState.openInsight) }}
					setIgnored={setIgnored}
				/>
		} else if (insightsState.openTab === SCHEDULE_TAB && insightsState.detailSchedule.id) {
			return <ScheduleDetails />
		} else if (insightsState.openTab === SCHEDULE_IMPACT_TAB && insightsState.detailScheduleImpact.taskId) {
			return <ScheduleImpactDetails
				setIgnored={(insights_archives: Array<any>) => loadScheduleImpactList(insights_archives)} />
		} else {
			return <EmptyCard msg="No Insight Selected" />
		}
	}

	return (
		<insightsContext.Provider value={{ insightsState, insightsDispatch }}>
			<section className={'insights'}>
				<h2 className="insights__heading">Slate Insights Collection </h2>
				<InsightsTab projectId={params.projectId} />
				<div className={insightsState.openTab}>
					{
						insightsState.openTab === SCHEDULE_IMPACT_TAB ?
							<div className="insights__nav">
								<Filter />
								<Button
									size="small"
									variant="contained"
									className="schedule-impact-detail_nav-btn"
									onClick={() => setShareAllModal(true)}
									disabled={!insightsState?.filterdScheduleImpactList?.length}
								>
									SHARE ALL
								</Button>
							</div> : <Filter />
					}
					<ResizeWindow id="hello" leftWidth={30} rightWidth={70} minWidth={400} >
						<ResizeWindow.Slot name="leftActions">
							<section className="insights__cardsContainer">
								{getInsightCard()}
							</section>
						</ResizeWindow.Slot>
						<ResizeWindow.Slot name="rightActions">
							<section className="insights__cardDetails">
								{getInsightsDetail()}
							</section>
						</ResizeWindow.Slot>
					</ResizeWindow>
				</div>
				{
					shareAllModal ? <InsightSendMail
						scheduleImpactList={insightsState.filterdScheduleImpactList}
						detailScheduleImpact={{} as ScheduleImpactTask}
						shareAll={true}
						onClose={() => setShareAllModal(false)} /> : <></>
				}
			</section>
		</insightsContext.Provider>
	)
}

export default Main