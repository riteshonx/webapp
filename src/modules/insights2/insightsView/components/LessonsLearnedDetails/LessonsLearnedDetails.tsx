import React, { ReactElement, useContext } from "react";
import { Button } from "@material-ui/core";
import { InfoOutlined } from "@material-ui/icons";
import { styled } from '@mui/material/styles';
import { Tooltip, TooltipProps } from "@material-ui/core";
import { tooltipClasses } from "@mui/material";
import LessonsLearnedConstraints from "../LessonsLearnedConstraints/LessonsLearnedConstraints";
import Attachments from "../Attachments/Attachments";
import './LessonsLearnedDetails.scss'
import moment from 'moment';


// Context
import { stateContext } from '../../../../root/context/authentication/authContext';
import { LessonsLearned } from "src/modules/insights2/models/insights";


function LessonsLearnedDetails(props: any): ReactElement {
	const { detailLessonsLearned } : { detailLessonsLearned: LessonsLearned} = props

	const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
		<Tooltip {...props} classes={{ popper: className }} />
	))(() => ({
		[`& .${tooltipClasses.tooltip}`]: {
			backgroundColor: '#fff',
			color: 'rgba(0, 0, 0, 0.87)',
			maxWidth: 220,
			border: '0.5px solid rgba(0, 0, 0, 0.2)'
		},
		[`& .${tooltipClasses.tooltip} h5`]: {
			fontSize: '12px',
			marginBottom: '5px',
			color: 'var(--onx-A1)'
		},
		[`& .${tooltipClasses.tooltip} p`]: {
			fontSize: '10px',
			color: 'var(--onx-A2)'
		}
	}));
	const { state }: any = useContext(stateContext)
	const canUpdateMasterPlan = state.projectFeaturePermissons.canupdateMasterPlan

	const getProjectName = () => {
		const projectList = state.projectList || []
		const project = projectList
			.find((project: any) =>
				project.projectId === detailLessonsLearned.lessonslearnedInsight.projectId
			) || {}
		return project.projectName || '--'
	}

	const getIgnored = () => {
		return !!detailLessonsLearned.status
			.find((state: string) => state.toLocaleLowerCase() === 'ignored')
	}

	if (detailLessonsLearned.insightId) {
		return (
			<section className="v2-lessonsLearnedDetails">
				<div className="v2-lessonsLearnedDetails__header">
					<h2 className="v2-lessonsLearnedDetails__header__title">
						{detailLessonsLearned.lessonslearnedInsight.subject}
					</h2>
					{
						state?.projectFeaturePermissons?.canupdateMasterPlan && (
							<div className="v2-lessonsLearnedDetails__header__action">
								{getIgnored() ?
									<Button
										onClick={() => props.setIgnored(detailLessonsLearned.id, false)}
										size="small"
										variant="outlined"
										className="v2-lessonsLearnedDetails__header__action__button"
										disabled={!canUpdateMasterPlan}
									>
										Undo Ignored
									</Button>
									:
									<Button
										onClick={() => props.setIgnored(detailLessonsLearned.id, true)}
										size="small"
										variant="contained"
										className="v2-lessonsLearnedDetails__header__action__button"
										disabled={!canUpdateMasterPlan}
									>
										Ignore
									</Button>
								}
								<Button
									onClick={() => { props.setAddActivities(true) }}
									size="small"
									variant="contained"
									className="v2-lessonsLearnedDetails__header__action__button"
									disabled={!canUpdateMasterPlan}
								>
									Add Constraint to Schedule
								</Button>
							</div>
						)
					}
				</div>
				<div className="v2-lessonsLearnedDetails__content">
					<HtmlTooltip
						placement="left-start"
						arrow
						title={
							<React.Fragment>
								{/* TODO: Need Heading value for tooltip title */}
								<h5></h5>
								<p>AI driven insights based on lessons learned data.</p>
							</React.Fragment>
						}
					>
						<InfoOutlined className="v2-lessonsLearnedDetails__content__info"></InfoOutlined>
					</HtmlTooltip>
					<div className="v2-lessonsLearnedDetails__content__followUp">
						<h4>Follow Up Action:</h4>
						<p>{detailLessonsLearned.lessonslearnedInsight.followUpAction || '--'}</p>
					</div>
					<div className="v2-lessonsLearnedDetails__content__description">
						<h4>Description </h4>
						<p>{detailLessonsLearned.lessonslearnedInsight.description || '--'}</p>
					</div>
					<div className="v2-lessonsLearnedDetails__content__parameter">
						<div className="v2-lessonsLearnedDetails__content__parameter__group" >
							<h4>Primary System:</h4>
							<p>{detailLessonsLearned.lessonslearnedInsight.projectPrimarySystem || '--'}</p>
						</div>
						<div className="v2-lessonsLearnedDetails__content__parameter__group" >
							<h4>Secondary System:</h4>
							<p>{detailLessonsLearned.lessonslearnedInsight.projectSecondarySystem || '--'}</p>
						</div>
						<div className="v2-lessonsLearnedDetails__content__parameter__group" >
							<h4>Date Raised:</h4>
							<p>{detailLessonsLearned.lessonslearnedInsight.projectDateRaised ?
								moment(detailLessonsLearned.lessonslearnedInsight.projectDateRaised).format('YYYY:MM:DD') 
							: '--'}</p>
						</div>
						<div className="v2-lessonsLearnedDetails__content__parameter__group" >
							<h4>Stage:</h4>
							<p>{detailLessonsLearned.lessonslearnedInsight.stage || '--'}</p>
						</div>
						<div className="v2-lessonsLearnedDetails__content__parameter__group" >
							<h4>Activity:</h4>
							<p>{detailLessonsLearned.lessonslearnedInsight.activity || '--'}</p>
						</div>
						<div className="v2-lessonsLearnedDetails__content__parameter__group" >
							<h4>Required Time to Action:</h4>
							<p>{detailLessonsLearned.lessonslearnedInsight.leadTime || '--'}</p>
						</div>
						<div className="v2-lessonsLearnedDetails__content__parameter__group" >
							<h4>Role:</h4>
							<p>{detailLessonsLearned.lessonslearnedInsight.userRole || '--'}</p>
						</div>

						<div className="v2-lessonsLearnedDetails__content__parameter__group" >
							<h4>Type</h4>
							{/* TODO: Bind With correct data */}
							<p>--</p>
						</div>
						<div className="v2-lessonsLearnedDetails__content__parameter__group" >
							<h4>Positive / Issue?</h4>
							<p>{detailLessonsLearned.lessonslearnedInsight.outcomeType || '--'}</p>
						</div>

					</div>
					<LessonsLearnedConstraints
						insightId={detailLessonsLearned.id}
						status={detailLessonsLearned.status}
						lessonslearnedTaskInsights={detailLessonsLearned.lessonslearnedTaskInsights}
						setAddActivities={() => { props.setAddActivities(true) }}
						loadDetailLessonsLearned={props.loadDetailLessonsLearned}
						subject={detailLessonsLearned.lessonslearnedInsight.subject}
					/>
					{ detailLessonsLearned.lessonslearnedInsight.form &&
						detailLessonsLearned.lessonslearnedInsight.form.attachments &&
						detailLessonsLearned.lessonslearnedInsight.form.attachments.length
						? <Attachments form={detailLessonsLearned.lessonslearnedInsight.form} />
						: <></>
					}
				</div>
			</section>
		)
	} else {
		return <></>
	}
}

export default LessonsLearnedDetails