$_PLUGIN.add({
  implementation: {
    js: `
;(function() {
  const pluginName = "plugin simpleInterface"
  const domPrefix = "X-simple-interface-plugin-"

  jin.createEffect("loadApp", initStuff, 20)

  function initStuff() {
    if (jin.simpleInterface) {
      jin.error(\`Namespace clash: plugin jin.simpleInterface exists already?\`)
      return
    }
    const el = document.getElementById("app")
    if (!el) {
      jin.error(\`\${pluginName}: the plugin cannot work without a div with id "app"\`)
      return
    }
    const bar = document.createElement('div')
    bar.style = \`margin-bottom: 20px;\`
    bar.innerHTML = \`
      <button id="\${domPrefix}load">load</button>
      <button id="\${domPrefix}save">save</button>
      <button id="\${domPrefix}erase">erase</button>
    \`
    el.prepend(bar)
    const loadEl = document.getElementById(\`\${domPrefix}load\`)
    loadEl.addEventListener("click", clickLoad)
    const saveEl = document.getElementById(\`\${domPrefix}save\`)
    saveEl.addEventListener("click", clickSave)
    const eraseEl = document.getElementById(\`\${domPrefix}erase\`)
    eraseEl.addEventListener("click", clickErase)
  }
  

  function clickLoad() {
    const state = localStorage.getItem("basicSaveState")
    if (!state) {
      alert("Nothing to load.")
      return
    }
    const stateParsed = JSON.parse(state)
    jin.setState(stateParsed)    
  }

  function clickSave() {
    const state = jin.getState()
    const stateJson = JSON.stringify(state)
    localStorage.setItem("basicSaveState", stateJson)
  }

  function clickErase() {
    localStorage.setItem("basicSaveState", "")
  }


})();
    `
  },
  isPlugin: true,
  appName: "jinx",
  compatiblewithVersions: ["0.1"],
  name: `Simple Interface Demo`,
  id: "simpleInterfaceDemo",
  author: `Jinx Core Team`,
  copyrightInfo: `(c) 2022 Jinx Core Team`,
  version: `0.0.1`,
  licenseShort: `Public Domain`,
  links: [],
  licenseText: `
    I release this into the public domain.
  `,
  shortInfo: `Simple Interface Demo plugin.`,
  documentation: `
  <p>
    This is a just a demo plugin. It shows how a plugin
    can use the jin effect system and jin.getState / jin.setState
    to implement basic load/save functionality.
  </p>
  `,
  //only built-in extensions can set these:
  builtIn: true,
  enabledByDefault: false,
  //********* optional properties:
  logo: `D`,
  licenseTextMustBeIncludedInFinalGame: false,
  //********* custom properties (no special meaning;
  //    they are just displayed in the "view plugin" view):
})