import React, { ReactElement, useEffect, useState } from 'react'
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import './DrawingViewerSheetGrid.scss';
import Tooltip from '@material-ui/core/Tooltip';

export interface Params {
    projectId: string;
    drawingId: string;
}

export default function DrawingViewerSheetGrid(props: any): ReactElement {
    
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
        <div className="drawing-grid">
           {
                drawingSheetList?.map((item: any) => (
                    <div key={item.id} className={`drawing-grid__item ${item.id === pathMatch.params.drawingId ? 'drawing-grid__item-active' : ''}`} 
                    onClick={() => changePdfView(item)}>
                        <div className="drawing-grid__item__info">
                        <Tooltip title={`${item.drawingNumber} ${item.drawingName}`} aria-label="first name">
                                <label>
                                  { (item.drawingName && item.drawingName.length > 25) ? 
                                  `${item.drawingNumber} ${item.drawingName.slice(0,25)} . . .`: 
                                  `${item.drawingNumber} ${item.drawingName}` }
                                </label>
                        </Tooltip>
                        </div>
                        <div className={`drawing-grid__item__thumbnail ${item.id === pathMatch.params.drawingId ? 
                            'drawing-grid__item__thumbnail-active' : ''}`} >
                            <img className="img-responsive" src={item?.thumbnailPath} alt="pdf" />
                        </div>
                    </div>
                ))
            }
        </div>
    )
}
