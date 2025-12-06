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
    console.log("jj selected historic data:", selected);
    setHistoricData(selected);

    // Find the selected data element to get its code
    const selectedElement = dataElementsData?.dataElements?.dataElements?.find(
      (de) => de.id === selected
    );

    if (!selectedElement?.code) {
      return;
    }

    // Find data elements with codes that start with the same string
    const baseCode = selectedElement.code;
    const relatedElements =
      dataElementsData?.dataElements?.dataElements?.filter(
        (de) => de.code && de.code.startsWith(baseCode)
      );

    // Auto-select prediction fields based on code patterns
    relatedElements?.forEach((de) => {
      if (de.code.includes("QUANTILE_HIGH")) {
        setPredictionHigh(de.id);
      } else if (de.code.includes("QUANTILE_MEDIAN")) {
        setPredictionMedian(de.id);
      } else if (de.code.includes("QUANTILE_LOW")) {
        setPredictionLow(de.id);
      }
    });
  };

  return (
    <div>
      <h3>Data Selection</h3>

      <SingleSelectField
        label="Historic data"
        selected={historicData}
        onChange={updateHistoricalData}
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
