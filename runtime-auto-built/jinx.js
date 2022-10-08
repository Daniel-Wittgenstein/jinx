window.runTimeData.jinx = {"Contents":"\n/*\n\ntodo:\n+ once-only choices\n+ if conditions for choices (on same line)\n+ check if block if conditions wrap choices, is so, return error (is not allowed)\n+ api to directly go to paragraph or label and start running from there\nand a js function to go to paragraph or label\nthat can be called WHILE JINX IS RUNNING! -\u003e provided by jinx for any runner to use\n+ expressions between {} are evalled as JS and value is printed.\n\n+ inline choices and each turn functionality are things the runner can provide.\n+ they are not done by jinx\n\n\nusage:\n  let str = `String containining your story in Jinx code.`\n  let story = jinx.createNewStory(str, (err) =\u003e {console.log(\"error occurred:\", err)}, storyEventFunc)\n  story.restart b ()\n*/\n\njinx = (function() {\n\n  function isString(x) {\n    return x + \"\" === x\n  }\n\n  const debug = {\n    log: false,\n    logFlow: true,\n    compilationTime: false,\n    turtle: false,\n    turtleSpeed: 600,\n  }\n\n  const GLUESYMBOL = \"\u003c\u003e\"\n\n  class Story {\n    constructor(str, onError, onEvent) {\n\n      if (!isString(str)) throw new Error(`Jinx story must be passed a string.`)\n\n      this.securityMax = 2000 //max elements per turn to prevent infinite loops\n      this.onError = onError\n      this.onEvent = onEvent\n      let res = this.initStory(str)\n      if (res.error) {\n        res.type = \"compile error\"\n        this.invalid = true\n        onError(res)\n        const nope = () =\u003e {\n          throw `Story failed to compile. Cannot call this method.`\n        }\n        this.getState = nope\n        this.setState = nope\n        this.restart = nope\n        this.selectChoice = nope\n        this.compilationFailed = true\n        return\n      }\n      \n    }\n\n    initStory(a) {\n\n      const timerString = \"Jinx story compilation - total time\"\n\n      if (debug.compilationTime) {\n        console.time(timerString)\n      }\n\n      let result\n\n      a = normalizeWhitespace(a)\n\n      if (debug.compilationTime) {console.time(\"tokenize time\")}\n      let lines = tokenize(a)\n      if (debug.compilationTime) {console.timeEnd(\"tokenize time\")}\n\n      if (lines.error) return lines\n\n      if (lines.length === 0) {\n        return {\n          error: true,\n          lineNr: -1000,\n          lineObj: false,\n          msg: `Empty story.`\n        }\n      }\n\n      if (debug.compilationTime) {console.time(\"insert dummy lines time\")}\n      result = insertDummyLines(lines)\n      if (debug.compilationTime) {console.timeEnd(\"insert dummy lines time\")}\n\n      if (result.error) return result\n      lines = result.lines\n\n      //assign INTERNAL line numbers:\n      let i = -1\n      lines = lines.map( n =\u003e {i++; n.internalLineNr = i; return n})\n\n      if (debug.compilationTime) {console.time(\"annotate lines\")}\n      result = annotateLines(lines)\n      if (result.error) return result\n      this.jumpTable = result.jumpTable\n      lines = result.lines\n      if (debug.compilationTime) {console.timeEnd(\"annotate lines\")}\n\n      if (debug.compilationTime) {console.time(\"annotate levels\")}\n      lines = annotateLevels(lines)\n      if (lines.error) return lines\n      if (debug.compilationTime) {console.timeEnd(\"annotate levels\")}\n\n      if (debug.compilationTime) {console.time(\"annotate gathers\")}\n      lines = annotateGathers(lines)\n      if (lines.error) return lines\n      if (debug.compilationTime) {console.timeEnd(\"annotate gathers\")}\n      \n      if (debug.compilationTime) {console.time(\"annotate choices\")}\n      lines = annotateChoices(lines)\n      if (lines.error) return lines\n      if (debug.compilationTime) {console.timeEnd(\"annotate choices\")}\n\n      if (debug.compilationTime) {console.time(\"annotate blocks\")}\n      lines = annotateBlocks(lines)\n      if (lines.error) return lines\n      if (debug.compilationTime) {console.timeEnd(\"annotate blocks\")}\n\n      this.lines = lines\n\n      if (debug.compilationTime) {\n        console.timeEnd(timerString)\n      }\n\n      console.log(\"################ ALL LINES\", lines)\n      return {success: true}\n    }\n\n    setState() {\n      //public\n      if (!this.inited) throw `Call story.restart() first.`\n    }\n    \n    getState() {\n      //public\n      if (!this.inited) throw `Call story.restart() first.`  \n    }\n\n\n    getContents() {\n      //public\n      const pars = this.internalGetParagraphs(this.paragraphBuffer)\n      //console.log(pars)\n      return {\n        choices: this.choices,\n        paragraphs: pars,\n      }\n    }\n\n    selectChoice(index) {\n      //public\n      //pass: choiceIndex\n      //returns: new content to output\n      //updates state according to selected choice\n\n      index = Number(index)\n\n      this.previouslyExecutedLine = false\n\n      if (debug.logFlow) console.log(\"SELECTED CHOICE\", index)\n      if (!this.inited) throw `Call story.restart() first.`\n      \n      let ch = this.choices[index]\n\n      this.securityCounter = 0\n\n      if (!ch) {\n        this.rtError(-666, `Choice with index ${index} does not exist.`)\n        return\n      }\n\n      this.flushGatherState()\n\n      this.doContinueFromChoice(ch)\n      //set pointer etc.\n    }\n\n    doContinueFromChoice(choice) {\n      let i = choice.internalLineNr\n      let line = this.lines[i]\n\n      this.lastSelectedChoice = line\n\n      //console.log(choice, i , line)\n      if (!line) {\n        this.rtError(choice.lineNr, `Line/choice does not exist?`)\n        return\n      }\n\n      console.log(\"doContinueFromChoice, CONTINUING AT LINE\", i + 1)\n      this.pointer =  i + 1\n      this.executeLine(this.pointer)\n    }\n    \n    restart() {\n      //public\n      //(re)starts story from the beginning\n      this.flushGatherState()\n      this.flushStoryState()\n      this.pointer = 0\n      this.inited = true\n      this.securityCounter = 0\n      this.previouslyExecutedLine = false\n      //console.log(\"restart, executing line now: \", this.pointer) //, this.lines[this.pointer])\n      this.executeLine(this.pointer)\n    }  \n\n    flushStoryState() {\n      this.usedUpChoices = {}\n      this.lastSelectedChoice = false\n    }\n\n    flushGatherState() {\n      this.paragraphBuffer = []\n      this.choices = []\n      this.lastGlueSet = false\n    }\n\n    rtError(index, msg, lineNrMode = true) {\n      /* lineNrMode\n        true (default): pass index of line in line array as first parameter\n        false: pass actual line number in code\n      */\n      let line\n      if (lineNrMode) {\n        line = this.lines[index]\n      } else {\n        line = this.lines.filter(l =\u003e l.lineNr === index)[0]\n      }\n\n      let lnr\n      let legal = true\n      if (line) {\n        lnr = line.lineNr\n      } else {\n        lnr = -555\n        legal = false\n      }\n      \n      this.onError({\n        error: true,\n        type: \"runtime error\",\n        lineNr: lnr,\n        lineObj: line,\n        msg: msg,\n        legal: legal,\n        legalMsg: legal ? \"Ok\" : \"Line does not exist?\"\n      })\n    }\n\n\n\n    capitalize(n) {\n      return n.substr(0, 1).toUpperCase() + n.substr(1)\n    }\n\n\n\n\n\n\n    executeLine(index) {\n\n      if (index \u003e= this.lines.length) {\n        this.rtError(index, `I reached the last line of the story. ` +\n          `I was expecting an .endgame command before that.`)\n        return\n      }\n\n      this.securityCounter ++\n      //assuming this is the correct line to run. no level checks etc. here.\n      let line = this.lines[index]\n      //console.log(\"EXECUTING LINE with index:\", index, \"line:\", line)\n\n      if (this.securityCounter \u003e= this.securityMax) {\n        this.rtError(index, \"Max. recursion exceeded. Do you have an infinite loop?\")\n        return\n      }\n\n      if (debug.turtle) {\n        //turtle does IO. Normally, of course,\n        //Jinx should NEVER do IO, but this is just for debugging purposes.\n        document.body.innerHTML += `EXECUTING LINE ${line.lineNr || line.type}: ${line.text}\u003cbr\u003e`\n      }\n\n      if (debug.log) console.log(\"running line\", index, line)\n      \n      if (!line) {\n        //this.rtError(index, \"Line does not exist.\")\n        console.log(\"Line is: \", line, \"index:\", index)\n        throw `Line does not exist`\n      }\n\n      if (!line.type) {\n        console.log(line, line.type)\n        throw `Line has no type.`\n      }\n\n      const acc = \"exec\" + this.capitalize(line.type.replaceAll(\"-\", \"\"))\n      let func = this[acc]\n      if (!func) throw `No execution method for line type: ${line.type} @ ${acc}`\n      let result = func.bind(this)(line, this.previouslyExecutedLine)\n\n      this.previouslyExecutedLine = line\n      let testGameJustEnded = false\n\n      if (result === \"advanceByOne\") {\n        if (line.continuation) {\n          if (line.continuation === \"no-continuation\") {\n            this.rtError(-1, `The story seems to just stop here. I expected a\n              gather or a goto.\n              This happened after the choice \"${this.lastSelectedChoice?.text}\"\n              at line ${this.lastSelectedChoice?.lineNr}\n              was selected. \n              `, false)\n            return\n          }\n          this.pointer = line.continuation\n        } else {\n          this.pointer += 1\n        }\n      }\n\n      if (result \u0026\u0026 result.jumpTo) {\n        this.pointer = result.jumpTo\n      }\n\n      if (result \u0026\u0026 result.error) {\n        this.rtError(index, result.msg)\n        return\n      }\n\n      if (result === \"gameEnd\") {\n        console.log(\"%c GAME ENDED\", \"background: blue; color: white\")\n        this.onEvent(\"finishedCollecting\")\n        return\n      }\n\n      if (result === \"stopRunning\") {\n        console.log(\"%c STOPPED RUNNING\", \"background: blue; color: white\")\n        this.onEvent(\"finishedCollecting\")\n        return\n      }\n\n      if (!result) {\n        throw new Error(`Execution method ${acc} should have returned something, not falsey value.`)\n        return\n      }\n\n      if (debug.turtle) {\n        setTimeout( () =\u003e this.executeLine(this.pointer), debug.turtleSpeed)\n      } else {\n        this.executeLine(this.pointer)\n      }\n      \n\n    }\n\n    //execJsstart(line) {}\n\n\n\n    \n    internalGetParagraphs(buffer) {\n      //this processes the paragraphBuffer list into the actual paragraph list:\n\n      //do not modify buffer directly, instead clone it:\n      let list = buffer.map(n =\u003e n)\n\n      //1. if the first item is an empty line, remove it / if the last\n      //item is an empty line, remove it:\n      list = list.filter( (item, index) =\u003e {\n          if (index === 0 \u0026\u0026 item.type === \"empty-line\") return false\n          if (index === list.length - 1 \u0026\u0026 item.type === \"empty-line\") return false          \n          return true\n        }\n      )\n\n      //2. collapse duplicate glue tokens into one:\n      list = utils.filterIfPrevious(list, (prev, item) =\u003e {\n        if (prev.type === \"glue\" \u0026\u0026 item.type === \"glue\") return false\n        return true\n      })\n\n\n      //3. if an empty line is preceded by a glue token,\n      //remove the empty line entirely (it has no meaning. duplicate empty lines\n      //should never occur, that is taken care of beforehand) same if\n      //the empty line is followed by a glue token.\n      list = utils.filterIfPrevious(list, (prev, item) =\u003e {\n        if (prev.type === \"glue\" \u0026\u0026 item.type === \"empty-line\") return false\n        return true\n      })\n\n      list = utils.filterIfNext(list, (item, next) =\u003e {\n        if (item.type === \"empty-line\" \u0026\u0026 next.type === \"glue\") return false\n        return true\n      })\n\n      /* 4. create the paragraph list and first paragraph item\n        then loop through the list of items:\n        if text line:\n          add it to the current paragraph (last paragraph in list) content + add a space\n        if empty line\n          create a new paragraph and push it onto the paragraph list\n        if glue token\n          remove last space from paragraph content\n      */\n      \n      let paragraphs = [{text: \"\"}]\n\n      for (let item of list) {\n        if (item.type === \"text\") {\n          const currentParagraph = paragraphs[paragraphs.length - 1]\n          currentParagraph.text += item.text + \" \"\n        } else if (item.type === \"empty-line\") {\n          paragraphs.push({text: \"\"})\n        } else if (item.type === \"glue\") {\n          const currentParagraph = paragraphs[paragraphs.length - 1]\n          if (currentParagraph.text.length) {\n            if (currentParagraph.text[currentParagraph.text.length - 1] !== \" \") {\n              throw new Error `Glue error. Paragraph should end with space.`\n            }\n            currentParagraph.text = currentParagraph.text.substr(0, currentParagraph.text.length - 1) //VS code\n            //likes to strike-through the substr, but that's nonsense.\n          }\n        } else {\n          throw new Error(\"Illegal paragraph type.\")\n        }\n      }\n\n      //5. remove empty paragraphs:\n      paragraphs = paragraphs.filter(n =\u003e n.text)\n\n      return paragraphs\n    }\n\n\n    execEmpty(line) {\n      //empty line (paragraph delimiter)\n      this.paragraphBuffer.push({type: \"empty-line\"})\n      return \"advanceByOne\"\n    }\n \n    execText(line) {\n      let text = line.text\n      let startGlue = false\n      let endGlue = false\n      if (text.startsWith(GLUESYMBOL)) {\n        text = text.substr(2)\n        startGlue = true\n      }\n      if (text.endsWith(GLUESYMBOL)) {\n        text = text.substr(0, text.length - 2)\n        endGlue = true\n      }\n      if (startGlue) this.paragraphBuffer.push({type: \"glue\"})\n      this.paragraphBuffer.push({type: \"text\", text})\n      if (endGlue) this.paragraphBuffer.push({type: \"glue\"})\n      return \"advanceByOne\"\n    }\n\n    execLabel(line) {\n      //nothing at the moment\n      return \"advanceByOne\"\n    }\n\n    execIf(line) {\n      const str = `____asj22u883223232jm_ajuHH23uh23hhhH__**~§@€` //prevent collision\n      window[str] = false\n      try {\n        eval (`window[\"${str}\"] = ( ` + line.text+ \" )\" )\n      } catch(err) {\n        this.rtError(line.lineNr, \"if-condition: JavaScript threw an error. Is this a valid condition?\"+\n          `\u003cbr\u003e${err}`, false)\n        return \"stopRunning\"\n      }\n      let target = false\n      if (!window[str]) {\n        console.log(\"if condition failed\")\n        //condition failed:\n        //jump to corresponding else, if there is one, otherwise to corresponding end\n        if (line.correspondingElse) {\n          console.log(\"else exists\", line.correspondingElse)\n          target = line.correspondingElse\n        } else {\n          target = line.correspondingEnd\n        }\n      } else {\n        console.log(\"if condition succeeded\")\n        //condition succeeded\n        return \"advanceByOne\"\n      }\n\n      if (!target) {\n        this.rtError(line.lineNr, 'if-condition seems to have no valid \"end\" command.')\n        return\n      }\n      \n      //console.log(\"execIf, going to\", target)\n      return {jumpTo: target}\n    }\n    \n    execElse(line) {\n      //jump to corresponding end\n      if (!line.correspondingEnd) throw new Error(`else has no if/end block? This should not happen.`)\n      const target = line.correspondingEnd\n      console.log(\"exec else jump to\", target)\n      return {jumpTo: target}\n    }\n    \n    execEnd(line) {\n      //nothing at the moment\n      return \"advanceByOne\"\n    }\n\n    execChoice(line) {\n      //populate this.choices with choice objects containing choice text\n      //assumes that lineNr of choice is unique, which it really should be\n      //unless there is a serious bug\n\n      if (this.previouslyExecutedLine \u0026\u0026 this.previouslyExecutedLine.level !==\n        line.level) {\n          return {\n            error: true,\n            msg: `Encountered choice of wrong level. Maybe you forgot a gather?`,\n          }\n      }\n\n      if (!line.nextChoiceOfSameLevel) {\n        console.log(\"erroneous line:\", line)\n        throw new Error(`Fatal. Choice has no nextChoiceOfSameLevel.`)\n      }\n\n      let choice = {\n        text: line.text,\n        level: line.level,\n        subType: line.subType,\n        index: this.choices.length,\n        internalLineNr: line.internalLineNr,\n      }\n      this.choices.push(choice)\n\n\n      if (line.nextChoiceOfSameLevel === \"endBlock\") {\n        return \"stopRunning\"\n      }\n\n      return {jumpTo: line.nextChoiceOfSameLevel}\n    }\n\n    log(msg) {\n      //if (!debug.log) return\n      console.log(\"%c \" + msg, \"background: pink; color: black;\")\n    }\n\n\n    execSinglelinejs(line) {\n      //console.log(\"exec single line js\", line)\n      try {\n        eval(line.text)\n      } catch(err) {\n        this.rtError(line.lineNr, `I executed a single JS line and ran into an error. This is the line:` +\n          `\\n${line.text}`)\n      }\n      return \"advanceByOne\"\n    }\n\n    execGoto(line) {\n      const target = this.jumpTable[line.target]\n      if (!target \u0026\u0026 target !== 0) {\n        return {\n          error: true,\n          msg: `.goto ${line.target}: I didn't find a knot or label with this name.`,\n        }\n      }\n      return {jumpTo: target + 1}\n    }\n\n    execKnot(line) {\n      return \"stopRunning\"\n    }\n    \n    execEndgame(line) {\n      return \"gameEnd\"\n    }\n\n    execGather(line) {\n      return \"advanceByOne\"\n    }\n\n    \n\n    execVoid() {\n      //dummy lines. do absolutely nothing\n      return \"advanceByOne\"\n    }\n\n\n\n  } //Class story\n\n\n  function insertDummyLines(lines) {\n    let nu = []\n    for (let line of lines) {\n      nu.push(line)\n      if (line.type === \"choice\") {\n        nu.push({\n          type: \"void\",\n          level: line.level + 1,\n        })\n      }\n    }\n    return {\n      lines: nu,\n      error: false,\n    }\n  }\n\n\n  //####################\n  //####################\n\n\n  function annotateBlocks(lines) {\n    function An(str) {\n      const char = str.substr(0, 1).toLowerCase()\n      if ([\"a\", \"e\", \"i\", \"o\", \"u\"].includes(char)) {\n        return \"An\"\n      }\n      return \"A\"\n    }\n\n    function getUnclosedBlockError(stack, line) {\n      let lastLine = stack[stack.length - 1]\n      let txt = \n        `${stack.length} unclosed block${stack.length \u003e 1 ? \"s\" : \"\"}. `+\n        `${An(lastLine.type)} ${lastLine.type} block was opened on ` +\n        `line ${lastLine.lineNr} and ` + \n        `it should have been closed before line ${line.lineNr}.`\n      return {\n        error: true,\n        lineNr: line.lineNr,\n        lineObj: line, \n        msg: txt,\n      }\n    }\n\n    //if for each loop end endjs else processing\n    let currentLevel = -1000\n    let stack = []\n    let index = -1\n    for (let line of lines) {\n      index ++\n      let t = line.type\n      if (line.level !== currentLevel) {\n        if (stack.length) {\n          return getUnclosedBlockError(stack, line)\n        }\n        stack = []\n      }\n      \n      if (\n        t === \"if\" ||\n        t === \"loop\" ||\n        t === \"each\" ||\n        t === \"for\" ||\n        t === \"js-start\"\n      ) {\n        stack.push(line)\n      } else if (t === \"else\") {\n        let lastLine = stack[stack.length - 1]\n        if (!lastLine) {\n          return {\n            error: true,\n            lineNr: line.lineNr,\n            lineObj: line,\n            msg: `I found an \".else\" line, but there was no \".if\" line before that, so it makes no sense to me.`,\n          }\n        }\n        lastLine.correspondingElse = line.lineNr\n        lastLine.correspondingElseObj = line\n        if (lastLine.type !== \"if\") {\n          return {\n            error: true,\n            lineNr: line.lineNr,\n            lineObj: line, \n            msg: `\".else\" may only appear inside an \".if\" block`,\n          }\n        }\n        line.correspondingIf = lastLine.lineNr\n      } else if (t === \"end\" || t === \"js-end\") {\n        let lastLine = stack[stack.length - 1]\n        if (!lastLine) {\n          return {\n            error: true,\n            lineNr: line.lineNr,\n            lineObj: line,\n            msg: `I found an \".end\" or \".jsend\" line, but there was no block to close, so it makes no sense to me.`,\n          }\n        }\n        if (t === \"js-end\" \u0026\u0026 lastLine.type !== \"js-start\") {\n          return {\n            error: true,\n            lineNr: line.lineNr,\n            lineObj: line, \n            msg: `A normal block should be closed with \".end\", not with \".jsend\".`,\n          } \n        }\n        if (t === \"end\" \u0026\u0026 lastLine.type === \"js-start\") {\n          return {\n            error: true,\n            lineNr: line.lineNr,\n            lineObj: line, \n            msg: `A \".js\" block should be closed with \".jsend\", not with \"end\".`,\n          }    \n        } \n        if (!stack.length) {\n          return {\n            error: true,\n            lineNr: line.lineNr,\n            lineObj: line, \n            msg: ` I found \".end\", but there is no block to close.`,\n          }  \n        }\n        let last = stack.pop()\n        last.correspondingEnd = line.lineNr\n        if ( t === \"end\" ) {\n          const lastIf = last\n          if (lastIf.correspondingElseObj) {\n            lastIf.correspondingElseObj.correspondingEnd = line.lineNr\n            delete lastIf.correspondingElseObj //not needed anymore\n          }\n        }\n      }\n      currentLevel = line.level\n    }\n    //console.log(\"stack\", stack, stack.length, JSON.stringify(stack[0]))\n\n    if(stack.length) {\n      const lastLine = stack[stack.length - 1]\n      let txt = \n        `${stack.length} unclosed block${stack.length \u003e 1 ? \"s\" : \"\"}. `+\n        `${An(lastLine.type)} ${lastLine.type} block was opened on ` +\n        `line ${lastLine.lineNr} and ` + \n        `should have been closed.`\n      return {\n        error: true,\n        lineNr: lastLine.lineNr,\n        lineObj: lastLine, \n        msg: txt,\n      }\n    }\n\n\n    return lines\n  }\n\n\n  function tokenize(str) {\n    let lastLineWasEmpty = false\n    let lines = str.split(\"\\n\").map( (line, i) =\u003e {\n      let type = false\n      let subType = false\n      line = line.trim()\n\n      if (line === \"\") {\n        if (lastLineWasEmpty) {\n          return false\n        } else {\n          lastLineWasEmpty = true\n          type = \"empty\"\n        }\n      } else {\n        lastLineWasEmpty = false\n      }\n\n      if ( line.startsWith(\"===\") ) {\n        type = \"knot\"\n      } else if ( line.startsWith(\"=\") ) {\n        type = \"label\"\n      } else if ( line.startsWith(\"*\") ) {\n        type = \"choice\"\n        subType = \"once\"\n      } else if ( line.startsWith(\"+\") ) {\n        type = \"choice\"\n        subType = \"multi\"\n      } else if ( line.startsWith(\"-\") ) {\n        type = \"gather\"\n      } else if ( line.startsWith(\"#\") ) {\n        type = \"single-line-js\"\n      } else if ( line.startsWith(\".goto \") || line.startsWith(\".g \") ) {\n        type = \"goto\"\n      } else if ( line.startsWith(\"//\") ) {\n        //comment\n        return false\n      } else if (line.startsWith(\".\")) {\n        let res = getDotCommandType(line)\n        if (!res) {\n          return {\n            error: true,\n            msg: `Unknown dot command: ${line}`,\n            lineNr: i + 1,\n            lineObj: false,\n          }\n        }\n        type = res\n      } else if (type !== \"empty\") {\n        type = \"text\"\n      }\n      return {\n        type: type,\n        subType: subType,\n        text: line,\n        lineNr: i + 1, //(starting from 1 not 0)\n      }\n    })\n      //lines = lines.filter( n =\u003e n ) NO! JUST NO!\n    lines = lines.map ( n =\u003e {\n      if (!n) return {\n        type: \"empty\",\n      }\n      return n\n    })\n    for (let line of lines) {\n      const res = checkLineSyntax(line)\n      if (res) return {\n        error: true,\n        msg: res,\n        lineNr: line.lineNr,\n        lineObj: line,\n      }\n    }\n    return lines\n  }\n\n  function checkLineSyntax(line) {\n    //return falsey value for: everything fine\n    //and string for error occurred, show this error message.\n    //each line has to go through here\n    const type = line.type\n    const mustBeSingle = new Set([\"else\", \"js\", \"jsend\", \"end\", \"endgame\"])\n    if ( mustBeSingle.has(type) ) {\n      const wordAmount = line.text.replace(\".\", \"\")\n        .trim().split(\" \").map(n =\u003e n.trim()).filter(n =\u003e n).length  \n      if (wordAmount \u003e 1) {\n\n        return `${type} line cannot contain additional text. I saw ${wordAmount} words on that line, \n        but only the first one makes sense to me.`\n      }\n    }\n    return false\n  }\n\n\n  function getDotCommandType(line) {\n    //return falsey, if not a valid dot command,\n    //else return string representing the type\n    let type = false\n    line = line.replace(\".\", \"\").trim()\n\n    const firstWord = line.split(\" \").map(n =\u003e n.trim()).filter(n =\u003e n)[0]\n\n    if ( firstWord === \"js\" ) {\n      type = \"js-start\"\n    } else if ( firstWord === \"jsend\" ) {\n      type = \"js-end\"\n    } else if ( firstWord === \"if\" ) {\n      type = \"if\"\n    } else if ( firstWord === \"else\" ) {\n      type = \"else\"\n    } else if (firstWord === \"end\" ) {\n      type = \"end\"\n    } else if ( firstWord === \"each \" ) {\n      type = \"each\"\n      type = false //currently not supported\n    } else if ( firstWord === \"loop \" ) {\n      type = \"loop\"\n      type = false //currently not supported\n    } else if ( firstWord === \"for \" ) {\n      type = \"for\"\n      type = false //currently not supported\n    } else if ( firstWord === \"choice \" ) {\n      type = \"make-choice\"\n    } else if ( firstWord === \"set \") {\n      type = \"set\"\n      type = false //currently not supported\n    } else if ( firstWord === \"endgame\") {\n      type = \"end-game\"\n    } else if ( firstWord === \"goto\" || firstWord === \"g\") {\n      type = \"goto\"\n    }\n    return type\n  }\n\n\n  function annotateLines(lines) {\n    function annotateLine(line, index) {\n      //line.index = index\n      if (line.type === \"knot\" || line.type === \"label\") {\n        line.name = line.text.replaceAll(\"=\", \"\").trim()\n        let n = jumpTable[line.name]\n        if (n || n === 0) return {\n          error: true,\n          lineNr: line.lineNr,\n          lineObj: line,\n          msg: `${line.name}': duplicate knot/label name`,\n        }\n        jumpTable[line.name] = index\n      } else if (line.type === \"goto\") {\n        line.target = line.text\n          .replace(\".\", \"\")\n          .replace(\"g \", \"\")\n          .replace(\"goto \", \"\")\n          .trim()\n      } else if (line.type === \"choice\" || line.type === \"gather\") {\n        let targetChar = \"+\"\n        if (line.subType === \"once\") targetChar = \"*\"\n        if (line.type === \"gather\") targetChar = \"-\"\n        let count = 0\n        let index = -1\n        for (let char of line.text) {\n          index ++\n          if (char.trim() === \"\") continue\n          if (char === targetChar) {\n            count ++\n            continue\n          }\n          line.text = line.text.substr(index)\n          break\n        }\n        line.level = count\n      } else if (line.type === \"if\") {\n        line.text = line.text.replace(\".if\", \"\").trim()\n      } else if (line.type === \"each\") {\n        line.text = line.text.replace(\".each\", \"\").trim()\n      } else if (line.type === \"loop\") {\n        line.text = line.text.replace(\".loop\", \"\").trim()\n      } else if (line.type === \"for\") {\n        line.text = line.text.replace(\".for\", \"\").trim()\n      } else if (line.type === \"choice\") {\n        line.text = line.text.replace(\".choice\", \"\").trim()\n      } else if (line.type === \"set\") {\n        line.text = line.text.replace(\".set\", \"\").trim()\n      } else if (line.type === \"single-line-js\") {\n        line.text = line.text.replace(\"#\", \"\").trim()\n      }\n    \n      return line\n    }\n\n    let jumpTable = {}\n    let i = -1\n    for (let line of lines) {\n      i++\n      let res = annotateLine(line, i)\n      if (res.error) {\n        return res\n      }\n      lines[i] = line\n    }\n    return {\n      lines: lines,\n      jumpTable: jumpTable,\n    }\n  }\n\n\n  function annotateLevels(lines) {\n    //add level info to lines:\n    let level = 1\n    for (let line of lines) {\n      if (line.type === \"knot\") {\n        line.level = 1\n        level = 1\n      } else if (line.type === \"gather\") {\n        level = line.level\n      } else if (line.type === \"choice\") {\n        level = line.level + 1\n      } else {\n        line.level = level\n      }\n    }\n    return lines\n  }\n\n  function annotateChoices(lines) {\n    /* \n      Here's what happens:\n      We walk from top to bottom.\n\n      If we meet a choice:\n      - l is the level of this choice\n      - all choices with level higher than l (so 3, 4, 5 etc.,\n      if choice is 2, for example) in the hashmap get a nextChoiceOfSameLevel\n      of \"endBlock\", because they are the last choices in their block,\n      since the lower-level choice indicated that their block was closed.\n      - if the hashmap entry lastChoiceOfLevel[l]\n        points to a choice, then that choice gets nextChoiceOfSameLevel = the current index\n        (if not, it must be the first choice in the block)\n      - the hashmap entry lastChoiceOfLevel[l] becomes a reference to the current choice\n\n      If we meet a gather:\n      - l is the level of the gather\n      - all choices in the hashmap with level higher than l OR EQUAL TO l get a nextChoiceOfSameLevel\n        of \"endBlock\"\n      \n      If we meet a knot start:\n      - clear the hashmap\n\n      No idea, if this approach is correct. Implement and test.\n    */\n\n    let i = -1\n    const lastChoiceByLevel = []\n    let lastChoiceLevel = -1\n    for (let line of lines) {\n      i++\n      const index = i\n      if (line.type === \"choice\") {\n        const level = line.level\n        const diff = level - lastChoiceLevel\n        if (lastChoiceLevel \u003e 0 \u0026\u0026 diff \u003e 1) {\n          return {\n            lineNr: line.lineNr,\n            error: true,\n            msg: `I found a jump from choice level ${lastChoiceLevel} to choice level ${level}. `+\n            `I was expecting at least one level ${lastChoiceLevel + 1} choice in between, `+\n            `otherwise it makes no sense.`,\n          }\n        }\n        let i = level\n        while (true) {\n          i++\n          const entry = lastChoiceByLevel[i]\n          if (!entry) break\n          entry.nextChoiceOfSameLevel = \"endBlock\"\n        }\n        const prevLine = lastChoiceByLevel[line.level]\n        if (prevLine) {\n          prevLine.nextChoiceOfSameLevel = line.internalLineNr\n        }\n        lastChoiceByLevel[line.level] = line\n        lastChoiceLevel = line.level\n      //####################################\n      } else if (line.type === \"gather\") {\n        const level = line.level\n        let i = line.level - 1\n        while (true) {\n          i++\n          const entry = lastChoiceByLevel[i]\n          if (!entry) break\n          entry.nextChoiceOfSameLevel = \"endBlock\"\n          lastChoiceByLevel[i] = false\n        }\n      //####################################\n      } else if (line.type === \"knot\" || index \u003e= lines.length - 1 ) {\n        const level = line.level\n        let i = 0\n        while (true) {\n          i++\n          const entry = lastChoiceByLevel[i]\n          if (!entry) break\n          entry.nextChoiceOfSameLevel = \"endBlock\"\n          lastChoiceByLevel[i] = false\n        }\n      }\n    } //for each lines\n\n    return lines\n\n  }\n\n  function annotateGathers(lines) {\n    function getNextGather(lines, startIndex, maxLevel) {\n      //maxLevel: level must be lower than or equal to this\n      for (let i = startIndex; i \u003c lines.length; i++) {\n        let line = lines[i]\n        if (line.type === \"gather\" \u0026\u0026 line.level \u003c= maxLevel) {\n          return {index: i}\n        }\n      }\n      return false\n    }\n\n    //now walk through lines. whenever the level\n    //gets lower (numerically, so from 2 to 1, from 4 to 2 etc.), look for a lower\n    //or equal-level gather and\n    //connect the line to that gather\n\n    let i = -1\n\n    for (let line of lines) {\n      i++\n      let nextLine = lines[i + 1] || false\n\n      if (!nextLine) continue\n\n      //console.log(\"walking to\", i, line)\n\n      let mode = false\n      \n      if (nextLine.level \u003c line.level) {\n        //console.log(\"nextLine.level:\", nextLine.level, \"line.level:\", line.level)\n        mode = true //\"addContinuation\"\n      }\n\n      if (mode) {\n        let gather = getNextGather(lines, i + 1, line.level - 1)\n        if (!gather) {\n          line.continuation = \"no-continuation\"\n          //console.log(\"line\", line.lineNr, line.text, \"gets gathered : never\")\n        } else {\n          //console.log(\"connecting line\", i, \":\", line, \"to line\", gather.index, lines[gather.index] )\n          line.continuation = gather.index\n          //console.log(\"line\", line.lineNr, line.text, \"gets gathered at\", lines[gather.index])\n        }\n      }\n\n    }\n\n    return lines\n  }\n\n  function normalizeWhitespace(str) {\n    return str.replace(/\\t/g, \" \")\n  }\n\n\n  function createNewStory(... args) {\n    return new Story(... args)\n  }\n\n\n  function setDebugOption(option, value = true) {\n    //value should be true or false, option should be string\n    debug[option] = value\n  }\n\n  return {\n    createNewStory,\n    setDebugOption,\n  }\n\n})()\n\n","Meta":"jinx.js"}