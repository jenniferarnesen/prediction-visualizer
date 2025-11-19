import { useDataQuery } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import classes from "./App.module.css";
import PluginWrapper from "./PluginWrapper.jsx";
import "./locales";

const query = {
  me: {
    resource: "me",
  },
};

const MyApp = () => {
  console.log("jj MyApp rendered");
  const { error, loading, data } = useDataQuery(query);

  if (error) {
    return <span>{i18n.t("ERROR")}</span>;
  }

  if (loading) {
    return <span>{i18n.t("Loading...")}</span>;
  }

  return (
    <div className={classes.container}>
      <h1>{i18n.t("Hello {{name}}", { name: data.me.name })}</h1>
      <Plugin
        dashboardItemId={"dashboarditem-1234"}
        dashboardItemFilters={[]}
        dashboardMode={"edit"}
        setDashboardItemDetails={Function.prototype}
      />
    </div>
  );
};

export default MyApp;
