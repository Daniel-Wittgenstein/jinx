$_PLUGIN.add({
  implementation: {
    css: `
    .story-choice { 
      background: none;
      border: none;
      display: block;
      cursor: pointer;
      margin: auto;
      margin-bottom: 28px;
      max-width: 300px;
      color: #222;
      font-size: 14px;
    }
    
    .story-choice:hover {
      color: #777;
      text-decoration: underline;
    }    
    `
  },
  isPlugin: true,
  appName: "jinx",
  compatiblewithVersions: ["0.1"],
  name: `Simple Choice Style`,
  id: "simpleChoiceStyle",
  author: `Jinx Core Team`,
  copyrightInfo: `(c) 2022 Jinx Core Team`,
  version: `0.0.1`,
  licenseShort: `Public Domain`,
  links: [],
  licenseText: `
    I release this into the public domain.
  `,
  shortInfo: `Simple choice style`,
  documentation: `
  <p>
    Simple CSS plugin. Styles your choices as unobtrusive looking text.
  </p>
  `,
  //only built-in extensions can set these:
  builtIn: true,
  enabledByDefault: true,
  //********* optional properties:
  logo: `📃`,
  licenseTextMustBeIncludedInFinalGame: false,
  //********* custom properties (no special meaning;
  //    they are just displayed in the "view plugin" view):
})