

window.testSuite[2] = {
  name: "Test Suite 2",
  notes: "More flow tests. Does not pass yet.",
  tests: [
    {
    
      name: "Basic gathers",
      notes: `(This test was modelled around an actual bug.)
      The behavior is perfectly correct! Actually the test is wrong.
      The -> is not a redirect it's a gather. Just add a check for labels:
      that throws error if they have additional text on the same line.
      Then remove this test. Then add background syntax highlighting
      to gathers, so they can be seen more clearly.
        
      `,
      code: `

      + 123

      ++ abc
      morok
      = mylabel
      garga
      
      ++ def
      
      --
      # window._test.okay123 = 1
      okay 123
    
    + 456
    
      ++ ghi
      
      ++ jkl
      -> mylabel
      
      --
      # window._test.okay456 = 1
      okay 456
    
      -
      
      .endgame
      `,
      do: [
        ["123", "abc", { assert: () => window._test.okay123 === 1 && !window._test.okay456 }]
      ]
    }
  ]
}