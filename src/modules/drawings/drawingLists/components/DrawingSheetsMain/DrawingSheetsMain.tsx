import React, { ReactElement, useContext, useEffect, useState } from 'react';
import {
    setCategoryTabStatus, setDrawingCategoryDetails,
    setDrawingLibDetails, setDrawingNumberLists, setDrawingPageNumber,
    setDrawingSheetsDetails,
    setDrawingVersionDetails, setIsAutoUpdate,
    setLastAutoGenNum,
    setLocalSplittedNumber,
    setParsedFileUrl, setPublishedDrawingLists,
    setSheetsTabStatus, setUploadDialog, setVersionDateValidate,
    setVersionNameValidate
} from '../../context/DrawingLibDetailsAction';
import Button from '@material-ui/core/Button';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import DrawingCategories from '../DrawingCategories/DrawingCategories';
import DrawingVersionInfo from '../DrawingVersionInfo/DrawingVersionInfo';
import './DrawingSheetsMain.scss';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import { stateContext } from '../../../../root/context/authentication/authContext';
import { templateFormatId } from 'src/modules/drawings/utils/drawingsConstant';
import DrawingTemplateLayout from '../DrawingTemplateLayout/DrawingTemplateLayout';
import ConfirmDialog from 'src/modules/shared/components/ConfirmDialog/ConfirmDialog';
import DrawingSheetInfoTable from '../DrawingSheetInfoTable/DrawingSheetInfoTable';

interface message {
    header: string,
    text: string,
    cancel: string,
    warningIcon: boolean
}

let confirmMessage: message


