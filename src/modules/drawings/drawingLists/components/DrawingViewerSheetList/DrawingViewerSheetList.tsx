import React, { ReactElement, useEffect, useState } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import './DrawingViewerSheetList.scss';

export interface Params {
    projectId: string;
    drawingId: string;
}


export default function DrawingViewerSheetList(props: any): ReactElement {

    const history = useHistory();
    const pathMatch:match<Params>= useRouteMatch();
    const [drawingSheetList, setDrawingSheetList] = useState<Array<any>>([])

    useEffect(() => {
        setDrawingSheetList(props?.drawingSheetList);
    }, [props?.drawingSheetList]);

    const changePdfView = (drawing: any) => {
        if(drawing.id !== pathMatch.params.drawingId ){
            props.fetchUrl(drawing)
            handlePdfViewer(drawing)
        }
    }

    const handlePdfViewer = (drawing: any) => {
        history.push(`/drawings/projects/${pathMatch.params.projectId}/pdf-viewer/${drawing.id}`); 
    }
    
    return (
        <div className="drawingLists">
            {
                drawingSheetList?.map((item: any) => (
                    <div className={`drawingLists__item ${item.id === pathMatch.params.drawingId ? 'drawingLists__item-active' : ''}`} 
                            key={item.id}  onClick={() => changePdfView(item)}>
                        <Tooltip title={`${item.drawingNumber} ${item.drawingName}`} aria-label="first name">
                                <label>
                                  { (item.drawingName && item.drawingName.length > 35) ? 
                                  `${item.drawingNumber} ${item.drawingName.slice(0,35)} . . .`: 
                                  `${item.drawingNumber} ${item.drawingName}` }
                                </label>
                        </Tooltip>
                    </div>
                ))
            }
        </div>
    )
}
