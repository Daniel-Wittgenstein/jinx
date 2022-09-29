




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



