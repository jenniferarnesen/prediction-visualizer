import { useDataQuery } from "@dhis2/app-runtime";
import { SingleSelectField, SingleSelectOption } from "@dhis2/ui";

const dataElementsQuery = {
  dataElements: {
    resource: "dataElements",
    params: {
      fields: "id,displayName",
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
  const { error: dataElementsError, data: dataElementsData } =
    useDataQuery(dataElementsQuery);

  return (
    <div>
      <h3>Data Selection</h3>

      <SingleSelectField
        label="Historic data"
        selected={historicData}
        onChange={({ selected }) => setHistoricData(selected)}
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
