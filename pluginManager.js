

window.$_PLUGIN = (function() {

  let plugins = []

  function add(plugin) {
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
  }
})()