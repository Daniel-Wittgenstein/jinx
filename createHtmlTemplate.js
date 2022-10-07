
window.runTimeData = {}

function createHtmlTemplate(html, storyData) {
  const data = window.runTimeData
  html = html
    .replace("§style", data.style.Contents)
    .replace("§jinx", data.jinx.Contents + "\n;\n\n" + data.utils.Contents)
    .replace("§runner", ";" + data.runner.Contents)
    .replace("§story", ";" + storyData)
  return html
}
