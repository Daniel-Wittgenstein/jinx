
/* 

Just hacked together utilities for creating tests.

Editor does not rely on it, neither do tests or anything else, really.

*/

function superNesting() {
  let out = ""

  function add(text) {
    out += text + "\n"
  }

  const max = 12

  function rec(level, txt) {
    if (level > max) return
    let pre = ""
    let prespace = " ".repeat(utils.getRndInt(0, 4))
    for (let i = 0; i < level; i++) {
      pre += "+"
      if (utils.getRndInt(1, 100) < 20) {
        pre += " "
        if (utils.getRndInt(1, 100) < 50) pre += " ".repeat(utils.getRndInt(1, 10))
      } 
    }
    

    const text = prespace + pre + " choice " + txt
    add(text)
    num = utils.getRndInt(2, 5)
    for (let i = 0; i < num; i++) {
      rec(level + 1, txt + "." + i)
    }
  }

  for (let i = 0; i < 3; i++) {
    rec(1, i + "")
  }
  console.log(out)
}



function superStory(roomAmount = 5, longTextMax = 20) {

  const dItems = ["cat", "mat", "hat", "bat", "rat", "dog", "flock", "sock", "trousers", "skeleton",
    "sword", "axe", "armor", "wand", "star", "chainmail", "mace", "pistol", "gun", "sniper gun",
    "cupboard", "mermaid", "wizard", "leprechaun",
    "dragon", "flower", "sunflower", "snail", "piece of wood",
    "stone", "baseball bat", "football", "map of Paris", "map of the Underworld",
    "ghost train", "beaver", "child", "creepy child",
    "your old Uncle Bob", "a book", " a book about the stars", "a fire"]

  out = ""


  let r = 0
  for (let i = 0; i < roomAmount; i++) {

    let mtxt = ""

    for (let i = 1; i < longTextMax; i++) {
      mtxt += utils.oneOf(dItems).repeat(utils.getRndInt(1, 20)) + utils.getRndInt(1, 100_000_000) + "\n"
    }

    let longText = mtxt

    let items = ""
    for (let j = 0; j < utils.getRndInt(1, 4); j++) {
      items += ", " + utils.oneOf(dItems)
    }
    r++
    out += `
    === room${r}
    A typical dungeon room. You can see some items here ${items}.
    + choice 1
      ++ choice 1.1
      ++ choice 1.2
    + choice 2
      ++ choice 2.1
        +++ choice 2.1.1
        +++ choice 2.1.2
          ++++ choice 2.1.2.1
          ++++ choice 2.1.2.2
          ${longText}
      + choice 3
    + choice 4
    -
    end of room

    `

  }

  return out

}

function testCompilationSpeed() {
  const perf = [
    {knots: 10, text: 10},
    {knots: 100, text: 100},
    {knots: 1000, text: 100},
    {knots: 1000, text: 1000}, //over 1 million lines!    
  ]
  
  for (let i = 0; i < perf.length; i++) {
    let knotsAmount = perf[i].knots
    let textAmount = perf[i].text
    const t = `knots: ${knotsAmount}, text amount per knot: ${textAmount} lines`
    const code = superStory(knotsAmount, textAmount)
    console.time(t)
    const story = jinx.createNewStory(code)
    if (story.invalid) console.log("Could not compile story.")
    console.timeEnd(t)
  }
}


