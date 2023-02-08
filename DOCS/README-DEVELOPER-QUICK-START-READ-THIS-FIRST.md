

QUICK START:

+ Just do this:

  from the top-level directory, run:

  "node ./sauron.js"

  Let this node process run in the background while you develop.

  It will watch the runtime files, all plugin files and the editor files in the top-level directory.
  Once it detects a file change, it will automatically rebuild stuff
  (runtime or plugin, as appropriate).

  Open "index.htm" in the browser (you don't even need to run a local development server).

  That's basically everything you need to start developing.

+ Windows / AutoHotkey
  As an additional bonus, if you are on Windows,
  the "sauron.js" node script will also refocus Chrome and refresh the browser window
  on any change in any of these directories:
    -   ./ (toplevel directory)
    -   all plugins sub-directories
    -   runtime directory

  However, this only works if you have AutoHotkey version 1 installed.
  (You can also install AutoHotkey version 2 and download version 1 additionally from the AutoHotkey hub.)

Further notes:

  + The editor files don't even need a build step. Just get hacking.

  + The build-step is platform-independent. Only some optional utilities for simpler developing are platform-specific (Autohotkey). 

  + No more dependency on Go for build step.

