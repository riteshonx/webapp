import React, { ReactElement, useContext, useEffect, useState } from 'react'
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import { SpecificationLibDetailsContext } from '../../context/SpecificationLibDetailsContext';
import './SpecificationViewerGrid.scss';
import thumbNail from '../../../../../assets/images/dummy_thumb_nail1_image.jpg';
import Tooltip from '@material-ui/core/Tooltip';

export interface Params {
    projectId: string;
    specificationId: string;
}

export default function SpecificationViewerSheetGrid(props: any): ReactElement {
    
    const history = useHistory();
    const pathMatch:match<Params>= useRouteMatch();
    const {SpecificationLibDetailsState}: any = useContext(SpecificationLibDetailsContext);
    const [specificationSheetList, setSpecificationSheetList] = useState<Array<any>>([])

    useEffect(() => {
        setSpecificationSheetList(SpecificationLibDetailsState?.specificationSheetLists);
    }, [SpecificationLibDetailsState?.specificationSheetLists]);

    const changePdfView = (specification: any) => {
        if(specification.id !== pathMatch.params.specificationId ){
            props.fetchUrl(specification)
            handlePdfViewer(specification)
        }
    }

    const handlePdfViewer = (specification: any) => {
        history.push(`/specifications/projects/${pathMatch.params.projectId}/pdf-viewer/${specification.id}`); 
    }
    
    return (
        <div className="specification-grid">
           {
                specificationSheetList?.map((item: any) => (
                    <div key={item.id} className={`specifiction-grid__item ${item.id === pathMatch.params.specificationId ? 'specifiction-grid__item-active' : ''}`} 
                    onClick={() => changePdfView(item)}>
                        <div className="specifiction-grid__item__info">
                        {/* <Tooltip title={`${item.specifictionNumber} ${item.specifictionName}`} aria-label="first name"> */}
                                <label>
                                  { (item.sectionName && item.sectionName.length > 25) ? 
                                  `${item.sectionNumber} ${item.sectionName.slice(0,25)} . . .`: 
                                  `${item.sectionNumber} ${item.sectionName}` }
                                </label>
                        {/* </Tooltip> */}
                        </div>
                        <div className={`specification-grid__item__thumbnail ${item.id === pathMatch.params.specificationId ? 
                            'specification-grid__item__thumbnail-active' : ''}`} >
                            <img className="img-responsive" src={thumbNail} alt="pdf" />
                        </div>
                    </div>
                ))
            }
        </div>
    )
}
