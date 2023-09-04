
import React, { ReactElement, useContext, useEffect } from "react";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SubmittalReviewTable from '../SubmittalReviewTable/SubmittalReviewTable';
import SubmittalRestoreTable from '../SubmittalRestoreTable/SubmittalRestoreTable';
import "./SubmittalReviewTabs.scss";
import { SpecificationLibDetailsContext } from '../../../context/SpecificationLibDetailsContext';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { PUBLISH_SUBMITTAL_INFO_REVIEWED } from "../../../graphql/queries/specification";
import { match, useHistory, useRouteMatch } from "react-router-dom";
import { client } from '../../../../../../services/graphql'
import { GET_SUBMITTAL_DETAIL } from "../../../graphql/queries/specification";
import Notification, { AlertTypes } from '../../../../../shared/components/Toaster/Toaster';
import { setIsLoading } from '../../../../../root/context/authentication/action';
import { specificationRoles } from "../../../../../../utils/role";
import { stateContext } from '../../../../../root/context/authentication/authContext';
import { setSubmittalList, setIsSubmittalPublishDisabled} from "../../../context/SpecificationLibDetailsAction";

export interface Params {
    projectId: string;
    submittalId: string;
}

export default function SubmittalReviewTabs(props: any): ReactElement {

    const pathMatch: match<Params> = useRouteMatch();
    const history = useHistory();
    const { dispatch, state }: any = useContext(stateContext);
    const [tabValue, setTabValue] = React.useState(0);
    const [tableData, setTableData] = React.useState<any[]>([]);
    const [moreAnchorEl, setMoreAnchorEl] = React.useState<HTMLElement | null>(null);
    const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any =
    useContext(SpecificationLibDetailsContext);

    useEffect(() => {
        SpecificationLibDetailsDispatch(setIsSubmittalPublishDisabled(true))
        let isPublishDisabled = false;
        setTableData(SpecificationLibDetailsState.submittalList.reduce(( result: any, submittal: any, index: number) => {
            if ((tabValue === 1 && submittal.review && !submittal.notASubmittal) ||
                (tabValue === 2 && submittal.notASubmittal) ||
                (tabValue === 0 && !submittal.notASubmittal) ) {
                !result[submittal.specId] ? result[submittal.specId] = [{...submittal, uniqueIndex : index }] : 
                    result[submittal.specId].push({...submittal, uniqueIndex : index }); 
            }
            isPublishDisabled = isPublishDisabled || (submittal.division_name == "" || submittal.submittal_type == "" || submittal.section_number === "" || submittal.line_text == "")
            return result;
        }, {} as any))
        SpecificationLibDetailsDispatch(setIsSubmittalPublishDisabled(isPublishDisabled));
    }, [SpecificationLibDetailsState.submittalList, tabValue]);

    const resetToDefault = async () => {
        setMoreAnchorEl(null)
        dispatch(setIsLoading(true));
        const submittals = await fetchSubmittals();
        await mutateSubmittalInfoStatus("REVIEWING_SUBMITTALS", submittals)
        dispatch(setIsLoading(false));
    };

    const mutateSubmittalInfoStatus = async (status: string, submittals: any) => {
        const submittalResponse: any = await graphqlMutation(PUBLISH_SUBMITTAL_INFO_REVIEWED, {
                id: pathMatch.params.submittalId,
                submittalInfoReviewed: {
                    submittalTypes: props.submittalTypes,
                    submittals: submittals,
                },
                status: status,
            }, specificationRoles.updateSpecifications
        )
        return submittalResponse;
    };

    const fetchSubmittals = async () => {        
        const data = await fetchData(GET_SUBMITTAL_DETAIL,{
            id: pathMatch.params.submittalId,
        })
        if(data?.techspecUploadStatus && data?.techspecUploadStatus[0]) {
            SpecificationLibDetailsDispatch(setSubmittalList(data.techspecUploadStatus[0].submittalInfo?.submittals || []))
            return data.techspecUploadStatus[0].submittalInfo?.submittals || []
        }
    };

    const fetchData = async (query: any, variables: any) => {
        let responseData;
        try {
            responseData = await client.query({
                query: query,
                variables: variables,
                fetchPolicy: 'network-only',
                context: { role: specificationRoles.viewSpecifications, token: state.selectedProjectToken }
            });

        } catch (error: any) {
            console.log(error)
            Notification.sendNotification('Some error occured on fecth documents', AlertTypes.error);
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    const graphqlMutation = async (query: any, variable: any, role: any) => {
        let responseData;
        try {
            responseData = await client.mutate({
                mutation: query,
                variables: variable,
                context: { role: role, token: state.selectedProjectToken }
            })
            return responseData.data;
        } catch (error: any) {
            console.log(error.message);
            Notification.sendNotification('Some error occured on update Submittals', AlertTypes.error);
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const showMoreMenu = (event: React.MouseEvent<HTMLElement>) => {
        setMoreAnchorEl(event.currentTarget);
    };

    return (
        <div className="section-review-tab">
            <div className="reviwTitle">Review Submittals</div>
            <div className="reviewTabSection">
                <Tabs className="reviewTabHead" value={tabValue} onChange={handleChange} >
                    <Tab label="All Items"  />
                    <Tab label="Issues" />
                    <Tab label="Deleted Items" />
                </Tabs>
                <MoreVertIcon onClick={(e: any) =>showMoreMenu(e)} />
            </div>
            {tabValue === 2 ? <SubmittalRestoreTable dataInfo={tableData}/> :
            <SubmittalReviewTable submittalTypes={props.submittalTypes} isErrorType={tabValue===1} dataInfo={tableData}/>}
            <Menu
                id="basic-menu"
                anchorEl={moreAnchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right'}}
                transformOrigin={{ vertical: 'top', horizontal: 'right'}}
                open={moreAnchorEl !== null}
                onClose={() => setMoreAnchorEl(null)}
                MenuListProps={{
                'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem key="reset" className="submitalMoreMenuText" onClick={resetToDefault}>Reset to default</MenuItem>
            </Menu>
        </div>
    );
}
