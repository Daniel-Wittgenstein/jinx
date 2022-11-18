


/* everything we kicked out while re-writing
runner.js so far, insane amount of stuff

IO is hard

*/



function preProcessParagraphText(text) {
  const effectList = registeredEffects.paragraphText
    .concat(registeredEffects.allText).sort(
      (a, b) => {
        return a.order - b.order
      }
    )
  text = pipeThroughFuncList(text, effectList, "func")
  return text
}

function preProcessChoiceText(text) {
  const effectList = registeredEffects.choiceText
    .concat(registeredEffects.allText).sort(
      (a, b) => {
        return a.order - b.order
      }
    )
  text = pipeThroughFuncList(text, effectList, "func")
  return text
}



/*
  function renderStuff() {
    let contents = story.getContents()
    if (contents && contents.error) return
    let choices = contents.choices
    let paragraphs = contents.paragraphs
    let delay = 0
    let delayInterval = delayParagraphs
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

    delayInterval = delayChoices
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
        const ttext = preProcessChoiceText(c.text)
        el.outerHTML = `<button
          class="story-choice ${cl}"
          data-choiceindex='${c.index}'>${ttext}</button>`
      }, delay)
      delay += delayInterval
    }

  }

*/

  
function renderOutputContainers(contents, customDelayText = -1, customDelayChoices = -1) {
  //for each output container:
  //call container.getRenderedHtml
  //use return string to add container to dom and show with delay
  //but delay should actually be optional/opt-out flag to pass to this function
  //after loading state, renderoutputContainers can be called without
  //render delay!
  //todo to do

  //actually do this:
  //call story.getContents
  //then convert to html, then render dom elements
  //but render them to correct dom targets:
  //either to container with item.meta.output id
  //or if no id, then to standard "main" or if id
  //is invalid, throw user error

  let choices = contents.choices
  let paragraphs = contents.paragraphs
  let delay = 0
  let delayInterval = delayParagraphs
  if (customDelayText >= 0) delayInterval = customDelayText
  if (!paragraphs) return //rly?
  //console.log(222, paragraphs)
  for (let p of paragraphs) {
    setTimeout( () => {
      let el = document.createElement("div") //divs are more powerful than p
      el.classList.add("story-paragraph")
      const text = preProcessParagraphText(p.text)
      el.innerHTML = text
      outputElement.appendChild(el)
    }, delay)
    delay += delayInterval
  }
  delayInterval = delayChoices
  if (customDelayChoices >= 0) delayInterval = customDelayChoices
  let index = -1
  for (let c of choices) {
    setTimeout( () => {
      index++
      let cl = "choice-mid"
      if (index === 0) cl = "choice-first"
      if (index === choices.length - 1) cl = "choice-last"
      if (choices.length === 1) cl = "choice-only-one"        
      let el = document.createElement("button")
      outputElement.appendChild(el)
      const ttext = preProcessChoiceText(c.text)
      el.outerHTML = `<button
        class="story-choice ${cl}"
        data-choiceindex='${c.index}'>${ttext}</button>`
    }, delay)
    delay += delayInterval
  }

}


function writeTurnDelimiterToOutputContainers() {
  outputManagerSingletonInstance.writeTurnDelimiterToOutputContainers()
}

function trimOutputContainers() {
  outputManagerSingletonInstance.trimOutputContainers()
  //todo to do: remove ALL old choices
}

class outputManager {
  constructor() {
    this.registeredContainers = {}
  }

  trimOutputContainers() {
    for ( let key of Object.keys(this.registeredContainers) ) {
      const container = this.registeredContainers[key]
      container.trim()
    }
  }

  writeTurnDelimiterToOutputContainers() {
    for ( let key of Object.keys(this.registeredContainers) ) {
      const outputContainer = this.registeredContainers[key]
      outputContainer.addContent({
        type: "turnDelimiter",
      })
    }
  }

  createOutputContainer(domId, options) {
    if (this.registeredContainers[domId]) {
      throw new Error(`output container with id '${domId} exists already.'`)
    }
    const oc = new outputContainer(domId, options)
    this.registeredContainers[domId] = oc
  }

  getState() {
    return {
      registeredContainers: this.registeredContainers,
    }
  }

  setState(state) {
    this.registeredContainers = state.registeredContainers
  }

}


const outputManagerSingletonInstance = new outputManager()

function getChoiceHtml(text, index, cssClass) {
  const html = `<button
    class="story-choice ${cssClass}"
    data-choiceindex='${index}'>${text}</button>`
  return html
}

function getParagraphHtml(text) {
  return `<div class="story-paragraph">${item.text}</div>`
}

function getTurnDelimiterHtml() {
  return `<div style="border: 1px solid black; width: 100%; height: 1px;"></div>`
}

//#############

class outputContainer {
  constructor(domId, options = {scrollBack: 3}) {
    this.id = domId
    this.content = []
    this.options = options
  }

  trim() {
    let scrollback = this.options.scrollBack
    if (!scrollback && scrollback !== 0) {
      throw new Error(`outputContainer "${this.id}" has no valid scrollback value`)
    }
    //scrollback is the amount of turn delimiters left after trimming
    //as well as the amount of previous turns shown, so scrollback 0 means
    //0 turn delimiters and 0 previous turns (only current turn) will be kept, etc.
    let amount = 0
    let nuContent = []
    for (let i = this.content.length - 1; i > 0; i--) {
      const item = this.content[i]
      if (item.type === "turnDelimiter") {
        amount++
        if (amount === scrollback + 1) {
          break
        }
      }
      nuContent.push(item)
    }
    this.content = nuContent
  }

