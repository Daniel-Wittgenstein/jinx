

const DEBUG = {}

const appMetaData = {
  appIdentifierName: "jinx", //written into save file. note that changing this
    //will make save files from previous versions automatically incompatible.
    //(it's better never to change this)
  version: "0.0.1", //app version. compatibility is decided by the function
    //isVersionNumberCompatible
}

const settings = {
  translateInterval: 500, //can be changed. how many milliseconds
    //the app waits before translating the story. as long as the user
    //types, the story is not translated. once the user stops typing,
    //this amount of time has to pass until the story is re-translated.
}


const temp = {
  lastTranslation: 0,
}

$(window).on("load", start)

let codeMirror
let codeMirrorHtml

const localStorageKey = "BuffySummers"

function loadSession(savData) {
  let v
  try {
    v = JSON.parse(savData)
  } catch(e) {
    alert("Load session: corrupted localStorage? Could not load last session. Sorry.")
    return
  }
  codeMirror.setValue(v.story)
  codeMirrorHtml.setValue(v.html)
}

function saveSession() {
  const savData = getStoryData()
  localStorage.setItem( localStorageKey, JSON.stringify(savData) )
}

function getStoryData() {
  return {
    appName: appMetaData.appIdentifierName,
    appVersion: appMetaData.version,
    story: codeMirror.getValue(),
    html: codeMirrorHtml.getValue(),
  }
}

function setStoryData(state) {
  codeMirror.setValue(state.story)
  codeMirrorHtml.setValue(state.html)
}


function start() {

  //console.clear()

  setIframeContents("") //Apparently Firefox needs this. Otherwise it will initially
    //display a "page not found" message inside the iframe until the iframe content
    //is set for the SECOND(!) time. No idea how that actually makes sense, it does
    //not make sense to me. Source: own experimentation only.


  codeMirror = CodeMirror(document.getElementById("tab-content-story"), {
    value: "",
    mode:  "jinx",
    indentUnit: 2,
    tabSize: 2,
    lineNumbers: true,
    lineWrapping: false,
    spellcheck: false,
  })

  codeMirror.on("change", onEditorChange)
  
  codeMirrorHtml = CodeMirror(document.getElementById("tab-content-html"), {
    value: window.runTimeData.index.Contents,
    mode:  "htmlmixed",
    indentUnit: 2,
    tabSize: 2,
    lineNumbers: true,
    lineWrapping: false,
    spellcheck: false,
  })

  document.addEventListener('keydown', e => {
    if ( (e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      clickSave()
    }
    if ( (e.ctrlKey || e.metaKey) && e.key === 'o') {
      e.preventDefault()
      clickLoad()
    }
  })

  codeMirrorHtml.on("change", onEditorChange)
  
  const savData = localStorage.getItem(localStorageKey)
  if (savData) {
    loadSession(savData)
  }

  $("#load-button").on("click", clickLoad)
  $("#save-button").on("click", clickSave)
  $("#export-button").on("click", clickExport)
  $("#about-button").on("click", clickAbout)

  selectTab("story", 0)
  selectTab("play", 1)
          //selectTab("help", 1)
  //showRunResults()
  //showPlayBox()
  initHelp()
  ////translate()

}

function clickAbout() {
  alert(`JinxEdit version "${appMetaData.version}"`)
}


function clickLoad() {
  const input = document.createElement('input')
  input.type = 'file'
  input.onchange = (e) => { 
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.readAsText(file, 'UTF-8')
    reader.onload = (readerEvent) => {
      const content = readerEvent.target.result
      let data
      try {
        data = JSON.parse(content)
      } catch(e) {
        alert("Broken JSON. This does not seem to be a valid save file.")
        return
      }
      if (data.appName !== appMetaData.appIdentifierName) {
        alert(`This does not seem to be a valid save file.`)
        return
      }
      
      if ( !isVersionNumberCompatible(data.appVersion) ) {
        alert(`Incompatible save file. The save file has version "${data.appVersion}", but the app `
          + `has version "${appMetaData.version}"`)
        return
      }

      setStoryData(data)
    }
  }
  input.click()
}

function isVersionNumberCompatible(nr) {
  return nr === appMetaData.version
}


function clickSave() {
  let state = getStoryData()
  state = JSON.stringify(state)
  download (state, "application/json", "story-" + getFileDate() + ".json")
}

function clickExport() {
  let html = getEntireStoryHtmlPage("exported")
  download (html, "text/html", "story-" + getFileDate() + ".html")
}


function getFileDate() {
  function pad(num) {
    num = String(num)
    if (num.length === 1) return "0" + num
    return num
  }
  //the date format returned should be okay for file names.
  //that's why we do NOT use localized versions of dates.

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ]

  const dateObj = new Date()
  const month = dateObj.getUTCMonth()
  const nmonth = months[month]
  const day = dateObj.getUTCDate()
  const year = dateObj.getUTCFullYear()
  const h = dateObj.getHours()
  const m = dateObj.getMinutes()
  const newDate = pad(year) + "-" + pad(nmonth) + "-" + pad(day) + "---"
    + pad(h) + "-" + pad(m)
  return newDate
}


