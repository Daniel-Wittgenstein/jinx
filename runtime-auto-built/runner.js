window.runTimeData.runner = {"Contents":"\n\n;(function() {\n\n  const variableStores = {}\n\n  window.onload = startP\n\n  const registeredEffects = {}\n\n  let randomSeed = false\n  let randomNumberGenerator = false\n\n  const jin = {//provide global hooks for the story author:\n    \n    //jin methods can throw JS errors, because code called\n    //from the story script is wrapped inside try/catch anyway\n    //and displays error information if an error occurs.\n    //use throw new Error(`), NOT throw `` because only that\n    //displays erros correctly.\n\n    createVariableStore: (key) =\u003e {\n      //creates a new global variable store for the story author\n      if (window[key]) {\n        throw new Error(`A variable store called \"${key}\" exists already.\n        (This error happened while calling the function \"createVariableStore\".)`)\n      }\n      const store = {\n        name: key,\n        content: {},\n      }\n      const handler = {\n\n        get(target, prop, receiver) {\n          //todo to do: getter effects\n          return store.content[prop]\n        },\n\n        set(target, prop, value, receiver) {\n\n          //get old value:\n          const oldValue = store.content[prop]\n\n          //onVariableChange effects:\n          if (registeredEffects.onVariableChange) {\n            for (let effect of registeredEffects.onVariableChange) {\n              effect.func(prop, value, key, oldValue)\n            }\n          }\n\n          let currentValue = value\n\n          //set effects:\n          if (registeredEffects.set) {\n            for (let effect of registeredEffects.set) {\n              let result = effect.func(prop, currentValue, key, value, oldValue)\n              currentValue = result\n            }\n          }\n\n          //set value:\n          store.content[prop] = currentValue\n\n          return true\n        },\n      }\n      const proxy = new Proxy(store, handler)\n      window[key] = proxy\n      variableStores[key] = proxy\n    },\n\n    getVariableStores: () =\u003e {\n      //author should not normally need this, but it's exposed\n      //for completeness. note that this will contain proxies.\n      return variableStores\n    },\n\n\n    asset(name) { //simple getAsset data function for story creator\n      let x = storyData.assetsData.assets[name]\n      if (x) return x.data\n      return false\n    },\n\n\n    createEffect: (type, func, order = 0) =\u003e {\n      // an effect for story start would be useful, too\n      // and maybe even output filters could be done as effects, why not\n      const allowed = [\"after\", \"before\", \"onVariableChange\", \"set\", \"get\"]\n      if (!type) {\n        throw new Error(`createEffect: no parameters passed to function?`)\n      }\n      if (!allowed.includes(type)) {\n        throw new Error(`createEffect: \"${type}\" is not a valid type for createEffect.`)\n      }\n      if (!utils.isFunc(func)) {\n        throw new Error(`createEffect: second parameter is not a valid function.`)\n      }\n      if (!utils.isInteger(order)) {\n        throw new Error(`createEffect: third parameter is not a valid integer number.`)\n      }\n      \n      if (!registeredEffects[type]) {\n        registeredEffects[type] = []\n      }\n\n      registeredEffects[type].push({\n        type: type,\n        func: func,\n        order: order,\n      })\n\n      registeredEffects[type] = registeredEffects[type].sort(\n        (a, b) =\u003e {\n          return a.order - b.order\n        }\n      )\n    },\n\n    goto: () =\u003e {\n\n    },\n\n    say: () =\u003e {\n\n    },\n\n    output: () =\u003e {\n\n    },\n\n    choice: () =\u003e {\n\n    },\n    \n    random: (min, max) =\u003e {\n      if (!randomNumberGenerator) {\n        throw new Error (`You need to enable the SeedRandom plugin to use this feature.`)\n        return\n      }\n      min = Math.ceil(min)\n      max = Math.floor(max)\n      return Math.floor( randomNumberGenerator() * (max - min + 1) ) + min\n    },\n\n    pick: () =\u003e {\n\n    },\n\n    seed: (s) =\u003e {\n      if (!Math.seedrandom) {\n        throw new Error (`You need to enable the SeedRandom plugin to use this feature.`)\n        return\n      }\n      if (!s \u0026\u0026 s != 0 \u0026\u0026 s !== \"\") {\n        randomNumberGenerator = new Math.seedrandom()\n        randomSeed = false\n      } else {\n        randomNumberGenerator = new Math.seedrandom(s)\n        randomSeed = s\n      }\n    },\n\n  } //jin end\n\n  window.jin = jin\n\n  let story\n\n  let mainOutputElement \n \n  function onClick(event) {\n    const el = event.target\n    if (el.classList.contains(\"story-choice\")) {\n      const index = Number(el.getAttribute(\"data-choiceindex\"))\n      if (!index \u0026\u0026 index !== 0) {\n        throw new Error(\"Fatal: button has no valid index.\")\n      }\n      mainOutputElement.innerHTML = \"\"\n      story.selectChoice(index)\n    }\n  }\n\n\n  function startP() {\n    //jinx.setDebugOption(\"log\")\n\n    jin.createVariableStore(\"v\")\n\n    mainOutputElement = document.getElementById(\"main\")\n\n    const rmode = window.$__RUNTIME_MODE\n    console.log(`Running mode: ${rmode}`)\n\n    document.addEventListener( \"click\", onClick )\n\n    document.addEventListener('keydown', e =\u003e {\n      if ( (e.ctrlKey || e.metaKey) \u0026\u0026 e.key === 's') {\n        if (rmode === \"editor\") {\n          e.preventDefault()\n          window.parent.window.emitRuntimeMessage({action: \"save\"})\n        }\n      }\n      if ( (e.ctrlKey || e.metaKey) \u0026\u0026 e.key === 'o') {\n        if (rmode === \"editor\") {\n          e.preventDefault()\n          window.parent.window.emitRuntimeMessage({action: \"load\"})\n        }\n      }\n\n    })\n\n    story = createJinxStory(storyData.content, onError, onStoryEvent)\n    if (story.compilationFailed) {\n      return\n    }\n    console.log(\"%c RESTARTING STORY\", \"background: yellow; color: black;\")\n    story.restart()\n  }\n  \n\n  function createJinxStory(storyContent, onErrorFunc, onStoryEvent) {\n    let story = jinx.createNewStory(storyContent, onErrorFunc, onStoryEvent)\n    return story\n  }\n\n  function onError(err) {\n    outputError(err)\n  }\n\n  function outputError(err) {\n    console.log(\"error:\", err)\n    const out = `\n      \u003cdiv style=\"background: #FFF; color: #B00; padding: 10px;\n      font-family: sans-serif; font-size: 14px;\"\u003e\n        \u003cp\u003eAn error happened: \u003c/p\u003e\n        \u003cp\u003e\u003cb\u003e${err.msg}\u003c/b\u003e\u003c/p\u003e\n        \u003cp\u003eLine Number: ${err.lineNr \u003e 0 ? err.lineNr : \"no line number\"}\u003c/p\u003e\n        \u003cp\u003eType: ${err.type}\u003c/p\u003e\n        \u003cp\u003e\u003c/p\u003e\n        \u003cp\u003e\u003c/p\u003e\n      \u003c/div\u003e\n    `\n    document.write(out)\n  }\n\n\n\n  function onStoryEvent(type) {\n    console.log(\"JINX EVENT TRIGGERED:\", type)\n    if (type === \"finishedCollecting\" || type === \"gameEnd\") {\n      renderStuff()\n    }\n  }\n  \n  function preProcessParagraphText(text) {\n    text = text.replace(/\\$asset\\(.*?\\)/g, (n) =\u003e {\n      n = n.replace(\"$asset(\", \"\").replace(\")\", \"\").trim()\n      let el = storyData.assetsData.assets[n]\n      //$asset(asset \"${n}\" does not exist)\n      if (!el) return \"\"\n      return el.data\n    })\n    return text\n  }\n\n  function renderStuff() {\n    let contents = story.getContents()\n    if (contents \u0026\u0026 contents.error) return\n    let choices = contents.choices\n    let paragraphs = contents.paragraphs\n    let delay = 0\n    const delayInterval = 30\n    if (!paragraphs) return\n    //console.log(222, paragraphs)\n    for (let p of paragraphs) {\n      setTimeout( () =\u003e {\n        let el = document.createElement(\"div\") //divs are more powerful than p\n        el.classList.add(\"story-paragraph\")\n        const text = preProcessParagraphText(p.text)\n        el.innerHTML = text\n        mainOutputElement.appendChild(el)\n      }, delay)\n      delay += delayInterval\n    }\n\n    let index = -1\n    for (let c of choices) {\n      setTimeout( () =\u003e {\n        index++\n        let cl = \"choice-mid\"\n        if (index === 0) cl = \"choice-first\"\n        if (index === choices.length - 1) cl = \"choice-last\"\n        if (choices.length === 1) cl = \"choice-only-one\"        \n        let el = document.createElement(\"button\")\n        mainOutputElement.appendChild(el)\n        el.outerHTML = `\u003cbutton\n          class=\"story-choice ${cl}\"\n          data-choiceindex='${c.index}'\u003e${c.text}\u003c/button\u003e`\n      }, delay)\n      delay += delayInterval\n    }\n\n  }\n\n})()\n\n","Meta":"runner.js"}