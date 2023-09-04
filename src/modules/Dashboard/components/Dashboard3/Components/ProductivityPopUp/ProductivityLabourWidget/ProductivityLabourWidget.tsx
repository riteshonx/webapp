import React, { ReactElement, useState, useEffect } from 'react'
import { GET_PRODUCTIVITY_METRIC } from 'src/modules/Dashboard/components/Dashboard3/Graphql/Queries/dashboard3';
import ProgressBar from 'src/modules/shared/components/ProgressBar/ProgressBar';
import { client } from 'src/services/graphql';
import { projectFeatureAllowedRoles } from 'src/utils/role';
import './ProductivityLabourWidget.scss';
import { CircularProgress } from '@material-ui/core';

export default function ProductivityLabourWidget(props: any): ReactElement {

    const [metricInfo, setMetricInfo] = useState<any>(null);
    const [metricTotals, setMetricTotals] = useState<any>({});
    const [isLoading, setIsLoading] = useState<any>(false);
    const [infoMsg, setInfoMsg] = useState<any>('');

    useEffect(()=> {
        fetchMetricDetails();
    }, [])

    useEffect(()=> {
        fetchMetricDetails();
    }, [props.id])

    const fetchMetricDetails = async () => {
        try {
            setIsLoading(true);
            setMetricInfo(null);
            const varible = props.type === 'costCode' ? {
                dimension: "CLASSCODE",
                classificationCodeId: props.id,
                taskId: null
            } : {
                dimension: "TASK",
                classificationCodeId: null,
                taskId: props.id
            }
            const metricResponse = await client.query({
                query: GET_PRODUCTIVITY_METRIC,
                variables: varible,
                fetchPolicy: 'network-only',
                context: {
                    role: projectFeatureAllowedRoles.viewMasterPlan,
                    token: props.projectToken,
                },
            });
            if(metricResponse?.data?.ProductivityMetrics && metricResponse?.data?.ProductivityMetrics[0]) {
                const metricdata = metricResponse?.data?.ProductivityMetrics[0];
                setMetricTotals({
                    productivtyTotal: Math.max(metricdata.actualProductivity, metricdata.plannedProductivity, metricdata.requiredProductivity) + (Math.max(metricdata.actualProductivity, metricdata.plannedProductivity, metricdata.requiredProductivity) * 0.20),
                    labourTotal: Math.max(metricdata.actualHrs, metricdata.plannedHrs, metricdata.projectedHrs) + (Math.max(metricdata.actualHrs, metricdata.plannedHrs, metricdata.projectedHrs) * 0.20),
                    quantityTotal: Math.max(metricdata.actualQty, metricdata.plannedQty) + (Math.max(metricdata.actualQty, metricdata.plannedQty) * 0.20),
                    labourVariation: metricdata.projectedHrs && metricdata.plannedHrs ? (((metricdata.projectedHrs - metricdata.plannedHrs)/metricdata.plannedHrs)*100).toFixed(1) : null
                })
                setMetricInfo(metricdata);
            } else {
                setInfoMsg('No data Found')
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setInfoMsg('Some error on fetching data')
            setIsLoading(false);
        }
    };

    return (
        metricInfo ? <div className="productivity-labour-widget">
            <div className='lbr-wdgt-contnr'>
                <div className='lbr-wdgt-header'>{`Productivity(${metricInfo?.classificationCode?.UOM || 'Meters'}/Labour Hour)`}</div>
                <div className='lbr-wdgt-content'>
                    <div className='lbr-valu-sec'>
                        <span className='title'>Actual</span>
                        <span>
                            <span className='value'>{metricInfo?.actualProductivity}</span>
                            <span className='progress'></span>
                        </span>
                    </div>
                    <ProgressBar total={metricTotals.productivtyTotal} value={metricInfo?.actualProductivity} />
                    <div className='lbr-valu-sec'>
                        <span className='title'>Planned</span>
                        <span>
                            <span className='value'>{metricInfo?.plannedProductivity}</span>
                            <span className='progress'></span>
                        </span>
                    </div>
                    <ProgressBar total={metricTotals.productivtyTotal} value={metricInfo?.plannedProductivity} />
                    <div className='lbr-valu-sec'>
                        <span className='title'>To Make Planned</span>
                        <span>
                            <span className='value'>{metricInfo?.requiredProductivity}</span>
                            <span className='progress'></span>
                        </span>
                    </div>
                    <ProgressBar total={metricTotals.productivtyTotal} value={metricInfo?.requiredProductivity} />
                </div>
            </div>
            <div className='lbr-wdgt-contnr'>
                <div className='lbr-wdgt-header'>Labour Hours</div>
                <div className='lbr-wdgt-content'>
                    <div className='lbr-valu-sec'>
                        <span className='title'>Actual</span>
                        <span>
                            <span className='value'>{metricInfo?.actualHrs}</span>
                            <span className='progress'></span>
                        </span>
                    </div>
                    <ProgressBar total={metricTotals.labourTotal} value={metricInfo?.actualHrs} />
                    <div className='lbr-valu-sec'>
                        <span className='title'>Planned</span>
                        <span>
                            <span className='value'>{metricInfo?.plannedHrs}</span>
                            <span className='progress'></span>
                        </span>
                    </div>
                    <ProgressBar total={metricTotals.labourTotal} value={metricInfo?.plannedHrs} />
                    <div className='lbr-valu-sec'>
                        <span className='title'>Projected</span>
                        <span>
                            <span className='value'>{metricInfo?.projectedHrs}</span>
                            {metricTotals.labourVariation !== null ? (metricTotals.labourVariation <= 0 ? <span className='progress green'>{metricTotals.labourVariation}%▼</span> : 
                                <span className='progress'>+{metricTotals.labourVariation}%▲</span>) : <span className='progress'></span>}
                        </span>
                    </div>
                    <ProgressBar total={metricTotals.labourTotal} value={metricInfo?.projectedHrs} />
                </div>
            </div>
            <div className='lbr-wdgt-contnr'>
                <div className='lbr-wdgt-header'>{`Quantity (${metricInfo?.classificationCode?.UOM || 'Meters'})`}</div>
                <div className='lbr-wdgt-content'>
                    <div className='lbr-valu-sec'>
                        <span className='title'>Actual</span>
                        <span>
                            <span className='value'>{metricInfo?.actualQty}</span>
                            <span className='progress'></span>
                        </span>
                    </div>
                    <ProgressBar total={metricTotals.quantityTotal} value={metricInfo?.actualQty} />
                    <div className='lbr-valu-sec'>
                        <span className='title'>Planned</span>
                        <span>
                            <span className='value'>{metricInfo?.plannedQty}</span>
                            <span className='progress'></span>
                        </span>
                    </div>
                    <ProgressBar total={metricTotals.quantityTotal} value={metricInfo?.plannedQty} />
                </div>
            </div>
        </div> : <div className="productivity-labour-load-widget">
            {isLoading ? <CircularProgress color="inherit" /> : infoMsg}
        </div>
    )
}
