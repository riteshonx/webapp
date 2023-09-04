import React, { ReactElement } from 'react';
import './NavInfo.scss';

interface IProps {
    forminfo: any;
}

function NavInfo({forminfo}: IProps): ReactElement {
    return (
      <>
         <div className="formNavinfo__details">
            <div className="formNavinfo__details__created">
                <span className="formNavinfo__header">ID: </span>
                {
                    forminfo.status !== 'DRAFT'  ? (
                        <span>{forminfo.id}</span>
                    ) : (
                        <span>{'--'}</span>
                    )
                }
            </div>
            <div className="formNavinfo__details__created">
                    <span className="formNavinfo__header">
                        Created At :
                    </span>
                    <span>{forminfo.createdAt}</span>
            </div>
            <div className="formNavinfo__details__created">
                <span className="formNavinfo__header">CREATED By : </span>
                <span>{forminfo.createdBy}</span>
            </div>
            <div>
                <span className="formNavinfo__header">Status : </span>
                <span className="formNavinfo__status">
                    {forminfo.status}
                </span>
            </div>
        </div>
      </>
    )
}

export default React.memo(NavInfo);
