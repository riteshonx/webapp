import React, { ReactElement, useContext, useEffect, useState } from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { match, useRouteMatch } from 'react-router-dom';
import { DrawingLibDetailsContext } from '../../context/DrawingLibDetailsContext';
import './DrawingVersions.scss';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
export interface Params {
    projectId: string;
    drawingId: string;
  }

export default function DrawingVersions(): ReactElement {

    const history = useHistory();
    const {DrawingLibDetailsState}: any = useContext(DrawingLibDetailsContext);
    const [versionLists, setVersionLists] = useState<Array<any>>([]);
    const pathMatch: match<Params> = useRouteMatch();
    const [selectedDrawingVersion, setSelectedDrawingVersion] = useState('')

    useEffect(() => {
        if(DrawingLibDetailsState?.drawingVersionLists?.length > 0){
            setVersionLists(DrawingLibDetailsState?.drawingVersionLists);
            setSelectedDrawingVersion(pathMatch.params.drawingId) 
        }     
    }, [DrawingLibDetailsState?.drawingVersionLists]);

    const handleChangeDrawingVersion = (event: any) => {    
        setSelectedDrawingVersion(event.target.value) 
        history.push(`/drawings/projects/${pathMatch.params.projectId}/pdf-viewer/${event.target.value}`);   
    }

    return (
        <div className="select-version">
             {
                 versionLists.length > 0 && (
                    <>
                        <Select
                            id={`drawing-version`}
                            fullWidth
                            autoComplete="search"
                            // variant="outlined"
                            placeholder=""
                            value={selectedDrawingVersion}
                            defaultValue=""
                            onChange={(e: any) => handleChangeDrawingVersion(e)}
                        >
                            {
                                versionLists?.map((drawing: any, ) => (
                                    <MenuItem key={`${drawing.id}`} value={drawing.id} className="version-menu">
                                        {`Version Date:  ${moment(drawing.setVersionDate).format('DD-MMM-YYYY').toString()}-${drawing?.setVersionName}`}                        
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </>
                 )
             }
        </div>
    )
}
