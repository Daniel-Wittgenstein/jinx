

const DEBUG = {}

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
  codeMirror.setValue(v.editorContent)
}

function saveSession() {
  const savData = {
    editorContent: codeMirror.getValue(),
  }
  localStorage.setItem( localStorageKey, JSON.stringify(savData) )
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

  codeMirrorHtml.on("change", onEditorChange)
  
  const savData = localStorage.getItem(localStorageKey)
  if (savData) {
    loadSession(savData)
  }

  selectTab("html", 0)
  selectTab("play", 1)
  //selectTab("help", 1)
  //showRunResults()
  //showPlayBox()
  initHelp()
  ////translate()

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

  console.log("TRANSLATING")

  saveSession()
  let v = codeMirror.getValue()
  v = {
    content: v,
  }
  v = "storyData = " + JSON.stringify(v)

  const htmlContent = codeMirrorHtml.getValue()
  html = createHtmlTemplate(htmlContent, v)
  setIframeContents(html)
  return
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
  const text = `Welcome to help!`.repeat(2000)
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


