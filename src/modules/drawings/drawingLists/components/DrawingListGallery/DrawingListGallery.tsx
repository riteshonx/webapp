import React, { ReactElement, useContext, useEffect, useState } from 'react';
import './DrawingListGallery.scss';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Button from '@material-ui/core/Button';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import { setDrawingListPageNumber, setUploadDialog } from '../../context/DrawingLibDetailsAction';
import moment from 'moment';
import DrawingActionPopOver from '../DrawingActionPopOver/DrawingActionPopOver';
import { stateContext } from '../../../../root/context/authentication/authContext';
import EditDrawing from '../EditDrawing/EditDrawing';
import InfiniteScroll from 'react-infinite-scroll-component';

export interface Params {
    projectId: string;
}

export default function DrawingListGallery(props: any): ReactElement {

    const history = useHistory();
    const {state }:any = useContext(stateContext);
    const pathMatch:match<Params>= useRouteMatch();
    const {DrawingLibDetailsState, DrawingLibDetailsDispatch}: any = useContext(DrawingLibDetailsContext);
    const [drawingsListArray, setdrawingsListArray] = useState<Array<any>>([]);
    const [selectedDrawingData, setselectedDrawingData] = useState<any>();
    const [isUpdateOpen, setisUpdateOpen] = useState(false);
    const [editDrawingDetail, setEditDrawingDetail] = useState<any>();
    const [totalCount, setTotalCount] = useState(0)

    useEffect(() => {
        if(DrawingLibDetailsState?.drawingsLists){
            setdrawingsListArray(DrawingLibDetailsState?.drawingsLists)
        }
    }, [DrawingLibDetailsState?.drawingsLists])

    useEffect(() => {
        setTotalCount(props?.totalCount)
      }, [props?.totalCount])

    const openDrawingLib = () => {
        history.push(`/drawings/projects/${pathMatch.params.projectId}/drawing-management`);   
        DrawingLibDetailsDispatch(setUploadDialog(true));  
    }
    
    const handleSelectedDrawing = (drawing: any) => {
        setselectedDrawingData(drawing)
    }

    const handleDeleteDrawing = (drawingDetail: any) => {
        props.deleteDrawing(drawingDetail)
    }

    const updateDrawing = () => {
        // setisUpdateOpen(isOpen)
    }

    const handlePdfViewer = (drawing: any) => {
        history.push(`/drawings/projects/${pathMatch.params.projectId}/pdf-viewer/${drawing.id}`);   
    }

    const handleEditSideBar = () => {
        setisUpdateOpen(true)
    }

    const handelEditDrawingDetails = (drawing: any) => {
        setEditDrawingDetail(drawing)
    }

    const handleRefresh = () => {
        props.refreshDrawingList()
    }

    const fetchQuery = () => {
        if(drawingsListArray.length < totalCount){
          const pageNum = DrawingLibDetailsState.drawingListPageNumber + 1
          DrawingLibDetailsDispatch(setDrawingListPageNumber(pageNum))
        }
      }

    return (
    <div id='scrollable_grid' className="drawings-wrapper">
            {
                drawingsListArray.length > 0 ? (
                    <InfiniteScroll
                        dataLength={drawingsListArray.length}
                        next={fetchQuery}
                        hasMore={drawingsListArray.length < totalCount ? true : false}
                        loader={drawingsListArray.length === totalCount ? "" : <h4>Loading...</h4>} // handle this later
                        scrollableTarget="scrollable_grid"
                    >
                    <div className="drawings-lists">
                        {
                            drawingsListArray.map((drawing: any, index: number) => (
                                <div  key={`${drawing.id}-${index}`} className="drawings-lists__card">
                                    <div className="drawings-lists__card__thumbnail" onClick={() => handlePdfViewer(drawing)}>
                                        <img className="img-responsive" src={drawing.thumbnailPath} alt="pdf" />
                                    </div>
                                    <div className="drawings-lists__card__details">
                                        <div className="drawings-lists__card__details__left">
                                            <div className="drawings-lists__card__details__name">
                                                {`${drawing.drawingNumber} - ${drawing.drawingName}`}
                                            </div>
                                            <div className="drawings-lists__card__details__versionInfo">
                                                <span>{drawing?.setVersionName}</span> 
                                                &nbsp; | &nbsp;
                                                <span>
                                                    {     
                                                        moment(drawing?.setVersionDate).format('DD-MMM-YYYY').toString()
                                                    } 
                                                    
                                                </span>
                                            </div>
                                        </div>
                                        <div className="drawings-lists__card__details__right">
                                            <DrawingActionPopOver id={drawing.id} selectedDrawing={() => handleSelectedDrawing(drawing)} 
                                                    selectedDrawingData={selectedDrawingData} 
                                                    deleteDrawing={handleDeleteDrawing} 
                                                    updateDrawing={updateDrawing}
                                                    updateOpen={handleEditSideBar}
                                                    editDrawingDate={handelEditDrawingDetails}
                                                    />
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    </InfiniteScroll>
                ):

                state?.projectFeaturePermissons?.canuploadDrawings && !state.isLoading && !props.isSearchTextExist ? (
                    <div className="no-drawings">
                    <div className="DrawingListTable__nodata">
                        Upload a document to publish drawings
                            <div className="DrawingListTable__upload-btn">
                                <Button
                                    id="upload-pdf"
                                    data-testid={'upload-file'}
                                    variant="outlined"
                                    className="btn-primary"
                                    startIcon={<CloudUploadIcon />}
                                    onClick={openDrawingLib}
                                >
                                    Upload
                                </Button>
                        </div>
                    </div>
                </div>
                ) : (state.projectFeaturePermissons && !state.isLoading &&
                (!state.projectFeaturePermissons?.canuploadDrawings ? (
                    ""
                )  : (
                <div className="no-drawings">
                    <div className="DrawingListTable__nodata">
                        No published drawings found.
                    </div>
                </div>
                )))
            }

            {   
                isUpdateOpen && (
                    <EditDrawing selectedDrawing={editDrawingDetail} closeSideBar={() => setisUpdateOpen(false)} refreshList={handleRefresh}/>
                )
            }
    </div>    
        
    )
}   
