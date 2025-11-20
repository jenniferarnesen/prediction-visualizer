import React from "react";

import styles from "./OrgUnitSelector.module.css";
import OrgUnitTree from "./components/OrgUnitTree";
import OrgUnitLevel from "./components/OrgUnitLevel";
import { IOrgUnitLevel } from "./interfaces/orgUnit";

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
  console.log("jj OrgUnitSelector orgUnits", orgUnits);
  const onChangeOrgUnitTree = (selected: any) => {
    if (selected.checked) {
      setOrgUnits([...orgUnits, selected]);
    } else {
      setOrgUnits(orgUnits.filter((e: any) => e.path !== selected.path));
    }
  };

  // checks that all selected orgUnits are on the same level
  function orgUnitsSelectedIsValid() {
    console.log;
    if (orgUnits.length === 0) {
      return true;
    }

    console.log("jj orgUnits", orgUnits, orgUnits[0]?.path);
    const firstElement = (orgUnits[0] as any).path?.split("/").length;
    console.log("firstElement:", firstElement);
    const res = orgUnits.every((innerArray) => {
      console.log("jj innerarray", innerArray);
      return (innerArray as any).path?.split("/").length === firstElement;
    });
    console.log("jj res", res);
    return res;
  }

  return (
    <>
      <OrgUnitTree
        selectedOrgUnits={orgUnits}
        onChange={(selected: any) => {
          onChangeOrgUnitTree(selected);
        }}
      />
      {!orgUnitsSelectedIsValid() && (
        <p className={styles.error}>
          Only select organization units that are one the same level.
        </p>
      )}
      <OrgUnitLevel orgUnitLevels={orgUnitLevel} onChange={setOrgUnitLevel} />
    </>
  );
};

export default OrgUnitSelector;
