import React, { ReactElement, useContext } from 'react'
import { templateContext } from '../../context/templates/context';
import './ProductFeature.scss';
import { setCurrentFeature, setCurrentFeatureId } from '../../context/templates/action';
import { Forms } from '../../models/template';
import BackNavigation from '../../../../shared/components/BackNavigation/BackNavigation';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import { IconButton, Tooltip } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { setPreviousFeature } from '../../../../root/context/authentication/action';
import { canCreateTemplate } from '../../utils/permission';
import CommonHeader from "../../../../shared/components/CommonHeader/CommonHeader";

const headerInfo = {
  name : "Forms",
  description : ""
}

function ProductFeature(): ReactElement {
    const {templateState, templateDispatch }:any = useContext(templateContext);
    const history = useHistory();
    const {dispatch }:any = useContext(stateContext);

    const selectForm=(argForm: Forms): void=>{
      templateDispatch(setCurrentFeature(argForm));
      templateDispatch(setCurrentFeatureId(argForm.id));
      history.push(`/base/forms/${argForm.id}`)
      dispatch(setPreviousFeature(argForm.id));
    }

    const navigateToCreate=()=>{
      history.push('/base/forms/create');
    }

    return (
    <div className="productFeature">
        <div className="productFeature__header">
          <CommonHeader headerInfo ={headerInfo}/>          
           {canCreateTemplate && <Tooltip title={"Click to Create a New Form"}>
            <IconButton className="productFeature__header__icon"
              onClick={navigateToCreate} data-testid="addnewform"> 
                <AddOutlinedIcon  />
            </IconButton>
          </Tooltip>}
        </div>
       <div className="productFeature__form">
            <div className="productFeature__form__item">
                  <div className="productFeature__form__item__body">
                  {templateState.standardForms.map(((standardItem: Forms)=>(
                    <div key={`standard-form-${standardItem.id}`} 
                    data-testid={`productFeatures-system-forms-${standardItem.id}`} onClick={()=>selectForm(standardItem)}
                    className={`productFeature__form__item__body__item 
                      ${standardItem?.id=== templateState.currentFeature?.id?'productFeature__active':''}`}>
                        
                          <div className="productFeature__form__item__body__item__name">
                          <Tooltip title={standardItem.name}>
                            <span>
                              {standardItem.name.length>20?`${standardItem.name.slice(0,18)}..`:standardItem.name}
                            </span> 
                          </Tooltip>
                          <div className="productFeature__form__item__body__item__name__right">
                            <span>({standardItem.templateCount}) </span>
                          </div>
                          </div>
                        </div>
                  )))}
                </div>
             </div>
        </div>
      </div>
    )
}

export default ProductFeature
