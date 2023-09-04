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
import { insightsContext } from "src/modules/insights/context/insightsContext";
import { IInsightsContext } from "src/modules/insights/models/insights";
import { stateContext } from '../../../../root/context/authentication/authContext';


function LessonsLearnedDetails(props: any): ReactElement {

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

	const { insightsState, insightsDispatch } = useContext(insightsContext) as IInsightsContext
	const { state }: any = useContext(stateContext)
	const canUpdateMasterPlan = state.projectFeaturePermissons.canupdateMasterPlan

	const getProjectName = () => {
		const projectList = state.projectList || []
		const project = projectList
			.find((project: any) =>
				project.projectId === insightsState.detailLessonsLearned.lessonslearnedInsight.projectId
			) || {}
		return project.projectName || '--'
	}

	const getIgnored = () => {
		return !!insightsState.detailLessonsLearned.status
			.find(state => state.toLocaleLowerCase() === 'ignored')
	}

	if (insightsState.detailLessonsLearned.insightId) {
		return (
			<section className="lessonsLearnedDetails">
				<div className="lessonsLearnedDetails__header">
					<h2 className="lessonsLearnedDetails__header__title">
						{insightsState.detailLessonsLearned.lessonslearnedInsight.subject}
					</h2>
					{
						state?.projectFeaturePermissons?.canupdateMasterPlan && (
							<div className="lessonsLearnedDetails__header__action">
								{getIgnored() ?
									<Button
										onClick={() => props.setIgnored(insightsState.detailLessonsLearned.id, false)}
										size="small"
										variant="outlined"
										className="lessonsLearnedDetails__header__action__button"
										disabled={!canUpdateMasterPlan}
									>
										Undo Ignored
									</Button>
									:
									<Button
										onClick={() => props.setIgnored(insightsState.detailLessonsLearned.id, true)}
										size="small"
										variant="contained"
										className="lessonsLearnedDetails__header__action__button"
										disabled={!canUpdateMasterPlan}
									>
										Ignore
									</Button>
								}
								<Button
									onClick={() => { props.setAddActivities(true) }}
									size="small"
									variant="contained"
									className="lessonsLearnedDetails__header__action__button"
									disabled={!canUpdateMasterPlan}
								>
									Add Constraint to Schedule
								</Button>
							</div>
						)
					}
				</div>
				<div className="lessonsLearnedDetails__content">
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
						<InfoOutlined className="lessonsLearnedDetails__content__info"></InfoOutlined>
					</HtmlTooltip>
					<div className="lessonsLearnedDetails__content__followUp">
						<h4>Follow Up Action:</h4>
						<p>{insightsState.detailLessonsLearned.lessonslearnedInsight.followUpAction || '--'}</p>
					</div>
					<div className="lessonsLearnedDetails__content__description">
						<h4>Description </h4>
						<p>{insightsState.detailLessonsLearned.lessonslearnedInsight.description || '--'}</p>
					</div>
					<div className="lessonsLearnedDetails__content__parameter">
						<div className="lessonsLearnedDetails__content__parameter__group" >
							<h4>Primary System:</h4>
							<p>{insightsState.detailLessonsLearned.lessonslearnedInsight.projectPrimarySystem || '--'}</p>
						</div>
						<div className="lessonsLearnedDetails__content__parameter__group" >
							<h4>Secondary System:</h4>
							<p>{insightsState.detailLessonsLearned.lessonslearnedInsight.projectSecondarySystem || '--'}</p>
						</div>
						<div className="lessonsLearnedDetails__content__parameter__group" >
							<h4>Date Raised:</h4>
							<p>{insightsState.detailLessonsLearned.lessonslearnedInsight.projectDateRaised ?
								moment(insightsState.detailLessonsLearned.lessonslearnedInsight.projectDateRaised).format('YYYY:MM:DD') 
							: '--'}</p>
						</div>
						<div className="lessonsLearnedDetails__content__parameter__group" >
							<h4>Stage:</h4>
							<p>{insightsState.detailLessonsLearned.lessonslearnedInsight.stage || '--'}</p>
						</div>
						<div className="lessonsLearnedDetails__content__parameter__group" >
							<h4>Activity:</h4>
							<p>{insightsState.detailLessonsLearned.lessonslearnedInsight.activity || '--'}</p>
						</div>
						<div className="lessonsLearnedDetails__content__parameter__group" >
							<h4>Required Time to Action:</h4>
							<p>{insightsState.detailLessonsLearned.lessonslearnedInsight.leadTime || '--'}</p>
						</div>
						<div className="lessonsLearnedDetails__content__parameter__group" >
							<h4>Role:</h4>
							<p>{insightsState.detailLessonsLearned.lessonslearnedInsight.userRole || '--'}</p>
						</div>

						<div className="lessonsLearnedDetails__content__parameter__group" >
							<h4>Type</h4>
							{/* TODO: Bind With correct data */}
							<p>--</p>
						</div>
						<div className="lessonsLearnedDetails__content__parameter__group" >
							<h4>Positive / Issue?</h4>
							<p>{insightsState.detailLessonsLearned.lessonslearnedInsight.outcomeType || '--'}</p>
						</div>

					</div>
					<LessonsLearnedConstraints
						insightId={insightsState.detailLessonsLearned.id}
						status={insightsState.detailLessonsLearned.status}
						lessonslearnedTaskInsights={insightsState.detailLessonsLearned.lessonslearnedTaskInsights}
						setAddActivities={() => { props.setAddActivities(true) }}
						loadDetailLessonsLearned={props.loadDetailLessonsLearned}
						subject={insightsState.detailLessonsLearned.lessonslearnedInsight.subject}
					/>
					{ insightsState.detailLessonsLearned.lessonslearnedInsight.form &&
						insightsState.detailLessonsLearned.lessonslearnedInsight.form.attachments &&
						insightsState.detailLessonsLearned.lessonslearnedInsight.form.attachments.length
						? <Attachments form={insightsState.detailLessonsLearned.lessonslearnedInsight.form} />
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