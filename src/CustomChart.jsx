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
  periodType = "monthly",
}) => {
  console.log("jj custom chart", { analyticsData, predictionData });
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

    // Helper function to parse period string based on type
    const parsePeriod = (period) => {
      if (periodType === "weekly") {
        // Format: YYYYWW or YYYYWWW (e.g., "2024W1" or "2024W01")
        const year = parseInt(period.substring(0, 4));
        const week = parseInt(period.substring(5)); // Parse from after 'W' to end

        // Calculate date from ISO week
        // January 4th is always in week 1
        const jan4 = new Date(Date.UTC(year, 0, 4));
        const weekStart = new Date(jan4);
        weekStart.setUTCDate(
          jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7) + (week - 1) * 7
        );

        return weekStart.getTime();
      } else {
        // Format: YYYYMM (e.g., "202401")
        const year = parseInt(period.substring(0, 4));
        const month = parseInt(period.substring(4, 6)) - 1; // JS months are 0-indexed

        return Date.UTC(year, month, 1);
      }
    };

    // Find the indices for period and value
    const peIndex = headers.findIndex((h) => h.name === "pe");
    const valueIndex = headers.findIndex((h) => h.name === "value");

    // Transform rows into [timestamp, value] pairs and sort by period
    const chartData = rows
      .map((row) => {
        const period = row[peIndex];
        const value = parseFloat(row[valueIndex]);

        return [parsePeriod(period), value];
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

          return [parsePeriod(period), value];
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
        xDateFormat: periodType === "weekly" ? "Week %W, %Y" : "%B %Y",
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
    periodType,
  ]);

  return <div ref={chartRef} style={{ width: "100%", height: "400px" }} />;
};

export default CustomChart;
