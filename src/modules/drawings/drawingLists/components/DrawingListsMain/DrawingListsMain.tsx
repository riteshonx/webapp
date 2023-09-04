import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import DrawingListGallery from '../DrawingListGallery/DrawingListGallery'
import DrawingListTable from '../DrawingListTable/DrawingListTable'

export default function DrawingListsMain(props: any): ReactElement {

    const [drawingView, setDrawingView] = useState('list');
    const {DrawingLibDetailsState}: any = useContext(DrawingLibDetailsContext);

    useEffect(() => {
        if(DrawingLibDetailsState?.drawingView){
            setDrawingView(DrawingLibDetailsState?.drawingView)
        }
    }, [DrawingLibDetailsState?.drawingView])

    const deleteDrawing = (drawingDetail: any) => {
        props.deleteDrawing(drawingDetail)
    }

    
    const handleRefreshDrawingList = (property?:any) => {
        props.refresh(property)
    }

    return (
        <>
            {
                drawingView === 'list' ? (
                    <DrawingListTable 
                        totalCount={props?.totalCount}
                        deleteDrawing={deleteDrawing}
                        refreshDrawingList={handleRefreshDrawingList}
                        isSearchTextExist={props.isSearchTextExist}
                        />
                ) : (
                    <DrawingListGallery 
                        totalCount={props?.totalCount}
                        deleteDrawing={deleteDrawing}
                        refreshDrawingList={handleRefreshDrawingList}
                        isSearchTextExist={props.isSearchTextExist}
                        />
                )
            }
        </>
    )
}
