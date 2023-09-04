import React, { ReactElement, useContext, useEffect, useState } from 'react';
import './DrawingViewerSheetMain.scss';
import ViewListIcon from '@material-ui/icons/ViewList';
import AppsIcon from '@material-ui/icons/Apps';
import DrawingViewerSheetList from '../DrawingViewerSheetList/DrawingViewerSheetList';
import DrawingViewerSheetGrid from '../DrawingViewerSheetGrid/DrawingViewerSheetGrid';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';

export default function DrawingViewerSheetMain(props: any): ReactElement {

    const [viewType, setViewType] = useState('LIST');
    const {DrawingLibDetailsState}: any = useContext(DrawingLibDetailsContext);
    const [drawingSheetList, setDrawingSheetList] = useState<Array<any>>([])

    useEffect(() => {
        // const drawingSheetGroups=new Map();
        // DrawingLibDetailsState?.drawingSheetLists.forEach((element: any) => {
        //     const key= `${element.drawingName}-${element.drawingNumber}`;
        //     if(drawingSheetGroups.get(key)){
        //         const currentValue= drawingSheetGroups.get(key);
        //         if(new Date(element.setVersionDate).getTime() > new Date(currentValue.setVersionDate).getTime()){
        //             drawingSheetGroups.set(key,element);
        //         }
        //     } else{
        //         drawingSheetGroups.set(key,element)
        //     }
        //     drawingSheetGroups.set(key,element)
        // });
        // const targetList: Array<any>= [];
        //  drawingSheetGroups.forEach((values)=> {
        //     targetList.push(values);
        // })
        if(DrawingLibDetailsState?.drawingSheetLists){
            setDrawingSheetList(DrawingLibDetailsState?.drawingSheetLists);
        }
    }, [DrawingLibDetailsState?.drawingSheetLists]);

    const fetchUrl = (drawing: any) => {
        props.handleFetchSheetUrl(drawing)
    }
    
    return (
        <>
            <div className="sheets-main">
                <div className="sheets-main__text"></div>
                <div className="sheets-main__icon">
                    <ViewListIcon className={` ${viewType === 'GRID' ? 'sheets-main__icon__light' : ''}`} 
                        onClick={() => setViewType('LIST')}/>

                    <AppsIcon className={` ${viewType === 'LIST' ? 'sheets-main__icon__light' : ''}`} 
                        onClick={() => setViewType('GRID')} />
                </div>
            </div>
            <div>
                {
                    viewType === 'LIST' ? (
                        <DrawingViewerSheetList fetchUrl={fetchUrl} drawingSheetList={drawingSheetList}/>
                    ): (
                        <DrawingViewerSheetGrid fetchUrl={fetchUrl} drawingSheetList={drawingSheetList}/>
                    )
                }
            </div>
        </>
    )   
}
