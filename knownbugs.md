





+ -> is not interpreted as normal text (legacy.) remove it as token from jinx

+ a choice with no text is printed as a + symbol (first think about whether
we want to allow empty choices as fallback. probably not. so issue an error
if choice is empty, instead)

+ ...



+ this is not a bug, but: some tests use a custom-created window.v instead
  of window._test. They should be changed to use window._test.
  otherwise cross-pollution between tests (is real! has been seen!)