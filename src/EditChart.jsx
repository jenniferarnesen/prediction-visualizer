import { useDataMutation, useDataQuery } from '@dhis2/app-runtime'

const query = {
    dashboardItems: {
        resource: 'dataStore/PREDICTION_VISUALIZER_PLUGIN/dashboardItems',
    },
}

const mutation = {
    resource: 'dataStore/PREDICTION_VISUALIZER_PLUGIN/dashboardItems',
    type: 'update',
    data: ({ data }) => data,
}

const EditChart = (props) => {
    const { loading: fetchLoading, error: fetchError, data: fetchData, refetch } = useDataQuery(query)
    const [mutate, { loading: saveLoading, error: saveError }] = useDataMutation(mutation)

    const saveConfigToDataStore = async () => {
        
        // Get existing dashboard items from dataStore
        const existingDashboardItems = fetchData?.dashboardItems || {}
        
        // Merge with new item
        const dashboardItems = {
            ...existingDashboardItems,
            [props.dashboardItemId]: props
        }
        
        try {
            await mutate({ data: dashboardItems })
            console.log('Saved successfully')
            refetch()
        } catch (err) {
            console.error('Error saving to dataStore:', err)
        }
    }

    return (
        <div>
            <h2>EditChart Component</h2>
            <button onClick={saveConfigToDataStore} disabled={saveLoading || fetchLoading}>
                {saveLoading ? 'Saving...' : 'Save to DataStore'}
            </button>
            {fetchError && <div style={{ color: 'red' }}>Fetch Error: {fetchError.message}</div>}
            {saveError && <div style={{ color: 'red' }}>Save Error: {saveError.message}</div>}
            <pre>{JSON.stringify(props, null, 2)}</pre>
        </div>
    )
}

export default EditChart
