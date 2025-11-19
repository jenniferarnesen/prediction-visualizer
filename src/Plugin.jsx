import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import ViewChart from "./ViewChart.jsx";
import EditChart from "./EditChart.jsx";

const DashboardPlugin = (props) => {
  
  if (props.dashboardMode === "view") {
    return (
      <ViewChart {...props}/>
    );
  }

  if (props.dashboardMode === "edit") {
    return <EditChart {...props} />;
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
