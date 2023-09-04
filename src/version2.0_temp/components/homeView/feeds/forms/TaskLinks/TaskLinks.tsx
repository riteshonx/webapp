import React,{useState, useEffect} from 'react';
import LinkIcon from '@material-ui/icons/Link';
import './TaskLinks.scss';

interface LinkType {
	name: string;
	__typename: string;
}
interface ProjectTask {
	id: string;
	taskName: string;
	__typename: string;
}
interface TaskLink {
	linktype: LinkType;
	projectTask: ProjectTask;
	__typename: string;
}

interface TaskType{
	form:string;
	task:string;
}

export const TaskLinks = (props: {formTaskLinks: Array<TaskLink>}): React.ReactElement => {
	const { formTaskLinks } = props;
	const [taskType, setTaskType] = useState<TaskType>({form:'', task:''})

	useEffect(()=>{
    if(formTaskLinks){
		setTaskType({...taskType , task:'Task' })
	}
	},[formTaskLinks])
	const renderTaskLinks = formTaskLinks?.map(
		(formTask: TaskLink, index: number) => {
			return (
					<div
						key={`${formTask?.projectTask?.id}-${index}`}
						className="v2-task-link-wrapper-link-item"
					>
						<LinkIcon className="v2-task-link-wrapper-link-item-icon" />
						<div className="v2-task-link-wrapper-link-item-name">
						<span>{`${taskType?.form?taskType?.form:taskType?.task} - `}</span> <span>{formTask?.projectTask?.taskName}</span>
						</div>
					</div>
			);
		}
	);

	return (
		<>
			{formTaskLinks?.length > 0 && (
				<div className="v2-task-link">
					<div className="v2-task-link-label">Links:</div>
					<div className="v2-task-link-wrapper">{renderTaskLinks}</div>
				</div>
			)}
		</>
	);
};
