

;(function() {

  const variableStores = {}

  window.onload = startP

  const registeredEffects = {}

  let randomSeed = false
  let randomNumberGenerator = false

  const jin = {//provide global hooks for the story author:
    
    //jin methods can throw JS errors, because code called
    //from the story script is wrapped inside try/catch anyway
    //and displays error information if an error occurs.
    //use throw new Error(`), NOT throw `` because only that
    //displays erros correctly.

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
      // an effect for story start would be useful, too
      // and maybe even output filters could be done as effects, why not
      const allowed = ["after", "before", "onVariableChange", "set", "get"]
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

    goto: () => {

    },

    say: () => {

    },

    output: () => {

    },

    choice: () => {

    },
    
    random: (min, max) => {
      if (!randomNumberGenerator) {
        throw new Error (`You need to enable the SeedRandom plugin to use this feature.`)
        return
      }
      min = Math.ceil(min)
      max = Math.floor(max)
      return Math.floor( randomNumberGenerator() * (max - min + 1) ) + min
    },

    pick: () => {

    },

    seed: (s) => {
      if (!Math.seedrandom) {
        throw new Error (`You need to enable the SeedRandom plugin to use this feature.`)
        return
      }
      if (!s && s != 0 && s !== "") {
        randomNumberGenerator = new Math.seedrandom()
        randomSeed = false
      } else {
        randomNumberGenerator = new Math.seedrandom(s)
        randomSeed = s
      }
    },

  } //jin end

  window.jin = jin

  let story

  let mainOutputElement 
 
  function onClick(event) {
    const el = event.target
    if (el.classList.contains("story-choice")) {
      const index = Number(el.getAttribute("data-choiceindex"))
      if (!index && index !== 0) {
        throw new Error("Fatal: button has no valid index.")
      }
      mainOutputElement.innerHTML = ""
      story.selectChoice(index)
    }
  }


  function startP() {
    //jinx.setDebugOption("log")

    jin.createVariableStore("v")

    mainOutputElement = document.getElementById("main")

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

    story = createJinxStory(storyData.content, onError, onStoryEvent)
    if (story.compilationFailed) {
      return
    }
    console.log("%c RESTARTING STORY", "background: yellow; color: black;")
    story.restart()
  }
  

  function createJinxStory(storyContent, onErrorFunc, onStoryEvent) {
    let story = jinx.createNewStory(storyContent, onErrorFunc, onStoryEvent)
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



  function onStoryEvent(type) {
    console.log("JINX EVENT TRIGGERED:", type)
    if (type === "finishedCollecting" || type === "gameEnd") {
      renderStuff()
    }
  }
  
  function preProcessParagraphText(text) {
    text = text.replace(/\$asset\(.*?\)/g, (n) => {
      n = n.replace("$asset(", "").replace(")", "").trim()
      let el = storyData.assetsData.assets[n]
      //$asset(asset "${n}" does not exist)
      if (!el) return ""
      return el.data
    })
    return text
  }

  function renderStuff() {
    let contents = story.getContents()
    if (contents && contents.error) return
    let choices = contents.choices
    let paragraphs = contents.paragraphs
    let delay = 0
    const delayInterval = 30
    if (!paragraphs) return
    //console.log(222, paragraphs)
    for (let p of paragraphs) {
      setTimeout( () => {
        let el = document.createElement("div") //divs are more powerful than p
        el.classList.add("story-paragraph")
        const text = preProcessParagraphText(p.text)
        el.innerHTML = text
        mainOutputElement.appendChild(el)
      }, delay)
      delay += delayInterval
    }

    let index = -1
    for (let c of choices) {
      setTimeout( () => {
        index++
        let cl = "choice-mid"
        if (index === 0) cl = "choice-first"
        if (index === choices.length - 1) cl = "choice-last"
        if (choices.length === 1) cl = "choice-only-one"        
        let el = document.createElement("button")
        mainOutputElement.appendChild(el)
        el.outerHTML = `<button
          class="story-choice ${cl}"
          data-choiceindex='${c.index}'>${c.text}</button>`
      }, delay)
      delay += delayInterval
    }

  }

})()

