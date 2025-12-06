import { useDataQuery } from "@dhis2/app-runtime";
import { SingleSelectField, SingleSelectOption } from "@dhis2/ui";

const dataElementsQuery = {
  dataElements: {
    resource: "dataElements",
    params: {
      fields: "id,displayName,code",
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
  predictionLow,
  setPredictionLow,
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

    // Find the selected data element to get its code
    const selectedElement = dataElementsData?.dataElements?.dataElements?.find(
      (de) => de.id === selected
    );

    if (!selectedElement?.code) {
      // Clear prediction fields if no code available
      setPredictionHigh("");
      setPredictionMedian("");
      setPredictionLow("");
      return;
    }

    // Find data elements with codes that start with the same string
    const baseCode = selectedElement.code;
    const relatedElements =
      dataElementsData?.dataElements?.dataElements?.filter(
        (de) => de.code && de.code.startsWith(baseCode)
      );

    // Track which fields were found
    let foundHigh = false;
    let foundMedian = false;
    let foundLow = false;

    // Auto-select prediction fields based on code patterns
    relatedElements?.forEach((de) => {
      if (de.code.includes("QUANTILE_HIGH")) {
        setPredictionHigh(de.id);
        foundHigh = true;
      } else if (de.code.includes("QUANTILE_MEDIAN")) {
        setPredictionMedian(de.id);
        foundMedian = true;
      } else if (de.code.includes("QUANTILE_LOW")) {
        setPredictionLow(de.id);
        foundLow = true;
      }
    });

    // Clear fields that didn't find a match
    if (!foundHigh) {
      setPredictionHigh("");
    }
    if (!foundMedian) {
      setPredictionMedian("");
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
        !de.code?.includes("QUANTILE_LOW")
    ) || [];

  return (
    <div>
      <h3>Data Selection</h3>

      <SingleSelectField
        label="Historic data"
        selected={historicData}
        onChange={updateHistoricalData}
        filterable
      >
        {historicalDataElements.map((de) => (
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
        filterable
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
