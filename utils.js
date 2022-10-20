
const utils = {

  isObj(v) {
    //is it actual object, the way I mean it; not an
    //array and not null and not a function
    return typeof v === 'object' && v !== null && !isArray(v)
  },
  
  isArray(v) {
    return Array.isArray(v)
  },

  isInteger(v) {
    //true integer, not a string containing an integer
    //not sure if this is 100% correct, but seems to work
    return Math.round(Number(v)) === v
  },

  isString(n) {
    return typeof n === 'string' || n instanceof String
  },


  isFunc(func) {
    return func && {}.toString.call(func) === '[object Function]';
  },

  getRndInt(min, max) {
    if (!max && max !== 0) throw new Error("getRndInt must be passed two parameters.")
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  oneOf(arr) {
    return arr[utils.getRndInt(0, arr.length-1)]
  },

  filterIfPrevious(list, compare) {
    /* takes array and function.
      for each item (except for the first one in array because
        it has no previous item),
      the function is passed the previous item and
      the current item. if the function returns
      false, the current item is discarded, if it returns
      true, it is kept inside the list.
      The first item ALWAYS remains in the list.
      This does not mutate the original list.
      The idea is to filter a list according to the 
      criterium "the item that came before it",
      for example to remove duplicate entries.
      Note: even if an item is filtered out, it still
      gets passed to the next entry as previous item.
      list = [1, 1, 1, 2, 3, 4, 4, 5, 6, 7, 7]
      list = filterIfPrevious( list, (prev, item) => prev !== item )
      -> [1, 2, 3, 4, 5, 6, 7]
      list = filterIfPrevious( list, (prev, item) => prev === item )
      -> [1, 1, 1, 4, 7] (first item always stays, even if its predecessor
        is technically not equal to itself)
    */
    let newList = []
    let prev
    let index = -1
    for (let item of list) {
       index++
       if (index === 0 || compare(prev, item)) {
         newList.push(item)
       }
       prev = item
    }
    return newList
  },


  filterIfNext(list, compare) {
    /* takes array and function.
      Like filterIfPrevious, but for next item.
      Last item is always kept.

      list = [1, 1, 1, 2, 3, 4, 4, 5, 6, 7, 7]
      list = utils.filterIfNext( list, (prev, item) => prev === item )
      console.log(list)
      //-> 1, 1, 4, 7, 7
      //(keep all numbers where the next number is equal to it, as well as the very last 7)

      list = [1, 1, 1, 2, 3, 4, 4, 5, 6, 7, 7]
      list = utils.filterIfNext( list, (prev, item) => prev !== item )
      console.log(list)
      //-> 1, 2, 3, 4, 5, 6, 7
    */
    let newList = []
    let index = -1
    for (let item of list) {
       index++
       const next = list[index + 1]
       if (index === list.length - 1 || compare(item, next)) {
         newList.push(item)
       }
    }
    return newList
  },

  splitIntoPartsByStartAndEndTags(str, start = "<<", end = ">>") {
    /*
    takes a text string, a start string (some character sequence)
      and an end string (also some character sequence).
    splits the text string and puts the individual parts
    into an array. returns the array.

    Example:
      "123  <<456>>789<<abc>>def"
    -> would return: ->
    [
      {inside: false, text: "123  "},
      {inside: true, text: "456"},
      {inside: false, text: "789"},
      {inside: true, text: "abc"},
      {inside: false, text: "def"},
    ]

    So it basically splits the strings at the indices
    delineated by the start/end sequences and
    returns the individual parts of the text.

    Notes:
    
    - Maximum length of start and end strings is 2, min length is 1.

    - The returned array can start with an "inside: true" element,
    if the text string starts with the start sequence. Likewise
    it can end with an "inside: true" element, if the text
    string ends with the end sequence.

    - the parts can span multiple lines

    - The parts are NOT trimmed.

    - Empty parts will not be included in the array, unless inside
      start/end tags, so "<<>>" (when start === "<<" and end === ">>")
      would return this: [{inside: true, text: ""}],
      whereas "" would just return an empty array.

    - The start and end tokens CANNOT be used in a NESTED WAY!

    - In some cases, special error objects are returned, instead
      of the array:
      
      -- unclosed part (no end token found corresponding to start token)
        code: "unclosed"

      -- end token found, but no start token found
        code: "closed"

      -- nested tokens found (this is not allowed)
        code: "nested"

    */
    if (start.length > 2 || start.length < 1) throw new Error(`start length > 2 or < 1`)
    if (end.length > 2 || end.length < 1) throw new Error(`end length > 2 or < 1`)

    if (start === end) throw new Error (`Starting and ending token must be different.`)

    const parts = []
    let inside = false
    let lastPosition = 0
    let lastI = 0
    for (let i = 0; i < str.length; i++) {
      const char = str[i]
      const lookAhead = str.substr(i, 2)
      if (char === start || lookAhead === start) {
        if (inside) {
          return {
            error: true,
            code: `nested`,
            index: i,
          }
        }
        const part = str.substring(lastPosition, i)
        lastPosition = i
        if (start.length === 2) i++
        inside = true
        parts.push({
          inside: false,
          text: part,
        })
      } else if (char === end || lookAhead === end) {
        if (!inside) {
          return {
            error: true,
            code: `closed`,
            index: i,
          }
        }
        if (end.length === 2) i++
        inside = false
        const part = str.substring(lastPosition, i + 1)
        parts.push({
          inside: true,
          text: part,
        })
        lastPosition = i + 1
      } else if (i === str.length - 1) {
        parts.push({
          inside: false,
          text: str.substr(lastPosition),
        })
      }
      lastI = i
    }
    if (inside) {
      return {
        error: true,
        code: `unclosed`,
        index: lastPosition,
      }
    }

    let parts2 = parts.filter( n => {
      if (!n.inside && n.text === "") {return false}
      return true
    })

    parts2.forEach( part => {
      if (!part.inside) return
      part.text = part.text.substring(start.length, part.text.length - end.length)
    })

    return parts2
  }

}

;(function() {

  const alias = [
    ["rnd", "getRndInt"],
  ]
  for (let item of alias) {
    utils[item[0]] = utils[item[1]]
  }

 

})()

