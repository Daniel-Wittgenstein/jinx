

window.$_PLUGIN = (function() {

  let plugins
  resetState()

  function resetState() {
    plugins = []
  }

  function add(plugin) {
    const newPluginId = plugin.id
    for (let plugin of plugins) {
      if (plugin.id === newPluginId) {
        return //has already been added
      }
    }
    plugins.push(plugin)
  }

  function getAll() {
    return plugins
  }

  function deletePlugin(index) {
    plugins = plugins.filter( (n, i) => index !== i )
  }

  return {
    add,
    getAll,
    deletePlugin,
    resetState,
  }
})()