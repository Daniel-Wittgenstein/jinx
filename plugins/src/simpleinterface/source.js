;(function() {

  /* 
    User Interface options:
    simpleInterface.maxUndoStates(5) //set maximum undo to 5 turns

  */

  const userInterface = {
    setMaxUndo(num) {
      if (  !utils.isInteger(num) ) {
        throw new Error(`setMaxUndo expects an integer number`)
      }
      if (  num < 0 ) {
        throw new Error(`setMaxUndo must be at least 0`)
      }
      maxUndoStates = num
    }
  }
  window.simpleInterface = userInterface

  const pluginName = "plugin simpleInterface"
  const domPrefix = "X-simple-interface-plugin-"

  jin.createEffect("loadApp", initStuff, 20)

  let undoStates = []
  let maxUndoStates = 7 //7 is default setting

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

    jin.createEffect ("initTurn", () => {
      const undoState = JSON.parse( JSON.stringify( jin.getState() ) )
      undoStates.push(undoState)
      if (undoStates.length > maxUndoStates) {
        undoStates.shift()
      }
    }, -100_000)

  }


  function logUndoStack() {
    console.log(`####### CURRENT UNDO STACK ENTRIES: #######`)
    let index = -1
    for (let s of undoStates) {
      index++
      const c = s.outputContainers.main.content
      let out = ""
      out += c.paragraphs.reduce(
        (total, par) => {return total += par.text + "      "},
        "")
      out += c.choices.reduce(
        (total, choice) => {return total += "+ " + choice.text + "      "},
        "")
      console.log(index, out)
    }
    console.log("### undo stack end ###")

  } 

  function clickUndo() {
    if (undoStates.length < 1) {
      alert("nothing to undo")
      return
    }
    const state = undoStates.pop()
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
    undoStates = []

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