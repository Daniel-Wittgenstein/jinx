window.runTimeData.runner = {"Contents":"\n\n;(function() {\n\n  const variableStores = {}\n\n  window.onload = startP\n\n  window.onerror = (err) =\u003e {\n    outputError({\n      msg: err,\n    })\n  }\n\n  const registeredEffects = {\n    paragraphText: [],\n    choiceText: [],\n    allText: [],\n    before: [],\n    after: [],\n    onVariableChange: [],\n    set: [],\n    get: [],\n    loadApp: [],\n  }\n\n  let delayParagraphs = 30\n  let delayChoices = 30\n\n\n  const DEFAULT_ORDER_ASSET_INJECTOR = 10 //since asset injecting\n    //is realized as an effect, too, it has an order number.\n\n  let randomSeed = false\n  let randomNumberGenerator = false\n\n  const jin = {//provide global hooks for the story author:\n    \n    //jin methods can throw JS errors, because code called\n    //from the story script is wrapped inside try/catch anyway\n    //and displays error information if an error occurs.\n    //use throw new Error(`), NOT throw `` because only that\n    //displays errors correctly. Well, of course, that's not\n    //the whole answer, because jin methods can be called\n    //by JS code embedded in the story, so we also\n    //have an error handler attached to window,\n    //so we can hopefully display ALL errors to the user\n    //and no error goes silently to the console\n\n    error: (msg) =\u003e {\n      //mostly for plugins:\n      //displays error\n      issueError(msg)\n    },\n\n    setDelay: (mode, time) =\u003e {\n      if (mode === \"paragraphs\") {\n        delayParagraphs = time\n      } else if (mode === \"choices\") {\n        delayParagraphs = time\n      } else {\n        throw new Error(`setDelay: mode must be \"paragraphs\" or \"choices\"`)\n      }\n    },\n\n    createVariableStore: (key) =\u003e {\n      //creates a new global variable store for the story author\n      if (window[key]) {\n        throw new Error(`A variable store called \"${key}\" exists already.\n        (This error happened while calling the function \"createVariableStore\".)`)\n      }\n      const store = {\n        name: key,\n        content: {},\n      }\n      const handler = {\n\n        get(target, prop, receiver) {\n          //todo to do: getter effects\n          return store.content[prop]\n        },\n\n        set(target, prop, value, receiver) {\n\n          //get old value:\n          const oldValue = store.content[prop]\n\n          //onVariableChange effects:\n          if (registeredEffects.onVariableChange) {\n            for (let effect of registeredEffects.onVariableChange) {\n              effect.func(prop, value, key, oldValue)\n            }\n          }\n\n          let currentValue = value\n\n          //set effects:\n          if (registeredEffects.set) {\n            for (let effect of registeredEffects.set) {\n              let result = effect.func(prop, currentValue, key, value, oldValue)\n              currentValue = result\n            }\n          }\n\n          //set value:\n          store.content[prop] = currentValue\n\n          return true\n        },\n      }\n      const proxy = new Proxy(store, handler)\n      window[key] = proxy\n      variableStores[key] = proxy\n    },\n\n    getVariableStores: () =\u003e {\n      //author should not normally need this, but it's exposed\n      //for completeness. note that this will contain proxies.\n      return variableStores\n    },\n\n    asset(name) { //simple getAsset data function for story creator\n      let x = storyData.assetsData.assets[name]\n      if (x) return x.data\n      return false\n    },\n\n    createEffect: (type, func, order = 0) =\u003e {\n      const allowed = [\"after\", \"before\", \"onVariableChange\", \"set\", \"get\",\n        \"loadApp\", \"paragraphText\", \"choiceText\", \"allText\", \"beforeTextRender\"]\n      if (!type) {\n        throw new Error(`createEffect: no parameters passed to function?`)\n      }\n      if (!allowed.includes(type)) {\n        throw new Error(`createEffect: \"${type}\" is not a valid type for createEffect.`)\n      }\n      if (!utils.isFunc(func)) {\n        throw new Error(`createEffect: second parameter is not a valid function.`)\n      }\n      if (!utils.isInteger(order)) {\n        throw new Error(`createEffect: third parameter is not a valid integer number.`)\n      }\n      \n      if (!registeredEffects[type]) {\n        registeredEffects[type] = []\n      }\n\n      registeredEffects[type].push({\n        type: type,\n        func: func,\n        order: order,\n      })\n\n      registeredEffects[type] = registeredEffects[type].sort(\n        (a, b) =\u003e {\n          return a.order - b.order\n        }\n      )\n    },\n\n    takeTurnFrom: (labelOrKnotName) =\u003e {\n      //this should be called from custom author js functions\n      //responding to some JS i-o events (like clicking on an image or similar),\n      //but it should NOT be called inline from inside the story.\n      //maybe introduce flag to prevent that usage (if feasible to implement)\n    },\n\n    say: (text) =\u003e {\n\n    },\n\n    output: (panelId) =\u003e {\n      if (!outputContainers[panelId]) {\n        throw new Error(`jin.output(\"${panelId}\"): There is no output panel with id \"${panelId}\".`)\n      }\n \n      story.setTextContentMetaData({\n        output: panelId,\n      })\n    },\n\n    createPanel: (domId, options) =\u003e {\n      //domId as well as internal panel id; corresponds 1:1\n      if (!options) {\n        options = {\n          paragraphDelay: 500,\n          choicedelay: 500,\n        }\n      }\n      internalCreateContainer(domId, options)\n    },\n\n    getState: () =\u003e {\n      /* returns current game state as JSON-serializable object.\n      You can JSON-serialize it and store it inside local storage,\n      download it as a text file or do whatever you want with it. */\n      const state = internalGetState()\n      return state\n    },\n\n    setState: (state) =\u003e {\n      /* pass object returned by jin.getState. This does not just\n      set the app state but also takes care of stuff like rerendering */\n      internalSetState(state)\n      renderAllContainers()\n    },\n\n\n  } //jin end\n\n  window.jin = jin\n\n  let story\n\n  function internalGetState() {\n    const state = {\n      story: story.getState(),\n      outputContainers: outputContainers,\n      isRunnerState: true,\n    }\n    return state\n  }\n\n\n  function internalSetState(state) {\n    if (!state.isRunnerState) throw new Error(`Not a valid runner state.`)\n    outputContainers = state.outputContainers\n    story.setState(state.story)\n  }\n\n\n\n\n \n  function onClick(event) {\n    const el = event.target\n    if (el.classList.contains(\"story-choice\")) {\n      const index = Number(el.getAttribute(\"data-choiceindex\"))\n      if (!index \u0026\u0026 index !== 0) {\n        throw new Error(\"Fatal: button has no valid index.\")\n      }\n      startTurn({type: \"selectedChoice\", choiceIndex: index})\n    }\n  }\n\n\n  function startTurn(action) {\n    /* \n    pass either:\n      {type: \"selectedChoice\", choiceIndex: index}\n    or:\n      {type: \"programmaticTrigger\", target: \"knotOrLabelName\"}\n    */\n    function runBeforeEffects() {\n      let divert = false\n      for (let effect of registeredEffects.before) {\n        const result = effect.func()\n        if (result \u0026\u0026 result.divert) {\n          divert = result.target\n        }\n      }\n      return divert\n    }\n\n    function getActionToPerform(action, divert) {\n      let result\n      if (divert) {\n        result = {\n          mode: \"jump\",\n          target: divert,\n        }\n      } else {\n        if (action.type === \"selectedChoice\") {\n          result = {\n            mode: \"choice\",\n            target: action.choiceIndex,\n          }\n        } else if (action.type === \"programmaticTrigger\") {\n          result = {\n            mode: \"jump\",\n            target: action.target,\n          }\n        } else {\n          throw new Error(`Invalid type`)\n        }\n      }\n      return result\n    }\n\n    outputContainersMoveOldContentIntoOldBuffer()\n\n    const divert = runBeforeEffects()\n\n    const action2 = getActionToPerform(action, divert)\n\n    if (action2.mode === \"choice\") {\n      story.selectChoice(action2.target)\n    } else {\n      const result = story.jumpTo(action2.target)\n      if (result \u0026\u0026 result.error) return //error is passed from jinx via onerror, no need to do anything here\n    }\n    story.kickOff()\n  }\n\n\n  function startP() {\n    //jinx.setDebugOption(\"log\")\n    jin.createPanel(\"main\")\n\n    jin.createVariableStore(\"v\")\n\n    const rmode = window.$__RUNTIME_MODE\n    console.log(`Running mode: ${rmode}`)\n\n    document.addEventListener( \"click\", onClick )\n\n    document.addEventListener('keydown', e =\u003e {\n      if ( (e.ctrlKey || e.metaKey) \u0026\u0026 e.key === 's') {\n        if (rmode === \"editor\") {\n          e.preventDefault()\n          window.parent.window.emitRuntimeMessage({action: \"save\"})\n        }\n      }\n      if ( (e.ctrlKey || e.metaKey) \u0026\u0026 e.key === 'o') {\n        if (rmode === \"editor\") {\n          e.preventDefault()\n          window.parent.window.emitRuntimeMessage({action: \"load\"})\n        }\n      }\n    })\n\n    initAssetInjector()\n\n    story = createJinxStory(storyData.content, onError, onStoryEvent)\n    if (story.compilationFailed) {\n      return\n    }\n    console.log(\"%c RESTARTING STORY\", \"background: yellow; color: black;\")\n\n    //todo: custom loadappeffects can handle auto-loading last story state from localStorage, too\n    //just set a new story state before story.kickOff() is called\n\n    doLoadAppEffects()\n\n    story.kickOff()\n  }\n  \n\n  function doLoadAppEffects(story) {\n    if (registeredEffects.loadApp) {\n      for (let effect of registeredEffects.loadApp) {\n        effect.func(story)\n      }\n    }\n  }\n\n  function createJinxStory(storyContent, onErrorFunc, onStoryEvent) {\n    let story = window.jinx.createNewStory(storyContent, onErrorFunc, onStoryEvent)\n    return story\n  }\n\n\n\n  function onError(err) {\n    outputError(err)\n  }\n\n  function outputError(err) {\n    console.log(\"error:\", err)\n    const out = `\n      \u003cdiv style=\"background: #FFF; color: #B00; padding: 10px;\n      font-family: sans-serif; font-size: 14px;\"\u003e\n        \u003cp\u003eAn error happened: \u003c/p\u003e\n        \u003cp\u003e\u003cb\u003e${err.msg}\u003c/b\u003e\u003c/p\u003e\n        \u003cp\u003eLine Number: ${err.lineNr \u003e 0 ? err.lineNr : \"no line number\"}\u003c/p\u003e\n        \u003cp\u003eType: ${err.type}\u003c/p\u003e\n        \u003cp\u003e\u003c/p\u003e\n        \u003cp\u003e\u003c/p\u003e\n      \u003c/div\u003e\n    `\n    document.write(out)\n  }\n\n  function issueError(msg) {\n    /* This is for errors caused by the story creator that do not get passed over\n    from jinx.js, but that come directly from the runner. As such, they don't have line numbers.\n    For example an error might be thrown while rendering containers,\n    because a DOM element with the corresponding id does not exist,\n    so the HTML is erroneous, but we cannot tell where the error in the\n    HTML is. This can be partly circumvented by checking\n    whether a corresponding dom element exists when we create a new panel,\n    BUT that does not always stop the error, because the\n    story creator might even remove dom elements mid-turn.\n    Therefore it is imperative that we display these errors, even if\n    they don't have line numbers. The fact that they\n    don't have line numbers is just something that cannot be really fixed,\n    neither should one try to fix that, because it's next to impossible. */\n    outputError({\n      msg,\n      lineNr: \"unknown\",\n      type: \"Runtime Error (runner)\"\n    })\n  }\n\n\n\n  function onStoryEvent(type) {\n    console.log(\"JINX EVENT TRIGGERED:\", type)\n    if (type === \"finishedCollecting\" || type === \"gameEnd\") {\n      jinxFinishedRunning()\n    }\n  }\n\n\n  function jinxFinishedRunning() {\n    function runAfterEffects() {\n      let divert = false\n      for (let effect of registeredEffects.after) {\n        const result = effect.func()\n        if (result \u0026\u0026 result.divert) {\n          divert = result\n        }\n      }\n      return divert\n    }\n\n    const divert = runAfterEffects()\n    if (divert) {\n      const result = story.jumpTo(divert)\n      if (result \u0026\u0026 result.error) return //error is passed from jinx via onerror, no need to do anything here\n      story.kickOff()\n      return\n    }\n\n    //trimOutputContainers() todo: implement later\n\n    const contents = story.getContents()\n\n    if (contents \u0026\u0026 contents.error) return\n    const clonedContents =  JSON.parse( JSON.stringify(contents) )\n    const newContents = applyTextEffectsToOutputContents(clonedContents)\n\n    //#############################\n    //divide output elements by containers:\n\n    const byContainers = {}\n    for (let para of newContents.paragraphs) {\n      let acc = \"main\"\n      if (para.meta \u0026\u0026 para.meta.output) acc = para.meta.output \n      if (!byContainers[acc]) byContainers[acc] = []\n      byContainers[acc].push(para)\n    }\n\n    for ( let key of Object.keys(byContainers) ) {\n      const contents = byContainers[key]\n      pushContentToContainer(key, contents, \"paragraphs\")\n    }\n\n    //(note that choices will all be in the same output container, since there is no\n    //way to run js between choices, so you cannot switch output container between them either):\n    if (newContents.choices.length) {\n      const contId = newContents.choices[0]?.meta?.output || \"main\"\n      pushContentToContainer(contId, newContents.choices, \"choices\")\n    }\n\n    //now render the containers:\n    renderAllContainers()\n\n  }\n\n\n\n  function htmlStringToDomElement(htmlStr) {\n    const template = document.createElement('template')\n    htmlStr = htmlStr.trim()\n    template.innerHTML = htmlStr\n    const result = template.content.firstChild\n    return result\n  }\n\n  function outputContainersMoveOldContentIntoOldBuffer() {\n    for ( let key of Object.keys(outputContainers) ) {\n      const container = outputContainers[key]\n      for (let item of container.content.paragraphs) {\n        container.content.oldBuffer.push(item)\n      }\n      for (let item of container.content.choices) {\n        container.content.oldBuffer.push(item)\n      }\n      //flush:\n      container.content.paragraphs = []\n      container.content.choices = []\n    }\n  }\n\n\n  function renderAllContainers() {\n    for ( let key of Object.keys(outputContainers) ) {\n      const container = outputContainers[key]\n      renderContainer(container)   \n    }\n  }\n\n\n\n  function renderContainer(container) {\n    /* This actually resets the entire innerHTML of the container.\n    So basically it rerenders the entire container every time,\n    no incremental dom element addition or diffing of any sort\n    if performed. This makes it way easier to handle things.*/\n\n    const domEl = document.getElementById(container.id)\n    if (!domEl) {\n      issueError(`HTML DOM element with id \"${container.id}\" does not exist.`)\n      return\n    }\n\n    let html = \"\"\n    let oldHtml = \"\"\n    \n    //generate the old content:\n    \n\n    for (let item of container.content.oldBuffer) {\n      if (item.type === \"paragraphs\") {\n        oldHtml += `\u003cdiv class=\"story-paragraph old-paragraph\"\u003e${item.text}\u003c/div\u003e`\n      }\n    }\n\n    //generate the new content\n    for (let para of container.content.paragraphs) {\n      html += `\u003cdiv class=\"story-paragraph\"\u003e${para.text}\u003c/div\u003e`\n    }\n\n    let choiceIndex = -1\n    for (let choice of container.content.choices) {\n      choiceIndex++\n      let cl = \"choice-mid\"\n      if (choiceIndex === 0) cl = \"choice-first\"\n      if (choiceIndex === container.content.choices.length - 1) cl = \"choice-last\"\n      if (container.content.choices.length === 1) cl = \"choice-only-one\"\n      html += `\u003cbutton\n          class=\"story-choice ${cl}\"\n          data-choiceindex='${choiceIndex}'\u003e${choice.text}\u003c/button\u003e`\n    }\n\n    //actually render:\n    const thtml = `\n      \u003cdiv id=\"__runner-internal-old-content\" style=\"pointer-events: none\"\u003e${oldHtml}\u003c/div\u003e\n      ${html}\n      `\n    domEl.innerHTML = thtml\n\n    //and disable as much clickable content as possible in the old content div (so you cannot\n    //click on old buttons etc.):\n    const oldEl = document.getElementById(\"__runner-internal-old-content\")\n\n    //disable all elements and destroy inline onClick; works:\n    if (oldEl) {\n      const allEls = oldEl.querySelectorAll(\"*\")\n      for (let el of allEls) {\n        el.disabled = true\n        el.onclick = \"\"\n      }\n    }\n\n\n  }\n\n\n  function pushContentToContainer(containerId, content, type) {\n    const container = outputContainers[containerId]\n    if (!container) {\n      //not rly important since this should be caught already inside jin.output\n      //if this throws, it's a developer error.\n      throw new Error(`Dev error: There is no output panel with id \"${containerId}\".`)\n    }\n\n    //actually add the new content to the container:\n    for (let item of content) {\n      item.type = type\n      container.content[type].push(item)\n    }\n  }\n\n  let outputContainers = {}\n\n  function internalCreateContainer(id, options) {\n    //does not create dom element, just pass id of already existing\n    //dom element and it will associate an output container with it\n    if (outputContainers[id]) {\n      throw new Error(`An output panel with id \"${id}\" exists already.\"`)\n    }\n    const outputContainer = {\n      id,\n      options,\n      content: {\n        paragraphs: [],\n        choices: [],\n        oldBuffer: [],\n      },\n    }\n    outputContainers[id] = outputContainer\n  }\n\n\n  function applyTextEffectsToOutputContents(contents) {\n    //todo shitty not beforerender text effects\n\n    return contents\n  }\n\n\n\n\n  function pipeThroughFuncList(text, list, prop) {\n    for (let item of list) {\n      text = item[prop](text)\n    }\n    return text\n  }\n  \n  function initAssetInjector() {\n    function injectAssets(text) {\n      text = text.replace(/\\$asset\\(.*?\\)/g, (n) =\u003e {\n        n = n.replace(\"$asset(\", \"\").replace(\")\", \"\").trim()\n        let el = storyData.assetsData.assets[n]\n        //$asset(asset \"${n}\" does not exist)\n        if (!el) return \"\"\n        return el.data\n      })\n      return text\n    }\n    jin.createEffect(\"beforeTextRender\", injectAssets, DEFAULT_ORDER_ASSET_INJECTOR)\n  }\n\n\n\n})();\n\n \n\n//#####  PURELY TEST CODE. TO DELETE BEFORE DEPLOYMENT:\n\n/*\n;(function() {\n  const pluginName = \"plugin simpleInterface\"\n  const domPrefix = \"X-simple-interface-plugin-\"\n\n  jin.createEffect(\"loadApp\", initStuff, 20)\n\n  function initStuff() {\n    if (jin.simpleInterface) {\n      jin.error(`Namespace clash: plugin jin.simpleInterface exists already?`)\n      return\n    }\n    const el = document.getElementById(\"app\")\n    if (!el) {\n      jin.error(`${pluginName}: the plugin cannot work without a div with id \"app\"`)\n      return\n    }\n    const bar = document.createElement('div')\n    bar.style = `margin-bottom: 20px;`\n    bar.innerHTML = `\n      \u003cbutton id=\"${domPrefix}load\"\u003eload\u003c/button\u003e\n      \u003cbutton id=\"${domPrefix}save\"\u003esave\u003c/button\u003e\n      \u003cbutton id=\"${domPrefix}erase\"\u003eerase\u003c/button\u003e\n    `\n    el.prepend(bar)\n    const loadEl = document.getElementById(`${domPrefix}load`)\n    loadEl.addEventListener(\"click\", clickLoad)\n    const saveEl = document.getElementById(`${domPrefix}save`)\n    saveEl.addEventListener(\"click\", clickSave)\n    const eraseEl = document.getElementById(`${domPrefix}erase`)\n    eraseEl.addEventListener(\"click\", clickErase)\n  }\n  \n\n  function clickLoad() {\n    const state = localStorage.getItem(\"basicSaveState\")\n    if (!state) {\n      alert(\"Nothing to load.\")\n      return\n    }\n    const stateParsed = JSON.parse(state)\n    jin.setState(stateParsed)    \n  }\n\n  function clickSave() {\n    const state = jin.getState()\n    const stateJson = JSON.stringify(state)\n    localStorage.setItem(\"basicSaveState\", stateJson)\n  }\n\n  function clickErase() {\n    localStorage.setItem(\"basicSaveState\", \"\")\n  }\n\n\n})();\n*/","Meta":"runner.js"}