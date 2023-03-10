    
;(function() {
  const DEBUG = {
    showDebugTab: false,
  }

  const appMetaData = {
    appIdentifierName: "jinx", //written into save file. note that changing this
      //will make save files from previous versions automatically incompatible.
      //(it's better never to change this)
    version: "0.1", //app version. compatibility is decided by the function
      //isVersionNumberCompatible
      //compatibility for plugins is decided by the function
      //isPluginCompatible.
      //version should ALWAYS be in the format: a number, a dot, another number
      //first number is main version, second number is sub-version
  }

  const settings = {
    translateInterval: 500, //can be changed. how many milliseconds
      //the app waits before translating the story. as long as the user
      //types, the story is not translated. once the user stops typing,
      //this amount of time has to pass until the story is re-translated.
  }

  let pluginsEnabled = {}

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
      alerta("Load session: corrupted localStorage? Could not load last session. Sorry.")
      return
    }
    //codeMirror.setValue(v.story)
    //codeMirrorHtml.setValue(v.html)
    console.log("retrieved story data", JSON.parse(savData))
    setStoryData(v) 
  }

  function saveSession() {
    const savData = getStoryData()
    localStorage.setItem( localStorageKey, JSON.stringify(savData) )
  }

  function resetPluginsData() {
    $_PLUGIN.resetState()
  }

  function getPluginsData() {
    const tplugins = $_PLUGIN.getAll().filter(p => !p.builtIn)
    return {
      pluginsEnabled,
      plugins: tplugins,
    }
  }

  function setPluginsData(state) {
    if (!state) return
    pluginsEnabled = state.pluginsEnabled
    for (let plugin of state.plugins) {
      $_PLUGIN.add(plugin)
    }
  }

  function getStoryData() {
    return {
      appName: appMetaData.appIdentifierName,
      appVersion: appMetaData.version,
      story: codeMirror.getValue(),
      html: codeMirrorHtml.getValue(),
      assets: getAssetsData(),
      plugins: getPluginsData(),
      meta: getProjectMetaData(),
      appStorySaveState: true,
    }
  }

  function setStoryData(state) {
    codeMirror.setValue(state.story)
    codeMirrorHtml.setValue(state.html)
    setAssetsData(state.assets)
    setPluginsData(state.plugins)
    setProjectMetaData(state.meta)
    updateAssetsView()
    updatePluginView()
    updateMetaView()
  }

  let assetsData

  function resetAssetsData() {
    assetsData = {
      assets: {},
    }
  }

  function getAssetsData() {
    return assetsData
  }

  function setAssetsData(state) {
    assetsData = state
  }

  let lastPluginViewScrollPosition = 0

  window.viewPluginInPopup = (index) => {
    const plugin = $_PLUGIN.getAll()[index]
    const el = document.getElementById("tab-content-plugins")
    const out = `<button onclick="window.closePluginPopup()">back</button></p>`
    el.innerHTML = out + getPluginLongView(plugin)
    //scroll up
    lastPluginViewScrollPosition = el.scrollTop
    el.scrollTop = 0
  }

  window.closePluginPopup = () => {
    updatePluginView()
    //scroll up
    const el = document.getElementById("tab-content-plugins")
    el.scrollTop = lastPluginViewScrollPosition
  }

  function getPluginLongView(plugin) {
    function proc(str) {
      let nu = ""
      for (let char of str) {
        if (char.toUpperCase() === char) {
          nu += " "
        }
        nu += char
      }
      return nu.substr(0,1).toUpperCase() + nu.substr(1).toLowerCase()
    }
    let out = ""

    if (plugin.links) {
      for (let link of plugin.links) {
        out += `<p><a href="${link.target}" target="_blank">${link.text}</a></p>`
      }
    }

    const order = {
      name: 1,
      author: 2,
      documentation: 3,
      copyrightInfo: 4,
      license: 5,
      version: 6,
      shortInfo: 7,
      disclaimer: 8,
      bundledBy: 9,
    }
    const os = Object.keys(plugin).sort( (a, b) => {
      let orderA = order[a] || 2000
      let orderB = order[b] || 2000
      return orderA - orderB
    })
    for ( let key of os ) {

      if (key === "logo") continue
      const value = plugin[key]
      if ( utils.isString(value) ) {
        if (key === "documentation") {
          out += `<div class="plugin-documentation-box">${value}</div>`
        } else {
          out += `<p><b>${proc(key)}:</b> ${value}</p>`
        }
      }
    }

    if (plugin.implementation.js) {
      out += `JS:<br><textarea readonly spellcheck="false"
        class="plugin-code-view">${plugin.implementation.js}</textarea>`
    }

    if (plugin.implementation.css) {
      out += `<br>CSS:<br><textarea readonly spellcheck="false"
        class="plugin-code-view">${plugin.implementation.css}</textarea>`
    }
    
    return `<div class="plugin-long-view">${out}</div>`
  }

  window.clickPluginCheckbox = (pluginId) => {
    pluginsEnabled[pluginId] = !pluginsEnabled[pluginId]
    saveSession()
    translate({noTimeCheck: true})
  }

  window.deletePlugin = (i) => {
    const yesDoIt = () => {
      $_PLUGIN.deletePlugin(i)
      updatePluginView()
      saveSession()
    }
    confirma(`Do you really want to delete this plugin? ` +
      `(After deletion, the plugin cannot be restored without the original plugin file.)`,
      "Yes, delete the plugin!", yesDoIt,
      "Cancel", () => {},
      )
  }

  window.loadPlugin = (i) => {
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
          alerta("Broken JSON. This does not seem to be a valid plugin file.")
          return
        }
        if (data.appName !== appMetaData.appIdentifierName) {
          alerta(`This does not seem to be a valid plugin file. ` +
          `I was expecting the "appName" property to have ` +
          `the value "${appMetaData.appIdentifierName}". `)
          return
        }
        
        if (!data.isPlugin) {
          alerta(`This does not seem to be a valid plugin file. ` +
            `I was expecting the "isPlugin" property to be true.`)
          return
        }

        if ( !utils.isArray(data.links) ) {
          alerta(`This does not seem to be a valid plugin file. ` +
            `I was expecting the "links" property to be an array.`)
          return
        }

        const mandatory = ["id", "name", "author", "licenseShort",
        "licenseText", "version", "copyrightInfo", "shortInfo", "documentation"]

        for (let prop of mandatory) {
          if (! utils.isString(data[prop]) || data[prop] === "" ) {
            alerta(`This does not seem to be a valid plugin file. ` +
              `The property "${prop}" should be a non-empty string.`)
            return
          }
        }

        for ( let plugin of $_PLUGIN.getAll() ) {
          if (plugin.id === data.id) {
            alerta(`A plugin with id "${data.id}" has already been loaded.`)
            return
          }
        }

        if ( !isPluginCompatible(data) ) {
          alerta(`Incompatible plugin file. This plugin is not compatible with app `
            + `version "${appMetaData.version}"`)
          return
        }

        addNewPlugin(data)
      }
    }
    input.click()
  }

  function addNewPlugin(plugin) {
    window.$_PLUGIN.add(plugin)
    updatePluginView()
    saveSession()
  }

  function updatePluginView() {
    const el = document.getElementById("tab-content-plugins")
    let out = `<button onclick="loadPlugin()">Load plugin</button>
    <div style="width: 100%; height: 1px; background: #ccc; margin-top: 12px"></div>`
    const plugins = $_PLUGIN.getAll()
    let i = -1
    const sortedPlugins = plugins.sort( (a, b) => {
      if (a.name > b.name) return 1
      if (a.name < b.name) return -1
      return 0
    })
    for (let plugin of sortedPlugins) {
      let size = "?"
      if (plugin.implementation.js) {
        size = getApproximateByteSize(plugin.implementation.js)
      }
      i++
      let logoImg = ""
      if (plugin.logo) {
        logoImg = plugin.logo.replace("<svg ", `<svg class="plugin-logo"`)
      } else {
        logoImg = `<span class="plugin-logo-letter">${plugin.name[0]}</span>`
      }
      let checki = ""
      if (pluginsEnabled[plugin.id]) checki = "checked"
      const deleteButton = !plugin.builtIn ?
        `<button onclick='window.deletePlugin(${i})'>delete</button>` : ""
      const logoholderId = (Math.random() + "-" + Math.random()).replace(".", "")
      out += `
        <div class="plugin-view-entry">
          <p>
            ${logoImg} <b>${plugin.name}</b> by ${plugin.author}
          </p>
          <p>
            <span class = "plugin-short-info">${plugin.shortInfo}</span>
            <span class = "plugin-version-info">version: ${plugin.version} / size: ${size}</span>
            <br><br>
          enabled: <input type="checkbox"
            onchange="window.clickPluginCheckbox('${plugin.id}')" ${checki}>
          <button onclick="window.viewPluginInPopup(${i})" style="margin-left: 16px;">view</button>
          ${deleteButton}
          </p>
        </div>
        `
    }
    el.innerHTML = out
  }


  function updateAssetsView() {
    const el = document.getElementById("tab-content-assets-main")
    let out = ""
    const lst = Object.keys(assetsData.assets).sort()
    let index = -1
    const indexToAssetList = []
    for ( let key of lst ) {
      index++
      const asset = assetsData.assets[key]
      indexToAssetList[index] = assetsData.assets[key]
      let preview = ""
      if (asset.type === "image") {
        preview = `<img class = "asset-preview-image" src="${asset.data}"/>`
      }
      out += `<div class="asset-entry">
        <input class="asset-namor"
        value="${asset.name}">
        <button class="asset-deletor" data-index="${index}">delete</button>
          <span class="asset-type-text">type: ${asset.type} / ${asset.subType}</span>
          ${preview}
          <span class="asset-size-text">${asset.size}</span>
        </div>`
    }
    el.innerHTML = out

    let assetNamors = document.querySelectorAll('.asset-namor')
    for (let i = 0; i < assetNamors.length; i++) {
      assetNamors[i].addEventListener('change', function (ev) {
        let nuName = ev.target.value
        nuName = nuName.trim()
        assetNamors[i].value = nuName
        const index = i
        const lst = Object.keys(assetsData.assets).sort() //sort is important
        let j = -1

        if ( !isLegalAssetName(nuName) ) {
          alerta(`Asset name contains illegal character.`)
          return
        }

        if (assetsData.assets[nuName]) {
          assetNamors[i].value = indexToAssetList[i].name
          if (assetsData.assets[nuName] === indexToAssetList[i]) {
            //name was not changed at all, but change event
            //was still triggered (this can happen because
            //the user can actually change the text in the input,
            //but the trim preprocessing strips spaces, so we end
            //up with the same string):
            //do absolutely nothing, except returning
            return
          }
          alerta(`Could not rename this asset. ` + 
            `Another asset named "${nuName}" exists already.`)
          return
        }
        const assetObj = indexToAssetList[i]
        for (let key of lst) {
          j++
          if (j === index) {
            //console.log( assetsData.assets[key] )
            delete assetsData.assets[key]
          }
        }
        assetObj.name = nuName
        assetsData.assets[nuName] = assetObj
        saveSession()
        updateAssetsView()
      })
    }

    let assetDeletors = document.querySelectorAll('.asset-deletor')
    for (let i = 0; i < assetDeletors.length; i++) {
      assetDeletors[i].addEventListener('click', function (ev) {
        console.log(ev, ev.target, ev.target.dataset.index)
        const index = Number(ev.target.dataset.index)
        const lst = Object.keys(assetsData.assets).sort() //sort is important
        let j = -1
        for (let key of lst) {
          j++
          if (j === index) {
            delete assetsData.assets[key]
          }
        }
        saveSession()
        updateAssetsView()
      })
    }


  }


  function isLegalAssetName(name) {
    return !(
      name.includes("'") ||
      name.includes('"')
    )
  }

  function initExampleSelector() {
    const el = document.getElementById("example-selector")
    let out = ""
    out += `<option value="$none">-</option>`
    for ( let example of $_EXAMPLE.getAllExamples() ) {
      out += `<option value="${example.id}">${example.name}</option>`
    }
    el.innerHTML = `Open Example:&nbsp;
      <select id="example-selector-selector">
        ${out}
      </select>
    `
    $("#example-selector-selector").on("change", function (ev) {
      const target = this.value
      if (target === "$none") return
      let theExample = false
      for ( let example of $_EXAMPLE.getAllExamples() ) {
        if (target === example.id) {
          theExample = example
          break
        }
      }
      if (!theExample) throw new Error(`Error: example??`)
      loadExample(theExample)
    })
  }

  function loadExample(example) {
    const openProjYes = () => {
      let data = example.data
      data = JSON.parse( JSON.stringify(data) )
      setStoryData(data)
      saveSession()
    }
    $("#example-selector-selector").val("$none")
    confirma(`Opening an example project will delete all current changes. ` +
      `It's recommended to download a save file first. Do you really want to open `+
      `the example project now?`,
      "Yes, open it anyway!", openProjYes,
      "Cancel", () => {}
    )
  }



  function appIsFullScreen() {
    return document.fullscreenElement !== null
  }


  function start() {

    if (DEBUG.showDebugTab) {
      $("#tab-debug").show()
    }

    //console.clear()

    initExampleSelector()

    initAddAssetsButton()

    document.getElementById("play-tools-button-fullscreen")
        .addEventListener("click", (e) => {
      if ( appIsFullScreen() ) {
        document.exitFullscreen()
      } else {
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
      value: "",
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
  
    createNewProject()

    codeMirrorHtml.setValue(window.runTimeData.index.Contents)

    const savData = localStorage.getItem(localStorageKey)
    if (savData) {
      loadSession(savData)
      console.log(pluginsEnabled)
    }

    $("#play-tools-button-restart").on("click", injectStoryIntoIframe)


    $("#new-button").on("click", clickNew)
    $("#load-button").on("click", clickLoad)
    $("#save-button").on("click", clickSave)
    $("#export-button").on("click", clickExport)
    $("#about-button").on("click", clickAbout)
    initHelp()

    updateAssetsView()
    updatePluginView()
    updateMetaView()

    selectTab("story", 0)
    selectTab("play", 1)
    
    
            //selectTab("assets", 0) //testing
            selectTab("plugins", 0) //testing
            //selectTab("meta", 0) //testing

    //showRunResults()
    //showPlayBox()
    ////translate()

  }

  function clickNew() {
    function yesDoIt() {
      createNewProject()
      updateAssetsView()
      updatePluginView()
      updateMetaView()
      saveSession()
    }
    confirma(`Do you really want to create a new project?` +
      `THIS WILL ERASE THE CURRENT PROJECT. Save a copy of the current project to your device before you do this.`,
      "Yes, create a new project", yesDoIt,
      "Cancel", () => {},
    )
  }

  function createNewProject() {
    resetAssetsData()
    resetProjectMetaData()
    codeMirror.setValue("")
    codeMirrorHtml.setValue("")
  }

  let projectMetaData
  
  function resetProjectMetaData() {
    projectMetaData = {
      userSetValues: [],
      ifid: generateRandomUUID(),
    }
    let i = -1
    for (let item of storyMetaTemplate) {
      i++
      projectMetaData.userSetValues[i] = item.default || ""
    }
  }

  function setProjectMetaData(data) {
    projectMetaData = data
  }

  function getProjectMetaData() {
    return projectMetaData
  }



  const storyMetaTemplate = [
    {
      label: "author(s)",
      target: `<meta name="author" content="$content">`,
    },
    {
      label: "title",
      info: "Your work's title.",
      default: "an unnamed project",
      target: `<meta name="title" content="$content">\n    <meta property="og:title" content="$content">`,
    },
    {
      label: "subtitle",
      infos: `Your work's subtitle. Leave empty if there is no subtitle.`,
      target: `<meta name="subtitle" content="$content">`,
    },
    {
      label: "browser title",
      info: "The page title that will be displayed in the browser window.",
      target: `<title>$content</title>`,
    },
    {
      label: "date published",
      info: "Use the format Day/Month/Year.",
      target: `<meta name="date published" content="$content">`,
    },
    {
      label: "genre(s)",
      info: "(comma-separated)",
      target: `<meta name="genres" content="$content">`,
    },
    {
      label: "for adult audiences only",
      info: `(yes / no / unspecified)`,
      target: `<meta name="adult" content="$content">`,
      default: "unspecified",
      validator: (n) => {
        n = n.trim().toLowerCase()
        if (n === "yes" || n === "no" || n === "unspecified") {
          return {ok: true, content: n}
        }
        return {ok: false, message: "Value should be yes, no or unspecified."}
      }
    },
    {
      label: "trigger warnings",
      info: `(comma-separated)`,
      target: `<meta name="trigger warnings" content="$content">`,
    },
    {
      label: "copyright / license information",
      target: `<meta name="copyright" content="$content">`,
    },
    {
      label: "language",
      target: `<meta name="language" content="$content">`,
      default: "English",
    },
    {
      label: "version",
      target: `<meta name="version" content="$content">`,
    },
    {
      label: 'short description',
      info: `Max. 1600 characters.`,
      target: `<meta name="description" content="$content">`,
      validator: (n) => {
        if (n.length > 1600) return {
          ok: false,
          message: "Text is too long."
        }
        return {
          ok: true,
          content: n,
        }
      }
    },

  ] 

  function generateRandomUUID() {
    return crypto.randomUUID()
  }

  function getHtmlMetaData() {
    function escapeHtml(n) {
      //escaping quotes and apostrophes is important
      //here, because the content could go into attribute.
      //escaping < > and & is important because of title tag content.
      return n
        .replaceAll("&", "&amp;") //must be first replacement!
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;")
        .replaceAll("\n", " ")
    }
    let index = -1
    const metaData = []
    for (const template of storyMetaTemplate) {
      index++
      let val = projectMetaData.userSetValues[index]
      if (!val && val !== 0) val = ""
      let target = template.target
      val = escapeHtml(val)
      target = target.replaceAll("$content", val)
      metaData.push(target)
    }
    let out = "\n"
    for (let item of metaData) {
      out += "    " + item + "\n"
    }
    out += `\n    <meta name="creator" content="${appMetaData.appIdentifierName + " " + appMetaData.version}">`
    out += `\n    <meta property="ifiction:ifid" content="${projectMetaData.ifid}">`
    return out
  }


  function updateMetaView() {
    const el = $("#tab-content-meta")
    let out = ""
    let i = -1
    let inputDomIdsToContent = []
    for (let item of storyMetaTemplate) {
      i++
      const theContent = projectMetaData.userSetValues[i]
      const id = "input-" + ( + new Date() ) + "-" + (Math.random() + "").replace(".", "")
      inputDomIdsToContent.push({id, content: theContent})
      out += `
        <div class="story-meta-item">
          <div>
            ${item.label}:
            <input type="text" id="${id}" spellcheck="false" value = "" />
          </div>
          <div class="story-meta-info-text">
            ${item.info || ''}
          </div>
        </div>
      `
      let xx = i
      $(document).on("change", "#" + id, () => {
        const el = $("#" + id)
        let n = el.val()
        if (item.validator) {
          const result = item.validator(n)
          if (result.ok) {
            n = result.content
          } else {
            alerta(result.message)
          }
        }
        projectMetaData.userSetValues[xx] = n
        saveSession()
      })
    }
    el.html(out)
    for (let item of inputDomIdsToContent) {
      $("#" + item.id).val(item.content)
    }
    const ifidLabel = $(`<p>IFID: ${projectMetaData.ifid}</p>`)
    const ifidButton = $(`<button>Generate a new IFID</button>`)
    el.append(ifidLabel)
    el.append("&nbsp;")
    el.append(ifidButton)
    const yesDoIt = () => {
      projectMetaData.ifid = generateRandomUUID()
      updateMetaView()
      saveSession()
    }
    ifidButton.on("click", () => {
      confirma(`This action is usually only necessary if you have developed an initial project ` +
      `into two distinct projects and want to publish them separately now. If that 
      is not the case, you probably do not need to perform this action.`,
      "Yes, get a new IFID now!", yesDoIt,
      "Cancel", () => {},
      )
    })
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
      reader.onload = function() {
        let dataUrl = reader.result
        addAsset(type, subtype, dataUrl, name)
        saveSession()
        updateAssetsView()
      }
      reader.readAsDataURL(file)
    })

    $("#add-asset-button").on("click", function() {
      $('#asset-file-input').trigger("click")
    })
  }


  function roundToDigits(n, digits = 1) {
    const factor = Math.pow(10, digits)
    return Math.round(n * factor) / factor
  }


	function getApproximateByteSize(json) {
    function lengthInUtf8Bytes(s) {
      const len = encodeURIComponent(s).match(/%[89ABab]/g)
      return s.length + (len ? len.length : 0)
    }
		const size = lengthInUtf8Bytes(json)
		let str = roundToDigits(size / 1024 / 1024, 1) + " MB"
		if (size < 1024 * 1024) str = Math.round(size / 1024) +" KB"
		if (size < 1024) str = "< 1 KB"
    return str
  }

  
  function addAsset(type, subType, dataUrl, name) {
    if (assetsData.assets[name]) {
      alerta(`Duplicate asset name`) //should not happen, since we automatically
        //add numbers for disambiguation, but just to be sure
      return
    }

    const size = getApproximateByteSize(dataUrl) //bigger than
      //actual asset because of base64 inflation, probably

    assetsData.assets[name] = {
      data: dataUrl,
      name,
      type,
      subType,
      size,
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
    const txt = `JinxEdit version ${appMetaData.version}`
    Swal.fire({
      text: txt,
      confirmButtonColor: '#3085d6',
      showClass: {
        popup: 'alert-anim'
      },
      hideClass: {
        popup: ''
      },
      imageUrl: 'assets/logo.png',
      imageWidth: 240,
      imageHeight: 240,
    })
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
          alerta("Broken JSON. This does not seem to be a valid save file.")
          return
        }

        if (data.appName !== appMetaData.appIdentifierName) {
          alerta(`This does not seem to be a valid save file.`)
          return
        }
        
        if (!data.appStorySaveState) {
          alerta(`This does not seem to be a valid save file.`)
        }

        if ( !isVersionNumberCompatible(data.appVersion) ) {
          alerta(`Incompatible save file. The save file has version "${data.appVersion}", but the app `
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

  function isPluginCompatible(plugin) {
    if (!plugin.compatiblewithVersions) return false
    for (let item of plugin.compatiblewithVersions) {
      if (item === appMetaData.version) {
        return true
      }
    }
    return false
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

  function translate(options = {}) {
    const time = + new Date()
    const diff = time - temp.lastTranslation
    temp.lastTranslation = time 
    if (!options.noTimeCheck && diff < settings.translateInterval * 0.75) {
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
    //this is the storyData injected into the html page:
    v = {
      content: v,
      assetsData: assetsData,
    }
    v = `;window.$__RUNTIME_MODE = "${mode}";storyData = ` + JSON.stringify(v)
    const htmlContent = codeMirrorHtml.getValue()
    const plugins = window.$_PLUGIN.getAll()
    let html = createHtmlTemplate(htmlContent, v, plugins, pluginsEnabled, getHtmlMetaData() )
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

  function alerta(txt) {
    Swal.fire({
      text: txt,
      confirmButtonColor: '#3085d6',
      showClass: {
        popup: 'alert-anim'
      },
      hideClass: {
        popup: ''
      },
    })
  }

  function confirma(txt, confirmButtonText, confirmFunc,
      cancelButtonText, cancelFunc) {
    Swal.fire({
      showClass: {
        popup: 'alert-anim'
      },
      hideClass: {
        popup: ''
      },
      text: txt,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
    }).then((result) => {
      if (result.isConfirmed) {
        confirmFunc()
      } else {
        cancelFunc()
      }
    })
  }


})()

