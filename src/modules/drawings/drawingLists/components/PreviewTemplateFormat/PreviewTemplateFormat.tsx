import React, { ReactElement, useContext, useEffect, useState } from 'react';
import './PreviewTemplateFormat.scss';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import PreviewVersionInfo from '../PreviewVersionInfo/PreviewVersionInfo';
import PreviewSheetInfo from '../PreviewSheetInfo/PreviewSheetInfo';
import { templateFormatId } from 'src/modules/drawings/utils/drawingsConstant';
import Tooltip from '@material-ui/core/Tooltip';


export default function PreviewTemplateFormat(props: any): ReactElement {

    const [previewTemplateData, setPreviewTemplateData] = useState<any>({});
    const {DrawingLibDetailsState, DrawingLibDetailsDispatch}: any = useContext(DrawingLibDetailsContext);
    const [sheetsView, setSheetsView] = useState('VERSION_INFO');

    useEffect(() => {
        if(DrawingLibDetailsState?.drawingTemplateFieldFormat){
            setPreviewTemplateData(DrawingLibDetailsState?.drawingTemplateFieldFormat);
        }
    }, [DrawingLibDetailsState?.drawingTemplateFieldFormat])

    const closeSideBar = () => {
        props.closePreview();
    }

    const toggleView = (viewtype: string) => {
        setSheetsView(viewtype);
    }

    const renderFormContent = () => {
        switch(sheetsView){
            case 'VERSION_INFO': return <PreviewVersionInfo />;
            // case 'CATEGORIES': return <DrawingCategories />;
            case 'SHEETS': return <PreviewSheetInfo />;
            default: return <PreviewVersionInfo />;
        }
    }

    return (
        <div className='preview'>
            <div className='preview__form-wrapper'>
                <div className="preview__form-wrapper__closeIcon">
                    <HighlightOffIcon className="closeIcon-svg" data-testid={'close-sideBar'} onClick={closeSideBar}/>
                </div>

                <div className='preview__form-wrapper__form-name'>
                    <Tooltip title={previewTemplateData.templateName ? previewTemplateData.templateName.length > 30 ? 
                                    `${previewTemplateData.templateName.toString().slice(0,27)} . . .`: 
                                    previewTemplateData.templateName.toString() : 'Custom Template'} 
                                    aria-label="Custom Template">
                        <label>
                            {previewTemplateData.templateName ? previewTemplateData.templateName.length > 25 ? 
                            `${previewTemplateData.templateName.toString().slice(0,18)} . . .`: 
                            previewTemplateData.templateName.toString() : 'Custom Template'}
                        </label>
                    </Tooltip>
                </div>

                <div className='preview__form-wrapper__form-tabs'>
                    {
                        previewTemplateData?.templateId === templateFormatId.BS1192_UK && (
                        <div className="btns disabled">
                            Layout
                        </div>
                        )
                    }
                    <div className={`btns ${sheetsView === 'VERSION_INFO' ? 'active' : ''}`} onClick={() => toggleView('VERSION_INFO')}>
                        Version Info
                    </div>
                    {
                        previewTemplateData?.templateId === templateFormatId.US_CANADA && (
                        // <div className={`btns ${sheetsView === 'CATEGORIES' ? 'active' : ''}`} onClick={() => toggleView('CATEGORIES')}>
                        //     Categories  
                        // </div>
                        <div className="btns disabled">
                            Categories  
                        </div>
                        )
                    }
                    <div className={`btns ${sheetsView === 'SHEETS' ? 'active' : ''}`} onClick={() => toggleView('SHEETS')}>
                        Sheets
                    </div>
                </div>

                <div className='preview__form-wrapper__form-container'>
                    { renderFormContent()}
                </div>
            </div>
        </div>
    )
}
