import { useDataQuery } from "@dhis2/app-runtime";
import {
  SingleSelectField,
  SingleSelectOption,
  Input,
  InputField,
} from "@dhis2/ui";
import styles from "./DataSelector.module.css";

const dataElementsQuery = {
  dataElements: {
    resource: "dataElements",
    params: {
      fields:
        "id,displayName,code,dataSetElements[dataSet[id,periodType,name]]",
      paging: false,
    },
  },
};

const DataSelector = ({
  historicData,
  setHistoricData,
  predictionMedian,
  setPredictionMedian,
  predictionHigh,
  setPredictionHigh,
  predictionMidHigh,
  setPredictionMidHigh,
  predictionLow,
  setPredictionLow,
  predictionMidLow,
  setPredictionMidLow,
  setPeriodType,
}) => {
  const {
    error: dataElementsError,
    data: dataElementsData,
    loading,
  } = useDataQuery(dataElementsQuery);

  if (loading) {
    return <div>Loading data elements...</div>;
  }

  const updateHistoricalData = ({ selected }) => {
    setHistoricData(selected);

    // Find the selected data element to get its code and period type
    const selectedElement = dataElementsData?.dataElements?.dataElements?.find(
      (de) => de.id === selected
    );

    // Set the period type from the data element's dataset
    if (selectedElement?.dataSetElements?.[0]?.dataSet?.periodType) {
      const dataSetPeriodType =
        selectedElement.dataSetElements[0].dataSet.periodType.toLowerCase();
      setPeriodType(dataSetPeriodType);
    }

    if (!selectedElement?.code) {
      // Clear prediction fields if no code available
      setPredictionHigh("");
      setPredictionMedian("");
      setPredictionLow("");
      return;
    }

    // Find data elements with codes that contain the same string
    const baseCode = selectedElement.code;
    const relatedElements =
      dataElementsData?.dataElements?.dataElements?.filter(
        (de) => de.code && de.code.includes(baseCode)
      );

    // Track which fields were found
    let foundHigh = false;
    let foundMidHigh = false;
    let foundMedian = false;
    let foundMidLow = false;
    let foundLow = false;

    // Auto-select prediction fields based on code patterns
    relatedElements?.forEach((de) => {
      console.log("jj de code", de.code);
      if (de.code.includes("QUANTILE_HIGH") || de.code.includes("CHAP_HIGH")) {
        setPredictionHigh(de.id);
        foundHigh = true;
      } else if (
        de.code.includes("QUANTILE_MID_HIGH") ||
        de.code.includes("CHAP_MID_HIGH")
      ) {
        setPredictionMidHigh(de.id);
        foundMidHigh = true;
      } else if (
        de.code.includes("QUANTILE_MEDIAN") ||
        de.code.includes("CHAP_MEDIAN")
      ) {
        setPredictionMedian(de.id);
        foundMedian = true;
      } else if (
        de.code.includes("QUANTILE_MID_LOW") ||
        de.code.includes("CHAP_MID_LOW")
      ) {
        setPredictionMidLow(de.id);
        foundMidLow = true;
      } else if (
        de.code.includes("QUANTILE_LOW") ||
        de.code.includes("CHAP_LOW")
      ) {
        setPredictionLow(de.id);
        foundLow = true;
      }
    });

    // Clear fields that didn't find a match
    if (!foundHigh) {
      setPredictionHigh("");
    }
    if (!foundMidHigh) {
      setPredictionMidHigh("");
    }
    if (!foundMedian) {
      setPredictionMedian("");
    }
    if (!foundMidLow) {
      setPredictionMidLow("");
    }
    if (!foundLow) {
      setPredictionLow("");
    }
  };

  // Filter out prediction data elements from historical data selector
  const historicalDataElements =
    dataElementsData?.dataElements?.dataElements?.filter(
      (de) =>
        !de.code?.includes("QUANTILE_HIGH") &&
        !de.code?.includes("QUANTILE_MID_HIGH") &&
        !de.code?.includes("QUANTILE_MEDIAN") &&
        !de.code?.includes("QUANTILE_MID_LOW") &&
        !de.code?.includes("QUANTILE_LOW") &&
        !de.code?.includes("CHAP_HIGH") &&
        !de.code?.includes("CHAP_MID_HIGH") &&
        !de.code?.includes("CHAP_MEDIAN") &&
        !de.code?.includes("CHAP_MID_LOW") &&
        !de.code?.includes("CHAP_LOW")
    ) || [];

  return (
    <div className={styles.dataSelectContainer}>
      <div style={{ display: "flex", flexDirection: "row", gap: "8px" }}>
        <div style={{ flex: 3 }}>
          <SingleSelectField
            label="Historic data"
            selected={historicData}
            onChange={updateHistoricalData}
            filterable
            className={styles.selectField}
          >
            {historicalDataElements.map((de) => (
              <SingleSelectOption
                key={de.id}
                label={de.displayName}
                value={de.id}
              />
            ))}
          </SingleSelectField>
        </div>

        <div style={{ flex: 1 }}>
          <InputField
            label="Period type"
            value={
              dataElementsData?.dataElements?.dataElements?.find(
                (de) => de.id === historicData
              )?.dataSetElements?.[0]?.dataSet?.periodType || ""
            }
            disabled
            className={styles.selectField}
          />
        </div>
      </div>

      <SingleSelectField
        label="Prediction high"
        selected={predictionHigh}
        onChange={({ selected }) => setPredictionHigh(selected)}
        filterable
        className={styles.selectField}
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
        label="Prediction mid high"
        selected={predictionMidHigh}
        onChange={({ selected }) => setPredictionMidHigh(selected)}
        filterable
        className={styles.selectField}
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
        filterable
        className={styles.selectField}
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
        label="Prediction mid low"
        selected={predictionMidLow}
        onChange={({ selected }) => setPredictionMidLow(selected)}
        filterable
        className={styles.selectField}
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
        filterable
        className={styles.selectField}
      >
        {dataElementsData?.dataElements?.dataElements?.map((de) => (
          <SingleSelectOption
            key={de.id}
            label={de.displayName}
            value={de.id}
          />
        ))}
      </SingleSelectField>

      {dataElementsError && (
        <div style={{ color: "red" }}>
          Data Elements Error: {dataElementsError.message}
        </div>
      )}
    </div>
  );
};

export default DataSelector;
