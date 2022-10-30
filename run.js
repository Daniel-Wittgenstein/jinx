
;(function() {
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
      assets: getAssetsData(),
    }
  }

  function setStoryData(state) {
    codeMirror.setValue(state.story)
    codeMirrorHtml.setValue(state.html)
    setAssetsData(state.assets)
  }

  let assetsData = {
    assets: {
      "bla": {
        name: "bla",
      }
    },
  }

  function getAssetsData() {
    return assetsData
  }

  function setAssetsData(state) {
    assetsData = state
  }

  function updateAssetsView() {
    const el = document.getElementById("tab-content-assets-main")
    let out = ""
    const lst = Object.keys(assetsData.assets).sort()
    let index = -1
    for ( let key of lst ) {
      index++
      const asset = assetsData.assets[key]
      let preview = ""
      if (asset.type === "image") {
        preview = `<img class = "asset-preview-image" src="${asset.data}"/>`
      }
      out += `<div class="asset-entry">
        <input class="asset-namor"
        id = "asset-name-${asset.name}" value="${asset.name}">
        <button class="asset-deletor" data-index="${index}">delete</button>
          <span class="asset-type-text">type: ${asset.type} / ${asset.subType}</span>
          ${preview}
        </div>`
    }
    el.innerHTML = out

    let assetNamors = document.querySelectorAll('.asset-namor')
    for (let i = 0; i < assetNamors.length; i++) {
      assetNamors[i].addEventListener('change', function (ev) {
        //todo rename asset
      })
    }

    let assetDeletors = document.querySelectorAll('.asset-deletor')
    for (let i = 0; i < assetDeletors.length; i++) {
      assetDeletors[i].addEventListener('click', function (ev) {
        console.log(ev, ev.target, ev.target.dataset.index)
        const index = Number(ev.target.dataset.index)
        const lst = Object.keys(assetsData.assets).sort()
        let i = -1
        for (let key of lst) {
          i++
          if (i === index) {
            delete assetsData.assets[key]
          }
        }
        updateAssetsView()
      })
    }


  }



  let IS_FULLSCREEN = false

  function start() {

    //console.clear()

    initAddAssetsButton()

    document.getElementById("play-tools-button-fullscreen")
      .addEventListener("click", (e) => {
      if (IS_FULLSCREEN) {
        IS_FULLSCREEN = false
        document.exitFullscreen()
      } else {
        IS_FULLSCREEN = true
        document.getElementById("tab-content-play").requestFullscreen()
      }
    })
    
    document.getElementById("code-fullscreen-button")
      .addEventListener("click", (e) => {
      document.getElementById("code").requestFullscreen()
    })

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

    $("#play-tools-button-restart").on("click", injectStoryIntoIframe)


    $("#load-button").on("click", clickLoad)
    $("#save-button").on("click", clickSave)
    $("#export-button").on("click", clickExport)
    $("#about-button").on("click", clickAbout)
    initHelp()

    updateAssetsView()


    selectTab("story", 0)
    selectTab("play", 1)
    
    
            selectTab("assets", 0) //testing

    //showRunResults()
    //showPlayBox()
    ////translate()

  }


  function initAddAssetsButton() {
    $("#asset-file-input").on("change", function(e) {
      let file = e.target.files[0]
      let parts = file.type.split("/")
      let type = parts[0]
      let subtype = parts[1]
      let org_name = sanitizeAssetName( file.name.split(".")[0] )
      let name = org_name
      let nr = 1 //this way we start with number 2, so we have: cat, cat2 etc.
      while (assetsData.assets[name]) {
        nr += 1
        name = org_name + nr
      }

      var reader = new FileReader()
      reader.onload = function(){
        let data_url = reader.result
        addAsset(type, subtype, data_url, name)
        updateAssetsView()
      }
      reader.readAsDataURL(file)
    })

    $("#add-asset-button").on("click", function() {
      $('#asset-file-input').trigger("click")
    })
  }

  function addAsset(type, subType, dataUrl, name) {
    if (assetsData.assets[name]) {
      alert(`Duplicate asset name`) //should not happen, since we automatically
        //add numbers for disambiguation, but just to be sure
      return
    }
    assetsData.assets[name] = {
      data: dataUrl,
      name,
      type,
      subType,
    }
  }

  function sanitizeAssetName(v) {
    return v
      .replaceAll('"', "")
      .replaceAll("'", "")
      .replaceAll('`', "")
      .replaceAll("#", "")
      .replaceAll("/", "")
      .replaceAll(":", "")
      .trim()
  }

  function clickAbout() {
    alert(`JinxEdit version ${appMetaData.version}`)
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
/*
  function help() {
    const html = `Hi there!`
    const win = window.open("about:blank", "Jinx Documentation",
      "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=780,height=200,top="+
      (screen.height-400)+",left="+(screen.width-840))
    win.document.body.innerHTML = html
    //window.open('about:blank', "window", 'resizable=1,scrollbars=0,width=800,height=600');

  }
*/

  function translate() {
    const time = + new Date()
    const diff = time - temp.lastTranslation
    temp.lastTranslation = time 
    if (diff < settings.translateInterval * 0.75) {
      throw new Error (`Fatal. setTimeout bug? Only ${diff} ms passed between the last two translations.`)
    }
    saveSession()
    if (selectedTab.right === "debug") {
      const outputEl = $("#tab-content-debug")
      const code = codeMirror.getValue()
      const onErr = (err) => {
        console.log("ERROR FROM DEBUG TST TRANSPILATION:", err)
        outputEl.html(`Compilation failed. Note that the play tab shows
        more accurate error information.<br><br>` +
        "an error occurred: " + err.msg + " / line nr:" + err.lineNr + "<br><br>")
      }
      const onEv = (ev) => {
        console.log("EVENT FROM DEBUG TST TRANSPILATION:", ev)
      }
      let out = `Compilation succeeded. This is the result of the compilation:<br><br>`
      outputEl.html(out) //yes, before we create the story!
      const story = jinx.createNewStory(code, onErr, onEv)
      if (!story.lines) return
      const out2 = createDebugTableFromTranspiledLines(code, story.lines)
      outputEl.append(out2)
    } else {
      injectStoryIntoIframe()
    }
  }

  function createDebugTableFromTranspiledLines(code, lines) {
    function escapeHtml(html) {
      return html.replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll(' ', '<span style="background: #DDD; color: #333">&nbsp;</span>')
        
    }
    function getHtmlFromLine(line) {
      let out = "{ "
      let index = -1
      for ( let key of Object.keys(line) ) {
        index++
        const prop = line[key]
        let s
        if (utils.isString(prop)) {
          s = '"' + prop + '"'
        } else {
          s = prop
        }
        s = escapeHtml(s + "")
        let col = "black"
        if (key === "internalLineNr" ||
          key == "correspondingIf" ||
          key == "correspondingElse" ||
          key == "correspondingEnd"
        ) col = "#820"
        if (key === "lineNr") col = "blue"
        let comma = ", "
        if (index === Object.keys(line).length - 1) comma = " }"
        out += `<span style='color: ${col}'>` + escapeHtml(key) + ": " + s +  "</span>" + comma
      }
      return out
    }
    /* takes line object array, returns HTML as string */
    const orgLines = code.split("\n")
    let previousLineNr = 0
    let out = ""
    for (let line of lines) {
      if (line.lineNr && line.lineNr !== previousLineNr) {
        out += "<br>LINE <span style='color:blue'>" + line.lineNr + "</span><br>"
        let org = orgLines[line.lineNr - 1]
        out += (escapeHtml(org) || `<span style='font-style:italic; color: #777;
          '>--EMPTY LINE--</span>`) + "<br>"
      }
      out += getHtmlFromLine(line) + "<br>"
      previousLineNr = line.lineNr
    }
    return out
  }

  function injectStoryIntoIframe() {
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

  let selectedTab = {}

  window.selectTab = function(name, dir = 1) {
    let area = "left"
    if (dir === 1) area = "right"
    $(".tab-" + area).removeClass("tab-chosen")
    $("#tab-" + name).addClass("tab-chosen")
    const target = "#tab-content-" + name
    $(".tab-content-" + area).hide()
    $(target).show()
    selectedTab[area] = name 
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

  window.emitRuntimeMessage = function (message) {
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


})()

