import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import ViewChart from "./ViewChart.jsx";
import EditChart from "./EditChart.jsx";

const DashboardPlugin = (props) => {
  props.setDashboardItemDetails &&
    props.setDashboardItemDetails({
      itemTitle: `Chart for ${props.dashboardItemId}`,
      onRemove: () =>
        console.log(`Dashboard item ${props.dashboardItemId} removed`), // TODO cant actually remove yet unitl confirm save in dashboard
    });

  if (props.dashboardMode === "view") {
    return <ViewChart {...props} />;
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
