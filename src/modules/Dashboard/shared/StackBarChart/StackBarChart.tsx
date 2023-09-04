import { ReactElement, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./StackBarChart.scss";
import { nFormatter } from "src/modules/Dashboard/utils/util";

interface Props {
  chartData: any;
  isTop: string;
  barDimensions: any;
}

const StackBarChart = (props: Props): ReactElement => {
  const stackBarChartRef = useRef(null);

  useEffect(() => {
    const UNIT_LABEL_WIDTH = 60;
    const UNIT_LABEL_HEIGHT = 25;
    const GUTTER_WIDTH = 25;
    const chartLegendContainer = `.chart-${props?.isTop}-legend-container`;

    const margins = {
      left: UNIT_LABEL_WIDTH,
      bottom: UNIT_LABEL_HEIGHT,
      right: GUTTER_WIDTH,
    };

    const sizes = props.barDimensions;

    const width = sizes.width - margins.left - margins.right;
    const height = sizes.height - margins.bottom;

    const series = props.chartData.map(function (d: any) {
      return d.source;
    });

    let dataset: any = props.chartData.map(function (d: any, i: any) {
      return d.data.map(function (o: any, j: any) {
        // Structure it so that your numeric axis (the stacked amount) is y
        return {
          y: o.count,
          x: o.target.name,
          y0: i === 0 ? 0 : props.chartData[i - 1]?.data[j]?.count,
        };
      });
    });

    d3.stack()(dataset);

    dataset = dataset.map(function (group: any) {
      return group.map(function (d: any) {
        // Invert the x and y values, and y0 becomes x0
        return {
          x: d.y,
          y: d.x?.length > 4 ? d.x.slice(0, 4).trim() + "..." : d.x,
          x0: d.y0,
        };
      });
    });

    const svgEl = d3.select(stackBarChartRef.current);
    svgEl.selectAll("*").remove();

    const svg = svgEl
      .append("svg")
      .attr("width", width + margins.left + margins.right)
      .attr("height", height + margins.bottom)
      .append("g")
      .attr("transform", "translate(" + margins.left + ", 0)");

    const units = dataset[0].map(function (d: any) {
      return d.y?.length > 4 ? d.y.slice(0, 4).trim() + "..." : d.y;
    });

    const yScale: any = d3
      .scaleBand()
      .domain(units)
      .rangeRound([0, height])
      .padding(0.1);

    const yAxis = d3.axisLeft(yScale);
    const xMax: any = d3.max(dataset, function (group: any) {
      const groupMax = d3.max(group, function (d: any) {
        return d.x + (d.x0 ? d.x0 : 0);
      });
      return groupMax;
    });

    const ticksValues: any = [0, xMax / 4, xMax / 2, (xMax * 3) / 4, xMax];

    const xScale = d3.scaleLinear().domain([0, xMax]).range([0, width]);
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(ticksValues)
      .tickFormat((val: any) => {
        return nFormatter(val, 0);
      });

    const colors = function (i: any) {
      return i ? "#455964" : "#FFC100";
    };

    // define tooltip
    const tooltip = d3
      .select(stackBarChartRef.current) // select element in the DOM with id 'chart'
      .append("div") // append a div element to the element we've selected
      .attr("class", "tooltip"); // add class 'tooltip' on the divs we just selected

    tooltip
      .append("div") // add divs to the tooltip defined above
      .attr("class", "label"); // add class 'label' on the selection

    const groups = svg
      .selectAll("g")
      .data(dataset)
      .enter()
      .append("g")
      .style("fill", function (d: any, i: any) {
        return colors(i);
      });

    groups
      .selectAll("rect")
      .data(function (d: any) {
        return d;
      })
      .enter()
      .append("rect")
      .attr("x", function (d: any) {
        return xScale(d.x0);
      })
      .attr("y", function (d: any) {
        return yScale(d.y);
      })
      .attr("height", function () {
        return yScale.bandwidth();
      })
      .attr("width", function (d: any) {
        return xScale(d.x);
      })
      .on("mouseover", function (event: any, d: any) {
        tooltip.select(".label").html(nFormatter(d.x)); // set current label
        tooltip.style("display", "block"); // set display
        tooltip
          .style("top", event.layerY + 10 + "px") // always 10px below the cursor
          .style("left", event.layerX + 10 + "px");
      })
      .on("mouseout", function () {
        // when mouse leaves div
        tooltip.style("display", "none"); // hide tooltip for that element
      });

    svg
      .append("g")
      .attr("class", "bc-x-axis bc-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g").attr("class", "bc-y-axis bc-axis").call(yAxis);

    const legendEl = d3.select(chartLegendContainer);
    legendEl.selectAll("*").remove();

    // Legend
    const legendContainer = legendEl.append("div").attr("class", "bc-legend");

    legendContainer
      .append("span")
      .attr("class", "bc-legend-label")
      .html(series[0]);

    series.forEach(function (s: any, i: any) {
      legendContainer
        .append("span")
        .attr("class", "bc-legend-color")
        .style("background-color", colors(i));
    });

    legendContainer
      .append("span")
      .attr("class", "bc-legend-label")
      .html(series[1]);
  }, [props.chartData]);

  return (
    <div className="stackbar-chart">
      {stackBarChartRef && (
        <>
          <div ref={stackBarChartRef}></div>
          <div className={`chart-${props?.isTop}-legend-container`}></div>
        </>
      )}
    </div>
  );
};

export default StackBarChart;
