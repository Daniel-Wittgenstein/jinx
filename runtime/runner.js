

;(function() {

  const variableStores = {}

  window.onload = startP

  //provide global hooks for the story author:

  const jin = {
    createVariableStore: (key) => {
      //creates a new global variable store for the story author
      if (window[key]) {
        //note: when calling this from the story, the error
        //will be shown to the user (with correct line number)
        throw new Error(`A variable store called "${key}" exists already.
        (This error happened while calling the function "createVariableStore".)`)
      }
      const store = {
        name: key,
        content: {},
      }
      window[key] = store.content
      variableStores[key] = store
    },

    getVariableStores: () => {
      //author should not normally need this, but it's exposed
      //for completeness
      return variableStores
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
        let el = document.createElement("p")
        el.innerHTML = p.text
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

