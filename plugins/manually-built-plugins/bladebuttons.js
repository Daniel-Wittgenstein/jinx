$_PLUGIN.add({
  implementation: {
    css: "\n:root {\n  --choice-radius: 12px;\n}\n\n.story-choice {\n  background: #eee;\n  color: #222;\n  width: 75%;\n  border: none;\n  display: block;\n  margin: 0 auto;\n  margin-top: 0px;\n  margin-bottom: 2px;\n  cursor: pointer;\n  padding: 12px;\n  font-size: 14px;\n  font-family: Verdana, Arial, sans-serif;\n  line-height: 19px;\n  cursor: pointer;\n}\n\n.story-choice:hover {\n  background: #444;\n  color: #FFF;\n}\n\n.choice-first {\n  margin-top: 40px;\n  border-radius: var(--choice-radius) var(--choice-radius) 0px 0px;\n}\n\n.choice-mid {\n  border-radius: 0px;\n}\n\n.choice-last {\n  border-radius: 0px 0px var(--choice-radius) var(--choice-radius);\n}\n\n.choice-only-one {\n  margin-top: 40px;\n  border-radius: var(--choice-radius) var(--choice-radius) var(--choice-radius) var(--choice-radius);\n}\n",
  },
  isPlugin: true,
  appName: "jinx",
  compatiblewithVersions: ["0.1"],
  name: `Blade Buttons`,
  id: "bladeButtons",
  author: `Jinx Core Team`,
  copyrightInfo: `(c) 2022 Jinx Core Team`,
  version: `0.0.1`,
  licenseShort: `Public Domain`,
  links: [],
  licenseText: `
    I release this into the public domain.
  `,
  shortInfo: `Blade style for your choices`,
  documentation: `
  <p>
    Simple CSS plugin. Styles your choices in the blade button style.
  </p>
  <p>
    This shows how you can style the first and the last choice
    differently, to achieve some neat effect.
  </p>
  `,
  //only built-in extensions can set these:
  builtIn: true,
  enabledByDefault: true,
  //********* optional properties:
  logo: ``,
  licenseTextMustBeIncludedInFinalGame: false,
  //********* custom properties (no special meaning;
  //    they are just displayed in the "view plugin" view):
})