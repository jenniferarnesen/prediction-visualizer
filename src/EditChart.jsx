import { useDataQuery, useDataEngine } from "@dhis2/app-runtime";
import { Radio, TabBar, Tab, Button } from "@dhis2/ui";
import { useState, useEffect } from "react";
import DataSelector from "./DataSelector.jsx";
import OrgUnitSelector from "./OrgUnitSelector/index.ts";

const dashboardItemsQuery = {
  dashboardItems: {
    resource: "dataStore/PREDICTION_VISUALIZER_PLUGIN/dashboardItems",
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
  const [activeTab, setActiveTab] = useState("data");
  const [orgUnits, setOrgUnits] = useState([]);
  const [orgUnitLevel, setOrgUnitLevel] = useState(undefined);

  const engine = useDataEngine();
  const {
    loading: dashboardItemsLoading,
    // error: dashboardItemsError,
    data: dashboardItemsData,
  } = useDataQuery(dashboardItemsQuery);

  // Load saved configuration when data is available
  useEffect(() => {
    if (dashboardItemsData?.dashboardItems && props.dashboardItemId) {
      const savedConfig =
        dashboardItemsData.dashboardItems[props.dashboardItemId];
      if (savedConfig) {
        console.log("jj savedConfig:", savedConfig);
        setChartType(savedConfig.chartType || "custom");
        if (savedConfig.chartType === "custom") {
          setHistoricData(savedConfig.historicData || "");
          setPredictionMedian(savedConfig.predictionMedian || "");
          setPredictionHigh(savedConfig.predictionHigh || "");
          setPredictionLow(savedConfig.predictionLow || "");
          setOrgUnits(savedConfig.orgUnits || []);
          setOrgUnitLevel(savedConfig.orgUnitLevel || undefined);
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
        itemConfig.orgUnits = orgUnits.map((ou) => ({
          id: ou.id,
          path: ou.path,
        }));
        itemConfig.orgUnitLevel = orgUnitLevel?.id;
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

  console.log("activeTab:", activeTab);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", gap: "16px" }}>
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
        <div style={{ flex: 1, overflow: "auto" }}>
          <TabBar>
            <Tab
              selected={activeTab === "data"}
              onClick={() => setActiveTab("data")}
            >
              Data
            </Tab>
            <Tab
              selected={activeTab === "orgunit"}
              onClick={() => setActiveTab("orgunit")}
            >
              Org units
            </Tab>
          </TabBar>

          {activeTab === "data" && (
            <DataSelector
              historicData={historicData}
              setHistoricData={setHistoricData}
              predictionMedian={predictionMedian}
              setPredictionMedian={setPredictionMedian}
              predictionHigh={predictionHigh}
              setPredictionHigh={setPredictionHigh}
              predictionLow={predictionLow}
              setPredictionLow={setPredictionLow}
            />
          )}

          {activeTab === "orgunit" && (
            <OrgUnitSelector
              orgUnits={orgUnits}
              setOrgUnits={setOrgUnits}
              orgUnitLevel={orgUnitLevel}
              setOrgUnitLevel={setOrgUnitLevel}
            />
          )}
        </div>
      )}

      <div>
        <Button
          onClick={saveConfigToDataStore}
          disabled={saveLoading || dashboardItemsLoading}
        >
          {saveLoading ? "Saving..." : "Save configuration"}
        </Button>
        {saveError && (
          <div style={{ color: "red" }}>Save Error: {saveError.message}</div>
        )}
      </div>
    </div>
  );
};

export default EditChart;
