window.HELP_CONTENTS = `
  
<h2>Jinx Guide</h2>

<h3>Intro</h3>

  <p>

  Jinx is a free and open-source tool for creating text-based games
  and interactive stories.

  Jinx games are created and played in the browser.

  </p>

  <p>Here comes a list with the most interesting Jinx features:</p>

  <ul>
    <li>You do not need to install anything to use Jinx. Just start creating in the browser.</li>
    <li>Jinx exports your game to a stand-alone HTML page. Jinx games run in any modern browser.</li>
    <li>Super-simple deployment. All Jinx games are entirely stand-alone HTML pages. They run without any server component. You do
      not need to setup anything to distribute your game. Just send the HTML file to your friends. Or just upload
      it to Itch.io.</li>
    <li>Jinx games are created with a simple mark-up syntax. No knowledge of JavaScript required.</li>
    <li>You can use the whole power of JavaScript though, if you want to.</li>
    <li>Built-in support for multimedia (images, audio, video).</li>
    <li>Jinx's markup language is inspired by Inklestudios' Ink and offers powerful support for nesting choices.</li>
    <li>Plugin system to extend you story's capabilities.</li>
    <li>You keep all rights to your game and can do whatever you want with it (including commercial use).</li>
  </ul>



<h3>The most important rule for creating with Jinx</h3>

  <p>Here comes the most important rule for creating stuff with Jinx:
  <b>never close the browser tab without saving a current copy of your project first!</b><p>

  <p>
    So, how do you save your project? Easy: by clicking on the "Save" button. This should
    download a file to your device's hard drive.
    If the download fails for whatever reason, your project has <b>not</b> been saved
    (but usually the download should not fail).
    The downloaded file has a ".json" extension and is named after the date and time
    you downloaded it. Store this file in a location where you will find it in the future.
  </p>

  <p>
    Jinx by default does <b>NOT</b> save anything in the cloud, in the browser
    or elsewhere, so if you lose your project save files, your
    project will be gone forever. Make regular backups of your data!
  </p>

  <p>
    Your entire project is included in the ".json" file you downloaded, including
    all images, audio and videos (if you have any). To open your project, 
    click on the "Open" button and select the correct ".json" file from your device.
    Then wait until the file has been uploaded.
  </p>

  <p>
    Important: Do not confuse the "Save" button with the "Export" button.
    The "Export" button lets you download your final game for distribution (as an HTML page).
    The "exported" HTML file does <b>not</b> contain your project data,
    so you cannot restore your game from it.
    <br>
    Remember:<br>
    ".json" file: good, contains your entire project. Keep this.<br>
    ".html" file: just for distributing your game to players. Not for saving or archiving purposes.
  </p>


<h3>Limitations</h3>
  <p>
  Jinx projects can include images, audio and even video files.
  Just be aware of the fact that media files will make your project
  file way bigger (especially audio and video files). Because of the way
  browsers work, you should always aim to keep your project
  under 4GB (Gigabytes) size. If the project gets too big, you won't be able
  to save it anymore and you will have to remove some media.
  The assets tab shows a rough estimate of how much size each media file takes.
  </p>

<h3>Displaying Text</h3>
<p>
While Jinx games can use images and audio, they are mostly text-based.

The "Story" tab on the left-hand side is where you write your game.
The "Play" tab on the right-hand side is where you test your game.
These are the two tabs you will use the most.
Start by typing or copy-pasting text into the "Story" tab
and look at the results in the "Play" tab.
</p>

<p>
The most simple Jinx game looks like this (copy this into your "Story" tab):
</p>

<pre>
  Hello!
  .endgame
</pre>

<p>
  This will just display the text "Hello!" and end the game.
  (The ".endgame" command is required.)
</p>

<p>
  If you spread a sentence over several lines, Jinx will still display
  it all on the same line. This code:
</p>

<pre>
  You've reached a place
  of darkness
  and tranquility.
  .endgame
</pre>

and this code:

<pre>
  You've reached a place of darkness and tranquility.
  .endgame
</pre>

will both output the exact same thing, namely the
sentence: "You've reached a place of darkness and tranquility.", without
any line breaks between the words.

If you actually want to print separate paragraphs, use an <b>empty line</b>, like so:

<pre>
  This is the
  first paragraph.

  This is the second
  paragraph.

  This is the third paragraph.

  .endgame
</pre>

This will give you three separate text paragraphs.

<h3>Comments</h3>

<p>
Comments are text that is not shown to the user
and is not used by the game in any way. You can use them as notes to yourself.
(Or as notes to the people reading your story's source code.)
<p/>


<p>
To create a comment, start a line with two slashes:
</p>

<pre>
  This text will be displayed.
  //I am a comment. I won't be displayed.
  .endgame
</pre>



<h3>Knots and gotos</h3>

A Jinx game is usually divided into independent sections.
We call these sections "knots". A knot starts with a
new line starting with three equal symbols:

<pre>

  === forest

    You are in the forest.

  === road

    You are walking down an old, dusty road.

</pre>

<p>
The word after the === must be a single word.
That's the knot's internal name. The internal name is never displayed to the player,
it's just there for the story creator. In the code above we have two knots,
one is named "forest", the other one "road".</p>

<p>Note that knot names are case-insensitive. This means that "Road", "road"
and "rOAd" all refer to the same knot. (Most other things in Jinx are <b>case-sensitive</b>.)
It's recommended to always use lower-case letters for knot names, to avoid confusion.</p>

<p>
We can jump around between different knots using the ".goto" ("go to") command:
</p>

<pre>
  Hello!
  .goto a_knot

  This is never printed.

  === a_knot

  Hello to you too!
  .endgame
</pre>

<p>
This example just prints "Hello! Hello to you too!" as two paragraphs, but it does so in a slightly
convoluted way. We start from the first line and display
the first "Hello!". Then we continue to the next line. We encounter the ".goto start_knot" command,
and jump to the line "=== a_knot". The line "This is never printed." is skipped and therefore
it's not printed. We keep going down the file to reach the line "Hello to you too!".
We display this text, too. Finally, we encounter the ".endgame" command which ends the game.
If you understand this, you understand how "goto" commands work.
</p>

<h3>Choices</h3>

<p>Now that we understand knots and gotos, we can finally add choices to our game.
Choices are options that can be selected by the player. A line starting with a plus character
is a choice:</p>

<pre>
  + I am a choice.
</pre>


<p>In this simple example you can choose whether you want to enter the forest or want to turn back:</p>

<pre>
  You have reached the edge of a dark and mysterious forest.

  + Enter the forest
    .goto forest

  + Go back home
    .goto go_back_home

  === forest
    Hesitantly, you enter the forest ...
    .endgame

  === go_back_home
    This looks dangerous. You decide to go back home ...
    .endgame    
</pre>

<h3>Glue</h3>

Jinx interprets empty lines as paragraph breaks (see above).
Sometimes you want an empty line without a paragraph break, though.
In that case you can use <b>&lt;&gt;</b> This is a so-called "glue" token,
because it glues text together.

<pre>

  We went down that road and

  <> came back.

</pre>

<p>The &lt;&gt; negates the preceding empty line, so to speak.
The text will display as a single sentence, even if there is an empty
line in between.</p>

Another example:

<pre>
  Jinx automatically inserts spaces between words.
  Here we use glue tokens to print 
  "ultra<>
  splendo<>
  glurba<>
  nurba<>
  flirpy<>
  bockley<>
  licious"
  as a single word.
  .endgame
</pre>

<p>
Glue can be used at the beginning or the ending of a line.
Note that this:
</p>

<pre>
  abc
  <>def
</pre>

<p>
and this:
</p>

<pre>
  abc<>
  def
</pre>

yield the exact same result.


<h3>Gathers</h3>

<p>
  You can write an entire Jinx game just using choices, knots and gotos.
  But Jinx has more features to control the flow of your interactive story.
</p>

<p>
  If you are coming from Ink, you should feel right at home, because that's
  where Jinx stole most of its ideas about story flow from.
  Otherwise, everything might seem strange at first. Just go with the (story) flow!
  Once you get started with it, there is no going back, and you will
  realize it's the superior way to create branching content. I promise! :)
</p>

<pre>
  "Have you watered that eucalyptus, yet?", the gardener asks.

  + "Yes, Sir, of course!"
    "Well, good", he mutters, "Now do the back of the
    garden and we should be done."

  + "Nah. I didn't feel like it."
    "Well, you better do it before the Lady gets home", he mutters,
    "She doesn't pay us to be slacking around."

  -
  He adjusts his cap and walks away.
  .endgame
</pre>

<p>
  The new thing here is the minus character. This is called a gather.
  To create a gather you put a minus symbol on its own line.
</p>

<p>
  If you play through the example above, you will realize that
  the last line of text ("He adjusts his cap and walks away.")
  will always appear, no matter what we choose.
  That's because of our gather command.
  The gather command basically gathers all story threads above and connects
  them into a single thread. No matter what we chose above, eventually
  we will always end up at the minus and continue from there.
</p>

<p>
  This lets us easily create many choices that display a different text
  when clicked, but do not really branch the story flow.
</p>

<h3>Nested choices</h3>

<p>Now it gets even weirder. We can nest choices.
Consider this example:</p>

<pre>
  Choose yoour spirit animal:

  + mammal

    ++ cat
      You are fierce and unpredictable like a cat!

    ++ dog
      You are faithful and smart like a dog!

  + bird

    ++ owl
      You are mysterious and wise like an owl!

    ++ eagle
      You are strong and independent like an eagle!

  + amphibian

    ++ snake
      You are sneaky and dangerous like a snake!

    ++ crocodile
      You are lazy and aggressive like a crocodile!

  -
  Now that you have chosen your spirit animal, it's time to choose your wand!
  .endgame
</pre>


<pre>
.goto start_knot

This is never printed.

=== start_knot
The game starts here and en
.goto second_knot

=== second_knot
continues here.
.endgame
</pre>

<p>
</p>


<p>
</p>

<pre>
</pre>

<pre>
</pre>

<pre>
</pre>

<h3></h3>



<p>
</p>


<p>
</p>

<h3></h3>



<p>
</p>


<p>
</p>

<h3></h3>



<p>
</p>


<p>
</p>


<h3></h3>


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

  <h3>Using plugins</h3>
  <p>Go to the plugin tab. You can enable and disable plugins
  by clicking the corresponding checkbox. If you click on the "view" button,
  you will be shown the plugin's documentation. Make sure to read it,
  so you know how to use the plugin.</p>


  <h3>Creating your own plugin</h3>
  <p>
  You cannot really write your own plugin without some knowledge
  of either JavaScript or CSS. This is a rather advanced topic, so feel free to skip it,
  if it is of no interest to you.
  </p>
  <p>
  Plugins are actually conceptually simple.
  They just inject some JavaScript and/or CSS into the game.
  </p>
  <p>
  A plugin is a single JSON file.

  It can be loaded from the plugin view via the button "load plugin".

  This is the basic anatomy of a plugin:
  </p>

  <p>
  Example plugin:
  <pre>
  {
    "implementation":{
      "js":"alert('Demo plugin works!')"
    },
    "isPlugin":true,
    "appName":"jinx",
    "compatiblewithVersions": ["0.1"],
    "name":"Demo Plugin",
    "id":"demoPlugin",
    "author":"Jinx Core Team",
    "copyrightInfo":"(c) 2022 Jinx Core Team",
    "version":"0.0.1",
    "licenseShort":"Public Domain",
    "links":[
      
    ],
    "licenseText":"I release this into the public domain.",
    "shortInfo":"Demo test plugin",
    "documentation":"Just a demo test plugin.",
    "logo":":)",
    "licenseTextMustBeIncludedInFinalGame":false,
    "disclaimer":"-",
    "bundledBy":"-"
  }
  </pre>
  </p>

  <p>
  To be a valid plugin, the JSON file has to conform to the following specification.
  </p>

  <p>
  <b>The following properties are mandatory for every plugin:</b><br><br>

  - isPlugin: must be true<br><br>
  - appName: must be "jinx"<br><br>
  - compatibleWithVersions: an array of strings. Each string should be a valid version number.
    The array lists all the Jinx versions the plugin is compatible with,
    so for example ["0.1", "0.2"] would mean that the plugin is compatible
    with Jinx version "0.1" and Jinx version "0.2". The Jinx version you are currently
    using can be seen by clicking the about (question mark) button in the app.
    This is actually used by the app. If the plugin is not compatible
    with the current app version, it will fail to load.<br><br>
  - name: a string. the name of the plugin that will be displayed to the user. Usually a single word.<br><br>
  - id: a string. This must be unique. Make sure there are no other plugins with the
    same id string.<br><br>
  - author: a string. The name(s) of the plugin author(s).<br><br>
  - copyrightInfo: a string containing copyright information.<br><br>
  - version: a string containing the version number of the plugin. This is not actually used
    by the app, it is just displayed to the user.<br><br>
  - licenseShort: a short abbreviation indicating the license type, for example "MIT"
    to indicate the MIT license.<br><br>
  - links: an array of objects. The array can also be empty. Each object in the array
    should have the properties "text" (a string: the link text) and "target"
    (a string: the internet site the link points to). These links will be displayed
    in the "view plugin" panel.<br><br>
  - licenseText: a string. The entire text of the license this plugin is released under.<br><br>
  - shortInfo: a string. A short text (one sentence, typically) that tells what the plugin
    does.<br><br>
  - documentation: a string. Everything the user needs to know to use this plugin.
    This string can be very long. It is also allowed to contain HTML tags to make
    the content more readable.<br><br>

  <b>The following properties should NOT be used, because they are reserved for built-in plugins.
  Leave them undefined:</b><br><br>
    - builtIn: true,<br><br>
    - enabledByDefault: true/false,<br><br>

  <b>The following properties are optional:</b><br><br>
  - logo: a string containing a logo image for the plugin.
  (The logo is just optional eye-candy for the end-user.)
  The string should contain an image
  in svg format. The image should be mono-color, consisting of white and transparent parts only.
  (This way the editor can change the color however it sees fit.)
  Alternatively, set this property to an empty string or leave it undefined.
  <br><br>

  - licenseTextMustBeIncludedInFinalGame: a boolean indicating whether the entire text
      of the license should be copied into the source code of the final exported game.
      Set this to true to include the license text. Leave it undefined or set it to false
      to not include the license text.<br><br>



  </p>


  <p>
  The above properties of the plugin are all meta-data.

  The property "implementation" is where the actual work happens.

  Example:
  <pre>
  ...
    "implementation": {
      "js":"alert('Demo plugin works!')"
    },
  ...
  </pre>

  The property "implementation" has to contain an object.
  The object can have two (optional) properties.<br><br>

  - "js": this property can be a single string or an array of strings.
    The content of the strings is injected into the game as JavaScript.<br><br>

  - "css: this property must be a string. The content of the string
    is injected into the game as CSS.<br><br>

  Basically, plugins are just containers that wrap some JavaScript or CSS.

  There is not a lot more going on.

  Often, plugins need to access the Jinx API. The API methods are
  exposed via the global object called "jin". They are described
  in another section.

  </p>






  <h2>Known bugs and limitations</h2>

  <ul>
    <li>If an HTML tag spans several lines, it will not be highlighted correctly
    in the editor. Don't let this fool you: it will still work in the game.</li> 



  </ul>
`


