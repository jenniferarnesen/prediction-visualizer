import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import ViewChart from "./ViewChart.jsx";

const DashboardPlugin = ({
  dashboardItemId,
  dashboardItemFilters,
  dashboardMode,
  setDashboardItemDetails,
}) => {
  
  if (dashboardMode === "view") {
    return (
      <ViewChart 
      dashboardItemId={dashboardItemId} dashboardItemFilters={dashboardItemFilters}/>
    );
  }

  if (dashboardMode === "edit") {
    return <div>Dashboard Plugin - Edit Mode (not implemented)</div>;
  }

  return <div>Dashboard Plugin - Unknown Mode</div>;
};

DashboardPlugin.propTypes = {
  dashboardItemId: PropTypes.string,
  dashboardItemFilters: PropTypes.object,
  dashboardMode: PropTypes.string,
  setDashboardItemDetails: PropTypes.func,
};

export default DashboardPlugin;
