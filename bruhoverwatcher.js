

const fs = require('fs')

const cp = require('child_process');

let last_auto_update = 0
let auto_update_interval_min = 500

function registerWatcher(dir, func) {
  console.log("Watching directory: " + dir)
  fs.watch(dir, function() {
      /*
          NOTES:
          - Sometimes errors in this function fail silently,
              without showing anything in the console. Maybe
              some try{} catch{} interference???  
              
          - The fs.watch function is not 100% cross-platform
              and may have quirks (the node documentation
              says this, not me.)
          
          - This function may fire twice for one file change
              (that's probably one of the quirks). That's why we check
              the elapsed time.

          - The arguments passed to this function are not
          necessarily reliable (per the node.js docs), so we don't
          use them.
      */
      let time = + new Date()
      let elapsed = time - last_auto_update
      if (elapsed < auto_update_interval_min) return
      last_auto_update = time
      console.log("CHANGE DETECTED")
      //cp.exec(command)
      func()

  })
}

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + "/" + file).isDirectory()
  })
}


console.log("Bruh OVER Watcher is watching ... watching RUNTIME *and* PLUGINS")

registerWatcher( "./runtime", buildRuntime )

const dirList = getDirectories("./plugins/src")
//watch every folder in the plugins/src folder (file watcher does NOT automatically do recursion):
for (const dir of dirList) {
  registerWatcher("./plugins/src/" + dir, buildPlugins)
}



//"./bruhbuild.sh" "./plugin-build.sh"

const runtimeBuildInstructions = `
  ./bruh/bruh -input=./runtime/runner.js -output=./runtime-auto-built/runner.js -prefix="window.runTimeData.runner = " -postfix="" -meta="runner.js"
  ./bruh/bruh -input=./runtime/jinx.js -output=./runtime-auto-built/jinx.js -prefix="window.runTimeData.jinx = " -postfix="" -meta="jinx.js"
  ./bruh/bruh -input=./utils.js -output=./runtime-auto-built/utils.js -prefix="window.runTimeData.utils = " -postfix="" -meta="utils.js"
  ./bruh/bruh -input=./runtime/index.htm -output=./runtime-auto-built/index.js -prefix="window.runTimeData.index = " -postfix="" -meta="index.htm"
  ./bruh/bruh -input=./runtime/style.css -output=./runtime-auto-built/style.js -prefix="window.runTimeData.style = " -postfix="" -meta="style.css"
`



const pluginBuildInstructions = `
  node ./plugin-bundler/plugin-bundler.js input=./plugins/src output=./plugins/auto-built output_type=js
`

function buildRuntime() {
  const instrs = instrPreProc(runtimeBuildInstructions)
  execInstrs(instrs)
}


function buildPlugins() {
  const instrs = instrPreProc(pluginBuildInstructions)
  execInstrs(instrs)
}

function execInstrs(instrs) {
  for (let instr of instrs) {
    cp.exec(instr)
  }
}


function instrPreProc(str) {
  return str.split("\n").map( n => n.trim() ).filter(n => n !== "")
}






