import React, { ReactElement, useEffect, useState } from 'react'
import { makeStyles, createStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import { useDebounce } from "src/customhooks/useDebounce";
import { getApiSchedulerWithExchange } from "src/services/api";
import Checkbox from '@mui/material/Checkbox';
import Pagination from "@material-ui/lab/Pagination";
import { Activity } from 'src/modules/insights/models/insights';
import { LessonslearnedTaskInsights } from '../../../models/insights'

import './AddActivities.scss'

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            marginRight: "2rem",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginTop: "2rem",
            marginBottom: "80px"
        },
        pagination: {
            margin: 0,
            marginLeft: '20px'
        },
    })
);

function AddActivities(props: any): ReactElement {
    const classes = useStyles();
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingSearch, setLoadingSearch] = useState(false)
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [page, setPage] = useState(0);
    const [totalPage, setTotalPage] = useState(0);
    const [limit, setPageLimit] = useState(10);
    const [activityList, setActivityList] = useState([] as Array<Activity>);
    const [selectedActivityList, setSelectedActivityList] = useState([] as Array<Activity>)

    useEffect(() => {
        (async () => {
            try {
                setLoadingSearch(true);
                setActivityList([]);
                const response = await getApiSchedulerWithExchange(
                    `V1/task_type/wp_tasks?page=${page}&limit=${limit}&search_term=${debouncedSearchTerm}`
                );
                setTotalPage(response.totalPages)
                const selectedActivityIdList = selectedActivityList.map((activity: Activity) => activity.id)
                const linkedActivityIdList = props.lessonslearnedTaskInsights.map((task: LessonslearnedTaskInsights) => task.taskId)
                const activityList = response.tasksAndWp.map((activity: Activity) => ({
                    ...activity,
                    isSelected: linkedActivityIdList.includes(activity.id) || selectedActivityIdList.includes(activity.id),
                    isAdded: linkedActivityIdList.includes(activity.id)
                }))
                setActivityList(activityList);
                setLoadingSearch(false);
            } catch {
                console.log('error')
                setLoadingSearch(false);
            }
        })();
    }, [debouncedSearchTerm, limit, page]);

    const rowChanged = (index: number) => {
        if (activityList[index].isSelected) {
            activityList[index].isSelected = false
            setActivityList([...activityList])
            setSelectedActivityList(selectedActivityList
                .filter((activity: Activity) => activity.id !== activityList[index].id))
        } else {
            activityList[index].isSelected = true
            setActivityList([...activityList])
            setSelectedActivityList([...selectedActivityList, activityList[index]])
        }
    }

    const addActivity = () => {
        props.addActivity(selectedActivityList.map((activity: Activity) => activity.id))
    }

    return (
        <section className='addActivities'>
            <div className='addActivities__header'>
                <h2 className="addActivities__header__title">
                    Add Constraint
                </h2>
            </div>
            <div className="addActivities__tab">
                <div className="addActivities__tab__title">
                    Activities
                    {selectedActivityList.length ? <span>{selectedActivityList.length}</span> : <></>}
                </div>
            </div>
            <div className="addActivities__search">
                <label htmlFor="addActivities__search">
                    <SearchIcon />
                </label>
                <input
                    type="search"
                    id="addActivities__search"
                    placeholder="Search"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className='addActivities__container'>
                <table className="addActivities__table" width={'100%'}>
                    <thead>
                        <tr>
                            <th className="addActivities__table__row">Activity Name</th>
                            <th className="addActivities__table__row">Activity Type</th>
                            <th className="addActivities__table__row">Parent Activity</th>
                            <th className="addActivities__table__row">Status</th>
                            <th className="addActivities__table__row">Start Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            activityList.map((activity: Activity, index: number) =>
                                <tr key={activity.id}>
                                    <td className={activity.isSelected ? 'addActivities__table__row selected' : 'addActivities__table__row'}>
                                        <Checkbox
                                            checked={activity.isSelected}
                                            onChange={() => rowChanged(index)}
                                            disabled={activity.isAdded}
                                        />
                                        <span title={activity.taskName || '--'} >{activity.taskName || '--'}</span>
                                    </td>
                                    <td
                                        title={activity.taskType || '--'}
                                        className={activity.isSelected ? 'addActivities__table__row selected' : 'addActivities__table__row'}
                                    >
                                        {(() => {
                                            switch (activity.taskType) {
                                                case "task":
                                                    return "Task";
                                                case "work_package":
                                                    return "Work Package";
                                                default:
                                                    return "--";
                                            }
                                        })()}
                                    </td>
                                    <td
                                        title={activity.parentDetails?.taskName || '--'}
                                        className={activity.isSelected ? 'addActivities__table__row selected' : 'addActivities__table__row'}
                                    >
                                        {activity.parentDetails?.taskName || '--'}
                                    </td>
                                    <td
                                        title={activity.status || '--'}
                                        className={activity.isSelected ? 'addActivities__table__row selected' : 'addActivities__table__row'}
                                    >
                                        {activity.status || '--'}
                                    </td>
                                    <td
                                        title={activity.plannedStartDate || '--'}
                                        className={activity.isSelected ? 'addActivities__table__row selected' : 'addActivities__table__row'}
                                    >
                                        {activity.plannedStartDate || '--'}
                                    </td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
                {
                    activityList.length ? <></> : <h3 className='addActivities__no-match-found'>No Match Found</h3>
                }
            </div>
            {activityList.length ? <div className="addActivities__pagination">
                <span>Per Page</span>
                <select value={limit} onChange={(e) => {
                    setPageLimit(parseInt(e?.target?.value))
                    setPage(0)
                }} >
                    <option value={10} >10</option>
                    <option value={20} >20</option>
                    <option value={50} >50</option>
                    <option value={100} >100</option>
                </select>
                <Pagination
                    count={totalPage}
                    page={page + 1}
                    onChange={(e, value) => { setPage(value - 1) }}
                    variant="outlined"
                    shape="rounded"
                    className={classes.pagination}
                />
            </div> : <></>}
            <div className="addActivities__action">
                <button
                    onClick={props.onCancel}
                    className='addActivities__action__cancel'>
                    Cancel
                </button>
                <button
                    onClick={addActivity}
                    disabled={!selectedActivityList.length}
                    className='addActivities__action__add'>
                    Add Constraint
                </button>
            </div>
        </section>
    )
}

export default AddActivities