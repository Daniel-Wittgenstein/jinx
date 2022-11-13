



All API methods start with "jin."
These are JavaScript functions provided by the Jinx Runner.
You can call these methods directly from your Jinx story.

***

jin.createEffect(type:string, effectFunction:function, [order:integer])

  jin.createEffect is very useful and can be used to do many things.

  In general, it tells Jinx to run a certain JavaScript function
  when a certain story event happens. The different use cases
  of jin.createEffect are explained below in more detail.

  The "type" string passed to jin.createEffect must be one of the following strings:
    - "after"
    - "before"
    - "onVariableChange"
    - "set"
    - "get"

  You must also pass a function. (This function will get passed
  different parameters depending on what the "type" string is.)

  The different usages of jin.createEffect are explained below.

  Finally, the third parameter "order" is optional.
  If you pass it, it must be an integer. By default it's 0. The order
  integer specifies the order
  the effects are run in, for example an "after" effect
  with order 3 would run after an "after" effect with order -2 (lower
  numbers are called before higher numbers). Note that all
  effect functions will always be called, "order" specifies
  the order, it does not make some effect functions replace others.

***

jin.createEffect("after", effectFunction:function, [order:integer])
  
  If the first string passed to jin.createEffect is "after",
  the function effectFunction will be called after every turn.

  Example: add some random ambiance text after every turn:

  .js
    jin.createEffect ("after", () => {
      say( oneOf(
        "The birds are chirping",
        "The leaves are rustling.",
        "The wolves are howling in the distance."))
    }, 3)
  .jsend

  Other example:

  .js
    jin.createEffect ("after", () => {
      if (!v.turns) v.turns = 0
      v.turns = v.turns + 1
      if (v.turns == 20) {
        //after twenty turns, you get kidnapped:
        say(`Suddenly, a woman in a black Ninja dress jumps out of a bush and kidnaps you.`)
        jin.goto("secret_ninja_lair")
      }
    }, 4)
  .jsend

  Note that the second example will take the player
  out of the current knot they are in and transport them
  to an entirely new knot. The story continues from there.

  If you do NOT call jin.goto however (like in the first example),
  the player will just stay where they are.

***

jin.createEffect("before", effectFunction:function, [order:integer])

  This is exactly identical to jin.createEffect("after" ...),
  except the "before" function will be called immediately after
  the player selects a choice (so before the story continues
  running from the choice.)

  You can use this to display some text on every turn, like with "after",
  but the text will be displayed before any other text.

  You can also use this with jin.goto to jump to another knot,
  only with "before" Jinx will jump immediately
  to that knot (right after the player selects a choice).

***

jin.createEffect("onVariableChange", effectFunction:function, [order:integer])
  return value: undefined

  This tells Jinx to call a function whenever a global variable changes.

  Let's say you want to play a sound every time the player's score changes.
  You can use jin.createEffect with "onVariableChange" to do so.

  Every time a global variable changes, the effectFunction will
  be called with the following four parameters:

  1. the name of the global variable that changed as a string
  2. the new value of the global variable (can be of type number, string, object, array or boolean)
  3. the name of the global store the variable belongs to as a key ("v" is the default.
    Unless jin.createVariableStore was used, this parameter will always be "v").
  4. the old value of the global variable, before it was changed

  Example:

  .js
    jin.createEffect(
      (name, newValue, store, oldValue) => {
        console.log(`global variable ${store}.${name} changed from ${oldValue} to ${newValue}.`)
        //... react accordingly
      }
      , 2
    )
  .jsend

  You shouldn't change global variables inside an effect function.
  Effect functions are just there to react to changes in global variables and
  do some input/output side-effects. In general, they should be used
  for audio / transition effects and the like, not for story logic.
  DO NOT call jin.goto from inside an effect function!

***

