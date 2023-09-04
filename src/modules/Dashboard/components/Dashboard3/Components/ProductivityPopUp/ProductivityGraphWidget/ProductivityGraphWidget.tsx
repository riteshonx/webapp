import React, { ReactElement, useState, useEffect } from 'react'
import './ProductivityGraphWidget.scss';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { GET_LABOUR_HRS_VS_QTY, GET_LABOUR_PROJECTED_HRS_VS_QTY } from 'src/modules/Dashboard/components/Dashboard3/Graphql/Queries/dashboard3';
import { client } from 'src/services/graphql';
import { projectFeatureAllowedRoles } from 'src/utils/role';
import { CircularProgress } from '@material-ui/core';
am4core.addLicense("CH332271218");

export default function ProductivityGraphWidget(props: any): ReactElement {

    const [graphInfo, setGraphInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<any>(false);
    const [infoMsg, setInfoMsg] = useState<any>('');
    const [unit, setUnit] = useState<any>('Meters');

    useEffect(() => {
        fetchGrapghDetails();
    }, [])

    useEffect(() => {
        fetchGrapghDetails();
    }, [props.id])

    const fetchGrapghDetails = async () => {
        try {
            setIsLoading(true);
            setGraphInfo(null);
            const varible = props.type === 'costCode' ? {
                dimension: "CLASSCODE",
                classificationCodeId: props.id,
                taskId: null
            } : {
                dimension: "TASK",
                classificationCodeId: null,
                taskId: props.id
            }
            const PrjtdLabourResponse = await fetchData(GET_LABOUR_PROJECTED_HRS_VS_QTY, varible)
            varible.dimension = props.type === 'costCode' ? 'DAILYCLASSCODE' : 'DAILYTASK'
            const labourResponse = await fetchData(GET_LABOUR_HRS_VS_QTY, varible)
            if (PrjtdLabourResponse && labourResponse && PrjtdLabourResponse.ProductivityMetrics && labourResponse.ProductivityMetrics[0]) {
                const data = labourResponse.ProductivityMetrics.reduce((result: any, metric: any, index: number) => {
                    const newPlot: any = { actualQtyX: metric.actualQty, actualHrsY: metric.actualHrs }
                    if (metric.variancesCount) {
                        newPlot.varienceX = metric.actualQty;
                        newPlot.varienceY = metric.actualHrs;
                        newPlot.variancesCount = metric.variancesCount;
                    }

                    if (index === labourResponse.ProductivityMetrics.length - 1) {
                        newPlot.plannedQtyX = metric.actualQty
                        newPlot.projectedHrsY = metric.actualHrs
                        result.push(newPlot);
                        const lastPlot = { ...newPlot }
                        lastPlot.plannedQtyX = PrjtdLabourResponse.ProductivityMetrics[0].plannedQty;
                        lastPlot.projectedHrsY = PrjtdLabourResponse.ProductivityMetrics[0].projectedHrs;
                        result.push(lastPlot);
                    } else {
                        result.push(newPlot);
                    }
                    return result;
                }, [])
                drawChart(data, PrjtdLabourResponse.ProductivityMetrics[0].plannedQty, PrjtdLabourResponse.ProductivityMetrics[0].plannedHrs)
                setGraphInfo(data)
                setUnit(labourResponse.ProductivityMetrics[0].classificationCode?.UOM || 'Meters');
            } else {
                setInfoMsg('No data Found')
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
            setInfoMsg('Some error on fetching data')
        }
    };

    const fetchData = async (query: any, variables: any) => {
        const responseData = await client.query({
            query: query,
            variables: variables,
            fetchPolicy: 'network-only',
            context: { role: projectFeatureAllowedRoles.viewMasterPlan, token: props.projectToken }
        });
        return responseData?.data;
    }

    const drawChart = async (data: any, gridXValue: any, gridYValue: any) => {
        const chart = am4core.create("chartdiv", am4charts.XYChart);
        chart.data = data;

        const XAxis = chart.xAxes.push(new am4charts.ValueAxis());
        const yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        XAxis.width = am4core.percent(99)
        XAxis.renderer.height = 20;
        setAxisStyle(XAxis);
        setAxisStyle(yAxis);

        const plnedXdot = XAxis.axisRanges.create();
        plnedXdot.value = gridXValue;
        setDotGridStyle(plnedXdot)

        const plnedYdot = yAxis.axisRanges.create();
        plnedYdot.value = gridYValue;
        plnedYdot.label.text = 'Planned Hours';
        plnedYdot.label.inside = true;
        plnedYdot.label.verticalCenter = "bottom";
        plnedYdot.label.dy = 10;
        setDotGridStyle(plnedYdot)

        const series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueX = "actualQtyX";
        series.dataFields.valueY = "actualHrsY";
        series.strokeWidth = 2;
        series.stroke = am4core.color("#34B53A");

        const series2 = chart.series.push(new am4charts.LineSeries());
        series2.dataFields.valueX = "plannedQtyX";
        series2.dataFields.valueY = "projectedHrsY";
        series2.strokeWidth = 2;
        series2.stroke = am4core.color("#34B53A");
        series2.strokeDasharray = "3,3";

        const series3 = chart.series.push(new am4charts.LineSeries());
        series3.dataFields.valueX = "varienceX";
        series3.dataFields.valueY = "varienceY";
        series3.strokeWidth = 0;
        series3.stroke = am4core.color("#FFA80D");

        const bullet = series3.bullets.push(new am4charts.Bullet());
        const circle = bullet.createChild(am4core.Circle);
        circle.radius = 8;
        circle.fill = am4core.color("#FFA80D");
        circle.y = -20
        const labelBullet = series3.bullets.push(new am4charts.LabelBullet());
        labelBullet.label.text = "{variancesCount}";
        labelBullet.label.fontSize = 10
        labelBullet.label.fontWeight = "700"
        labelBullet.label.fill = am4core.color("#fff")
        labelBullet.label.dy = -20;
    }

    const setAxisStyle = async (axis: any) => {
        axis.renderer.grid.template.stroke = am4core.color("#3b3b3b");
        axis.renderer.grid.template.strokeWidth = .5
        axis.renderer.fontSize = 10
        axis.renderer.fontWeight = "400";
        axis.renderer.opacity = 0.44;
        axis.renderer.axis.strokeWidth = 0.0
    }

    const setDotGridStyle = async (girdLine: any) => {
        girdLine.grid.stroke = am4core.color("#E0E0E0");
        girdLine.grid.strokeWidth = 2;
        girdLine.grid.strokeDasharray = "3,3";
        girdLine.grid.strokeOpacity = 1;
    }

    return (
        <div className="productivity-graph-widget">
            <div className='graphHeader'>
                <div className='header-title'>Labour Hours vs Quantity</div>
                <div className='variances-ind'>
                    <span className='variances-dot'></span>Variances
                </div>
            </div>
            <div className='graphcontent'>
                <div className="graphAxis y-axis">Labour Hours</div>
                <div className='chartdiv'></div>
            </div>
            <div className='graphFooter'>
                <div className='legend'>To Make Planned Qty:&nbsp;<div className='dashed-line'></div></div>
                <div className="graphAxis">Qty ({unit})</div>
            </div>
            {!graphInfo &&
                <div className="productivity-graph-load-widget">
                    {isLoading ? <CircularProgress color="inherit" /> : infoMsg}
                </div>
            }
        </div>
    )
}
