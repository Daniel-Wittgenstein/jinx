
/*
usage:
  let str = `String containining your story in Jinx code.`
  let story = jinx.createNewStory(str, (err) => {console.log("error occurred:", err)}, storyEventFunc)
  story.restart b ()
*/

jinx = (function() {

  function isString(x) {
    return x + "" === x
  }

  const debug = {
    log: false,
    logFlow: false,
    compilationTime: false,
    turtle: false,
    turtleSpeed: 10,
  }

  const GLUESYMBOL = "<>"

  class Story {
    constructor(str, onError, onEvent) {

      if (!isString(str)) throw new Error(`Jinx story must be passed a string.`)

      this.securityMax = 2000 //max elements per turn to prevent infinite loops
      this.onError = onError
      this.onEvent = onEvent
      let res = this.initStory(str)
      if (res.error) {
        res.type = "compile error"
        this.invalid = true
        onError(res)
        const nope = () => {
          throw `Story failed to compile. Cannot call this method.`
        }
        this.getState = nope
        this.setState = nope
        this.restart = nope
        this.selectChoice = nope
        this.compilationFailed = true
        return
      }
      
    }

    initStory(a) {

      const timerString = "Jinx story compilation - total time"

      if (debug.compilationTime) {
        console.time(timerString)
      }

      let result

      a = normalizeWhitespace(a)

      if (debug.compilationTime) {console.time("tokenize time")}
      let lines = tokenize(a)
      if (debug.compilationTime) {console.timeEnd("tokenize time")}

      if (lines.error) return lines

      if (lines.length === 0) {
        return {
          error: true,
          lineNr: -1000,
          lineObj: false,
          msg: `Empty story.`
        }
      }

      if (debug.compilationTime) {console.time("insert dummy lines time")}
      result = insertDummyLines(lines)
      if (debug.compilationTime) {console.timeEnd("insert dummy lines time")}


      if (result.error) return result
      lines = result.lines

      //assign INTERNAL line numbers:
      let i = -1
      lines = lines.map( n => {i++; n.internalLineNr = i; return n})

      if (debug.compilationTime) {console.time("annotate lines")}
      result = annotateLines(lines)
      if (result.error) return result
      this.jumpTable = result.jumpTable
      lines = result.lines
      if (debug.compilationTime) {console.timeEnd("annotate lines")}

      if (debug.compilationTime) {console.time("annotate levels")}
      lines = annotateLevels(lines)
      if (lines.error) return lines
      if (debug.compilationTime) {console.timeEnd("annotate levels")}

      if (debug.compilationTime) {console.time("annotate gathers")}
      lines = annotateGathers(lines)
      if (lines.error) return lines
      if (debug.compilationTime) {console.timeEnd("annotate gathers")}
      
      if (debug.compilationTime) {console.time("annotate choices")}
      lines = annotateChoices(lines)
      if (lines.error) return lines
      if (debug.compilationTime) {console.timeEnd("annotate choices")}

      if (debug.compilationTime) {console.time("annotate blocks")}
      lines = annotateBlocks(lines)
      if (lines.error) return lines
      if (debug.compilationTime) {console.timeEnd("annotate blocks")}

      this.lines = lines

      if (debug.compilationTime) {
        console.timeEnd(timerString)
      }

      //console.log(lines)
      return {success: true}
    }

    setState() {
      //public
      if (!this.inited) throw `Call story.restart() first.`
    }
    
    getState() {
      //public
      if (!this.inited) throw `Call story.restart() first.`  
    }


    getContents() {
      //public
      const pars = this.internalGetParagraphs(this.paragraphBuffer)
      //console.log(pars)
      return {
        choices: this.choices,
        paragraphs: pars,
      }
    }

    selectChoice(index) {
      //public
      //pass: choiceIndex
      //returns: new content to output
      //updates state according to selected choice

      this.previouslyExecutedLine = false

      if (debug.logFlow) console.log("SELECTED CHOICE", index)
      if (!this.inited) throw `Call story.restart() first.`
      
      let ch = this.choices[index]
      this.securityCounter = 0

      if (!ch) {
        this.rtError(-666, `Choice with index ${index} does not exist.`)
        return
      }

      this.flushGatherState()

      this.doContinueFromChoice(ch)
      //set pointer etc.
    }

    doContinueFromChoice(choice) {
      let i = choice.internalLineNr
      let line = this.lines[i]
      //console.log(choice, i , line)
      if (!line) {
        this.rtError(choice.lineNr, `Line/choice does not exist?`)
        return
      }

      console.log("doContinueFromChoice, CONTINUING AT LINE", i + 1)
      this.pointer =  i + 1
      this.executeLine(this.pointer)
    }
    
    restart() {
      //public
      //(re)starts story from the beginning
      this.flushGatherState()
      this.flushStoryState()
      this.pointer = 0
      this.inited = true
      this.securityCounter = 0
      this.previouslyExecutedLine = false
      //console.log("restart, executing line now: ", this.pointer) //, this.lines[this.pointer])
      this.executeLine(this.pointer)
    }  

    flushStoryState() {
      this.usedUpChoices = {}
    }

    flushGatherState() {
      this.paragraphBuffer = []
      this.choices = []
      this.lastGlueSet = false
    }

    rtError(index, msg, lineNrMode = true) {
      /* lineNrMode
        true (default): pass index of line in line array as first parameter
        false: pass actual line number in code
      
      */
      let line
      if (lineNrMode) {
        line = this.lines[index]
      } else {
        line = this.lines.filter(l => l.lineNr === index)[0]
      }
      let lnr
      let legal = true
      if (line) {
        lnr = line.lineNr
      } else {
        lnr = -555
        legal = false
      }
      
      this.onError({
        error: true,
        type: "runtime error",
        lineNr: lnr,
        lineObj: line,
        msg: msg,
        legal: legal,
        legalMsg: legal ? "Ok" : "Line does not exist?"
      })
    }



    capitalize(n) {
      return n.substr(0, 1).toUpperCase() + n.substr(1)
    }






    executeLine(index) {

      if (index >= this.lines.length) {
        this.rtError(index, `I reached the last line of the story. ` +
          `I was expecting an .endgame command before that.`)
        return
      }

      this.securityCounter ++
      //assuming this is the correct line to run. no level checks etc. here.
      let line = this.lines[index]
      //console.log("EXECUTING LINE with index:", index, "line:", line)

      if (this.securityCounter >= this.securityMax) {
        this.rtError(index, "Max. recursion exceeded. Do you have an infinite loop?")
        return
      }

      if (debug.turtle) {
        //turtle does IO. Normally, of course,
        //Jinx should NEVER do IO, but this is just for debugging purposes.
        document.body.innerHTML += `EXECUTING LINE ${line.lineNr || line.type}: ${line.text}<br>`
      }


      if (debug.log) console.log("running line", index, line)
      
      if (!line) {
        //this.rtError(index, "Line does not exist.")
        console.log("Line is: ", line, "index:", index)
        throw `Line does not exist`
      }

      if (!line.type) {
        console.log(line, line.type)
        throw `Line has no type.`
      }

      const acc = "exec" + this.capitalize(line.type.replaceAll("-", ""))
      let func = this[acc]
      if (!func) throw `No execution method for line type: ${line.type} @ ${acc}`
      let result = func.bind(this)(line, this.previouslyExecutedLine)

      this.previouslyExecutedLine = line
      let testGameJustEnded = false

      if (result === "advanceByOne") {
        if (line.continuation) {
          this.pointer = line.continuation
        } else {
          this.pointer += 1
        }
      }

      if (result && result.jumpTo) {
        this.pointer = result.jumpTo
      }

      if (result && result.error) {
        this.rtError(index, result.msg)
        return
      }

      if (result === "gameEnd") {
        console.log("%c GAME ENDED", "background: blue; color: white")
        this.onEvent("finishedCollecting")
        return
      }

      if (result === "stopRunning") {
        console.log("%c STOPPED RUNNING", "background: blue; color: white")
        this.onEvent("finishedCollecting")
        return
      }

      if (!result) {
        throw new Error(`Execution method ${acc} should have returned something, not falsey value.`)
        return
      }

      if (debug.turtle) {
        setTimeout( () => this.executeLine(this.pointer), debug.turtleSpeed)
      } else {
        this.executeLine(this.pointer)
      }
      

    }

    //execJsstart(line) {}



    
    internalGetParagraphs(buffer) {
      //this processes the paragraphBuffer list into the actual paragraph list:

      //do not modify buffer directly, instead clone it:
      let list = buffer.map(n => n)

      //1. if the first item is an empty line, remove it / if the last
      //item is an empty line, remove it:
      list = list.filter( (item, index) => {
          if (index === 0 && item.type === "empty-line") return false
          if (index === list.length - 1 && item.type === "empty-line") return false          
          return true
        }
      )

      //2. collapse duplicate glue tokens into one:
      list = utils.filterIfPrevious(list, (prev, item) => {
        if (prev.type === "glue" && item.type === "glue") return false
        return true
      })


      //3. if an empty line is preceded by a glue token,
      //remove the empty line entirely (it has no meaning. duplicate empty lines
      //should never occur, that is taken care of beforehand) same if
      //the empty line is followed by a glue token.
      list = utils.filterIfPrevious(list, (prev, item) => {
        if (prev.type === "glue" && item.type === "empty-line") return false
        return true
      })

      list = utils.filterIfNext(list, (item, next) => {
        if (item.type === "empty-line" && next.type === "glue") return false
        return true
      })

      /* 4. create the paragraph list and first paragraph item
        then loop through the list of items:
        if text line:
          add it to the current paragraph (last paragraph in list) content + add a space
        if empty line
          create a new paragraph and push it onto the paragraph list
        if glue token
          remove last space from paragraph content
      */
      
      let paragraphs = [{text: ""}]

      for (let item of list) {
        if (item.type === "text") {
          const currentParagraph = paragraphs[paragraphs.length - 1]
          currentParagraph.text += item.text + " "
        } else if (item.type === "empty-line") {
          paragraphs.push({text: ""})
        } else if (item.type === "glue") {
          const currentParagraph = paragraphs[paragraphs.length - 1]
          if (currentParagraph.text.length) {
            if (currentParagraph.text[currentParagraph.text.length - 1] !== " ") {
              throw new Error `Glue error. Paragraph should end with space.`
            }
            currentParagraph.text = currentParagraph.text.substr(0, currentParagraph.text.length - 1) //VS code
            //likes to strike-through the substr, but that's nonsense.
          }
        } else {
          throw new Error("Illegal paragraph type.")
        }
      }

      //5. remove empty paragraphs:
      paragraphs = paragraphs.filter(n => n.text)

      return paragraphs
    }


    execEmpty(line) {
      //empty line (paragraph delimiter)
      this.paragraphBuffer.push({type: "empty-line"})
      return "advanceByOne"
    }
 
    execText(line) {
      let text = line.text
      let startGlue = false
      let endGlue = false
      if (text.startsWith(GLUESYMBOL)) {
        text = text.substr(2)
        startGlue = true
      }
      if (text.endsWith(GLUESYMBOL)) {
        text = text.substr(0, text.length - 2)
        endGlue = true
      }
      if (startGlue) this.paragraphBuffer.push({type: "glue"})
      this.paragraphBuffer.push({type: "text", text})
      if (endGlue) this.paragraphBuffer.push({type: "glue"})
      return "advanceByOne"
    }

    execLabel(line) {
      //nothing at the moment
      return "advanceByOne"
    }

    execIf(line) {
      const str = `____asj22u883223232jm_ajuHH23uh23hhhH__**~§@€` //prevent collision
      window[str] = false
      try {
        eval (`window["${str}"] = ( ` + line.text+ " )" )
      } catch(err) {
        this.rtError(line.lineNr, "if-condition: JavaScript threw an error. Is this a valid condition?"+
          `<br>${err}`, false)
        return "stopRunning"
      }
      let target = false
      if (!window[str]) {
        console.log("if condition failed")
        //condition failed:
        //jump to corresponding else, if there is one, otherwise to corresponding end
        if (line.correspondingElse) {
          console.log("else exists", line.correspondingElse)
          target = line.correspondingElse
        } else {
          target = line.correspondingEnd
        }
      } else {
        console.log("if condition succeeded")
        //condition succeeded
        return "advanceByOne"
      }

      if (!target) {
        this.rtError(line.lineNr, 'if-condition seems to have no valid "end" command.')
        return
      }
      
      //console.log("execIf, going to", target)
      return {jumpTo: target}
    }
    
    execElse(line) {
      //jump to corresponding end
      if (!line.correspondingEnd) throw new Error(`else has no if/end block? This should not happen.`)
      const target = line.correspondingEnd
      console.log("exec else jump to", target)
      return {jumpTo: target}
    }
    
    execEnd(line) {
      //nothing at the moment
      return "advanceByOne"
    }

    execChoice(line) {
      //populate this.choices with choice objects containing choice text
      //assumes that lineNr of choice is unique, which it really should be
      //unless there is a serious bug

      if (this.previouslyExecutedLine && this.previouslyExecutedLine.level !==
        line.level) {
          return {
            error: true,
            msg: `Encountered choice of wrong level. Maybe you forgot a gather?`,
          }
      }

      if (!line.nextChoiceOfSameLevel) {
        console.log("erroneous line:", line)
        throw new Error(`Fatal. Choice has no nextChoiceOfSameLevel.`)
      }

      let choice = {
        text: line.text,
        level: line.level,
        subType: line.subType,
        index: this.choices.length,
        internalLineNr: line.internalLineNr,
      }
      this.choices.push(choice)


      if (line.nextChoiceOfSameLevel === "endBlock") {
        return "stopRunning"
      }

      return {jumpTo: line.nextChoiceOfSameLevel}
    }

    log(msg) {
      //if (!debug.log) return
      console.log("%c " + msg, "background: pink; color: black;")
    }


    execSinglelinejs(line) {
      //console.log("exec single line js", line)
      try {
        eval(line.text)
      } catch(err) {
        this.rtError(line.lineNr, `I executed a single JS line and ran into an error. This is the line:` +
          `\n${line.text}`)
      }
      return "advanceByOne"
    }

    execGoto(line) {
      const target = this.jumpTable[line.target]
      if (!target && target !== 0) {
        return {
          error: true,
          msg: `.goto ${line.target}: I didn't find a knot or label with this name.`,
        }
      }
      return {jumpTo: target + 1}
    }

    execKnot(line) {
      return "stopRunning"
    }
    
    execEndgame(line) {
      return "gameEnd"
    }

    execGather(line) {
      return "advanceByOne"
    }

    

    execVoid() {
      //dummy lines. do absolutely nothing
      return "advanceByOne"
    }



  } //Class story


  function insertDummyLines(lines) {
    let nu = []
    for (let line of lines) {
      nu.push(line)
      if (line.type === "choice") {
        nu.push({
          type: "void",
          level: line.level + 1,
        })
      }
    }
    return {
      lines: nu,
      error: false,
    }
  }


  //####################
  //####################

  function getNextLine(lines, line, lineIndex, jumpTable) {
    //TODO TO DO: delete once everything else is done. only here for reference anymore.
    //pass lines line and lineIndex, get back index of next line to execute
    //returns "no-continuation" if there is no next line (flow runs out,
    //basically; there is no gather to catch)
    // returns "finished-collecting" if, for example it's the last choice in a knot
    //(so a legal end-of-flow, basically)
    //todo to do: also handle blocks: if else end for each loop js
    if (line.continuation || line.continuation === 0) {
      //if (debug.logFlow) console.log("line", lineIndex, "has continuation of", line.continuation)
      return line.continuation
    }
    if (line.type === "choice") {
      //search for next choice at same level
      //until you find an element with a lower level,
      //or a knot, or a gather with the same level
      for (let i = lineIndex + 1; i < lines.length; i++) {
        //console.log("query", i, lines[i])
        let queriedLine = lines[i]
        if (queriedLine.level < line.level ||
          queriedLine.type === "knot" ||
          (queriedLine.type === "gather" && queriedLine.level === line.level)
          ) {
          //console.log("finished collecting")
          return "finished-collecting"
        }

        if (queriedLine.level === line.level) {
          return i
        }
      }
      return
    }

    let nextLine = lines[lineIndex + 1]
    if (!nextLine) return "no-continuation"
    if (nextLine.type === "knot") return "no-continuation"
    return lineIndex + 1
  }



  function annotateBlocks(lines) {
    function An(str) {
      const char = str.substr(0, 1).toLowerCase()
      if (["a", "e", "i", "o", "u"].includes(char)) {
        return "An"
      }
      return "A"
    }

    function getUnclosedBlockError(stack, line) {
      let lastLine = stack[stack.length - 1]
      let txt = 
        `${stack.length} unclosed block${stack.length > 1 ? "s" : ""}. `+
        `${An(lastLine.type)} ${lastLine.type} block was opened on ` +
        `line ${lastLine.lineNr} and ` + 
        `it should have been closed before line ${line.lineNr}.`
      return {
        error: true,
        lineNr: line.lineNr,
        lineObj: line, 
        msg: txt,
      }
    }

    //if for each loop end endjs else processing
    let currentLevel = -1000
    let stack = []
    let index = -1
    for (let line of lines) {
      index ++
      let t = line.type
      if (line.level !== currentLevel) {
        if (stack.length) {
          return getUnclosedBlockError(stack, line)
        }
        stack = []
      }
      
      if (
        t === "if" ||
        t === "loop" ||
        t === "each" ||
        t === "for" ||
        t === "js-start"
      ) {
        stack.push(line)
      } else if (t === "else") {
        let lastLine = stack[stack.length - 1]
        if (!lastLine) {
          return {
            error: true,
            lineNr: line.lineNr,
            lineObj: line,
            msg: `I found an ".else" line, but there was no ".if" line before that, so it makes no sense to me.`,
          }
        }
        lastLine.correspondingElse = line.lineNr
        lastLine.correspondingElseObj = line
        if (lastLine.type !== "if") {
          return {
            error: true,
            lineNr: line.lineNr,
            lineObj: line, 
            msg: `".else" may only appear inside an ".if" block`,
          }
        }
        line.correspondingIf = lastLine.lineNr
      } else if (t === "end" || t === "js-end") {
        let lastLine = stack[stack.length - 1]
        if (!lastLine) {
          return {
            error: true,
            lineNr: line.lineNr,
            lineObj: line,
            msg: `I found an ".end" or ".jsend" line, but there was no block to close, so it makes no sense to me.`,
          }
        }
        if (t === "js-end" && lastLine.type !== "js-start") {
          return {
            error: true,
            lineNr: line.lineNr,
            lineObj: line, 
            msg: `A normal block should be closed with ".end", not with ".jsend".`,
          } 
        }
        if (t === "end" && lastLine.type === "js-start") {
          return {
            error: true,
            lineNr: line.lineNr,
            lineObj: line, 
            msg: `A ".js" block should be closed with ".jsend", not with "end".`,
          }    
        } 
        if (!stack.length) {
          return {
            error: true,
            lineNr: line.lineNr,
            lineObj: line, 
            msg: ` I found ".end", but there is no block to close.`,
          }  
        }
        let last = stack.pop()
        last.correspondingEnd = line.lineNr
        if ( t === "end" ) {
          const lastIf = last
          if (lastIf.correspondingElseObj) {
            lastIf.correspondingElseObj.correspondingEnd = line.lineNr
            delete lastIf.correspondingElseObj //not needed anymore
          }
        }
      }
      currentLevel = line.level
    }
    //console.log("stack", stack, stack.length, JSON.stringify(stack[0]))

    if(stack.length) {
      const lastLine = stack[stack.length - 1]
      let txt = 
        `${stack.length} unclosed block${stack.length > 1 ? "s" : ""}. `+
        `${An(lastLine.type)} ${lastLine.type} block was opened on ` +
        `line ${lastLine.lineNr} and ` + 
        `should have been closed.`
      return {
        error: true,
        lineNr: lastLine.lineNr,
        lineObj: lastLine, 
        msg: txt,
      }
    }


    return lines
  }


  function tokenize(str) {
    let lastLineWasEmpty = false
    let lines = str.split("\n").map( (line, i) => {
      let type = false
      let subType = false
      line = line.trim()

      if (line === "") {
        if (lastLineWasEmpty) {
          return false
        } else {
          lastLineWasEmpty = true
          type = "empty"
        }
      } else {
        lastLineWasEmpty = false
      }

      if ( line.startsWith("===") ) {
        type = "knot"
      } else if ( line.startsWith("=") ) {
        type = "label"
      } else if ( line.startsWith("*") ) {
        type = "choice"
        subType = "once"
      } else if ( line.startsWith("+") ) {
        type = "choice"
        subType = "multi"
      } else if ( line.startsWith("-") ) {
        type = "gather"
      } else if ( line.startsWith("#") ) {
        type = "single-line-js"
      } else if ( line.startsWith(".goto ") || line.startsWith(".g ")
        || line.startsWith("->") ) {
        type = "goto"
      } else if ( line.startsWith("//") ) {
        //comment
        return false
      } else if (line.startsWith(".")) {
        let res = getDotCommandType(line)
        if (!res) {
          return {
            error: true,
            msg: `Unknown dot command: ${line}`,
            lineNr: i + 1,
            lineObj: false,
          }
        }
        type = res
      } else if (type !== "empty") {
        type = "text"
      }
      return {
        type: type,
        subType: subType,
        text: line,
        lineNr: i + 1, //(starting from 1 not 0)
      }
    })
      //lines = lines.filter( n => n ) NO! JUST NO!
    lines = lines.map ( n => {
      if (!n) return {
        type: "empty"
      }
      return n
    })
    for (let line of lines) {
      const res = checkLineSyntax(line)
      if (res) return {
        error: true,
        msg: res,
        lineNr: line.lineNr,
        lineObj: line,
      }
    }
    return lines
  }

  function checkLineSyntax(line) {
    //return falsey value for: everything fine
    //and string for error occurred, show this error message.
    //each line has to go through here
    const type = line.type
    const mustBeSingle = new Set(["else", "js", "jsend", "end", "endgame"])
    if ( mustBeSingle.has(type) ) {
      const wordAmount = line.text.replace(".", "")
        .trim().split(" ").map(n => n.trim()).filter(n => n).length  
      if (wordAmount > 1) {

        return `${type} line cannot contain additional text. I saw ${wordAmount} words on that line, 
        but only the first one makes sense to me.`
      }
    }
    return false
  }


  function getDotCommandType(line) {
    //return falsey, if not a valid dot command,
    //else return string representing the type
    let type = false
    line = line.replace(".", "").trim()

    const firstWord = line.split(" ").map(n => n.trim()).filter(n => n)[0]

    if ( firstWord === "js" ) {
      type = "js-start"
    } else if ( firstWord === "jsend" ) {
      type = "js-end"
    } else if ( firstWord === "if" ) {
      type = "if"
    } else if ( firstWord === "else" ) {
      type = "else"
    } else if (firstWord === "end" ) {
      type = "end"
    } else if ( firstWord === "each " ) {
      type = "each"
      type = false //currently not supported
    } else if ( firstWord === "loop " ) {
      type = "loop"
      type = false //currently not supported
    } else if ( firstWord === "for " ) {
      type = "for"
      type = false //currently not supported
    } else if ( firstWord === "choice " ) {
      type = "make-choice"
    } else if ( firstWord === "set ") {
      type = "set"
    } else if ( firstWord === "endgame") {
      type = "end-game"
    }
    return type
  }


  function annotateLines(lines) {
    function annotateLine(line, index) {
      //line.index = index
      if (line.type === "knot" || line.type === "label") {
        line.name = line.text.replaceAll("=", "").trim()
        let n = jumpTable[line.name]
        if (n || n === 0) return {
          error: true,
          lineNr: line.lineNr,
          lineObj: line,
          msg: `${line.name}': duplicate knot/label name`,
        }
        jumpTable[line.name] = index
      } else if (line.type === "goto") {
        line.target = line.text
          .replace(".", "")
          .replace("g ", "")
          .replace("goto ", "")
          .replace("->", "")
          .trim()
      } else if (line.type === "choice" || line.type === "gather") {
        let targetChar = "+"
        if (line.subType === "once") targetChar = "*"
        if (line.type === "gather") targetChar = "-"
        let count = 0
        let index = -1
        for (let char of line.text) {
          index ++
          if (char.trim() === "") continue
          if (char === targetChar) {
            count ++
            continue
          }
          line.text = line.text.substr(index)
          break
        }
        line.level = count
      } else if (line.type === "if") {
        line.text = line.text.replace(".if", "").trim()
      } else if (line.type === "each") {
        line.text = line.text.replace(".each", "").trim()
      } else if (line.type === "loop") {
        line.text = line.text.replace(".loop", "").trim()
      } else if (line.type === "for") {
        line.text = line.text.replace(".for", "").trim()
      } else if (line.type === "choice") {
        line.text = line.text.replace(".choice", "").trim()
      } else if (line.type === "set") {
        line.text = line.text.replace(".set", "").trim()
      } else if (line.type === "single-line-js") {
        line.text = line.text.replace("#", "").trim()
      }
    
      return line
    }

    let jumpTable = {}
    let i = -1
    for (let line of lines) {
      i++
      let res = annotateLine(line, i)
      if (res.error) {
        return res
      }
      lines[i] = line
    }
    return {
      lines: lines,
      jumpTable: jumpTable,
    }
  }


  function annotateLevels(lines) {
    //add level info to lines:
    let level = 1
    for (let line of lines) {
      if (line.type === "knot") {
        line.level = 1
        level = 1
      } else if (line.type === "gather") {
        level = line.level
      } else if (line.type === "choice") {
        level = line.level + 1
      } else {
        line.level = level
      }
    }
    return lines
  }

  function annotateChoices(lines) {
    /* 
      Here's what happens:
      We walk from top to bottom.

      If we meet a choice:
      - l is the level of this choice
      - all choices with level higher than l (so 3, 4, 5 etc.,
      if choice is 2, for example) in the hashmap get a nextChoiceOfSameLevel
      of "endBlock", because they are the last choices in their block,
      since the lower-level choice indicated that their block was closed.
      - if the hashmap entry lastChoiceOfLevel[l]
        points to a choice, then that choice gets nextChoiceOfSameLevel = the current index
        (if not, it must be the first choice in the block)
      - the hashmap entry lastChoiceOfLevel[l] becomes a reference to the current choice

      If we meet a gather:
      - l is the level of the gather
      - all choices in the hashmap with level higher than l OR EQUAL TO l get a nextChoiceOfSameLevel
        of "endBlock"
      
      If we meet a knot start:
      - clear the hashmap

      No idea, if this approach is correct. Implement and test.
    */

    let i = -1
    const lastChoiceByLevel = []
    let lastChoiceLevel = -1
    for (let line of lines) {
      i++
      const index = i
      if (line.type === "choice") {
        const level = line.level
        const diff = level - lastChoiceLevel
        if (lastChoiceLevel > 0 && diff > 1) {
          return {
            lineNr: line.lineNr,
            error: true,
            msg: `I found a jump from choice level ${lastChoiceLevel} to choice level ${level}. `+
            `I was expecting at least one level ${lastChoiceLevel + 1} choice in between, `+
            `otherwise it makes no sense.`,
          }
        }
        let i = level
        while (true) {
          i++
          const entry = lastChoiceByLevel[i]
          if (!entry) break
          entry.nextChoiceOfSameLevel = "endBlock"
        }
        const prevLine = lastChoiceByLevel[line.level]
        if (prevLine) {
          prevLine.nextChoiceOfSameLevel = line.internalLineNr
        }
        lastChoiceByLevel[line.level] = line
        lastChoiceLevel = line.level
      //####################################
      } else if (line.type === "gather") {
        const level = line.level
        let i = line.level - 1
        while (true) {
          i++
          const entry = lastChoiceByLevel[i]
          if (!entry) break
          entry.nextChoiceOfSameLevel = "endBlock"
        }
      //####################################
      } else if (line.type === "knot" || index >= lines.length - 1 ) {
        const level = line.level
        let i = 0
        while (true) {
          i++
          const entry = lastChoiceByLevel[i]
          if (!entry) break
          entry.nextChoiceOfSameLevel = "endBlock"
          lastChoiceByLevel[i] = false
        }
      }
    } //for each lines

    return lines

  }

  function annotateGathers(lines) {
    function getNextGather(lines, startIndex, maxLevel) {
      //maxLevel: level must be lower than or equal to this
      for (let i = startIndex; i < lines.length; i++) {
        let line = lines[i]
        if (line.type === "gather" && line.level <= maxLevel) {
          return {index: i}
        }
      }
      return false
    }

    //now walk through lines. whenever the level
    //gets lower (numerically, so from 2 to 1, from 4 to 2 etc.), look for a lower
    //or equal-level gather and
    //connect the line to that gather

    let i = -1

    for (let line of lines) {
      i++
      let nextLine = lines[i + 1] || false

      if (!nextLine) continue

      //console.log("walking to", i, line)

      let mode = false
      
      if (nextLine.level < line.level) {
        //console.log("nextLine.level:", nextLine.level, "line.level:", line.level)
        mode = true //"addContinuation"
      }

      if (mode) {
        let gather = getNextGather(lines, i + 1, line.level - 1)
        if (!gather) {
          line.continuation = "no-continuation"
          //console.log("line", line.lineNr, line.text, "gets gathered : never")
        } else {
          //console.log("connecting line", i, ":", line, "to line", gather.index, lines[gather.index] )
          line.continuation = gather.index
          //console.log("line", line.lineNr, line.text, "gets gathered at", lines[gather.index])
        }
      }

    }

    return lines
  }

  function normalizeWhitespace(str) {
    return str.replace(/\t/g, " ")
  }


  function createNewStory(... args) {
    return new Story(... args)
  }


  function setDebugOption(option, value = true) {
    //value should be true or false, option should be string
    debug[option] = value
  }

  return {
    createNewStory,
    setDebugOption,
  }

})()

