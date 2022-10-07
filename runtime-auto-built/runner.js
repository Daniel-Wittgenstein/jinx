window.runTimeData.runner = {"Contents":"\n\n\n\n\nwindow.onload = startP\n\nlet story\n\nfunction startP() {\n  //jinx.setDebugOption(\"log\")\n  story = createJinxStory(storyData.content, onError, onStoryEvent)\n  if (story.compilationFailed) {\n    return\n  }\n  console.log(\"%c RESTARTING STORY\", \"background: yellow; color: black;\")\n  story.restart()\n}\n\nfunction createJinxStory(storyContent, onErrorFunc, onStoryEvent) {\n  let story = jinx.createNewStory(storyContent, onErrorFunc, onStoryEvent)\n  return story\n}\n\nfunction onError(err) {\n  console.log(\"error:\", err)\n  const out = `\n    \u003cdiv style=\"background: #FFF; color: #B00; padding: 10px; font-family: sans-serif; font-size: 14px;\"\u003e\n      \u003cp\u003eAn error happened: \u003c/p\u003e\n      \u003cp\u003e\u003cb\u003e${err.msg}\u003c/b\u003e\u003c/p\u003e\n      \u003cp\u003eLine Number: ${err.lineNr \u003e 0 ? err.lineNr : \"no line number\"}\u003c/p\u003e\n      \u003cp\u003eType: ${err.type}\u003c/p\u003e\n      \u003cp\u003e\u003c/p\u003e\n      \u003cp\u003e\u003c/p\u003e\n    \u003c/div\u003e\n  `\n  document.write(out)\n}\n\n\nfunction onStoryEvent(type) {\n  console.log(\"JINX EVENT TRIGGERED:\", type)\n  if (type === \"finishedCollecting\" || type === \"gameEnd\") {\n    renderStuff()\n  }\n}\n\nfunction renderStuff() {\n  let contents = story.getContents()\n  let choices = contents.choices\n  let paragraphs = contents.paragraphs\n  let delay = 0\n  //console.log(222, paragraphs)\n  for (let p of paragraphs) {\n    setTimeout( () =\u003e {\n      let el = document.createElement(\"p\")\n      el.innerHTML = p.text\n      document.getElementById(\"wrapper\").appendChild(el)\n    }, delay)\n    delay += 30\n  }\n\n/*\n  for (let c of choices) {\n      let el = $(`\u003cp\u003e\u003ca href=\"#\" class=\"story-choice\" data-choiceindex='${c.index}'\u003e${c.text}\u003c/a\u003e\u003c/p\u003e`)\n      $(\"#wrapper\").append(el)\n  }\n*/\n  \n}","Meta":"runner.js"}