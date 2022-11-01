window.HELP_CONTENTS = `
  
<h2>Quick Guide</h2>

<h3>Basics</h3>

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

<h3>Comments</h3>

  <p>A line starting with // (two slashes) is a comment. It's ignored
  by the game.</p>

<h3>Nested choices</h3>

  <p>+ A level 1 choice. Must be single-line.</p>

  <p>++ a level 2 choice</p>

  <p>+++ a level 3 choice</p>

  <p>etc... (there is no limit on the amount of levels you can have)</p>
  <br>
  <p>-&nbsp;&nbsp;&nbsp;&nbsp;A level 1 gather. No other text is allowed on the same line.</p>

  <p>--&nbsp;&nbsp;&nbsp;&nbsp;A level 2 gather.</p>

  <p>etc...</p>
  <br>

<h3>Glue</h3>

  <p>You can use &lt;&gt; at the end or the start of a line to "glue" words together.</p>

<h3>Special dot commands</h3>

  <p>Special commands must be on their own line. They start with a dot (.):</p>

  <p>.goto page_or_label_name&nbsp;&nbsp;&nbsp;---&nbsp;&nbsp;&nbsp;Jumps to the page or label.</p>

  <p>.g page_or_label_name&nbsp;&nbsp;&nbsp;---&nbsp;&nbsp;&nbsp;Exactly the same as .goto, just
  shorter to type.</p>

  <p>.endgame&nbsp;&nbsp;&nbsp;---&nbsp;&nbsp;&nbsp;Ends the game.</p>


<h3>Running JavaScript code</h3>


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


  <h3>Setting variables</h3>

  <p>You can set variables (they must start with "v."):</p>

  <p># v.bottle = "empty"</p>

  <p># v.bullets = 2</p>
  

  <h3>If-Blocks</h3>

  <p>You can have if-blocks and optional else blocks:</p>

  <pre>
  
  The bottle is

  .if v.bottle == "empty"
    empty.
  .else
    full.
  .end

  </pre>
  
  <h3>Labels</h3>

  <p>Labels start with a single = :</p>

  <p>= label_name</p>

  <p>There should be no additional text on the same line, only a label name.</p>

  <p>When a label is encountered, nothing happens. The only raison d'être for labels is that
  they allow you to jump to them whenever you wish. On contrast, when the end of a page
  is encountered, the game stops collecting choices, so pages
  behave differently than labels. Pages can also be jumped to.</p>

  <p>Label and page names must be unique.</p>

  <h3>Single Angle Brackets</h3>

  <p>Single angle brackets (< and >; lesser than and greater than symbols) are used for the following
  two things:
  </p>

  <p>1.) &lt;&gt; is a glue token (see above.)</p>

  <p>2.) Tags with single angle brackets are HTML tags. For example:<br>
  &nbsp;&nbsp;&nbsp;&nbsp;This is &lt;b&gt;bold&lt;/b&gt; text.
  <br>... will result in this display:<br>&nbsp;&nbsp;&nbsp;&nbsp;This is <b>bold</b> text.</p>
  
  <h3>Double Angle Brackets</h3>

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

  <h3>Shortcut for printing variables</h3>

  <p>
  <b>NOT SUPPORTED YET:</b>
  While you can display a variable's value with &lt;&lt;v.variableName>> just fine (see above),
  there is a shorter way that saves you a bit of typing.
  You can use a %:<br>
  &nbsp;&nbsp;&nbsp;&nbsp;You have %v.flowers flowers. Your money: %v.money. Stamina: %v.stamina% - Health: %v.health%<br>
  There must be no space between the % and the variable name.<br>
  (Note how the dot after money is fine. Jinx does the right thing.
    Same for the % symbol after "v.stamina" and "v.health". It's actually
    printed as  % symbol, because it's not followed by a word.)<br>
  </p>

  <h3>Displaying images</h3>

  <p>
  To display an image, first select the asset tab. Then click on the button "add asset".
  Select the image you want to upload from your device. Once the image is loaded,
  you should give it a meaningful name in the name field.
  </p>

  <p>
  Note that asset names are case-sensitive, so "Picture" and "picture" would be different
  assets. It's recommended to just stick to lower-case and divide words with an underscore.
  </p>

  <p>
  To actually display the image inside the story, you write this:

    <pre>
      &lt;img src="$asset(your_asset_name)">
    </pre>

  Note that there should be no space between "$asset" and the opening bracket.

  </p>

  <p>
    Display an image with a CSS class:
    <pre>
      &lt;img src="$asset(castle)" class="picture-with-border">
    </pre>
  </p>

  <p>
    Display an image with inline style:
    <pre>
      &lt;img src="$asset(castle)" style="width: 120px;">
    </pre>
  </p>

  <p>
  This is all just basic HTML. The only thing different from
  normal HTML is that the "src" tag contains a "$asset()" command
  telling Jinx to insert the image data automatically.
  </p>

  <p>
    Jinx automatically bundles all of your assets into a single HTML page.
    This saves you many headaches and is the best way to create your game
    if you don't want to dive too deep into HTML.

    However, it comes with some small drawbacks:
    <ul>
      <li>Bundled assets actually take more space, because they are Base-64-encoded.
      So an image with 1.2 Megabytes size might have a bundled size of about 1.6 MB.
      </li>
      <li>It might make the initial loading of the game a bit slower.</li>
      <li>When you download a backup of your story, the backup
      will be considerable bigger, because it doesn't just contain
      the text of the story, it contains all of the assets data.</li>
    </ul>

  </p>

  <p>
    If you find this too limiting, you can use the traditional HTML way of
    adding images:
    <pre>
      &lt;img src="./pictures/castle.png" class="picture-with-border">
     </pre>
    This means that the image will NOT display correctly in the game preview.
    Once the game is finished and exported, you would have to distribute
    your game together with the appropriate assets for it to work.
    This means putting all the assets in the correct directories
    relative to the HTML page, zipping up your game etc.
    This is not terribly hard to do, but involves some extra work.
    Consult a good guide on HTML to learn how to do this.
    The advantage of this method is that you are more flexible
    in managing your assets, you can quickly switch out images
    and games with many huge assets become feasible.
  </p>

  <p>
    Of course, you can also mix both approaches.
  </p>

  <h3>Playing sounds</h3>

  <p>
    To play a sound, first select the asset tab. Then click on the button "add asset".
    Select the sound file you want to upload from your device. Once the sound is loaded,
    you should give it a meaningful, short name in the name field.
  </p>

  <p>
    Note that asset names are case-sensitive, so "Audio" and "audio" would be different
    assets. It's recommended to just stick to lower-case and divide words with an underscore.
  </p>

  <p>
    To actually play a sound, you can use a JavaScript line. For example,
    if you named your sound "my_door_sound" in the assets view, you can do:

    <pre>
      The door opens...
      # (new Audio(jin.asset("my_door_sound"))).play()
    </pre>
  </p>

  <p>
  Just like with images, Jinx bundles your sounds into the exported HTML page
  once you export your final game. This has the same drawbacks
  it has with images. (See the section on images.)
  </p>

  <p>An important note: to protect
  users from annoying jingles and ads, some browsers decided to block audio playback
  until a user has actually interacted with the page. This can mean
  that audio will not play until the user has actually clicked on the page,
  for example. If your game is mysteriously not playing sound on startup,
  but plays sound after you clicked on a choice (or similar behavior)
  keep this in mind. 
  You can also check the browser console (usually opened with F-12 or CTRL-Shift-i).
  If it displays something along the lines of:
  "Uncaught (in promise) DOMException: The play method is not allowed by the user agent
  or the platform in the current context, possibly because the user denied permission."
  (or similar), you probably ran into this very issue.
  Note that this is intended browser behavior and
  not a Jinx bug per se.
  </p>

  <h3>Audio and Video with Playback Controls</h3>
  
  Sometimes you might not want to play a sound right away.
  Especially if the audio file contains important information,
  you might want to give the player of your game
  the option to play and pause the audio and to listen
  to it multiple times. This can be achieved with:

  <pre>
  &lt;audio controls src="$asset(audio_interview_with_indiana_jones)" >
  </pre>

  This inserts an audio file with simple controls into the HTML page. The look of the controls
  depends on your browser and operating system, but it usually includes
  a play/pause button, the option to adjust the volume and the ability
  to play the sound as often as one wants.
  
  The same thing can be done with a video file:

  <pre>
    &lt;video controls src="$asset(bigfoot_real_footage)" >
  </pre>

  <h3>The Section about Assets for JavaScript coders</h3>

  <p>
    The above sections on image and audio can be generalized thusly:
  </p>

  <p>
    1. Inside story text, any sequence of the form:
    <pre>
      $asset(asset_name)
    </pre>
    is converted to a sequence that looks somehow like this:
    <pre>
      data:image/png;base64,iVBORw0... a long, long sequence of characters follows ...
    </pre>
    This is basically an asset file encoded as a Base-64-string (in the above case
    the asset is an image file, as can be seen by the image/png part at the start).
    This Base-64-string can just be inserted into an HTML src tag, hence why this works:
    <pre>
      &lt;img src="$asset(asset_name)">
    </pre>
  </p>

  <p>
    2. The exported story contains a global method "jin.asset". It takes
    an asset name as string and returns the corresponding base-64-string,
    if the asset name string that was passed to the function is a valid asset name.
    If it's not, the function "jin.asset" will return a falsey value.
  </p>

  <p>
      That's the reason why this works <b>if</b> asset_name is the name of an asset,
      but throws a JavaScript error, if it's not. (The non-existing sound cannot be played):
      <pre>
        # (new Audio(jin.asset("my_door_sound"))).play()
      </pre>
  </p>

  <p>
    So, as we can see, it's all about strings:
    strings containing assets encoded as Base-64.
    You can use the function "jin.asset" to
    get the data of any asset as a string.
    That's basically the entire magic behind Jinx's asset management; there is not
    a lot more going on.
  </p>




  <h2>Known bugs and limitations</h2>

  <ul>
    <li>If an HTML tag spans several lines, it will not be highlighted correctly
    in the editor. Don't let this fool you: it will still work in the game.</li> 

    <li>js/jsend is not implemented yet. Neither is %v.variable</li>


  </ul>
`


