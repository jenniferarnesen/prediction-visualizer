import React from "react";
import { useDataQuery, useDataEngine } from "@dhis2/app-runtime";
import { useEffect, useState } from "react";
import ExampleChart from "./ExampleChart.jsx";
import CustomChart from "./CustomChart.jsx";

const dashboardItemsQuery = {
  dashboardItems: {
    resource: "dataStore/PREDICTION_VISUALIZER_PLUGIN/dashboardItems",
  },
};

// Helper function to get the previous 18 months in YYYYMM format
const getPrevious18Months = () => {
  const months = [];
  const now = new Date();

  for (let i = 17; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    months.push(`${year}${month}`);
  }

  return months;
};

// Helper function to get previous 12 to next 12 months in YYYYMM format
const getPrevious12ToNext12Months = () => {
  const months = [];
  const now = new Date();

  for (let i = -12; i <= 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    months.push(`${year}${month}`);
  }

  return months;
};

const getAnalyticsQuery = (historicDataId) => {
  const periods = getPrevious18Months();

  return {
    historicData: {
      resource: "analytics",
      params: {
        dimension: `dx:${historicDataId},pe:${periods.join(";")}`,
        filter: "ou:LEVEL-2",
      },
    },
  };
};

const getPredictionMedianQuery = (predictionMedianId) => {
  const periods = getPrevious12ToNext12Months();

  return {
    predictionMedian: {
      resource: "analytics",
      params: {
        dimension: `dx:${predictionMedianId},pe:${periods.join(";")}`,
        filter: "ou:LEVEL-2",
      },
    },
  };
};

const ViewChart = ({ dashboardItemId, dashboardItemFilters }) => {
  const { loading, error, data } = useDataQuery(dashboardItemsQuery);
  const engine = useDataEngine();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [predictionMedianData, setPredictionMedianData] = useState(null);

  // Get config to determine if we need to fetch analytics data
  const config = data?.dashboardItems?.[dashboardItemId];
  const chartType = config?.chartType;
  const historicDataId = config?.historicData;
  const predictionMedianId = config?.predictionMedian;

  console.log("ViewChart config:", {
    config,
    chartType,
    historicDataId,
    predictionMedianId,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!loading && chartType === "custom" && historicDataId) {
        setAnalyticsLoading(true);
        setAnalyticsError(null);
        try {
          // Fetch historic data
          const historicResult = await engine.query(
            getAnalyticsQuery(historicDataId)
          );
          setAnalyticsData(historicResult);

          // Fetch prediction median data if configured
          if (predictionMedianId) {
            const predictionResult = await engine.query(
              getPredictionMedianQuery(predictionMedianId)
            );
            setPredictionMedianData(predictionResult);
          }
        } catch (err) {
          setAnalyticsError(err);
        } finally {
          setAnalyticsLoading(false);
        }
      }
    };

    fetchAnalytics();
  }, [loading, chartType, historicDataId, predictionMedianId, engine]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading chart configuration: {error.message}</div>;
  }

  if (!config) {
    return (
      <div>
        No configuration found for this chart. Please configure it in edit mode.
      </div>
    );
  }

  if (chartType === "example") {
    return <ExampleChart />;
  }

  if (chartType === "custom") {
    if (analyticsLoading) {
      return <div>Loading analytics data...</div>;
    }

    if (analyticsError) {
      return <div>Error loading analytics data: {analyticsError.message}</div>;
    }

    console.log("Analytics data:", analyticsData);
    console.log("Prediction median data:", predictionMedianData);
    return (
      <CustomChart
        analyticsData={analyticsData}
        predictionMedianData={predictionMedianData}
      />
    );
  }

  return null;
};

export default ViewChart;