  addContent(obj) {
    //a content object should be of the type:
    //type: string (either "choice" or "paragraph"
    //or "turnDelimiter".
    //note that paragraph is a div and can contain pretty much any html.)
    //html: string: string containing html (potentially including
    //invalid HTML that will still be replaced by beforeTextRender)
    this.content.push(obj)
  }

  getContent() {
    //returns content array. array may be manipulated (trimmed, for example)
    return this.content
  }

  setContent(array) {
    this.content = array
  }

  getRenderedHtml()  {
    let html = ""
    let choiceIndex = -1
    const choicesAmount = this.content.filter(n => n.type === "choice").length
    for (let item of this.content) {
      if (item.type === "choice") {
        choiceIndex++
        let cl = "choice-mid"
        if (choiceIndex === 0) cl = "choice-first"
        if (choiceIndex === choices.length - 1) cl = "choice-last"
        if (choicesAmount === 1) cl = "choice-only-one"        
        const ttext = preProcessChoiceText(item.text)
        html += getChoiceHtml(ttext, choiceIndex, cl)
      } else if (item.type === "paragraph") {
        html += getParagraphHtml(item.text)
      } else if (item.type === "turnDelimiter") {
        html += getTurnDelimiterHtml()
      } else {
        throw new Error(`getRenderendHtml: content item has invalid type "${item.type}".`)
      }
    }
    //todo to do jage html durch beforerender, weil es für jedes element ausgeführt wird und dann return html


  }

}




function disableAllChoices(container) {
  enableDisableAllChoices(container, false)
}


function enableAllChoices(container) {
  enableDisableAllChoices(container, true)
}

function enableDisableAllChoices(container, mode) {
  const containerDom = document.getElementById(container.id)
  if (!containerDom) throw new Error(`HTML DOM element "${container.id}" does not exist.`)
  const chs = containerDom.getElementsByClassName("story-choice")
  for (let i = 0; i < chs.length; i++) {
    const element = chs[i]
    if (mode) {
      element.removeAttribute("disabled")
    } else {
      element.setAttribute("disabled", true)
    }
  }
}


function removeOldChoices(container) {
  const containerDom = document.getElementById(container.id)
  if (!containerDom) throw new Error(`HTML DOM element "${container.id}" does not exist.`)
  const chs = containerDom.getElementsByClassName("story-choice")
  console.log("nog???", chs)
  for (let i = 0; i < chs.length; i++) {
    const element = chs[i]
    console.log("WTFffff", element)
    element.outerHTML = "fuck"
  }
}



    /* 
      container: pass outputContainer object created via internalCreateContainer
    */
      let filterFunc = () => true
      if (mode === "onlyNewContents") {
        filterFunc = (item) => !item.old
      }
      const paras = container.content.paragraphs.filter(filterFunc)
      const choices = container.content.choices.filter(filterFunc)
      const all = paras.concat(choices)
      let choiceDelay
      let paragraphDelay
      if (options.delay === "overrideContainerDelay") {
        choiceDelay = options.choiceDelay
        paragraphDelay = options.paragraphDelay
      } else if (options.delay === "useContainerDelay") {
        choiceDelay = container.options.choiceDelay || 0
        paragraphDelay = container.options.paragraphDelay || 0      
      } else {
        throw new Error(`renderContainer: Invalid delay option.`)
      }
      actuallyRenderContainer(container, all, paragraphDelay, choiceDelay, completionCallback)
    }
  
    function actuallyRenderContainer(container, content, paragraphDelay, choiceDelay,
        completionCallback) {
  
      function getChoiceHtml(text, index, cssClass, old) {
        const disabled = "disabled"
        if (old) {
          cssClass += " old-choice"
        }
        const html = `<button ${disabled}
          class="story-choice ${cssClass}"
          data-choiceindex='${index}'>${text}</button>`
        return html
      }
      
      function getParagraphHtml(text) {
        return `<div class="story-paragraph">${text}</div>`
      }  
  
      function displayElement(domParent, element, choicesAmount) {
        let htmlString = ``
        if (element.type === "paragraphs") {
          htmlString = getParagraphHtml(element.text)
        } else if (element.type === "choices") {
          choiceIndex ++
          let cl = "choice-mid"
          if (choiceIndex === 0) cl = "choice-first"
          if (choiceIndex === choicesAmount - 1) cl = "choice-last"
          if (choicesAmount === 1) cl = "choice-only-one"
          htmlString = getChoiceHtml(element.text, choiceIndex, cl, element.old)      
        }
        const childElement = htmlStringToDomElement(htmlString)
        domParent.append(childElement)
      }
  
      function finishedShowingAll() {
        completionCallback()
      }
  
      const el = document.getElementById(container.id)
      if (!el) return //todo: catch
        //this when jin.output is called. check for existence of dom element then.
        //even then this could happen, if the story author is irresponsible enough to
        //remove the div in between, but in that unlikely case we just ignore it.
      let time = 0
      let choiceIndex = -1
      const choicesAmount = content.filter(n => n.type === "choices").length
      for (let element of content) {
        setTimeout(() => displayElement(el, element, choicesAmount), time)
        let delay = paragraphDelay
        if (element.type === "choices") {
          delay = choiceDelay
        }
        time += delay
      }
      setTimeout(finishedShowingAll , time - choiceDelay + 10)
    }
  


    //and just to be sure, also hide buttons links and selects:
    removeAll ( oldEl.getElementsByTagName("button") )
    removeAll ( oldEl.getElementsByTagName("a") )
    removeAll ( oldEl.getElementsByTagName("select") )
    
    function removeAll(chs) {
      if (!chs) return
      for (let i = 0; i < chs.length; i++) {
        const element = chs[i]
        element.style.display = "none"
      }
    }