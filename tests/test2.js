

window.testSuite[2] = {
  name: "Test Suite 2",
  notes: "more tests. currently passing.",
  tests: [{
    name: "if conditions",
    notes: "",
    code: `
      life is peaceful. let's
      test some if blocks!

      # window.v = {}
      # window.item = {}

      # v.abc = 2

      .if v.abc
        #item.bottle = 1
      .end

      .if v.abc
        #item.fork = "fork"
      .else
        #item.wrong1 = 1
      .end


      .if !v.abc
        #item.wrong2 = 1
      .else
        #item.cheese = 1
      .end

      # v.abc = 0

      .if v.abc
        #item.wrong3 = 1
      .else
        #item.paper = 1
      .end

      # v.abc = 1 +2
      # v.abc += 100

      .if v.abc > 5

        #v.racoon0 = 1

        .if v.abc > 30
          #v.racoon1 = 1
          .if v.abc > 99
            #v.racoon2 = 1
            .if v.abc > 105
              #item.wrong4 = 1
            .else
              #v.racoon3 = 1
            .end
            #v.racoon4 = 1
          .end
        .else

          #v.wrong1 = 1


          #v.wrong2 = 1
        .end
      .end 
      
        =mylabel
        #v.racoon5 = 1
        .goto abc
        #v.wrong3 = 1
        
      === abc
        
        
      #v.racoon6 = 1

      .endgame
      `,
      
      do: [
        [
          {assert: () => {
            console.log(window.item, window.v)
            return (

              window.item.bottle === 1 &&
              window.item.fork === "fork" &&
              window.item.cheese === 1 &&
              window.item.paper === 1 &&

              !window.item.wrong1 &&
              !window.item.wrong2 &&
              !window.item.wrong3 &&

              window.v.abc === 103 &&

              !window.v.wrong1 &&
              !window.v.wrong2 &&
              !window.v.wrong3 &&

              window.v.racoon0 === 1 &&
              window.v.racoon1 === 1 &&
              window.v.racoon2 === 1 &&
              window.v.racoon3 === 1 &&
              window.v.racoon4 === 1 &&
              window.v.racoon5 === 1 &&
              window.v.racoon6 === 1

            )
          }}
        ],



      ],
  },
  //...more tests
  ]
}