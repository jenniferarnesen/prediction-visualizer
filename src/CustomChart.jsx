import React, { useEffect, useRef } from "react";
import Highcharts from "highcharts";
import "highcharts/modules/data";
import "highcharts/highcharts-more";

const CustomChart = ({
  analyticsData,
  predictionData,
  predictionMedianId,
  predictionHighId,
  predictionLowId,
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !analyticsData?.historicData) {
      return;
    }

    // Transform historic analytics data into Highcharts format
    const rows = analyticsData.historicData.rows || [];
    const headers = analyticsData.historicData.headers || [];
    const metaData = analyticsData.historicData.metaData || {};

    // Get the historic data element name from metadata
    const historicDataName =
      metaData.items?.[
        Object.keys(metaData.items || {}).find((key) =>
          metaData.dimensions?.dx?.includes(key)
        )
      ]?.name || "Historical Data";

    const chartTitle = `${historicDataName} and predictions`;

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

    // Helper function to filter and transform prediction data by data element ID
    const getPredictionSeriesData = (dataElementId) => {
      if (!predictionData?.predictionData || !dataElementId) {
        return [];
      }

      const predRows = predictionData.predictionData.rows || [];
      const predHeaders = predictionData.predictionData.headers || [];

      const predPeIndex = predHeaders.findIndex((h) => h.name === "pe");
      const predDxIndex = predHeaders.findIndex((h) => h.name === "dx");
      const predValueIndex = predHeaders.findIndex((h) => h.name === "value");

      return predRows
        .filter((row) => row[predDxIndex] === dataElementId)
        .map((row) => {
          const period = row[predPeIndex];
          const value = parseFloat(row[predValueIndex]);

          const year = parseInt(period.substring(0, 4));
          const month = parseInt(period.substring(4, 6)) - 1;

          return [Date.UTC(year, month, 1), value];
        })
        .sort((a, b) => a[0] - b[0]);
    };

    // Get data for each prediction series
    const medianData = getPredictionSeriesData(predictionMedianId);
    const highData = getPredictionSeriesData(predictionHighId);
    const lowData = getPredictionSeriesData(predictionLowId);

    // Combine high and low data into arearange format
    const areaRangeData = [];
    if (highData.length > 0 && lowData.length > 0) {
      // Create a map of low values by timestamp for easy lookup
      const lowMap = new Map(
        lowData.map(([timestamp, value]) => [timestamp, value])
      );

      // Combine high and low values for matching timestamps
      highData.forEach(([timestamp, highValue]) => {
        const lowValue = lowMap.get(timestamp);
        if (lowValue !== undefined) {
          areaRangeData.push([timestamp, lowValue, highValue]);
        }
      });
    }

    // Build series array
    const series = [
      {
        name: historicDataName,
        type: "line",
        data: chartData,
        color: "#dc2626",
        lineWidth: 2,
        marker: {
          enabled: true,
          radius: 3,
        },
        zIndex: 2,
      },
    ];

    // Add arearange for prediction high/low if data is available
    if (areaRangeData.length > 0) {
      series.push({
        name: "Prediction Range (Low-High)",
        type: "arearange",
        data: areaRangeData,
        color: "rgba(100, 149, 237, 0.3)",
        fillOpacity: 0.3,
        lineWidth: 0,
        marker: {
          enabled: false,
        },
        zIndex: 0,
      });
    }

    // Add prediction median series if data is available
    if (medianData.length > 0) {
      series.push({
        name: "Prediction Median",
        type: "line",
        data: medianData,
        color: "#1e40af",
        lineWidth: 2,
        marker: {
          enabled: true,
          radius: 4,
        },
        zIndex: 1,
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
        text: chartTitle,
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
  }, [
    analyticsData,
    predictionData,
    predictionMedianId,
    predictionHighId,
    predictionLowId,
  ]);

  return <div ref={chartRef} style={{ width: "100%", height: "400px" }} />;
};

export default CustomChart;
