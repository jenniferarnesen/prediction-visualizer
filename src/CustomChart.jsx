import React, { useEffect, useRef } from "react";
import Highcharts from "highcharts";
import "highcharts/modules/data";
import "highcharts/highcharts-more";

const CustomChart = ({ analyticsData }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !analyticsData?.historicData) {
      return;
    }

    // Transform analytics data into Highcharts format
    const rows = analyticsData.historicData.rows || [];
    const headers = analyticsData.historicData.headers || [];

    // Find the indices for period and value
    const peIndex = headers.findIndex((h) => h.name === "pe");
    const valueIndex = headers.findIndex((h) => h.name === "value");

    // Transform rows into [timestamp, value] pairs and sort by period
    const chartData = rows
      .map((row) => {
        const period = row[peIndex]; // Format: YYYYMM
        const value = parseFloat(row[valueIndex]);

        // Parse period into date
        const year = parseInt(period.substring(0, 4));
        const month = parseInt(period.substring(4, 6)) - 1; // JS months are 0-indexed

        return [Date.UTC(year, month, 1), value];
      })
      .sort((a, b) => a[0] - b[0]); // Sort by timestamp

    Highcharts.chart(chartRef.current, {
      chart: {
        height: null,
        zooming: {
          type: "x",
        },
      },
      title: {
        text: "Historical Data",
        align: "left",
      },
      xAxis: {
        type: "datetime",
      },
      yAxis: {
        title: {
          text: "Value",
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
          name: "Historical Data",
          type: "line",
          data: chartData,
          color: "#dc2626",
          lineWidth: 2,
          marker: {
            enabled: true,
            radius: 3,
          },
        },
      ],
    });
  }, [analyticsData]);

  return <div ref={chartRef} style={{ width: "100%", height: "400px" }} />;
};

export default CustomChart;
