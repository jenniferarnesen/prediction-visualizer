import React, { useEffect, useRef } from "react";
import Highcharts from "highcharts";
import "highcharts/modules/data";
import "highcharts/highcharts-more";

const CustomChart = ({ analyticsData, predictionMedianData }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !analyticsData?.historicData) {
      return;
    }

    // Transform historic analytics data into Highcharts format
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

    // Transform prediction median data if available
    let predictionChartData = [];
    if (predictionMedianData?.predictionMedian) {
      const predRows = predictionMedianData.predictionMedian.rows || [];
      const predHeaders = predictionMedianData.predictionMedian.headers || [];

      const predPeIndex = predHeaders.findIndex((h) => h.name === "pe");
      const predValueIndex = predHeaders.findIndex((h) => h.name === "value");

      predictionChartData = predRows
        .map((row) => {
          const period = row[predPeIndex];
          const value = parseFloat(row[predValueIndex]);

          const year = parseInt(period.substring(0, 4));
          const month = parseInt(period.substring(4, 6)) - 1;

          return [Date.UTC(year, month, 1), value];
        })
        .sort((a, b) => a[0] - b[0]);
    }

    // Build series array
    const series = [
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
    ];

    // Add prediction median series if data is available
    if (predictionChartData.length > 0) {
      series.push({
        name: "Prediction Median",
        type: "line",
        data: predictionChartData,
        color: "#1e40af",
        lineWidth: 2,
        marker: {
          enabled: true,
          radius: 4,
        },
      });
    }

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
      series: series,
    });
  }, [analyticsData, predictionMedianData]);

  return <div ref={chartRef} style={{ width: "100%", height: "400px" }} />;
};

export default CustomChart;