function download(content, type, fileName) {
  const blob = new Blob([content], {type: type + ";charset=utf-8"})
  saveAs(blob, fileName)
}

function help() {
  const html = `Hi there!`
  const win = window.open("about:blank", "Jinx Documentation",
    "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=780,height=200,top="+
    (screen.height-400)+",left="+(screen.width-840))
  win.document.body.innerHTML = html
  //window.open('about:blank', "window", 'resizable=1,scrollbars=0,width=800,height=600');

}

function translate() {
  const time = + new Date()
  const diff = time - temp.lastTranslation
  temp.lastTranslation = time 
  if (diff < settings.translateInterval * 0.75) {
    throw new Error (`Fatal. setTimeout bug? Only ${diff} ms passed between the last two translations.`)
  }

  saveSession()

  let html = getEntireStoryHtmlPage("editor")
  setIframeContents(html)
  return
}


function getEntireStoryHtmlPage(mode) {
  if (!mode) {
    throw new Error(`getEntireStoryHtmlPage: no mode parameter was passed.`)
  }
  let v = codeMirror.getValue()
  v = { content: v }
  v = `;window.$__RUNTIME_MODE = "${mode}";storyData = ` + JSON.stringify(v)
  const htmlContent = codeMirrorHtml.getValue()
  let html = createHtmlTemplate(htmlContent, v)
  return html
}

let editorChangeTimeout

function onEditorChange() {
  console.log("%c EDITOR CONTENT CHANGED", "background: pink; color: black;")
  if (editorChangeTimeout) clearTimeout(editorChangeTimeout)
  editorChangeTimeout = setTimeout(translate, settings.translateInterval)
}


function selectTab(name, dir = 1) {
  let area = "left"
  if (dir === 1) area = "right"
  $(".tab-" + area).removeClass("tab-chosen")
  $("#tab-" + name).addClass("tab-chosen")
  const target = "#tab-content-" + name
  $(".tab-content-" + area).hide()
  $(target).show()
}



function initHelp() {
  const text = window.HELP_CONTENTS
  $("#tab-content-help").html(text)
}



function showRunResults() {
  $("#play-iframe").hide()
  $("#run-results").show()
}

function showPlayBox() {
  $("#play-iframe").show()
  $("#run-results").hide()  
}

function setIframeContents(html) {
  $("#play-iframe")[0].srcdoc = html
  //document.getElementById('play-iframe').contentDocument.write(html)
}


function emitRuntimeMessage(message) {
  /* This should only be called from the embedded iframe
  to communicate with the editor. This should be the only
  way the iframe passes data up to the editor.
  Also, of course, if window.$__RUNTIME_MODE
  inside the iframe is "exported" instead of "editor",
  this should not ever be called. */
  
  if (message.action === "save") {
    //pressing ctrl + s / ctrl + o inside the iframe triggers the
    //editor's save/load functionality as well.
    //everything else would be confusing for the user.
    clickSave()
  }
  if (message.action === "load") {
    clickLoad()
  }
  
}