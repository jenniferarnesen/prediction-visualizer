/** @type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    type: 'app',
    name: 'prediction-visualizer',

    pluginType: 'DASHBOARD',

    entryPoints: {
        app: './src/App.jsx',
        plugin: './src/PluginWrapper.jsx',
    },

    direction: 'auto',
}

module.exports = config
