import React, { ReactElement } from 'react';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Tooltip from '@material-ui/core/Tooltip';
import './SpecificationViewerHeader.scss';

export default function SpecificationViewerHeader(props: any): ReactElement {

    return (
        <div className="spec-viewer-header">
            <div className="spec-viewer-header__wrapper">
                <div className="spec-viewer-header__wrapper__text">
                    <div className="spec-viewer-header__wrapper__navBack">
                        <ArrowBackIosIcon onClick={() => props.navigateBack()} />
                    </div>
                    <h2>
                        <Tooltip title={''} aria-label="delete category">
                            <label>
                                {/* {`${props?.specificationSheetsDetails?.sectionNumber} - ${props?.specificationSheetsDetails?.sectionName}`} */}
                                Specification Viewer
                            </label>
                        </Tooltip>
                    </h2>
                </div>
                <div className="spec-viewer-header__wrapper__selectBox">
                    {/* 2 */}
                </div>
                <div className="spec-viewer-header__wrapper__followers">
                    {/* 3 */}
                </div>
            </div>
        </div>
    )
}
