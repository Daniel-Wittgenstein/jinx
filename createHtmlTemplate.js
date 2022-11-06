
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
        if (plugin.licenseTextMustBeIncludedInFinalGame) {
          pJs += `\n; /* ${plugin.name} by ${plugin.author}` + 
            `\n${plugin.licenseText} */ ;\n`
        }
        let jsList = plugin.implementation.js
        if ( utils.isString(jsList) ) {
          jsList = [jsList]
        }
        for (let item of jsList) {
          pJs += `;` + item + ";"
        }
      }



      if (plugin.implementation.css) {
        if (plugin.licenseTextMustBeIncludedInFinalGame) {
          pCss += `\n/* ${plugin.name} by ${plugin.author}\n` +
            `${plugin.licenseText} */\n`
        }
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
