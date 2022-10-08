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

`


