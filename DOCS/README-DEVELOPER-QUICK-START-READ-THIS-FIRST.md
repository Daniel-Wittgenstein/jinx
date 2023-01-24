
+ The build process involves .sh scripts, so it only runs on Linux, currently.

+ Just do this:

  from the top-level directory, run:

  "node ./bruhoverwatcher.js"

  Let this node process run in the background while you develop.

  It will watch the runtime files and all plugin files.
  Once it detects a file change, it will automatically rebuild stuff
  (runtime or plugin, as appropriate; it does NOT rebuild everything on every change
  which is good).

  That's basically everything you need to start developing.



Further notes:

  + The editor files doesn't even need a build step. Just get hacking.

  + "node ./bruhwatcher.js"
  This is the old watcher. It only builds the runtime, not the plugins, and is obsolete.
  bruh over watcher supersedes it.