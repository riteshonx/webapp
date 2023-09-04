import React, { ReactElement, useEffect } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { CircularProgress } from "@material-ui/core";
import "./MultilineAreaChart.scss";

am4core.addLicense("CH332271218");

am4core.useTheme(am4themes_animated);

interface MultilineAreaChart {
  chartRef: any;
  chartDiv: string;
  chartData: any;
  nameValueAndColorList: any;
  filterType: string;
  yAxisTitle: string;
}

const MultilineAreaChart = ({
  chartRef,
  chartDiv,
  chartData,
  nameValueAndColorList,
  filterType,
  yAxisTitle,
}: MultilineAreaChart): ReactElement => {
  useEffect(() => {
    if (chartData?.length) {
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
      categoryAxis.renderer.minGridDistance = 0;
      categoryAxis.renderer.labels.template.fontSize = 8;
      categoryAxis.startLocation = 0.5;
      categoryAxis.endLocation = 0.5;

      const valueAxis = chartRef.current.yAxes.push(new am4charts.ValueAxis());
      valueAxis.title.text = yAxisTitle;
      valueAxis.title.fontSize = 8;
      valueAxis.renderer.labels.template.fontSize = 8;
      valueAxis.cursorTooltipEnabled = false;

      // Create series
      const createSeries = (value: any, name: string, color: string) => {
        const series = chartRef.current.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = value;
        series.tooltipText = "{name}: [bold]{valueY}[/]";
        series.tooltip.label.maxWidth = 100;
        series.tooltip.label.wrap = true;
        series.tooltip.label.fontSize = 10;
        series.sequencedInterpolation = true;
        series.stroke = am4core.color(color);
        series.strokeWidth = 2;
        series.name = name;
        series.stroke = color;
        series.fill = series.stroke;
        series.fillOpacity = 0.5;
        series.dataFields.categoryX = "filterType";
        series.tensionX = 0.77;
        return series;
      };

      nameValueAndColorList?.forEach((item: any) => {
        createSeries(item?.value, item?.name, item?.color);
      });

      chartRef.current.cursor = new am4charts.XYCursor();

      return () => {
        chartRef.current && chartRef.current?.dispose();
      };
    }
  }, [chartData]);

  return chartData?.length ? (
    <div id={chartDiv} ref={chartRef} className="multilineAreaChart-main"></div>
  ) : (
    <div className="multilineAreaChart-main__noDataContainer">
      {chartData?.length === 0 && (
        <div className="multilineAreaChart-main__noDataContainer__text">
          No Data available!
        </div>
      )}

      {chartData === null && (
        <CircularProgress className="multilineAreaChart-main__noDataContainer__circularProgress" />
      )}
    </div>
  );
};

export default MultilineAreaChart;
