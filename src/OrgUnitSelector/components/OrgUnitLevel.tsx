import i18n from "@dhis2/d2-i18n";
import { SingleSelectField, SingleSelectOption } from "@dhis2/ui";
import useOrgUnitLevels from "../../hooks/useOrgUnitLevels";
import React from "react";
import styles from "./OrgUnitLevel.module.css";
import { IOrgUnitLevel } from "../interfaces/orgUnit";

interface OrgUnitLevelProps {
  orgUnitLevels: IOrgUnitLevel | undefined;
  onChange: (selected_level: IOrgUnitLevel) => void;
}

const OrgUnitLevel = ({ orgUnitLevels, onChange }: OrgUnitLevelProps) => {
  console.log("jj OrgUnitLevel orgUnitLevels", orgUnitLevels);
  const { levels, loading, error } = useOrgUnitLevels();

  const onChangeLevel = (e: any) => {
    const newSelected = {
      id: e.selected,
      level: (levels.find((l: any) => l.id === e.selected) as any).level,
    };
    onChange(newSelected);
  };

  console.log("jj OUlevel setSelected to", orgUnitLevels?.id);
  return levels ? (
    <div className={styles.selectField}>
      <SingleSelectField
        label={i18n.t("Organisation unit level")}
        helpText={i18n.t("Organisation unit level to import data to")}
        tabIndex="1"
        selected={orgUnitLevels?.id}
        loading={loading}
        error={!!error}
        onChange={onChangeLevel}
      >
        {levels.map((l: any) => (
          <SingleSelectOption key={l.id} value={l.id} label={l.name} />
        ))}
      </SingleSelectField>
    </div>
  ) : null;
};

export default OrgUnitLevel;
