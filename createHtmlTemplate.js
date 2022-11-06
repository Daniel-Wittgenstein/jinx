
window.runTimeData = {}

function createHtmlTemplate(html, storyData, plugins, pluginsEnabled) {
  const data = window.runTimeData

  let pJs = ""
  let pCss = ""
  let i = -1
  for (let plugin of plugins) {
    i++
    if (!pluginsEnabled[i]) continue
    if (plugin.implementation) {
      if (plugin.implementation.js) {
        pJs += `;` + plugin.implementation.js + ";"
      }
      if (plugin.implementation.css) {
        pCss += plugin.implementation.css + "\n\n"
      }
    }
  }

  html = html
    .replace("§style", data.style.Contents)
    .replace("§pluginCss", pCss)
    .replace("§jinx", data.jinx.Contents + "\n;\n\n" + data.utils.Contents)
    .replace("§story", ";" + storyData)
    .replace("§runner", ";" + data.runner.Contents)
    .replace("§pluginJs", ";" + pJs)


  return html
}
