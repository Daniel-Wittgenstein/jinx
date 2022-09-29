
const utils = {

  isObj(v) {
    //is it actual object, the way I mean it; not an
    //array and not null and not a function
    return typeof v === 'object' && v !== null && !is_array(v)
  },
  
  isArray(v) {
    return Array.isArray(v)
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

}


