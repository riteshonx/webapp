import React, { ReactElement, useState, useEffect, useContext } from 'react'
import './ProductivityPopUp.scss';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Button, CircularProgress } from '@material-ui/core';
import TableChartOutlinedIcon from '@material-ui/icons/TableChartOutlined';
import ProductivityWidgetContainer from './ProductivityWidgetContainer/ProductivityWidgetContainer';
import { GET_PRODUCTIVITY_PROJECT_INFO } from 'src/modules/Dashboard/components/Dashboard3/Graphql/Queries/dashboard3';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { client } from 'src/services/graphql';
import { projectFeatureAllowedRoles, ProjectSetupRoles } from 'src/utils/role';
import { postApi } from 'src/services/api';
import { features } from 'src/utils/constants';
import { decodeExchangeToken, decodeProjectExchangeToken } from 'src/services/authservice';

export default function ProductivityPopUp(props: any): ReactElement {

    const { dispatch, state }: any = useContext(stateContext);
    const [tabValue, setTabValue] = React.useState(0);
    const [project, setProjectInfo] = useState<any>(null);
    const [projectToken, setProjectToken] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<any>(false);
    const [infoMsg, setInfoMsg] = useState<any>('');

    useEffect(()=> {
        props.id && fetchProjectDetails();
    }, [])

    useEffect(()=> {
        props.id && fetchProjectDetails();
    }, [props.id])

    const fetchProjectDetails = async () => {
        try {
            setProjectToken(null);
            setIsLoading(true);
            setProjectInfo(null);
            const permission: any = await fetchProjectExchangeToken();
            if (permission && permission.allowedRoles && (permission.allowedRoles.includes(projectFeatureAllowedRoles.viewMasterPlan))) {
                const varible = props.type === 'costCode' ? {
                    dimension: "CLASSCODE",
                    classificationCode: props.id,
                    taskId: null
                } : {
                    dimension: "TASK",
                    classificationCode: null,
                    taskId: props.id
                }
                const metricResponse = await client.query({
                    query: GET_PRODUCTIVITY_PROJECT_INFO,
                    variables: varible,
                    fetchPolicy: 'network-only',
                    context: {
                        role: projectFeatureAllowedRoles.viewMasterPlan,
                        token: permission.projectToken,
                    },
                });
                if(metricResponse?.data?.ProductivityMetrics && metricResponse?.data?.ProductivityMetrics[0]) {
                    setProjectInfo( metricResponse?.data?.ProductivityMetrics[0]);
                }
                setProjectToken(permission.projectToken);
            } else {
                setInfoMsg("You don't have permission view this details")
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
            setInfoMsg('Some error on fetching data')
        }
    };

    const fetchProjectExchangeToken= async ()=>{
        try {
            const ProjectToken: any = {
                tenantId: Number(decodeExchangeToken().tenantId),
                projectId: props.projectId,
                features: [features.MASTERPLAN]
            };
            const projectTokenResponse = await postApi('V1/user/login/exchange', ProjectToken);
            return {
                projectToken: projectTokenResponse.success,
                allowedRoles: getPermission(projectTokenResponse.success)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const getPermission = (argProjectToken: string) => {
        const allwedRols = decodeProjectExchangeToken(argProjectToken).allowedRoles;
        return allwedRols;
    }

    const handleChange = (event: any, newValue: number) => {
        setTabValue(newValue);
    };

    const openReportView = () => {
        props.type === 'costCode' ?
            window.open(`/productivityMetrics/${props.projectId}?classificationcode=${project?.classificationCodeId}`,'_blank') :
            window.open(`/productivityMetrics/${props.projectId}?taskid=${props.id}`,'_blank')
    };

    return (
        <div className="productivity-popup">
            {props.open && <div className={`pp-content ${!props.open ? 'close' : 'open'}`}>
                <div className='header-sec'>
                    <span className='title'>Productivity Details {props.type === 'costCode' ? '(Cost Code)': '(Activity)' }</span>
                    <span className='close-btn' onClick={props.onClose}>Close</span>
                </div>
                <div className='content-sec'>
                    <div className='nav-info'>
                        Portfolio:&nbsp; 
                        <span className='value-info'>{state?.currentPortfolio?.portfolioName}</span>
                        <span className='nav-arrow'>&gt;</span>
                        Project:&nbsp;      
                        <span className='value-info'>{project?.project.name}</span>
                        <span className='nav-arrow'>&gt;</span>
                        <span className='metric-info'>Cost code:&nbsp;  
                            <span className='value-info'>
                                {project?.classificationCode?.classificationCode}  
                                {props.type === 'costCode' ? ' - ' + project?.classificationCode?.classificationCodeName : ''}
                            </span>
                        </span>
                        {props.type === 'activity' ? <>
                            <span className='nav-arrow'>&gt;</span>
                            <span className='metric-info'>Activity:&nbsp;  
                            <span className='value-info'>
                                {project?.projectTask?.taskName}  
                            </span>
                        </span>
                        </> : ''}
                    </div>
                    <div className='tabSection'>
                        <Tabs className='product-metric-tab' value={tabValue} onChange={handleChange} >
                            <Tab label="QTY / Labour Hour"  />
                        </Tabs>
                        <Button onClick={openReportView} startIcon={<TableChartOutlinedIcon />} className="btn-secondary">Report View</Button>
                    </div>
                    {tabValue === 0 && projectToken &&<ProductivityWidgetContainer type={props.type} id={props.type === 'costCode' ? project?.classificationCodeId : props.id} projectId={props.projectId} projectToken={projectToken}/>}
                    {!projectToken &&
                        <div className="productivity-popup-load-widget">
                            {isLoading ? <CircularProgress color="inherit" /> : infoMsg}
                        </div>
                    }
                </div>
            </div>}
        </div>
    )
}
