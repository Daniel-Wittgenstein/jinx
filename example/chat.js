$_EXAMPLE.add("chat", "Chat example",
{"appName":"jinx","appVersion":"0.1","story":"\n<h1>Chat</h1>\n\nIn this example we want to style our text\nparagraphs so that they look like a bit like\nchat messages.\n\nWe use two techniques: first we\nuse the special function setDelay.\nThis tells Jinx to put a little\ntimed delay between the text paragraphs:\n\njin.setDelay(\"paragraphs\", 500)\n\n#jin.setDelay(\"paragraphs\", 500)\n\n(500 means 500 milliseconds, so half a second delay\nbetween each paragraph.)\n\nNow head over to the \"HTML\" tab.\nYou will see that we added some CSS.\nThe CSS changes the boring old\ntext paragraphs to look like chat messages.\n\nThat's all!\n\n.endgame","html":"<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"UTF-8\">\n    <title>Chat Demo</title>\n    <style>\n      §style\n      §pluginCss\n      \n      /* ################################### */\n      /* THIS IS WERE WE ADD SOME CSS: */\n      \n      /* This centers the text paragraphs: */\n      #main {\n      \tdisplay: flex;\n        flex-direction: column;\n        align-items: center;\n      }\n      \n      /* This changes the text paragraphs'\n      \tappearance: */\n      \n      .story-paragraph {\n        background: rgb(2,0,36);\n        background: linear-gradient(0deg, rgba(2,0,36,1) 0%, rgba(181,181,255,1) 0%, rgba(222,249,255,1) 100%);        \n        color: #000057;\n        border-radius: 6px;\n        padding: 20px;\n        margin: 10px 0;\n        max-width: 75%;\n        \n        /* This adds an animation to the text\n        paragraphs. This relies on the plugin\n        \"Animate.css\". If you head\n        over to the \"Plugins\" tab,\n        you can see that it has been enabled: */\n        animation: tada;\n  \t\t\tanimation-duration: 1.7s;\n      }\n      \n      /* END OF THE ADDITIONAL CSS. WE LEAVE\n      THE REST OF THE HTML TAB CONTENT AS WE\n      FOUND IT.*/\n      /* ################################### */\n      \n    </style>\n  </head> \n\n  <body>\n    <script>\n      \n      §jinx\n\n      §story\n      \n      §runner\n\n      §pluginJs\n\n    </script>\n\n    <div id=\"wrapper\">\n      <div id=\"mid\">\n        <div id=\"top-bar\"></div>\n        <div id=\"main\"></div>\n      </div>\n    </div>\n\n\n\n  </body>\n</html>","assets":{"assets":{}},"plugins":{"pluginsEnabled":[null,null,true],"plugins":[]},"appStorySaveState":true}
)