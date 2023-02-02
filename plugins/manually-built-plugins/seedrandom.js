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
  logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g class="" style="" transform="translate(0,0)"><path d="M255.76 44.764c-6.176 0-12.353 1.384-17.137 4.152L85.87 137.276c-9.57 5.536-9.57 14.29 0 19.826l152.753 88.36c9.57 5.536 24.703 5.536 34.272 0l152.753-88.36c9.57-5.535 9.57-14.29 0-19.825l-152.753-88.36c-4.785-2.77-10.96-4.153-17.135-4.153zm-117.313 82.61a31.953 18.96 0 0 1 .002 0 31.953 18.96 0 0 1 21.195 5.536 31.953 18.96 0 0 1-45.19 26.813 31.953 18.96 0 0 1 23.992-32.348zm118.24.245a31.953 18.96 0 0 1 22.125 32.362 31.953 18.96 0 1 1-45.187-26.812 31.953 18.96 0 0 1 23.06-5.55zm119.663.015a31.953 18.96 0 0 1 .002 0 31.953 18.96 0 0 1 21.195 5.535 31.953 18.96 0 0 1-45.19 26.812 31.953 18.96 0 0 1 23.993-32.347zM75.67 173.84c-5.753-.155-9.664 4.336-9.664 12.28v157.696c0 11.052 7.57 24.163 17.14 29.69l146.93 84.848c9.57 5.526 17.14 1.156 17.14-9.895V290.76c0-11.052-7.57-24.16-17.14-29.688l-146.93-84.847c-2.69-1.555-5.225-2.327-7.476-2.387zm360.773.002c-2.25.06-4.783.83-7.474 2.385l-146.935 84.847c-9.57 5.527-17.14 18.638-17.14 29.69v157.7c0 11.05 7.57 15.418 17.14 9.89L428.97 373.51c9.57-5.527 17.137-18.636 17.137-29.688v-157.7c0-7.942-3.91-12.432-9.664-12.278zm-235.146 86.592a31.236 18.008 58.094 0 1 33.818 41.183 31.236 18.008 58.094 1 1-45-25.98 31.236 18.008 58.094 0 1 11.182-15.203zM366.82 289.1a18.008 31.236 31.906 0 1 .002 0 18.008 31.236 31.906 0 1 11.18 15.203 18.008 31.236 31.906 0 1-45 25.98A18.008 31.236 31.906 0 1 366.82 289.1zM89.297 318.48a31.236 18.008 58.094 0 1 33.818 41.184 31.236 18.008 58.094 1 1-45-25.98 31.236 18.008 58.094 0 1 11.182-15.204z" fill="#fff" fill-opacity="1"></path></g></svg>`,
  licenseTextMustBeIncludedInFinalGame: true,
  //********* custom properties (no special meaning;
  //    they are just displayed in the "view plugin" view):
  disclaimer: `The authors of this JavaScript library are not
    affiliated with the Jinx project in any way.`,
  bundledBy: `Jinx Core Team`,
  additionalInfo: `The provided "jin" interface functions are not part of the original SeedRandom library.
  They have been added by the Jinx Core Team.`,
})