jin.createEffect("set", effectFunction:function, [order:integer])
  return value: undefined

  You might not ever need this. Read only if you have the time.

  If you just want to react to changes in the global state
  with some audio or transition, you are better off
  using jin.createEffect with "onVariableChange" (see above)!

  Jinx setters and getters go further than that.
  They allow you to say: instead of setting a variable
  to this value, set it to this other value (in the case of setters),
  or: instead of evaluating this variable to this value,
  evaluate it to this other value (in the case of getters).

  Usually, you do not need this feature. It's way
  easier and more clean to just change the variable to the correct
  value in your normal story code. The most legit
  use case for this feature is probably debugging a complex story.

  Another use case might be if you have hundreds of lines
  changing a variable (say, the player's health) by a small
  value, and suddenly you want to introduce an effect
  into your story that boosts all health gains by the factor of 2.
  Instead of changing all lines where the player's health is changed, you could use a
  setter function.

  This method takes a function. The function that was passed will be used
  as a setter function for all global variables.
  Meaning: every time a global variable is changed, the change
  will go through this setter function. The setter function should return the new
  value, that is the value the variable will be set to.

  Generally, you should only add one set effect per game, if you can.
  You can add more than one, but things might get confusing.
  Take a deep breath, because a detailed explanation follows.

  All set effects are called one after the other.
  Each set function is passed the following parameters:
  
  1. the name of the global variable as a string
  2. the value that was used on the right hand side of the assignment,
    if it's the first set effect in the cascade, otherwise the
    value returned from the last set effect.
  3. the name of the global store the variable belongs to as a key ("v" is the default.
    Unless jin.createVariableStore was used, this parameter will always be "v").
  4. the original value that was used on the right hand side of the assignment,
    before the entire cascade started, for example if the instruction was
    x = 2 + 2, this will always be 4 
  5. the old value of the global variable, before the entire cascade started

  Example (using only one createEffect call to keep things simple):

    jin.createEffect( "set", (variableName, newValue, storeKey, originalNewValue, originalOldValue) => {
      if (
        storeKey === "v"
        && variableName === "health"
        && v.playerHasHealthBuff
        && newValue > originalOldValue) {
          // this guarantees that damage (a negative health change) remains
          // unchanged; it is not multiplied by 2)
        return newValue * 2
      }
      return newValue //keep the default behavior for other cases.
    })


***

jin.createEffect("get", effectFunction:function, [order:integer])
  return value: undefined

  This is probably even less commonly used than a setter.

  Pass a function. The function that was passed will be used
  as the getter function for all global variables.

  The getter function will be passed three parameters:
  1. the name of the global variable as a string
  2. the current value of the global variable (can be of type number, string, object, array or boolean)
  3. the name of the global store the variable belongs to as a key ("v" is the default).
  
  The getter function should return the value the variable will evaluate to.


***


jin.createEffect("loadApp", effectFunction:function, [order:integer])
  return value: undefined

  This is probably even less commonly used than a setter.

  Pass a function. The function that was passed will be used
  as the getter function for all global variables.

  The getter function will be passed three parameters:
  1. the name of the global variable as a string
  2. the current value of the global variable (can be of type number, string, object, array or boolean)
  3. the name of the global store the variable belongs to as a key ("v" is the default).
  
  The getter function should return the value the variable will evaluate to.




***

jin.goto(knotOrLabelName:string)

  Immediately jumps to a knot or a label and continues running from there.

  You can call this from inside the following effect functions: "before", "after".
  Do NOT call this from the following effect functions: "set", "get", "onVariableChange".

  Example:

  # jin.goto("my_knot")


***

jin.say(text:string)

  Displays a text. The text can contain << >> substitutions as well as
  the glue <> token and HTML tags. It can even contain inline choices.

  You can call this from inside the following effect functions: "before", "after".
  Do NOT call this from the following effect functions: "set", "get", "onVariableChange".

  This is so useful, that you can also type "say", instead of "jin.say".

  # say(`You have <<v.health>> health.`)

***

jin.output(htmlElementId:string)

  Pass the id of an HTML element as string. The corresponding HTML element
  will be set as the current output element, meaning that all the following
  text will be displayed inside it. The default output element has the id "main".

  Example:

    I am in the main container.
    # jin.output("side-bar")
    I am on the side.
    # jin.output("main")
    I am inside the main container, too.


***

jin.choice(text:string, knotOrLabelName:string)

  This creates a new choice. (Not an inline choice; you can create inline choices
  by using the say() function.)

  You can call this from inside the following effect functions: "before", "after".
  Do NOT call this from the following effect functions: "set", "get", "onVariableChange".

  The first string is the text of the choice. It can contain <<>> substitutions
  and HTML tags.

  The second string must be the name of a knot or label. Selecting
  the choice will jump to that knot or label.

  Note that you cannot create a choice with nested text and sub-choices via Javascript,
  you can just create a simple choice that jumps somewhere with this function.

***

jin.createVariableStore(key:string)
  return value: undefined

  Note: usually, you do not need to use this method. You might want
  to skip reading this, especially if you are busy.

  Normally, all global variables in your story are stored in
  a single global variable store called "v". (That's why they start with "v.")
  This method creates an additional global variable store.

  Some use cases where you might want to use this method:

  a) You do not like prefixing your variables with "v." and
    want to prefix them with, say: "variable." because you find that more readable.

  b) You want two separate global variable stores, say, one with the prefix "v." for
    holding your variables and one prefixed with "item." to hold the items
    in your story.

  Example:

    # jin.createVariableStore("item")

    # item.bottle = {name: "bottle", weight: 40, breakable: true}

    # item.bottleTaken = true

    # v.castleWasVisited = true

  As you can see in the example, once we have created our additional
  variable store called "item", we can use it to store any variables
  in it. We can also still use our good old "v" variable store.
  Jinx takes care of saving/loading/restoring all variable stores
  for us, so there is nothing else we have to take care of.

  Notes:

  - You cannot create a variable store named after a reserved JavaScript keyword.
    So "var", "let", "if" etc. are out.

  - item.bottleTaken and v.item.bottleTaken will be completely independent
    variables. They do not have anything in common. Do not get confused!

  - Create a variable store BEFORE using it and create it ONLY ONCE.

  - You can have as many global variable stores as you want.

***





