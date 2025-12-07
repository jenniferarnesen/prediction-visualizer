import React from "react";
import { useDataQuery, useDataEngine } from "@dhis2/app-runtime";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
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

// Helper function to get ISO week number
const getISOWeek = (date) => {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000);
};

// Helper function to get the previous 18 months worth of weeks (~78 weeks) in YYYYWWW format
const getPrevious18MonthsWeeks = () => {
  const weeks = [];
  const now = new Date();

  // Calculate approximately 78 weeks back (18 months * 4.33 weeks/month)
  for (let i = 77; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const week = getISOWeek(date);
    weeks.push(`${year}W${String(week).padStart(2, "0")}`);
  }

  // Remove duplicates while maintaining order
  return [...new Set(weeks)];
};

// Helper function to get previous 12 to next 12 months worth of weeks (~104 weeks) in YYYYWWW format
const getPrevious12ToNext12MonthsWeeks = () => {
  const weeks = [];
  const now = new Date();

  // Calculate approximately 52 weeks back and 52 weeks forward (12 months * 4.33 weeks/month)
  for (let i = -52; i <= 52; i++) {
    const date = new Date(now.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const week = getISOWeek(date);
    weeks.push(`${year}W${String(week).padStart(2, "0")}`);
  }

  // Remove duplicates while maintaining order
  return [...new Set(weeks)];
};

const getAnalyticsQuery = (
  historicDataId,
  orgUnits,
  orgUnitLevel,
  periodType = "monthly"
) => {
  const periods =
    periodType === "weekly"
      ? getPrevious18MonthsWeeks()
      : getPrevious18Months();

  // Build org unit dimension - can combine level and individual org units
  const ouFilters = [];
  if (orgUnitLevel) {
    ouFilters.push(`LEVEL-${orgUnitLevel}`);
  }
  if (orgUnits && orgUnits.length > 0) {
    ouFilters.push(...orgUnits.map((ou) => ou.id));
  }
  // Default to LEVEL-2 if nothing specified
  const ouDimension =
    ouFilters.length > 0 ? `ou:${ouFilters.join(";")}` : "ou:LEVEL-2";

  return {
    historicData: {
      resource: "analytics",
      params: {
        dimension: `dx:${historicDataId},pe:${periods.join(
          ";"
        )},${ouDimension}`,
        includeMetadataDetails: "true",
      },
    },
  };
};

const getPredictionQuery = (
  predictionMedianId,
  predictionHighId,
  predictionLowId,
  orgUnits,
  orgUnitLevel,
  periodType = "monthly"
) => {
  const periods =
    periodType === "weekly"
      ? getPrevious12ToNext12MonthsWeeks()
      : getPrevious12ToNext12Months();
  const dataElements = [
    predictionMedianId,
    predictionHighId,
    predictionLowId,
  ].filter(Boolean);

  // Build org unit dimension - can combine level and individual org units
  const ouFilters = [];
  if (orgUnitLevel) {
    ouFilters.push(`LEVEL-${orgUnitLevel}`);
  }
  if (orgUnits && orgUnits.length > 0) {
    ouFilters.push(...orgUnits.map((ou) => ou.id));
  }

  // Default to LEVEL-2 if nothing specified
  const ouDimension =
    ouFilters.length > 0 ? `ou:${ouFilters.join(";")}` : "ou:LEVEL-2";

  return {
    predictionData: {
      resource: "analytics",
      params: {
        dimension: `dx:${dataElements.join(";")},pe:${periods.join(
          ";"
        )},${ouDimension}`,
        includeMetadataDetails: "true",
      },
    },
  };
};

const ViewChart = (props) => {
  const { dashboardItemId } = props;
  const { loading, error, data } = useDataQuery(dashboardItemsQuery);
  const engine = useDataEngine();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [historicDataName, setHistoricDataName] = useState(null);
  const [extractedOrgUnits, setExtractedOrgUnits] = useState([]);

  // Get config to determine if we need to fetch analytics data
  const config = data?.dashboardItems?.[dashboardItemId];
  const chartType = config?.chartType;
  const historicDataId = config?.historicData;
  const predictionMedianId = config?.predictionMedian;
  const predictionHighId = config?.predictionHigh;
  const predictionLowId = config?.predictionLow;
  const orgUnits = config?.orgUnits;
  const orgUnitLevel = config?.orgUnitLevel;
  const periodType = config?.periodType || "monthly";

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!loading && chartType === "custom" && historicDataId) {
        setAnalyticsLoading(true);
        setAnalyticsError(null);
        try {
          // Fetch historic data
          const historicResult = await engine.query(
            getAnalyticsQuery(
              historicDataId,
              orgUnits,
              orgUnitLevel,
              periodType
            )
          );
          setAnalyticsData(historicResult);

          // Extract and set the display name from analytics metadata
          const metaData = historicResult?.historicData?.metaData || {};
          const displayName =
            metaData.items?.[
              Object.keys(metaData.items || {}).find((key) =>
                metaData.dimensions?.dx?.includes(key)
              )
            ]?.name || "Historical Data";
          setHistoricDataName(displayName);

          // Extract org units from metadata
          const ouDimension = metaData.dimensions?.ou || [];
          const ouItems = ouDimension.map((ouId) => ({
            id: ouId,
            displayName: metaData.items?.[ouId]?.name || ouId,
          }));
          setExtractedOrgUnits(ouItems);

          // Fetch prediction data if any prediction data element is configured
          if (predictionMedianId || predictionHighId || predictionLowId) {
            const predictionResult = await engine.query(
              getPredictionQuery(
                predictionMedianId,
                predictionHighId,
                predictionLowId,
                orgUnits,
                orgUnitLevel,
                periodType
              )
            );
            setPredictionData(predictionResult);
          }
        } catch (err) {
          setAnalyticsError(err);
        } finally {
          setAnalyticsLoading(false);
        }
      }
    };

    fetchAnalytics();
  }, [
    loading,
    chartType,
    historicDataId,
    predictionMedianId,
    predictionHighId,
    predictionLowId,
    engine,
    orgUnits,
    orgUnitLevel,
    periodType,
  ]);

  // Set dashboard item title when historic data name is available
  useEffect(() => {
    if (historicDataName && props.setDashboardItemDetails) {
      props.setDashboardItemDetails({
        itemTitle: historicDataName,
      });
    }
  }, [historicDataName, props]);

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

    return (
      <CustomChart
        analyticsData={analyticsData}
        predictionData={predictionData}
        predictionMedianId={predictionMedianId}
        predictionHighId={predictionHighId}
        predictionLowId={predictionLowId}
        periodType={periodType}
        orgUnits={extractedOrgUnits}
      />
    );
  }

  return null;
};

ViewChart.propTypes = {
  dashboardItemId: PropTypes.string,
  dashboardItemFilters: PropTypes.object,
  setDashboardItemDetails: PropTypes.func,
};

export default ViewChart;
