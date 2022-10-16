window.HELP_CONTENTS = `
  
<h2>Quick Guide</h2>

<p>A basic game with two choices:</p>
<pre>
  My very first game! A game with two choices:

  + Win!
    You won!

  + Lose!
    You lost!
  
  -
  The game ended.
  .endgame
</pre>

<p>Pages start with === :</p>

<pre>
  .goto page1
  === page1

  This is the first page.

  + Go to the second page.
  .goto page2
  
  + Go to the third page.
  .goto page3

  === page2
    The second page.
    .endgame

  === page3
    The third page.
    .endgame
</pre>


<p>Nested choices and gathers:</p>

<pre>
  Choose a food:
    + cheese
      ++ gouda
        Gouda it is!

      ++ gorgonzola
        Gorgonzola it is!

      ++ edam
        Edam it is!

      // all level 2 choices (++) above are gathered
      // at the level 2 gather (--):
      --
      You selected a cheese.

    + vegetables
      There are no vegetables, sorry.

  // all branches are gathered
  // at the minus character:
  -
  Now choose your pet: ...
  .endgame

</pre>


  <p>A line starting with // (two slashes) is a comment. It's ignored
  by the game.</p>

  <br>

  <p>+ A level 1 choice. Must be single-line.</p>

  <p>++ a level 2 choice</p>

  <p>+++ a level 3 choice</p>

  <p>etc... (there is no limit on the amount of levels you can have)</p>
  <br>
  <p>-&nbsp;&nbsp;&nbsp;&nbsp;A level 1 gather. No other text is allowed on the same line.</p>

  <p>--&nbsp;&nbsp;&nbsp;&nbsp;A level 2 gather.</p>

  <p>etc...</p>
  <br>

  <p>You can use &lt;&gt; at the end or the start of a line to "glue" words together.</p>

  <br>

  <p>Special commands must be on their own line. They start with a dot (.):</p>

  <p>.goto page_or_label_name&nbsp;&nbsp;&nbsp;---&nbsp;&nbsp;&nbsp;Jumps to the page or label.</p>

  <p>.g page_or_label_name&nbsp;&nbsp;&nbsp;---&nbsp;&nbsp;&nbsp;Exactly the same as .goto, just
  shorter to type.</p>



  <p>.endgame&nbsp;&nbsp;&nbsp;---&nbsp;&nbsp;&nbsp;Ends the game.</p>

  <br>

  <p>A single line starting with a # is executed as JavaScript:</p>

  <p># alert("Hello there!")</p>

  <br>
  <p>And you can run an entire block of text as JavaScript by enclosing
  it with the special commands .js and .jsend :</p>

  <pre>
  
  .js
    //... some JavaScript code.
    //... as many lines as you want.
  .jsend

  </pre>

  <br>

  <p>You can set variables (they must start with "v."):</p>

  <p># v.bottle = "empty"</p>

  <p># v.bullets = 2</p>
  
  <br>

  <p>You can have if-blocks and optional else blocks:</p>

  <pre>
  
  The bottle is

  .if v.bottle == "empty"
    empty.
  .else
    full.
  .end

  </pre>
  
  <br>

  <p>Labels start with a single = :</p>

  <p>= label_name</p>

  <p>There should be no additional text on the same line, only a label name.</p>

  <p>When a label is encountered, nothing happens. The only raison d'être for labels is that
  they allow you to jump to them whenever you wish. On contrast, when the end of a page
  is encountered, the game stops collecting choices, so pages
  behave differently than labels. Pages can also be jumped to.</p>

  <p>Label and page names must be unique.</p>

  <br>

  <p>Single angle brackets (< and >; lesser than and greater than symbols) are used for the following
  two things:
  </p>

  <p>1.) &lt;&gt; is a glue token (see above.)</p>

  <p>2.) Tags with single angle brackets are HTML tags. For example:<br>
  &nbsp;&nbsp;&nbsp;&nbsp;This is &lt;b&gt;bold&lt;/b&gt; text.
  <br>... will result in this display:<br>&nbsp;&nbsp;&nbsp;&nbsp;This is <b>bold</b> text.</p>
  

  <p>Double angle brackets (<< >>) are very versatile. They can do the following things:</p>

  <p>1.) You can use them to print the value of a variable:<br>
    &nbsp;&nbsp;&nbsp;&nbsp;You have  &lt;&lt;v.flowers&gt;&gt; flowers.<br>
    ... will print (assuming that the value of v.flowers is 4):<br>
      &nbsp;&nbsp;&nbsp;&nbsp;You have 4 flowers.
  </p>

  <p>
    2.) You can do a calculation and print the result:<br>
    &nbsp;&nbsp;&nbsp;&nbsp;You have &lt;&lt;2 + 5 * v.flowers>> flowers.<br>
    Assuming that v.flowers is still 4, this would print "You have 22 flowers." (2 plus 5 times 4)
  </p>

  <p>
    3.) Any function that returns a string or a number can be used to print something. Example:<br>
    &nbsp;&nbsp;&nbsp;&nbsp;You roll the die. The result is &lt;&lt;jin.rnd(1,6)>>.<br>
    This works by calling the built-in function "jin.rnd". The function jin.rnd
    returns a random integer number between two values (It basically works
    like a dice roll). The &lt;&lt; and >> tell Jinx to
    compute the number and display it.
  </p>

  <p>
    4.) Angle brackets can also be used to add quick <em>inline</em> if-conditions.
    These are less readable than the standard (non-inline) if-conditions (see above), so
    use them with care. An inline if-condition MUST HAVE an else part (the else part is
    not optional, unlike with standard if conditions.) Example:<br>
    Your pet << v.animalType == "cat" ? "purrs" : "barks">> loudly.<br>
    The part before the question mark is the condition. The part after
    the question mark is the text that is displayed if the condition matches
    (do not forget the quotes around it). Finally, the text after the colon,
    is the "else" text, i.e. the text that is displayed if the condition does not match.
  </p>


  <p>
    5.) For advanced users: You can actually put any JavaScript
    expression between the &lt;&lt; and the &gt;&gt;.
    (The expression can even be multiline, as long as there are no empty lines in it).
    The <em>return value</em> of the expression becomes the text to be displayed.
    (The return value should be a number or a string. It can also be null,
    in which case nothing is displayed (same as returning an empty string)).
  </p>

  <br>

  <p>
  While you can display a variable's value with &lt;&lt;v.variableName>> just fine (see above),
  there is a shorter way that saves you a bit of typing.
  You can use a %:<br>
  &nbsp;&nbsp;&nbsp;&nbsp;You have %v.flowers flowers. Your money: %v.money. Stamina: %v.stamina% - Health: %v.health%<br>
  There must be no space between the % and the variable name.<br>
  (Note how the dot after money is fine. Jinx does the right thing.
    Same for the % symbol after "v.stamina" and "v.health". It's actually
    printed as  % symbol, because it's not followed by a word.)<br>
  </p>

  <h2>Known bugs and limitations</h2>

  <ul>
    <li>If an HTML tag spans several lines, it will not be highlighted correctly
    in the editor. Don't let this fool you: it will still work in the game.</li> 

    <li>js/jsend is not implemented yet. Neither is %v.variable</li>


    If you just add a feature to << >> that if it starts with say *
    that char is stripped and it means: no output, then
    you can forget about js /jsend and use
    <<>> to run js blocks. well, not rly no, because
    empty lines are not allowed. so no, do not do that.
    implement js/jsend normally, it's useful and good.

  </ul>
`


