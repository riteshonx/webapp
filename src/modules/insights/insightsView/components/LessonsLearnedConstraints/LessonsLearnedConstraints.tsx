import React, { ReactElement, useContext, useState } from "react";
import LinkIcon from "@material-ui/icons/Link";
import CloseIcon from "@material-ui/icons/Close";
import { IconButton, Button, Checkbox, Box } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import './LessonsLearnedConstraints.scss'
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';
import { LESSONS_LEARNED_STATUS_ACTED } from '../../../constant'
import Notification, { AlertTypes } from "../../../../shared/components/Toaster/Toaster";
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';



// Model
import { LessonslearnedTaskInsights } from '../../../models/insights'

// GRAPHQL
import {
    UPDATE_STATUS,
    REMOVE_ACTIVITY,
    UPDATE_ACTIVITY,
    ADD_TASK_CONSTRAINTS,
    DELETE_TASK_CONSTRAINTS
} from '../../../graphql/queries/lessonsLearned'
import { client } from '../../../../../services/graphql';

function LessonsLearnedConstraints(props: any): ReactElement {
    const { state, dispatch }: any = useContext(stateContext);
    const [showUnlinkTaskConfirm, setShowUnlinkTaskConfirm ] = useState(false);
    const [showDeleteConstraintsConfirm, setShowDeleteConstraintsConfirm ] = useState(false);
    const [ selectedTask, setSelectedTask ] = useState({} as LessonslearnedTaskInsights)
    const canUpdateMasterPlan = state.projectFeaturePermissons.canupdateMasterPlan
    const canCreateMasterPlan = state.projectFeaturePermissons.cancreateMasterPlan
    const canDeleteMasterPlan = state.projectFeaturePermissons.candeleteMasterPlan


    const deleteProjectTaskConstraints = async (id: string) => {
        try {
            dispatch(setIsLoading(true))
            const updateStatus = await client.mutate({
                mutation: DELETE_TASK_CONSTRAINTS,
                variables: {
                    lessonLearnedTaskInsightId: id
                },
                context: { role: 'deleteMasterPlan', token: state?.selectedProjectToken }
            })
            Notification.sendNotification('Constraint removed successfully', AlertTypes.success)
            props.loadDetailLessonsLearned()
            dispatch(setIsLoading(false))
        } catch (error) {
            dispatch(setIsLoading(false))

        }
    }

    const addProjectTaskConstraints = async (id: string, taskId: string) => {
        try {
            dispatch(setIsLoading(true))
            const updateStatus = await client.mutate({
                mutation: ADD_TASK_CONSTRAINTS,
                variables: {
                    category: 'FORM-Lessons Learned',
                    status: 'open',
                    constraintName: props.subject,
                    lessonLearnedTaskInsightId: id,
                    taskId: taskId
                },
                context: { role: 'createMasterPlan', token: state?.selectedProjectToken }
            })
            Notification.sendNotification("Constraint added successfully", AlertTypes.success)
            props.loadDetailLessonsLearned()
            dispatch(setIsLoading(false))
        } catch {
            dispatch(setIsLoading(false))
        }
    }

    const updateActivity = async (task: LessonslearnedTaskInsights) => {
        try {
            dispatch(setIsLoading(true))
            const updateStatus = await client.mutate({
                mutation: UPDATE_ACTIVITY,
                variables: {
                    id: task.id,
                    action: task.action === 'None' ? 'ConstraintAdded' : 'None'
                },
                context: { role: 'updateMasterPlan', token: state?.selectedProjectToken }
            })
            if (task.action === 'None') {
                addProjectTaskConstraints(task.id, task.taskId)
            } else {
                props.loadDetailLessonsLearned()
                deleteProjectTaskConstraints(task.id)
            }
            dispatch(setIsLoading(false))
        } catch {
            dispatch(setIsLoading(false))
        }
    }

    const actionOnActivity = (task: LessonslearnedTaskInsights) => {
        if (task.action === 'ConstraintAdded') {
            setShowDeleteConstraintsConfirm(true)
            setSelectedTask(task)
        } else {
            updateActivity(task)
        }
    }

    const unLinkTask = async () => {
        try {
            setShowUnlinkTaskConfirm(false)
            dispatch(setIsLoading(true))
            const updateStatus = await client.mutate({
                mutation: REMOVE_ACTIVITY,
                variables: { id: selectedTask.id },
                context: { role: 'updateMasterPlan', token: state?.selectedProjectToken }
            })
            Notification.sendNotification('Link removed successfully', AlertTypes.success)
            if (selectedTask.action === 'ConstraintAdded') {
                deleteProjectTaskConstraints(selectedTask.id)
            } else {
                props.loadDetailLessonsLearned()
                dispatch(setIsLoading(false))
            }
            if (props.lessonslearnedTaskInsights.length < 2) {
                const updateStatus = await client.mutate({
                    mutation: UPDATE_STATUS,
                    variables: {
                        id: props.insightId,
                        status: `{${props.status.filter(
                            (status: string) => status !== LESSONS_LEARNED_STATUS_ACTED).join()}}`
                    },
                    context: { role: 'updateMasterPlan', token: state?.selectedProjectToken }
                })
            }
        } catch {
            dispatch(setIsLoading(false))
        }
    }

    const goToTask = (task: LessonslearnedTaskInsights) => {
        const link = `/scheduling/project-plan/${state.currentProject.projectId}?task-id=${task.taskId}`
        window.open(link, '_blank');
    }

    return (<div className="constraints">
        <div className="constraints__header">
            <h5>{
                props.lessonslearnedTaskInsights.length
                    ? 'Added Constraints'
                    : 'No constraints added till now'}
            </h5>
            <Button
                variant="text"
                size="small"
                onClick={props.setAddActivities}
                disabled={!canUpdateMasterPlan}
            >
                <Add fontSize="inherit" /> {
                props.lessonslearnedTaskInsights.length
                    ? 'Add More'
                    : 'Add constraints to schedule'}
            </Button>
        </div>
        <table className="constraints__table" width={'100%'}>
            <tr>
                <th>Activities</th>
                <th className="constraints__table__relationship">Relationship Type</th>
                <th className="constraints__table__action"></th>
            </tr>
            {
                props.lessonslearnedTaskInsights
                    .map(((task: LessonslearnedTaskInsights, index: number) => (
                        <tr key={'lessonslearnedTaskInsights-' + index} >
                            <td>
                                <div className="constraints__table__name__container">
                                    <IconButton
                                        size="small"
                                        className="constraints__table__name__container__btn"
                                        onClick={() => { goToTask(task) }}
                                    >
                                        <LinkIcon fontSize="inherit" className="constraints__table__name__container__btn__icon" />
                                    </IconButton>
                                    <Box
                                        display="flex"
                                        marginRight="3rem"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        width="100%"
                                    >
                                        <p className="constraints__table__name__container__target">
                                            {task.projectTask.taskType === "task" ? "Task" : "Work Package"}{" "}
                                            - {task.projectTask.taskName}
                                            {/* {task.isNew && <sup>+</sup>}
                                            {task.isTouched && "*"} */}
                                        </p>
                                        <div className="constraints__table__name__container__constraint">
                                            <Checkbox
                                                size="small"
                                                checked={
                                                    task.action === "ConstraintAdded"
                                                }
                                                disabled={!(task.projectTask.status === "To-Do" &&
                                                    canCreateMasterPlan && canDeleteMasterPlan )}
                                                onChange={() => { actionOnActivity(task) }}
                                                id={`constraint-checkbox-${task.id}`}
                                            />
                                            <label
                                                htmlFor={`constraint-checkbox-${task.id}`}
                                                className={`constraints__table__name__container__constraint 
                                                    ${!(task.projectTask.status === "To-Do" &&
                                                    canCreateMasterPlan && canDeleteMasterPlan ) ? "disabled" : ""}`}
                                            >
                                                Add as constraint
                                            </label>
                                        </div>
                                    </Box>
                                </div>
                            </td>
                            <td className="constraints__table__relationship">
                                Relates To
                            </td>
                            <td className="constraints__table__action">
                                <IconButton
                                    size="small"
                                    className="constraints__table__action__btn"
                                    disabled={!canUpdateMasterPlan}
                                    onClick={() => {
                                        setSelectedTask(task)
                                        setShowUnlinkTaskConfirm(true)
                                    }}
                                >
                                    <CloseIcon fontSize="inherit" className="constraints__table__action__btn__icon" />
                                </IconButton>
                            </td>
                        </tr>
                    ))
                    )}
        </table>
        <ConfirmDialog open={showUnlinkTaskConfirm} message={{
            text: `${selectedTask.action === 'ConstraintAdded' ? 'This action will delete the constraint. ' : ''}
                Are you sure you want to remove this link?`,
            cancel: 'Cancel',
            proceed: 'Remove',
        }}
            close={() => setShowUnlinkTaskConfirm(false)} proceed={unLinkTask} />
        <ConfirmDialog open={showDeleteConstraintsConfirm} message={{
            text: `This action will delete the constraint. Are you sure you want to remove this constraint?`,
            cancel: 'Cancel',
            proceed: 'Remove',
        }}
            close={() => setShowDeleteConstraintsConfirm(false)} proceed={() => {
                setShowDeleteConstraintsConfirm(false)
                updateActivity(selectedTask)
            }} />
    </div>)
}

export default LessonsLearnedConstraints
