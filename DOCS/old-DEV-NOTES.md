
GENERAL INSTRUCTIONS FOR DEVELOPING - TO START DEVELOPMENT ON THIS APP:

- The build process currently only works on Linux.
  It could be made platform-independent pretty easily,
  because the only Linux-specific thing is
  the small shell script "bruhbuild.sh", but currently it's not.

- You need to have node.js installed.

- You do not need to have Go installed, unless you want
  to somehow tweak the build process or the Linux executable
  should not run on your Linux, in which case you would need Go to rebuild from source.
  (If you are not on Linux, the "bruh" executable
  will not work. You need to compile it for your platform first
  using Go. The Go source code is in the folder "bruh", it's just one file.)

- Inside the project's top-level directory, run:
  node ./bruhwatcher.js
  (and leave the terminal window open)
  This will watch for changes to the files inside the runtime folder
  and rebuild the runtime whenever the files change.

- Create certificates for local HTTPS with mkcert and 
  put them in a directory of your choosing; preferably
  NOT a sub-directory of the app, but another directory entirely.
  NOTE: these files contain sensitive information.
  NEVER UPLOAD THEM TO GITHUB!

- Open "RUN-DEVELOPMENT-SERVER.js" and change
  the variable "path" to the directory
  where YOU store your certificates.
  (The certificates you just made with mkcert.)


#### the following is obsolete: we do not use the file system api anymore, since
It's non-standard and it's not clear if it ever will be a thing outside Chrome:

- Now, inside the project's top-level directory, run:
  node ./RUN-DEVELOPMENT-SERVER.js
  (and leave the terminal window open)
  This should run a simple HTTPS (not HTTP!) server
  on port 4443.

- Then in your browser open the adress:
  https://localhost:4443/index.htm  

  This should allow you to test the app locally.

  Note that a local HTTPS server is needed
  for the FILE SYSTEM STANDARD API / FILE SYSTEM ACCESS API
  (whatever it's called) to work.

  Also note that the api currently only supported on Chrome and Edge.

  THE ONLY RECOMMENDED WAY TO RUN THE APP LOCALLY IS VIA HTTPS!




  Note: the local HTTPS server does not auto-restart on file changes.
  If you want that feature, you would have to code it yourself
  with node. Currently, I just refresh the browser via keyboard shortcut.

#################
#################
#################

ADDITIONAL NOTES:

- if the runtime throws an explicable error, try clearing localStorage
  or look at the HTML in the HTML CodeMirror editor.
  It may just be the case that your app is injecting old/incorrect HTML
  stored inside the localStorage from your Codemirror HTML instance.

- If debugging injected iframe code in Chrome is painful (and especially
  if Chrome starts reporting wrong line numbers for errors inside the iframe!),
  try either updating your Chrome or SWITCH TO FIREFOX! I've found that Firefox
  seems to handle these iframe errors better and debugging them is way nicer.
  YMMV, of course.

-  Since we are already talking about Firefox:
  Sometimes setTimeout and setInterval stop working in my Firefox.
  Closing and reopening the tab fixes it. It's an obnoxious bug, but
  hopefully not too common.
  See:
  https://bugzilla.mozilla.org/show_bug.cgi?id=1687675
  This actually happened to me. You better believe it.
  (Version 104.0.1 (64-bit) on Linux Mint)
  Just keep this in mind, because it may look like our code is broken, when it's not.
