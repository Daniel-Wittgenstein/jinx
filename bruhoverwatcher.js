

const fs = require('fs')

const cp = require('child_process');

let last_auto_update = 0
let auto_update_interval_min = 500

function registerWatcher(dir, command) {
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
      console.log("CHANGE DETECTED, executing: " + command)
      cp.exec(command)

  })
}

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + "/" + file).isDirectory()
  })
}


console.log("Bruh OVER Watcher is watching ... watching RUNTIME *and* PLUGINS")

registerWatcher("./runtime", "./bruhbuild.sh")

const dirList = getDirectories("./plugins/src")
//watch every folder in the plugins/src folder (file watcher does NOT automatically do recursion):
for (const dir of dirList) {
  registerWatcher("./plugins/src/" + dir, "./plugin-build.sh")
}

