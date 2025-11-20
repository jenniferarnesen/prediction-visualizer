import React, { useEffect, useRef } from "react";
import Highcharts from "highcharts";
import "highcharts/modules/data";
import "highcharts/highcharts-more";

const actualDeaths = [
  [Date.UTC(2024, 0, 1), 39],
  [Date.UTC(2024, 1, 1), 28],
  [Date.UTC(2024, 2, 1), 22],
  [Date.UTC(2024, 3, 1), 43],
  [Date.UTC(2024, 4, 1), 46],
  [Date.UTC(2024, 5, 1), 33],
  [Date.UTC(2024, 6, 1), 22],
  [Date.UTC(2024, 7, 1), 55],
  [Date.UTC(2024, 8, 1), 27],
  [Date.UTC(2024, 9, 1), 26],
  [Date.UTC(2024, 10, 1), 44],
  [Date.UTC(2024, 11, 1), 32],
  // [Date.UTC(2025, 0, 1), 18],
  // [Date.UTC(2025, 1, 1), 17],
  // [Date.UTC(2025, 2, 1), 13],
];

const ExampleChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      Highcharts.chart(chartRef.current, {
        chart: {
          height: null,
          zooming: {
            type: "x",
          },
          scrollablePlotArea: {
            minWidth: 600,
            scrollPositionX: 1,
          },
        },
        title: {
          text: "Malaria deaths predictions",
          align: "left",
        },
        xAxis: {
          type: "datetime",
          accessibility: {
            rangeDescription: "Range: January 2024 - March 2025",
          },
        },
        yAxis: {
          title: {
            text: "Deaths",
          },
        },
        tooltip: {
          crosshairs: true,
          shared: true,
          xDateFormat: "%B %Y",
        },
        legend: {
          enabled: true,
        },
        series: [
          {
            name: "Actual Deaths",
            type: "line",
            data: actualDeaths,
            color: "#dc2626",
            lineWidth: 2,
            marker: {
              enabled: true,
              radius: 3,
            },
            zIndex: 3,
          },
          {
            name: "Quantile (Low-High)",
            type: "arearange",
            data: [
              [5.3, 12.7],
              [5.33, 12.37],
              [5.67, 12.83],
            ],
            color: "rgba(100, 149, 237, 0.3)",
            fillOpacity: 0.3,
            lineWidth: 0,
            marker: {
              enabled: false,
            },
            pointStart: Date.UTC(2025, 0, 1),
            pointIntervalUnit: "month",
            zIndex: 0,
          },
          {
            name: "Quantile (MidLow-MidHigh)",
            type: "arearange",
            data: [
              [6.67, 10.67],
              [6.58, 10.67],
              [6.67, 10.472],
            ],
            color: "rgba(65, 105, 225, 0.5)",
            fillOpacity: 0.5,
            lineWidth: 0,
            marker: {
              enabled: false,
            },
            pointStart: Date.UTC(2025, 0, 1),
            pointIntervalUnit: "month",
            zIndex: 1,
          },
          {
            name: "Median",
            type: "line",
            data: [8.33, 8.67, 8.67],
            color: "#1e40af",
            lineWidth: 2,
            marker: {
              enabled: true,
              radius: 4,
            },
            pointStart: Date.UTC(2025, 0, 1),
            pointIntervalUnit: "month",
            zIndex: 2,
          },
        ],
      });
    }
  }, []);

  // TODO - figure out how to make the chart the full height of the dashboard item
  return <div ref={chartRef} style={{ width: "100%", height: "400px" }} />;
};

export default ExampleChart;
