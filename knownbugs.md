





+ -> is not interpreted as normal text (legacy.) remove it as token from jinx

+ a choice with no text is printed as a + symbol (first think about whether
we want to allow empty choices as fallback. probably not. so issue an error
if choice is empty, instead)

+ ...