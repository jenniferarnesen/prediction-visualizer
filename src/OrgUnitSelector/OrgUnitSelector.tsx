import React from "react";
import OrgUnitTree from "./components/OrgUnitTree";
import OrgUnitLevel from "./components/OrgUnitLevel";
import { IOrgUnitLevel } from "./interfaces/orgUnit";
import styles from "./OrgUnitSelector.module.css";

interface OrgUnitSelectorProps {
  orgUnits: any[];
  setOrgUnits: (orgUnits: any) => void;
  orgUnitLevel: IOrgUnitLevel | undefined;
  setOrgUnitLevel: (level: IOrgUnitLevel) => void;
}

const OrgUnitSelector = ({
  setOrgUnits,
  orgUnits,
  orgUnitLevel,
  setOrgUnitLevel,
}: OrgUnitSelectorProps) => {
  const onChangeOrgUnitTree = (selected: any) => {
    if (selected.checked) {
      setOrgUnits([...orgUnits, selected]);
    } else {
      setOrgUnits(orgUnits.filter((e: any) => e.path !== selected.path));
    }
  };

  return (
    <div className={styles.orgUnitContainer}>
      <div className={styles.treeWrapper}>
        <OrgUnitTree
          selectedOrgUnits={orgUnits}
          onChange={(selected: any) => {
            onChangeOrgUnitTree(selected);
          }}
        />
      </div>
      <div className={styles.levelWrapper}>
        <OrgUnitLevel orgUnitLevels={orgUnitLevel} onChange={setOrgUnitLevel} />
      </div>
    </div>
  );
};

export default OrgUnitSelector;
