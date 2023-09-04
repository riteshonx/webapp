import React, { ReactElement, useState } from 'react'
import './ProductivityDetailedWidget.scss';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ProductivityDataWidget from '../ProductivityDataWidget/ProductivityDataWidget';
import ProductivityInsightWidget from '../ProductivityInsightWidget/ProductivityInsightWidget';
import ProductivityRelatedWidget from '../ProductivityRelatedWidget/ProductivityRelatedWidget';

export default function ProductivityDetailedWidget(props: any): ReactElement {

    const [tabValue, setTabValue] = React.useState(0);

    const handleChange = (event: any, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <div className="productivity-detailed-widget">
            <div className='dtld-wdgt-tabSection'>
                <Tabs className='product-metric-tab' value={tabValue} onChange={handleChange} >
                    <Tab label="Data" />
                    <Tab label="Insights" />
                    <Tab label="Related Items" />
                </Tabs>
                <div className='variances-ind'>
                    <span className='variances-dot'></span>Variances
                </div>
            </div>
            <div className='dtld-wdgt-content'>
                {tabValue === 0 && <ProductivityDataWidget type={props.type} id={props.id} projectToken={props.projectToken} /> }
                {tabValue === 1 && <ProductivityInsightWidget type={props.type} id={props.id} projectToken={props.projectToken} /> }
                {tabValue === 2 && <ProductivityRelatedWidget type={props.type} id={props.id} projectId={props.projectId} projectToken={props.projectToken} /> }
            </div>
        </div>
    )
}
