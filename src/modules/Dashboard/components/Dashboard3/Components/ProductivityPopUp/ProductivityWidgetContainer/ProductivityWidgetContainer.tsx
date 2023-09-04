import React, { ReactElement } from 'react'
import ProductivityDetailedWidget from '../ProductivityDetailedWidget/ProductivityDetailedWidget';
import ProductivityGraphWidget from '../ProductivityGraphWidget/ProductivityGraphWidget';
import ProductivityLabourWidget from '../ProductivityLabourWidget/ProductivityLabourWidget';
import './ProductivityWidgetContainer.scss';

export default function ProductivityWidgetContainer(props: any): ReactElement {
    return (
        <div className="productivity-widget-container">
            <ProductivityLabourWidget type={props.type} id={props.id} projectToken={props.projectToken} />
            <ProductivityGraphWidget type={props.type} id={props.id} projectToken={props.projectToken} />
            <ProductivityDetailedWidget type={props.type} id={props.id} projectId={props.projectId} projectToken={props.projectToken} />
        </div>
    )
}
