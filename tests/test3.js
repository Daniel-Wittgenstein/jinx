

window.testSuite[3] = {
  name: "Test Suite 3",
  notes: "max recursion breakage. currently passing.",
  tests: [{
    name: "max recursion breakage",
    notes: "",
    code: `

    #window.v = {}

    + okay0

    + okay1
    
    -

    + okay2
    -
    
    .if !v.abc
      #v.wrong2 = 1
    .else
      #v.cheese = 1
    .end
    
    .endgame
    
      `,
      
      do: [
        [
          "okay0",
          "okay2",
        ],



      ],
  },
  //...more tests
  ]
}