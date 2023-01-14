
//node script

const fs = require("fs")

function run() {
  let input = false
  let output = false
  let outputType

  process.argv.forEach(function (val, index, array) {
    console.log(val)
    if ( val.includes("=") ) {
      const parts = val.split("=")
      const second = parts[1]
      if (parts[0] === "input") {
        input = second
      } else if (parts[0] === "output") {
        output = second
      } else if (parts[0] === "output_type") {
        outputType = second
      }
    }
  })

  if (!input || !output) {
    console.log("Need input and output path to be specified.")
    return
  }

  if (outputType !== "js" && outputType !== "json") {
    console.log("I expected output_type=js or output_type=json")
    return        
  }

  //loop through all folder in input folder:
  fs.readdirSync(input).forEach(file => {
    const path = input + "/" + file
    if ( fs.lstatSync(path).isDirectory() ) {
      //fs.readdirSync(path).forEach(file2 => {
        /*if ( fs.lstatSync(path + "/" + file2).isFile() ) {
          console.log("    " + file2)
        }*/
      //})
      console.log("processing path", path)
      processPath(path, output, outputType)
    }
  })

}



function processPath(input, output, outputType) {

  const files = {
    js: input + "/source.js",
    css: input + "/source.css",
    json: input + "/meta.json",
  }

  const filesContent = {}

  for ( const key of Object.keys(files) ) {
    const fileName = files[key]
    try {
      filesContent[key] = fs.readFileSync(fileName, 'utf8')
    } catch(err) {
      filesContent[key] = ""
    }
  }
  
  if (!filesContent.json) {
    console.log("No meta.json file found.")
    return
  }

  //Parse filesContent.json content into JS object:
  let obj
  try {
    obj = JSON.parse(filesContent.json)
  } catch(err) {
    console.log("meta.json file does not contain valid JSON --- " + err)
    return
  }
  
  if (!obj.bundlerOutputFileName) {
    console.log("bundlerOutputFileName must be defined in meta.json")
    return
  }

  if ( obj.bundlerOutputFileName.includes(".") || obj.bundlerOutputFileName.includes("/") ) {
    console.log("meta.json: 'bundlerOutputFileName' must not include a file extension or path.")
    return
  }

  let pluginFileName = obj.bundlerOutputFileName

  //Then add implementation object to JS object:
  obj.implementation = {}
  if (files.js) obj.implementation.js = filesContent.js
  if (files.css) obj.implementation.css = filesContent.css

  //Then convert it back to JSON:
  let json
  try {
    json = JSON.stringify(obj)
  } catch(err) {
    console.log("Could not JSON.stringify the object --- " + err)
    return
  }

  //Then write it to output file as either pure JSON or as JS:
  let theOutputContent
  let outputFileExt
  if (outputType === "json") {
    outputFileExt = "json" 
    theOutputContent = json
  } else if (outputType === "js") {
    outputFileExt = "js" 
    theOutputContent = "$_PLUGIN.add(" + json + ")"
  } else {
    console.log("Wrong output_type")
    return
  }

  const outputPath = output + "/" + pluginFileName + "." + outputFileExt

  try {
    fs.writeFileSync(outputPath, theOutputContent)
  } catch(err) {
    console.log(err)
    return
  }

  let status = `Written files from directory ${input} to ${outputPath}.`
  console.log(status)

}

run()