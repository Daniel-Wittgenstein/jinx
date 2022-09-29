

# TESTS FORMAT DOCUMENTATION

## Properties of a test object:

### name: string
### notes: string

### code: string: multi-line string containing Jinx code to compile and run.

### compileError: boolean [optional]
### compileErrorLineNr: integer [optional]
  * a "compileError" object: a compile error should occur when
  compiling the Jinx code. otherwise the test failed.
  Can take an additional compileErrorlineNr: the compile time error should have this line number or the test failed.
  (Note that some compileErrors do not return a line number, because it makes little sense, for example,
  if the story consists only of  empty lines, it's not clear what line number the compileError should
  even logically display. In that case do not pass line number (elaev it undefined)
  and no check against the compileErrorLineNr
  will be performed.)
  (Note: line numbers always start at 1 like in any normal code editor, not at 0 like arrays do.)


### a do-array

  The elements of the do array are processed in order.
  If none fails, the test is considered complete, otherwise the test fails.

  #### These elements are allowed inside the do array:

  * a "runTimeError" object (note the spelling) with optional lineNr: a Jinx runtime
    error should occur at this point (should occur at this line number, if lineNr is given).
    If no Jinx error occurs or the lineNr is wrong, the test failed.
    If this is used, it should always be the last entry in the do-array.
    IMPLEMENT LATER. NOT THAT HIGH PRIORITY.
    THIS IS NOT A THING. CURRENTLY RUNTIME ERROR ALWAYS MEANS THAT THE TEST FAILED.
    A test that expects a runtime error is currently not possible.
    It's not that important, either, just mildly interesting for testing JS execution, I guess,
    but that's not super-important, really.
    We can currently just specify tests that should fail to compiler and specify tests that should
    compile and run fine. That should be more than enough testing functionality to get a prototype working.

  * a "jsError" object: a JS error (real browser-thrown error) should occur at this point (with optional
    errorText: JS error should show exactly this error message). (no lineNr property
    here, since who knows what different JS implementations like to do.)
    If this is used, it should always be the last entry in the do-array.
    IMPLEMENT LATER. NOT THAT HIGH PRIORITY.
    This is also NOT A THING. Not important.


  * an "assertion" object with an "assert" function: runs fuction, if function returns false,
  the assertion failed and the test failed. This function should not have side-effects.
  The assertion function is passed the jinx story object.

  * a "run" object: run some arbitrary code (without checking its effect).
  Used to do some side-effect (only use if really needed, like testing some undo-functionality,
    for example).

  * string:
  
    a) if the string starts with no special character:
    choose the current option containing this string of text.
    if multiple current options match the criterion, choose the first one.
    if no option matches the criterion, the test fails.
    Matching is case-INSENSITIVE!

    b) if the string starts with an exclamation mark, instead,
    the trimmed remaining (without exclamation mark) text of the string will be matched against
    the currently visible (non-exhausted) options. if the string matches
    any option, the test failed!
    (the exclamation mark basically means a negation: if the option currently exists,
      fail the test: an option with this text is not allowed to exist at this moment.
      This can be used to test whether one-time-options are properly exhausted, whether if-conditions
      on choices work, etc. ...)
    b) is NOT IMPLEMENTED YET. it's possible to do this with assertion function, since
    it gets passed the story object, just fetch the current content via the appropriate
    method, loop through the choices and check if one of them contains the verboten text.
    if so, return false, else true. SO WE PROBABLY WILL NOT IMPLEMENT THIS AS EXTRA FEATURE.

