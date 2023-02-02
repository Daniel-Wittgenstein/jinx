

QUICK START:

+ Just do this:

  from the top-level directory, run:

  "node ./bruhoverwatcher.js"

  Let this node process run in the background while you develop.

  It will watch the runtime files and all plugin files.
  Once it detects a file change, it will automatically rebuild stuff
  (runtime or plugin, as appropriate).

  That's basically everything you need to start developing.



Further notes:

  + The editor files don't even need a build step. Just get hacking.

  + This should be platform-independent now, since it uses only node, no more Linux shell scripts.

