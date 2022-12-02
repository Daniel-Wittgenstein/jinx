

;(function() {

  const variableStores = {}

  window.onload = startP

  window.onerror = (err) => {
    outputError({
      msg: err,
    })
  }

  const registeredEffects = {
    paragraphText: [],
    choiceText: [],
    allText: [],
    before: [],
    after: [],
    onVariableChange: [],
    set: [],
    get: [],
    loadApp: [],
  }

  let delayParagraphs = 30
  let delayChoices = 30


  const DEFAULT_ORDER_ASSET_INJECTOR = 10 //since asset injecting
    //is realized as an effect, too, it has an order number.

  let randomSeed = false
  let randomNumberGenerator = false

  const jin = {//provide global hooks for the story author:
    
    //jin methods can throw JS errors, because code called
    //from the story script is wrapped inside try/catch anyway
    //and displays error information if an error occurs.
    //use throw new Error(`), NOT throw `` because only that
    //displays errors correctly. Well, of course, that's not
    //the whole answer, because jin methods can be called
    //by JS code embedded in the story, so we also
    //have an error handler attached to window,
    //so we can hopefully display ALL errors to the user
    //and no error goes silently to the console

    error: (msg) => {
      //mostly for plugins:
      //displays error
      issueError(msg)
    },

    setDelay: (mode, time) => {
      if (mode === "paragraphs") {
        delayParagraphs = time
      } else if (mode === "choices") {
        delayParagraphs = time
      } else {
        throw new Error(`setDelay: mode must be "paragraphs" or "choices"`)
      }
    },

    createVariableStore: (key) => {
      //creates a new global variable store for the story author
      if (window[key]) {
        throw new Error(`A variable store called "${key}" exists already.
        (This error happened while calling the function "createVariableStore".)`)
      }
      const store = {
        name: key,
        content: {},
      }
      const handler = {

        get(target, prop, receiver) {
          //todo to do: getter effects
          return store.content[prop]
        },

        set(target, prop, value, receiver) {

          //get old value:
          const oldValue = store.content[prop]

          //onVariableChange effects:
          if (registeredEffects.onVariableChange) {
            for (let effect of registeredEffects.onVariableChange) {
              effect.func(prop, value, key, oldValue)
            }
          }

          let currentValue = value

          //set effects:
          if (registeredEffects.set) {
            for (let effect of registeredEffects.set) {
              let result = effect.func(prop, currentValue, key, value, oldValue)
              currentValue = result
            }
          }

          //set value:
          store.content[prop] = currentValue

          return true
        },
      }
      const proxy = new Proxy(store, handler)
      window[key] = proxy
      variableStores[key] = proxy
    },

    getVariableStores: () => {
      //author should not normally need this, but it's exposed
      //for completeness. note that this will contain proxies.
      return variableStores
    },

    asset(name) { //simple getAsset data function for story creator
      let x = storyData.assetsData.assets[name]
      if (x) return x.data
      return false
    },

    createEffect: (type, func, order = 0) => {
      const allowed = ["after", "before", "onVariableChange", "set", "get",
        "loadApp", "paragraphText", "choiceText", "allText", "beforeTextRender"]
      if (!type) {
        throw new Error(`createEffect: no parameters passed to function?`)
      }
      if (!allowed.includes(type)) {
        throw new Error(`createEffect: "${type}" is not a valid type for createEffect.`)
      }
      if (!utils.isFunc(func)) {
        throw new Error(`createEffect: second parameter is not a valid function.`)
      }
      if (!utils.isInteger(order)) {
        throw new Error(`createEffect: third parameter is not a valid integer number.`)
      }
      
      if (!registeredEffects[type]) {
        registeredEffects[type] = []
      }

      registeredEffects[type].push({
        type: type,
        func: func,
        order: order,
      })

      registeredEffects[type] = registeredEffects[type].sort(
        (a, b) => {
          return a.order - b.order
        }
      )
    },

    takeTurnFrom: (labelOrKnotName) => {
      //this should be called from custom author js functions
      //responding to some JS i-o events (like clicking on an image or similar),
      //but it should NOT be called inline from inside the story.
      //maybe introduce flag to prevent that usage (if feasible to implement)
    },

    say: (text) => {

    },

    output: (panelId) => {
      if (!outputContainers[panelId]) {
        throw new Error(`jin.output("${panelId}"): There is no output panel with id "${panelId}".`)
      }
 
      story.setTextContentMetaData({
        output: panelId,
      })
    },

    createPanel: (domId, options) => {
      //domId as well as internal panel id; corresponds 1:1
      if (!options) {
        options = {
          paragraphDelay: 500,
          choicedelay: 500,
        }
      }
      internalCreateContainer(domId, options)
    },

    getState: () => {
      /* returns current game state as JSON-serializable object.
      You can JSON-serialize it and store it inside local storage,
      download it as a text file or do whatever you want with it. */
      const state = internalGetState()
      return state
    },

    setState: (state) => {
      /* pass object returned by jin.getState. This does not just
      set the app state but also takes care of stuff like rerendering */
      internalSetState(state)
      renderAllContainers()
    },


  } //jin end

  window.jin = jin

  let story

  function internalGetState() {
    const state = {
      story: story.getState(),
      outputContainers: outputContainers,
      isRunnerState: true,
    }
    return state
  }


  function internalSetState(state) {
    if (!state.isRunnerState) throw new Error(`Not a valid runner state.`)
    outputContainers = state.outputContainers
    story.setState(state.story)
  }




 
  function onClick(event) {
    const el = event.target
    if (el.classList.contains("story-choice")) {
      const index = Number(el.getAttribute("data-choiceindex"))
      if (!index && index !== 0) {
        throw new Error("Fatal: button has no valid index.")
      }
      startTurn({type: "selectedChoice", choiceIndex: index})
    }
  }


  function startTurn(action) {
    /* 
    pass either:
      {type: "selectedChoice", choiceIndex: index}
    or:
      {type: "programmaticTrigger", target: "knotOrLabelName"}
    */
    function runBeforeEffects() {
      let divert = false
      for (let effect of registeredEffects.before) {
        const result = effect.func()
        if (result && result.divert) {
          divert = result.target
        }
      }
      return divert
    }

    function getActionToPerform(action, divert) {
      let result
      if (divert) {
        result = {
          mode: "jump",
          target: divert,
        }
      } else {
        if (action.type === "selectedChoice") {
          result = {
            mode: "choice",
            target: action.choiceIndex,
          }
        } else if (action.type === "programmaticTrigger") {
          result = {
            mode: "jump",
            target: action.target,
          }
        } else {
          throw new Error(`Invalid type`)
        }
      }
      return result
    }

    outputContainersMoveOldContentIntoOldBuffer()

    const divert = runBeforeEffects()

    const action2 = getActionToPerform(action, divert)

    if (action2.mode === "choice") {
      story.selectChoice(action2.target)
    } else {
      const result = story.jumpTo(action2.target)
      if (result && result.error) return //error is passed from jinx via onerror, no need to do anything here
    }
    story.kickOff()
  }


  function startP() {
    //jinx.setDebugOption("log")
    jin.createPanel("main")

    jin.createVariableStore("v")

    const rmode = window.$__RUNTIME_MODE
    console.log(`Running mode: ${rmode}`)

    document.addEventListener( "click", onClick )

    document.addEventListener('keydown', e => {
      if ( (e.ctrlKey || e.metaKey) && e.key === 's') {
        if (rmode === "editor") {
          e.preventDefault()
          window.parent.window.emitRuntimeMessage({action: "save"})
        }
      }
      if ( (e.ctrlKey || e.metaKey) && e.key === 'o') {
        if (rmode === "editor") {
          e.preventDefault()
          window.parent.window.emitRuntimeMessage({action: "load"})
        }
      }
    })

    initAssetInjector()

    story = createJinxStory(storyData.content, onError, onStoryEvent)
    if (story.compilationFailed) {
      return
    }
    console.log("%c RESTARTING STORY", "background: yellow; color: black;")

    //todo: custom loadappeffects can handle auto-loading last story state from localStorage, too
    //just set a new story state before story.kickOff() is called

    doLoadAppEffects()

    story.kickOff()
  }
  

  function doLoadAppEffects(story) {
    if (registeredEffects.loadApp) {
      for (let effect of registeredEffects.loadApp) {
        effect.func(story)
      }
    }
  }

  function createJinxStory(storyContent, onErrorFunc, onStoryEvent) {
    let story = window.jinx.createNewStory(storyContent, onErrorFunc, onStoryEvent)
    return story
  }



  function onError(err) {
    outputError(err)
  }

  function outputError(err) {
    console.log("error:", err)
    const out = `
      <div style="background: #FFF; color: #B00; padding: 10px;
      font-family: sans-serif; font-size: 14px;">
        <p>An error happened: </p>
        <p><b>${err.msg}</b></p>
        <p>Line Number: ${err.lineNr > 0 ? err.lineNr : "no line number"}</p>
        <p>Type: ${err.type}</p>
        <p></p>
        <p></p>
      </div>
    `
    document.write(out)
  }

  function issueError(msg) {
    /* This is for errors caused by the story creator that do not get passed over
    from jinx.js, but that come directly from the runner. As such, they don't have line numbers.
    For example an error might be thrown while rendering containers,
    because a DOM element with the corresponding id does not exist,
    so the HTML is erroneous, but we cannot tell where the error in the
    HTML is. This can be partly circumvented by checking
    whether a corresponding dom element exists when we create a new panel,
    BUT that does not always stop the error, because the
    story creator might even remove dom elements mid-turn.
    Therefore it is imperative that we display these errors, even if
    they don't have line numbers. The fact that they
    don't have line numbers is just something that cannot be really fixed,
    neither should one try to fix that, because it's next to impossible. */
    outputError({
      msg,
      lineNr: "unknown",
      type: "Runtime Error (runner)"
    })
  }



  function onStoryEvent(type) {
    console.log("JINX EVENT TRIGGERED:", type)
    if (type === "finishedCollecting" || type === "gameEnd") {
      jinxFinishedRunning()
    }
  }


  function jinxFinishedRunning() {
    function runAfterEffects() {
      let divert = false
      for (let effect of registeredEffects.after) {
        const result = effect.func()
        if (result && result.divert) {
          divert = result
        }
      }
      return divert
    }

    const divert = runAfterEffects()
    if (divert) {
      const result = story.jumpTo(divert)
      if (result && result.error) return //error is passed from jinx via onerror, no need to do anything here
      story.kickOff()
      return
    }

    //trimOutputContainers() todo: implement later

    const contents = story.getContents()

    if (contents && contents.error) return
    const clonedContents =  JSON.parse( JSON.stringify(contents) )
    const newContents = applyTextEffectsToOutputContents(clonedContents)

    //#############################
    //divide output elements by containers:

    const byContainers = {}
    for (let para of newContents.paragraphs) {
      let acc = "main"
      if (para.meta && para.meta.output) acc = para.meta.output 
      if (!byContainers[acc]) byContainers[acc] = []
      byContainers[acc].push(para)
    }

    for ( let key of Object.keys(byContainers) ) {
      const contents = byContainers[key]
      pushContentToContainer(key, contents, "paragraphs")
    }

    //(note that choices will all be in the same output container, since there is no
    //way to run js between choices, so you cannot switch output container between them either):
    if (newContents.choices.length) {
      const contId = newContents.choices[0]?.meta?.output || "main"
      pushContentToContainer(contId, newContents.choices, "choices")
    }

    //now render the containers:
    renderAllContainers()

  }



  function htmlStringToDomElement(htmlStr) {
    const template = document.createElement('template')
    htmlStr = htmlStr.trim()
    template.innerHTML = htmlStr
    const result = template.content.firstChild
    return result
  }

  function outputContainersMoveOldContentIntoOldBuffer() {
    for ( let key of Object.keys(outputContainers) ) {
      const container = outputContainers[key]
      for (let item of container.content.paragraphs) {
        container.content.oldBuffer.push(item)
      }
      for (let item of container.content.choices) {
        container.content.oldBuffer.push(item)
      }
      //flush:
      container.content.paragraphs = []
      container.content.choices = []
    }
  }


  function renderAllContainers() {
    for ( let key of Object.keys(outputContainers) ) {
      const container = outputContainers[key]
      renderContainer(container)   
    }
  }



  function renderContainer(container) {
    /* This actually resets the entire innerHTML of the container.
    So basically it rerenders the entire container every time,
    no incremental dom element addition or diffing of any sort
    if performed. This makes it way easier to handle things.*/

    const domEl = document.getElementById(container.id)
    if (!domEl) {
      issueError(`HTML DOM element with id "${container.id}" does not exist.`)
      return
    }

    let html = ""
    let oldHtml = ""
    
    //generate the old content:
    

    for (let item of container.content.oldBuffer) {
      if (item.type === "paragraphs") {
        oldHtml += `<div class="story-paragraph old-paragraph">${item.text}</div>`
      }
    }

    //generate the new content
    for (let para of container.content.paragraphs) {
      html += `<div class="story-paragraph">${para.text}</div>`
    }

    let choiceIndex = -1
    for (let choice of container.content.choices) {
      choiceIndex++
      let cl = "choice-mid"
      if (choiceIndex === 0) cl = "choice-first"
      if (choiceIndex === container.content.choices.length - 1) cl = "choice-last"
      if (container.content.choices.length === 1) cl = "choice-only-one"
      html += `<button
          class="story-choice ${cl}"
          data-choiceindex='${choiceIndex}'>${choice.text}</button>`
    }

    //actually render:
    const thtml = `
      <div id="__runner-internal-old-content" style="pointer-events: none">${oldHtml}</div>
      ${html}
      `
    domEl.innerHTML = thtml

    //and disable as much clickable content as possible in the old content div (so you cannot
    //click on old buttons etc.):
    const oldEl = document.getElementById("__runner-internal-old-content")

    //disable all elements and destroy inline onClick; works:
    if (oldEl) {
      const allEls = oldEl.querySelectorAll("*")
      for (let el of allEls) {
        el.disabled = true
        el.onclick = ""
      }
    }


  }


  function pushContentToContainer(containerId, content, type) {
    const container = outputContainers[containerId]
    if (!container) {
      //not rly important since this should be caught already inside jin.output
      //if this throws, it's a developer error.
      throw new Error(`Dev error: There is no output panel with id "${containerId}".`)
    }

    //actually add the new content to the container:
    for (let item of content) {
      item.type = type
      container.content[type].push(item)
    }
  }

  let outputContainers = {}

  function internalCreateContainer(id, options) {
    //does not create dom element, just pass id of already existing
    //dom element and it will associate an output container with it
    if (outputContainers[id]) {
      throw new Error(`An output panel with id "${id}" exists already."`)
    }
    const outputContainer = {
      id,
      options,
      content: {
        paragraphs: [],
        choices: [],
        oldBuffer: [],
      },
    }
    outputContainers[id] = outputContainer
  }


  function applyTextEffectsToOutputContents(contents) {
    //todo shitty not beforerender text effects

    return contents
  }




  function pipeThroughFuncList(text, list, prop) {
    for (let item of list) {
      text = item[prop](text)
    }
    return text
  }
  
  function initAssetInjector() {
    function injectAssets(text) {
      text = text.replace(/\$asset\(.*?\)/g, (n) => {
        n = n.replace("$asset(", "").replace(")", "").trim()
        let el = storyData.assetsData.assets[n]
        //$asset(asset "${n}" does not exist)
        if (!el) return ""
        return el.data
      })
      return text
    }
    jin.createEffect("beforeTextRender", injectAssets, DEFAULT_ORDER_ASSET_INJECTOR)
  }



})();

 

//#####  PURELY TEST CODE. TO DELETE BEFORE DEPLOYMENT:

/*
;(function() {
  const pluginName = "plugin simpleInterface"
  const domPrefix = "X-simple-interface-plugin-"

  jin.createEffect("loadApp", initStuff, 20)

  function initStuff() {
    if (jin.simpleInterface) {
      jin.error(`Namespace clash: plugin jin.simpleInterface exists already?`)
      return
    }
    const el = document.getElementById("app")
    if (!el) {
      jin.error(`${pluginName}: the plugin cannot work without a div with id "app"`)
      return
    }
    const bar = document.createElement('div')
    bar.style = `margin-bottom: 20px;`
    bar.innerHTML = `
      <button id="${domPrefix}load">load</button>
      <button id="${domPrefix}save">save</button>
      <button id="${domPrefix}erase">erase</button>
    `
    el.prepend(bar)
    const loadEl = document.getElementById(`${domPrefix}load`)
    loadEl.addEventListener("click", clickLoad)
    const saveEl = document.getElementById(`${domPrefix}save`)
    saveEl.addEventListener("click", clickSave)
    const eraseEl = document.getElementById(`${domPrefix}erase`)
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
*/