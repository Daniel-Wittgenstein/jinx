

/* 

    sauron.js

    Node utility script for watching file changes / rebuilding the project and optionally
    even refreshing the browser. Read "./DOCS/README-DEVELOPER-QUICK-START-READ-THIS-FIRST.md"
    on how to use this.

*/

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
      func()

  })
}

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + "/" + file).isDirectory()
  })
}


console.log("Sauron is watching ... watching RUNTIME, PLUGINS and TOP-LEVEL-DIRECTORY")

registerWatcher( "./runtime", () => {
  buildRuntime()
  customRun()
})

const dirList = getDirectories("./plugins/src")
//watch every folder in the plugins/src folder (file watcher does NOT automatically do recursion):
for (const dir of dirList) {
  registerWatcher("./plugins/src/" + dir, () => {
    console.log("re-building plugins")
    buildPlugins()
    customRun()
  })
}


registerWatcher("./", () => {
  console.log("no rebuild")
  customRun()
})


  //

function customRun() {
  console.log("refreshing Chrome (only works on Windows)")
  cp.exec("refresh-chrome.ahk")
}


const runtimeBuildInstructions = [
  {
    input: "./runtime/runner.js",
    output: "runner.js",
    prefix: "window.runTimeData.runner = ",
    postfix: "",
  },
  {
    input: "./runtime/jinx.js",
    output: "jinx.js",
    prefix: "window.runTimeData.jinx = ",
    postfix: "",
  },
  {
    input: "./utils.js",
    output: "utils.js",
    prefix: "window.runTimeData.utils = ",
    postfix: "",
  },
  {
    input: "./runtime/index.htm",
    output: "index.js",
    prefix: "window.runTimeData.index = ",
    postfix: "",
  },
  {
    input: "./runtime/style.css",
    output: "style.js",
    prefix: "window.runTimeData.style = ",
    postfix: "",
  }
]

/*
old bruh instructions, for reference:

  ./bruh/bruh -input=./runtime/runner.js -output=./runtime-auto-built/runner.js -prefix="" -postfix="" -meta=""
  ./bruh/bruh -input=./runtime/jinx.js -output=./runtime-auto-built/jinx.js -prefix="" -postfix="" -meta="jinx.js"
  ./bruh/bruh -input=./utils.js -output=./runtime-auto-built/utils.js -prefix="" -postfix="" -meta="utils.js"
  ./bruh/bruh -input=./runtime/index.htm -output=./runtime-auto-built/index.js -prefix="" -postfix="" -meta="index.htm"
  ./bruh/bruh -input=./runtime/style.css -output=./runtime-auto-built/style.js -prefix="" -postfix="" -meta="style.css"

*/

const TARGET_RUNTIME_FOLDER = "./runtime-auto-built/"

const pluginBuildInstructions = `
  node ./plugin-bundler/plugin-bundler.js input=./plugins/src output=./plugins/auto-built output_type=js
`

function buildRuntime() {
  console.log("re-building runtime")
  for (let item of runtimeBuildInstructions) {
    const meta = item.input
    runtimeBuildInstructionDo(item.input, TARGET_RUNTIME_FOLDER + item.output,
      item.prefix, item.postfix, meta)
  }
}


function runtimeBuildInstructionDo(inputFilePath, outputFilePath, prefix, postfix, meta) {
  /* Does the same thing "bruh" did. So we can remove the dependency on bruh which was an exe written in go
  and a pain in the ass to call, because of cross-platform differences. */
  
  //read in a file:
  let fileContent
  try {
    fileContent = fs.readFileSync(inputFilePath, 'utf8')
  } catch(err) {
    console.log(`Trying to build runtime files: error trying to read file "${inputFilePath}"`)
    return
  }
 
  //create according JSON:
  const obj = {
    "Contents": fileContent,
    "Meta": meta,
  }
  const json = prefix + JSON.stringify(obj) + postfix
  

  //write json to corresponding file:
  try {
    fs.writeFileSync(outputFilePath, json, 'utf8')
  } catch(err) {
    console.log(`Trying to build runtime files: error trying to write file "${outputFilePath}"`)
    return
  }

  console.log(`building runtime: wrote file ${inputFilePath} to ${outputFilePath}: OK`)

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






