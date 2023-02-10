

+ after loading new project etc. you have to click into codemirror instance
for it to refresh. instead it should do that automatically (for both codemirrors)

+ add external plugin -> load demo project -> plugin is still there
(possibly the same for open project? check)

+ -> is not interpreted as normal text (legacy.) remove it as token from jinx

+ a choice with no text is printed as a + symbol (first think about whether
we want to allow empty choices as fallback. probably not. so issue an error
if choice is empty, instead)

+ a line ".g" will give an error, but an incorrect error: there is no label g.
  this should be paarsed as goto command without label target. same for ".goto"

+ ...


+ this is not a bug, but: some tests use a custom-created window.v instead
  of window._test. They should be changed to use window._test.
  otherwise cross-pollution between tests (is real! has been seen!)


  NOTES:
  
+ if you export a chrome story that throws an error, chrome also breaks the document title.
  firefox does not. this is not our bug. it's just something to keep in mind. the title tag
  is not broken. fix the story, re-export it and the document title should show just fine.