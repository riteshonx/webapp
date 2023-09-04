import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import DrawingHeaders from '../../components/DrawingHeaders/DrawingHeaders';
import './CustomTemplateLists.scss';
import CustomTemplatesAction from '../../components/CustomTemplatesAction/CustomTemplatesAction';
import { useDebounce } from 'src/customhooks/useDebounce';
import CustomTemplatesList from '../../components/CustomTemplatesList/CustomTemplatesList';
import { stateContext } from 'src/modules/root/context/authentication/authContext';
import { client } from 'src/services/graphql';
import { DELETE_CUSTOM_TEMPLATE, FETCH_CUSTOM_TEMPLATE_LISTS, GET_MYPROJECT_DETAILS } from '../../graphql/queries/customFormatTemplate';
import { setIsLoading } from 'src/modules/root/context/authentication/action';
import { projectFeatureAllowedRoles } from 'src/utils/role';
import Notification,{ AlertTypes } from '../../../../shared/components/Toaster/Toaster';
import moment from 'moment';
import Header from '../../../../shared/components/Header/Header';
import NoDataMessage from 'src/modules/shared/components/NoDataMessage/NoDataMessage';
import { decodeProjectExchangeToken } from 'src/services/authservice';

const noPermissionMessage = `You don't have permission to view custom templates`;
export interface Params {
    projectId: string;
}

interface templateFormat {
    id: string,
    name: string,
    createdBy: string
    createdAt: string,
    drawingUploadStatus: Array<any>
    drawingSheets?: Array<any>
  }

const header = {
    name: 'Drawing Templates',
    description: 'View all templates inside your project'
}

// const defaultTemplates: templateFormat[] = [
//     {
//         id:"9f3dad40-487d-4c29-8993-92c13de85fcb",
//         name:"US and Canada",
//         createdBy: '',
//         createdAt: ''
//      },
//      {
//         id:"ce3c40a4-7ff8-4551-8146-39e11d153cc8",
//         name:"BS1192(UK)",
//         createdBy: '',
//         createdAt: '',
//      }
// ]

export default function CustomTemplateLists(): ReactElement {

    const history = useHistory();
    const pathMatch:match<Params>= useRouteMatch();
    const [searchText, setsearchText] = useState('');
    const debounceName = useDebounce(searchText, 1000);
    const [templateFormatData, setTemplateFormatData] = useState<any>([]);
    const {state, dispatch }:any = useContext(stateContext);


    useEffect(() => {
        if(state.selectedProjectToken && 
        state?.projectFeaturePermissons?.canuploadDrawings){
            fetchCustomTemplateLists();
        }
    }, [state.selectedProjectToken]);

    useEffect(() => {
        if(state.selectedProjectToken && 
            state?.projectFeaturePermissons?.canuploadDrawings){
            fetchCustomTemplateLists();
        }
    }, [debounceName])

    const createCustomTemplate = () => {
        history.push(`/drawings/projects/${pathMatch.params.projectId}/create-custom-template`);     
    }

    const navigateBack = () => {
        history.push(`/drawings/projects/${pathMatch.params.projectId}/drawing-management`)
    }

    const searchTaskByTemplateName = (value: string) => {
        setsearchText(value)
    }

    //fetch template lists
    const fetchCustomTemplateLists = async()=>{
        try{
            dispatch(setIsLoading(true));
            const customTempListResponse = await client.query({
                query: FETCH_CUSTOM_TEMPLATE_LISTS,
                variables: {
                    offset: 0,
                    limit: 10000,
                    searchText: `%${debounceName}%`,
                },
                fetchPolicy: 'network-only',
                context:{role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken}
            });

            const myProjectDetailsResponse = await client.query({
                query: GET_MYPROJECT_DETAILS,
                variables: {
                    projectId: `${decodeProjectExchangeToken()?.projectId}`,
                },
                fetchPolicy: 'network-only',
                context:{role: 'viewMyProjects'}
            });

            const targetProject = myProjectDetailsResponse?.data?.project[0];

            const customTemplateListData: templateFormat[] = [];
            
            if(customTempListResponse?.data?.drawingTemplateFormat.length > 0){
                customTempListResponse?.data?.drawingTemplateFormat.forEach((item: any) => {
                    const newItem= JSON.parse(JSON.stringify(item));
                    const templateData : templateFormat= {
                        id: newItem?.id,
                        name: newItem?.name,
                        createdBy:newItem?.tenantAssociation ? (newItem?.tenantAssociation?.user.firstName  ? 
                            `${newItem?.tenantAssociation?.user.firstName} ${newItem?.tenantAssociation?.user.lastName}` : 
                            `${newItem?.tenantAssociation?.user.email}`) : 
                            (targetProject?.userByCreatedby?.firstName  ? 
                                `${targetProject?.userByCreatedby?.firstName} ${targetProject?.userByCreatedby?.lastName}` : 
                                `${targetProject?.userByCreatedby?.email}`),
                        createdAt: newItem?.tenantAssociation ? newItem?.createdAt : targetProject?.createdAt,
                        drawingUploadStatus: newItem?.drawingUploadStatuses,
                        drawingSheets: newItem?.drawingSheets
                    }
                    customTemplateListData.push(templateData);
                })

            }
            
            setTemplateFormatData(customTemplateListData);
            dispatch(setIsLoading(false));
            
        }catch(error){
            console.log(error);
            Notification.sendNotification(error, AlertTypes.warn);
            dispatch(setIsLoading(false));
        }
    }

    const deleteTemplate = (selectedTemplate: any) => {
        deleteCustomTemplate(selectedTemplate)
    }

    const deleteCustomTemplate = async (selectedTemplate: any) => {
        try{
            dispatch(setIsLoading(true));
            const updateDrawingResponse: any = await client.mutate({
                mutation: DELETE_CUSTOM_TEMPLATE,
                variables: {
                    id: selectedTemplate.id,
                },
                context:{role: projectFeatureAllowedRoles.uploadDrawings, token: state.selectedProjectToken}
            })
            if(updateDrawingResponse.data.update_drawingTemplateFormat.affected_rows > 0){
                fetchCustomTemplateLists();
                Notification.sendNotification("Template deleted successfully", AlertTypes.success);
            }
            dispatch(setIsLoading(false));
        }
        catch(err: any){
            dispatch(setIsLoading(false));
            Notification.sendNotification(err, AlertTypes.warn);
            console.log(err)
        }
    }

    return (
        <div className='templates'>
            {
                state?.projectFeaturePermissons?.canviewDrawings ? (
                    <>
                        <DrawingHeaders headerInfo={header} navigate={navigateBack}/>
                        <CustomTemplatesAction searchText={searchText} searchTask={searchTaskByTemplateName} createTemplate={createCustomTemplate}/>
                        <CustomTemplatesList templateFormatData={templateFormatData} deleteTemplate={deleteTemplate}/>
                    </>
                ): (
                    state.projectFeaturePermissons &&
                    (!state.projectFeaturePermissons?.canviewDrawings ? (
                        <div className="noPublishDrawingPermission">
                            <div className="noCreatePermission____header">
                                <Header header={'Drawing Templates'} navigate={navigateBack}/>
                            </div>
                            <div className="no-permission">
                                <NoDataMessage message={noPermissionMessage}/> 
                            </div>
                        </div>
                    ) : (''))  
                )
            }
        </div>
    )   
}
