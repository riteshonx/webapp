import React, { ReactElement, useContext, useEffect, useState } from 'react';
import './SpecificationListGallery.scss';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Button from '@material-ui/core/Button';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import { SpecificationLibDetailsContext } from '../../context/SpecificationLibDetailsContext';
import { setUploadDialog } from '../../context/SpecificationLibDetailsAction';
import moment from 'moment';
import thumbNail from '../../../../../assets/images/dummy_thumb_nail_image.jpg';
import SpecificationActionPopOver from '../SpecificationActionPopOver/SpecificationActionPopOver';
import { stateContext } from '../../../../root/context/authentication/authContext';

export interface Params {
    projectId: string;
}

export default function SpecificationListGallery(props: any): ReactElement {
    const history = useHistory();
    const {state }:any = useContext(stateContext);
    const pathMatch:match<Params>= useRouteMatch();
      const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any =
    useContext(SpecificationLibDetailsContext);
    const [specificationListArray, setspecificationListArray] = useState<Array<any>>([]);
    const [selectedSpecificationData, setselectedSpecificationData] = useState<any>();

    useEffect(() => {
        if(SpecificationLibDetailsState?.specificationLists){
            setspecificationListArray(SpecificationLibDetailsState?.specificationLists)
        }
    }, [SpecificationLibDetailsState?.specificationLists])

    const openSpecificationLib = () => {
        history.push(`/specifications/projects/${pathMatch.params.projectId}/library`);   
        SpecificationLibDetailsDispatch(setUploadDialog(true));  
    }
    
    const handleSelectedSpecification = (specification: any) => {
        setselectedSpecificationData(specification)
    }

    const handleDeleteSpecification = (specificationDetail: any) => {
        props.deleteSpecification(specificationDetail)
    }

    const updateSpecification = (isOpen: boolean) => {
        // setisUpdateOpen(isOpen)
    }
    const handlePdfViewer = (specification: any) => {
        history.push(`/specifications/projects/${pathMatch.params.projectId}/pdf-viewer/${specification.id}`);   
    }
const handleRefresh = () => {
        props.refreshSpecificationList()
    }
    return (
        <>
            {
                specificationListArray.length > 0 ? (
                    <div className="specifications-lists">
                        {
                            specificationListArray.map((specification: any, index: number) => (
                                <div  key={specification.id} className="specifications-lists__card">
                                    <div className="specifications-lists__card__thumbnail" 
                                    onClick={() => handlePdfViewer(specification)}
                                    >
                                        {/* THUMB NAIL IMAGE */}
                                        <img className="img-responsive" src={thumbNail} alt="pdf" />
                                    </div>
                                    <div className="specifications-lists__card__details">
                                        <div className="specifications-lists__card__details__left">
                                            <div className="specifications-lists__card__details__name">
                                                {specification.fileName}
                                            </div>
                                            <div className="specifications-lists__card__details__versionInfo">
                                                <span>{specification?.versionName}</span> 
                                                &nbsp; | &nbsp;
                                                <span>
                                                    {     
                                                        moment(specification?.versionDate)
                                                        .utc().format('DD-MMM-YYYY').toString()
                                                    } 
                                                    
                                                </span>
                                            </div>
                                        </div>
                                        <div className="specifications-lists__card__details__right">
                                            <SpecificationActionPopOver id={specification.id} selectedSpecification={() => handleSelectedSpecification(specification)} 
                                                    selectedSpecificationData={selectedSpecificationData} 
                                                    deleteSpecification={handleDeleteSpecification} 
                                                    // updateSpecification={updateSpecification}
                                                    />
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                ):

                !state.isLoading  ? (
                    <div className="no-specification">
                        <div className="SpecificationListTable__nodata">
                            Upload a document to publish specification
                                <div className="SpecificationListTable__upload-btn">
                                    <Button
                                        id="upload-pdf"
                                        data-testid={'upload-file'}
                                        variant="outlined"
                                        className="btn-primary"
                                        startIcon={<CloudUploadIcon />}
                                        onClick={openSpecificationLib}
                                    >
                                        Upload
                                    </Button>
                            </div>
                        </div>
                    </div>
                ) : null
            }
        </>
        
    )
}   
