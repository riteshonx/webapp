import React from 'react';
import './NoData.scss';

interface NoDataProps{
    noDataMessage?:string;  
}
export const NoData = ({noDataMessage}:NoDataProps):React.ReactElement =>{

    return(
        <React.Fragment>
            <div className="noDataWrapper">
                {noDataMessage?<h2>{noDataMessage}</h2>:<h2>Nothing to show here</h2>} 
            </div>
        </React.Fragment>
    )
}