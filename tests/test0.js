
/* 

Test Suite -> Test -> Subtest

For faster copying:

    // ###########################################################
    {
      name: "",
      notes: ``,
      code: `
      
      `,
      do: [

      ],
    },

*/

if (window.testSuite) throw new Error(`Must not exist.`)

window.testSuite = []

window.testSuite[0] = {
  name: "Test Suite 0",
  notes: "Some standard flow tests.",
  tests: [
    
    {
      name: "Terse Choices - no lines in between",
      notes: ``,
      code: `.goto start
      === start
      + I like The Wire
      + I like Breaking Bad
      + I like Buffy
        ++ Season 1
          +++ because of the old-school vibes
          #    window._test.vibes =  true   
          +++ because the graveyard looks scarier
          +++ because of the Master
          # window._test.master = true
        ++ Season 5
          +++ because of Dawn
          # window._test.dawn = true
          +++ because of Glory
        ++ Season 7
          +++ because they totally ruined Spike
          # window._test.spike = true
          +++ because I like the number 7
          +++ I like that it's so dark
          #window._test.dark = true
      -
      #window._test.final = true
      .endgame`,
      do: [
        ["I like Buffy", "Season 7", "spike", { assert: () => window._test.spike === true }],
        ["I like Buffy", "Season 5", "dawn", { assert: () => window._test.dawn === true }],
        ["I like Buffy", "Season 5", "glory", { assert: () => !window._test.dawn }],
        ["I like Buffy", "Season 7", "dark", { assert: () => window._test.dark === true && window._test.final === true }],
        //["I like Buffy", "Season 5", "master", { runTimeError: true, }],
      ]
    },

    {
      name: `six levels nested animals`,
      notes: ``,
      code: `
      What are you?
      + living 1
        # window._test.living = 1
        ++ animal 2
          ++ + mammal 3
            Okay, you are a
            mammal!
            + +++ Africa 4
              + ++++ monkey 5
              +++ ++ zebra 5
              #window._test.zebra = "Zebra"
              ++++ +   giraffe 5
              +++++ predator 5
                ++++++ lion 6
                +++ +++ tiger 6
                  Not in Africa!
                ++ ++ ++ crocodile 6
            ++++ Europe
              Okay,
              Europe,
              it is.
              # window._test.europe = 1
              + ++++ bear
              +++++ wolf
               + + +  +  + deer
                 #  window._test.deer  = 1
              +++ +                     + rabbit (5)
            - --     - 
            okay, you are a mammal.
            # window._test.mammal = 1
          ++ + cold-blooded
          +++ mythological
            ++++ dragon
            ++ ++ gryphon
            + +++ basilisk
          - - -
          # window._test.animal = 1
          okay, you are an animal.
        ++ plant
          +++ tree
          # window._test.tree = 1
          +++ fruit
            ++++tomato
            +  +++cucumber
            # window._test.cucumber = 1
      + not living
        ++ broom
        ++ cupboard
      -
      .endgame`,
      do: [

        [
          "living", "animal", "mammal", "europe", "deer",
          { assert: () =>
            window._test.living === 1 && 
            window._test.animal === 1 && 
            window._test.mammal === 1 && 
            window._test.deer === 1 &&
            window._test.europe === 1 &&
            !window._test.zebra
        }],

        [
          "living", "animal", "mammal", "africa", "zebra",
          { assert: () =>
          window._test.living === 1 && 
          window._test.animal === 1 && 
          window._test.mammal === 1 && 
          !window._test.deer &&
          !window._test.europe &&
          window._test.zebra === "Zebra"
        }],

        [
          "living", "plant", "fruit", "cucumber",
          { assert: () =>
          window._test.living === 1 && 
          !window._test.animal && 
          window._test.cucumber === 1 && 
          !window._test.deer &&
          !window._test.europe &&
          !window._test.zebra
        }],

  
        [
          "living", "plant", "tree",
          { assert: () =>
          window._test.living === 1 && 
          window._test.tree === 1 &&
          !window._test.animal && 
          !window._test.cucumber && 
          !window._test.deer &&
          !window._test.europe &&
          !window._test.zebra
        }],

  
      ],
    },

    {
      name: "Hyper-Nesting",
      notes: "",
      code: `
      
      
      
      
      `,
      do: [

      ]
    }


  ]
}
