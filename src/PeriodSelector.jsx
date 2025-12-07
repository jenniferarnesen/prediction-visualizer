import { Radio } from "@dhis2/ui";

const PeriodSelector = ({ periodType, setPeriodType }) => {
  return (
    <div>
      <div style={{ display: "flex", gap: "16px" }}>
        <Radio
          label="Weekly"
          value="weekly"
          checked={periodType === "weekly"}
          onChange={() => setPeriodType("weekly")}
        />
        <Radio
          label="Monthly"
          value="monthly"
          checked={periodType === "monthly"}
          onChange={() => setPeriodType("monthly")}
        />
      </div>
    </div>
  );
};

export default PeriodSelector;
