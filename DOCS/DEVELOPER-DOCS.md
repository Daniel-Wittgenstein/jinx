
# DEVELOPER DOCS - THE JINX RUNTIME

This document describes the Jinx runtime.

It's made for developers, not for normal story authors.

It's not comprehensive; it just tries to explain the most important parts,
so that one does not have to wade through the entire source code to understand
how things work (hopefully).

############################################

# General note on modules:

The Jinx runtime cannot use modules, because that would make it impossible
to bundle the entire game into a single HTML page. Therefore we use
IIFEs as a replacement for modules.

(The Jinx editor app could theoretically use modules, but currently it does not.
It could also use React, but it doesn't either; it's currently pretty simple
and primitive. The goal was to just get it to work. But this document isn't about
the editor app, anyway.)

############################################

# Build process:

The Jinx Runtime consists of all the files inside the "runtime" folder.
A script (bruh) converts these files automatically into JS-files containing data
as strings and writes them into the folder "runtime-auto-built". From there the
string data is used to create an HTML page and either export it or
inject it into an Iframe for test playing inside the app.

That means that all files in the "runtime" folder end up in the final, exported game.

############################################

# The runtime - anatomy:

The Runtime is currently made up of these files:

- index.htm
- jinx.js
- runner.js
- style.css

#############################################################################################

# runtime/index.htm

This file just contains the default content of the "HTML" tab (in the app).
You can change the HTML in the app on a per-story-basis.

#############################################################################################

# runtime/story.css

Defines CSS style that are included in EVERY Jinx story. Should be used sparingly.
It's better to outsource CSS styles to plugins, so the story creator can opt out of them.

############################################

# runtime/jinx.js

This module (actually an IIFE) is the inner core of Jinx.
It translates and runs a story written in Jinx markup.
It handles only story logic.
It does NOT handle I-O.
However, it does directly run inline JavaScript code (via eval),
because that *is* considered part of the story logic.

Jinx.js is handled entirely by runner.js, so all methods
of jinx.js should only ever be called by runner.js, never
from any other module and never directly from the story script
without mediation via runner.js.

exported global object: jinx.

methods of the global jinx oject:
  - jinx.setDebugOption
  - jinx.createNewStory

- setDebugOption:
  --- undocumented; subject to changes ---

- createNewStory:
  pass three parameters: str, onError, onEvent 
  1. string: entire story text
  2. onError: callback function
  3. onEvent: callback function

-> returns a jinx story object, with following public methods:
  setState, getState, getContents, selectChoice, jumpTo, resetState, kickOff

public methods of the Jinx story object:

## getState:
  Get current state of the jinx story object.

## setState:
  Set current state of the jinx story object. Only pass an object retrieved via getState.

## selectChoice:
  Pass current index of choice as integer. Select a choice by index.
  Sets the internal story pointer to run from that choice (but does not run the story, yet).
  (You can think of the story pointer as simply a variable pointing to the next 
  line/command that is to be executed.)

## jumpTo:
  Pass knot or label name as string. Jump to knot or label by its name.
  Sets the internal story pointer to run from that knot/label (but does not run the story, yet).

## resetState:
  Sets the story state to the very beginning. (Calling this immediately
  after creating the story is useless, because a freshly created story has this state anyway.)
  This cleans up internal things and sets the story pointer to run from the very first line
  of the story (but does not run the story, yet.)

## kickOff:
  actually execute the Jinx story from the story pointer until
  the game ends or all choices have been collected. The onEvent callback will
  be then be passed the string "gameEnd" or "stopRunning", respectively.

## getContents:
  returns an object containing the current paragraphs and choices.
  This should be called from the onEvent callback.

## setTextContentMetaData:
  This method can be called directly inline from a Jinx story script (via a hashtag, for example).
  This is different from all other Jinx methods that should NOT be called
  directly inline from a Jinx script.
  This method should be passed a JSON-serializable object that can contain any meta data (as long
  as it's JSON-serializable.) After calling this, the passed meta data will be attached
  to every **paragraph** object **and** to every **choice** object processed by Jinx.
  This can be called as often as one wants.
  This can be used by the story author to attach additional situative information
  to text paragraphs and choices,
  without having to explicitly add that information to every single paragraph or choice.
  The obvious use case is a feature to switch the current output container mid-story,
  so the story author can easily program different paragraphs and choices to go into 
  different HTML DOM containers. Of course, runner.js wraps its own functionality
  around this, so the story author will NOT actuall call setTextcontentMetaData
  on the Jinx story object, instead runner.js provides a wrapper function to do that
  that passes meta-data about the current output container to setTextContentMetaData.
  runner.js then uses that information for rendering text and choices to the correct containers.

#############################################################################################
#############################################################################################
#############################################################################################

# runtime/runner.js

This module manages the running of the Jinx story. It does the following:

  - uses the jinx.js module's public methods to create and run the story

  - handles Input and Output

  - provides an interface to the story author via the "jin" object

This module does NOT handle story logic.

The story author should NEVER call the "jinx" object directly, they should
only ever use the "jin" object provided by the runner.

The interface provided by "jin" is rather flexible and can be used to
customize the behavior of the runner via so-called effects.
Usually, you do not want to make changes the code of to the runner itself.
Instead, always prefer customizing the runner via "effects", if it's possible.

# runtime/runner.js -> jin interface

jin methods:

**see docs inside the app**

setDelay,
createVariableStore,
getVariableStores (do not use),
asset,
createEffect,
takeTurnFrom,
say,
output,
createPanel,







