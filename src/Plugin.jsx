import React from 'react'
import PropTypes from 'prop-types'

const DashboardPlugin = ({
    dashboardItemId,
    dashboardItemFilters,
    dashboardMode,
    setDashboardItemDetails,
}) => {
    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h2>Dashboard Plugin Props</h2>
            <div>
                <h3>dashboardItemId:</h3>
                <pre>{JSON.stringify(dashboardItemId, null, 2)}</pre>
            </div>
            <div>
                <h3>dashboardItemFilters:</h3>
                <pre>{JSON.stringify(dashboardItemFilters, null, 2)}</pre>
            </div>
            <div>
                <h3>dashboardMode:</h3>
                <pre>{JSON.stringify(dashboardMode, null, 2)}</pre>
            </div>
            <div>
                <h3>setDashboardItemDetails:</h3>
                <pre>{typeof setDashboardItemDetails}</pre>
            </div>
        </div>
    )
}

DashboardPlugin.propTypes = {
    dashboardItemId: PropTypes.string,
    dashboardItemFilters: PropTypes.object,
    dashboardMode: PropTypes.string,
    setDashboardItemDetails: PropTypes.func,
}

export default DashboardPlugin