

window.testSuite[4] = {
  name: "Test Suite 4",
  notes: "<< >> replacements inside choices",
  tests: [{
    name: "<< >> replacements and comments",
    notes: "",
    code: `

    //asas

    #_test.yo1 = false
    
    + (if 0) should never be displayed choice-a
    
    + choice-a (this choice should be selected when selecting choice-a, since the first choice is not displayed because of if condition)
    
    # _test.yo1 = true
    # _test.str_ef = "ef"
    
    ++ choice-1
    
    ++ choice-2
      # _test.yo2 = true
      
    
      +++ abc<<"d" + _test.str_ef>>
      
        .if !_test.ccc
          #_test.yo4 = true
        .end
    
      +++ dfe
      
      ---
      
      #_test.yo5 = true
      
    
    ++ choice-3
      blablabla
      #_test.knope2 = true
    
    + choice-b
      blablablub
    
    -
    
      .if _test.yo1 && _test.yo2
        Some text over
        several lines.
        #_test.yo3 = true
        Lalala.
      .else
        Naninan.
        #_test.yo1 = false 
        #_test.knope1 = true
      .end
    
    -
    
    .g my-label1

    #_test.knope3 = true

    = my-label1



    -

    
    // bla choice-2 abcdef
    //assassa
    
    .endgame
    
      `,
      
      do: [

        [
          "choice-a",
          "choice-2",
          "abcdef",

          {assert: () => {
            return (
              window._test.yo1 === true &&
              window._test.yo2 === true &&
              window._test.yo3 === true &&
              window._test.yo4 === true &&
              window._test.yo5 === true &&
              !window._test.knope1 &&
              !window._test.knope2 &&
              !window._test.knope3

            )
            }
          }
          

        ],



      ],
  },
  //...more tests
  ]
}