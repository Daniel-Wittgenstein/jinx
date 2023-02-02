;(function() {

  const pluginName = "plugin simpleInterface"
  const domPrefix = "X-simple-interface-plugin-"

  jin.createEffect("loadApp", initStuff, 20)

  const undoStates = []

  function initStuff() {

    if (jin.simpleInterface) {
      jin.error(`Namespace clash: plugin jin.simpleInterface exists already?`)
      return
    }
    const el = document.getElementById("app")
    if (!el) {
      jin.error(`\${pluginName}: the plugin cannot work without a div with id "app"`)
      return
    }
    const bar = document.createElement('div')
    bar.style = `margin-bottom: 20px;`
    bar.innerHTML = `
      <button id="\${domPrefix}load">load</button>
      <button id="\${domPrefix}save">save</button>
      <button id="\${domPrefix}erase">erase</button>
      <button id="\${domPrefix}undo">undo</button>
    `
    el.prepend(bar)
    const loadEl = document.getElementById(`\${domPrefix}load`)
    loadEl.addEventListener("click", clickLoad)
    const saveEl = document.getElementById(`\${domPrefix}save`)
    saveEl.addEventListener("click", clickSave)
    const undoEl = document.getElementById(`\${domPrefix}undo`)
    undoEl.addEventListener("click", clickUndo)
    const eraseEl = document.getElementById(`\${domPrefix}erase`)
    eraseEl.addEventListener("click", clickErase)

    jin.createEffect ("final", () => {
      const undoState = JSON.parse( JSON.stringify( jin.getState() ) )
      undoStates.push(undoState)
      console.log("huh", undoState.outputContainers.main.content.choices)
    }, Infinity)

  }


  function clickUndo() {
    if (undoStates.length <= 1) {
      alert("nothing to undo")
      return
    }
    undoStates.pop()
    const state = undoStates[undoStates.length - 1]
    console.log("setting state", state, state.outputContainers.main.content.choices, undoStates)
    jin.setState(state)

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