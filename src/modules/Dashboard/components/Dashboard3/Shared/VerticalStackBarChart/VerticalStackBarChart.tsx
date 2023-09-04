import React, { ReactElement, useEffect } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { CircularProgress } from "@material-ui/core";
import "./VerticalStackBarChart.scss";

am4core.addLicense("CH332271218");

am4core.useTheme(am4themes_animated);

interface VerticalStackBarChart {
  chartRef: any;
  chartDiv: string;
  chartData: any;
  nameValueAndColorList: any;
  filterType: string;
  yAxisTitle: string;
  fontStyles?: any;
  flatBar?: boolean;
  titleTextColor?: string;
  valueAxisTextColor?: string;
}

const VerticalStackBarChart = ({
  chartRef,
  chartDiv,
  chartData,
  nameValueAndColorList,
  filterType,
  yAxisTitle,
  fontStyles,
  flatBar,
  titleTextColor,
  valueAxisTextColor,
}: VerticalStackBarChart): ReactElement => {
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
          : filterType === "none"
          ? ""
          : "Years";
      categoryAxis.title.fontSize = fontStyles?.fontSize
        ? fontStyles?.fontSize
        : 8;
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.minGridDistance = 40;
      categoryAxis.renderer.labels.template.fontSize = fontStyles?.fontSize
        ? fontStyles?.fontSize
        : 8;
      categoryAxis.renderer.grid.template.strokeWidth = 0;
      categoryAxis.title.stroke = am4core.color(
        titleTextColor
          ? titleTextColor
          : fontStyles?.color
          ? fontStyles?.color
          : "#000"
      );
      categoryAxis.renderer.labels.template.stroke = valueAxisTextColor
        ? valueAxisTextColor
        : fontStyles?.color
        ? fontStyles?.color
        : "#000";

      const valueAxis = chartRef.current.yAxes.push(new am4charts.ValueAxis());
      valueAxis.title.text = yAxisTitle;
      valueAxis.title.fontSize = fontStyles?.fontSize
        ? fontStyles?.fontSize
        : 8;
      valueAxis.renderer.labels.template.fontSize = fontStyles?.fontSize
        ? fontStyles?.fontSize
        : 8;
      valueAxis.renderer.grid.template.strokeWidth = 0;
      valueAxis.cursorTooltipEnabled = false;
      valueAxis.title.stroke = am4core.color(
        titleTextColor
          ? titleTextColor
          : fontStyles?.color
          ? fontStyles?.color
          : "#000"
      );
      valueAxis.renderer.labels.template.stroke = fontStyles?.color
        ? fontStyles?.color
        : "#000";

      const cornerRadius = (radius: any, item: any) => {
        const dataItem = item.dataItem;

        // Find the last series in this stack
        let lastSeries;
        chartRef.current.series.each(function (series: any) {
          if (
            dataItem.dataContext[series.dataFields.valueY] &&
            !series.isHidden &&
            !series.isHiding
          ) {
            lastSeries = series;
          }
        });

        // If current series is the one, use rounded corner
        return dataItem.component == lastSeries ? 10 : radius;
      };

      // Create series
      const createSeries = (value: any, name: string, color: string) => {
        const series = chartRef.current.series.push(
          new am4charts.ColumnSeries()
        );
        series.columns.template.width = am4core.percent(30);
        series.dataFields.valueY = value;
        series.dataFields.categoryX = "filterType";
        series.name = name;
        series.stroke = am4core.color();
        series.tooltipText = "{name}: [bold]{valueY}[/]";
        series.tooltip.label.maxWidth = 100;
        series.tooltip.label.wrap = true;
        series.tooltip.label.fontSize = 10;
        series.stacked = true;
        series.columns.template.fill = am4core.color(color);

        if (!flatBar) {
          series.columns.template.column.adapter.add(
            "cornerRadiusTopLeft",
            cornerRadius
          );
          series.columns.template.column.adapter.add(
            "cornerRadiusTopRight",
            cornerRadius
          );
        }
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
    <div
      ref={chartRef}
      id={chartDiv}
      className="verticalStackBarChart-main"
    ></div>
  ) : (
    <div className="verticalStackBarChart-main__noDataContainer">
      {chartData?.length === 0 && (
        <div className="verticalStackBarChart-main__noDataContainer__text">
          No Data available!
        </div>
      )}

      {chartData === null && (
        <CircularProgress className="verticalStackBarChart-main__noDataContainer__circularProgress" />
      )}
    </div>
  );
};

export default VerticalStackBarChart;
