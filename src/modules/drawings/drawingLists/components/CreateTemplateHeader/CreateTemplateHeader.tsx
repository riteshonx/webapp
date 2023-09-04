import React, { ReactElement, useContext, useState } from 'react';
import Button from '@material-ui/core/Button';
import VisibilityIcon from '@material-ui/icons/Visibility';
import './CreateTemplateHeader.scss';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import PreviewTemplateFormat from '../PreviewTemplateFormat/PreviewTemplateFormat';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';

export interface Params {
    projectId: string;
}

export default function CreateTemplateHeader(props: any): ReactElement {

    const history = useHistory();
    const pathMatch:match<Params>= useRouteMatch();
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const {DrawingLibDetailsState}: any = useContext(DrawingLibDetailsContext);

    const navBackToTemplateList = () => {
        history.push(`/drawings/projects/${pathMatch.params.projectId}/custom-template-lists`);     
    }

    const onPreviewHandler = () => {
        setIsPreviewOpen(true)
    }

    const closePreview = () => {
        setIsPreviewOpen(false)
    }

    const createTemplate = () => {
        props.onCreateTemplate();
    }
    
    return (
        
        <div className="drawing-template-header">
            <div className="drawing-template-header__left" >
                <div className="drawing-template-header__title">
                    {
                         props.pageType === 'create' ? 'Create a drawing template' : 'Update drawing template'
                    }
                </div>
                <div className="drawing-template-header__subtitle">* Fields are mandatory</div>
                <div className="drawing-template-header__subtitle">All the fields are system fields and cannot be renamed or deleted</div>
            </div>
            <div className="drawing-template-header__action">
                <Button className="drawing-template-header__action__preview" data-testid="create-template-preview" onClick={onPreviewHandler}> 
                    <VisibilityIcon className="drawing-template-header__action__preview__icon"/>
                    <span className="drawing-template-header__action__preview__text"> Preview</span> 
                </Button>
                <Button variant="outlined"
                        className="drawing-template-header__action__discardbtn btn-secondary" 
                        data-testid="create-template-discard"
                        onClick={navBackToTemplateList}
                >
                    Discard
                </Button>
                <Button variant="outlined" 
                        className="btn-primary" 
                        disabled={!DrawingLibDetailsState?.drawingTemplateFieldFormat?.templateName || props?.isCreateEnable || 
                            DrawingLibDetailsState?.drawingTemplateFieldFormat?.templateName.length > 30}
                        data-testid="create-template-save"
                        onClick={createTemplate}
                >
                   {
                       props.pageType === 'create' ? 'Create' : 'Update'
                   } 
                </Button>
            </div>
            {
                isPreviewOpen && ( <PreviewTemplateFormat closePreview={closePreview}/>)
            }
        </div>
    )
}
