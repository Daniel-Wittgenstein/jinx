


window.testManager = (function() {

  let verbose = false //do not change this. change it inside run.js -> DEBUG options

  function setVerbose(x = true) {
    verbose = x
  }

  function runTestSuite(jinx, suite) {
    for (let test of suite.tests) {
      let res
      console.log("            ")
      if (test.SKIP) {
        if (verbose) console.log("Test marked with SKIP. Skipping test.")
        continue
      }
      res = runTestObject(jinx, test)
      if (!res) {
        console.log(`%c TEST FAILED`, "background: red; color: white")
        return false
      } else {
        console.log(`%c TEST "${test.name}" SUCCEEDED (all sub-tests okay)`, "background: green; color: white")
      }
      //console.log("            ")
    }

    console.log(`%c TEST SUITE SUCCEEDED!`, "background: green; color: white")
    return true
  }

  function runTestObject(jinx, testObject) {
    let compilationSucceeded = true
    let compilationError

    console.log(`%c Starting Test: "${testObject.name}" (has ${testObject.do?.length} sub-tests)`,
      `border: 5px solid #777;`)
    if (testObject.notes) console.log("Notes: "+ testObject.notes)

    if (!testObject.code && testObject.code !== "") throw new Error("Broken test. Test has no code.")

    function onError(error) {
      if (error.type === "compile error") {
        compilationSucceeded = false
        compilationError = error
      } else {
        console.log(`%c JINX RUNTIME ERROR. TEST FAILED`, "background: red; color: white;")
        console.log("The Jinx runtime error is: ", error.msg, error)
      }
    }

    function onEvent() {
      
    }

    let story = jinx.createNewStory(testObject.code, onError, onEvent)

    if (testObject.compileError) {
      if (compilationSucceeded) {
        console.log("Test expects compile error, but compilation succeeded. Test failed.")
        console.log("story:", story)
        return false
      } else {
        if (!compilationError) throw "fatal!!!! fix your code"
        console.log("Test expects compile error: compile error happened. Okay.")
        if (compilationError.lineNr && compilationError.lineNr !== testObject.compileErrorLineNr) {
          console.log(`Compile error happened at line ${testObject.compileErrorLineNr} instead of line
            ${compilationError.lineNr}. Test failed.`)
          return false
        }
        return true
      }
    } else {
      if (!compilationSucceeded) {
        console.log("Could not compile code. Test failed.")
        console.log("story:", story, compilationError)
        return false
      }
    }

    if (!testObject.do) throw new Error(`testObject has neither a 'do' nor a 'compileError' property.
      This is not allowed.`)

    let i = -1
    for (let subTest of testObject.do) {
      i++
      window._test = {}
      story.restart()
      //let story = jinx.createNewStory(jinx.code, () => {}, () => {})
      if (verbose) console.log("Starting sub-test " + i)
      for (let item of subTest) {
        let res = execDoItem(story, item)
        if (!res) {
          console.log("SUB-TEST FAILED.")
          return false
        }
      }
    }

    return true

  }

  function doAssertItem(story, item) {
    let res = item.assert(story)
    if (verbose) console.log("Assertion function: ", item.assert, res ? "assertion passed" : "assertion failed")
    return res
  }


  function execDoItem(story, item) {
    if (!item) throw new Error(`Test is wrongly coded. Empty item in 'do' array.`)
    if (item.assert) {
      let res = doAssertItem(story, item)
      return res
    } else if (item.runTimeError) {
      throw new Error("This test feature ('runTimeError') is not implemented, yet. Test is invalid.")
    } else if (item.jsError) {
      throw new Error("This test feature ('jsError') is not implemented, yet. Test is invalid.")
    } else {
      //is string
      if (item + "" !== item) throw new Error("Expected do-item to be string. Test is incorrectly coded.")
      const contents = story.getContents()
      if (!contents) {
        console.log(`Tried to select choice containing text "${item}", but there is currently no story content at all. `+
          `Test failed.`)
        return false
      }
      const choices = contents.choices
      if (!choices || choices.length === 0) {
        console.log(`Tried to select choice containing text "${item}", but there are currently no choices at all. `+
          `Test failed.`)
        return false
      }
      let chosen
      for (let choice of choices) {
        if (choice.text.toLowerCase().trim().includes(item.toLowerCase().trim())) {
          chosen = choice
          break
        }
      }
      if (!chosen) {
        console.log(`Tried to select choice containing text "${item}", but there is no such choice. `+
        `Test failed.`)
        console.log("Instead there are these choices:", choices)
        return false
      }
      if (verbose) console.log(`Selected choice "${item}" with index ${chosen.index}.`)
      story.selectChoice(chosen.index)
      return true
    }
    return true
  }

  return {
    runTestSuite,
    setVerbose,
  }

})()