export default function DrawingSheetsMain(props: any): ReactElement {

    const [sheetsView, setSheetsView] = useState('VERSION_INFO');
    const { DrawingLibDetailsState, DrawingLibDetailsDispatch }: any = useContext(DrawingLibDetailsContext);
    const { state }: any = useContext(stateContext);
    const [templateName, setTemplateName] = useState('Drawing Sheets');
    const [templateId, setTemplateId] = useState('');
    const [versonFieldLists, setVersonFieldLists] = useState<Array<any>>([]);
    const [sheetInfoFieldLists, setSheetInfoFieldLists] = useState<Array<any>>([]);
    const [drawingNumberList, setDrawingNumberList] = useState<Array<any>>([]);
    const [splitKey, setSplitKey] = useState('-')
    const [isSplitted, setIsSplitted] = useState(true)
    const [isSplitDisabled, setIsSplitDisabled] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);

    //clean the context
    useEffect(() => {
        return () => {
            DrawingLibDetailsDispatch(setDrawingLibDetails([]));
            DrawingLibDetailsDispatch(setDrawingVersionDetails(null));
            DrawingLibDetailsDispatch(setDrawingCategoryDetails([]));
            DrawingLibDetailsDispatch(setCategoryTabStatus(true));
            DrawingLibDetailsDispatch(setSheetsTabStatus(true));
            DrawingLibDetailsDispatch(setParsedFileUrl(null));
            DrawingLibDetailsDispatch(setIsAutoUpdate(false));
            DrawingLibDetailsDispatch(setUploadDialog(false));
            DrawingLibDetailsDispatch(setPublishedDrawingLists([]));
            DrawingLibDetailsDispatch(setVersionNameValidate(false));
            DrawingLibDetailsDispatch(setVersionDateValidate(false));
            DrawingLibDetailsDispatch(setDrawingPageNumber(1));
            DrawingLibDetailsDispatch(setLastAutoGenNum(0));
            DrawingLibDetailsDispatch(setLocalSplittedNumber(null));
            DrawingLibDetailsDispatch(setDrawingSheetsDetails([]));
            setConfirmOpen(false)
        }
    }, [])

    useEffect(() => {
        if (templateId && templateId === templateFormatId?.BS1192_UK) {
            setSheetsView('LAYOUT');
            //  enable tabs if drawing number is splitted atleast once in UK format
            if (DrawingLibDetailsState?.drawingLibDetails[0]?.drawingNumFormat) {
                setIsSplitted(true);
                // DrawingLibDetailsDispatch(setLocalSplittedNumber(DrawingLibDetailsState?.drawingLibDetails[0]?.drawingNumFormat));
            } else {
                setIsSplitted(false);
            }
        }
    }, [templateId])

    useEffect(() => {
        if (DrawingLibDetailsState?.drawingLibDetails?.length > 0) {
            setTemplateName(DrawingLibDetailsState?.drawingLibDetails[0]?.drawingTemplateFormat?.name)
            setTemplateId(DrawingLibDetailsState?.drawingLibDetails[0]?.drawingTemplateFormat?.id)

            DrawingLibDetailsDispatch(setDrawingVersionDetails(DrawingLibDetailsState?.drawingLibDetails[0]?.versionInfoReviewed.versionInfo));
            if (DrawingLibDetailsState?.drawingLibDetails[0]?.drawingTemplateFormat?.id === templateFormatId?.US_CANADA) {
                if (typeof DrawingLibDetailsState?.drawingLibDetails[0]?.categoriesReviewed?.categories[0] === 'string') {
                    mapCategory(DrawingLibDetailsState?.drawingLibDetails[0]?.categoriesReviewed?.categories)
                } else {
                    DrawingLibDetailsDispatch(
                        setDrawingCategoryDetails(DrawingLibDetailsState?.drawingLibDetails[0]?.categoriesReviewed?.categories));
                }
            }
            if (DrawingLibDetailsState?.drawingLibDetails[0].drawingNumFormat?.dwgNumberSplitted.length > 0) {
                const splittedNumber: any = {
                    dwgNumberSelected: DrawingLibDetailsState?.drawingLibDetails[0].drawingNumFormat?.dwgNumberSelected,
                    dwgNumberSplitted: DrawingLibDetailsState?.drawingLibDetails[0].drawingNumFormat?.dwgNumberSplitted
                }
                DrawingLibDetailsDispatch(setLocalSplittedNumber(splittedNumber));
            }
            //version field data
            const versionFields = DrawingLibDetailsState?.drawingLibDetails[0]?.drawingTemplateFormat?.
                drawingTemFieldFormatAssociations.filter((item: any) => item?.drawingTemplateField?.groupType === 'version_info');
            if (DrawingLibDetailsState?.drawingLibDetails[0]?.drawingTemplateFormat?.id === templateFormatId.US_CANADA) {
                versionFields.forEach((item: any) => {
                    if (item.drawingTemplateField.name === 'Set_Title') {
                        item.drawingTemplateField.isMandatory = true;
                    }
                })
            }
            setVersonFieldLists([...versionFields]);

            //sheet info data
            const sheetInfoFields = DrawingLibDetailsState?.drawingLibDetails[0]?.drawingTemplateFormat?.
                drawingTemFieldFormatAssociations.filter((item: any) => item?.drawingTemplateField?.groupType === 'sheet_info');

            setSheetInfoFieldLists([...sheetInfoFields]);
        }

    }, [DrawingLibDetailsState?.drawingLibDetails]);

    useEffect(() => {
        if (DrawingLibDetailsState?.drawingSheetsDetails?.length > 0) {
            const drawingNumberArray = DrawingLibDetailsState?.drawingSheetsDetails?.sort((a: any, b: any) => (a.drawingSequence > b.drawingSequence)
                ? 1 : ((b.drawingSequence > a.drawingSequence) ? -1 : 0))?.map((item: any) => ({
                    dwgnum: item.dwgnum,
                    drawingSequence: item.drawingSequence
                })).filter((ele: any) => ele.dwgnum);

            setDrawingNumberList([...drawingNumberArray])
            DrawingLibDetailsDispatch(setDrawingNumberLists([...drawingNumberArray]))
            const splitKeyList = DrawingLibDetailsState?.drawingSheetsDetails.filter((item: any) => item?.revisionInfo?.splitKey)
            setSplitKey(splitKeyList[0]?.revisionInfo?.splitKey)
        }
    }, [DrawingLibDetailsState?.drawingSheetsDetails])

    useEffect(() => {
        if (DrawingLibDetailsState?.localSplittedNumber?.dwgNumberSelected) {
            validateLayoutFields()
        }
    }, [DrawingLibDetailsState?.localSplittedNumber])

    useEffect(() => {
        if (DrawingLibDetailsState?.drawingLibDetails?.length > 0 && props.drawingSheetList?.length > 0 &&
            (DrawingLibDetailsState?.drawingLibDetails[0]?.drawingTemplateFormat?.id === templateFormatId.BS1192_UK ||
                DrawingLibDetailsState?.drawingLibDetails[0]?.drawingTemplateFormat?.id === templateFormatId.US_CANADA) &&
            !confirmOpen) {
            // DrawingLibDetailsState?.drawingLibDetails[0]?.status === 'PARSED' &&
            const drawingNumberArray = props.drawingSheetList?.
                sort((a: any, b: any) => (a.drawingSequence > b.drawingSequence)
                    ? 1 : ((b.drawingSequence > a.drawingSequence) ? -1 : 0))?.map((item: any) => item.dwgnum)
                .filter((ele: any) => ele);

            if (drawingNumberArray.length < 1) {
                confirmMessage = {
                    header: "",
                    text: `Sorry, we were unable to detect the drawing data,
                        please make sure you are using the correct
                        drawing format parsing template.`,
                    cancel: "Ok",
                    warningIcon: true
                }
                setConfirmOpen(true)
            }
        }
    }, [DrawingLibDetailsState?.drawingLibDetails, props.drawingSheetList])


    const validateLayoutFields = () => {
        if (DrawingLibDetailsState?.localSplittedNumber?.dwgNumberSplitted?.length > 0) {
            const fieldList = [...DrawingLibDetailsState?.localSplittedNumber?.dwgNumberSplitted]
            const miniFieldSelected = fieldList?.filter((ele: any) => ele.field);
            const inValidCount = fieldList?.filter((ele: any) => ele.isValid);
            miniFieldSelected.length > 0 ? (inValidCount.length > 0 ? setIsSplitDisabled(true) : setIsSplitDisabled(false)) : setIsSplitDisabled(true)
        } else {
            setIsSplitDisabled(true)
        }
    }

    const toggleView = (viewtype: string) => {
        setSheetsView(viewtype);
    }

    const mapCategory = (data: any) => {
        const res = data.reduce((s: any, a: any) => {
            s.push({ name: a, status: '' });
            return s
        }, [])
        DrawingLibDetailsDispatch(setDrawingCategoryDetails(res));
    }

    const renderTab = () => {
        switch (sheetsView) {
            case 'LAYOUT': return <DrawingTemplateLayout drawingNumberList={drawingNumberList} splitKey={splitKey} />;
            case 'VERSION_INFO': return <DrawingVersionInfo versonFieldLists={versonFieldLists} templateId={templateId} />;
            case 'CATEGORIES': return <DrawingCategories />;
            case 'SHEETS': return <DrawingSheetInfoTable sheetInfoFieldLists={sheetInfoFieldLists} templateId={templateId} />;
            default: return <DrawingVersionInfo versonFieldLists={versonFieldLists} templateId={templateId} />;
        }
    }

    const handleTabs = () => {
        switch (sheetsView) {
            case 'LAYOUT': return toggleView('VERSION_INFO')
            // case 'VERSION_INFO': return templateId === templateFormatId?.US_CANADA ? toggleView('CATEGORIES') : toggleView('SHEETS')
            case 'VERSION_INFO': return toggleView('SHEETS')
            case 'CATEGORIES': return toggleView('SHEETS')
            default: return toggleView('VERSION_INFO')
        }
    }

    const handlePublishDrawings = () => {
        props.publish()
    }

    const handleSplitDrawingNumber = () => {
        props.splitDrawingNumber(splitKey)
    }

    return (
        <div className="drawingSheets">
            {
                DrawingLibDetailsState?.drawingLibDetails?.length > 0 && (
                    <>
                        <div className="drawingSheets__header">
                            <div>Review</div>
                            {
                                templateName && <div className='drawingSheets__header__templateName'>Template Name: {templateName}</div>
                            }

                        </div>
                        <div className="drawingSheets__toggleBtns">
                            {
                                templateId === templateFormatId.BS1192_UK && (
                                    <div className={`btns ${sheetsView === 'LAYOUT' ? 'active' : ''}`} onClick={() => toggleView('LAYOUT')}>
                                        Layout
                                    </div>
                                )

                            }

                            {
                                true && (
                                    <>
                                        <div className={`btns ${sheetsView === 'VERSION_INFO' ? 'active' : ''}`}
                                            onClick={() => toggleView('VERSION_INFO')}>
                                            Version Info
                                        </div>

                                        {/* {
                                        templateId === templateFormatId.US_CANADA && (
                                            <>
                                                {
                                                    false ? (
                                                    <div className="btns disabled">
                                                        Categories  
                                                    </div> 
                                                    ) : (
                                                    <div className={`btns ${sheetsView === 'CATEGORIES' ? 'active' : ''}`} 
                                                        onClick={() => toggleView('CATEGORIES')}>
                                                        Categories  
                                                    </div>
                                                    )
                                                }
                                                
                                            </>
                                        )

                                    } */}

                                        <>
                                            {
                                                false ? (
                                                    <div className="btns disabled">
                                                        Sheets
                                                    </div>
                                                ) : (

                                                    <div className={`btns ${sheetsView === 'SHEETS' ? 'active' : ''}`}
                                                        onClick={() => toggleView('SHEETS')}>
                                                        Sheets
                                                    </div>
                                                )
                                            }

                                        </>
                                    </>
                                )
                            }

                        </div>
                        <div className="drawingSheets__contents">
                            {renderTab()}
                        </div>
                        <div className="drawingSheets__actions">
                            <div>
                                {
                                    sheetsView === 'LAYOUT' &&
                                    templateId === templateFormatId.BS1192_UK &&
                                    state?.projectFeaturePermissons?.canuploadDrawings && (
                                        <Button
                                            data-testid={'drawing-publish'}
                                            variant="outlined"
                                            className="btn btn-primary"
                                            onClick={handleSplitDrawingNumber}
                                            disabled={isSplitDisabled}
                                        >
                                            Apply
                                        </Button>
                                    )
                                }
                            </div>
                            {
                                true && (
                                    <div>
                                        {
                                            sheetsView !== 'SHEETS' ? (
                                                <>
                                                    <Button
                                                        data-testid={'drawing-publish'}
                                                        variant="outlined"
                                                        className="btn btn-secondary"
                                                        onClick={handleTabs}
                                                        endIcon={<ArrowRightAltIcon />}
                                                        size="small"
                                                    >
                                                        Next
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    {
                                                        state?.projectFeaturePermissons?.canuploadDrawings && (
                                                            <Button
                                                                data-testid={'drawing-publish'}
                                                                variant="outlined"
                                                                className="btn btn-primary"
                                                                onClick={handlePublishDrawings}
                                                                disabled={DrawingLibDetailsState?.isPublishDisabled ||
                                                                    DrawingLibDetailsState?.categoryTabStatus}
                                                            >
                                                                Publish
                                                            </Button>
                                                        )
                                                    }
                                                </>
                                            )
                                        }
                                    </div>
                                )
                            }
                        </div>
                    </>
                )
            }
            <>
                {
                    confirmOpen && (
                        <ConfirmDialog open={confirmOpen} message={confirmMessage}
                            close={() => setConfirmOpen(false)} />
                    )
                }
            </>
        </div>
    )
}
