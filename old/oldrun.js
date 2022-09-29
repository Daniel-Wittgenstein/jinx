let source = []; source[1] = `=== par

Hello!

How are you? I want

<>ed to ask you this: do y<>

ou even li<>

<>ft, bro?

Anyway.

You are in the forest.

+ 1 (enter forest)
    
    You enter the forest.
    

    ++ 1.1 climb tree
        You are on top of the tree now

        *** 1.1.1 (look around)
        You can see miles ahead.

        +++ 1.1.2 (jump down)
        Too dangerous. You know what's less dangerous?

            ++++ Scratch yourself

            ++++ Bite yourself

            ----
            Okay, enough self-hurt.

        +++ 1.1.3 (watch branches)
        You observe the branches.

        ---
        Okay, still on top of the tree.

    ++ 1.2 abc

    ++ 1.3 third option

        +++ 1.3.1

    --
    You exited the (forest).

+ 2


    ++ 2.1

        +++ 2.1.1

    ++ 2.2

+ 3

-

and end story

.endGame
`





$(window).on("load", start)


source[2] = ``

let story

function start() {

    $("#wrapper").on("click", ".story-choice", function () {
        let i =  $(this).data("choiceindex")
        $("#wrapper").html("")
        story.selectChoice(Number(i))
    })

    let coxie = new Coxie()
    coxie.addFile("story1", source[1], {})
    coxie.addFile("story2", source[2], {})

    let result = coxie.init()

    let myErrorFunc = (err) => {
        let res = result.onErrorFunc(err)
        console.log("error:", err)
        console.log("actual line nr per coxie:", res.lineNr, "file name:", res.file)
    }

    story = jinx.createNewStory(result.code, myErrorFunc, onJinxEvent)
    story.restart()

}

function onJinxEvent(type) {
    console.log("JINX EVENT TRIGGERED:", type)
    if (type === "finishedCollecting" || type === "gameEnd") {
        renderStuff()
    }
}

function renderStuff() {
    let contents = story.getContents()
    let choices = contents.choices
    let paragraphs = contents.paragraphs

    for (let p of paragraphs) {
        let el = $(`<p>${p.text}</p>`)
        $("#wrapper").append(el)
    }

    for (let c of choices) {
        let el = $(`<p><a href="#" class="story-choice" data-choiceindex='${c.index}'>${c.text}</a></p>`)
        $("#wrapper").append(el)
    }

    
}