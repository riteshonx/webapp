import { Button, FormControl, makeStyles, Theme } from '@material-ui/core';
import { createStyles } from '@material-ui/styles';
import React, { useContext, useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import './AddVariance.scss';


import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { client } from '../../../../../../services/graphql';
import { CREATE_TASK_VARIANCE } from '../../../../graphql/queries/weeklyplan';
import { projectFeatureAllowedRoles } from '../../../../../../utils/role';
import { stateContext } from '../../../../../root/context/authentication/authContext';
import { priorityPermissions } from '../../../../permission/scheduling';
import { setIsLoading } from '../../../../../root/context/authentication/action';
import { LOAD_CONFIGURATION_LIST_VALUES } from '../../../../graphql/queries/customList';
import { CustomListRoles } from '../../../../../../utils/role';
import { ConfigurationList } from '../../../../graphql/models/customList';

// const categories = [
//     {
//         value: 'Coordination Problem'
//     },  
//     {
//         value: 'Engineering/Design'
//     },     
//     {
//         value: 'Owner Decision'
//     },   
//     {
//         value: 'Weather'
//     },
//     {
//         value: 'Prerequisite Work Not Complete'
//     },
//     {
//         value: 'Site Conditions'
//     },
//     {
//         value: 'Labor Management'
//     },
//     {
//         value: 'Materials Management'
//     },
//     {
//         value: 'Equipment Management'
//     },  
//     {
//         value: 'Contracts/ Change Orders'
//     }, 
//     {
//         value: 'RFIs'
//     },
//     {
//         value: 'Submittals'
//     },
//     {
//         value: 'Approvals/Permits'
//     },
//     {
//         value: 'Space/Required Spacing'
//     },
//     {
//         value: 'Site Conditions/Incidents'
//     },
//     {
//         value: 'Completed Early (Positive)'
//     }               
// ] 


const AddVariance = (props: any) => {
    const [category, setCategory] = useState<any>('');
    const [name, setName] = useState<any>('');
    const { state, dispatch }:any = useContext(stateContext);
    const [categories, setCategories] = useState<Array<any>>([]);

  const handleClose = () => {
    props.close();
  };

  useEffect(() => {
    fetchCustomListBasedOnName();
},[])

const fetchCustomListBasedOnName=async ()=>{
    try{
        dispatch(setIsLoading(true));
        const response: any= await  client.query({
            query: LOAD_CONFIGURATION_LIST_VALUES,
            variables:{
                name: `${'Variance Category'}`
            },
            fetchPolicy:'network-only',
            context: { role: projectFeatureAllowedRoles.viewMasterPlan, token: state?.selectedProjectToken }
        })
        if(response.data.configurationLists.length>0){
            const varianceCategory = response.data.configurationLists[0];
            const projectCategoryList = response.data.configurationLists[0].projectConfigAssociations;
            const varianceList: any = [];
            varianceCategory.configurationValues.forEach((item: any) => {
                if(projectCategoryList && projectCategoryList.length) {
                    const listAssociationIndex = projectCategoryList.findIndex((configId: any) => configId.configValueId === item.id);
                    if(listAssociationIndex !== -1) {
                        const constraintObj: any = {};
                        constraintObj.value = item.nodeName
                        varianceList.push(constraintObj);
                    }
                } else {
                    const constraintObj: any = {};
                    constraintObj.value = item.nodeName
                    varianceList.push(constraintObj);
                }
            })
            setCategories(varianceList);
        } else{
            setCategories([]);
        }
        dispatch(setIsLoading(false));
    } catch(error: any){
        console.log(error.message);
        dispatch(setIsLoading(false));
    }
}

  const saveVariance= async ()=>{
      try{
        const data = await client.mutate({
            mutation:CREATE_TASK_VARIANCE,
            variables:{object:{
                category: category,
                varianceName: name?.trim(),
                taskId: props?.task?.id
             }
            },
            context:{role: priorityPermissions('create'), token: state.selectedProjectToken}
        })

        props?.task?.variances?.push({
            id: data.data.insert_projectTaskVariance_one.id,
            varianceName : name,
            category : category,
            taskId: props?.task?.id,
            task: props?.task?.name
        })
        props.close();
      }catch(error: any){
          console.log(error.message);
      }
  }

  return (
      <Dialog
      fullWidth={true}
      maxWidth={'xs'}
        open={props.open}
        onClose={handleClose}
        disableBackdropClick={true}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
          <DialogContent className="addVariance">
              <div className="addVariance__fields">
                <div className="addVariance__fields__textField">
                        <label id="demo-simple-select-outlined-label" className="addVariance__fields__textField__label">
                            Name <span style={{color: 'red'}}>*</span></label>
                        <TextField id="outlined-basic" variant="outlined" value={name}
                         onChange={(e)=>setName(e.target.value)}/>
                </div>
                <div className="addVariance__fields__textField">
                    <label id="demo-simple-select-outlined-label" className="addVariance__fields__textField__label">
                        Category <span style={{color: 'red'}}>*</span></label>
                    <FormControl variant="outlined" fullWidth>
                        <Select
                        native
                        value={category}
                        name="category"
                        onChange={(e)=>setCategory(e.target.value)}
                        className="addVariance__fields__textField__select"
                        id="demo-simple-select-outlined"
                        >
                        <option value=''>Select a category</option>
                        {
                            categories.map((item: any, index: number) => (
                                <option key={`${item.value}-${index}`} 
                                value={item.value}>{item.value}</option>
                            ))
                        }
                        </Select>
                    </FormControl>
                </div>
              </div>
             
              <div className="addVariance__footer">
                    <Button
                        data-testid={'cancel-action'}
                        variant="outlined"
                        type="submit"
                        onClick={handleClose}
                        className="btn-secondary"
                        size="small"
                    >
                    Cancel
                  </Button>
                  <Button
                     disabled={!category || !name.trim()}
                     data-testid={'confirm-action'}
                     variant="contained"
                     onClick={saveVariance}
                     size="small"
                     className="btn-primary"
                    >
                    Add Variance
              </Button>
              </div>
        </DialogContent>

      </Dialog>
  );
};

export default AddVariance;
