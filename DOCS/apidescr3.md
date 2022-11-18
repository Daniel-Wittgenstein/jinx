



All API methods start with "jin."
These are JavaScript functions provided by the Jinx Runner.
You can call these methods directly from your Jinx story.


***

jin.createVariableStore(key:string)
  return value: undefined

  Normally, all global variables in your story are stored in
  a single global variable store called "v". (That's why they start with "v.")
  This method creates an additional global variable store.
  Usually, you do not need to use this method.
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


jin.createSetter(setterFunction:function)
  return value: undefined

  If you just want to react to changes in the global state
  with some audio or transition, you are better off
  using jin.createEffect! Jinx setters and getters go further than that.
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
  Instead of changing all lines with health gains, you could use a
  setter function.

  Example:

    jin.createSetter( (variableName, newValue, storeKey) => {
      if (storeKey === "v" && variableName === "health" && v.playerHasHealthBuff) {
        return newValue * 2
      }
      return newValue //keep the default behavior for other cases.
    })

  This method takes a function. The function that was passed will be used
  as the setter function for all global variables.
  Meaning: every time a global variable is changed, the change
  will go through this setter function.

  The setter function will be passed three parameters:
  1. the name of the global variable as a string
  2. the new value of the global variable (can be of type number, string, object, array or boolean)
  3. the name of the global store the variable belongs to as a key ("v" is the default.
    Unless jin.createVariableStore was used, this parameter will always be "v").

  Notes:

  - There can only be one setter function per story.
    Creating a new setter function overrides the existing one.

***

jin.createGetter(getterFunction:function)
  return value: undefined

  This method takes a function. The function that was passed will be used
  as the getter function for all global variables.

  The getter function will be passed three parameters:
  1. the name of the global variable as a string
  2. the current value of the global variable (can be of type number, string, object, array or boolean)
  3. the name of the global store the variable belongs to as a key ("v" is the default).
  
  Notes:

  - There can only be one getter function per story.
    Creating a new getter function overrides the existing one.

***

jin.getSetterFunc()
  return value: function or false
  Returns the function that was set via jin.createSetter or false,
  if no setter function was set.

***

jin.getGetterFunc()
  return value: function or false
  Returns the function that was set via jin.createGetter or false,
  if no getter function was set.

***

jin.createEffect(onEffectFunction:function, [order = 0])
  return value: undefined

  Let's say you want to play a sound every time the player's score changes.
  You can use jin.createEffect to do so.

  jin.createEffect takes an effect function and an optional "order" integer
  (default order is 0).

  Every time a global variable changes, the onEffectFunction will
  be called with the following four parameters:

  1. the name of the global variable that changed as a string
  2. the new value of the global variable (can be of type number, string, object, array or boolean)
  3. the name of the global store the variable belongs to as a key ("v" is the default.
    Unless jin.createVariableStore was used, this parameter will always be "v").
  4. the old value of the global variable, before it was changed

  If there are several effect functions, they will be called in order,
  from lowest to highest (so negative numbers get called before positive ones).

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

  Notes:

  - You can register more than one effect function.

  - You shouldn't change global variables inside an effect function.
    Effect functions are just there to react to changes in global variables and
    do some input/output side-effects. In general, they should be used
    for audio / transition effects and the like, not for story logic.
    DO NOT call jin.goto from inside an effect function!

***


jin.setAction (type:string, onActionFunction:function)
  return value: undefined

  The parameter type must either be the string "before"
  or the string "after".

  This registers a function onActionFunction that will
  be called 

  This function should only be called from the
  "after" knot or from a knot
  that is linked to the "after" knot via goto.

  The normal behavior is that Jinx jumps
  to the "after" knot after every turn and
  runs that knot (displaying some text, calling some code or
  doing whatever that knot does in the case of your story).
  After that knot is done, (And remember that the "after" knot
  may NOT contain choices!) Jinx jumps back to the knot where you left off.

  jin.divertFlow() changes that default behavior. It basically
  says: do NOT jump back to where you left off, stay here, instead.
  Usually, you call jin.divertFlow() right before goto'ing
  from the "after" knot to another knot.

  Example:

  === after
    .js
      if (!v.turns) v.turns = 0
      v.turns = v.turns + 1
      say( oneOf(
        "The birds are chirping",
        "The leaves are rustling.",
        "The wolves are howling in the distance.")) //add some random ambiance
      if (v.turns == 20)
    .jsend










jin.setEffect (type, function )

jin.getEffect



