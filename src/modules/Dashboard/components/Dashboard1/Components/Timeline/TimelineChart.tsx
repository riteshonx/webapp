import { useEffect, useRef, useState, ReactElement } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import Button from "@material-ui/core/Button";
import "./Timeline.scss";
import { FormControl, MenuItem, Select } from "@material-ui/core";
import moment from "moment-timezone";
am4core.addLicense("CH332271218");

interface Props {
  chartData: any;
  handleTimelineRollUp: any;
}

am4core.useTheme(am4themes_animated);

const cYear = new Date().getFullYear();

const years = [cYear, cYear - 1, cYear - 2, cYear - 3];

const Timeline = (props: Props): ReactElement => {
  const chartRef: any = useRef(null);

  const [filter, setFilter] = useState("weekly");
  const [currentYear, setCurrentYear] = useState(years[0]);

  useEffect(() => {
    // Create chart instance
    chartRef.current = am4core.create("chartdiv", am4charts.XYChart);

    // Add data
    chartRef.current.data = generateChartData();

    // Create axes
    const dateAxis = chartRef.current.xAxes.push(new am4charts.DateAxis());

    const valueAxis = chartRef.current.yAxes.push(new am4charts.ValueAxis());
    valueAxis.cursorTooltipEnabled = false;

    chartRef.current.legend = new am4charts.Legend();
    chartRef.current.cursor = new am4charts.XYCursor();
    chartRef.current.cursor.strokeWidth = 0;
    chartRef.current.cursor.maxTooltipDistance = 0;
    chartRef.current.legend.useDefaultMarker = true;

    const markerTemplate = chartRef.current.legend.markers.template;
    markerTemplate.width = 30;
    markerTemplate.height = 4;

    dateAxis.periodChangeDateFormats.setKey("month", "[bold]yyyy[/]");

    const gradient = new am4core.RadialGradient();
    gradient.addColor(am4core.color("red"));
    gradient.addColor(am4core.color("blue"));

    const series1 = chartRef.current.series.push(new am4charts.LineSeries());
    series1.dataFields.valueY = "visits1";
    series1.dataFields.dateX = "date";
    series1.strokeWidth = 1;
    series1.tensionX = 0.77;
    series1.stroke = "#a3a3a3";
    series1.minBulletDistance = 10;
    series1.tooltipText = "PROD: {valueY}";
    series1.fillOpacity = 0.1;
    series1.name = "Productivity";
    series1.fill = gradient;
    series1.tooltip.pointerOrientation = "vertical";
    series1.tooltip.background.fillOpacity = 0;
    series1.tooltip.label.padding(4, 4, 4, 4);
    series1.tooltip.label.fontSize = 12;
    series1.tooltip.label.fill = "#000";

    const bullet1 = series1.bullets.push(new am4charts.CircleBullet());
    bullet1.circle.strokeWidth = 2;
    bullet1.circle.radius = 4;
    bullet1.circle.fill = am4core.color("#fff");

    const series2 = chartRef.current.series.push(new am4charts.LineSeries());
    series2.dataFields.valueY = "visits2";
    series2.dataFields.dateX = "date";
    series2.strokeWidth = 1;
    series2.tensionX = 0.77;
    series2.stroke = "#a3a3a3";
    series2.minBulletDistance = 10;
    series2.tooltipText = "SPI: {valueY}";
    series2.fillOpacity = 0.1;
    series2.name = "SPI";
    series2.fill = gradient;
    series2.tooltip.pointerOrientation = "vertical";
    series2.tooltip.background.fillOpacity = 0;
    series2.tooltip.label.padding(4, 4, 4, 4);
    series2.tooltip.label.fontSize = 12;
    series2.tooltip.label.fill = "#000";

    const bullet2 = series2.bullets.push(new am4charts.CircleBullet());
    bullet2.circle.strokeWidth = 2;
    bullet2.circle.radius = 4;
    bullet2.circle.fill = am4core.color("#fff");

    const series3 = chartRef.current.series.push(new am4charts.LineSeries());
    series3.dataFields.valueY = "visits3";
    series3.dataFields.dateX = "date";
    series3.strokeWidth = 1;
    series3.tensionX = 0.77;
    series3.stroke = "darkgrey";
    series3.minBulletDistance = 10;
    series3.tooltipText = "CPI: {valueY}";
    series3.fillOpacity = 0.1;
    series3.name = "CPI";
    series3.fill = gradient;
    series3.tooltip.pointerOrientation = "vertical";
    series3.tooltip.background.fillOpacity = 0;
    series3.tooltip.label.padding(4, 4, 4, 4);
    series3.tooltip.label.fontSize = 12;
    series3.tooltip.label.fill = "#000";

    const bullet3 = series3.bullets.push(new am4charts.CircleBullet());
    bullet3.circle.strokeWidth = 2;
    bullet3.circle.radius = 4;
    bullet3.circle.fill = am4core.color("#fff");

    const seriesRange1 = dateAxis.createSeriesRange(series1);
    seriesRange1.contents.strokeDasharray = "2,3";
    seriesRange1.contents.stroke = chartRef.current.colors.getIndex(8);
    seriesRange1.contents.strokeWidth = 1;

    const seriesRange2 = dateAxis.createSeriesRange(series2);
    seriesRange2.contents.strokeDasharray = "2,3";
    seriesRange2.contents.stroke = chartRef.current.colors.getIndex(8);
    seriesRange2.contents.strokeWidth = 1;

    const seriesRange3 = dateAxis.createSeriesRange(series3);
    seriesRange3.contents.strokeDasharray = "2,3";
    seriesRange3.contents.stroke = chartRef.current.colors.getIndex(8);
    seriesRange3.contents.strokeWidth = 1;

    const pattern = new am4core.LinePattern();
    pattern.rotation = -45;
    pattern.width = 1000;
    pattern.height = 1000;
    pattern.gap = 6;

    // Add scrollbar
    chartRef.current.scrollbarX = new am4core.Scrollbar();
    chartRef.current.scrollbarX.parent = chartRef.current.bottomAxesContainer;
    chartRef.current.scrollbarX.startGrip.width = 25;
    chartRef.current.scrollbarX.startGrip.height = 25;
    chartRef.current.scrollbarX.endGrip.width = 25;
    chartRef.current.scrollbarX.endGrip.height = 25;
    chartRef.current.scrollbarX.startGrip.disabled = true;
    chartRef.current.scrollbarX.endGrip.disabled = true;

    chartRef.current.scrollbarX.startGrip.icon.dx = -1;
    chartRef.current.scrollbarX.startGrip.icon.dy = -5;
    chartRef.current.scrollbarX.endGrip.icon.dx = -1;
    chartRef.current.scrollbarX.endGrip.icon.dy = -5;
    chartRef.current.zoomOutButton.disabled = true;

    if (filter === "monthly") {
      chartRef.current.events.on("ready", function () {
        dateAxis.zoomToDates(
          new Date(currentYear, 0, 1),
          new Date(currentYear, 8, 3),
          false,
          true
        );
      });
    }

    if (filter === "weekly") {
      chartRef.current.events.on("ready", function () {
        dateAxis.zoomToDates(
          new Date(currentYear, 0, 1),
          new Date(currentYear, 2, 1),
          false,
          true
        );
      });
    }

    function generateChartData() {
      const chartData: any = [];
      if (filter === "weekly") {
        for (let i = 0; i < 52; i++) {
          const isWeekExist = props.chartData?.find(
            (item: any) => item.timeDim === i + 1
          );
          if (!isWeekExist) {
            chartData.push({
              date: new Date(
                moment()
                  .tz(moment.tz.guess())
                  .isoWeekYear(currentYear)
                  .isoWeek(i + 1)
                  .startOf("week")
                  .format("MM-DD-YYYY")
              ),
              visits1: 0,
              visits2: 0,
              visits3: 0,
            });
          } else {
            chartData.push({
              date: moment(isWeekExist?.startDate)
                .tz(moment.tz.guess())
                .format("MM-DD-YYYY"),
              visits1: isWeekExist.productivity,
              visits2: isWeekExist.spi,
              visits3: isWeekExist.cpi,
            });
          }
        }
      } else if (filter === "monthly") {
        for (let i = 0; i < 12; i++) {
          const isWeekExist = props.chartData?.find(
            (item: any) => item.timeDim === i + 1
          );
          if (!isWeekExist) {
            chartData.push({
              date: new Date(moment([currentYear, i]).format("MM-DD-YYYY")),
              visits1: 0,
              visits2: 0,
              visits3: 0,
            });
          } else {
            chartData.push({
              date: moment(isWeekExist?.startDate)
                .tz(moment.tz.guess())
                .format("MM-DD-YYYY"),
              visits1: isWeekExist.productivity,
              visits2: isWeekExist.spi,
              visits3: isWeekExist.cpi,
            });
          }
        }
      } else if (filter === "quarterly") {
        for (let i = 0; i < 4; i++) {
          const isWeekExist = props.chartData?.find(
            (item: any) => item.timeDim === i + 1
          );
          if (!isWeekExist) {
            chartData.push({
              date: new Date(moment([currentYear, i * 3]).format("MM-DD-YYYY")),
              visits1: 0,
              visits2: 0,
              visits3: 0,
            });
          } else {
            chartData.push({
              date: moment(isWeekExist?.startDate)
                .tz(moment.tz.guess())
                .format("MM-DD-YYYY"),
              visits1: isWeekExist.productivity,
              visits2: isWeekExist.spi,
              visits3: isWeekExist.cpi,
            });
          }
        }
      }
      return chartData;
    }

    return () => {
      chartRef.current && chartRef.current.dispose();
    };
  }, [props.chartData, currentYear]);

  const updateData = (selected: any, e?: any) => {
    if (selected === "yearly") {
      setCurrentYear(e?.target.value);
      props.handleTimelineRollUp(selected, e);
    } else {
      setFilter(selected);
      props.handleTimelineRollUp(selected);
    }
  };

  return (
    <>
      <div className="timeline-chart">
        <Button
          onClick={() => updateData("weekly")}
          className={filter === "weekly" ? "selected" : ""}
        >
          Weekly
        </Button>

        <Button
          className={filter === "monthly" ? "selected" : ""}
          onClick={() => updateData("monthly")}
        >
          Monthly
        </Button>
        {/* <Button
          className={filter === "quarterly" ? "selected" : ""}
          onClick={() => updateData("quarterly")}
        >
          Quarterly
        </Button> */}
        <FormControl style={{ width: "7rem" }}>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={currentYear}
            label="Age"
            onChange={(e: any) => updateData("yearly", e)}
            MenuProps={{
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "left",
              },
              getContentAnchorEl: null,
            }}
          >
            {years?.map((year, index) => (
              <MenuItem value={year} key={index}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      {chartRef && <div ref={chartRef} id="chartdiv"></div>}
    </>
  );
};

export default Timeline;
