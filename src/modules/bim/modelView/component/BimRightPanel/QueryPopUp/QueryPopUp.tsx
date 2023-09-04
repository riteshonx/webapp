import React, { useState, useContext, useEffect } from 'react'
import './QueryPopUp.scss'
import { stateContext } from '../../../../../root/context/authentication/authContext';
import { client } from '../../../../../../services/graphql';
import { BIM_FETCH_QUERY_RESULT, FETCH_BIM_VIEW_BY_VIEW, INSERT_BIM_FILTER, INSERT_BIM_VIEW} from '../../../../graphql/bimQuery';
import { projectFeatureAllowedRoles } from '../../../../../../utils/role';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { setIsLoading } from '../../../../../root/context/authentication/action';
import { bimContext } from '../../../../contextAPI/bimContext';
import { generateGraphqlModelCond } from '../../../../container/utils';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Button } from '@material-ui/core';
import {attributeList, operatorsList} from '../../../../constants/query'
import { hexToRgb } from '../../../../container/utils';
import Notification,{ AlertTypes } from '../../../../../shared/components/Toaster/Toaster';
import { setSavedViewList } from '../../../../contextAPI/action';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';

export default function QueryPopUp(props: any) {

    const { dispatch, state }: any = useContext(stateContext);
    const context: any = useContext(bimContext);
    const [viewList, setViewList] = useState<any>([]);
    const [selectedView, setSelectedView] = useState<any>(null);
    const [formError, setFormError] = useState<any>({});

    useEffect(() => {
        setViewList(context.state.savedViewList)
    }, [props.open])

    const handleSubmit = async (e: any) => {
        try {
            dispatch(setIsLoading(true));
            e.preventDefault();

            if (checkFormValidation(e.target.elements)) {
                dispatch(setIsLoading(false));
                return;
            }

            const viewId = (!selectedView || selectedView.viewName !== e.target.elements.viewName.value ) ? 
                await createView(e.target.elements.viewName.value) : selectedView.id;

            const isFilterNameDuplicate = (!selectedView || selectedView.viewName !== e.target.elements.viewName.value) ? false
                : await isDuplicateFilter(viewId, e.target.elements.filterName.value);
            if (isFilterNameDuplicate) {
                setFormError({filterName: "This filter name is already exist"})
                dispatch(setIsLoading(false));
                return;
            }
            
            const filter = {
                title: e.target.elements.filterName.value,
                color: hexToRgb(e.target.elements.filterColor.value),
                queryIds: null,
                handleIds: [],
                isNewFilter: true,
                queryParams: [],
                queryName: '',
                hidden: false
            }
            const queryOption = {
                attribute:  attributeList[attributeList.length - 1],
                attributeOperator: operatorsList.element[0],
                values: props.handleIds || null,
                joinOperator: 'and',
                type: "non_spatial",
                hidden: false
            }
            const newList = [{
                attribute:  queryOption.attribute.value,
                attributeOperator:  queryOption.attributeOperator.value,
                values: queryOption.values,
                joinOperator: queryOption.joinOperator,
                type: queryOption.type,
                hidden: false
            }]
            const modelIds = (context.state.isAssembly) ? context.state.assemblyModelList : [context.state.activeModel]
            const [whereCond, variable]: any[] = await generateGraphqlModelCond([queryOption]);
            
            const filterResult: any = await fetchData(BIM_FETCH_QUERY_RESULT(whereCond,  Object.keys(variable)), {"_in": modelIds, ...variable}) 
            filter.handleIds = filterResult.bimElementProperties.reduce((result: any[], item: any) => {
                result.push(item.sourceId)
                return result
            }, [] as any);

            await updateData(INSERT_BIM_FILTER, {
                "queryName": e.target.elements.queryName.value,
                "queryType": "non_spatial",
                "queryParams": newList,
                "viewId": viewId,
                "modelId": context.state.activeModel ,
                "colours": filter.color,
                "filterName": filter.title,
                "queryResult": filter.handleIds,
                ...(context.state.activeFilterTask) && {"taskId": context.state.activeFilterTask},
            }, projectFeatureAllowedRoles.createBimModel);
            props.handleClose();
            Notification.sendNotification('Query created succesfully', AlertTypes.success);
            dispatch(setIsLoading(false));
        } catch(e) {
            console.log(e);
            Notification.sendNotification('Some error occured on create/update Filter', AlertTypes.error);
            dispatch(setIsLoading(false));
        }
    }

    const handleViewChange = (event: any, value: any):void => {
        setSelectedView(value || null)
    }

    const checkFormValidation = (elements: any) => {
        const fields = ["filterName","queryName","viewName"]
        const frmError: any = {}
        const isFormValid = fields.filter((fieldName: any) => {
            if(!elements[fieldName].value || elements[fieldName].value === '' ) {
                frmError[fieldName]= "This field is required."
                return true
            }
        })
        setFormError(frmError)
        return isFormValid.length > 0;
    }

    const isDuplicateFilter = async (viewId: any, filterName: any) => {
        const data = await fetchData(FETCH_BIM_VIEW_BY_VIEW, { "id": viewId })
        if (data.bimView?.length > 0 && data.bimView[0].bimViewFilterAssociations) {
            return data.bimView[0].bimViewFilterAssociations.find((filterData: any) => {
                return filterData.bimFilter.filterName === filterName;
            });
        } else {
            return true
        }
    }

    const createView = async (viewName: string) => {
        const viewDetails = {
            id: (Math.random() + 1).toString(36).substring(7),
            viewName:  viewName,
            ghostExcluded:  true,
            filterId: []
        }
        const data = await updateData(INSERT_BIM_VIEW, {
            "modelId": context.state.activeModel ,
            "viewName": viewName,
            "ghostExcluded": true
        }, projectFeatureAllowedRoles.createBimModel)
        if(data) {
            viewDetails.id =  data.insert_bimView.returning[0].id
            context.dispatch(setSavedViewList([viewDetails, ...context.state.savedViewList]));
            return viewDetails.id;
        }
    }

    const fetchData = async (query: any, variables: any) => {
        let responseData;
        try {
            responseData = await client.query({
                query: query,
                variables: variables,
                fetchPolicy: 'network-only',
                context: { role: projectFeatureAllowedRoles.viewBimModel, token: state.selectedProjectToken }
            });

        } catch (error: any) {
            console.log(error)
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    const updateData = async (query: any, variable: any, role: any) => {
        let responseData;
        try {
            responseData = await client.mutate({
                mutation: query,
                variables: variable,
                context: { role: role, token: state.selectedProjectToken}
            })
            return responseData.data;
        } catch (error: any) {
            console.log(error.message);
        } finally {
            return (responseData?.data) ? responseData.data : null;
        }
    }

    return (
        <div>
            <Dialog className="queryPopUp" onClose={props.handleClose} open={props.open} maxWidth={"md"} disableBackdropClick>
                <DialogTitle id="scroll-dialog-title" className="dialogTitle">
                    <div className='title'>Create Query</div>
                    <CancelOutlinedIcon onClick={props.handleClose} />
                </DialogTitle>
                <DialogContent id="scrollable_list" className="dialogContent">
                    <form onSubmit={handleSubmit}>
                        <div className='inpustSection'>
                            <InputLabel htmlFor="viewName">View *</InputLabel>
                            <Autocomplete
                                freeSolo={true}
                                id="viewName"
                                options={viewList}
                                onChange={handleViewChange}
                                value={viewList.id}
                                getOptionLabel={(option) => option.viewName}
                                onKeyDown={(e: any) => e.stopPropagation()}
                                renderInput={(params) => <TextField {...params} error={Boolean(formError.viewName)} placeholder={"Select or Create View"} className="textField" fullWidth={true} variant="outlined" />}
                            />
                            <div className='error-info'>{formError.viewName}</div>
                            <InputLabel htmlFor="queryName">Query Name *</InputLabel>
                            <TextField
                                id="queryName"
                                className="textField"
                                placeholder={"Add Query Name"}
                                error={Boolean(formError.queryName)}
                                fullWidth={true} variant="outlined"
                                onKeyDown={(e:any) => e.stopPropagation()}
                            />
                            <div className='error-info'>{formError.queryName}</div>
                            <InputLabel htmlFor="filterName">Filter Name *</InputLabel>
                            <TextField
                                id="filterName"
                                className="textField"
                                placeholder={"Add Filter Name"}
                                error={Boolean(formError.filterName)}
                                fullWidth={true} variant="outlined"
                                onKeyDown={(e:any) => e.stopPropagation()}
                            />
                            <div className='error-info'>{formError.filterName}</div>
                            <div className='colour-input'>
                                <InputLabel htmlFor="filterColor">Pick Filter Color:</InputLabel>
                                <input id="filterColor" type="color" defaultValue={'#6BA366'}/>
                            </div>
                        </div>
                        <div className="submit-section">
                            <Button className="btn-primary"  type="submit" >Create</Button>
                            <Button className="btn-secondary" onClick={() => props.handleClose()} >Cancel</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}