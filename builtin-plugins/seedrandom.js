$_PLUGIN.add({
  implementation: {
    js: [
      `!function(f,a,c){var s,l=256,p="random",d=c.pow(l,6),g=c.pow(2,52),y=2*g,h=l-1;function n(n,t,r){function e(){for(var n=u.g(6),t=d,r=0;n<g;)n=(n+r)*l,t*=l,r=u.g(1);for(;y<=n;)n/=2,t/=2,r>>>=1;return(n+r)/t}var o=[],i=j(function n(t,r){var e,o=[],i=typeof t;if(r&&"object"==i)for(e in t)try{o.push(n(t[e],r-1))}catch(n){}return o.length?o:"string"==i?t:t+"\0"}((t=1==t?{entropy:!0}:t||{}).entropy?[n,S(a)]:null==n?function(){try{var n;return s&&(n=s.randomBytes)?n=n(l):(n=new Uint8Array(l),(f.crypto||f.msCrypto).getRandomValues(n)),S(n)}catch(n){var t=f.navigator,r=t&&t.plugins;return[+new Date,f,r,f.screen,S(a)]}}():n,3),o),u=new m(o);return e.int32=function(){return 0|u.g(4)},e.quick=function(){return u.g(4)/4294967296},e.double=e,j(S(u.S),a),(t.pass||r||function(n,t,r,e){return e&&(e.S&&v(e,u),n.state=function(){return v(u,{})}),r?(c[p]=n,t):n})(e,i,"global"in t?t.global:this==c,t.state)}function m(n){var t,r=n.length,u=this,e=0,o=u.i=u.j=0,i=u.S=[];for(r||(n=[r++]);e<l;)i[e]=e++;for(e=0;e<l;e++)i[e]=i[o=h&o+n[e%r]+(t=i[e])],i[o]=t;(u.g=function(n){for(var t,r=0,e=u.i,o=u.j,i=u.S;n--;)t=i[e=h&e+1],r=r*l+i[h&(i[e]=i[o=h&o+t])+(i[o]=t)];return u.i=e,u.j=o,r})(l)}function v(n,t){return t.i=n.i,t.j=n.j,t.S=n.S.slice(),t}function j(n,t){for(var r,e=n+"",o=0;o<e.length;)t[h&o]=h&(r^=19*t[h&o])+e.charCodeAt(o++);return S(t)}function S(n){return String.fromCharCode.apply(0,n)}if(j(c.random(),a),"object"==typeof module&&module.exports){module.exports=n;try{s=require("crypto")}catch(n){}}else"function"==typeof define&&define.amd?define(function(){return n}):c["seed"+p]=n}("undefined"!=typeof self?self:this,[],Math);`,
      
      `
      if (jin.random || jin.pick || jin.seed) {
        throw new Error("Could not initialize plugin SeedRandom. " +
          "Some of the function names jin.random, jin.pick and jin.seed have " +
          "already been used.")
      }

      jin.random = (min, max) => {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor( randomNumberGenerator() * (max - min + 1) ) + min
      }
  
      jin.pick = (... args) => {
        return args[jin.random(0, args.length - 1)]
      }
  
      jin.seed = (s) => {
        if (!s && s != 0 && s !== "") {
          randomNumberGenerator = new Math.seedrandom()
          randomSeed = false
        } else {
          randomNumberGenerator = new Math.seedrandom(s)
          randomSeed = s
        }
      }

      jin.seed();
      `
    ]
  },
  isPlugin: true,
  appName: "jinx",
  compatiblewithVersions: ["0.1"],
  name: `SeedRandom`,
  id: "seedRandom",
  author: `David Bau`,
  copyrightInfo: `(c) 2019 David Bau`,
  version: `3.0.5`,
  licenseShort: `MIT`,
  links: [
    {text: "Github/License", target: `https://github.com/davidbau/seedrandom`},
  ],
  licenseText: `
  LICENSE (MIT)
  <br>
  Copyright 2019 David Bau.
  <br>
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  <br>
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  <br>
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`,
  shortInfo: `Randomness plugin`,
  documentation: `
  <p>
    This plugin lets you create random numbers.
    There are three functions you can use:
  </p>
  <p>
    jin.random creates random numbers between two values (inclusive):
  </p>
  <pre>
    # v.x = jin.random(1, 6)<br>
    The die roll is &lt;&lt;v.x>>!
  </pre>
  <p>
    jin.pick picks a random entry from a list:
  </p>
  <pre>
    # v.x = jin.pick("small", "medium-sized", "big")<br>
    The item is &lt;&lt;v.x>>.
  </pre>
  <p>
    jin.seed can be used to make the random number
    generator predictable.
    You can pass a number or a string as a seed.
    This way the random number generator will always return the same numbers:
  </p>
  <pre>
    # jin.seed(857)<br>
    # v.x = jin.pick("small", "medium-sized", "big")<br>
    The item is &lt;&lt;v.x>>.
  </pre>
  <p>
  The item in the above example will ALWAYS be big, because
  the random number generator has been seeded.
  </p>
  <p>
  To make the random number generator random again,
  just call jin.seed with no parameters:
  </p>
  <pre>
    #jin.seed()
  </pre>


  `,
  //only built-in extensions can set these:
  builtIn: true,
  enabledByDefault: true,
  //********* optional properties:
  logo: `🎲`,
  licenseTextMustBeIncludedInFinalGame: true,
  //********* custom properties (no special meaning;
  //    they are just displayed in the "view plugin" view):
  disclaimer: `The authors of this JavaScript library are not
    affiliated with the Jinx project in any way.`,
  bundledBy: `Jinx Core Team`,
  additionalInfo: `The provided "jin" interface functions are not part of the original SeedRandom library.
  They have been added by the Jinx Core Team.`,
})