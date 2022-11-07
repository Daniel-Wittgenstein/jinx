

window.$_EXAMPLE = (function() {

  let examples = []

  function getAllExamples() {
    return examples
  }

  function add(id, name, saveObj) {
    const example = {
      id,
      name,
      data: saveObj,
    }
    examples.push(example)
  }

  return {
    getAllExamples,
    add,
  }

})()

