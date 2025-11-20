import { useDataQuery, useDataEngine } from "@dhis2/app-runtime";
import { Radio, SingleSelectField, SingleSelectOption } from "@dhis2/ui";
import { useState, useEffect } from "react";

const dashboardItemsQuery = {
  dashboardItems: {
    resource: "dataStore/PREDICTION_VISUALIZER_PLUGIN/dashboardItems",
  },
};

const dataElementsQuery = {
  dataElements: {
    resource: "dataElements",
    params: {
      fields: "id,displayName",
      paging: false,
    },
  },
};

const EditChart = (props) => {
  const [chartType, setChartType] = useState("custom");
  const [historicData, setHistoricData] = useState("");
  const [predictionMedian, setPredictionMedian] = useState("");
  const [predictionHigh, setPredictionHigh] = useState("");
  const [predictionLow, setPredictionLow] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const engine = useDataEngine();
  const {
    loading: dashboardItemsLoading,
    // error: dashboardItemsError,
    data: dashboardItemsData,
  } = useDataQuery(dashboardItemsQuery);
  const {
    // loading: dataElementsLoading,
    error: dataElementsError,
    data: dataElementsData,
  } = useDataQuery(dataElementsQuery);

  // Load saved configuration when data is available
  useEffect(() => {
    if (dashboardItemsData?.dashboardItems && props.dashboardItemId) {
      const savedConfig =
        dashboardItemsData.dashboardItems[props.dashboardItemId];
      if (savedConfig) {
        setChartType(savedConfig.chartType || "custom");
        if (savedConfig.chartType === "custom") {
          setHistoricData(savedConfig.historicData || "");
          setPredictionMedian(savedConfig.predictionMedian || "");
          setPredictionHigh(savedConfig.predictionHigh || "");
          setPredictionLow(savedConfig.predictionLow || "");
        }
      }
    }
  }, [dashboardItemsData, props.dashboardItemId]);

  const saveConfigToDataStore = async () => {
    setSaveLoading(true);
    setSaveError(null);

    try {
      // Build the configuration for this dashboard item
      const itemConfig = {
        chartType,
      };

      // Only include data element fields if chartType is 'custom'
      if (chartType === "custom") {
        itemConfig.historicData = historicData;
        itemConfig.predictionMedian = predictionMedian;
        itemConfig.predictionHigh = predictionHigh;
        itemConfig.predictionLow = predictionLow;
      }

      let existingDashboardItems = {};
      let keyExists = false;

      // Check if the namespace/key exists
      try {
        const latestData = await engine.query(dashboardItemsQuery);
        existingDashboardItems = latestData?.dashboardItems || {};
        keyExists = true;
        console.log("Key exists, existing data:", existingDashboardItems);
      } catch (err) {
        // If we get a 404, the key doesn't exist yet
        if (
          err.message?.includes("404") ||
          err.details?.httpStatusCode === 404
        ) {
          console.log("Key does not exist, will create it");
          keyExists = false;
        } else {
          throw err;
        }
      }

      // Merge with new item
      const dashboardItems = {
        ...existingDashboardItems,
        [props.dashboardItemId]: itemConfig,
      };

      // Use POST if key doesn't exist, PUT if it does
      if (keyExists) {
        await engine.mutate({
          resource: "dataStore/PREDICTION_VISUALIZER_PLUGIN/dashboardItems",
          type: "update",
          data: dashboardItems,
        });
      } else {
        await engine.mutate({
          resource: "dataStore/PREDICTION_VISUALIZER_PLUGIN/dashboardItems",
          type: "create",
          data: dashboardItems,
        });
      }
    } catch (err) {
      console.error("Error saving to dataStore:", err);
      setSaveError(err);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div>
      <p>Configure chart</p>

      <div>
        <Radio
          label="Set up custom chart"
          value="custom"
          checked={chartType === "custom"}
          onChange={() => setChartType("custom")}
        />
        <Radio
          label="Use example chart"
          value="example"
          checked={chartType === "example"}
          onChange={() => setChartType("example")}
        />
      </div>

      {chartType === "custom" && (
        <div>
          <SingleSelectField
            label="Historic data"
            selected={historicData}
            onChange={({ selected }) => setHistoricData(selected)}
          >
            {dataElementsData?.dataElements?.dataElements?.map((de) => (
              <SingleSelectOption
                key={de.id}
                label={de.displayName}
                value={de.id}
              />
            ))}
          </SingleSelectField>

          <SingleSelectField
            label="Prediction median"
            selected={predictionMedian}
            onChange={({ selected }) => setPredictionMedian(selected)}
          >
            {dataElementsData?.dataElements?.dataElements?.map((de) => (
              <SingleSelectOption
                key={de.id}
                label={de.displayName}
                value={de.id}
              />
            ))}
          </SingleSelectField>

          <SingleSelectField
            label="Prediction high"
            selected={predictionHigh}
            onChange={({ selected }) => setPredictionHigh(selected)}
          >
            {dataElementsData?.dataElements?.dataElements?.map((de) => (
              <SingleSelectOption
                key={de.id}
                label={de.displayName}
                value={de.id}
              />
            ))}
          </SingleSelectField>

          <SingleSelectField
            label="Prediction low"
            selected={predictionLow}
            onChange={({ selected }) => setPredictionLow(selected)}
          >
            {dataElementsData?.dataElements?.dataElements?.map((de) => (
              <SingleSelectOption
                key={de.id}
                label={de.displayName}
                value={de.id}
              />
            ))}
          </SingleSelectField>
        </div>
      )}

      <button
        onClick={saveConfigToDataStore}
        disabled={saveLoading || dashboardItemsLoading}
      >
        {saveLoading ? "Saving..." : "Save to DataStore"}
      </button>
      {dataElementsError && (
        <div style={{ color: "red" }}>
          Data Elements Error: {dataElementsError.message}
        </div>
      )}
      {saveError && (
        <div style={{ color: "red" }}>Save Error: {saveError.message}</div>
      )}
    </div>
  );
};

export default EditChart;
