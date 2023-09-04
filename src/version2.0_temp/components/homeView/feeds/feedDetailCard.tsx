import React, { useContext, useEffect, useRef, useState } from 'react';
import CloseIcon from '../../../assets/images/icons/closeIcon.svg';
import { CircularProgress } from '@material-ui/core';
import { Popover } from '../../common';
import { FeedAssociatedTask } from './feedAssociatedTask';
import './feedDetailCard.scss';
import { IDetails, IInsight, DATA_SOURCE } from 'src/version2.0_temp/models';
import { getInsightsDetailById } from 'src/version2.0_temp/api/gql';
import { stateContext } from 'src/modules/root/context/authentication/authContext';

interface FeedDetailCardProps {
	insightId: number;
	onClose: any;
}

interface FormInfo {
	formType: string;
	formId: number;
	subject: string;
}

export const FeedDetailCard: React.FC<FeedDetailCardProps> = ({
	insightId,
	onClose,
}) => {
	const { state }: any = useContext(stateContext);
	const [openFeedInsightDetail, setOpenFeedInsightDetail] = useState(false);
	const valueDivRef = useRef<HTMLDivElement>(null);
	const [loading, setLoading] = useState(false);
	const [formType, setFormType] = useState('');
	const [formid, setFormId] = useState(0);
	const [isTask, setIsTask] = useState(false);
	const [taskId, setTaskId] = useState('');
	const [updatePopoverCount, setUpdatePopoverCount] = useState(0);
	const [formInfo, setFormInfo] = useState<FormInfo>({
		formType: '',
		formId: -1,
		subject: '',
	});
	const [formInfoTemp, setFormInfoTemp] = useState<Array<FormInfo> | null>([
		{ formType: '', formId: -1, subject: '' },
	]);
	const [targetBox, setTargetBox] = useState({
		top: 0,
		left: 0,
		width: 0,
		height: 0,
	} as DOMRect);
	const [insightDetail, setInsightDetail] = useState({
		id: insightId,
		messagesLongWeb: {
			msg: '',
			details: [] as Array<IDetails>,
		},
		messagesShortWeb: {
			msg: '',
		},
	} as IInsight);

	const formInfoSetup = (item: IDetails) => {
		switch (item?.datasource) {
			case DATA_SOURCE.RFI_FORMS: {
				setFormInfoTemp((prevState: any) => {
					const prevDetails = [...prevState];
					const newFormItem = {
						formType: DATA_SOURCE.RFI_FORMS,
						formId: Number(item?.formId),
						subject: item?.subject,
					};
					prevDetails.push(newFormItem);
					return prevDetails;
				});
				break;
			}
			case DATA_SOURCE.ISSUE_FORMS: {
				setFormInfoTemp((prevState: any) => {
					const prevDetails = [...prevState];
					const newFormItem = {
						formType: DATA_SOURCE.ISSUE_FORMS,
						formId: Number(item?.formId),
						subject: item?.subject,
					};
					prevDetails.push(newFormItem);
					return prevDetails;
				});
				break;
			}
			case DATA_SOURCE.BUDGET_CHANGE_ORDER_FORMS: {
				setFormInfoTemp((prevState: any) => {
					const prevDetails = [...prevState];
					const newFormItem = {
						formType: DATA_SOURCE.BUDGET_CHANGE_ORDER_FORMS,
						formId: Number(item?.formId),
						subject: item?.subject,
					};
					prevDetails.push(newFormItem);
					return prevDetails;
				});
				break;
			}
      case DATA_SOURCE.QC_CHECKLIST: {
				setFormInfoTemp((prevState: any) => {
					const prevDetails = [...prevState];
					const newFormItem = {
						formType: DATA_SOURCE.QC_CHECKLIST,
						formId: Number(item?.formId),
						subject: item?.subject,
					};
					prevDetails.push(newFormItem);
					return prevDetails;
				});
				break;
			}
			case DATA_SOURCE.DAILYLOG:{
					setFormInfoTemp((prevState: any) => {
					const prevDetails = [...prevState];
					const newFormItem = {
						formType: DATA_SOURCE.DAILYLOG,
						formId: Number(item?.formId),
						subject: item?.subject,
					};
					prevDetails.push(newFormItem);
					return prevDetails;
				});
				break;
			}
			default:
				return;
		}
	};

	useEffect(() => {
		if (insightDetail) {
			setFormInfoTemp([]); //clearing previous state to avoid duplicate data
			insightDetail.messagesLongWeb.details.map((item: IDetails) => {
				formInfoSetup(item);
			});
		}
	}, [insightDetail]);

	useEffect(() => {
		fetchInsightDetail();
	}, []);

	const fetchInsightDetail = async () => {
		setLoading(true);
		const res = await getInsightsDetailById(
			insightId,
			state.selectedProjectToken
		);
		setInsightDetail(res as IInsight);
		setLoading(false);
		const bindingList = valueDivRef.current?.querySelectorAll(
			'span[data-insight="true"]'
		);
		bindingList?.forEach((e: Element) => {
			e.addEventListener('click', showPopover);
		});
	};

	const showPopover = (e: any) => {
		const target = e.target;
		const taskId = target.getAttribute('data-task-id');
		const insightType = target.getAttribute('data-insight-type');
		const formId = target.getAttribute('data-form-id');
		const datasource = target.getAttribute('data-datasource-name');
		const subject = target.innerText;
		const formItem = {
			formType: datasource,
			formId: formId,
			subject: subject,
		} as FormInfo;
		if (taskId) {
			setIsTask(true);
			setTaskId(taskId);
			setFormType(insightType);
			setTargetBox(e.target.getBoundingClientRect());
			setOpenFeedInsightDetail(!openFeedInsightDetail);
		} else {
			setIsTask(false);
			handleLinkClick(e, formItem);
		}
	};

	const handleLinkClick = (e: any, formDetail: FormInfo) => {
		setIsTask(false);
		setFormInfo({
			formType: formDetail?.formType,
			formId: formDetail?.formId,
			subject: formDetail?.subject,
		});
		setOpenFeedInsightDetail(!openFeedInsightDetail);
		setTargetBox(e.target.getBoundingClientRect());
	};

	const handleCloseIcon = () => {
		setFormInfoTemp([]);
		onClose();
	};

	return (
		<div className="v2-feed-detail">
			<div className="v2-feed-detail-nav s-v-center">
				<div className="v2-feed-detail-nav-title">Schedule Insights</div>
				<img
					src={CloseIcon}
					alt=""
					width={'22px'}
					onClick={handleCloseIcon}
				/>
			</div>
			<div className="v2-feed-detail-container">
				{loading ? (
					<div className="s-h-center">
						<CircularProgress
							className="v2-circular-progress"
							size="16px"
							style={{ color: 'orange' }}
						/>
					</div>
				) : (
					<>
						<div className="v2-feed-detail-title">Recommendation:</div>
						<div
							ref={valueDivRef}
							className="v2-feed-detail-value"
							dangerouslySetInnerHTML={{
								__html: insightDetail.messagesLongWeb.msg,
							}}
						/>
						{insightDetail.messagesLongWeb.details.length ? (
							<>
								<div className="v2-feed-detail-title">Linked data:</div>
								<div className="s-flex-column">
									{formInfoTemp?.map((formDetail: FormInfo, index: number) => {
										return (
											<>
												<div
													key={`${index}- ${formDetail.formId}`}
													className="v2-feed-detail-title-form v2-feed-detail-title"
													onClick={(e: any) => {
														handleLinkClick(e, formDetail);
													}}
												>
													{formDetail?.subject}
												</div>
											</>
										);
									})}
								</div>
							</>
						) : (
							<></>
						)}
					</>
				)}
			</div>
			<Popover
				trigger={<></>}
				position="top-right"
				foreignTrigger={true}
				foreignTargetBox={targetBox}
				open={openFeedInsightDetail}
				reRender={updatePopoverCount}
			>
				<FeedAssociatedTask
					onClose={() => setOpenFeedInsightDetail(false)}
					formType={formInfo.formType}
					formId={formInfo.formId}
					isTask={isTask}
					taskId={taskId}
					onDataLoad={() => setUpdatePopoverCount(updatePopoverCount + 1)}
				/>
			</Popover>
		</div>
	);
};
