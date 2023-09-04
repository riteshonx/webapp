import React, { ReactElement, useEffect } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { CircularProgress } from "@material-ui/core";
import "./ColumnSeriesWithLineChart.scss";

am4core.addLicense("CH332271218");

am4core.useTheme(am4themes_animated);

interface ColumnSeriesWithLineChart {
  chartRef: any;
  chartDiv: string;
  chartData: any;
  nameValueAndColorList: any;
  filterType: string;
  yAxisTitle: string;
  lineSeriesNameAndValue: any;
}

const ColumnSeriesWithLineChart = ({
  chartRef,
  chartDiv,
  chartData,
  nameValueAndColorList,
  filterType,
  yAxisTitle,
  lineSeriesNameAndValue,
}: ColumnSeriesWithLineChart): ReactElement => {
  useEffect(() => {
    if (chartData?.length) {
      // Create chart instance
      chartRef.current = am4core.create(chartDiv, am4charts.XYChart);

      // Add data
      chartRef.current.data = chartData;
      chartRef.current.numberFormatter.numberFormat = "#.##,a";
      chartRef.current.numberFormatter.bigNumberPrefixes = [
        { number: 1e3, suffix: "K" },
        { number: 1e6, suffix: "M" },
        { number: 1e9, suffix: "B" },
        { number: 1e12, suffix: "T" },
      ];
      chartRef.current.numberFormatter.smallNumberPrefixes = 1;
      chartRef.current.seriesContainer.draggable = false;
      chartRef.current.seriesContainer.resizable = false;

      // Create axes
      const categoryAxis = chartRef.current.xAxes.push(
        new am4charts.CategoryAxis()
      );
      categoryAxis.dataFields.category = "filterType";
      categoryAxis.title.text =
        filterType === "monthly"
          ? "Months"
          : filterType === "quarterly"
          ? "Quarterly"
          : "Years";
      categoryAxis.title.fontSize = 8;
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.line.strokeOpacity = 0.1;
      categoryAxis.renderer.minGridDistance = 40;
      categoryAxis.renderer.cellStartLocation = 0.2;
      categoryAxis.renderer.cellEndLocation = 0.8;
      categoryAxis.renderer.grid.template.strokeWidth = 0;
      categoryAxis.renderer.labels.template.fontSize = 8;

      // First value axis
      const valueAxis = chartRef.current.yAxes.push(new am4charts.ValueAxis());
      valueAxis.renderer.grid.template.strokeWidth = 0;
      valueAxis.renderer.labels.template.fontSize = 8;
      valueAxis.title.text = yAxisTitle;
      valueAxis.title.fontSize = 8;
      valueAxis.cursorTooltipEnabled = false;

      // Second value axis
      const valueAxis2 = chartRef.current.yAxes.push(new am4charts.ValueAxis());
      valueAxis2.title.text = "CPI";
      valueAxis2.title.fontSize = 8;
      valueAxis2.renderer.grid.template.strokeWidth = 0;
      valueAxis2.renderer.labels.template.fontSize = 8;
      valueAxis2.renderer.opposite = true;
      valueAxis2.min = 0;
      valueAxis2.cursorTooltipEnabled = false;

      // First series
      const createSeries = (value: any, name: string, color: string) => {
        const series = chartRef.current.series.push(
          new am4charts.ColumnSeries()
        );
        series.columns.template.width = am4core.percent(100);
        series.tooltipText = "{name}: {valueY.value}";
        series.tooltip.label.maxWidth = 100;
        series.tooltip.label.wrap = true;
        series.tooltip.label.fontSize = 10;
        series.dataFields.valueY = value;
        series.dataFields.categoryX = "filterType";
        series.name = name;
        series.columns.template.column.cornerRadiusTopLeft = 10;
        series.columns.template.column.cornerRadiusTopRight = 10;
        series.columns.template.strokeWidth = 0;
        series.columns.template.fill = am4core.color(color);
        return series;
      };

      nameValueAndColorList?.forEach((item: any) => {
        createSeries(item?.value, item?.name, item?.color);
      });

      // Second series
      const series2 = chartRef.current.series.push(new am4charts.LineSeries());
      series2.dataFields.valueY = lineSeriesNameAndValue?.value;
      series2.dataFields.categoryX = "filterType";
      series2.name = lineSeriesNameAndValue?.name;
      series2.tooltipText = "{name}: [bold]{valueY.value}[/]";
      series2.strokeWidth = 2;
      series2.strokeDasharray = "3,3";
      series2.yAxis = valueAxis2;
      series2.stroke = am4core.color("#3B93A4");

      // Add cursor
      chartRef.current.cursor = new am4charts.XYCursor();

      return () => {
        chartRef.current && chartRef.current.dispose();
      };
    }
  }, [chartData]);

  return chartData?.length ? (
    <div
      id={chartDiv}
      ref={chartRef}
      className="columnSeriesWithLineChart-main"
    ></div>
  ) : (
    <div className="columnSeriesWithLineChart-main__noDataContainer">
      {chartData?.length === 0 && (
        <div className="columnSeriesWithLineChart-main__noDataContainer__text">
          No Data available!
        </div>
      )}
      {chartData === null && (
        <CircularProgress className="columnSeriesWithLineChart-main__noDataContainer__circularProgress" />
      )}
    </div>
  );
};

export default ColumnSeriesWithLineChart;
