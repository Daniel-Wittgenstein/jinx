
window.runTimeData = {}


function createHtmlTemplate(title, storyData) {
  const data = window.runTimeData
  let html = data.index.Contents
  html = html
    .replace("§style", data.style.Contents)
    .replace("§jinx", data.jinx.Contents + "\n\n\n" + data.utils.Contents)
    .replace("§runner", data.runner.Contents)    
    .replace("§title", title)
    .replace("§story", storyData)
  return html
}
