

const DEBUG = {}

$(window).on("load", start)

let codeMirror

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


  codeMirror = CodeMirror(document.getElementById("code"), {
    value: "",
    mode:  "jinx",
    indentUnit: 2,
    tabSize: 2,
    lineNumbers: true,
    lineWrapping: false,
    spellcheck: false,
  })

  codeMirror.on("change", onEditorChange)
  

  const savData = localStorage.getItem(localStorageKey)
  if (savData) {
    loadSession(savData)
  }

  selectTab("play")
  //selectTab("help")
  //showRunResults()
  //showPlayBox()
  initHelp()
  translate()

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
  saveSession()
  let v = codeMirror.getValue()
  v = {
    content: v,
  }
  v = "storyData = " + JSON.stringify(v)
  html = createHtmlTemplate("untitled story", v)
  setIframeContents(html)
  return
}

let editorChangeTimeout

function onEditorChange() {
  if (editorChangeTimeout) clearTimeout(editorChangeTimeout)
  editorChangeTimeout = setTimeout(translate, 500)
}



function selectTab(name) {
  $(".tab").removeClass("tab-chosen")
  $("#tab-" + name).addClass("tab-chosen")
  const target = "#tab-content-" + name
  $(".tab-content").hide()
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


