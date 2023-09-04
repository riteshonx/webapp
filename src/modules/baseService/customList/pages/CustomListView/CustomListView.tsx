import React, { ReactElement, useEffect, useState, useContext } from 'react';
import './CustomListView.scss';
import BackNavigation from '../../../../shared/components/BackNavigation/BackNavigation';
import { Button, TextField } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import CustomListTable from '../../components/CustomListTable/CustomListTable';
import { client } from '../../../../../services/graphql';
import { useDebounce } from '../../../../../customhooks/useDebounce';
import { DELETE_CONFIGURATION_LIST, LOAD_CONFIGURATION_LIST_VALUES } from '../../graphql/queries/customList';
import { CustomListRoles } from '../../../../../utils/role';
import { ConfigurationList } from '../../models/customList';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setIsLoading } from '../../../../root/context/authentication/action';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog/ConfirmDialog';
import { useHistory } from 'react-router-dom';
import { canCreateCustomList, canViewCustomList } from '../../utils/permission';
import CommonHeader from "../../../../shared/components/CommonHeader/CommonHeader"
import Header from 'src/modules/shared/components/Header/Header';
import NoDataMessage from 'src/modules/shared/components/NoDataMessage/NoDataMessage';
import NoPermission from 'src/modules/shared/components/NoPermission/NoPermission';

const confirmMessage = {
    header: "Delete Custom List",
    text: "Are you sure you want to delete the '{list}' list?",
    cancel: "Cancel",
    proceed: "Delete",
  }

  const headerInfo = {
      name : "Custom List",
      description : ""
  }

  const noPermissionMessage="You don't have permission to view customlist"

function CustomeListView(): ReactElement {
    const [searchName, setsearchName] = useState('');
    const [configurationLists, setConfigurationLists] = useState<Array<any>>([]);
    const debounceName= useDebounce(searchName,1000);
    const { dispatch }:any = useContext(stateContext);
    const [deleteData, setDeleteData] = useState<ConfigurationList|null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [dialogData, setDialogData] = useState<any>(null)
    const [hasNonSytemGenaratedItem, setHasNonSytemGenaratedItem] = useState(false);
    const history= useHistory();

    useEffect(() => {
        if(canViewCustomList){
            fetchCustomListBasedOnName()
        }
    }, [debounceName])

    const fetchCustomListBasedOnName=async ()=>{
        try{
            dispatch(setIsLoading(true));
            const response: any= await  client.query({
                query: LOAD_CONFIGURATION_LIST_VALUES,
                variables:{
                    name: `%${debounceName}%`
                },
                fetchPolicy:'network-only',
                context:{role: CustomListRoles.viewCustomList}
            })
            if(response.data.configurationLists.length>0){
                const targetList: Array<ConfigurationList>=[];
                response.data.configurationLists.forEach((item: any)=>{
                    const count=getValidValues(item?.configurationValues);
                    const configItem={
                        id:item.id,
                        name:item.name,
                        configurationValues:count,
                        createdAt: item.createdAt,
                        updatedAt:item.updatedAt,
                        systemGenerated: item.systemGenerated
                    }
                    targetList.push(configItem);
                })
                getSystemGeneratedCustomList(targetList)
                setConfigurationLists(targetList);

            } else{
                setConfigurationLists([]);
            }
            dispatch(setIsLoading(false));
        } catch(error: any){
            console.log(error.message);
            dispatch(setIsLoading(false));
        }
    }


    const getSystemGeneratedCustomList = (targetList: any)=>{
        const nonSystemGenerated = targetList.find((item:any,index:number)=>{
           return !item.systemGenerated
        })
        if(nonSystemGenerated)
            setHasNonSytemGenaratedItem(true)
            else
            setHasNonSytemGenaratedItem(false)
    }

    const getValidValues=(argValues: Array<any>): number=>{
        const parents=argValues.filter((item: any)=>!item.parentId).map((item)=>item.id);
        const childrens= argValues.filter((item: any)=>parents.indexOf(item.parentId)>-1).map((item)=>item.id);
        const grandChildrens= argValues.filter((item: any)=>childrens.indexOf(item.parentId)>-1).map((item)=>item.id);
        const returnValues=[...parents, ...childrens, ...grandChildrens];
        return returnValues.length;
    }

    const createNewCustomList=()=>{
        history.push('/base/customList/create');
    }

    const setDeleteConfirmation=(argData: ConfigurationList)=>{
        setDeleteData(argData);
        const message= {...confirmMessage};
        message.text=message.text.replace("{list}",argData.name);
        setDialogData(message);
        setShowConfirm(true);
    }

    const deleteList= async ()=>{
        try{
            setShowConfirm(false);
            dispatch(setIsLoading(true));
            const responseData: any= await  client.mutate({
                mutation: DELETE_CONFIGURATION_LIST,
                variables:{
                    id: deleteData?.id
                },
                context:{role: CustomListRoles.deleteCustomList}
            });
            if(responseData.data.update_configurationLists.affected_rows>0){
                fetchCustomListBasedOnName();
            }
            dispatch(setIsLoading(false));
        } catch(error: any){
            dispatch(setIsLoading(false));
        }
    }

    const navigateBack = () => {
        history.goBack()
    }

    return (
        <div className="customList">
            {canViewCustomList ? (
            <>  
                <CommonHeader headerInfo={headerInfo}/>
                <div className="customList__action">  
                    <div className="customList__action__search">
                        <TextField value={searchName}
                                    id="list-search-text"
                                    data-testid="customlistSearchText"
                                    type="text"
                                    fullWidth
                                    placeholder="Search"
                                    variant="outlined"
                                    onChange={(e)=>setsearchName(e.target.value)}
                                />
                                <SearchIcon  className="customList__action__search__icon"/>
                    </div> 
                    <div className="customList__action__create">
                        {canCreateCustomList&&  <Button variant="outlined" data-testid="createCustomList" onClick={createNewCustomList}
                                    className="btn-primary">Create a New List</Button>}
                    </div>  
                </div>
                <div className="customList__table">
                    <CustomListTable rows={configurationLists} deleteCustomList={setDeleteConfirmation} 
                         hasNonSytemGenaratedItem={hasNonSytemGenaratedItem}/>
                </div>
            </>):(
                <NoPermission header={"Custom List"} navigateBack={navigateBack} noPermissionMessage={noPermissionMessage}/>
            )}
            {showConfirm?(<ConfirmDialog open={showConfirm} message={dialogData} close={()=>setShowConfirm(false)} proceed={deleteList} />):("")}
        </div>
    )
}

export default CustomeListView;